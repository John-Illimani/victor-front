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
      throw error.response?.data || { message: "Error al crear el usuario." };
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

  // FUNCIÓN QUE FALTABA: Cambiar estado (ACTIVO / INACTIVO)
  toggleUserStatus: async (id, estado) => {
    try {
      const response = await api.patch(`/usuarios/${id}/status`, { estado });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al cambiar el estado del usuario." };
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
      throw error.response?.data || { message: "Error en la importación masiva de usuarios." };
    }
  },
  
  updateProfile: async (userData) => {
    try {
      const response = await api.put("/usuarios/me/perfil", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al actualizar la información del perfil." };
    }
  },

  changePassword: async (passwords) => {
    try {
      const response = await api.put("/usuarios/me/password", passwords);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al cambiar la contraseña." };
    }
  },
  getProfile: async () => {
    try {
      const response = await api.get("/usuarios/me");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener el perfil actual." };
    }
  },
 

};