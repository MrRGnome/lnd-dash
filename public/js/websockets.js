var ws = new WebSocket("wss://" + window.location.host);
ws.onmessage = (msg) => {
    console.log("ws message " + JSON.stringify(msg));
    parseMsg(msg);
}

function parseMsg(msg) {
    var data = JSON.parse(msg.data);
    switch (data.event) {
        case "invoicePaid":
            var message = "Recieved payment for " + Number(data.data.value).toLocaleString() + " sats, memo: " + data.data.memo;
            notify_handler("success", message);
            notify(message, "Recieved " + Number(data.data.value).toLocaleString() + " Sats");
            break;
        default:
            console.log(data);
            break;
    }
}