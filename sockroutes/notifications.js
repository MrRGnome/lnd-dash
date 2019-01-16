'use strict';
var EventEmitter = require('events');
var lightningService = require('../services/lightningService');
class notificationEmitter extends EventEmitter { }


var notifications = new notificationEmitter();

//subscribe to lnd invoices
subInvoices();
async function subInvoices() {
	var invoices = await lightningService.subscribeInvoices();

	invoices.on('data', (invoice) => {
		console.log("got invoice data:");
		console.log("date: " + invoice)
		if(invoice.settled)
			notifications.emit('notification', 'invoicePaid', invoice);
	});
};


//subscribe to lnd trasnactions


//subscribe to lnd channel graph


module.exports = notifications;