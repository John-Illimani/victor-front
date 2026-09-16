import { api } from "../../api";

export const actaConformacion2doAnoService = {
  getByEstudiante: async (estudiante_id) => {
    try {
      const response = await api.get(`/2do-ano/acta-conformacion/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al consultar el Acta de Conformación." };
    }
  },

  saveOrUpdate: async (estudiante_id, datos) => {
    try {
      const response = await api.post("/2do-ano/acta-conformacion/guardar", { estudiante_id, datos });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al guardar el Acta de Conformación." };
    }
  },

  delete: async (estudiante_id) => {
    try {
      const response = await api.delete(`/2do-ano/acta-conformacion/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar el Acta de Conformación." };
    }
  }
};