import { api } from "./api";

export const actaService = {
  getActasByGestionAno: async (gestion, ano) => {
    try {
      const res = await api.get(`/actas/${gestion}/${ano}`);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener las actas." };
    }
  },

  getHistorialActa: async (estudianteId) => {
    try {
      const res = await api.get(`/actas/historial/${estudianteId}`);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener el historial." };
    }
  },

  registrarHistorial: async (data) => {
    try {
      const res = await api.post("/actas/historial", data);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al registrar en el historial." };
    }
  }
};