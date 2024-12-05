const socketIO = require("socket.io");
const { createServer } = require("http");

// Initialize Socket.IO

const initializeSocket = (server) => {
  let io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

// Socket.IO instance for handling real-time connections and events
const io = initializeSocket(createServer());

module.exports = { io };
