var ws = new WebSocket("wss://" + window.location.host);
ws.onmessage = (msg) => {
    console.log("ws message " + JSON.stringify(msg));
    parseMsg(msg);
}

function parseMsg(msg) {
    var notification = JSON.parse(msg.data);
    console.log(notification);
    switch (notification.event) {
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
        default:
            console.log(notification);
            break;
    }
}