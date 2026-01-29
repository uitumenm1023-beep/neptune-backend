// public/js/cartPage.js  (MATCHES your cart.html)

function money(cents) {
  return `$${(Number(cents || 0) / 100).toFixed(2)}`;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function calcTotals(items) {
  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.price_cents) * Number(it.qty),
    0
  );
  const shipping = subtotal > 0 ? 1000 : 0; // $10.00 in cents (change if you want)
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}

function renderCart() {
  const wrap = document.getElementById("cartItems");
  const subtotalEl = document.getElementById("subtotal");
  const shippingEl = document.getElementById("shipping");
  const totalEl = document.getElementById("total");

  if (!wrap) {
    console.error("Cart items element (#cartItems) not found");
    return;
  }

  if (typeof window.cartGet !== "function") {
    wrap.innerHTML = `<p class="sub">Cart system not loaded. Make sure cart.js loads before cartPage.js</p>`;
    return;
  }

  const items = window.cartGet();

  if (!items.length) {
    wrap.innerHTML = `
      <div class="empty">
        <p class="sub" style="margin:0;">Your cart is empty.</p>
        <a class="btn primary" href="/shop.html" style="margin-top:10px;">Go to shop</a>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = money(0);
    if (shippingEl) shippingEl.textContent = money(0);
    if (totalEl) totalEl.textContent = money(0);
    return;
  }

  wrap.innerHTML = items
    .map((it, idx) => {
      const img = it.image_url || "/assets/hero.jpg";
      const lineTotal = Number(it.price_cents) * Number(it.qty);

      return `
        <div class="cart-row">
          <img src="${escapeHtml(img)}" alt="${escapeHtml(it.title)}" />

          <div class="cart-mid">
            <div class="cart-title">${escapeHtml(it.title || "Product")}</div>
            ${it.size ? `<div class="sub">Size: ${escapeHtml(it.size)}</div>` : ""}
            <div class="sub">Price: ${money(it.price_cents)}</div>

            <div class="qty">
              <button type="button" data-act="dec" data-idx="${idx}">−</button>
              <strong>${it.qty}</strong>
              <button type="button" data-act="inc" data-idx="${idx}">+</button>
            </div>
          </div>

          <div class="cart-right">
            <div class="price">${money(lineTotal)}</div>
            <button class="btn danger" type="button" data-act="remove" data-idx="${idx}">Remove</button>
          </div>
        </div>
      `;
    })
    .join("");

  const t = calcTotals(items);
  if (subtotalEl) subtotalEl.textContent = money(t.subtotal);
  if (shippingEl) shippingEl.textContent = money(t.shipping);
  if (totalEl) totalEl.textContent = money(t.total);
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-act]");
  if (!btn) return;

  const idx = Number(btn.dataset.idx);
  const act = btn.dataset.act;

  if (typeof window.cartGet !== "function") return;

  const items = window.cartGet();
  if (!items[idx]) return;

  if (act === "inc") window.cartUpdateQty(idx, items[idx].qty + 1);
  if (act === "dec") window.cartUpdateQty(idx, Math.max(1, items[idx].qty - 1));
  if (act === "remove") window.cartRemove(idx);

  renderCart();
});

document.addEventListener("DOMContentLoaded", () => {
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl && typeof window.cartCountNumber === "function") {
    cartCountEl.textContent = String(window.cartCountNumber());
  }

  const clearBtn = document.getElementById("clearCartBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      window.cartClear();
      renderCart();
    });
  }
  renderCart();
});
