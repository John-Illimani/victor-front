import { api } from "./api";

export const studentService = {
  getStudents: async () => {
    try {
      const res = await api.get("/estudiantes");
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al consultar la lista de estudiantes." };
    }
  },

  createStudent: async (data) => {
    try {
      const res = await api.post("/estudiantes", data);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al registrar el estudiante." };
    }
  },

  updateStudent: async (id, data) => {
    try {
      const res = await api.put(`/estudiantes/${id}`, data);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al actualizar el estudiante." };
    }
  },

  toggleStatus: async (id, estado) => {
    try {
      const res = await api.patch(`/estudiantes/${id}/status`, { estado });
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al cambiar el estado del estudiante." };
    }
  },

  deleteStudent: async (id) => {
    try {
      const res = await api.delete(`/estudiantes/${id}`);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar el estudiante." };
    }
  },

  deleteBatch: async (ids) => {
    try {
      const res = await api.post("/estudiantes/delete-batch", { ids });
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar la lista de estudiantes." };
    }
  },

  importBatchStudents: async (estudiantes) => {
    try {
      const res = await api.post("/estudiantes/import-batch", { estudiantes });
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: "Error durante la importación masiva." };
    }
  }
};