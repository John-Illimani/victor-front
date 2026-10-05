import { api } from "./api";

export const auditoriaService = {
  getLogs: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.rol) params.append("rol", filters.rol);
      if (filters.tabla) params.append("tabla", filters.tabla);
      if (filters.operacion) params.append("operacion", filters.operacion);
      if (filters.search) params.append("search", filters.search);

      const response = await api.get(`/auditoria?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al consultar el historial de auditoría." };
    }
  }
};