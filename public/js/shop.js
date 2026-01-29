// public/js/shop.js
// Clean catalog grid + search (?q=) + category filter (?cat=)
// Requires: shop.html has #grid and #q elements, and loads ./js/api.js before this file.

const API_BASE = "https://neptune-backend.onrender.com"; // <-- CHANGE THIS

const grid = document.getElementById("grid");
const qInput = document.getElementById("q");

const params = new URLSearchParams(window.location.search);
const activeCategory = params.get("cat"); // e.g. "Shoes"
const initialSearch = params.get("q") || "";

const cartCountEl = document.getElementById("cartCount");

function refreshCartCount() {
  if (cartCountEl && typeof window.cartCountNumber === "function") {
    cartCountEl.textContent = String(window.cartCountNumber());
  }
}
document.addEventListener("DOMContentLoaded", refreshCartCount);

let all = [];

function dollars(cents) {
  return (Number(cents) / 100).toFixed(2);
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ✅ If image_url is "/assets/..", make it load from backend
function toAbsUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return API_BASE + url;
}

function render(items) {
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = `<p class="sub">No products found.</p>`;
    return;
  }

  grid.innerHTML = items
    .map((p) => {
      const imgUrl = p.image_url ? toAbsUrl(p.image_url) : "";
      const img = imgUrl
        ? `<img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(p.title || "Product")}" loading="lazy" />`
        : "";

      return `
        <a class="product-card" href="/product.html?id=${p.id}">
          <div class="thumb">${img}</div>
          <div class="p-body">
            <div class="p-title">${escapeHtml(p.title || "Product")}</div>
            <div class="p-meta">
              <span>${escapeHtml(p.category || "Uncategorized")}</span>
              <span class="p-price">$${dollars(p.price_cents || 0)}</span>
            </div>
          </div>
        </a>
      `;
    })
    .join("");
}

function applyFilters() {
  const term = (qInput?.value || "").trim().toLowerCase();

  let items = all.slice();

  if (activeCategory) {
    items = items.filter(
      (p) => (p.category || "").toLowerCase() === activeCategory.toLowerCase()
    );
  }

  if (term) {
    items = items.filter((p) => {
      const t = (p.title || "").toLowerCase();
      const d = (p.description || "").toLowerCase();
      const c = (p.category || "").toLowerCase();
      return t.includes(term) || d.includes(term) || c.includes(term);
    });
  }

  render(items);
}

async function init() {
  if (!grid) return;

  if (qInput && initialSearch) qInput.value = initialSearch;

  // products from backend
  all = await api("/api/products");

  all.sort((a, b) => {
    const fa = a.is_featured ? 1 : 0;
    const fb = b.is_featured ? 1 : 0;
    if (fb !== fa) return fb - fa;
    return (b.id || 0) - (a.id || 0);
  });

  applyFilters();

  if (qInput) qInput.addEventListener("input", applyFilters);
}

init().catch((err) => {
  console.error(err);
  if (grid) grid.innerHTML = `<p class="sub">Failed to load products.</p>`;
});
