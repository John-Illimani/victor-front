import { api } from "./api";

export const gestionService = {
  getGestiones: async () => {
    try {
      const response = await api.get("/gestiones");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener las gestiones." };
    }
  },

  createGestion: async (data) => {
    try {
      const response = await api.post("/gestiones", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al crear la gestión." };
    }
  },

  updateGestion: async (id, data) => {
    try {
      const response = await api.put(`/gestiones/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al actualizar la gestión." };
    }
  },

  toggleEstadoGestion: async (id, estado) => {
    try {
      const response = await api.patch(`/gestiones/${id}/toggle`, { estado });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al cambiar el estado de la gestión." };
    }
  }
};