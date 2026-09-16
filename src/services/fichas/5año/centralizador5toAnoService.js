import { api } from "../../api";

export const centralizador5toAnoService = {
  getByEstudiante: async (estudiante_id) => {
    try {
      const response = await api.get(`/5to-ano/centralizador/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al consultar el Centralizador de 5to Año." };
    }
  },

  saveOrUpdate: async (estudiante_id, datos) => {
    try {
      const response = await api.post("/5to-ano/centralizador/guardar", { estudiante_id, datos });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al guardar el Centralizador de 5to Año." };
    }
  },

  delete: async (estudiante_id) => {
    try {
      const response = await api.delete(`/5to-ano/centralizador/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar el Centralizador de 5to Año." };
    }
  }
};