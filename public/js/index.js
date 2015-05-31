  'use strict';

  var socket = io();
  socket.emit('readyToUpdate', {});

  socket.on('updateCustomer', function(data) {
    console.log(data);
  });
