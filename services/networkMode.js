'use strict'
var network = "testnet";

//Set network string to be used for looking up authentication macroons and other network mode requiring functions
if (JSON.stringify(process.argv).search("--mainnet") != -1)
    network = "mainnet";

module.exports = network;
