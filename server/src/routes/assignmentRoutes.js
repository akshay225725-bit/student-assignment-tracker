const express = require("express");
const router = express.Router();

const {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment
} = require("../controllers/assignmentController");

// Get all assignments
router.get("/", getAssignments);

// Get one assignment
router.get("/:id", getAssignmentById);

// Create an assignment
router.post("/", createAssignment);

// Update an assignment
router.put("/:id", updateAssignment);

// Delete an assignment
router.delete("/:id", deleteAssignment);

module.exports = router;