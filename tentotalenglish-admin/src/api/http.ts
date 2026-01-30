import axios from "axios";

const raw = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Helper: garantiza que todas las rutas vayan bajo /api
function withApiPrefix(url?: string) {
  if (!url) return url;
  if (url.startsWith("http")) return url;       // ya es absoluta
  if (url.startsWith("/api/")) return url;      // ya trae /api
  if (url === "/api") return url;
  if (url.startsWith("/")) return `/api${url}`; // "/students" -> "/api/students"
  return `/api/${url}`;                          // "students" -> "/api/students"
}

export const http = raw;

http.interceptors.request.use((config) => {
  // ✅ Prefijo automático /api
  config.url = withApiPrefix(config.url);

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
