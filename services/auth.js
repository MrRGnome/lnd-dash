'use strict';
var config = require('../config.json');
var sessions = require('../services/sessions');
var crypto = require('crypto');
var fs = require('fs');
var cookieParser = require('cookie-parser');

function auth(req, res, next) {


    //allow passthrough to login
    var passthrough = false;
    if ((req.url == "/" && req.method == "POST" ) || req.url == "/manifest.json")
        passthrough = true;

    var cookieAuthed = false;
    if (req.signedCookies && req.signedCookies.lndauth) {
        res.locals.user = sessions.find(session => { return session.session == cookieParser.signedCookie(req.signedCookies.lndauth, config.cookieSecret) });
        if (res.locals.user != undefined)
            cookieAuthed = true;
    }

    var whitelistVerified = false;
    if (config.whitelist) {
        for (var i = 0; i < config.whitelist.length; i++) {
            if (req.ip == config.whitelist[i])
                whitelistVerified = true;
        }
    }

    if (!whitelistVerified)
        return res.status(401).send();

    if (whitelistVerified && (passthrough || cookieAuthed))
        next();
    else {
        console.log("unauthorized access from " + req.ip);
        res.status(401).send(fs.readFileSync('./views/login.html').toString());
    }
}

module.exports = auth;