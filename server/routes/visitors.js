import express from "express";

import {
  registerVisitor,
  checkInVisitor,
  checkOutVisitor,
  getVisitors,
  getVisitorById,
  getVisitorReport,
  checkOverstayedVisitors
} from "../controllers/visitorController.js";

const router = express.Router();

// Routes


router.post('/', registerVisitor);
router.patch('/:id/checkin', checkInVisitor);
router.put('/:id/checkout', checkOutVisitor);
router.get('/', getVisitors);
router.get('/:id', getVisitorById);
router.get('/reports/visitors', getVisitorReport);
router.get('/alerts/overstayed', checkOverstayedVisitors);

export default router;
