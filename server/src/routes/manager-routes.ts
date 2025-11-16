import express from "express";
import {
  createManager,
  updateManager,
} from "../controllers/manager-controller.js";

const router = express.Router();

// Protected routes only - GET routes are handled publicly in index.ts
router.put("/:cognitoId", updateManager);
router.post("/", createManager);

export default router;
