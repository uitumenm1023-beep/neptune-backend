// src/app.js
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

/* =========================
   ENV / SETTINGS
========================= */
const IS_PROD = process.env.NODE_ENV === "production";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://127.0.0.1:5500",
  "https://neptune-store.netlify.app",
  "https://genuine-liger-891219.netlify.app",
];

// Render is behind a proxy
app.set("trust proxy", 1);

/* =========================
   MIDDLEWARE
========================= */

// ✅ CORS (NO app.options("*") — that breaks Node 22)
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);

      // allow any Netlify preview domain
      if (/^https:\/\/[a-z0-9-]+\.netlify\.app$/.test(origin)) {
        return cb(null, true);
      }

      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   STATIC FILES
========================= */

// Serve ALL public assets
app.use(express.static(path.join(process.cwd(), "public")));

/* =========================
   SESSIONS
========================= */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret_change_later",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: IS_PROD ? "none" : "lax",
      secure: IS_PROD,
    },
  })
);

/* =========================
   API ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
