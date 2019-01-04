'use strict';
var express = require('express');
var router = express.Router();
var lightningService = require('../services/lightningService');

router.get('/', async function (req, res) {
    var viewdata = {};
    res.render('pay', { viewdata: viewdata });
});

router.post('/decode_request', async function (req, res) {
    var result = await lightningService.decodePayReq(req.body.payment_request);
    res.status(200).json(result);
});

router.post('/', async function (req, res) {
    var result = await lightningService.sendPaymentSync(req.body.payment_request);
    res.status(200).json(result);
});

module.exports = router;
