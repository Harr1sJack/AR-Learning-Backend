import express from "express";
import multer from "multer";
import { handleVision } from "../controllers/visionController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post("/", upload.single("image"), handleVision);

export default router;