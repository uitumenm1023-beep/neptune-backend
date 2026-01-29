// public/js/cartBadge.js
function refreshBadge(){
  const el = document.getElementById("cartCount");
  if (!el) return;
  if (typeof window.cartCountNumber === "function") {
    el.textContent = String(window.cartCountNumber());
  }
}

document.addEventListener("DOMContentLoaded", refreshBadge);
window.addEventListener("storage", refreshBadge);
