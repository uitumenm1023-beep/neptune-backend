// public/js/admin/auth.js

const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Read inputs by NAME (matches your HTML)
  const username = form.elements["username"].value.trim();
  const password = form.elements["password"].value;

  try {
    await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    // success → go to admin dashboard
    window.location.href = "/admin/index.html";
  } catch (err) {
    msg.textContent = err.message || "Login failed";
  }
});
