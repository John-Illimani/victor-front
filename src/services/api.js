import axios from "axios";

export const api = axios.create({
  // baseURL: "http://localhost:40000/api",
  baseURL: "https://victor-back.vercel.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para inyectar automáticamente el Bearer Token en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar expiración de sesión (401 / 403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);