// server/src/routes/products.routes.js
const express = require("express");
const db = require("../utils/db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// helpers
function parseJsonArray(s) {
  try {
    const v = JSON.parse(s || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function normalizeProductRow(row) {
  const images = parseJsonArray(row.images_json);
  const sizes = parseJsonArray(row.sizes_json);

  // fallback: if images_json empty but image_url exists, treat it as first image
  const finalImages = images.length ? images : (row.image_url ? [row.image_url] : []);

  return {
    ...row,
    images: finalImages,
    sizes,
  };
}

// PUBLIC: GET /api/products
router.get("/", (req, res) => {
  // include category name if you have categories table
  const sql = `
    SELECT p.*,
           c.name AS category
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ORDER BY p.id DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows.map(normalizeProductRow));
  });
});

// PUBLIC: GET /api/products/:id
router.get("/:id", (req, res) => {
  const sql = `
    SELECT p.*,
           c.name AS category
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.id = ?
    LIMIT 1
  `;

  db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(normalizeProductRow(row));
  });
});

// ADMIN: POST /api/products
router.post("/", requireAdmin, (req, res) => {
  const {
    title,
    price_cents,
    description = "",
    image_url = "",
    category_id = null,
    is_featured = 0,
    images = [],
    sizes = [],
  } = req.body || {};

  if (!title?.trim()) return res.status(400).json({ error: "Missing title" });
  if (price_cents === undefined || price_cents === null) return res.status(400).json({ error: "Missing price" });

  const images_json = Array.isArray(images) ? JSON.stringify(images.filter(Boolean)) : null;
  const sizes_json = Array.isArray(sizes) ? JSON.stringify(sizes.filter(Boolean)) : null;

  const sql = `
    INSERT INTO products (title, price_cents, description, image_url, category_id, is_featured, images_json, sizes_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      title.trim(),
      Number(price_cents),
      String(description || ""),
      String(image_url || ""),
      category_id === null || category_id === "" ? null : Number(category_id),
      is_featured ? 1 : 0,
      images_json,
      sizes_json,
    ],
    function (err) {
      if (err) {
  console.error("PRODUCT INSERT ERROR:", err);
  return res.status(500).json({ error: err.message });
}

      res.json({ ok: true, id: this.lastID });
    }
  );
});

// ADMIN: PUT /api/products/:id
router.put("/:id", requireAdmin, (req, res) => {
  const {
    title,
    price_cents,
    description = "",
    image_url = "",
    category_id = null,
    is_featured = 0,
    images = [],
    sizes = [],
  } = req.body || {};

  if (!title?.trim()) return res.status(400).json({ error: "Missing title" });
  if (price_cents === undefined || price_cents === null) return res.status(400).json({ error: "Missing price" });

  const images_json = Array.isArray(images) ? JSON.stringify(images.filter(Boolean)) : null;
  const sizes_json = Array.isArray(sizes) ? JSON.stringify(sizes.filter(Boolean)) : null;

  const sql = `
    UPDATE products
    SET title=?,
        price_cents=?,
        description=?,
        image_url=?,
        category_id=?,
        is_featured=?,
        images_json=?,
        sizes_json=?
    WHERE id=?
  `;

  db.run(
    sql,
    [
      title.trim(),
      Number(price_cents),
      String(description || ""),
      String(image_url || ""),
      category_id === null || category_id === "" ? null : Number(category_id),
      is_featured ? 1 : 0,
      images_json,
      sizes_json,
      Number(req.params.id),
    ],
    function (err) {
      if (err) return res.status(500).json({ error: "Update failed" });
      res.json({ ok: true });
    }
  );
});

// ADMIN: DELETE /api/products/:id
router.delete("/:id", requireAdmin, (req, res) => {
  db.run("DELETE FROM products WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: "Delete failed" });
    res.json({ ok: true });
  });
});

module.exports = router;
