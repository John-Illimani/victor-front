import { api } from "../../api";

export const fichaF4Service = {
  getByEstudiante: async (estudiante_id) => {
    try {
      const response = await api.get(`/1er-ano/ficha-f4/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al consultar la Ficha F-4." };
    }
  },

  saveOrUpdate: async (estudiante_id, datos) => {
    try {
      const response = await api.post("/1er-ano/ficha-f4/guardar", { estudiante_id, datos });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al guardar los datos de la Ficha F-4." };
    }
  },

  delete: async (estudiante_id) => {
    try {
      const response = await api.delete(`/1er-ano/ficha-f4/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar el registro de la Ficha F-4." };
    }
  }
};