// public/js/admin/products.js
console.log("✅ products.js (multi-photo + sizes) loaded");

const list = document.getElementById("list");
const form = document.getElementById("productForm");
const msg = document.getElementById("msg");
const logoutBtn = document.getElementById("logoutBtn");

const categorySelect = document.getElementById("categorySelect");

// sizes
const sizesInput = document.getElementById("sizesInput");

// uploads (3)
const imageFile = document.getElementById("imageFile");
const uploadBtn = document.getElementById("uploadBtn");
const uploadStatus = document.getElementById("uploadStatus");

const imageFile2 = document.getElementById("imageFile2");
const uploadBtn2 = document.getElementById("uploadBtn2");
const uploadStatus2 = document.getElementById("uploadStatus2");

const imageFile3 = document.getElementById("imageFile3");
const uploadBtn3 = document.getElementById("uploadBtn3");
const uploadStatus3 = document.getElementById("uploadStatus3");

let isUploading = false;
let extraImage2 = "";
let extraImage3 = "";

/* =========================
   HELPERS
========================= */
function centsFromDollars(d) {
  return Math.round(Number(d) * 100);
}
function dollarsFromCents(c) {
  return (Number(c) / 100).toFixed(2);
}
function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function toAbsUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const clean = url.startsWith("/") ? url : "/" + url;
  return (window.API_BASE || "") + clean;
}

/* =========================
   AUTH
========================= */
async function ensureAuth() {
  try {
    await api("/api/auth/me");
  } catch {
    window.location.href = "/admin/login.html";
  }
}

/* =========================
   CATEGORIES
========================= */
async function loadCategoriesIntoSelect() {
  try {
    const cats = await api("/api/categories");
    categorySelect.innerHTML = `<option value="">Uncategorized</option>`;
    for (const c of cats) {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      categorySelect.appendChild(opt);
    }
  } catch {
    categorySelect.innerHTML = `<option value="">Uncategorized</option>`;
  }
}

/* =========================
   UPLOAD (FIXED)
========================= */
async function uploadOne(fileInput, statusEl, onDone) {
  const file = fileInput?.files?.[0];
  statusEl.textContent = "";

  if (!file) {
    statusEl.textContent = "Choose an image first.";
    return null;
  }

  try {
    isUploading = true;
    statusEl.textContent = "Uploading...";

    const fd = new FormData();
    fd.append("image", file); // backend expects "image"

    // ✅ IMPORTANT FIX: use Render base URL, not Netlify
    const res = await fetch((window.API_BASE || "") + "/api/upload", {
      method: "POST",
      credentials: "include",
      body: fd,
      // do NOT set Content-Type for FormData
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `Upload failed (${res.status})`);

    const imageUrl = data.imageUrl || data.url || "";
    if (!imageUrl) throw new Error("Upload succeeded but no imageUrl returned");

    statusEl.textContent = "Uploaded ✅";
    onDone?.(imageUrl);
    return imageUrl;
  } catch (err) {
    statusEl.textContent = err.message || "Upload failed";
    return null;
  } finally {
    isUploading = false;
  }
}

// Auto upload when user selects file
imageFile?.addEventListener("change", () =>
  uploadOne(imageFile, uploadStatus, (url) => {
    form.querySelector('input[name="image_url"]').value = url; // main image url
  })
);
uploadBtn?.addEventListener("click", () =>
  uploadOne(imageFile, uploadStatus, (url) => {
    form.querySelector('input[name="image_url"]').value = url;
  })
);

imageFile2?.addEventListener("change", () =>
  uploadOne(imageFile2, uploadStatus2, (url) => {
    extraImage2 = url;
  })
);
uploadBtn2?.addEventListener("click", () =>
  uploadOne(imageFile2, uploadStatus2, (url) => {
    extraImage2 = url;
  })
);

imageFile3?.addEventListener("change", () =>
  uploadOne(imageFile3, uploadStatus3, (url) => {
    extraImage3 = url;
  })
);
uploadBtn3?.addEventListener("click", () =>
  uploadOne(imageFile3, uploadStatus3, (url) => {
    extraImage3 = url;
  })
);

/* =========================
   PRODUCTS LIST
========================= */
async function loadProducts() {
  const products = await api("/api/products");
  list.innerHTML = "";

  if (!products.length) {
    list.innerHTML = `<p class="muted">No products yet.</p>`;
    return;
  }

  for (const p of products) {
    const el = document.createElement("div");
    el.className = "item";

    const mainImageHref = p.image_url ? toAbsUrl(p.image_url) : "";

    el.innerHTML = `
      <div>
        <div class="item-title">${escapeHtml(p.title)}</div>
        <div class="item-sub">$${dollarsFromCents(p.price_cents)} · ${escapeHtml(
      p.category || "Uncategorized"
    )} · #${p.id}</div>
        <div class="item-sub">
          ${p.is_featured ? "⭐ Featured" : ""}
          ${
            mainImageHref
              ? ` · <a class="link" href="${escapeHtml(
                  mainImageHref
                )}" target="_blank" rel="noreferrer">Main Image</a>`
              : ""
          }
        </div>
      </div>
      <div class="item-actions">
        <button class="small danger" data-del="${p.id}">Delete</button>
      </div>
    `;

    el.querySelector("[data-del]")?.addEventListener("click", async () => {
      if (!confirm("Delete this product?")) return;
      await api(`/api/products/${p.id}`, { method: "DELETE" });
      await loadProducts();
    });

    list.appendChild(el);
  }
}

/* =========================
   LOGOUT
========================= */
logoutBtn?.addEventListener("click", async () => {
  await api("/api/auth/logout", { method: "POST" });
  window.location.href = "/admin/login.html";
});

/* =========================
   CREATE PRODUCT
========================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  if (isUploading) {
    msg.textContent = "Wait—image is uploading...";
    return;
  }

  const fd = new FormData(form);

  const mainUrl = (fd.get("image_url") || "").trim();
  const sizes = (sizesInput.value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const images = [mainUrl, extraImage2, extraImage3].filter(Boolean);

  if (!mainUrl) {
    msg.textContent = "Please upload the MAIN image first.";
    return;
  }

  // prevent windows paths
  if (mainUrl.includes(":\\") || mainUrl.startsWith("C:\\")) {
    msg.textContent = "Do not paste C:\\ paths. Use the uploader.";
    return;
  }

  const payload = {
    title: (fd.get("title") || "").trim(),
    price_cents: centsFromDollars(fd.get("price")),
    category_id: categorySelect.value ? Number(categorySelect.value) : null,
    is_featured: Number(fd.get("is_featured")) === 1,
    description: fd.get("description") || "",
    image_url: mainUrl,
    images,
    sizes,
  };

  if (!payload.title) {
    msg.textContent = "Title is required.";
    return;
  }

  try {
    await api("/api/products", { method: "POST", body: JSON.stringify(payload) });

    form.reset();
    uploadStatus.textContent = "";
    uploadStatus2.textContent = "";
    uploadStatus3.textContent = "";
    extraImage2 = "";
    extraImage3 = "";

    await loadProducts();
  } catch (err) {
    msg.textContent = err.message;
  }
});

/* =========================
   INIT
========================= */
(async function init() {
  await ensureAuth();
  await loadCategoriesIntoSelect();
  await loadProducts();
})();
