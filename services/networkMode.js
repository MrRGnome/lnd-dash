'use strict'
var network = "testnet";
var config = require("../config.json");

//Set network string to be used for looking up authentication macroons and other network mode requiring functions
if (JSON.stringify(process.argv).search("--mainnet") != -1)
    network = "mainnet";
else if (config.network)
    network = config.network

module.exports = network;