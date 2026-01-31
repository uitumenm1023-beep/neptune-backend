// public/js/api.js
// Global API base (declare ONCE)
window.API_BASE = window.API_BASE || "https://neptune-backend.onrender.com";

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  // Default to JSON when a body is provided and Content-Type isn't set
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(window.API_BASE + path, {
    credentials: "include",
    ...options,
    headers,
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

// OPTIONAL: expose globally if your other scripts need it
window.api = api;
