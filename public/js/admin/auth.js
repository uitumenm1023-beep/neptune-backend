console.log("auth.js loaded ✅");

const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");

console.log("form found?", !!form);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("submit fired ✅");

  msg.textContent = "";

  const fd = new FormData(form);
  const username = fd.get("username").trim();
  const password = fd.get("password");

  try {
    const result = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    console.log("login result:", result);
    window.location.href = "/admin/products.html";
  } catch (err) {
    console.error("login error:", err);
    msg.textContent = err.message;
  }
});
