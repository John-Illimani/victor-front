import { api } from "./api";

export const especialidadService = {
  getEspecialidades: async () => {
    try {
      const response = await api.get("/especialidades");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al cargar especialidades." };
    }
  },

  createEspecialidad: async (data) => {
    try {
      const response = await api.post("/especialidades", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al crear especialidad." };
    }
  },

  updateEspecialidad: async (id, data) => {
    try {
      const response = await api.put(`/especialidades/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al actualizar especialidad." };
    }
  },

  deleteEspecialidad: async (id) => {
    try {
      const response = await api.delete(`/especialidades/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar especialidad." };
    }
  }
};