'use strict';

var http = require('http');
var Promise = require('bluebird');
var rest = require('unirest');

var exports = module.exports = {};

function getUniqueCustomers(customers) {
  var unique = {};
  customers.forEach(function(customer) {
    // ignore invidividual customers
    var firmName = customer['FirmName'];
    if (firmName === '') {
      return;
    }
    unique[customer['CustomerId']] = {
      'firmName' : firmName,
      'Name' : customer['Name']
    };
  });
  return unique;
}

function getProjectDetails(projectId) {
  return new Promise(function(resolve, reject) {
    rest.get('http://edison.sannet.gov/opendsd/api/Project/' + projectId)
    .header('Accept', 'application/json')
    .end(function(result) {
      var customers = getUniqueCustomers(result.body['Customers']);
      console.log(customers);
      resolve(customers);
    });
  });
}

function getProjectIds (swLat, swLong, neLat, neLong, type) {
  return new Promise(function (resolve, reject) {
    rest.get('http://opendsd.sandiego.gov/api/approvalmapsearch/?SearchType=Ministerial&SouthWestLatitude='
    + swLat +'&SouthWestLongitude=' + swLong
    +'&NorthEastLatitude=' + neLat + '&NorthEastLongitude=' + neLong)
    .header('Accept', 'application/json')
    .end(function(result) {
        var approvals = [];
        result.body.forEach(function(approval) {
          var approvalType = approval['ApprovalType'].toLowerCase();

          // Ignore approval requests not in final stage and not of required type
          if (approval['ApprovalStatus'] == 'Issued' &&
              approvalType.indexOf(type) != -1) {
            approvals.push(approval['ProjectId']);
          }
        });
        resolve(approvals);
    });
  });
};

exports.getContractors = function(swLat, swLong, neLat, neLong) {
  return new Promise(function (resolve, reject) {
    // Todo: Parameterize type
    getProjectIds(swLat, swLong, neLat, neLong, 'electrical')
    .then(function(projects) {
      console.log('projects', projects);
      projects.forEach(function(projectId) {
        getProjectDetails(projectId);
      });
      resolve(JSON.stringify(projects));
    });
  });
};

