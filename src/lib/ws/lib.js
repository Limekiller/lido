const setUsersInRoom = async (username, roomId, action) => {
    let response = await fetch(`${process.env.NEXTAUTH_URL}/api/room/${roomId}`, {
        method: "POST",
        body: JSON.stringify({
            username: username,
            action: action
        }),
        headers: {
            'Authorization': `Bearer ${process.env.NEXTAUTH_SECRET}`
        },
    })
    response = await response.json()
    return response.data.users
}

export const initWsServer = (socket, io) => {
    var user, roomId

    socket.on("join", (username, room) => {
        user = username
        roomId = room

        console.log(`${username} joining ${room}`)
        socket.join(room)
        io.sockets.in(room).emit("sysmessage", `${username} has joined the room!`)
        setUsersInRoom(username, room, 'add')
            .then(data => {
                io.sockets.in(room).emit("setUsers", data)
            })
    })

    socket.on("play", room => {
        socket.in(room).emit("play")
    })
    socket.on("pause", room => {
        socket.in(room).emit("pause")
    })
    socket.on("seek", (time, room) => {
        socket.in(room).emit("seek", time)
    })
    socket.on("message", (username, message, room) => {
        io.sockets.in(room).emit("message", username, message)
    })
    socket.on("sysmessage", (message, room) => {
        io.sockets.in(room).emit("sysmessage", message)
    })

    socket.on('disconnect', () => {
        io.sockets.in(roomId).emit("sysmessage", `${user} has left the room.`)
        setUsersInRoom(user, roomId, 'remove')
            .then(data => {
                io.sockets.in(roomId).emit("setUsers", data)
            })

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
}