var request = require('request');
var cheerio = require('cheerio');
var Promise = require('promise');

module.exports = times;

var root = 'http://bh.buscms.com/api/REST/html/departureboard.aspx?clientid=BrightonBuses&sourcetype=siri&format=json&';

function times(stop, service) {
  if (!Array.isArray(service)) {
    service = [service];
  }
  var url = root + 'stopid=' + stop.id; // + '&servicenamefilter=' + service.join(',');

  console.log(url);

  return new Promise(function (resolve, reject) {
    request({
      url: url,
      type: 'json',
    }, function (error, res) {
      if (error) {
        return reject(error);
      }

      var html = res.body.replace(/\\"/g, '"');
      var $ = cheerio.load(html);
      var pins = $('[data-departureTime]').map(function () {
        var dt = $(this).data('departuretime');
        var t = Date.parse(dt.split(' ')[0].split('/').reverse().join('-') + ' ' + dt.split(' ')[1]);
        return {
          id: 'pin-brighton-bustime-' + Math.round((Math.random() * 100000)),
          time: new Date(t).toISOString(),
          stop: stop,
        };
      }).get();

      resolve(pins);
    });

  });
}
