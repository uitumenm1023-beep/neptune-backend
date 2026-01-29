const ordersEl = document.getElementById("orders");
const logoutBtn = document.getElementById("logoutBtn");

function money(cents) {
  return `$${(Number(cents || 0) / 100).toFixed(2)}`;
}

function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadOrders() {
  try {
    const orders = await api("/api/orders");

    if (!orders.length) {
      ordersEl.innerHTML = `<p class="sub">No orders yet.</p>`;
      return;
    }

    ordersEl.innerHTML = orders
      .map(o => `
        <div class="order-card">
          <div class="order-head">
            <div>
              <b>Order #${o.id}</b>
              <div class="sub">${new Date(o.created_at).toLocaleString()}</div>
            </div>
            <div class="price">${money(o.total_cents)}</div>
          </div>

          <div class="order-body">
            <div><b>Name:</b> ${esc(o.customer_name)}</div>
            <div><b>Phone:</b> ${esc(o.phone)}</div>
            <div><b>Address:</b> ${esc(o.address)}</div>
            <div><b>Status:</b> ${esc(o.status)}</div>
          </div>

          <div class="order-items">
            <b>Items</b>
            <ul>
              ${o.items.map(it => `
                <li>
                  ${esc(it.title)}
                  ${it.size ? `(${esc(it.size)})` : ""}
                  × ${it.qty}
                  — ${money(it.price_cents * it.qty)}
                </li>
              `).join("")}
            </ul>
          </div>
        </div>
      `)
      .join("");
  } catch (err) {
    console.error(err);
    ordersEl.innerHTML = `<p class="sub">${err.message}</p>`;
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    window.location.href = "/admin/login.html";
  });
}

loadOrders();
