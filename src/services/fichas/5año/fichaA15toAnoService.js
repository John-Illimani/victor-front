import { api } from "../../api";

export const fichaA15toAnoService = {
  getByEstudiante: async (estudiante_id) => {
    try {
      const response = await api.get(`/5to-ano/ficha-a1/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al consultar la Ficha A-1 de 5to Año." };
    }
  },

  saveOrUpdate: async (estudiante_id, datos) => {
    try {
      const response = await api.post("/5to-ano/ficha-a1/guardar", { estudiante_id, datos });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al guardar la Ficha A-1 de 5to Año." };
    }
  },

  delete: async (estudiante_id) => {
    try {
      const response = await api.delete(`/5to-ano/ficha-a1/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar la Ficha A-1 de 5to Año." };
    }
  }
};