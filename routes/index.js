'use strict';
var express = require('express');
var router = express.Router();
var config = require('../config.json');
var crypto = require('crypto');
var lightningService = require('../services/lightningService');
var sessions = require('../services/sessions');
var randHex = require('../services/randHex');

/* GET home page. */
router.get('/', async function (req, res) {
    var viewdata = {};    
      
    res.render('index', { viewdata: viewdata });
});

router.post('/', async function (req, res) {

    //check post body
    if (!req.body.username && !req.body.password)
        res.status(400).send("Malformed request: requires username and password in body.");
    
    //check user
    var user = config.users.find(user => { return user.username == req.body.username && user.password == crypto.pbkdf2Sync(req.body.password, config.salt, 100000, 512, 'sha512').toString('hex') });
    if (user != undefined) {
        user.session = randHex(64);
        //create session
        var options = {
            maxAge: 1000 * 60 * 15, // will expire after 15 minutes
            signed: true
        }
        user.expires = new Date(new Date().getTime() + 15 * 60 * 1000);
        //sessions = sessions.filter(sessUser => user.username != sessUser.username);
        sessions.push(user);
        res.header("Location", "/");
        res.cookie('lndauth', user.session, options);
        res.status(200).render('index', { viewdata: {} });
    }
    else
        res.status(401).send("Invalid username or password");
    
});

module.exports = router;
