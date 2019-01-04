'use strict';
var express = require('express');
var router = express.Router();
var lightningService = require('../services/lightningService');

router.get('/', async function (req, res) {
    var viewdata = {};

    viewdata.ListPayments = await lightningService.getTransactions();
    res.render('chain_transactions', { viewdata: viewdata });
});

module.exports = router;
