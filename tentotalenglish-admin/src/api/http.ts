import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

function addApiPrefix(url?: string) {
  if (!url) return url;
  if (url.startsWith("http")) return url;       // absoluta
  if (url.startsWith("/api/")) return url;      // ya trae /api
  if (url.startsWith("/")) return `/api${url}`; // "/students" -> "/api/students"
  return `/api/${url}`;                         // "students" -> "/api/students"
} 

http.interceptors.request.use((config) => {
  config.url = addApiPrefix(config.url);

  const token = localStorage.getItem("access_token");
  config.headers = config.headers ?? {};
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
