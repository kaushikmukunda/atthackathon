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

function getUnique(arr) {
   var u = {}, a = [];
   for(var i = 0, l = arr.length; i < l; ++i){
      if(u.hasOwnProperty(arr[i])) {
         continue;
      }
      a.push(arr[i]);
      u[arr[i]] = 1;
   }
   return a;
}

function getUniqueCustomers(customers) {
  var unique = {};
  customers.forEach(function(customer) {
    // ignore invidividual customers
    var firmName = customer['FirmName'].toLowerCase();
    var name = customer['Name'].toLowerCase();
    if (firmName === '' ||
        firmName.indexOf('permit') != -1) {
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
  console.log("Querying DSD");
  return new Promise(function (resolve, reject) {
    rest.get('http://opendsd.sandiego.gov/api/approvalmapsearch/?SearchType=Ministerial&SouthWestLatitude='
    + swLat +'&SouthWestLongitude=' + swLong
    +'&NorthEastLatitude=' + neLat + '&NorthEastLongitude=' + neLong)
    .header('Accept', 'application/json')
    .end(function(result) {
        var projects = [];

        if ('ErrorMessage' in result.body){
          console.log("No entries found");
          socket.broadcast('updateCustomer', []);
          resolve([]);
          return;
        }

        console.log("Number of approvals", result.body.length);
        console.log(result.body);
        result.body.forEach(function(approval) {
          var approvalType = approval['ApprovalType'].toLowerCase();
          var approvalScope = 'ApprovalScope' in approval? approval['ApprovalScope'].toLowerCase() : '';

          // Ignore approval requests not in final stage and not of required type
          if (approval['ApprovalStatus'] == 'Issued' &&
              approvalScope.indexOf(type) != -1) {
            projects.push(approval['ProjectId']);
          }
        });
        var s = getUnique(projects);
        console.log("Number of unique projects", s.length);
        resolve(s);
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

exports.getContractors = function(swLat, swLong, neLat, neLong, type) {
  return new Promise(function (resolve, reject) {
    getProjectIds(swLat, swLong, neLat, neLong, type)
    .then(function(projects) {
      var data = {};
      console.log('projects', projects);
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

