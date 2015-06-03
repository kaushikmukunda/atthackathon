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
  //Mixpanel
    mixpanel.track("Search"); 
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

    rTable.fnClearTable();
    socket.emit('fetchContractors', data);

  });

  var map = mapInit();
  var socket = io();
  var keyInput = $('#key')[0];
  var infoText = $('#info')[0];

  var rTable = $('#table').dataTable ({
    "data": [],
    "searching": false,
    "paging": false,
    "columns" : [
      {'title': "Firm Name"},
      {'title': "Score"}
    ]
  });

  socket.on('updateCustomer', function(data) {
    var dataSet= [];
    data.forEach(function(row) {
      dataSet.push([row['firmName'], row['score']]);
    });
    rTable.fnClearTable();
    rTable.fnAddData(dataSet);
  });

  socket.on('statusUpdate', function(data) {
    infoText.textContent = data;
  });

  socket.on('done', function(data) {
    infoText.textContent = data;
    setTimeout(function() {
      infoText.textContent = '';
    }, 3000);
  });
});
