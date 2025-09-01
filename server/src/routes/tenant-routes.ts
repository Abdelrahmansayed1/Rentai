import express from "express";
import {
  createTenant,
  getTenant,
  updateTenant,
} from "../controllers/tenant-controller.js";

const router = express.Router();

router.get("/:cognitoId", getTenant);
router.put("/:cognitoId", updateTenant);
router.post("/", createTenant);

export default router;
