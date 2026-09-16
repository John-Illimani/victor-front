import { api } from "./api";

export const teacherService = {
  getTeachers: async () => {
    try {
      const response = await api.get("/docentes-acompanantes");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener la lista de docentes acompañantes." };
    }
  },

  createTeacher: async (teacherData) => {
    try {
      const response = await api.post("/docentes-acompanantes", teacherData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al crear el docente acompañante." };
    }
  },

  updateTeacher: async (id, teacherData) => {
    try {
      const response = await api.put(`/docentes-acompanantes/${id}`, teacherData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al actualizar el docente acompañante." };
    }
  },

  deleteTeacher: async (id) => {
    try {
      const response = await api.delete(`/docentes-acompanantes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar el docente acompañante." };
    }
  },

  deleteMultipleTeachers: async (ids) => {
    try {
      const response = await api.post("/docentes-acompanantes/delete-batch", { ids });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar la lista de docentes acompañantes." };
    }
  },

  importBatchTeachers: async (docentes) => {
    try {
      const response = await api.post("/docentes-acompanantes/import-batch", { docentes });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error durante la importación de docentes acompañantes." };
    }
  },

  getAssignedStudents: async (docenteId) => {
    try {
      const response = await api.get(`/docentes-acompanantes/${docenteId}/estudiantes`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener estudiantes asignados." };
    }
  },

  assignStudent: async (docenteId, estudianteId) => {
    try {
      const response = await api.post("/docentes-acompanantes/asignar-estudiante", {
        docente_id: docenteId,
        estudiante_id: estudianteId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al asignar el estudiante." };
    }
  },

  unassignStudent: async (docenteId, estudianteId) => {
    try {
      const response = await api.post("/docentes-acompanantes/desasignar-estudiante", {
        docente_id: docenteId,
        estudiante_id: estudianteId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al quitar la asignación." };
    }
  },

  toggleFormularioDocente: async (docenteId, formularioKey, habilitado) => {
    try {
      const response = await api.patch("/docentes-acompanantes/toggle-formulario-docente", {
        docente_id: docenteId,
        formulario_key: formularioKey,
        habilitado
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al guardar la configuración del formulario." };
    }
  }
};