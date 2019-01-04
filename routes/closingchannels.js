'use strict';
var express = require('express');
var router = express.Router();
var lightningService = require('../services/lightningService');

router.get('/', async function (req, res) {
    var viewdata = {};
    
    viewdata.pendingChannels = await lightningService.pendingChannels();
    res.render('closingchannels', { viewdata: viewdata });
});


module.exports = router;
