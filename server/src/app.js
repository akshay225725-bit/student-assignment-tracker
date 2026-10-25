const express = require("express");
const cors = require("cors");

const app = express();

// CORS configuration for GitHub Pages and local development
const corsOptions = {
  origin: [
    "https://akshay225725-bit.github.io",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204
};

// Apply CORS before registering any routes
app.use(cors(corsOptions));
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
