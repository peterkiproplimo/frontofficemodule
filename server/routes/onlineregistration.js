import express from "express";

import {

  registerOnlineApplicant,
  getAllOnlineApplicants,
  getOnlineApplicantById

} from "../controllers/onlineApplicantsController.js";

const router = express.Router();

// Routes

router.post('/', registerOnlineApplicant);

router.get("/", getAllOnlineApplicants);
// Get one applicant by ID
router.get("/:id", getOnlineApplicantById);


export default router;
