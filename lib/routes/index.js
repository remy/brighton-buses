var express = require('express');
var router = express.Router();
var nearest = require('../nearest');
var times = require('../times');
// var mock = require('../../data/mock.json');
var services = require('../../data/services.json');
// const alexa = require('../alexa');
const moment = require('moment-timezone');
moment.tz.setDefault('Europe/London');
const Alexa = require('alexa-app');

const dueIn = (time) => moment(time).diff(new Date(), 'minutes') - 1;

const serviceLookup = Object.keys(services)
  .sort((a, b) => a < b ? -1 : 1)
  .map(route => ({ route, id: services[route] }));

module.exports = router;

router.post('/alexa/:service?', (req, res) => {
  const service = req.params.service || '50';
  const { lat, lng } = req.query;
  console.log(service, lat, lng);
  getNext({ service, lat, lng, limit: 3 }).then(times => {
    const next = times[0];
    const alexa = new Alexa.app('nextbus');
    alexa.launch((req, res) => {
      res.say(`The next bus is due in ${next.due} minutes`);
    });

    alexa.intent('NextBusIntent', {}, (req, res) => {
      res.say(`The next bus is due in ${next.due} minutes`);
    });

    return alexa.request(req.body).then(answer => res.json(answer));
  }).catch(e => {
    console.log(e.stack);
    res.status(500).send(e.stack);
  });

});


// define the home page route
router.get('/', (req, res) => res.render('home'));

router.get('/config', (req, res) => {
  res.render('config', {
    services: serviceLookup,
  });
});

router.get('/next/:service', (req, res) => {
  const service = req.params.service;
  const { lat, lng } = req.query;

  getNext({ service, lat, lng, limit: 3 }).then(times => {
    res.json(toLaMetric(times));
  }).catch(error => res.json({ error: error.stack }));
});

router.get('/nearest', (req, res) => {
  const services = (req.query.service || '').split(',').filter(Boolean);
  if (!services.length) {
    return res.status(400).send({ error: 'Missing `service`'});
  }

  const stops = nearest(services, req.query.lat, req.query.lng);
  const promises = stops.map(stop => times(stop, stop.route));

  Promise.all(promises).then(data => {
    let times = data[0];
    if (data[1] !== undefined) {
      times = times.concat(data[1]);
    }
    res.json({ stops, times });
  }).catch(error => res.json({ error }));
});

router.get('/:route', (req, res, next) => {
  if (services[req.params.route]) {
    res.render('home', {
      inject: 'var services = "' + req.params.route + '";',
    });
    return;
  }

  next(404);
});

function getNext({ service, lat, lng, limit = 0}) {
  return new Promise((resolve, reject) => {
    const stops = nearest(service, lat, lng);
    const promises = stops.map(stop => times(stop, stop.route));

    resolve(Promise.all(promises).then(data => {
      let times = data[0];
      console.log(data);
      if (data[1] !== undefined) {
        times = times.concat(data[1]);
      }

      times.forEach(_ => _.due = dueIn(_.time));

      if (limit && times[0] && times[0].due <= limit) {
        times.shift(); // drop this, it's too soon
      }

      if (times.length > 2) {
        times = times.slice(0, 2);
      }

      return times;
    }));
  });
}

function toLaMetric(data) {
  const frames = data.map(_ => {
    return {
      text: `${_.due} mins`,
      icon: 'i996'
    }
  });

  return { frames };
}
