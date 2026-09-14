import { api } from "./api";

export const guideService = {
  getGuides: async () => {
    try {
      const response = await api.get("/docentes-guia");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener la lista de docentes guía." };
    }
  },

  createGuide: async (guideData) => {
    try {
      const response = await api.post("/docentes-guia", guideData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al crear el docente guía." };
    }
  },

  updateGuide: async (id, guideData) => {
    try {
      const response = await api.put(`/docentes-guia/${id}`, guideData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al actualizar el docente guía." };
    }
  },

  deleteGuide: async (id) => {
    try {
      const response = await api.delete(`/docentes-guia/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar el docente guía." };
    }
  },

  deleteMultipleGuides: async (ids) => {
    try {
      const response = await api.post("/docentes-guia/delete-batch", { ids });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar la lista de docentes guía." };
    }
  },

  importBatchGuides: async (docentes) => {
    try {
      const response = await api.post("/docentes-guia/import-batch", { docentes });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error durante la importación de docentes guía." };
    }
  }
};