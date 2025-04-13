// In order to use socket.io with the app router, we have to use a custom server
// Unbelievable. How is the app router so unfinished

const { createServer } = require('http')
const { parse } = require('url')

const next = require('next')
const { Server } = require("socket.io")

const { initWsServer } = require('./src/lib/ws/lib')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

let port
if (dev) {
    port = process.argv[2] ? process.argv[2] : 3000
} else {
    port = process.argv[2] ? process.argv[2] : 80
}

app.prepare().then(() => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true)
        handle(req, res, parsedUrl)
    });

    const io = new Server(server)
    io.on('connection', socket => initWsServer(socket, io))

    server.listen(port, (err) => {
        if (err) throw err
        console.log('> Ready on http://localhost:' + port)
    })
})