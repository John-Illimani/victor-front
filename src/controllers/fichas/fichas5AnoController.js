// Imports de generadores PDF para 5to Año:
import { imprimirFichaA1_5toAno } from "../../utils/fichas/5año/fichaA1_5AnoPdfGenerator";
import { imprimirFichaB1_5toAno } from "../../utils/fichas/5año/fichaB1_5AnoPdfGenerator";
import { imprimirFichaB2_5toAno } from "../../utils/fichas/5año/fichaB2_5AnoPdfGenerator";
import { imprimirFichaB3_5toAno } from "../../utils/fichas/5año/fichaB3_5AnoPdfGenerator";
import { imprimirFichaB4_5toAno } from "../../utils/fichas/5año/fichaB4_5AnoPdfGenerator";
import { imprimirFichaB5_5toAno } from "../../utils/fichas/5año/fichaB5_5AnoPdfGenerator";
import { imprimirFichaB6_5toAno } from "../../utils/fichas/5año/fichaB6_5AnoPdfGenerator";
import { imprimirFichaC1_5toAno } from "../../utils/fichas/5año/fichaC1_5AnoPdfGenerator";
import { imprimirFichaC2_5toAno } from "../../utils/fichas/5año/fichaC2_5AnoPdfGenerator";
import { imprimirActaPostergacion5toAno } from "../../utils/fichas/5año/actaPostergacion5AnoPdfGenerator";
import { imprimirCentralizador5toAno } from "../../utils/fichas/5año/centralizador5AnoPdfGenerator";

export const FICHAS_5TO_ANO = [
  { codigo: "5_A1", nombre: "Ficha A-1: Planificación y Elaboración de PDC" },
  { codigo: "5_B1", nombre: "Ficha B-1: Control de Asistencia PEC (10 Semanas)" },
  { codigo: "5_B2", nombre: "Ficha B-2: Concreción Curricular - Aplicación del PDC" },
  { codigo: "5_B3", nombre: "Ficha B-3: Valoración de la Clase Comunitaria" },
  { codigo: "5_B4", nombre: "Ficha B-4: Centralizador de Desarrollo de PDC" },
  { codigo: "5_B5", nombre: "Ficha B-5: Centralizador Seguimiento y Apoyo del Docente Guía" },
  { codigo: "5_B6", nombre: "Ficha B-6: Apoyo y Seguimiento Docente Tutor Acompañante" },
  { codigo: "5_C1", nombre: "Ficha C-1: Evaluación del Documento de Trabajo de Grado" },
  { codigo: "5_C2", nombre: "Ficha C-2: Socialización del Trabajo de Grado" },
  { codigo: "5_ACTA_POSTERGACION", nombre: "Acta de Postergación de la Socialización de Trabajo de Grado" },
  { codigo: "CENTRALIZADOR", nombre: "Ficha Centralizadora Cualitativa-Cuantitativa (5to Año)" },
];

export const ejecutarImpresion5toAno = async (codigo, estudianteId) => {
  switch (codigo) {
    case "5_A1": return await imprimirFichaA1_5toAno(estudianteId);
    case "5_B1": return await imprimirFichaB1_5toAno(estudianteId);
    case "5_B2": return await imprimirFichaB2_5toAno(estudianteId);
    case "5_B3": return await imprimirFichaB3_5toAno(estudianteId);
    case "5_B4": return await imprimirFichaB4_5toAno(estudianteId);
    case "5_B5": return await imprimirFichaB5_5toAno(estudianteId);
    case "5_B6": return await imprimirFichaB6_5toAno(estudianteId);
    case "5_C1": return await imprimirFichaC1_5toAno(estudianteId);
    case "5_C2": return await imprimirFichaC2_5toAno(estudianteId);
    case "5_ACTA_POSTERGACION": return await imprimirActaPostergacion5toAno(estudianteId);
    case "CENTRALIZADOR": return await imprimirCentralizador5toAno(estudianteId);
    default:
      return {
        success: false,
        message: `La plantilla oficial para este documento (5to Año) está siendo configurada en el servidor.`,
      };
  }
};