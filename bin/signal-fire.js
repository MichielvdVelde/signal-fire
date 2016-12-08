#!/usr/bin/env node

const program = require('commander')
const pkg = require('../package.json')

const Server = require('../lib/Server')

program
  .version(pkg.version)
  .option('-p, --port [port]', 'Port to listen on [8080]', 8080)
  .option('-v, --verbose', 'Show verbose output')
  .parse(process.argv)

const server = new Server({
  port: program.port
})

if (program.verbose) {
  server.on('add_peer', peer => {
    console.log(`- Peer added with id ${peer.peerId}`)
  })
  server.on('remove_peer', peer => {
    console.log(`- Peer removed with id ${peer.peerId}`)
  })
}

server.start().then(() => {
  console.log(`signal-fire instance started on port ${program.port}`)
  console.log('press ctrl+c to stop')
  if (program.verbose) {
    console.log()
    console.log('verbose output is enabled...')
  }
}).catch(err => {
  console.log(`error starting signal-fire server: ${err.message}`)
})
