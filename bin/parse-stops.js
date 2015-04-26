var request = require('request');
var cheerio = require('cheerio');
var Promise = require('promise');
var fs = require('fs');

function readServices() {
  return new Promise(function (resolve, reject) {
    fs.readFile(__dirname + '/../data/all_stops.kml', function (error, data) {
      if (error) {
        console.log(error);
        return reject(error);
      }

      var $ = cheerio.load(data);
      resolve($('Snippet').map(function () {
        return $(this).text();
      }).get());
    });
  });
}

var root = 'http://bh.buscms.com/api/REST/html/departureboard.aspx?'
  + 'clientid=BrightonBuses&sourcetype=siri&format=json&stopid=';

function getServices(service) {
  return new Promise(function (resolve, reject) {
    request({
      type: 'json',
      url: root + service,
    }, function (error, res) {
      var html = res.body.replace(/\\"/g, '"');
      var $ = cheerio.load(html);
      var services = $('a.service').map(function () {
        return $(this).text();
      }).get().slice(1);

      var result = {};
      result[service] = services;
      resolve(result);
    });
  });
}

// getServices(6979);
readServices().then(function (services) {
  var promises = services.map(getServices);
  Promise.all(promises).then(function (data) {
    fs.writeFile(__dirname + '/../data/all-services.json', JSON.stringify(data));
    console.log('wrote');
  });
}).catch(function (error) {
  console.log(error.stack);
});