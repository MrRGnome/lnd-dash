# LND Dashboard

This is a dashboard for interacting with and inspecting your `lnd` node.

## Disclaimer

This project was a bit of a mess when I originally adopted it from http://lnd.fun. A lot of hard coded values such as macroon paths may result in it not working on all custom installations or operating systems. While many of these values have been already moved to the new config.json file some haven't.

Please submit PR's for these issues as you come across them. At the moment this is only tested on a Windows 10/lnd/bitcoind stack but the intent is to get it working universally on top of any lnd node.

## Getting started

This assumes you have a running `lnd` node on the Bitcoin testnet, using default macaroon authentication.

```bash
$ yarn install
$ yarn start
```

Unless specified LND Dashboard will run on testnet. To run on mainnet pass the argument "--mainnet"
```bash
$ yarn start --mainnet
```

You can further congifure LND Dashboard using the root config.json file though configurations are overwritten by command line options

```bash
{
	"host": "127.0.0.1",
	"network": "testnet",
	"whitelist": [
		"127.0.0.1",
		"::1",
		"localhost"
	],
	"guiport": 8888,
	"lnd_daemon": "127.0.0.1:10009"
}
```

'host' is the IP to listen to (leave blank to listen to all - unrecommended and potential security issue)

'network' is the desired network to run on and implied location to look for macroons (non default macroon paths not yet supported)

'whitelist' is the requesting IP addresses allowed to interact with the wallet, by default only local addresses.

'guiport' is the port the dashboard GUI is hosted on

'lnd_daemon' is the location of your lightning nodes gRPC port


:zap: Go to [`127.0.0.1:8888`](http://127.0.0.1:8888), and you're done! :zap: