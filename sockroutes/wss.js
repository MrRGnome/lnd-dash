'use strict';
var notifications = require('./notifications');
var lndState = require('./lndstate');
var sockAuth = require('./sockauth');
var WebSocket = require('ws'); 


module.exports = (server) => {
    var wss = new WebSocket.Server({ server });
    

    wss.on('connection', (ws, req) => {

        sockAuth(ws, req);
        if (ws.readyState == ws.OPEN) 
            ws.send(JSON.stringify({ "event": "lndState", "data": lndState.lndState }));

        notifications.on('notification', (event, data) => {
            sockAuth(ws, req);
            if (ws.readyState == ws.OPEN) {
                ws.send(JSON.stringify({ "event": event, "data": data }));
            }
        });

        lndState.notifications.on('notification', (event, data) => {
            sockAuth(ws, req);
            if (ws.readyState == ws.OPEN) {
                ws.send(JSON.stringify({ "event": event, "data": data }));
            }
        });


    });

    return wss;
};