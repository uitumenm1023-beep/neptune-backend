// public/js/shop.js
const grid = document.getElementById("grid");
const qInput = document.getElementById("q");

const params = new URLSearchParams(window.location.search);
const activeCategory = params.get("cat");
const initialSearch = params.get("q") || "";
if (qInput) qInput.value = initialSearch;

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function dollarsFromCents(c) {
  return (Number(c) / 100).toFixed(2);
}
function toAbsUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const clean = url.startsWith("/") ? url : "/" + url;
  return (window.API_BASE || "") + clean;
}
function pickImage(p) {
  return p?.image_url || (Array.isArray(p?.images) ? p.images[0] : "") || "";
}

async function load() {
  const products = await api("/api/products");

  const q = (initialSearch || "").toLowerCase();

  const filtered = products.filter((p) => {
    const title = (p.title || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    const matchQ = !q || title.includes(q) || desc.includes(q);

    const matchCat =
      !activeCategory ||
      (p.category && String(p.category).toLowerCase() === String(activeCategory).toLowerCase());

    return matchQ && matchCat;
  });

  grid.innerHTML = "";

  if (!filtered.length) {
    grid.innerHTML = `<p class="muted">No products found.</p>`;
    return;
  }

  for (const p of filtered) {
    const imgUrl = toAbsUrl(pickImage(p));

    const card = document.createElement("a");
    card.className = "product-card";
    card.href = `/product.html?id=${encodeURIComponent(p.id)}`;

    card.innerHTML = `
      <div class="thumb">
        ${imgUrl ? `<img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(p.title)}" loading="lazy">` : ""}
      </div>
      <div class="p-body">
        <div class="p-title">${escapeHtml(p.title)}</div>
        <div class="p-meta">
          <span>${escapeHtml(p.category || "")}</span>
          <span class="p-price">$${dollarsFromCents(p.price_cents)}</span>
        </div>
      </div>
    `;

    grid.appendChild(card);
  }
}

qInput?.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const q = qInput.value.trim();
  const p = new URLSearchParams(window.location.search);
  if (q) p.set("q", q);
  else p.delete("q");
  window.location.search = p.toString();
});

load().catch((err) => {
  console.error(err);
  grid.innerHTML = `<p class="muted">${escapeHtml(err.message)}</p>`;
});
