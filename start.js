'use strict';
var path = require('path');
//Detect if installed
if (Object.keys(require(path.join(process.cwd(), 'config.json'))).length == 0) {
    // run setup
    console.log("Starting first time setup...");
    var setupDone = require('./install/setup');
}
else {
    require('./app');
}