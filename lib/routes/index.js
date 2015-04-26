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

router.get('/nearest', function (req, res) {
  var services = (req.query.service || '').split(',');
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