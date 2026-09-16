import { api } from "../../api";

export const fichaF1Service = {
  // 1. Obtener la Ficha F-1 de un estudiante
  getByEstudiante: async (estudiante_id) => {
    try {
      const response = await api.get(`/1er-ano/ficha-f1/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al consultar la Ficha F-1." };
    }
  },

  // 2. Guardar o Actualizar la Ficha F-1 (Upsert)
  saveOrUpdate: async (estudiante_id, datos) => {
    try {
      const response = await api.post("/1er-ano/ficha-f1/guardar", { estudiante_id, datos });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al guardar los datos de la Ficha F-1." };
    }
  },

  // 3. Eliminar el registro de la Ficha F-1
  delete: async (estudiante_id) => {
    try {
      const response = await api.delete(`/1er-ano/ficha-f1/${estudiante_id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar el registro de la Ficha F-1." };
    }
  }
};