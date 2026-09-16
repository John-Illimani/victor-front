import { api } from "../../api";

export const fichaC14toAnoService = {
  getByEstudiante: async (estudiante_id) => {
    try {
      const response = await api.get(`/4to-ano/ficha-c1/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al consultar la Ficha C-1." };
    }
  },

  saveOrUpdate: async (estudiante_id, datos) => {
    try {
      const response = await api.post("/4to-ano/ficha-c1/guardar", { estudiante_id, datos });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al guardar la Ficha C-1." };
    }
  },

  delete: async (estudiante_id) => {
    try {
      const response = await api.delete(`/4to-ano/ficha-c1/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar la Ficha C-1." };
    }
  }
};