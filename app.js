require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const errorHandler = require("./middleware/errorHandler");
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "EventPulse API is running",
  });
});
app.get("/health", async (req, res) => {
  const mongoose = require("mongoose");
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    res.json({
      status: "success",
      server: "running",
      database: "connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      server: "running",
      database: "disconnected",
    });
  }
});
app.use(errorHandler);
module.exports = app;