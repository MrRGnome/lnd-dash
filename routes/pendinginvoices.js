'use strict';
var express = require('express');
var router = express.Router();
var lightningService = require('../services/lightningService');

router.get('/', async function (req, res) {
    var viewdata = {};
    
    viewdata.listInvoices = await lightningService.listInvoices(true, res.locals.user);
    res.render('pendinginvoices', { viewdata: viewdata });
});

module.exports = router;
