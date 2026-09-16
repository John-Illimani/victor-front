import { api } from "../../api";

export const actaPostergacion5toAnoService = {
  getByEstudiante: async (estudiante_id) => {
    try {
      const response = await api.get(`/5to-ano/acta-postergacion/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al consultar el Acta de Postergación de 5to Año." };
    }
  },

  saveOrUpdate: async (estudiante_id, datos) => {
    try {
      const response = await api.post("/5to-ano/acta-postergacion/guardar", { estudiante_id, datos });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al guardar el Acta de Postergación de 5to Año." };
    }
  },

  delete: async (estudiante_id) => {
    try {
      const response = await api.delete(`/5to-ano/acta-postergacion/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar el Acta de Postergación de 5to Año." };
    }
  }
};