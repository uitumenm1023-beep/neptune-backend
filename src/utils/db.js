// server/src/utils/db.js
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// ✅ ONE single database file
const dbPath = path.join(__dirname, "../../store.db");

console.log("✅ SQLite DB path (SERVER IS USING):", path.resolve(dbPath));


const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Failed to open SQLite DB:", err.message);
  } else {
    console.log("✅ SQLite connected");
  }
});

module.exports = db;
