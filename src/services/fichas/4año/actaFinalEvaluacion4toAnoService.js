import { api } from "../../api";

export const actaFinalEvaluacion4toAnoService = {
  getByEstudiante: async (estudiante_id) => {
    try {
      const response = await api.get(`/4to-ano/acta-final/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al consultar el Acta Final." };
    }
  },

  saveOrUpdate: async (estudiante_id, datos) => {
    try {
      const response = await api.post("/4to-ano/acta-final/guardar", { estudiante_id, datos });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al guardar el Acta Final." };
    }
  },

  delete: async (estudiante_id) => {
    try {
      const response = await api.delete(`/4to-ano/acta-final/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar el Acta Final." };
    }
  }
};