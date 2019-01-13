'use strict';
var express = require('express');
var router = express.Router();
var lightningService = require('../services/lightningService');

router.get('/', async function (req, res) {
    var viewdata = {};
   
    viewdata.listPeers = await lightningService.listPeers(res.locals.user);
    res.render('peers', { viewdata: viewdata });
});

module.exports = router;
