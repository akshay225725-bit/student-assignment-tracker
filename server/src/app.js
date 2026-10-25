const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Student Assignment Tracker API is running!"
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Student Assignment Tracker API is running!"
  });
});

// Assignment routes
const assignmentRoutes = require("./routes/assignmentRoutes");
app.use("/api/assignments", assignmentRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl
  });
});

module.exports = app;
