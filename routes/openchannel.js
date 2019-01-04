'use strict';
var express = require('express');
var router = express.Router();
var lightningService = require('../services/lightningService');

router.get('/', async function (req, res) {
    var viewdata = {};
    
    res.render('openchannel', { viewdata: viewdata });
});


router.post('/', async function (req, res) {
    if (req.body.only_connect== 'true') {
        var result = await lightningService.connectPeer(req.body.addr_string, true);
        res.status(200).json(result);
    } else {
        var result = await lightningService.openChannel(req.body.addr_string, req.body.amount);
        res.status(200).json(result);
    }
});

module.exports = router;
