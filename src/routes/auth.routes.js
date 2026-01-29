const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../utils/db");

const router = express.Router();

// GET /api/auth/me
router.get("/me", (req, res) => {
  if (req.session?.admin?.id) {
    return res.json({ ok: true, admin: { id: req.session.admin.id, username: req.session.admin.username } });
  }
  return res.status(401).json({ ok: false });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Missing username/password" });

  db.get("SELECT id, username, password_hash FROM admins WHERE username = ?", [username], (err, admin) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const ok = bcrypt.compareSync(password, admin.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    req.session.admin = { id: admin.id, username: admin.username };
    return res.json({ ok: true });
  });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

module.exports = router;
