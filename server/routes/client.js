import express from "express";

import {
  getProducts,
  getCustomers,
  getEnquiries,
  getTransactions,
  getGeography,
  createEnquiry,
  updateEnquiry
} from "../controllers/client.js";

const router = express.Router();

// Routes
router.get("/products", getProducts);
router.get("/customers", getCustomers);
router.get("/enquiries", getEnquiries);
router.post("/enquiries", createEnquiry);
router.put("/enquiries/:id", updateEnquiry);
router.get("/transactions", getTransactions);
router.get("/geography", getGeography);

export default router;
