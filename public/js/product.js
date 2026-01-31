// public/js/product.js
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const titleEl = document.getElementById("title");
const priceEl = document.getElementById("price");
const descEl = document.getElementById("desc");
const mainImgWrap = document.getElementById("imgThumb"); // your CSS references #imgThumb
const thumbsEl = document.getElementById("thumbs");

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

async function load() {
  if (!id) throw new Error("Missing product id");

  const p = await api(`/api/products/${encodeURIComponent(id)}`);

  if (titleEl) titleEl.textContent = p.title || "";
  if (priceEl) priceEl.textContent = `$${dollarsFromCents(p.price_cents)}`;
  if (descEl) descEl.textContent = p.description || "";

  const imgs = [
    p.image_url,
    ...(Array.isArray(p.images) ? p.images : []),
  ].filter(Boolean).map(toAbsUrl);

  // main image
  if (mainImgWrap) {
    mainImgWrap.innerHTML = imgs[0]
      ? `<img src="${escapeHtml(imgs[0])}" alt="${escapeHtml(p.title)}">`
      : "";
  }

  // thumbs
  if (thumbsEl) {
    thumbsEl.innerHTML = "";
    imgs.forEach((src) => {
      const btn = document.createElement("button");
      btn.className = "thumb-btn";
      btn.type = "button";
      btn.innerHTML = `<img src="${escapeHtml(src)}" alt="">`;
      btn.addEventListener("click", () => {
        if (mainImgWrap) mainImgWrap.innerHTML = `<img src="${escapeHtml(src)}" alt="${escapeHtml(p.title)}">`;
      });
      thumbsEl.appendChild(btn);
    });
  }
}

load().catch((err) => {
  console.error(err);
});
