var services = localStorage.services ? localStorage.services.split(',') : [];
var $form = $('form');
$('form').on('click', ':checkbox', function () {
  localStorage.services = $form.serializeArray().map(function (el) {
    return el.value;
  }).join(',');
});

services.sort().reverse().forEach(function (value) {
  $('input[value=' + value + ']').prop('checked', true).parent().prependTo('#services');
});