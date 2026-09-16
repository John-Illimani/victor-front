import { api } from "../../api";

export const fichaF6_2doAnoService = {
  getByEstudiante: async (estudiante_id) => {
    try {
      const response = await api.get(`/2do-ano/ficha-f6/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al consultar la Ficha F-6." };
    }
  },

  saveOrUpdate: async (estudiante_id, datos) => {
    try {
      const response = await api.post("/2do-ano/ficha-f6/guardar", { estudiante_id, datos });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al guardar la Ficha F-6." };
    }
  },

  delete: async (estudiante_id) => {
    try {
      const response = await api.delete(`/2do-ano/ficha-f6/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar la Ficha F-6." };
    }
  }
};