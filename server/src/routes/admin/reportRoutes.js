import express from "express";
import {
  getAdminInvoiceReport,
  getAdminReportSummary,
} from "../../controllers/reports/reportController.js";
import { getAdminAnalytics } from "../../controllers/analyticsController.js";

const router = express.Router();

router.get("/summary", getAdminReportSummary);
router.get("/invoices", getAdminInvoiceReport);
router.get("/analytics", getAdminAnalytics);

export default router;
