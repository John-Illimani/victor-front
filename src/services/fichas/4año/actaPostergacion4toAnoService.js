import { api } from "../../api";

export const actaPostergacion4toAnoService = {
  getByEstudiante: async (estudiante_id) => {
    try {
      const response = await api.get(`/4to-ano/acta-postergacion/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al consultar el Acta de Postergación." };
    }
  },

  saveOrUpdate: async (estudiante_id, datos) => {
    try {
      const response = await api.post("/4to-ano/acta-postergacion/guardar", { estudiante_id, datos });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al guardar el Acta de Postergación." };
    }
  },

  delete: async (estudiante_id) => {
    try {
      const response = await api.delete(`/4to-ano/acta-postergacion/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar el Acta de Postergación." };
    }
  }
};