// routes/uploadRoutes.js
import express from "express";
import { uploadToCloudinary } from "../controllers/uploadController.js";

const router = express.Router();

// POST /api/upload  (form-data: file)
router.post("/", uploadToCloudinary);

export default router;
