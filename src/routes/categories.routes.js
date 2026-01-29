// src/routes/categories.routes.js
const express = require("express");
const db = require("../utils/db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

/**
 * Ensure categories.image_url exists.
 * Safe: if it already exists, we ignore the error.
 */
function ensureImageUrlColumn() {
  db.run("ALTER TABLE categories ADD COLUMN image_url TEXT", [], (err) => {
    if (!err) {
      console.log("✅ Added categories.image_url column");
      return;
    }
    const msg = String(err.message || err);
    // SQLite will throw "duplicate column name" if it already exists
    if (msg.toLowerCase().includes("duplicate column")) return;
    // Some SQLite builds throw different message formats; ignore if clearly exists
    if (msg.toLowerCase().includes("already exists")) return;

    console.log("⚠️ Could not add categories.image_url column:", msg);
  });
}

// run once on startup
ensureImageUrlColumn();

// PUBLIC: GET /api/categories
router.get("/", (req, res) => {
  db.all("SELECT id, name, image_url FROM categories ORDER BY name ASC", (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
});

// ADMIN: POST /api/categories
router.post("/", requireAdmin, (req, res) => {
  const body = req.body || {};
  const name = (body.name || "").trim();

  // accept either imageUrl (frontend) or image_url (direct)
  const imageUrlRaw = body.imageUrl || body.image_url || "";
  const image_url = String(imageUrlRaw || "").trim();

  if (!name) return res.status(400).json({ error: "Missing name" });

  db.run(
    "INSERT INTO categories (name, image_url) VALUES (?, ?)",
    [name, image_url || null],
    function (err) {
      if (err) {
        if (String(err).includes("UNIQUE")) return res.status(409).json({ error: "Category exists" });
        return res.status(500).json({ error: "Insert failed" });
      }
      res.json({ ok: true, id: this.lastID });
    }
  );
});

// ADMIN: PUT /api/categories/:id  (update name and/or image)
router.put("/:id", requireAdmin, (req, res) => {
  const body = req.body || {};
  const id = req.params.id;

  const name = body.name != null ? String(body.name).trim() : null;
  const imageUrlRaw = body.imageUrl || body.image_url;
  const image_url = imageUrlRaw != null ? String(imageUrlRaw).trim() : null;

  if (name === null && image_url === null) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  // build dynamic update query
  const sets = [];
  const vals = [];

  if (name !== null) {
    if (!name) return res.status(400).json({ error: "Name cannot be empty" });
    sets.push("name = ?");
    vals.push(name);
  }
  if (image_url !== null) {
    sets.push("image_url = ?");
    vals.push(image_url || null);
  }

  vals.push(id);

  db.run(`UPDATE categories SET ${sets.join(", ")} WHERE id = ?`, vals, function (err) {
    if (err) return res.status(500).json({ error: "Update failed" });
    if (this.changes === 0) return res.status(404).json({ error: "Category not found" });
    res.json({ ok: true });
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
