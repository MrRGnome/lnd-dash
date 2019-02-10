'use strict';
var notifications = require('./notifications');
var lndState = require('./lndstate');
var sockAuth = require('./sockauth');
var WebSocket = require('ws'); 

var clients = [];

module.exports = (server) => {
    var wss = new WebSocket.Server({ server });

    notifications.on('notification', (event, data) => {
        for (var i = 0; i < clients.length; i++) {
            var ws = clients[i].ws;
            var req = clients[i].req;

            sockAuth(ws, req);
            if (ws.readyState == ws.OPEN) {
                ws.send(JSON.stringify({ "event": event, "data": data }));
            }
        }
    });

    lndState.notifications.on('notification', (event, data) => {
        for (var i = 0; i < clients.length; i++) {
            var ws = clients[i].ws;
            var req = clients[i].req;

            sockAuth(ws, req);
            if (ws.readyState == ws.OPEN) {
                ws.send(JSON.stringify({ "event": event, "data": data }));
            }
        }
    });

    wss.on('connection', (ws, req) => {
        clients.push({ ws: ws, req: req });

        sockAuth(ws, req);
        if (ws.readyState == ws.OPEN) 
            ws.send(JSON.stringify({ "event": "lndState", "data": lndState.lndState }));

        ws.on('close', (sock) => {
            clients = clients.filter(client => client.ws != ws);
        });
    });

    return wss;
};