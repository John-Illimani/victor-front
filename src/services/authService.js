import { api } from "./api";

export const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post("/login", { username, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error de conexión con el servidor" };
    }
  },

  verifyToken: async () => {
    try {
      const response = await api.get("/verify-token");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Token inválido o expirado" };
    }
  },

  // Petición a la API para cerrar sesión e invalidar datos localmente
  logout: async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.warn("Aviso: El servidor respondió con error o sin conexión durante el logout:", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }
  }
};