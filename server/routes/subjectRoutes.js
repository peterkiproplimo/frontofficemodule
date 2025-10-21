import express from "express";
import {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectsByCategory,
  getSubjectsByLevel,
  toggleSubjectStatus
} from "../controllers/subjectController.js";

const router = express.Router();

// Subject routes
router.get("/", getSubjects);
router.get("/:id", getSubject);
router.post("/", createSubject);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);
router.patch("/:id/toggle-status", toggleSubjectStatus);

// Filtered routes
router.get("/category/:category", getSubjectsByCategory);
router.get("/level/:level", getSubjectsByLevel);

export default router;
