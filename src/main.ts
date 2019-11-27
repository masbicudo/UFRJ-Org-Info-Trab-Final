import * as fastify from 'fastify'
import * as fastifyStatic from "fastify-static";
import { Server, IncomingMessage, ServerResponse } from 'http'
import * as sourceMapSupport from "source-map-support"
import * as path from 'path'
import * as fs from 'fs'
import * as url from 'url'
import * as lockfile from 'proper-lockfile'

sourceMapSupport.install()

type Plugin = (fastify: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>, options: fastify.FastifyContext, next: () => void) => void

const fn: Plugin = (fastify, options, next) => {
    fastify.register(require('fastify-static'), {
        root: path.join(__dirname, ''),
        prefix: '/', // optional: default '/'
    })

    // route for index
    fastify.get('/', function (req, reply) {
        reply.sendFile('static/index.html')
    })

    // routes for resources
    fastify.get('/app.js', function (req, reply) {
        reply.sendFile('client/app.js')
    })
    fastify.get('/no-react.js', function (req, reply) {
        reply.sendFile('static/no-react.js')
    })
    fastify.get('/app.css', function (req, reply) {
        reply.sendFile('static/app.css')
    })

    // routes for the api
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
        await fs.promises.writeFile(path.join(__dirname, 'data/' + request.params.id + '.json'), JSON.stringify(request.body))
        return {}
    })
    fastify.put(
        '/api/items',
        // { preValidation: [], schema: { body: { type: "object" } } },
        async (request, reply) => {
            const release = await lockfile.lock(path.join(__dirname, "data/items.json"))
            try {
                var next_id: number
                {
                    const buf = await fs.promises.readFile(path.join(__dirname, 'data/items.json'))
                    const items = JSON.parse(buf.toString()) as string[]
                    next_id = items.length + 1
                    items.push(request.body.name)
                    console.log(typeof items)
                    await fs.promises.writeFile(path.join(__dirname, 'data/items.json'), JSON.stringify(items))
                }
            }
            finally {
                release()
            }

            await fs.promises.writeFile(path.join(__dirname, 'data/' + next_id + '.json'), JSON.stringify(request.body))
            return { id: next_id }
        })

    // routes for source-map files
    fastify.get('/:fname.js.map', async function (req, reply) {
        if (req.raw.url) {
            const uri = url.parse(req.raw.url)
            for (let dir of ["client", "static"]) {
                const fpath = dir + uri.pathname
                try {
                    // the following line throws if file does not exist
                    const stat = await fs.promises.stat(path.join(__dirname, fpath))
                    reply.sendFile(fpath)
                    return
                }
                catch (ex) { }
            }
        }
        reply.code(404).type('text/html').send('Not Found')
    })

    next()
}

module.exports = fn