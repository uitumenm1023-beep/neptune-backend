/* =========================
   SPLINE INTRO (CLEAN)
   - fullscreen on load
   - dismisses once user scrolls intentionally
========================= */
(function () {
  const intro = document.getElementById("splineIntro");
  if (!intro) return;

  let dismissed = false;

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    document.body.classList.add("intro-hidden");
  }

  // dismiss after real scroll
  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > 160) dismiss();
    },
    { passive: true }
  );
})();

/* =========================
   REVEAL ON SCROLL
   - fixes invisible homepage
========================= */
(function () {
  const els = Array.from(document.querySelectorAll(".reveal"));
  if (!els.length) return;

  const show = (el) => el.classList.add("show");

  // fallback
  if (!("IntersectionObserver" in window)) {
    els.forEach(show);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          show(e.target);
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12 }
  );

  els.forEach((el) => io.observe(el));
})();

/* =========================
   BESTSELLERS SLIDER
========================= */
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
  if (!track) return;

  const products = await api("/api/products");
  const list = products.filter((p) => p.is_featured).slice(0, 12);
  const use = list.length ? list : products.slice(0, 12);

  track.innerHTML = "";

  for (const p of use) {
    const img = toAbsUrl(pickImage(p));
    const a = document.createElement("a");
    a.className = "slide bs-card";
    a.href = `/product.html?id=${encodeURIComponent(p.id)}`;
    a.innerHTML = `
      <div class="bs-media">
        ${
          img
            ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(
                p.title
              )}" loading="lazy">`
            : ""
        }
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

  const slideWidth = 260 + 18;

  function render() {
    track.style.transform = `translateX(${-idx * slideWidth}px)`;
  }

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
