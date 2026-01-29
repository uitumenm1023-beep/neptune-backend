// public/js/api.js
// Global API base (declare ONCE)
window.API_BASE = window.API_BASE || "https://neptune-backend.onrender.com";

async function api(path, options = {}) {
  const res = await fetch(window.API_BASE + path, {
    credentials: "include",
    headers: { ...(options.headers || {}) },
    ...options,
  });

  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const data = isJson ? await res.json() : await res.text().catch(() => "");

  if (!res.ok) {
    const msg =
      (isJson && (data?.error || data?.message)) ||
      (typeof data === "string" && data) ||
      res.statusText ||
      "Request failed";
    throw new Error(msg);
  }
  return data;
}
