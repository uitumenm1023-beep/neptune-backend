// js/admin/auth.js

(function () {
  const form = document.getElementById("loginForm");
  const msg = document.getElementById("msg");

  if (!form) {
    console.error("loginForm not found");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // <-- THIS prevents Netlify 404 form POST
    if (msg) msg.textContent = "";

    const username = form.elements["username"]?.value?.trim();
    const password = form.elements["password"]?.value;

    if (!username || !password) {
      if (msg) msg.textContent = "Missing username/password";
      return;
    }

    try {
      await window.api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      // go to admin home (adjust if your dashboard file is different)
      window.location.href = "/admin/products.html";
    } catch (err) {
      if (msg) msg.textContent = err.message || "Login failed";
    }
  });
})();
