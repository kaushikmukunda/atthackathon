  'use strict';

$(document).ready(function() {
  function mapInit() {
    var options = {
      center:new google.maps.LatLng(32.724791, -117.163613),
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    return new google.maps.Map(document.getElementById("googleMap"), options);
  }

  $('#search').on('click', function(evt) {
    var neLat = map.getBounds().getNorthEast().lat();
    var neLng = map.getBounds().getNorthEast().lng();
    var swLat = map.getBounds().getSouthWest().lat();
    var swLng = map.getBounds().getSouthWest().lng();

    var data = {
      'neLat': neLat,
      'neLng': neLng,
      'swLat': swLat,
      'swLng': swLng,
      'type': keyInput.value
    };

    socket.emit('fetchContractors', data);

  });

  var map = mapInit();
  var socket = io();
  var keyInput = $('#key')[0];

  socket.on('updateCustomer', function(data) {
    console.log(data);
  });
});
