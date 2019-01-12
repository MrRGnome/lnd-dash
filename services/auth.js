'use strict';
var express = require('express');
var router = express.Router();
var config = require('../config.json');
var crypto = require('crypto');

var activeSessions = {};

function randomValueHex(len) {
    return crypto
        .randomBytes(Math.ceil(len / 2))
        .toString('hex')
        .slice(0, len);
}

function auth(req, res, next) {

    //first time setup
    if (!config.users) {
        
    }

    //create session
    if (req.body && req.body.password) {

    }

    /*if (!req.cookies || !req.cookies.lndauth) {
        var options = {
            maxAge: 1000 * 60 * 15, // would expire after 15 minutes
            signed: true 
        }
        res.cookie('lndauth', '', options)

    }*/

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