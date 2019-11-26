import * as fastify from 'fastify'
import * as fastifyStatic from "fastify-static";
import { Server, IncomingMessage, ServerResponse } from 'http'
import * as path from 'path'

import * as fs from 'fs'

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
    fastify.get('/no-react.js', function (req, reply) {
        reply.sendFile('static/no-react.js')
    })
    fastify.get('/app.css', function (req, reply) {
        reply.sendFile('static/app.css')
    })
    fastify.get('/api/factors', async (request, reply) => {
        reply.sendFile('static/factors.json')
    })
    fastify.get('/api/item/:id', async (request, reply) => {
        try {
            console.log("reading: " + 'data/' + request.params.id + '.json')
            reply.sendFile('data/' + request.params.id + '.json')
        }
        catch {
            reply.code(404).type('text/html').send('Not Found')
        }
    })
    fastify.get('/api/items', async (request, reply) => {
        reply.sendFile('data/items.json')
    })
    fastify.post('/api/item/:id', async (request, reply) => {
        console.log("writing: " + 'data/' + request.params.id + '.json')
        console.log(request.body)
        await fs.promises.writeFile('data/' + request.params.id + '.json', request.body);
        return {}
    })
    next()
}

module.exports = fn