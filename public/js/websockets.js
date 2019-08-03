var ws = new WebSocket("wss://" + window.location.host);
ws.onmessage = (msg) => {
    //console.log("ws message " + JSON.stringify(msg));
    parseMsg(msg);
}

function parseMsg(msg) {
    var notification = JSON.parse(msg.data);
    console.log(notification);
    switch (notification.event) {
        case "unauthorized":
            window.location.href = "/";
            break;
        case "invoicePaid":
            var message = "Recieved payment for " + Number(notification.data.value).toLocaleString() + " sats, memo: " + notification.data.memo;
            notify_handler("success", message);
            notify(message, "Recieved " + Number(notification.data.value).toLocaleString() + " Sats");
            break;
        case "newTransaction":
            var message = "New on chain payment received for " + Number(notification.data.amount).toLocaleString() + " sats";
            notify_handler("success", message);
            notify(message, "Recieved " + Number(notification.data.amount).toLocaleString() + " Sats");
            break;
        case "lndState":
            //update gui with new state
            window.lndState = notification.data;
            $("#div_peer_pubkey").html('PubKey: ' + notification.data.pubkey);
            $("#input_node_pubkey").val(notification.data.pubkey);
            $("#input_node_address").val(notification.data.nodeAddress);
            $(".network_mode").html(notification.data.networkMode)
            $("#alias_header").html(notification.data.alias);
            $("#h3_connected_peers").html(notification.data.peers);
            $("#input_node_alias").val(notification.data.alias);
            $(".lastblock").html(new Date(notification.data.lastBlock * 1000).toLocaleString());
            $(".blockheight").html(Number(notification.data.blockHeight).toLocaleString());
            updateSats("span_wallet_balance", notification.data.onChainFunds);
            updateSats("span_confirmed_balance", notification.data.onChainFunds);
            updateSats("span_unconfirmed_balance", notification.data.pendingOnChain);
            updateSats("span_channel_balance", notification.data.inChannelFunds);
            updateSats("span_channel_balance_index", notification.data.inChannelFunds);
            $("#span_list_payments").html(Number(notification.data.outPayments).toLocaleString());
            $(".active_channels").html(notification.data.activeChannels);
            $(".total_channels").html(notification.data.activeAndInactiveChannels);
            updateSats("active_outgoing_cap", notification.data.activeOutCap);
            updateSats("active_incoming_cap", notification.data.activeInCap);
            updateSats("active_commit_fee", notification.data.activeCommitFees);
            $("#channels_opening").html(notification.data.openingChannels);
            $("#channels_closing").html(notification.data.closingChannels);
            updateSats("opening_incoming_cap", notification.data.openingInCap);
            updateSats("opening_outgoing_cap", notification.data.openingOutCap);
            updateSats("opening_commit_fee", notification.data.openingCommitFees);
            updateSats("closing_incoming_cap", notification.data.closingInCap);
            updateSats("closing_outgoing_cap", notification.data.closingOutCap);
            updateSats("pending_channels_balance", notification.data.pendingInChannels);
            $(".invoices_paid").html(notification.data.paidInvoices);
            $(".invoices_total").html(notification.data.allInvoices);
            updateSats("total_sats", notification.data.totalFunds);
            break;
        default:
            console.log(notification);
            break;
    }
}