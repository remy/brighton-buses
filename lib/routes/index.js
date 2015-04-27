var express = require('express');
var router = express.Router();
var nearest = require('../nearest');
var times = require('../times');
var Promise = require('promise');
var mock = require('../../data/mock.json');
var services = require('../../data/services.json');

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

router.get('/nearest', function (req, res) {
  var services = (req.query.service || '').split(',');

  // return res.json(mock);

  var stops = nearest(services, req.query.lat, req.query.lng);

  var promises = stops.map(function (stop) {
    return times(stop, stop.route);
  });

  Promise.all(promises).then(function (data) {
    console.log(data.length);

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

