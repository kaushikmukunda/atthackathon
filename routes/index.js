'use strict'; 

var express = require('express');
var router = express.Router();
var approvals = require('../modules/approvals');

/* GET home page. */
router.get('/', function(req, res) {
  approvals.getContractors(32.73617294543789,-117.15117940216066, 32.761366541185964,-117.11126813201906)
  .then(function(json) {
    res.render('index', {'content' : json});
  });
});

module.exports = router;
