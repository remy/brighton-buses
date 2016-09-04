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
        var actualTime = m.format('HH:mm');
        var fromNow = m.fromNow(true);
        html += '<li><span class="route">' + time.stop.route + '</span><div><strong data-time="' + time.time + '" data-fromnow="' + fromNow + '">In ' + fromNow + ' <small>at ' + actualTime + '</small></strong> <p class="description"><a target="_blank" href="https://www.google.co.uk/maps/?q=' + time.stop.lat + ',' + time.stop.lng + '">' + time.stop.name + '</a></p> <p class="destination">Going to ' + time.destination + '</p></div></li>\n';
      });
      $('#times').html(html || '<li><p>No results were found&hellip;sorry!</p></li>');

      setInterval(function () {
        $('strong[data-time]').each(function () {
          var m = moment(this.dataset.time);
          if (m.toDate().getTime() < Date.now()) {
            // drop this bus time
            $(this).closest('li').remove();
            return;
          }
          var fromNow = m.fromNow(true);
          // only update if we have to
          if (fromNow !== this.dataset.fromnow) {
            this.innerHTML = 'In ' + fromNow + ' <small>at ' + m.format('HH:mm') + '</small>';
          }
        });
      }, 15 * 1000);
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
  $('#times').html('<li>Location lookup timed out&hellip;but I\'ll keep trying&hellip;</li>');
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

