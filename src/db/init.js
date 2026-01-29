// server/src/db/init.js
const fs = require("fs");
const path = require("path");
const db = require("../utils/db");

function initDb() {
  const schemaPath = path.join(__dirname, "schema.sql");

  const checkSql = `
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='products';
  `;

  db.get(checkSql, (err, row) => {
    if (err) {
      console.error("❌ DB check error:", err.message);
      return;
    }

    if (row) {
      console.log("✅ DB already initialized");
      return;
    }

    console.log("⚠️ Running schema.sql (first time only)");

    const schema = fs.readFileSync(schemaPath, "utf8");
    db.exec(schema, (err) => {
      if (err) {
        console.error("❌ Schema error:", err.message);
        return;
      }
      console.log("✅ DB schema created");
    });
  });
}

module.exports = initDb;
