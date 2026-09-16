import { api } from "../../api";

export const actaConformacionService = {
  // RUTA ESPECÍFICA DE 1ER AÑO (Evita la ruta genérica /fichas/...)
  getByEstudiante: async (estudiante_id) => {
    try {
      const response = await api.get(`/1er-ano/acta-conformacion/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al consultar el Acta." };
    }
  },

  saveOrUpdate: async (estudiante_id, datos) => {
    try {
      const response = await api.post("/1er-ano/acta-conformacion/guardar", { estudiante_id, datos });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al guardar el Acta." };
    }
  },

  delete: async (estudiante_id) => {
    try {
      const response = await api.delete(`/1er-ano/acta-conformacion/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar el Acta." };
    }
  }
};