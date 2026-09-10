import { api } from "./api";

export const studentService = {
  getStudents: async () => {
    try {
      const response = await api.get("/estudiantes");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener la lista de estudiantes." };
    }
  },

  createStudent: async (studentData) => {
    try {
      const response = await api.post("/estudiantes", studentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al crear el estudiante." };
    }
  },

  updateStudent: async (id, studentData) => {
    try {
      const response = await api.put(`/estudiantes/${id}`, studentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al actualizar el estudiante." };
    }
  },

  deleteStudent: async (id) => {
    try {
      const response = await api.delete(`/estudiantes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar el estudiante." };
    }
  },

  deleteMultipleStudents: async (ids) => {
    try {
      const response = await api.post("/estudiantes/delete-batch", { ids });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar la lista de estudiantes." };
    }
  },

  importBatchStudents: async (estudiantes) => {
    try {
      const response = await api.post("/estudiantes/import-batch", { estudiantes });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al importar el archivo de estudiantes." };
    }
  }
};