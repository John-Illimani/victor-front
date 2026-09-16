import { api } from "../../api";

export const fichaB54toAnoService = {
  getByEstudiante: async (estudiante_id) => {
    try {
      const response = await api.get(`/4to-ano/ficha-b5/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al consultar la Ficha B-5." };
    }
  },

  saveOrUpdate: async (estudiante_id, datos) => {
    try {
      const response = await api.post("/4to-ano/ficha-b5/guardar", { estudiante_id, datos });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al guardar la Ficha B-5." };
    }
  },

  delete: async (estudiante_id) => {
    try {
      const response = await api.delete(`/4to-ano/ficha-b5/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar la Ficha B-5." };
    }
  }
};