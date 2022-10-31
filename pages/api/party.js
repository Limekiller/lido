import { Server } from "socket.io";

export default function SocketHandler(req, res) {
  // If the room param is passed, return a 401 if the room doesn't exist. Otherwise continue
  if (req.query.room) {
    if (!res.socket.server.io.sockets.adapter.rooms.has(req.query.room)) {
      res.status(401).end()
      return
    }
  }

  if (res.socket.server.io) {
    res.end()
    return
  }

  const io = new Server(res.socket.server)
  res.socket.server.io = io

  let users = {}

  const onConnection = (socket) => {
    socket.on("join", (username, room) => {
      console.log(`joining ${room}`)
      users[socket.id] = {username: username, room: room}
      socket.join(room)
      io.sockets.in(room).emit("sysmessage", `"${username}" has joined the room!`)
      io.sockets.in(room).emit("setUsers", getUsersInRoom(users, room))
    })
    socket.on("disconnect", () => {
      const roomId = users[socket.id]["room"]
      io.sockets.in(roomId).emit("sysmessage", `"${users[socket.id]["username"]}" has left the room.`)
      delete users[socket.id]
      io.sockets.in(roomId).emit("setUsers", getUsersInRoom(users, roomId))
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
  }

  // Define actions inside
  io.on("connection", onConnection)

  console.log("Setting up socket")
  res.end();
}

const getUsersInRoom = (users, room) => {
  let userList = []
  for (const user in users) {
    if (users[user].room === room) {
      userList.push(users[user].username)
    }
  }
  return userList
}