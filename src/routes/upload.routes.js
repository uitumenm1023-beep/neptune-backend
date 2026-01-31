// server/src/routes/upload.routes.js
const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Cloudinary config (from Render env vars)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage (no disk writes on Render)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Helper: upload buffer to Cloudinary
function uploadBufferToCloudinary(buffer, opts = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "neptune/uploads",
        resource_type: "image",
        ...opts,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

// POST /api/upload  (field name must be "image")
router.post("/", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      // optional: keep filenames cleaner
      // public_id: `img_${Date.now()}`,
    });

    // secure_url is https and CDN-backed
    res.json({ ok: true, imageUrl: result.secure_url });
  } catch (err) {
    console.error("CLOUDINARY UPLOAD ERROR:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
