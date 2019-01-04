'use strict';
var express = require('express');
var router = express.Router();
var lightningService = require('../services/lightningService');

/* GET home page. */
router.get('/', async function (req, res) {
    var viewdata = {};    
      
    res.render('index', { viewdata: viewdata });
});

module.exports = router;
