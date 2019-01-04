'use strict';
var express = require('express');
var router = express.Router();
var lightningService = require('../services/lightningService');

// call lightningService methods dynamically with args dynamically from browser
router.post('/', async function (req, res) {    
    try {
        var args = [];
        for (var key in req.body) {
            if (key != 'method_name') {
                args.push(req.body[key]);
            }
        }
        var result = await lightningService[req.body.method_name].apply(lightningService, args);
        res.status(200).json(result);
    } catch (err) {
        res.status(200).json({ status: 'fail', data: { error_message: err.message } });
    }

});

module.exports = router;
