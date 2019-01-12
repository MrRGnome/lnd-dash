'use strict';
var path = require('path');

module.exports = process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Lnd") : path.join(process.env.HOME, ".lnd");