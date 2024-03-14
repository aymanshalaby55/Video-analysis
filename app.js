require("dotenv").config({ path: ".env" });
const cookieParser = require("cookie-parser");
const express = require("express");
const mongoose = require("mongoose");

const videoRouts = require("./routers/videoRouts");
const userRoutes = require("./routers/userRoutes");
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT || 4040;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
  });

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/video", videoRouts);

app.listen(PORT, () => {
  console.log("listening on port", PORT);
});

