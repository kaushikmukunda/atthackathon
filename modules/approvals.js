'use strict';

var http = require('http');
var Promise = require('bluebird');
var rest = require('unirest');
var socket = require('./socket');

var exports = module.exports = {};

function dictToArr(dict) {
  var result = [];
  for (var item in dict) {
    result.push(dict[item]);
  }
  return result;
}

function getUniqueCustomers(customers) {
  var unique = {};
  customers.forEach(function(customer) {
    // ignore invidividual customers
    var firmName = customer['FirmName'].toLowerCase();
    var name = customer['Name'].toLowerCase();
    if (firmName === '') {
      return;
    }

    if (!unique[firmName]) {
      unique[firmName] = {'score': 0, 'firmName': firmName};
    }
    unique[firmName]['score']++;
  });

  return dictToArr(unique);
}

function getProjectDetails(projectId) {
  return new Promise(function(resolve, reject) {
    rest.get('http://edison.sannet.gov/opendsd/api/Project/' + projectId)
    .header('Accept', 'application/json')
    .end(function(result) {
      resolve(getUniqueCustomers(result.body['Customers']));
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

function mergeCustomers(base, add) {
  add.forEach(function(newFirm) {
    console.log('newfirm', newFirm);
    var firmName = newFirm['firmName'];
    if (!base[firmName]) {
      base[firmName] = newFirm;
    } else {
      base[firmName]['score'] += newFirm['score'];
    }
  });
  return base;
}

function sortByScore(firms) {
  firms.sort(function(firmA, firmB) {
    return firmB['score'] - firmA['score'];
  });
  return firms;
}

exports.getContractors = function(swLat, swLong, neLat, neLong) {
  return new Promise(function (resolve, reject) {
    // Todo: Parameterize type
    getProjectIds(swLat, swLong, neLat, neLong, 'mechanical')
    .then(function(projects) {
      var data = {};
      console.log(projects);
      projects.forEach(function(projectId) {
        getProjectDetails(projectId)
        .then(function(details) {
          data = mergeCustomers(data, details);
          var ranked = sortByScore(dictToArr(data));
          console.log(ranked.slice(0, 10));
          socket.broadcast('updateCustomer', ranked.slice(0, 10));
        });
      });
    resolve();
    });
  });
};

