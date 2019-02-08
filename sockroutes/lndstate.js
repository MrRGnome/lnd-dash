'use strict';
var EventEmitter = require('events');
var lightningService = require('../services/lightningService');
class notificationEmitter extends EventEmitter { };
var lndStateEvents = new notificationEmitter();

var lastCall = {
    getInfo: "",
    walletBalance: "",
    channelBalance: "",
    listChannels: "",
    listPayments: "",
    listInvoices: "",
    pendingChannels: ""
};

var lndState = {
    pubkey: "",
    nodeAddress: "",
    alias: "",
    networkMode: "",
    syncedToChain: false,
    lastBlock: 0,
    blockHeight: 0,
    activeChannels: 0,
    activeAndInactiveChannels: 0,
    activeInCap: 0,
    activeOutCap: 0,
    activeCommitFees: 0,
    openingChannels: 0,
    openingInCap: 0,
    openingOutCap: 0,
    openingCommitFees: 0,
    closingChannels: 0,
    closingInCap: 0,
    closingOutCap: 0,
    peers: 0,
    outPayments: 0,
    paidInvoices: 0,
    allInvoices: 0,
    totalReceived: 0,
    totalSent: 0,
    totalFunds: 0,
    inChannelFunds: 0,
    onChainFunds: 0,
    pendingInChannels: 0,
    pendingOnChain: 0
};

var totalSats = 0;
var updated = false;

//get initial state
pollLnd();

var interval = setInterval(()=>{
    //Update calls
    pollLnd();
    
}, 10000);

function pollLnd() {
    //Update calls
    Promise.all(Object.keys(lastCall).map(call => lightningService[call]({ permission: "readonly" })))
        .then((res) => {
            for (var i = 0; i < Object.keys(lastCall).length; i++) {

                if (JSON.stringify(lastCall[Object.keys(lastCall)[i]]) != JSON.stringify(res[i])) {
                    lastCall[Object.keys(lastCall)[i]] = res[i];
                    updated = true;
                }
            }

            if (updated)
                updateLndState();
        });
}

