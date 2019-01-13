'use strict';
var crypto = require('crypto');
var fs = require('fs');
const readline = require('readline');
var randHex = require('../services/randHex');
var eol = require('os').EOL;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function cliPrompt (qry) {
    return new Promise(resolve => {
        rl.question(qry, (resp) => {
            resolve(resp);
        });  
    });
};


var config = {
    "host": "127.0.0.1",
    "network": "testnet",
    "whitelist": [
        "127.0.0.1",
        "::1",
        "localhost"
    ],
    "guiport": 8888,
    "lnd_daemon": "127.0.0.1:10009",
    "users": [
    ],
    "cookieSecret": "changeme",
    "salt": "changeme"
}

async function createConfig() {

    console.log("Please configure your lnd dashboard. Leave an answer blank to accept the default" + eol);

    //Get IP to listen to
    config.host = await cliPrompt("What IP should lnd-dash listen to? Default is 127.0.0.1 . Common options: 0.0.0.0 (all ipv4 - dangerous), localhost, or a local IP address" + eol);
    if (config.host == "")
        config.host = "127.0.0.1";

    //Get default port
    config.guiport = await cliPrompt("What port should lnd-dash listen on? Default is 8888." + eol);
    if (config.guiport == "")
        config.guiport = "8888";

    //Get lnd daemon
    config.lnd_daemon = await cliPrompt("What is your lnd daemons address? Default is 127.0.0.1:10009" + eol);
    if (config.lnd_daemon == "")
        config.lnd_daemon = "127.0.0.1:10009";

    //Get default network
    config.network = await cliPrompt("What network are you running on? Default is testnet. Common options: mainnet (dangerous), simnet" + eol);
    if (config.network == "" || (config.network != "mainnet" && config.network != "testnet" && config.network != "simnet"))
        config.network = "testnet";

    //Get whitelist
    do {
        var ip = await cliPrompt("What IP address would you like to whitelist? Already whitelisted are " + config.whitelist.join(", ") + eol);
        if (ip != "")
            config.whitelist.push(ip);
    }
    while ((await cliPrompt("Would you like to add another address to the whitelist? (y or n)" + eol)).toLowerCase() == "y");


    //Generate cookie secret
    config.cookieSecret = randHex(32);

    //Generate password salt
    config.salt = randHex(32);

    //Get users
    var tryagain = false;
    var cont = 'y';
    do {
        tryagain = false;
        var user = {};
        user.username = await cliPrompt("Create a new username to login to the dashboard with" + eol);
        user.password = crypto.pbkdf2Sync(await cliPrompt("Create a new password for " + user.username + eol), config.salt, 100000, 512, "sha512").toString('hex');
        user.permission = await cliPrompt("There are 3 permission levels. 1. admin, 2. invoice (receive only), 3. readonly. Pick 1, 2 or 3." + eol);
        
        if (user.username == "" || user.password == "" || user.permission.search(/[123]/) == -1) {
            console.log("Username, password, or access level were incorrect. Please try again" + eol);
            tryagain = true;
        }
        else {
            switch (user.permission) {
                case '1':
                    user.permission = 'admin';
                    break;
                case '2':
                    user.permission = 'invoice';
                    break;
                case '3':
                    user.permission = 'readonly';
                    break;
            }
            config.users.push(user);
        }
    }
    while (tryagain || (await cliPrompt("Would you like to add another user? (y or n)" + eol)).toLowerCase() == "y");


    //write file
    fs.writeFileSync('config.json', JSON.stringify(config));

    rl.close();

    return true;

}

module.exports = createConfig;
