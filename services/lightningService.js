const timeout_in_seconds = 60;
var config = require('../config.json');
const lnd_daemon = config.lnd_daemon || '127.0.0.1:10009';

module.exports = {

    //
    getLightningClient: async function () {
        try {
            //process.env.GRPC_SSL_CIPHER_SUITES = 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-ECDSA-AES256-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384';
            process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';
            var grpc = require('grpc');
            var fs = require('fs');
            var lndCert = fs.readFileSync(process.env.LOCALAPPDATA + "\\Lnd\\tls.cert");
            if (!Buffer.isBuffer(lndCert)) {
                lndCert = Buffer.from(lndCert);
            }
            var credentials = grpc.credentials.createSsl(lndCert);
            var lnrpcDescriptor = grpc.load(".\\services\\rpc.proto");
            var lnrpc = lnrpcDescriptor.lnrpc;
            var lightning = new lnrpc.Lightning(lnd_daemon, credentials);

            var metadata = new grpc.Metadata();
            var networkMode = require('../services/networkMode');
            var macaroonHex = fs.readFileSync(process.env.LOCALAPPDATA + "\\Lnd\\data\\chain\\bitcoin\\" + networkMode  + "\\admin.macaroon").toString("hex");
            metadata.add('macaroon', macaroonHex);

            return { status: 'success', data: { client: lightning, metadata: metadata } };
        } catch (err) {
            return { status: 'fail', data: { error_message: err.message } };
        }
    },


    //send transactions: amount negative value
    //receive transactions: amount positive value
    //{
    //    "transactions": [        
    //        {
    //            "tx_hash": "d2fda65bbf4a75e8197639346038196172440882a78860fc75d5960db4446d00",
    //            "amount": "110000000",
    //            "num_confirmations": 384,
    //            "block_hash": "00000000000005088ce7c02599ae81563cfdac17c468511a02c30d3402dff377",
    //            "block_height": 1254692,
    //            "time_stamp": "1513063773",
    //            "total_fees": "0",
    //            "dest_addresses": [
    //                "2MvEa5RD7VSjGS3h1dHVsYP8vhgmfuFDWa2",
    //                "2N1f7DX5DhPC9GMa59nqV1CXqAVqpHk7Pwu"
    //            ]
    //        },        
    //        {
    //            "tx_hash": "3a8807112465b65e5a1f87bf6fa40fa5f373bece6242369380cb56983bf35fc6",
    //            "amount": "-1004218",
    //            "num_confirmations": 277,
    //            "block_hash": "00000000000097069d4f94c6afe7aa77b8905e410c9856ec730259e6924cd0c1",
    //            "block_height": 1254799,
    //            "time_stamp": "1513128349",
    //            "total_fees": "4218",
    //            "dest_addresses": [
    //                "tb1q7te8wkd62xdlj3xgz3rffattc6ud4m43z4ph27g7tvyh3aj85nrqwatq33",
    //                "tb1qde5xkt683nuqwnseldy4wp0dff4ycjrgjsj08x"
    //            ]
    //        }
    //    ]
    //}
    getTransactions: async function () {
        var client = await this.getLightningClient();
        if (client.status == 'fail') return client;
        var timeout = new Date().setSeconds(new Date().getSeconds() + timeout_in_seconds);

        var call = new Promise((resolve) => {
            client.data.client.getTransactions({}, client.data.metadata, { deadline: timeout }, function (err, response) {
                if (err)
                    return resolve({ status: 'fail', data: { error_message: err.message } });
                else
                    return resolve({ status: 'success', data: response });
            });
        });

        return await call;
    },

    //{
    //	"identity_pubkey": "02188316fbd770142aae02e154d25f1f752b936d56bbf12ea619b33b7cbbf53fb5",
    //	"alias": "",
    //	"num_pending_channels": 3,
    //	"num_active_channels": 0,
    //	"num_peers": 1,
    //	"block_height": 1254737,
    //	"block_hash": "000000000000051f618e80eda656788c88a5877561590f3012251d0f8e3f8f98",
    //	"synced_to_chain": true,
    //	"testnet": true,
    //	"chains": [
    //		"bitcoin"
    //	]
    //}
    getInfo: async function () {
        var client = await this.getLightningClient();
        if (client.status == 'fail') return client;
        var timeout = new Date().setSeconds(new Date().getSeconds() + timeout_in_seconds);

        var call = new Promise((resolve) => {
            client.data.client.getInfo({}, client.data.metadata, { deadline: timeout }, function (err, response) {
                if (err)
                    return resolve({ status: 'fail', data: { error_message: err.message } });
                else
                    return resolve({ status: 'success', data: response });
            });
        });

        return await call;
    },

    setAlias: async function (new_alias) {
        var client = await this.getLightningClient();
        if (client.status == 'fail') return client;
        var timeout = new Date().setSeconds(new Date().getSeconds() + timeout_in_seconds);

        var call = new Promise((resolve) => {
            client.data.client.setAlias({ new_alias: new_alias }, client.data.metadata, { deadline: timeout }, function (err, response) {
                if (err)
                    return resolve({ status: 'fail', data: { error_message: err.message } });
                else
                    return resolve({ status: 'success', data: response });
            });
        });

        return await call;
    },

    //{
    //	"funding_txid": {
    //		"type": "Buffer",
    //		"data": [
    //			198,
    //			95,
    //			243,
    //			59,
    //			152,
    //			86,
    //			203,
    //			128,
    //			147,
    //			54,
    //			66,
    //			98,
    //			206,
    //			190,
    //			115,
    //			243,
    //			165,
    //			15,
    //			164,
    //			111,
    //			191,
    //			135,
    //			31,
    //			90,
    //			94,
    //			182,
    //			101,
    //			36,
    //			17,
    //			7,
    //			136,
    //			58
    //		]
    //	},
    //	"funding_txid_str": "",
    //	"output_index": 0
    //}
    openChannelSync: async function (addr_string, amount) {
        var remote_addr = await this.validateLightningAddress(addr_string);
        if (remote_addr.status == 'fail') return remote_addr;

        if (!Number(amount) || Number(amount) < 1000) {
            return { status: 'fail', data: { error_message: 'Amount value is not valid.' } };
        }

        var client = await this.getLightningClient();
        if (client.status == 'fail') return client;

        var connectToRemote = await this.connectPeer(addr_string, true);
        //if (connectToRemote.status == 'fail') return connectToRemote;  //no need to this line. maybe already exist a connection with remote peer.

        var listpeers = await this.listPeers();
        var target_peer_id = 0;
        for (var i = 0; i < listpeers.data.peers.length; i++) {
            if (listpeers.data.peers[i].pub_key == remote_addr.data.pubkey) {
                target_peer_id = Number(listpeers.data.peers[i].peer_id);
                break;
            }
        }

        var options = {};
        if (target_peer_id > 0) options["target_peer_id"] = target_peer_id;
        options["node_pubkey"] = Buffer.from(remote_addr.data.pubkey);
        options["node_pubkey_string"] = remote_addr.data.pubkey;
        options["local_funding_amount"] = Number(amount);
        options["push_sat"] = 0;

        var timeout = new Date().setSeconds(new Date().getSeconds() + timeout_in_seconds);

        var call = new Promise((resolve) => {
            client.data.client.openChannelSync(options, client.data.metadata, { deadline: timeout }, function (err, response) {
                if (err)
                    return resolve({ status: 'fail', data: { error_message: err.message } });
                else {
                    response.funding_txid_str = Buffer.from(response.funding_txid, 'base64').reverse().toString('hex');
                    return resolve({ status: 'success', data: response });
                }
            });
        });

        return await call;
    },

    openChannel: async function (addr_string, amount) {
        var remote_addr = await this.validateLightningAddress(addr_string);
        if (remote_addr.status == 'fail') return remote_addr;

        if (!Number(amount) || Number(amount) < 1000) {
            return { status: 'fail', data: { error_message: 'Amount value is not valid.' } };
        }

        var client = await this.getLightningClient();
        if (client.status == 'fail') return client;

        var connectToRemote = await this.connectPeer(addr_string, true);
        //if (connectToRemote.status == 'fail') return connectToRemote;  //no need to this line. maybe already exist a connection with remote peer.

        var listpeers = await this.listPeers();
        var target_peer_id = 0;
        for (var i = 0; i < listpeers.data.peers.length; i++) {
            if (listpeers.data.peers[i].pub_key == remote_addr.data.pubkey) {
                target_peer_id = Number(listpeers.data.peers[i].peer_id);
                break;
            }
        }

        var options = {};
        if (target_peer_id > 0) options["target_peer_id"] = target_peer_id;
        options["node_pubkey"] = new Buffer(remote_addr.data.pubkey, 'hex')
        //options["node_pubkey_string"] = remote_addr.data.pubkey;
        options["local_funding_amount"] = Number(amount);
        //options["push_sat"] = 0;

        var call = new Promise((resolve) => {
            this.tryOpenChannel(client, options, function (err, response) {
                if (err) {
                    return resolve({ status: 'fail', data: { error_message: err.message } });
                } else {
                    if (response.update == 'chan_pending') {
                        response.funding_txid_str = Buffer.from(response.chan_pending.txid, 'base64').reverse().toString('hex');
                        return resolve({ status: 'success', data: response });
                    } else if (response.update == 'chan_open') {
                        response.funding_txid_str = response.chan_open.channel_point.funding_txid;
                        return resolve({ status: 'success', data: response });
                    } else if (response.update == 'confirmation') {
                        response.funding_txid_str = Buffer.from(response.confirmation.block_sha, 'base64').reverse().toString('hex');
                        return resolve({ status: 'success', data: response });
                    } else {
                        return resolve({ status: 'fail', data: { error_message: 'no response from server.' } });                        
                    }
                }
            });
        });

        return await call;
    },

    tryOpenChannel: async function (client, options, callback) {
        try {
            var call = client.data.client.openChannel(options, client.data.metadata);

            call.on('data', function (message) {
                console.log(message);
                callback(null, message);
            });

            call.on('end', function () {
                // The server has finished sending
                console.log("END");
            });

            call.on('status', function (status) {
                // Process status
                console.log("Current status: " + status);
            });

            call.on('error', function (err) {
                console.log("channel opening error: " + err.message);
                callback(err, null);
            });

        } catch (err) {
            callback(err, null);
        }        
    },


    closeChannel: async function (channel_point, force) {
        var client = await this.getLightningClient();
        if (client.status == 'fail') return client;
        try {
            var call = new Promise((resolve) => {
                this.tryCloseChannel(client, channel_point, force, function (err, result) {
                    if (err) {
                        return resolve({ status: 'fail', data: { error_message: err.message } });                        
                    } else {
                        if (result.update == 'close_pending') {
                            result.closing_txid = Buffer.from(result.close_pending.txid, 'hex').reverse().toString('hex');
                            return resolve({ status: 'success', data: result });
                        } else if (result.update == 'chan_close') {
                            result.closing_txid = Buffer.from(result.chan_close.closing_txid, 'hex').reverse().toString('hex');
                            return resolve({ status: 'success', data: result });
                        } else {
                            return resolve({ status: 'fail', data: { error_message: 'no response from server.' } });                        
                        }
                        
                    }
                });
            });

            return await call;
        } catch (err) {
            return { status: 'fail', data: { error_message: err.message } };
        }
    },

    tryCloseChannel: function (client,channel_point, force,callback) {
        
        force = (/true/i).test(force);

        try {
            var channel_point_obj = {};
            channel_point_obj["funding_txid"] = new Buffer(channel_point.split(':')[0], 'hex').reverse();
            //channel_point_obj["funding_txid_str"] = channel_point.split(':')[0];
            channel_point_obj["output_index"] = parseInt(channel_point.split(':')[1], 10)

            var call = client.data.client.closeChannel({
                channel_point: channel_point_obj,
                force: force,
            }, client.data.metadata);

            call.on('data', function (message) {
                console.log("Data: ");
                console.log(message);
                callback(null, message);
            });

            call.on('end', function () {
                // The server has finished sending
                console.log("END");
            });

            call.on('status', function (status) {
                // Process status
                console.log("Current status: " + status.details);
                //callback(null, status);
            });

            call.on('error', function (err) {
                console.log("channel deleting error: " + err.message);
                callback(err, null);
            });

        } catch (err) {
            callback(err, null);
        }        
    },

//{
//	"total_balance": "201590573",
//	"confirmed_balance": "201590573",
//	"unconfirmed_balance": "0"
//}
    walletBalance: async function () {
        var client = await this.getLightningClient();
        if (client.status == 'fail') return client;
        var timeout = new Date().setSeconds(new Date().getSeconds() + timeout_in_seconds);

        var call = new Promise((resolve) => {
            client.data.client.walletBalance({}, client.data.metadata, { deadline: timeout }, function (err, response) {
                if (err)
                    return resolve({ status: 'fail', data: { error_message: err.message } });
                else
                    return resolve({ status: 'success', data: response });
            });
        });

        return await call;
    },

    // {balance : "11031817"}
    channelBalance: async function () {
        var client = await this.getLightningClient();
        if (client.status == 'fail') return client;
        var timeout = new Date().setSeconds(new Date().getSeconds() + timeout_in_seconds);

        var call = new Promise((resolve) => {
            client.data.client.channelBalance({}, client.data.metadata, {deadline:timeout}, function (err, response) {
                if (err)
                    return resolve({ status: 'fail', data: { error_message: err.message } });
                else
                    return resolve({ status: 'success', data: response });
            });
        });

        return await call;
    },

    //{"address":"2MvEa5RD7VSjGS3h1dHVsYP8vhgmfuFDWa2"}
    newWitnessAddress: async function () {
        var client = await this.getLightningClient();
        if (client.status == 'fail') return client;
        var timeout = new Date().setSeconds(new Date().getSeconds() + timeout_in_seconds);

        var call = new Promise((resolve) => {
            client.data.client.newWitnessAddress({}, client.data.metadata, {deadline:timeout}, function (err, response) {
                if (err)
                    return resolve({ status: 'fail', data: { error_message: err.message } });
                else
                    return resolve({ status: 'success', data: response });
            });
        });

        return await call;
    },


    newAddress: async function (type) {
        var client = await this.getLightningClient();
        if (client.status == 'fail') return client;
        var timeout = new Date().setSeconds(new Date().getSeconds() + timeout_in_seconds);

        var call = new Promise((resolve) => {
            client.data.client.newAddress({ type: type}, client.data.metadata, { deadline: timeout }, function (err, response) {
                if (err)
                    return resolve({ status: 'fail', data: { error_message: err.message } });
                else
                    return resolve({ status: 'success', data: response });
            });
        });

        return await call;
    },
    validateLightningAddress: async function (addr_string) {
        if (!addr_string || addr_string.trim().split('@').length != 2) {
            return { status: 'fail', data: { error_message: 'addr_string must be like pubkey@host:port' } };
        }
        var remote_pubkey = addr_string.split('@')[0];
        var remote_host = addr_string.split('@')[1];
        if (!remote_host || remote_host.trim().split(':').length != 2) {
            return { status: 'fail', data: { error_message: 'addr_string must be like pubkey@host:port' } };
        }
        return { status: 'success', data: { pubkey: remote_pubkey, host: remote_host } };
    },

    //data will be like:
    //{
    //	"destination": "035b55e3e08538afeef6ff9804e3830293eec1c4a6a9570f1e96a478dad1c86fed",
    //	"payment_hash": "fb278c5197df6b44a48a07dd6dbd5c1e2b038c5bb3cd2ace8a0c4c936dff52eb",
    //	"num_satoshis": "1900",
    //	"timestamp": "1513031142",
    //	"expiry": "3600",
    //	"description": "1 Scala Chip Frappuccino",
    //	"description_hash": "",
    //	"fallback_addr": "",
    //	"cltv_expiry": "9"
    //}
    decodePayReq: async function (pay_req) {
        var client = await this.getLightningClient();
        if (client.status == 'fail') return client;
        var timeout = new Date().setSeconds(new Date().getSeconds() + timeout_in_seconds);

        var call = new Promise((resolve) => {
            client.data.client.decodePayReq({ pay_req: pay_req }, client.data.metadata, {deadline:timeout}, function (err, response) {
                if (err)
                    return resolve({ status: 'fail', data: { error_message: err.message } });
                else
                    return resolve({ status: 'success', data: response });
            });
        });

        return await call;
    },

//{
//	"payment_error": "",
//	"payment_preimage": {
//		"type": "Buffer",
//		"data": [
//			220,
//			51,
//			77,
//			211,
//			1,
//			182,
//			113,
//			21,
//			126,
//			73,
//			246,
//			97,
//			139,
//			202,
//			35,
//			140,
//			240,
//			246,
//			5,
//			93,
//			22,
//			24,
//			36,
//			215,
//			96,
//			85,
//			28,
//			190,
//			175,
//			61,
//			140,
//			33
//		]
//	},
//	"payment_route": {
//		"total_time_lock": 1254908,
//		"total_fees": "1",
//		"total_amt": "101",
//		"hops": [
//			{
//				"chan_id": "1379412103843938304",
//				"chan_capacity": "1000000",
//				"amt_to_forward": "100",
//				"fee": "1",
//				"expiry": 1254764
//			},
//			{
//				"chan_id": "1379042667944476672",
//				"chan_capacity": "15000000",
//				"amt_to_forward": "100",
//				"fee": "0",
//				"expiry": 1254764
//			}
//		]
//	}
//}
    sendPaymentSync: async function (pay_req) {
        var decodeReq = await this.decodePayReq(pay_req);
        if (decodeReq.status == 'fail') return decodeReq;

        var client = await this.getLightningClient();
        if (client.status == 'fail') return client;
        
        var options = {};
        options["dest"] = Buffer.from(decodeReq.data.destination,'hex');
        options["dest_string"] = decodeReq.data.destination;
        options["amt"] = Number(decodeReq.data.num_satoshis);
        options["payment_hash"] = Buffer.from(decodeReq.data.payment_hash,'hex');
        options["payment_hash_string"] = decodeReq.data.payment_hash;
        options["payment_request"] = pay_req;

        var timeout = new Date().setSeconds(new Date().getSeconds() + timeout_in_seconds);

        var call = new Promise((resolve) => {
            client.data.client.sendPaymentSync(options, client.data.metadata, { deadline: timeout }, function (err, response) {
                if (err)
                    return resolve({ status: 'fail', data: { error_message: err.message } });
                else {
                    if (response.payment_error != "") {
                        return resolve({ status: 'fail', data: { error_message: response.payment_error } });
                    } else {
                        response.payment_preimage_str = Buffer.from(response.payment_preimage).reverse().toString('hex');
                        return resolve({ status: 'success', data: response });
                    }
                }                
            });
        });

        return await call;
    },


//{
//	"r_hash": {
//		"type": "Buffer",
//		"data": [
//			164,
//			171,
//			224,
//			142,
//			194,
//			39,
//			94,
//			29,
//			51,
//			37,
//			254,
//			50,
//			222,
//			55,
//			30,
//			89,
//			189,
//			98,
//			241,
//			111,
//			45,
//			127,
//			62,
//			78,
//			24,
//			72,
//			80,
//			38,
//			128,
//			154,
//			246,
//			119
//		]
//	},
//	"payment_request": "lntb90600n1pdz75kapp55j47prkzya0p6ve9lcedudc7tx7k9ut094lnunscfpgzdqy67emsdq8w3jhxaqcqzysa5huujgyt0cxlxcn26rap2lt2cdzszx6gvu5wddlpl6smp87m9jj0rn886zutdgg688d5qvd74ws3akcxem0j72tu9h8yrldjheq0vcpsesnaa"
//}
    addInvoice: async function (amount, memo) {
        if (!Number(amount) || Number(amount) < 1) {
            return { status: 'fail', data: { error_message: 'Amount value is not valid.' } };
        }
        var client = await this.getLightningClient();
        if (client.status == 'fail') return client;

        var options = {};
        options["memo"] = memo;
        options["value"] = Number(amount);
        var timeout = new Date().setSeconds(new Date().getSeconds() + timeout_in_seconds);

        var call = new Promise((resolve) => {
            client.data.client.addInvoice(options, client.data.metadata, { deadline: timeout }, function (err, response) {
                if (err)
                    return resolve({ status: 'fail', data: { error_message: err.message } });
                else
                    return resolve({ status: 'success', data: response });
            });
        });

        return await call;
    },

    //data will be like:
    // { "peer_id" : 0 }
    connectPeer: async function (addr_string, perm) {
        var remote_addr = await this.validateLightningAddress(addr_string);
        if (remote_addr.status == 'fail') return remote_addr;

        var client = await this.getLightningClient();
        if (client.status == 'fail') return client;

        perm = (/true/i).test(perm);
        var timeout = new Date().setSeconds(new Date().getSeconds() + timeout_in_seconds);

        var call = new Promise((resolve) => {
            client.data.client.connectPeer({
                addr: { pubkey: remote_addr.data.pubkey, host: remote_addr.data.host }, perm: perm
            }, client.data.metadata, {deadline:timeout}, function (err, response) {
                if (err)
                    return resolve({ status: 'fail', data: { error_message: err.message } });
                else
                    return resolve({ status: 'success', data: response });
            });
        });

        return await call;
    },

    //data will be like:
    // { "peer_id" : 0 }
    disconnectPeer: async function (addr_string, perm) {
        var remote_addr = await this.validateLightningAddress(addr_string);
        if (remote_addr.status == 'fail') return remote_addr;

        var client = await this.getLightningClient();
        if (client.status == 'fail') return client;
        
        var timeout = new Date().setSeconds(new Date().getSeconds() + timeout_in_seconds);

        var call = new Promise((resolve) => {
            client.data.client.disconnectPeer({
                pub_key: remote_addr.data.pubkey
            }, client.data.metadata, { deadline: timeout }, function (err, response) {
                if (err)
                    return resolve({ status: 'fail', data: { error_message: err.message } });
                else
                    return resolve({ status: 'success', data: response });
            });
        });

        return await call;
    },

    //data will be like:
    //{
    //    "peers": [
    //        {
    //            "pub_key": "02f6d66509f7ef98d9470ab5dc3998f8785112c545f86e50b9811772a9166f99dc",
    //            "peer_id": 3,
    //            "address": "136.144.149.95:9735",
    //            "bytes_sent": "1549150",
    //            "bytes_recv": "2164075",
    //            "sat_sent": "0",
    //            "sat_recv": "0",
    //            "inbound": true,
    //            "ping_time": "12000"
    //        },
    //        {
    //            "pub_key": "02dc5e775414dd2167049200298632d5e2e68593f729298cf3945e60ab4d62fcc7",
    //            "peer_id": 189,
    //            "address": "73.18.155.253:9735",
    //            "bytes_sent": "1167332",
    //            "bytes_recv": "1519617",
    //            "sat_sent": "0",
    //            "sat_recv": "0",
    //            "inbound": true,
    //            "ping_time": "125000"
    //        }
    //    ]
    //}
    listPeers: async function () {
        var client = await this.getLightningClient();
        if (client.status == 'fail') return client;
        var timeout = new Date().setSeconds(new Date().getSeconds() + timeout_in_seconds);

        var call = new Promise((resolve) => {
            client.data.client.listPeers({}, client.data.metadata, { deadline: timeout }, function (err, response) {
                if (err)
                    return resolve({ status: 'fail', data: { error_message: err.message } });
                else                
                    return resolve({ status: 'success', data: response });
            });
        });
        return await call;
    },

    listChannels: async function () {
        var client = await this.getLightningClient();
        if (client.status == 'fail') return client;
        var timeout = new Date().setSeconds(new Date().getSeconds() + timeout_in_seconds);

        var call = new Promise((resolve) => {
            client.data.client.listChannels({}, client.data.metadata, {deadline:timeout}, function (err, response) {
                if (err)
                    return resolve({ status: 'fail', data: { error_message: err.message } });
                else
                    return resolve({ status: 'success', data: response });
            });
        });
        return await call;
    },

    pendingChannels: async function () {
        var client = await this.getLightningClient();
        if (client.status == 'fail') return client;
        var timeout = new Date().setSeconds(new Date().getSeconds() + timeout_in_seconds);

        var call = new Promise((resolve) => {
            client.data.client.pendingChannels({}, client.data.metadata, {deadline:timeout}, function (err, response) {
                if (err)
                    return resolve({ status: 'fail', data: { error_message: err.message } });
                else
                    return resolve({ status: 'success', data: response });
            });
        });
        return await call;
    },

    listInvoices: async function (pending_only) {
        var client = await this.getLightningClient();
        if (client.status == 'fail') return client;
        var timeout = new Date().setSeconds(new Date().getSeconds() + timeout_in_seconds);

        pending_only = (/true/i).test(pending_only);

        var call = new Promise((resolve) => {
            client.data.client.listInvoices({ pending_only: pending_only }, client.data.metadata, {deadline:timeout}, function (err, response) {
                if (err)
                    return resolve({ status: 'fail', data: { error_message: err.message } });
                else
                    return resolve({ status: 'success', data: response });
            });
        });
        return await call;
    },

    listPayments: async function () {
        var client = await this.getLightningClient();
        if (client.status == 'fail') return client;
        var timeout = new Date().setSeconds(new Date().getSeconds() + timeout_in_seconds);

        var call = new Promise((resolve) => {
            client.data.client.listPayments({}, client.data.metadata, {deadline:timeout}, function (err, response) {
                if (err)
                    return resolve({ status: 'fail', data: { error_message: err.message } });
                else
                    return resolve({ status: 'success', data: response });
            });
        });
        return await call;
    },

}