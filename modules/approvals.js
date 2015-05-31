'use strict';

var http = require('http');
var Promise = require('bluebird');

var exports = module.exports = {};

exports.getApprovals = function () {
  return new Promise(function (resolve, reject) {
    resolve('promise');
  });
};
