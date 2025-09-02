import express from "express";

import { authMiddleware } from "../middleware/auth-middleware.js";
import {
  getApplications,
  createApplication,
  updateApplicationStatus,
} from "../controllers/application-controller.js";

const router = express.Router();

router.get("/", authMiddleware(["manager", "tenant"]), getApplications);
router.post("/", authMiddleware(["tenant"]), createApplication);
router.put("/:id/status", authMiddleware(["manager"]), updateApplicationStatus);

export default router;
