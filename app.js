require("dotenv").config({ path: ".env" });
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const { createServer } = require("http");
const { initializeSocket } = require("./utils/socket");

// Import routes
const videoRouter = require("./routers/videoRouts");
const userRouter = require("./routers/userRoutes");
const aiModelRouter = require("./routers/AiModelsRoutes");
const aiCallRoutes = require("./routers/aiCallsRoutes");

// Create Express app and HTTP server
const app = express();
const httpServer = createServer(app);
const io = initializeSocket(httpServer);
// Comprehensive CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000", // Use env variable for flexibility
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/models", aiModelRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/aiCalls", aiCallRoutes);

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start the server
const PORT = process.env.PORT || 4040;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
