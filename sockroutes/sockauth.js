'use strict';
var config = require('../config.json');
var sessions = require('../services/sessions');
var crypto = require('crypto');
var fs = require('fs');
var cookieParser = require('cookie-parser');

function sockAuth(ws, req) {
    if (ws.readyState != ws.OPEN)
        return;

    if (!ws.locals)
        ws.locals = {};

    //allow passthrough to login
    var passthrough = false;
    if (config.enableUnauthorizedAccess) {
        passthrough = true;
        ws.locals.user = { permission: config.unauthorizedAccessPermission };
    }

    var cookieAuthed = false;
    if (req.headers.cookie) {
        var sessionId = cookieParser.signedCookie(decodeURIComponent(req.headers.cookie.substring(req.headers.cookie.indexOf('=') + 1, req.headers.cookie.length)), config.cookieSecret);
        if (sessionId) {
            ws.locals.user = sessions.find(session => { return session.session == sessionId && session.expires > new Date() });
        }
        if (ws.locals.user != undefined)
            cookieAuthed = true;
    }

    var whitelistVerified = false;
    if (config.whitelist) {
        for (var i = 0; i < config.whitelist.length; i++) {
            if (req.connection.remoteAddress == config.whitelist[i])
                whitelistVerified = true;
        }
    }
    
    if (!config.disableWhitelist && !whitelistVerified)
        if (ws.readyState == ws.OPEN)
            return ws.close();
        else
            return;

    if (passthrough || cookieAuthed)
        return;
    else {
        console.log("unauthorized ws access attempt from " + req.connection.remoteAddress);
        if (ws.readyState == ws.OPEN)
            return ws.close();
        else
            return;
    }
}

module.exports = sockAuth;