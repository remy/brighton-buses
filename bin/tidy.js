var services = require(__dirname + '/../data/all-services.json');
var cheerio = require('cheerio');
var Promise = require('promise');
var fs = require('fs');

var idToServices = {};

services.forEach(function (service) {
  var key = Object.keys(service).pop();
  idToServices[key] = service[key];
});

function servicesByStop(stops) {
  var result = {};
  Object.keys(stops).map(function (key) {
    return stops[key];
  }).filter(function (stop) {
    return !!stop.services.length;
  }).forEach(function (stop) {
    stop.services.forEach(function (service) {
      if (!result[service]) {
        result[service] = [];
      }
      result[service].push({
        lat: stop.lat,
        lng: stop.lng,
        id: stop.id,
        name: stop.name,
      });
    });
  });

  return result;
}

function readServices() {
  return new Promise(function (resolve, reject) {
    fs.readFile(__dirname + '/../data/all_stops.kml', function (error, data) {
      if (error) {
        console.log(error);
        return reject(error);
      }

      var $ = cheerio.load(data);
      var results = {};
      $('Placemark').each(function () {
        var $this = $(this);
        var service = parseInt($this.find('Snippet').text(), 10);
        // note: coordinates are longitude, latitude
        var latlng = $this.find('coordinates').text().split(',');
        results[service] = {
          name: $this.find('name').text().trim(),
          id: service,
          lat: parseFloat(latlng[1], 10),
          lng: parseFloat(latlng[0], 10),
          services: idToServices[service],
        };
      });
      resolve(results);
    });
  });
}

readServices().then(servicesByStop).then(function (data) {
  fs.writeFile(__dirname + '/../data/all-services-sorted.json', JSON.stringify(data));
}).catch(function (error) {
  console.log(error.stack);
});