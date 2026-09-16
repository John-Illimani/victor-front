import { api } from "../../api";

export const fichaF5Service = {
  getByEstudiante: async (estudiante_id) => {
    try {
      const response = await api.get(`/1er-ano/ficha-f5/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al consultar la Ficha F-5." };
    }
  },

  saveOrUpdate: async (estudiante_id, datos) => {
    try {
      const response = await api.post("/1er-ano/ficha-f5/guardar", { estudiante_id, datos });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al guardar los datos de la Ficha F-5." };
    }
  },

  delete: async (estudiante_id) => {
    try {
      const response = await api.delete(`/1er-ano/ficha-f5/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar el registro de la Ficha F-5." };
    }
  }
};