'use strict';
var express = require('express');
var router = express.Router();
var lightningService = require('../services/lightningService');

router.get('/', async function (req, res) {
    var viewdata = {};
    viewdata.segwit_address = "";
    res.render('newinvoice', { viewdata: viewdata });
});


router.post('/', async function (req, res) {
    var result = await lightningService.addInvoice(req.body.amount, req.body.memo);
    res.status(200).json(result);
});

router.get('/newaddress', async function (req, res) {
    var result = await lightningService.newAddress(1);
    res.status(200).json(result);
});

module.exports = router;
