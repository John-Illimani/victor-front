import { api } from "./api";

export const blockchainService = {


  /**
   * Certifica el Centralizador de 1er Año en la red Blockchain y en la BD Local.
   * @param {string} estudiante_id - UUID del estudiante a certificar.
   */
  certificar1erAno: async (estudiante_id) => {
    try {
      const response = await api.post("/blockchain/certificar-1er-ano", { estudiante_id });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al certificar el Centralizador de 1er Año en Blockchain." };
    }
  },


  /**
   * Certifica el Centralizador de 2do Año en la red Blockchain y en la BD Local.
   * @param {string} estudiante_id - UUID del estudiante a certificar.
   */
  certificar2doAno: async (estudiante_id) => {
    try {
      const response = await api.post("/blockchain/certificar-2do-ano", { estudiante_id });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al certificar el Centralizador de 2do Año en Blockchain." };
    }
  },


  /**
   * Certifica el Centralizador de 3er Año en la red Blockchain y en la BD Local.
   * @param {string} estudiante_id - UUID del estudiante a certificar.
   */
  certificar3erAno: async (estudiante_id) => {
    try {
      const response = await api.post("/blockchain/certificar-3er-ano", { estudiante_id });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al certificar el Centralizador de 3er Año en Blockchain." };
    }
  },

  /**
   * Certifica el Centralizador de 4to Año en la red Blockchain y en la BD Local.
   * @param {string} estudiante_id - UUID del estudiante a certificar.
   */
  certificar4toAno: async (estudiante_id) => {
    try {
      const response = await api.post("/blockchain/certificar-4to-ano", { estudiante_id });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al certificar el Centralizador de 4to Año en Blockchain." };
    }
  },



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