function getNext(position) {
  $.ajax({
    url: '/nearest',
    data: {
      service: '50,46,26',
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
        html += '<li><span class="route">' + time.stop.route + '</span><div><strong>In ' + m.fromNow(true) + ' <small>at ' + m.format('HH:mm') + '</small></strong> <span class="description">' + time.stop.name + '</span></div></li>\n';
      });
      $('#times').html(html);
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
}

if (!'geolocation' in navigator || !window.localStorage) {
  alert('needs geolocation');
}

var id = navigator.geolocation.watchPosition(success, error, {
  enableHighAccuracy: true,
  timeout: 5000,
  // maximumAge: 0,
});
// getNext({})