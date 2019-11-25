import * as fastify from 'fastify'
import * as fastifyStatic from "fastify-static";
import { Server, IncomingMessage, ServerResponse } from 'http'
import * as path from 'path'

type Plugin = (fastify: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>, options: fastify.FastifyContext, next: () => void) => void

const fn: Plugin = (fastify, options, next) => {
    fastify.register(require('fastify-static'), {
        root: path.join(__dirname, ''),
        prefix: '/', // optional: default '/'
    })

    // Declaring all the routes
    fastify.get('/', function (req, reply) {
        reply.sendFile('static/index.html')
    })
    fastify.get('/app.js', function (req, reply) {
        reply.sendFile('client/app.js')
    })
    fastify.get('/app.css', function (req, reply) {
        reply.sendFile('static/app.css')
    })
    fastify.get('/api', async (request, reply) => {
        return { hello: 'home2' }
    })
    next()
}

module.exports = fn