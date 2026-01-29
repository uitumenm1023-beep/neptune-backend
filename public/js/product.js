// public/js/product.js
const API_BASE = "https://neptune-backend.onrender.com"; // <-- CHANGE THIS

const params = new URLSearchParams(location.search);
const id = params.get("id");

const titleEl = document.getElementById("title");
const catEl = document.getElementById("category");
const priceEl = document.getElementById("price");
const descEl = document.getElementById("desc");

const imgThumb = document.getElementById("imgThumb");
const thumbsEl = document.getElementById("thumbs");

const sizePills = document.getElementById("sizePills");
const sizeHint = document.getElementById("sizeHint");

const qtyEl = document.getElementById("qty");
const addBtn = document.getElementById("addBtn");
const msg = document.getElementById("msg");
const cartCountEl = document.getElementById("cartCount");

let selectedSize = "";

function dollars(cents){ return (Number(cents)/100).toFixed(2); }
function esc(s){
  return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

function toAbsUrl(url){
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return API_BASE + url;
}

function setMsg(t){ msg.textContent = t || ""; }
function refreshCartCount(){
  if (cartCountEl && typeof window.cartCountNumber === "function") {
    cartCountEl.textContent = String(window.cartCountNumber());
  }
}

function renderMainImage(url, title){
  if (!url) {
    imgThumb.textContent = "No Image";
    return;
  }
  imgThumb.innerHTML = `<img src="${esc(url)}" alt="${esc(title || "Product")}" style="width:100%;height:100%;object-fit:contain" />`;
}

function renderThumbs(images, title){
  thumbsEl.innerHTML = "";
  images.forEach((url) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "thumb-btn";
    b.innerHTML = `<img src="${esc(url)}" alt="${esc(title || "Product")}" loading="lazy" />`;
    b.addEventListener("click", () => renderMainImage(url, title));
    thumbsEl.appendChild(b);
  });
}

function renderSizePills(sizes){
  sizePills.innerHTML = "";
  selectedSize = "";

  if (!sizes || !sizes.length) {
    sizeHint.textContent = "No size";
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "size-pill disabled";
    pill.textContent = "One size";
    pill.disabled = true;
    sizePills.appendChild(pill);
    return;
  }

  sizeHint.textContent = "Select one";

  for (const s of sizes) {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "size-pill";
    pill.textContent = s;

    pill.addEventListener("click", () => {
      [...sizePills.querySelectorAll(".size-pill")].forEach(el => el.classList.remove("active"));
      pill.classList.add("active");
      selectedSize = s;
      setMsg("");
      sizeHint.textContent = `Selected: ${s}`;
    });

    sizePills.appendChild(pill);
  }
}

(async function init(){
  refreshCartCount();

  if (!id) {
    titleEl.textContent = "Missing product id";
    setMsg("Open like: /product.html?id=1");
    addBtn.disabled = true;
    return;
  }

  try {
    const p = await api(`/api/products/${id}`);

    titleEl.textContent = p.title || "Untitled";
    catEl.textContent = p.category || "Uncategorized";
    priceEl.textContent = `$${dollars(p.price_cents || 0)}`;
    descEl.textContent = p.description || "";

    // ✅ convert all image urls to absolute backend urls
    const rawImages = Array.isArray(p.images)
      ? p.images
      : (p.image_url ? [p.image_url] : []);

    const images = rawImages.map(toAbsUrl).filter(Boolean);

    renderMainImage(images[0], p.title);
    renderThumbs(images, p.title);

    const sizes = Array.isArray(p.sizes) ? p.sizes : [];
    renderSizePills(sizes);

    addBtn.addEventListener("click", () => {
      setMsg("");

      if (typeof window.cartAdd !== "function") {
        setMsg("Cart not loaded. Make sure cart.js is included before product.js");
        return;
      }

      const qty = Math.max(1, Number(qtyEl.value || 1));
      const needsSize = sizes.length > 0;

      if (needsSize && !selectedSize) {
        setMsg("Please select a size.");
        return;
      }

      window.cartAdd({
        id: p.id,
        title: p.title,
        price_cents: p.price_cents,
        image_url: images[0] || "",
        size: selectedSize || "",
      }, qty);

      refreshCartCount();
      setMsg("Added to cart ✅");
    });

  } catch (err) {
    console.error(err);
    titleEl.textContent = "Product not found";
    setMsg(err.message || "Failed to load product");
    addBtn.disabled = true;
  }
})();
