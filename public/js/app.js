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
      data.times.forEach(function (time) {
        html += '<li><strong>In ' + moment(time.time).fromNow(true) + '</strong> ' + time.layout.title + '</li>\n';
      });
      $('#times').html(html);
    },
  })
  // var xhr = new XMLHttpRequest();
  // xhr.onload = function () {
  //   console.log(JSON.parse(this.response));
  // };

  // xhr.open('GET', '/nearest?services=50,26,46&lat=' + position.latitude + '&lng=' + position.longitude);
  // xhr.setRequestHeader('Content-Type', 'application/json');

  // xhr.send();
}

function success(position) {
  console.log(position);
  navigator.geolocation.clearWatch(id);
  var res = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
  localStorage.geolocation = JSON.stringify(res);
  getNext(res);
}

function error(error) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
}

if (!'geolocation' in navigator || !window.localStorage) {
  alert('needs geolocation');
}

var id = navigator.geolocation.watchPosition(success, error, {
  enableHighAccuracy: false,
  timeout: 5000,
  // maximumAge: 0,
});