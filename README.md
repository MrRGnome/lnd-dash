# LND Dashboard

This is a dashboard for interacting with and inspecting your `lnd` node.

## Getting started

This assumes you have a running `lnd` node on the Bitcoin testnet, using macaroon authentication.

```bash
$ yarn install
$ yarn start
```

Unless specified LND Dashboard will run on testnet. To run on mainnet pass the argument "--mainnet"
```bash
$ yarn start --mainnet
```


:zap: Go to [`localhost:8888`](http://localhost:8888), and you're done! :zap: