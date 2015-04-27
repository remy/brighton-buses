function getNext(position) {
  console.log(position);
  $.ajax({
    url: '/nearest',
    data: {
      service: services,
      lat: position.latitude,
      lng: position.longitude,
    },
    type: 'get',
    dataType: 'json',
    success: function (data) {
      var html = '';
      data.times.sort(function (a, b) {
        return a.time < b.time ? -1 : 1;
      }).forEach(function (time) {
        var m = moment(time.time);
        if (m.toDate().getTime() < Date.now()) {
          console.log('dropped', time);
          return;
        }
        html += '<li><span class="route">' + time.stop.route + '</span><div><strong>In ' + m.fromNow(true) + ' <small>at ' + m.format('HH:mm') + '</small></strong> <p class="description">' + time.stop.name + '</p> <p class="destination">Going to ' + time.destination + '</p></div></li>\n';
      });
      $('#times').html(html || '<li><p>No results were found&hellip;sorry!</p></li>');
    },
  })
}

function success(position) {
  navigator.geolocation.clearWatch(id);
  var res = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
  localStorage.geolocation = JSON.stringify(res);
  getNext(res);
}

function error(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
  $('#times').html('<li>Location lookup timed out...not sure what to do now :-\\</li>');
}

if (!'geolocation' in navigator || !window.localStorage) {
  alert('needs geolocation');
}

var services;

if (!localStorage.services) {
  window.location = '/config';
} else {
  if (localStorage.services && !services) {
    services = localStorage.services;
  }

  var id = navigator.geolocation.watchPosition(success, error, {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  });
}

