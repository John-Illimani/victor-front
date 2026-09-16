import { api } from "../../api";

export const fichaB13erAnoService = {
  getByEstudiante: async (estudiante_id) => {
    try {
      const response = await api.get(`/3er-ano/ficha-b1/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al consultar la Ficha B-1." };
    }
  },

  saveOrUpdate: async (estudiante_id, datos) => {
    try {
      const response = await api.post("/3er-ano/ficha-b1/guardar", { estudiante_id, datos });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al guardar la Ficha B-1." };
    }
  },

  delete: async (estudiante_id) => {
    try {
      const response = await api.delete(`/3er-ano/ficha-b1/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar la Ficha B-1." };
    }
  }
};