function updateLndState() {
    lndState.totalFunds = 0;

    //getInfo
    lndState.pubkey = lastCall.getInfo.data.identity_pubkey;
    lndState.nodeAddress = lastCall.getInfo.data.uris[0];
    lndState.alias = lastCall.getInfo.data.alias;
    lndState.networkMode = lastCall.getInfo.data.testnet ? "TESTNET" : "MAINNET";
    lndState.syncedToChain = lastCall.getInfo.data.synced_to_chain;
    lndState.lastBlock = lastCall.getInfo.data.best_header_timestamp;
    lndState.blockHeight = lastCall.getInfo.data.block_height;
    lndState.peers = lastCall.getInfo.data.num_peers;

    //walletBalance
    lndState.onChainFunds = Number(lastCall.walletBalance.data.confirmed_balance);
    lndState.pendingOnChain = Number(lastCall.walletBalance.data.unconfirmed_balance);
    lndState.totalFunds += Number(lastCall.walletBalance.data.confirmed_balance) + Number(lastCall.walletBalance.data.unconfirmed_balance);

    //channelBalance
    lndState.inChannelFunds = Number(lastCall.channelBalance.data.balance);

    //listChannels
    lndState.activeAndInactiveChannels = Number(lastCall.listChannels.data.channels.length);
    lndState.activeChannels = 0;
    lndState.activeInCap = 0;
    lndState.activeOutCap = 0;
    var out = 0;
    lndState.activeCommitFees = 0;
    for (var i = 0; i < lastCall.listChannels.data.channels.length; i++) {
        if (Number(lastCall.listChannels.data.channels[i].total_satoshis_sent) - Number(lastCall.listChannels.data.channels[i].total_satoshis_received) > 0 || (Number(lastCall.listChannels.data.channels[i].total_satoshis_sent) == 0 && Number(lastCall.listChannels.data.channels[i].total_satoshis_received) == 0 && Number(lastCall.listChannels.data.channels[i].local_balance) > 0))
            lndState.activeCommitFees += Number(lastCall.listChannels.data.channels[i].commit_fee);
        out += Number(lastCall.listChannels.data.channels[i].local_balance);
        if (lastCall.listChannels.data.channels[i].active) {
            lndState.activeChannels++;
            lndState.activeOutCap += Number(lastCall.listChannels.data.channels[i].local_balance);
            lndState.activeInCap += Number(lastCall.listChannels.data.channels[i].remote_balance);
        }
    }
    lndState.totalFunds += Number(out) + Number(lndState.activeCommitFees);

    //pendingChannels
    lndState.openingChannels = lastCall.pendingChannels.data.pending_open_channels.length;
    lndState.closingChannels = lastCall.pendingChannels.data.pending_force_closing_channels.length + lastCall.pendingChannels.data.pending_closing_channels.length + lastCall.pendingChannels.data.waiting_close_channels.length;
    lndState.openingInCap = 0;
    lndState.openingOutCap = 0;
    lndState.openingCommitFees = 0;
    lndState.closingInCap = 0;
    lndState.closingOutCap = 0;
    lndState.pendingInChannels = 0;

    for (var i = 0; i < lastCall.pendingChannels.data.pending_open_channels.length; i++) {
        //deal with lnd issue where transactions get stuck pending
        if (lastCall.pendingChannels.data.pending_open_channels[i].maturity_height != 0) {
            lndState.openingInCap += Number(lastCall.pendingChannels.data.pending_open_channels[i].channel.remote_balance);
            lndState.openingOutCap += Number(lastCall.pendingChannels.data.pending_open_channels[i].channel.local_balance);
            lndState.openingCommitFees += Number(lastCall.pendingChannels.data.pending_open_channels[i].commit_fee);
            lndState.pendingInChannels += Number(lastCall.pendingChannels.data.pending_open_channels[i].channel.local_balance) + Number(lastCall.pendingChannels.data.pending_open_channels[i].commit_fee);
        }
    }

    for (var i = 0; i < lastCall.pendingChannels.data.pending_closing_channels.length; i++) {
        //deal with lnd issue where transactions get stuck pending
        if (lastCall.pendingChannels.data.pending_closing_channels[i].maturity_height != 0) {
            lndState.closingInCap += Number(lastCall.pendingChannels.data.pending_closing_channels[i].channel.remote_balance);
            lndState.closingOutCap += Number(lastCall.pendingChannels.data.pending_closing_channels[i].channel.local_balance);
            lndState.pendingInChannels += Number(lastCall.pendingChannels.data.pending_closing_channels[i].channel.local_balance);
        }
    }

    for (var i = 0; i < lastCall.pendingChannels.data.pending_force_closing_channels.length; i++) {
        //deal with lnd issue where transactions get stuck pending
        if (lastCall.pendingChannels.data.pending_force_closing_channels[i].maturity_height != 0) {
            lndState.closingInCap += Number(lastCall.pendingChannels.data.pending_force_closing_channels[i].channel.remote_balance);
            lndState.closingOutCap += Number(lastCall.pendingChannels.data.pending_force_closing_channels[i].channel.local_balance);
            lndState.pendingInChannels += Number(lastCall.pendingChannels.data.pending_force_closing_channels[i].channel.local_balance);
        }
    }

    for (var i = 0; i < lastCall.pendingChannels.data.waiting_close_channels.length; i++) {
        //deal with lnd issue where transactions get stuck pending
        if (lastCall.pendingChannels.data.waiting_close_channels[i].maturity_height != 0) {
            lndState.closingInCap += Number(lastCall.pendingChannels.data.waiting_close_channels[i].channel.remote_balance);
            lndState.closingOutCap += Number(lastCall.pendingChannels.data.waiting_close_channels[i].channel.local_balance);
            lndState.pendingInChannels += Number(lastCall.pendingChannels.data.waiting_close_channels[i].channel.local_balance);
        }
    }
    lndState.totalFunds += Number(lndState.pendingInChannels);

    //listPayments
    lndState.outPayments = lastCall.listPayments.data.payments.length;
    lndState.totalSent = 0;
    for (var i = 0; i < lastCall.listPayments.data.payments.length; i++) {
        lndState.totalSent += Number(lastCall.listPayments.data.payments[i].value);
    }

    //listInvoices
    lndState.allInvoices = lastCall.listInvoices.data.invoices.length;
    lndState.paidInvoices = 0;
    lndState.totalReceived = 0;
    for (var i = 0; i < lastCall.listInvoices.data.invoices.length; i++) {
        if (lastCall.listInvoices.data.invoices[i].settled) {
            lndState.paidInvoices++;
            lndState.totalReceived += Number(lastCall.listInvoices.data.invoices[i].value);
        }
    }
    
    lndStateEvents.emit('notification', "lndState", lndState);
};

module.exports = { lndState: lndState, notifications: lndStateEvents };