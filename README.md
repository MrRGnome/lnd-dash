# LND Dashboard

This is a dashboard for interacting with and inspecting your `lnd` node. You can play with a public testnet example at https://lnddash.com

## Disclaimer

This project was originally adopted from http://lnd.fun. You may find some bugs.

LND-Dash is in its infancy. It is not recommended you run it on mainnet unless you are #reckless. Please help get this project to maturity by opening a pull request or issue!

## Features

+ https web service, can be configured to listen to local addresses or public addresses making your lnd dashboard securely available to other devices
+ user management including macaroon permission management
+ detailed dashboard
+ channel management including commit_fee accounting only for your own opened channels (fixes dynamic balance display issues in other wallets)
+ send payment with automatic invoice decoding and pasting if detected on the clipboard and permissions given
+ create invoice with automatic clipboard loading on invoice generation
+ notifications web API integration
+ websocket streaming of lnd events like invoice paid
+ peer management
+ cross platform (needs testing on *nix please)
+ PWA compatability, can be installed on mobile devices

## TODO

+ testing
+ more websocket routes fewer instances of polling
+ refactor reused code
+ better UX for most pages
+ monitor and rank node/channel reliability
+ channel value rating based on throughput, channel graph comparing existing routes, and fwding history
+ channel management suggestions and automation
+ explorable channel graph
+ lnd explorer search bar - get details on node, channel, etc
+ bitcoind explorer search bar - get details on node, address, txid, etc
+ bitcoind mempool graph
+ lnd node state management - starting, stopping, editing config
+ bitcoind node state management - starting, stopping, editing config
+ lightning protocol handlers registration on local devices
+ lightning protocol handlers registration on PWA devices (is this possible?)
+ public readonly example website
+ lnd log reading
+ bitcoind log reading
+ sphinx transaction sending (no invoice required payments)
+ watchtower support and management
+ WHATEVER FEATURES YOU WANT! PULL REQUESTS ACCEPTED!

## Getting started

This assumes you have a running `lnd` node on the Bitcoin testnet, using default macaroon authentication. It also requires you have yarn and nodejs installed, you can find nodejs at https://nodejs.org/en/download/ and yarn at https://yarnpkg.com/lang/en/docs/install/

```bash
$ yarn install
```

The install scripts will help you create configuration files for LND dashboard including users and their permissions as well as whitelisted IP addresses. Once completed to start the dashboard use:

```bash
$ yarn start
```

Unless specified in the configuration file config.json or during the install process LND Dashboard will run on testnet. To run on mainnet pass the argument "--mainnet"

```bash
$ yarn start --mainnet
```
To reconfigure your node you can run the following at anytime to regenerate yoru config.json file

```bash
$ node install/setup
```

You can also edit the root config.json file directly after it is generated. You can find an example below:

```bash
{
	"host": "127.0.0.1",
	"network": "testnet",
	"whitelist": [
		"127.0.0.1",
		"::1",
		"localhost"
	],
	"disableWhitelist": false,
	"guiport": 8888,
	"lnd_daemon": "127.0.0.1:10009",
	"users": [
		{"usename": "user", "password": "donotmanuallyinputpasswords,theyarehashes", "permission":"admin"}
    ],
	"enableUnauthorizedAccess": false,
	"unauthorizedAccessPermission": readonly,
    "cookieSecret": "dontmanuallyinput",
    "salt": "dontmanuallyinput"
	"tlsCert": undefined,
	"tlsKey": undefined,
	"tlsCA": undefined,
	"enableHttpRedirect": false,
	"httpRedirectPort": 80
}
```

'host' is the IP to listen to (set 0.0.0.0 to listen to all ipv4 - unrecommended and potential security issue)

'network' is the desired network to run on and implied location to look for macroons (non default macroon paths not yet supported)

'whitelist' is the requesting IP addresses allowed to interact with the wallet and dashboard, by default only local addresses.

'disableWhitelist' disabling the whitelist is dangerous, advanced users setting up a public service only. Valid values are true, false, or undefined.

'guiport' is the port the dashboard GUI is hosted on

'lnd_daemon' is the location of your lightning nodes gRPC port

'users' is an array of users and their permissions. Valid permissions are 'admin', 'invoice', and 'readonly'. Users passwords should not be manually changed.

'enableUnauthorizedAccess' do not enable unauthorize access unless you fully understand unauthorized users can at least see your dashboard and at worst steal your tokens. Do not change from false. Valid values are false and true.

'unauthorizedAccessPermission' will allow unauthorized acces to your dashboard and wallet. Do not change from undefined. Possible values are undefined, 'admin', 'invoice', and 'readonly'.

'cookieSecret' is used to sign authentication cookies and should be autogenerated by the install process. Do not change.

'salt' is the password salt used for hashing user passwords and is autogenerated by the install process. Do not change.

'tlsCert' is a custom tls.crt/pem certificate file for the addresses lnd dashboard will be listening on. Leave undefined to use the certificates found in the lnd directory.

'tlsKey' is a custom tls.key/pem key file for the addresses lnd dashboard will be listening on. Leave undefined to use the certificates found in the lnd directory.

'tlsCA' is the full certificate chain pem file for the addresses lnd dashboard will be listening on. Leave undefined to use the certificates found in the lnd directory.

'enableHttpRedirect' will enable an http server to forward to https port 443. Only necessary if enabling public access.

'httpRedirectPort' is the port to listen for http connections on. Only necessary if enabling http to https redirects.

:zap: Go to [`https://127.0.0.1:8888`](https://127.0.0.1:8888), and you're done! :zap: