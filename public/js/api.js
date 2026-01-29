const API_BASE = "https://neptune-backend.onrender.com"; // same origin (http://localhost:3001)

async function api(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    credentials: "include", // ✅ IMPORTANT: send session cookie
    ...options,
  });

  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText || "Request failed";
    throw new Error(msg);
  }
  return data;
}
