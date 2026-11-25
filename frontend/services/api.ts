import axios from "axios";

const api = axios.create({
  // Prefer same-origin `/api` (Next rewrite) so session cookies work on mobile Safari.
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  withCredentials: true,
  // Mobile + cold starts (Render) need more headroom than desktop.
  timeout: 30000,
});

export default api;
