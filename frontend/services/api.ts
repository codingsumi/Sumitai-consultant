import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  withCredentials: true,
  timeout: 8000,
});

export default api;
