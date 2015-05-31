'use strict';

var socketio = require('socket.io')();

var exports = module.exports = {};

var connection = {};

function Endpoint(endpoint) {
  var client = endpoint;

  client.on('readyToUpdate', function() {
    var approvals = require('./approvals');
    var json = approvals.getContractors(32.73617294543789,-117.15117940216066, 32.761366541185964,-117.11126813201906);
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

