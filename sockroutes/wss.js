'use strict';
var lndState = require('./lndstate');
var notifications = require('./notifications');
var WebSocket = require('ws'); 


module.exports = (server) => {
    var wss = new WebSocket.Server({ server });
    

    wss.on('connection', (ws) => {

        //dashboard updates
        /*ws.on('dash', () => {
            ws.emit('dash', lndState.dash);
        });

        //layout updates
        ws.on('layout', () => {
            ws.emit('layout', lndState.layout);
        });*/

        notifications.on('notification', (event, data) => {
            //ws.emit(event, data);
            if (ws.readyState == ws.OPEN) {
                console.log("got notification sending ws data");
                ws.send(JSON.stringify({ "event": event, "data": data }));
            }
        });


    });

    return wss;
};