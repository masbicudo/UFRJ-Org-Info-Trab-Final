// Require the framework and instantiate it
import * as fastify from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'
import { AddressInfo } from 'net'
const plg = require('./main')

// Create a http server. We pass the relevant typings for our http version used.
// By passing types we get correctly typed access to the underlying http objects in routes.
// If using http2 we'd pass <http2.Http2Server, http2.Http2ServerRequest, http2.Http2ServerResponse>
const server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({ logger: true });

// Declare a route
plg(server, null, ()=>{})

var private_ip = process.argv?.[2] ?? "127.0.0.1"

// Run the server!
const start = async () => {
  try {
    await server.listen(80, private_ip)
    server.log.info(`server listening on ${(<AddressInfo>server.server.address())?.port}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}
start()