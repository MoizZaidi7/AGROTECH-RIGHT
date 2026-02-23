import express from "express";
import {
  getUserEngagementReport,
  getWebAnalyticsReport,
  getSalesReport,
  trackPageView,
} from "../controllers/ReportController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";
import { updateLastActivity } from "../middleware/lastactivity.js";
import { checkInactivity } from "../middleware/inactivity.js";

const ReportRouter = express.Router();

ReportRouter.use(updateLastActivity);

// Public route for page tracking (no auth required)
ReportRouter.post("/track-page", trackPageView);

// Protect report routes with auth and admin authorization
ReportRouter.use(authMiddleware, authorize(['Admin']));

ReportRouter.get("/user-engagement", getUserEngagementReport); // User engagement report
ReportRouter.get("/web-analytics", getWebAnalyticsReport); // Web analytics report
ReportRouter.get("/sales-report", getSalesReport); // Sales and revenue report

export default ReportRouter;
