import express from "express";
import {
  getLeases,
  getLeasePayments,
} from "../controllers/lease-controller.js";
import { authMiddleware } from "../middleware/auth-middleware.js";

const router = express.Router();

router.get("/", authMiddleware(["manager", "tenant"]), getLeases);
router.get(
  "/:id/payments",
  authMiddleware(["manager", "tenant"]),
  getLeasePayments
);

export default router;
