'use strict';

var socketio = require('socket.io')();

var exports = module.exports = {};

var connection = {};

function Endpoint(endpoint) {
  var client = endpoint;

  client.on('fetchContractors', function(data) {
    var approvals = require('./approvals');
    console.log(data);
    approvals.getContractors(
      data['swLat'],
      data['swLng'],
      data['neLat'],
      data['neLng'],
      data['type'],
      client
      )
    .catch(function(err) {});
  });
}

function listen(socketConnection) {
  socketConnection.on('connection', function(endpoint) {
    console.log('Connection initiated');
    new Endpoint(endpoint);
  });

  socketConnection.on('disconnect', function() {
    console.log('User disconnected');
  });
}

exports.create = function(server) {
  connection = socketio.listen(server);
  listen(connection);
};

exports.broadcast = function(evt, kwargs) {
  connection.emit(evt, kwargs);
};

