import express from "express";
import {
  getCompetencies,
  getCompetency,
  createCompetency,
  updateCompetency,
  deleteCompetency,
  getCompetenciesByCategory,
  getCompetenciesByLevel,
  getCompetenciesBySubject,
  toggleCompetencyStatus,
  getCompetencyStats
} from "../controllers/competencyController.js";

const router = express.Router();

// Competency routes
router.get("/", getCompetencies);
router.get("/stats", getCompetencyStats);
router.get("/:id", getCompetency);
router.post("/", createCompetency);
router.put("/:id", updateCompetency);
router.delete("/:id", deleteCompetency);
router.patch("/:id/toggle-status", toggleCompetencyStatus);

// Filtered routes
router.get("/category/:category", getCompetenciesByCategory);
router.get("/level/:level", getCompetenciesByLevel);
router.get("/subject/:subjectId", getCompetenciesBySubject);

export default router;
