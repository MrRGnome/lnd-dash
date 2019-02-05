'use strict';
var EventEmitter = require('events');
var lightningService = require('../services/lightningService');
class notificationEmitter extends EventEmitter { }


var notifications = new notificationEmitter();

//subscribe to lnd invoices
subInvoices();
function subInvoices() {
    lightningService.subscribeInvoices().then((invoices) => {
        invoices.on('data', (invoice) => {
            if (invoice.settled)
                notifications.emit('notification', 'invoicePaid', invoice);
        });
    });
};


//subscribe to lnd transactions
subTransactions();
function subTransactions() {
    lightningService.subscribeTransactions().then((transactions) => {
        transactions.on('data', (transaction) => {
            notifications.emit('notification', 'newTransaction', transaction);
        });
    });
};


//subscribe to lnd channel graph


module.exports = notifications;