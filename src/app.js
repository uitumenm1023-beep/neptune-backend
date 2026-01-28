const path = require("path");
const express = require("express");
const cors = require("cors");
const session = require("express-session");

const initDb = require("./db/init");
const seedAdmin = require("./db/seedAdmin");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/products.routes");
const categoryRoutes = require("./routes/categories.routes");
const uploadRoutes = require("./routes/upload.routes");
const orderRoutes = require("./routes/orders.routes");

initDb();
seedAdmin();

const app = express();

/* ---------- middleware (ORDER MATTERS) ---------- */

// ✅ Allow cookies (sessions) to work from your frontend
app.use(
  cors({
    origin: true,          // reflects request origin (fine for local dev)
    credentials: true,     // ✅ allow cookies
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session MUST be before routes that need auth
app.use(
  session({
    secret: "dev_secret_change_later",
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "lax",     // good for same-site navigation
    },
  })
);

/* ---------- static frontend ---------- */
app.use(express.static(path.join(__dirname, "../../public")));

/* ---------- API routes ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);

/* ---------- health check ---------- */
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

/* ---------- start server ---------- */
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
