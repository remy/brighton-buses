var request = require('request');
var cheerio = require('cheerio');
var Promise = require('promise');
var _ = require('lodash');
const moment = require('moment-timezone');
const getNow = () => new Date().toLocaleString("en-US", {timeZone: "Europe/London"})
module.exports = times;

const dueIn = (time) => {
  const t = new Date(time).getTime();
  const n = new Date(getNow()).getTime();
  var diff = Math.abs(n - t);
  var minutes = Math.floor((diff/1000)/60);
  
  return (minutes - 1);
}

var root = 'http://bh.buscms.com/api/REST/html/departureboard.aspx?clientid=BrightonBuses&sourcetype=siri&format=json&';

var root = 'http://www.buscms.com/api/REST/html/departureboard.aspx?clientid=BrightonBuses2016&format=json&cachebust=123&sourcetype=siri&requestor=LD&includeTimestamp=true&'


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
        var $this = $(this);
        var dt = $this.data('departuretime');
        //var t = Date.parse(dt.split(' ')[0].split('/').reverse().join('-') + ' ' + dt.split(' ')[1]);
        const mdt = moment(dt, 'DD/MM/YYYY HH:mm:ss');
        const t = mdt.format('x') * 1;

        var $dest = $this.prev('.colDestination');
        var thisService = $dest.prev('.colServiceName').text();

        if (stop.route.indexOf(thisService) === -1) {
          return null;
        }
        
        
        

        var result = {
          id: 'pin-brighton-bustime-' + Math.round((Math.random() * 100000)),
          time: mdt.format(),
          destination: $dest.attr('title'),
          stop: _.cloneDeep(stop),
        };
        
        result.due = dueIn(t);

        result.stop.route = thisService;

        return result;
      }).get().filter(function (stop) {
        return stop !== null;
      });

      resolve(pins);
    });

  });
}
