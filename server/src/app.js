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
   PRODUCTION SETTINGS
========================= */
const IS_PROD = process.env.NODE_ENV === "production";

// ✅ Put your Netlify URL here (and any custom domain later)
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://127.0.0.1:5500",
  "https://neptune-store.netlify.app",
];

// ✅ Render is behind a proxy. Needed so secure cookies work.
app.set("trust proxy", 1);

/* ---------- middleware (ORDER MATTERS) ---------- */

// ✅ CORS: do NOT use origin:true in production
app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser requests (curl, server-to-server)
      if (!origin) return cb(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);

      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ✅ Serve uploads from:
 * <project-root>/public/assets/uploads
 *
 * So images become publicly available at:
 * https://YOUR_RENDER_URL/assets/uploads/<filename>
 */
app.use(
  "/assets/uploads",
  express.static(path.join(process.cwd(), "public", "assets", "uploads"))
);

// ✅ sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret_change_later",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: IS_PROD ? "none" : "lax",
      secure: IS_PROD, // requires HTTPS (Netlify/Render are HTTPS)
    },
  })
);

/* ---------- static frontend (optional) ----------
   If you deploy frontend separately on Netlify,
   you can keep this OR remove it — it won’t hurt.
*/
app.use(express.static(path.join(process.cwd(), "public")));

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
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
