// Imports de generadores PDF para 3er Año:
import { imprimirActaEquipo3erAno } from "../../utils/fichas/3año/actaEquipo3AnoPdfGenerator";
import { imprimirActaInicio3erAno } from "../../utils/fichas/3año/actaInicio3AnoPdfGenerator";
import { imprimirActaSocializacion3erAno } from "../../utils/fichas/3año/actaSocializacion3AnoPdfGenerator";
import { imprimirFichaA1_3erAno } from "../../utils/fichas/3año/fichaA1_3AnoPdfGenerator";
import { imprimirFichaB1_3erAno } from "../../utils/fichas/3año/fichaB1_3AnoPdfGenerator";
import { imprimirFichaB2_3erAno } from "../../utils/fichas/3año/fichaB2_3AnoPdfGenerator";
import { imprimirFichaB3_3erAno } from "../../utils/fichas/3año/fichaB3_3AnoPdfGenerator";
import { imprimirFichaB4_3erAno } from "../../utils/fichas/3año/fichaB4_3AnoPdfGenerator";
import { imprimirFichaB5_3erAno } from "../../utils/fichas/3año/fichaB5_3AnoPdfGenerator";
import { imprimirCentralizador3erAno } from "../../utils/fichas/3año/centralizador3AnoPdfGenerator";

export const FICHAS_3ER_ANO = [
  { codigo: "3_ACTA_EQUIPO", nombre: "Acta de Conformación y Compromiso de Equipo" },
  { codigo: "3_ACTA_INICIO", nombre: "Acta de Inicio - 3er Año" },
  { codigo: "3_ACTA_SOCIALIZACION", nombre: "Acta de Socialización del Diagnóstico" },
  { codigo: "3_A1", nombre: "Ficha A-1: Técnicas e Instrumentos de Investigación" },
  { codigo: "3_B1", nombre: "Ficha B-1: Apoyo y Seguimiento Docente Acompañante" },
  { codigo: "3_B2", nombre: "Ficha B-2: Asistencia PEC (4 semanas)" },
  { codigo: "3_B3", nombre: "Ficha B-3: Apoyo Docente Guía Concreción Curricular" },
  { codigo: "3_B4", nombre: "Ficha B-4: Seguimiento y Apoyo Docente Tutor" },
  { codigo: "3_B5", nombre: "Ficha B-5: Presentación Informe Diagnóstico Socioparticipativo" },
  { codigo: "CENTRALIZADOR", nombre: "Centralizador de Evaluación 3º Año" },
];

export const ejecutarImpresion3erAno = async (codigo, estudianteId) => {
  switch (codigo) {
    case "3_ACTA_EQUIPO": return await imprimirActaEquipo3erAno(estudianteId);
    case "3_ACTA_INICIO": return await imprimirActaInicio3erAno(estudianteId);
    case "3_ACTA_SOCIALIZACION": return await imprimirActaSocializacion3erAno(estudianteId);
    case "3_A1": return await imprimirFichaA1_3erAno(estudianteId);
    case "3_B1": return await imprimirFichaB1_3erAno(estudianteId);
    case "3_B2": return await imprimirFichaB2_3erAno(estudianteId);
    case "3_B3": return await imprimirFichaB3_3erAno(estudianteId);
    case "3_B4": return await imprimirFichaB4_3erAno(estudianteId);
    case "3_B5": return await imprimirFichaB5_3erAno(estudianteId);
    case "CENTRALIZADOR": return await imprimirCentralizador3erAno(estudianteId);
    default:
      return {
        success: false,
        message: `La plantilla oficial para este documento (3er Año) está siendo configurada en el servidor.`,
      };
  }
};