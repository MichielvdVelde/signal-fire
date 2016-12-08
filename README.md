# WebRTC Signaling Server for node.js

[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

**signal-fire** is a **WebRTC** signaling server for **node.js**. Designed from
the ground up to use **WebSockets**, signal-fire supports horizontal scaling with
messaging back-ends such as **Redis** and **MQTT**.

A WebRTC signaling server communicates between peers to set up peer-to-peer
audio/video and/or data channels. This allows your clients to communicate directly
with each other.

At the moment, signal-fire is a work in progress. New features will be added and
current functionality will be improved in the near future. Please feel welcome
to contribute!

### Features

* **WebSockets powered WebRTC signaling server**
  * Use [ws](https://github.com/websockets/ws) or [µWS](https://github.com/uWebSockets/uWebSockets) for easy communication
  * Messages are passed using simple JSON objects
* **Automatic peer ID generation** (also possible to provide your own method)
* **Completely automatic** routing of messages
* **Supports one-to-one, one-to-many and many-to-many** out of the box
* **Horizontally scalable**
  * **Relays** use any publish-subscribe messaging back-end (Redis, MQTT, ...)
* Uses **ES6** syntax and has been tested on **node.js v7.1.0**

### Roadmap

* Improve error handling
  * What to do with messages for unknown `peerId`s?
* Provide an authentication mechanism
  * Ability to enable or disable authentication
* Improve documentation

### Install

You can install signal-fire using **npm**:

```bash
npm install signal-fire
```

### Usage

#### Command-line usage

signal-fire is now also available as a command-line application. This allows you
to quickly start a signal-fire server instance with optional verbose output.

Currently there is no support for background jobs (i.e. a daemon), but this may
come in the future.

Install the package globally to access the cli:

```bash
npm i -g signal-fire
```

Next you can use `signal-fire` to start a server:

```bash
> signal-fire
signal-fire instance started on port 8080
press ctrl+c to stop
```

Use `-h` to view the help:

```bash
  Usage: signal-fire [options]

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    -p, --port [port]  Port to listen on [8080]
    -v, --verbose      Show verbose output
```

#### Setting up the server

The example below provides a simple example:

```js
// Require the server
const Server = require('signal-fire').Server

// Instantiate a new Server
const server = new Server({
  // These options are passed directly to ws
  port: 8080
})

server.on('add_peer', peer => {
  console.log(`Added peer with peerId ${peer.peerId}`)
})

server.on('remove_peer', peerId => {
  console.log(`Removed peer with peerId ${peerId}`)
})

server.start().then(() => {
  console.log('Server started')
})
```

That's all there is to it!

If you want to use [µWS](https://github.com/uWebSockets/uWebSockets) instead, you can set it in the options:

```js
const Server = require('signal-fire').Server
const WebSocketServer = require('uws').Server

const server = new Server({
  engine: WebSocketServer,
  port: 8080
})
```

#### Communicating with the server

**Smart move:** You can use [the signal-fire client](https://github.com/MichielvdVelde/signal-fire-client) as an easy to use
client which abstracts away the specifics of communicating with signal-fire and
the WebRTC set-up and handling.

Using the client is by no means a prerequisite; you can use the standard WebSocket
as well.

To keep everything as simple as possible, the message format of choice is JSON.
On the client side you can use **WebSocket** to connect to the server:

```js
// In the browser

// Connect to the server
const signalServer = new WebSocket('ws://example.com:8080')

signalServer.onopen = () => {
  console.log('Connection established')
}

let myPeerId = null
signalServer.onmessage = (event) {
  const msg = JSON.parse(event.data)

  // The first message received will contain our unique peerId
  if(myPeerId === null && msg.peerId) {
    myPeerId = msg.peerId
  }

  // Now you can process the messages like you usually would
  // when setting up a WebRTC peer-to-peer channel
}
```

In order to communicate with another peer, you only need to include `receiverId` in
your message, like so:

```js
// `otherPeerId` is the peerId of another client connected to the server

signalServer.send({
  receiverId: otherPeerId,
  key: 'value'
})
```

By adding the `receiverId` key to your outgoing messages the server will route
the messages to their intended destination (provided a peer with the provided
peerId is connected to the server as well).

Now you can use the channel to pass ICE candidates etc.

### Relay

If you want to run multiple instances of the server that can communicate with each
other, you can use [signal-fire-relay](https://github.com/MichielvdVelde/signal-fire-relay). It works
with common pub/sub modules such as [redis](https://github.com/NodeRedis/node_redis) and [mqtt](https://github.com/mqttjs/MQTT.js).

#### Using the relay

A **relay** can be used to scale signal-fire. A relay is a module
that uses a publish-subscribe messaging channel to route messages between multiple
instances of the signaling server.

Any message meant for a peerId not on the local instance will be given to the relay.

Below is an example of using a relay with [mqtt](https://github.com/mqttjs/MQTT.js).

```js
const Server = require('signal-fire').Server
const Relay = require('signal-fire-relay').Relay
const client = require('mqtt').createClient()

const server = new Server({
  port: 8080,
  relay: new Relay(client)
})

server.start().then(() => {
  console.log('Server started')
})

// ...
```

If you want to write your own relay, you can use [the Redis relay](https://github.com/MichielvdVelde/signal-fire-relay-redis) as a reference
implementation.

## Changelog

* v0.5.0
  * Added CLI app and documentation
* v0.4.0
  * Updated relay logic to use [signal-fire-relay](https://github.com/MichielvdVelde/signal-fire-relay)
  * WebSocket engine is now selectable
  * `error` is now re-emitted
  * Several other fixes
* v0.3.0
  * Changes to how relays work
  * Added some basic error handling
* v0.2.0
  * Exchange `peerId` for `receiverId` in routing messages
* v0.1.0
  * Initial release

[![Standard - JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

### License

Copyright 2016 [Michiel van der Velde](http://www.michielvdvelde.nl).

This software is licensed under the [MIT License](LICENSE).
