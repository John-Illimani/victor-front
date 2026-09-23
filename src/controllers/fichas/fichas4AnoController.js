// Imports de generadores PDF para 4to Año:
import { imprimirFichaA1_4toAno } from "../../utils/fichas/4año/fichaA1_4AnoPdfGenerator";
import { imprimirFichaA2_4toAno } from "../../utils/fichas/4año/fichaA2_4AnoPdfGenerator";
import { imprimirFichaB1_4toAno } from "../../utils/fichas/4año/fichaB1_4AnoPdfGenerator";
import { imprimirFichaB2_4toAno } from "../../utils/fichas/4año/fichaB2_4AnoPdfGenerator";
import { imprimirFichaB3_4toAno } from "../../utils/fichas/4año/fichaB3_4AnoPdfGenerator";
import { imprimirFichaB4_4toAno } from "../../utils/fichas/4año/fichaB4_4AnoPdfGenerator";
import { imprimirFichaB5_4toAno } from "../../utils/fichas/4año/fichaB5_4AnoPdfGenerator";
import { imprimirFichaB6_4toAno } from "../../utils/fichas/4año/fichaB6_4AnoPdfGenerator";
import { imprimirFichaB7_4toAno } from "../../utils/fichas/4año/fichaB7_4AnoPdfGenerator";
import { imprimirFichaC1_4toAno } from "../../utils/fichas/4año/fichaC1_4AnoPdfGenerator";
import { imprimirFichaC2_4toAno } from "../../utils/fichas/4año/fichaC2_4AnoPdfGenerator";
import { imprimirActaFinal4toAno } from "../../utils/fichas/4año/actaFinal4AnoPdfGenerator";
import { imprimirActaPostergacion4toAno } from "../../utils/fichas/4año/actaPostergacion4AnoPdfGenerator";
import { imprimirCentralizador4toAno } from "../../utils/fichas/4año/centralizador4AnoPdfGenerator";

export const FICHAS_4TO_ANO = [
  { codigo: "4_A1", nombre: "Ficha A-1: Técnicas e Instrumentos de Investigación" },
  { codigo: "4_A2", nombre: "Ficha A-2: Elaboración de PDC (4 a 6 PDC)" },
  { codigo: "4_B1", nombre: "Ficha B-1: Control de Asistencia PEC (6 semanas)" },
  { codigo: "4_B2", nombre: "Ficha B-2: Concreción Curricular - Desarrollo del PDC" },
  { codigo: "4_B3", nombre: "Ficha B-3: Valoración de la Clase Comunitaria" },
  { codigo: "4_B4", nombre: "Ficha B-4: Centralizador Concreción Curricular" },
  { codigo: "4_B5", nombre: "Ficha B-5: Seguimiento y Apoyo de la/el Docente Guía" },
  { codigo: "4_B6", nombre: "Ficha B-6: Seguimiento y Apoyo Docente Tutor Acompañante" },
  { codigo: "4_B7", nombre: "Ficha B-7: Diagnóstico Socioparticipativo de la UE/CEA/CEE" },
  { codigo: "4_C1", nombre: "Ficha C-1: Evaluación Documento de Diseño Metodológico" },
  { codigo: "4_C2", nombre: "Ficha C-2: Socialización del Diseño Metodológico" },
  { codigo: "4_ACTA_FINAL", nombre: "Acta Final de Evaluación del Diseño Metodológico" },
  { codigo: "4_ACTA_POSTERGACION", nombre: "Acta de Postergación de la Socialización Oral" },
  { codigo: "CENTRALIZADOR", nombre: "Ficha Centralizadora de Evaluación 4to Año" },
];

export const ejecutarImpresion4toAno = async (codigo, estudianteId) => {
  switch (codigo) {
    case "4_A1": return await imprimirFichaA1_4toAno(estudianteId);
    case "4_A2": return await imprimirFichaA2_4toAno(estudianteId);
    case "4_B1": return await imprimirFichaB1_4toAno(estudianteId);
    case "4_B2": return await imprimirFichaB2_4toAno(estudianteId);
    case "4_B3": return await imprimirFichaB3_4toAno(estudianteId);
    case "4_B4": return await imprimirFichaB4_4toAno(estudianteId);
    case "4_B5": return await imprimirFichaB5_4toAno(estudianteId);
    case "4_B6": return await imprimirFichaB6_4toAno(estudianteId);
    case "4_B7": return await imprimirFichaB7_4toAno(estudianteId);
    case "4_C1": return await imprimirFichaC1_4toAno(estudianteId);
    case "4_C2": return await imprimirFichaC2_4toAno(estudianteId);
    case "4_ACTA_FINAL": return await imprimirActaFinal4toAno(estudianteId);
    case "4_ACTA_POSTERGACION": return await imprimirActaPostergacion4toAno(estudianteId);
    case "CENTRALIZADOR": return await imprimirCentralizador4toAno(estudianteId);
    default:
      return {
        success: false,
        message: `La plantilla oficial para este documento (4to Año) está siendo configurada en el servidor.`,
      };
  }
};