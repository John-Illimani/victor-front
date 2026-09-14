import { api } from "./api";

export const studentService = {
  // Obtener estudiantes
  getStudents: async () => {
    const res = await api.get("/estudiantes");
    return res.data;
  },

  // Crear/Editar Estudiante
  createStudent: async (data) => (await api.post("/estudiantes", data)).data,
  updateStudent: async (id, data) =>
    (await api.put(`/estudiantes/${id}`, data)).data,
  toggleStatus: async (id, estado) =>
    (await api.patch(`/estudiantes/${id}/status`, { estado })).data,
  deleteStudent: async (id) => (await api.delete(`/estudiantes/${id}`)).data,
  deleteBatch: async (ids) =>
    (await api.post("/estudiantes/delete-batch", { ids })).data,
  importBatchStudents: async (estudiantes) =>
    (await api.post("/estudiantes/import-batch", { estudiantes })).data,

  // Operaciones de Fichas
  // studentService.js
  getFicha: async (estudiante_id, codigo_ficha) => {
    try {
      const res = await api.get(`/fichas/${estudiante_id}/${codigo_ficha}`);
      return res.data;
    } catch (error) {
      // Si el backend responde 404, retornamos objeto vacío limpiamente
      if (error.response && error.response.status === 404) {
        return { existe: false, datos: {} };
      }
      throw error;
    }
  },

  saveFicha: async (estudiante_id, codigo_ficha, datos) => {
    const res = await api.post("/fichas/guardar", {
      estudiante_id,
      codigo_ficha,
      datos,
    });
    return res.data;
  },

  deleteFicha: async (estudiante_id, codigo_ficha) => {
    const res = await api.delete(`/fichas/${estudiante_id}/${codigo_ficha}`);
    return res.data;
  },
};
