const express = require("express");
const db = require("../utils/db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// PUBLIC: GET /api/categories
router.get("/", (req, res) => {
  db.all("SELECT * FROM categories ORDER BY name ASC", (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
});

// ADMIN: POST /api/categories
router.post("/", requireAdmin, (req, res) => {
  const { name } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: "Missing name" });

  db.run("INSERT INTO categories (name) VALUES (?)", [name.trim()], function (err) {
    if (err) {
      if (String(err).includes("UNIQUE")) return res.status(409).json({ error: "Category exists" });
      return res.status(500).json({ error: "Insert failed" });
    }
    res.json({ ok: true, id: this.lastID });
  });
});

// ADMIN: DELETE /api/categories/:id
router.delete("/:id", requireAdmin, (req, res) => {
  db.run("DELETE FROM categories WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: "Delete failed" });
    res.json({ ok: true });
  });
});

module.exports = router;
