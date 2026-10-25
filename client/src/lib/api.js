// In development, requests go to "/api" and Vite proxies them to the
// Express server (see vite.config.js). In production, VITE_API_URL
// points at the deployed backend.
const API_BASE = import.meta.env.VITE_API_URL || "/api";

const TOKEN_KEY = "rewind_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      "Could not reach the server. Is the backend running? (On the free tier it may need up to a minute to wake up.)"
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: () => request("/auth/me"),

  listMemories: () => request("/memories"),
  getMemory: (id) => request(`/memories/${id}`),
  createMemory: (payload) => request("/memories", { method: "POST", body: payload }),
  deleteMemory: (id) => request(`/memories/${id}`, { method: "DELETE" }),
  toggleLike: (id) => request(`/memories/${id}/like`, { method: "POST" }),
  getComments: (id) => request(`/memories/${id}/comments`),
  addComment: (id, text) => request(`/memories/${id}/comments`, { method: "POST", body: { text } }),
  deleteComment: (id, commentId) =>
    request(`/memories/${id}/comments/${commentId}`, { method: "DELETE" }),
};

// Small client-side mirror of the server's Drive ID parser, used only
// for the live thumbnail preview on the Add Memory form. The server
// always re-validates on submit.
export function parseDriveIdClient(input) {
  if (!input) return null;
  const trimmed = String(input).trim();
  if (/^[a-zA-Z0-9_-]{25,}$/.test(trimmed)) return trimmed;
  const m =
    trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m && m[1].length >= 10 ? m[1] : null;
}

export const thumbUrl = (driveId, size = 1000) =>
  `https://drive.google.com/thumbnail?id=${driveId}&sz=w${size}`;

// Artwork through our own server (cached proxy). Drive's thumbnail
// endpoints rate-limit direct browser traffic (HTTP 429), so the app
// loads images from here first and treats the direct Drive URLs as
// fallbacks.
export const mediaThumbUrl = (driveId, size = 1000) =>
  `${API_BASE}/media/${driveId}/thumb?size=${size}`;
