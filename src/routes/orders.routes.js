const express = require("express");
const db = require("../utils/db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// PUBLIC: create order (COD)
router.post("/", (req, res) => {
  const { customer_name, phone, address, items } = req.body || {};

  if (!customer_name || !phone || !address) {
    return res.status(400).json({ error: "Missing customer fields" });
  }

  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  const total_cents = items.reduce(
    (sum, i) => sum + Number(i.price_cents) * Number(i.qty),
    0
  );

  db.run(
    "INSERT INTO orders (customer_name, phone, address, total_cents, status) VALUES (?, ?, ?, ?, 'new')",
    [customer_name, phone, address, total_cents],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Order create failed" });
      }

      const orderId = this.lastID;

      const stmt = db.prepare(
        "INSERT INTO order_items (order_id, product_id, title, price_cents, qty, size) VALUES (?, ?, ?, ?, ?, ?)"
      );

      for (const it of items) {
        stmt.run(
          orderId,
          it.id,
          it.title,
          it.price_cents,
          it.qty,
          it.size || ""
        );
      }

      stmt.finalize(() => {
        res.json({ ok: true, orderId });
      });
    }
  );
});

// ADMIN: get orders WITH items
router.get("/", requireAdmin, (req, res) => {
  db.all(
    "SELECT * FROM orders ORDER BY created_at DESC",
    (err, orders) => {
      if (err) return res.status(500).json({ error: "DB error" });

      if (!orders.length) return res.json([]);

      const ids = orders.map(o => o.id);
      const placeholders = ids.map(() => "?").join(",");

      db.all(
        `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
        ids,
        (err2, items) => {
          if (err2) return res.status(500).json({ error: "DB error" });

          const grouped = {};
          for (const it of items) {
            if (!grouped[it.order_id]) grouped[it.order_id] = [];
            grouped[it.order_id].push(it);
          }

          const result = orders.map(o => ({
            ...o,
            items: grouped[o.id] || [],
          }));

          res.json(result);
        }
      );
    }
  );
});

module.exports = router;
