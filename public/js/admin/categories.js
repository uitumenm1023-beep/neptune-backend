// public/admin/categories.js
// Requires: admin/categories.html loads ../js/api.js before this file

const form = document.getElementById("catForm");
const list = document.getElementById("list");
const msg = document.getElementById("msg");
const logoutBtn = document.getElementById("logoutBtn");

// Optional: if your form has <input type="file" id="image" name="image">
const imageInput = document.getElementById("image");

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toAbsUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return (window.API_BASE || "") + url;
}

async function ensureAuth() {
  try {
    await api("/api/auth/me");
  } catch {
    window.location.href = "/admin/login.html";
  }
}

function setMsg(text) {
  msg.textContent = text || "";
}

async function uploadImageFile(file) {
  const fd = new FormData();
  fd.append("image", file); // MUST be "image" to match upload.routes.js

  // api() normally sets JSON headers; FormData must NOT set Content-Type manually
  const uploaded = await api("/api/upload", { method: "POST", body: fd, headers: {} });
  return uploaded?.imageUrl || "";
}

async function loadCategories() {
  const cats = await api("/api/categories");
  list.innerHTML = "";

  if (!cats || !cats.length) {
    list.innerHTML = `<p class="muted">No categories yet.</p>`;
    return;
  }

  for (const c of cats) {
    const rawImg = c.image_url || c.imageUrl || "";
    const imgUrl = toAbsUrl(rawImg);

    const el = document.createElement("div");
    el.className = "item";

    el.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center;">
        <div style="width:54px;height:54px;border-radius:12px;overflow:hidden;background:#111;display:flex;align-items:center;justify-content:center;">
          ${
            imgUrl
              ? `<img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(c.name)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy" />`
              : `<span style="font-size:12px;opacity:.6;">No image</span>`
          }
        </div>

        <div>
          <div class="item-title">${escapeHtml(c.name)}</div>
          <div class="item-sub">#${escapeHtml(c.id)}</div>
        </div>
      </div>

      <div class="item-actions" style="display:flex;gap:8px;align-items:center;">
        <label class="small" style="cursor:pointer;">
          <input type="file" accept="image/*" data-file="${c.id}" style="display:none;" />
          <span class="small">Update Image</span>
        </label>

        <button class="small danger" data-del="${c.id}">Delete</button>
      </div>
    `;

    // Delete
    el.querySelector(`[data-del="${c.id}"]`).addEventListener("click", async () => {
      if (!confirm("Delete this category?")) return;
      try {
        await api(`/api/categories/${c.id}`, { method: "DELETE" });
        await loadCategories();
      } catch (err) {
        setMsg(err.message || "Delete failed");
      }
    });

    // Update Image (per-category)
    const fileInput = el.querySelector(`[data-file="${c.id}"]`);
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      setMsg("Uploading...");
      try {
        const imageUrl = await uploadImageFile(file);

        // Save to category (requires PUT /api/categories/:id support)
        await api(`/api/categories/${c.id}`, {
          method: "PUT",
          body: JSON.stringify({ imageUrl }),
          headers: { "Content-Type": "application/json" },
        });

        setMsg("Updated ✅");
        await loadCategories();
      } catch (err) {
        console.error(err);
        setMsg(err.message || "Failed to update image");
      } finally {
        fileInput.value = "";
      }
    });

    list.appendChild(el);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg("");

  const fd = new FormData(form);
  const name = (fd.get("name") || "").trim();

  if (!name) {
    setMsg("Category name is required.");
    return;
  }

  try {
    let imageUrl = "";

    // If user selected an image in the main form
    if (imageInput && imageInput.files && imageInput.files[0]) {
      setMsg("Uploading...");
      imageUrl = await uploadImageFile(imageInput.files[0]);
    }

    setMsg("Saving...");
    await api("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name, imageUrl }),
      headers: { "Content-Type": "application/json" },
    });

    form.reset();
    setMsg("Created ✅");
    await loadCategories();
  } catch (err) {
    console.error(err);
    setMsg(err.message || "Create failed");
  }
});

logoutBtn?.addEventListener("click", async () => {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } finally {
    window.location.href = "/admin/login.html";
  }
});

(async function init() {
  await ensureAuth();
  await loadCategories();
})();
