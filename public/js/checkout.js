const totalEl = document.getElementById("total");
const form = document.getElementById("form");
const msg = document.getElementById("msg");

function dollars(c){ return (Number(c)/100).toFixed(2); }

function refreshTotal() {
  totalEl.textContent = `$${dollars(cartTotalCents())}`;
}
refreshTotal();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  const items = cartGet();
  if (!items.length) {
    msg.textContent = "Your cart is empty.";
    return;
  }

  const fd = new FormData(form);
  const payload = {
    customer_name: fd.get("customer_name").trim(),
    phone: fd.get("phone").trim(),
    address: fd.get("address").trim(),
    items,
  };

  try {
    const res = await api("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    cartClear();
    window.location.href = `/thankyou.html?orderId=${res.orderId}`;
  } catch (err) {
    msg.textContent = err.message;
  }
});
