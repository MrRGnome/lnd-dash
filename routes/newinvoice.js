'use strict';
var express = require('express');
var router = express.Router();
var lightningService = require('../services/lightningService');

router.get('/', async function (req, res) {
    var viewdata = {};
    
    viewdata.segwit_address = await lightningService.newAddress(1);
    res.render('newinvoice', { viewdata: viewdata });
});


router.post('/', async function (req, res) {
    var result = await lightningService.addInvoice(req.body.amount, req.body.memo);
    res.status(200).json(result);
});

module.exports = router;
