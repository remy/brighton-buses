var express = require('express');
var router = express.Router();
var nearest = require('../nearest');
var times = require('../times');
var mock = require('../../data/mock.json');
var services = require('../../data/services.json');
const moment = require('moment');

function dueIn(time) {
  return moment(time).diff(new Date(), 'minutes') - 1;
}

var serviceLookup = Object.keys(services).sort(function (a, b) {
  return a < b ? -1 : 1;
}).map(function (key) {
  return {
    route: key,
    id: services[key],
  };
});

module.exports = router;

// define the home page route
router.get('/', function (req, res) {
  res.render('home');
});

router.get('/config', function (req, res) {
  res.render('config', {
    services: serviceLookup,
  });
});

router.get('/next/:service', (req, res) => {
  const service = req.params.service;
  const stops = nearest(service, req.query.lat, req.query.lng);

  const promises = stops.map(function (stop) {
    return times(stop, stop.route);
  });

  Promise.all(promises).then(function (data) {
    let times = data[0];
    if (data[1] !== undefined) {
      times = times.concat(data[1]);
    }

    times.forEach(_ => _.due = dueIn(_.time));

    if (times[0].due <= 3) {
      times.shift(); // drop this, it's too soon
    }

    if (times.length > 2) {
      times = times.slice(0, 2);
    }

    if (req.query.next) {
      return res.json(toLaMetric([times[0]]));
    }

    res.json(toLaMetric(times));
  }).catch(function (error) {
    res.json({ error: error });
  });
});

router.get('/nearest', function (req, res) {
  var services = (req.query.service || '').split(',');

  var stops = nearest(services, req.query.lat, req.query.lng);

  var promises = stops.map(function (stop) {
    return times(stop, stop.route);
  });

  Promise.all(promises).then(function (data) {
    var times = data[0];
    if (data[1] !== undefined) {
      times = times.concat(data[1]);
    }
    res.json({ stops: stops, times: times });
  }).catch(function (error) {
    res.json({ error: error });
  });

});

router.get('/:route', function (req, res, next) {
  if (services[req.params.route]) {
    res.render('home', {
      inject: 'var services = "' + req.params.route + '";',
    });
  } else {
    next(404);
  }
});

function toLaMetric(data) {
  const frames = data.map(_ => {
    return {
      text: `${_.due} mins`,
      icon: 'i996'
    }
  });

  return {
    frames
  }
}
