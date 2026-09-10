import { api } from "./api";

export const userService = {
  getUsers: async () => {
    try {
      const response = await api.get("/usuarios");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener la lista de usuarios." };
    }
  },

  createUser: async (userData) => {
    try {
      const response = await api.post("/usuarios", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al registrar el usuario." };
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/usuarios/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al actualizar el usuario." };
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar el usuario." };
    }
  },

  deleteMultipleUsers: async (ids) => {
    try {
      const response = await api.post("/usuarios/delete-batch", { ids });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar la lista de usuarios." };
    }
  },

  importBatchUsers: async (usuarios) => {
    try {
      const response = await api.post("/usuarios/import-batch", { usuarios });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error durante la importación masiva." };
    }
  }
};