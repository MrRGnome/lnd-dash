'use strict';
var express = require('express');
var router = express.Router();
var config = require('../config.json');

function auth(req, res, next) {
    /*var passVerified = false;
    if (config.pass) {
        var pass = req.header("auth");
        passVerified = (pass == config.pass)
    }*/

    var whitelistVerified = false;
    if (config.whitelist) {
        for (var i = 0; i < config.whitelist.length; i++) {
            if (req.ip == config.whitelist[i])
                whitelistVerified = true;
        }
    }

    /*if (config.pass && passVerified && config.whitelist && whitelistVerified ||
        !config.pass && config.whitelist && whitelistVerified ||
        config.pass && passVerified && !whitelistVerified ||
        !config.pass && !config.whitelist)*/
    if (whitelistVerified || !config.whitelist)
        next();
    else {
        console.log("unauthorized access from " + req.ip);
        res.status(401).send("Unauthorized Access");
    }
}

module.exports = auth;