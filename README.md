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
  * Uses [ws](https://github.com/websockets/ws) for light-weight communication
  * Messages are passed using simple JSON objects
* **Automatic peer ID generation** (also possible to provide your own method)
* **Completely automatic** routing of messages
* **Supports one-to-one, one-to-many and many-to-many** out of the box
* **Horizontally scalable**
  * **Relays** use any publish-subscribe messaging back-end (Redis, MQTT, ...)
  * It's simple to write a relay for a new back-end
* Uses **ES6** syntax and has been tested on **node.js v7.1.0**

### Roadmap

* Improve error handling
  * What to do with messages for unknown `peerId`s?
* Provide an authentication mechanism
  * Ability to enable or disable authentication
  * Get the peerId for an authenticated client from a remote source, e.g. a database
* Improve documentation
* Add more relays
  * MQTT

### Install

You can install signal-fire using **npm**:

```bash
npm install signal-fire
```

### Usage

#### Setting up the server

For the moment you will have to set up the server yourself. In a next version
a CLI command will be added to allow you to set up a generic server fast.

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
  console.log('Added peer with peerId ' + peer.peerId)
})

server.on('remove_peer', peerId => {
  console.log('Removed peer with peerId ' + peerId)
})

server.start().then(() => {
  console.log('Server started')
})
```

That's all there is to it!

#### Communicating with the server

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

In order to communicate with another peer, you only need to include `peerId` in
your message, like so:

```js
// `otherPeerId` is the peerId of another client connected to the server

signalServer.send({
  peerId: otherPeerId,
  key: 'value'
})
```

By adding the `peerId` key to your outgoing messages the server will route
the messages to their intended destination (provided a peer with the provided
peerId is connected to the server as well).

Now you can use the channel to pass ICE candidates etc.

### Relays

Relays can be used to horizontally scale the server. Relays use a publish-subscribe
messaging back-end to route messages between different instances of the server.

Currently these relays are available:

| Module | Back-end | Notes |
|---|---|---|
| [signal-fire-relay-redis](https://github.com/MichielvdVelde/signal-fire-relay-redis) | Redis | Can be used as reference implementation

#### Using relays

**Relays** are how signal-fire scales. In simple terms, a relay is a module
that uses a publish-subscribe messaging channel to route messages between multiple
instances of the signaling server.

Any message meant for a peerId not on the local instance will be given to the relay.
Here is an example of how to add a relay (using [the Redis relay](https://github.com/MichielvdVelde/signal-fire-relay-redis)):

```js
const Server = require('signal-fire').Server
const Relay = require('signal-fire-relay-redis').Relay

const relay = new Relay({
  // These options are passed to `node_redis`
})

// Set up the server with the relay
const server = new Server({
  port: 8080,
  relay: relay
})

// ...
```

If you want to write your own relay, you can use [the Redis relay](https://github.com/MichielvdVelde/signal-fire-relay-redis) as a reference
implementation.

[![Standard - JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

### License

Copyright 2016 [Michiel van der Velde](http://www.michielvdvelde.nl).

This software is licensed under the [MIT License](LICENSE).
