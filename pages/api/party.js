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

  const onConnection = (socket) => {
    socket.on("join", room => {
      console.log(`joining ${room}`)
      socket.join(room)
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
  }

  // Define actions inside
  io.on("connection", onConnection)

  console.log("Setting up socket")
  res.end();
}