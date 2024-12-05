const socketIO = require("socket.io");

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
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

const getSocketIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

module.exports = { initializeSocket, getSocketIO };
