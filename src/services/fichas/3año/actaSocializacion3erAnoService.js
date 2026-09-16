import { api } from "../../api";

export const actaSocializacion3erAnoService = {
  getByEstudiante: async (estudiante_id) => {
    try {
      const response = await api.get(`/3er-ano/acta-socializacion/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al consultar el Acta de Socialización." };
    }
  },

  saveOrUpdate: async (estudiante_id, datos) => {
    try {
      const response = await api.post("/3er-ano/acta-socializacion/guardar", { estudiante_id, datos });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al guardar el Acta de Socialización." };
    }
  },

  delete: async (estudiante_id) => {
    try {
      const response = await api.delete(`/3er-ano/acta-socializacion/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar el Acta de Socialización." };
    }
  }
};