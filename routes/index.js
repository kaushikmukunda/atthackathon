'use strict'; 

var express = require('express');
var router = express.Router();
var approvals = require('../modules/approvals');

/* GET home page. */
router.get('/', function(req, res) {
  approvals.getApprovals()
  .then(function(json) {
    res.render('index.html', {'content' : json});
  });
});

module.exports = router;
