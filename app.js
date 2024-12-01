require("dotenv").config({ path: ".env" });
const cookieParser = require("cookie-parser");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
// Import routes

const videoRouter = require("./routers/videoRouts");
const userRouter = require("./routers/userRoutes");
const aiModelRouter = require("./routers/AiModelsRoutes");

const app = express();
const httpServer = createServer(app);

// Comprehensive CORS configuration
const corsOptions = {
  origin: "http://localhost:3000", // Specific origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Socket.IO configuration with CORS
const io = new Server(httpServer, {
  cors: corsOptions,
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// // Socket.IO connection handler
// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   socket.on("message", (data) => {
//     console.log("Message received:", data);
//     // Broadcast to all clients including sender
//     io.emit("message", data);
//   });

//   socket.on("model-1", () => {
//     socket.emit("status", success);
//   });
// });

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes (as in your original code)
// API routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/models", aiModelRouter);
app.use("/api/v1/videos", videoRouter);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Handle undefined routes
app.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

const PORT = process.env.PORT || 4040;

// Use httpServer.listen instead of app.listen to support Socket.IO
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
