import express from "express";

import { authMiddleware } from "../middleware/auth-middleware.js";
import multer from "multer";
import {
  getProperties,
  getProperty,
  createProperty,
} from "../controllers/property-controller.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getProperty);
router.post(
  "/",
  authMiddleware(["manager"]),
  upload.array("photos"),
  createProperty
);

export default router;
