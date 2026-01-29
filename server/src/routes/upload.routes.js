// server/src/routes/upload.routes.js
const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

/**
 * Always save uploads inside:
 * <project-root>/public/assets/uploads
 * Works locally + on Render.
 */
const uploadDir = path.join(process.cwd(), "public", "assets", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// POST /api/upload  (field name must be "image")
router.post("/", requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });

  console.log("Saved file to:", req.file.path);

  // store this in DB
  const imageUrl = `/assets/uploads/${req.file.filename}`;
  res.json({ ok: true, imageUrl });
});

module.exports = router;
