// public/js/index.js
window.__INDEX_LOADED__ = true;
alert("index.js updated and running ✅");



/* =========================
   DRAWER MENU (OFFCANVAS)
========================= */
const menuBtn = document.getElementById("menuBtn");
const overlay = document.getElementById("overlay");
const drawer = document.getElementById("drawer");
const closeDrawer = document.getElementById("closeDrawer");

function openDrawer() {
  drawer?.classList.add("open");
  overlay?.classList.add("show");
  document.body.classList.add("drawer-open");
  menuBtn?.setAttribute("aria-expanded", "true");
}
function closeDrawerFn() {
  drawer?.classList.remove("open");
  overlay?.classList.remove("show");
  document.body.classList.remove("drawer-open");
  menuBtn?.setAttribute("aria-expanded", "false");
}

menuBtn?.addEventListener("click", openDrawer);
closeDrawer?.addEventListener("click", closeDrawerFn);
overlay?.addEventListener("click", closeDrawerFn);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawerFn();
});


/* =========================
   SPLINE INTRO
========================= */
/* =========================
   SPLINE INTRO: ENTER TO CONTINUE
   Hide on: click/tap, wheel, touch, keydown, or scroll
========================= */
const intro = document.getElementById("splineIntro");
const scrollHint = intro?.querySelector(".scrollHint");

function hideIntro() {
  if (!intro) return;

  // Hide the whole overlay
  intro.style.display = "none";

  // Make sure it can never block interaction
  intro.style.pointerEvents = "none";
}

function showIntro() {
  if (!intro) return;
  intro.style.display = "";
  intro.style.pointerEvents = "";
}

// show on load (optional)
window.addEventListener("load", () => {
  showIntro();

  // If page loads not at top, don’t show it
  if (window.scrollY > 5) hideIntro();
});

// Hide on ANY “intent to continue”
function onEnter() {
  hideIntro();
  cleanup();
}

function cleanup() {
  window.removeEventListener("scroll", onEnter);
  window.removeEventListener("wheel", onEnter, { passive: true });
  window.removeEventListener("touchstart", onEnter, { passive: true });
  document.removeEventListener("keydown", onKey);
  intro?.removeEventListener("click", onEnter);
}

function onKey(e) {
  // Any key can dismiss, or restrict to Enter/Space if you want
  if (e.key === "Enter" || e.key === " " || e.key === "Escape") onEnter();
}

// These cover desktop + mobile even if no scroll happens
window.addEventListener("scroll", onEnter, { passive: true });
window.addEventListener("wheel", onEnter, { passive: true });
window.addEventListener("touchstart", onEnter, { passive: true });
document.addEventListener("keydown", onKey);
intro?.addEventListener("click", onEnter);


/* =========================
   SCROLL REVEAL
========================= */
const revealEls = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("show");
    });
  },
  { threshold: 0.15 }
);
revealEls.forEach((el) => observer.observe(el));


/* =========================
   BESTSELLERS SLIDER
========================= */
const qHome = document.getElementById("qHome");
const track = document.getElementById("track");
const slider = document.getElementById("slider");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

function dollars(c) { return (Number(c) / 100).toFixed(2); }
function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ✅ convert backend image paths to absolute URLs
function toAbsUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return API_BASE + url;
}

let items = [];
let index = 0;

function slideWidthWithGap() {
  const first = track?.querySelector(".bs-card");
  if (!first) return 0;
  const w = first.getBoundingClientRect().width;
  const gap = 18;
  return w + gap;
}

function visibleCount() {
  const one = slideWidthWithGap();
  if (!one || !slider) return 1;
  const view = slider.getBoundingClientRect().width;
  return Math.max(1, Math.floor(view / one));
}

function maxIndex() {
  const vis = visibleCount();
  return Math.max(0, items.length - vis);
}

function clamp() {
  const m = maxIndex();
  index = Math.max(0, Math.min(index, m));
}

function updateButtons() {
  const m = maxIndex();
  if (prevBtn) prevBtn.disabled = index <= 0;
  if (nextBtn) nextBtn.disabled = index >= m;
}

function applyTranslate() {
  if (!track) return;
  const one = slideWidthWithGap();
  track.style.transform = `translateX(${-one * index}px)`;
  updateButtons();
}

function renderSlider() {
  if (!track) return;

  track.innerHTML = items.map((p) => {
    const img = toAbsUrl(p.image_url);
    const title = esc(p.title || "Product");
    const cat = esc(p.category || "Uncategorized");

    return `
      <a class="bs-card" href="/product.html?id=${p.id}">
        <div class="bs-media">
          <img src="${esc(img)}" alt="${title}" loading="lazy" />
          <div class="bs-grad"></div>
          ${p.is_featured ? `<div class="bs-tag">Bestseller</div>` : ``}
        </div>

        <div class="bs-info">
          <div class="bs-title">${title}</div>
          <div class="bs-row">
            <span class="bs-cat">${cat}</span>
            <span class="bs-price">$${dollars(p.price_cents || 0)}</span>
          </div>
        </div>
      </a>
    `;
  }).join("");

  clamp();
  applyTranslate();
}

prevBtn?.addEventListener("click", () => {
  index -= 1;
  clamp();
  applyTranslate();
});
nextBtn?.addEventListener("click", () => {
  index += 1;
  clamp();
  applyTranslate();
});
window.addEventListener("resize", () => {
  clamp();
  applyTranslate();
});

qHome?.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const term = qHome.value.trim();
  if (!term) return;
  window.location.href = `/shop.html?q=${encodeURIComponent(term)}`;
});

(async function init() {
  try {
    const all = await api("/api/products");

    const featured = all.filter(p => p.is_featured);
    const base = featured.length ? featured : all;

    items = base
      .slice()
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 10);

    renderSlider();
  } catch (err) {
    console.error(err);
  }
})();
