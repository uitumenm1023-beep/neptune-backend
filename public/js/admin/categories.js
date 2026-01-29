const form = document.getElementById("catForm");
const list = document.getElementById("list");
const msg = document.getElementById("msg");
const logoutBtn = document.getElementById("logoutBtn");

async function ensureAuth() {
  try { await api("/api/auth/me"); }
  catch { window.location.href = "/admin/login.html"; }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadCategories() {
  const cats = await api("/api/categories");
  list.innerHTML = "";

  if (!cats.length) {
    list.innerHTML = `<p class="muted">No categories yet.</p>`;
    return;
  }

  for (const c of cats) {
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div>
        <div class="item-title">${escapeHtml(c.name)}</div>
        <div class="item-sub">#${c.id}</div>
      </div>
      <div class="item-actions">
        <button class="small danger" data-del="${c.id}">Delete</button>
      </div>
    `;
    el.querySelector("[data-del]").addEventListener("click", async () => {
      if (!confirm("Delete this category?")) return;
      await api(`/api/categories/${c.id}`, { method: "DELETE" });
      await loadCategories();
    });
    list.appendChild(el);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  const fd = new FormData(form);
  const name = fd.get("name").trim();

  try {
    await api("/api/categories", { method: "POST", body: JSON.stringify({ name }) });
    form.reset();
    await loadCategories();
  } catch (err) {
    msg.textContent = err.message;
  }
});

logoutBtn.addEventListener("click", async () => {
  await api("/api/auth/logout", { method: "POST" });
  window.location.href = "/admin/login.html";
});

(async function init() {
  await ensureAuth();
  await loadCategories();
})();
