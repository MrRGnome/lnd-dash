'use strict';
var express = require('express');
var router = express.Router();
var lightningService = require('../services/lightningService');

router.get('/', async function (req, res) {
    var viewdata = {};
    viewdata.listChannels = await lightningService.listChannels(res.locals.user);
    res.render('activechannels', { viewdata: viewdata });
});

router.post('/closechannel', async function (req, res) {
    if (req.body.force == 'true') {
        var result = await lightningService.closeChannel(req.body.channel_point, true, res.locals.user);
        res.status(200).json(result);
    } else {
        var result = await lightningService.closeChannel(req.body.channel_point, false, res.locals.user);
        res.status(200).json(result);
    }
});

module.exports = router;
