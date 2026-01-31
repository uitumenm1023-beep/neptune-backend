// server/src/app.js
const path = require("path");
const express = require("express");
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
   ENV
========================= */
const IS_PROD = process.env.NODE_ENV === "production";

/* =========================
   TRUST PROXY (Render)
========================= */
app.set("trust proxy", 1);

/* =========================
   BODY PARSERS
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   CORS (NO PACKAGE, ALWAYS SENDS HEADERS)
   Fixes: "No Access-Control-Allow-Origin header" even on 401/errors
========================= */
const ALLOWED = new Set([
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://127.0.0.1:5500",
  "https://n9ptune.netlify.app",
  "https://genuine-liger-891219.netlify.app",
]);

function isAllowedOrigin(origin) {
  if (!origin) return true; // non-browser tools
  if (ALLOWED.has(origin)) return true;
  // allow any Netlify preview domain
  if (/^https:\/\/[a-z0-9-]+\.netlify\.app$/.test(origin)) return true;
  return false;
}

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  }

  // handle preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

/* =========================
   STATIC FILES
   Your uploads are saved to: public/assets/uploads
========================= */
app.use(express.static(path.join(process.cwd(), "public")));

/* =========================
   SESSIONS (CROSS-SITE COOKIE FIX)
========================= */
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "dev_secret_change_later",
    resave: false,
    saveUninitialized: false,
    proxy: true, // IMPORTANT on Render
    cookie: {
      httpOnly: true,
      secure: IS_PROD,              // must be true on https
      sameSite: IS_PROD ? "none" : "lax", // must be "none" for Netlify -> Render
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
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
   HEALTH
========================= */
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

/* =========================
   START
========================= */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

