'use strict';
var notifications = require('./notifications');
var lndState = require('./lndstate');
var WebSocket = require('ws'); 


module.exports = (server) => {
    var wss = new WebSocket.Server({ server });
    

    wss.on('connection', (ws) => {

        ws.send(JSON.stringify({ "event": "lndState", "data": lndState.lndState }));

        notifications.on('notification', (event, data) => {
            //ws.emit(event, data);
            if (ws.readyState == ws.OPEN) {
                ws.send(JSON.stringify({ "event": event, "data": data }));
            }
        });

        lndState.notifications.on('notification', (event, data) => {
            if (ws.readyState == ws.OPEN) {
                ws.send(JSON.stringify({ "event": event, "data": data }));
            }
        });


    });

    return wss;
};