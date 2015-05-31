'use strict'; 

var express = require('express');
var router = express.Router();
var approvals = require('../modules/approvals');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {'content' : "Hello"});
  /*.then(function(json) {
    res.render('index', {'content' : json});
  });*/
});

module.exports = router;
