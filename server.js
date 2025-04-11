// In order to use socket.io with the app router, we have to use a custom server
// Unbelievable. How is the app router so unfinished

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require("socket.io")
const prisma = require('./src/lib/prisma.js')

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

    io.on('connection', (socket) => {
        let users = {}

        socket.on("join", (username, room) => {
            console.log(`${username} joining ${room}`)
            users[socket.id] = { username: username, room: room }
            socket.join(room)
            io.sockets.in(room).emit("sysmessage", `${username} has joined the room!`)
            // io.sockets.in(room).emit("setUsers", getUsersInRoom(users, room))
        })

        socket.on("play", room => {
            socket.in(room).emit("play")
        })
        socket.on("pause", room => {
            socket.in(room).emit("pause")
        })
        socket.on("seek", (time, room) => {
            console.log('seek', time)
            socket.in(room).emit("seek", time)
        })

        socket.on('disconnect', () => {
            const roomId = users[socket.id]["room"]

            io.sockets.in(roomId).emit("sysmessage", `"${users[socket.id]["username"]}" has left the room.`)
            delete users[socket.id]
            // io.sockets.in(roomId).emit("setUsers", getUsersInRoom(users, roomId))

            // Delete room from DB if no more connections left
            if (!io.sockets.adapter.rooms.get(roomId)) {
                fetch(`${process.env.NEXTAUTH_URL}/api/room/${roomId}`, {
                    method: "DELETE",
                    headers: {
                        'Authorization': `Bearer ${process.env.NEXTAUTH_SECRET}`
                    },
                })
            }
        })
    })

    server.listen(port, (err) => {
        if (err) throw err
        console.log('> Ready on http://localhost:' + port)
    })
})