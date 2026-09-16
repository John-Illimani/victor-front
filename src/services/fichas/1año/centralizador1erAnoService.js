import { api } from "../../api";

export const centralizador1erAnoService = {
  getByEstudiante: async (estudiante_id) => {
    try {
      const response = await api.get(`/1er-ano/centralizador/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al consultar el Centralizador." };
    }
  },

  updateFecha: async (estudiante_id, datos) => {
    try {
      const response = await api.post("/1er-ano/centralizador/guardar-fecha", { estudiante_id, datos });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al guardar la fecha de centralización." };
    }
  }
};