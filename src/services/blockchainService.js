import { api } from "./api";

export const blockchainService = {
  /**
   * Certifica el Centralizador de 5to Año en la red Blockchain y en la Base de Datos Local.
   * @param {string} estudiante_id - UUID del estudiante a certificar.
   */
  certificar5toAno: async (estudiante_id) => {
    try {
      const response = await api.post("/blockchain/certificar-5to-ano", { estudiante_id });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al certificar el Centralizador en Blockchain." };
    }
  },

  /**
   * Realiza la verificación pública de un documento mediante su Hash o ID del estudiante.
   * @param {string} hashOrId - Hash criptográfico o UUID del estudiante.
   */
  verificarPublico: async (hashOrId) => {
    try {
      const response = await api.get(`/blockchain/verificar`, {
        params: { hash: hashOrId }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al verificar la autenticidad en Blockchain." };
    }
  }
};