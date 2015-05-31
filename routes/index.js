'use strict'; 

var express = require('express');
var router = express.Router();
var approvals = require('../modules/approvals');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

module.exports = router;
