// public/js/cart.js
// Single source of truth for cart storage + helpers.
// Stored in localStorage key: "cart"

const CART_KEY = "cart";

function cartGet() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function cartSet(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function cartClear() {
  localStorage.removeItem(CART_KEY);
}

function cartCountNumber() {
  return cartGet().reduce((sum, it) => sum + Number(it.qty || 0), 0);
}

function cartTotalCents() {
  return cartGet().reduce((sum, it) => sum + Number(it.price_cents || 0) * Number(it.qty || 0), 0);
}

function cartAdd(product, qty = 1) {
  const items = cartGet();

  const addQty = Math.max(1, Number(qty || 1));

  // normalize
  const p = {
    id: product.id,
    title: product.title || "Product",
    price_cents: Number(product.price_cents || 0),
    image_url: product.image_url || "",
    size: product.size || "",
  };

  // if same product + same size -> increment qty
  const idx = items.findIndex((it) => String(it.id) === String(p.id) && String(it.size || "") === String(p.size || ""));
  if (idx >= 0) {
    items[idx].qty = Number(items[idx].qty || 0) + addQty;
  } else {
    items.push({ ...p, qty: addQty });
  }

  cartSet(items);
}

function cartUpdateQty(index, newQty) {
  const items = cartGet();
  if (!items[index]) return;

  items[index].qty = Math.max(1, Number(newQty || 1));
  cartSet(items);
}

function cartRemove(index) {
  const items = cartGet();
  items.splice(index, 1);
  cartSet(items);
}

// expose globally (used by product.js / checkout.js / cartPage.js)
window.cartGet = cartGet;
window.cartSet = cartSet;
window.cartClear = cartClear;
window.cartAdd = cartAdd;
window.cartCountNumber = cartCountNumber;
window.cartTotalCents = cartTotalCents;
window.cartUpdateQty = cartUpdateQty;
window.cartRemove = cartRemove;
