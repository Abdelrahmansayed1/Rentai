import express from "express";
import {
  createManager,
  getManager,
  getManagerProperties,
  updateManager,
} from "../controllers/manager-controller.js";

const router = express.Router();

router.get("/:cognitoId", getManager);
router.put("/:cognitoId", updateManager);
router.post("/", createManager);
router.get("/:cognitoId/properties", getManagerProperties);

export default router;
