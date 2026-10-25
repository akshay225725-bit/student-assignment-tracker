const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
// Allow requests from the GitHub Pages frontend and local development.
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Student Assignment Tracker API is running!"
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Student Assignment Tracker API is running!"
  });
});

// Import assignment routes
const assignmentRoutes = require("./routes/assignmentRoutes");

// Register assignment routes
app.use("/api/assignments", assignmentRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl
  });
});

// Export the Express app
module.exports = app;
