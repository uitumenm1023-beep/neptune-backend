const bcrypt = require("bcryptjs");
const db = require("../utils/db");

const DEFAULT_USER = "admin";
const DEFAULT_PASS = "admin123"; // change after first login

function seedAdmin() {
  db.get("SELECT id FROM admins WHERE username = ?", [DEFAULT_USER], (err, row) => {
    if (err) return console.error("Seed check error:", err);

    if (row) {
      console.log("Admin already exists:", DEFAULT_USER);
      return;
    }

    const hash = bcrypt.hashSync(DEFAULT_PASS, 10);
    db.run(
      "INSERT INTO admins (username, password_hash) VALUES (?, ?)",
      [DEFAULT_USER, hash],
      (insErr) => {
        if (insErr) return console.error("Seed insert error:", insErr);
        console.log(`✅ Seeded admin: ${DEFAULT_USER} / ${DEFAULT_PASS}`);
      }
    );
  });
}

module.exports = seedAdmin;
