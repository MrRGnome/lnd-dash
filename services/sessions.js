'use strict';
var sessions = [];

setInterval(() => {
    sessions = sessions.filter(session => session.expires > new Date());
}, 15 * 60 * 1000);

module.exports = sessions;