import express from "express";
import {
  getSellerInvoiceReport,
  getSellerReportSummary,
} from "../../controllers/reports/reportController.js";
import { getSellerAnalytics } from "../../controllers/analyticsController.js";

const router = express.Router();

router.get("/summary", getSellerReportSummary);
router.get("/invoices", getSellerInvoiceReport);
router.get("/analytics", getSellerAnalytics);

export default router;
