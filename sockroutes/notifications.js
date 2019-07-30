'use strict';
var EventEmitter = require('events');
var lightningService = require('../services/lightningService');
class notificationEmitter extends EventEmitter { };


var notifications = new notificationEmitter();

//subscribe to lnd invoices
subInvoices();
function subInvoices() {
    lightningService.subscribeInvoices().then((invoices) => {
        if (invoices.status && invoices.status == "fail")
            console.log("Failure subscribing to invoices:" + JSON.stringify(invoices));
        else {
            invoices.on('data', (invoice) => {
                if (invoice.settled)
                    notifications.emit('notification', 'invoicePaid', invoice);
            });
        }
    })
    .catch((err) => {
        console.log("Failure subscribing to invoices:" + JSON.stringify(err));
    });
};


//subscribe to lnd transactions
subTransactions();
function subTransactions() {
    lightningService.subscribeTransactions().then((transactions) => {
        if (transactions.status && transactions.status == "fail")
            console.log("Failure subscribing to invoices:" + JSON.stringify(invoices));
        else {
            transactions.on('data', (transaction) => {
                notifications.emit('notification', 'newTransaction', transaction);
            });
        }
    })
    .catch((err) => {
        console.log("Failure subscribing to transactions:" + JSON.stringify(err));
    });
};

//subscribe to lnd channel graph


module.exports = notifications;