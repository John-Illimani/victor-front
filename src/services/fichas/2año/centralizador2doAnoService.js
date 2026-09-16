import { api } from "../../api";

export const centralizador2doAnoService = {
  getByEstudiante: async (estudiante_id) => {
    try {
      const response = await api.get(`/2do-ano/centralizador/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al consultar el centralizador de 2do año." };
    }
  },

  saveDetalles: async (estudiante_id, datos) => {
    try {
      const response = await api.post("/2do-ano/centralizador/guardar-detalles", { estudiante_id, datos });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al guardar los detalles del centralizador." };
    }
  }
};