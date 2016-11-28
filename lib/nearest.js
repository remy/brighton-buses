var allservices = require(__dirname + '/../data/all-services-sorted.json');

module.exports = nearest;

function nearest(services, lat, lng) {
  if (!Array.isArray(services)) {
    services = [services];
  }

  var stops = services.map(function (service) {
    var stops = allservices[service] || [];
    var closest = stops.reduce(function (prev, stop) {
      var d = distance(lat, lng, stop.lat, stop.lng);

      if (prev === null || d < prev.distance) {
        prev = stop;
        prev.distance = d;
        prev.route = [service];
      }

      return prev;
    }, null);

    return closest;
  }).reduce(function (prev, current, i, all) {
    var found = prev.filter(function (stop) {
      if (current.id === stop.id) {
        if (!Array.isArray(stop.route)) {
          stop.route = [stop.route];
        }
        stop.route = stop.route.concat(current.route);
        return true;
      }
    }).length;

    if (!found) {
      prev.push(current);
    }

    return prev;
  }, []);

  return stops;
}

function toRadians(n) {
  return n * Math.PI / 180;
}

function distance(lat1, lng1, lat2, lng2) {
  var R = 6371000; // metres
  var φ1 = toRadians(lat1);
  var φ2 = toRadians(lat2);
  var Δφ = toRadians(lat2 - lat1);
  var Δλ = toRadians(lng2 - lng1);

  var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  var d = R * c;

  return d;
}

// nearest(process.argv[2].split(','), 50.849492, -0.130692);
// nearest(process.argv[2].split(','), 50.826689,-0.136558);
