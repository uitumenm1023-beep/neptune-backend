// public/js/index.js
// --- SPLINE INTRO: hide when user scrolls down ---
// SPLINE INTRO: overlay hides on scroll
(function () {
  const intro = document.getElementById("splineIntro");
  if (!intro) return;

  function setHidden(hidden) {
    document.body.classList.toggle("intro-hidden", hidden);
    const hint = intro.querySelector(".scrollHint");
    if (hint) hint.classList.toggle("hide", hidden);
  }

  // show on load
  setHidden(false);

  // hide when user scrolls a bit
  window.addEventListener(
    "scroll",
    () => setHidden(window.scrollY > 10),
    { passive: true }
  );
})();






const track = document.getElementById("track");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

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

let idx = 0;

async function loadSlider() {
  const products = await api("/api/products");
  const list = products.filter(p => p.is_featured).slice(0, 12);
  const use = list.length ? list : products.slice(0, 12);

  track.innerHTML = "";

  for (const p of use) {
    const img = toAbsUrl(pickImage(p));
    const a = document.createElement("a");
    a.className = "slide bs-card";
    a.href = `/product.html?id=${encodeURIComponent(p.id)}`;
    a.innerHTML = `
      <div class="bs-media">
        ${img ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(p.title)}" loading="lazy">` : ""}
        <div class="bs-grad"></div>
      </div>
      <div class="bs-info">
        <div class="bs-title">${escapeHtml(p.title)}</div>
        <div class="bs-row">
          <div class="bs-cat">${escapeHtml(p.category || "")}</div>
          <div class="bs-price">$${dollarsFromCents(p.price_cents)}</div>
        </div>
      </div>
    `;
    track.appendChild(a);
  }

  const slideWidth = 260 + 18; // width + gap
  const render = () => (track.style.transform = `translateX(${-idx * slideWidth}px)`);

  prevBtn?.addEventListener("click", () => {
    idx = Math.max(0, idx - 1);
    render();
  });
  nextBtn?.addEventListener("click", () => {
    idx = Math.min(use.length - 1, idx + 1);
    render();
  });

  render();
}

loadSlider().catch(console.error);
