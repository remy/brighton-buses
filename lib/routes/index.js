var express = require('express');
var router = express.Router();
var nearest = require('../nearest');
var times = require('../times');
var Promise = require('promise');

module.exports = router;

// define the home page route
router.get('/', function (req, res) {
  res.render('home');
});

var mock = {"stops":[{"lat":50.8477775340787,"lng":-0.130960732698449,"id":6978,"name":"Brentwood Crescent","distance":215.4904794591302,"route":"50"},{"lat":50.8505840818616,"lng":-0.135023751322434,"id":6618,"name":"Friar Road","distance":359.1999703118891,"route":"46"}],"times":[{"id":"pin-brighton-bustime-41860","time":"2015-04-27T12:42:52.000Z","stop":{"lat":50.8477775340787,"lng":-0.130960732698449,"id":6978,"name":"Brentwood Crescent","distance":215.4904794591302,"route":"50"}},{"id":"pin-brighton-bustime-42742","time":"2015-04-27T12:48:31.000Z","stop":{"lat":50.8477775340787,"lng":-0.130960732698449,"id":6978,"name":"Brentwood Crescent","distance":215.4904794591302,"route":"50"}},{"id":"pin-brighton-bustime-65317","time":"2015-04-27T13:04:32.000Z","stop":{"lat":50.8477775340787,"lng":-0.130960732698449,"id":6978,"name":"Brentwood Crescent","distance":215.4904794591302,"route":"50"}},{"id":"pin-brighton-bustime-83772","time":"2015-04-27T13:15:31.000Z","stop":{"lat":50.8477775340787,"lng":-0.130960732698449,"id":6978,"name":"Brentwood Crescent","distance":215.4904794591302,"route":"50"}},{"id":"pin-brighton-bustime-98192","time":"2015-04-27T12:29:26.000Z","stop":{"lat":50.8505840818616,"lng":-0.135023751322434,"id":6618,"name":"Friar Road","distance":359.1999703118891,"route":"46"}},{"id":"pin-brighton-bustime-85121","time":"2015-04-27T12:49:03.000Z","stop":{"lat":50.8505840818616,"lng":-0.135023751322434,"id":6618,"name":"Friar Road","distance":359.1999703118891,"route":"46"}},{"id":"pin-brighton-bustime-43361","time":"2015-04-27T13:09:03.000Z","stop":{"lat":50.8505840818616,"lng":-0.135023751322434,"id":6618,"name":"Friar Road","distance":359.1999703118891,"route":"46"}}]};

router.get('/nearest', function (req, res) {
  var services = (req.query.service || '').split(',');

  // return res.json(mock);

  var stops = nearest(services, req.query.lat, req.query.lng);

  var promises = stops.map(function (stop) {
    return times(stop, stop.route);
  });

  Promise.all(promises).then(function (data) {
    var times = data[0].concat(data[1]);
    res.json({ stops: stops, times: times });
  }).catch(function (error) {
    res.json({ error: error });
  });

});