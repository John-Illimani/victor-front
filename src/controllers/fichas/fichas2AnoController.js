// Imports de generadores PDF para 2do Año (Se descomentarán a medida que se implementen):
import { imprimirActaInicio2doAno } from "../../utils/fichas/2año/actaInicio2AnoPdfGenerator";
import { imprimirActaConformacion2doAno } from "../../utils/fichas/2año/actaEquipo2AnoPdfGenerator";
import { imprimirFichaF1_2doAno } from "../../utils/fichas/2año/fichaF1_2AnoPdfGenerator";
import { imprimirFichaF2_2doAno } from "../../utils/fichas/2año/fichaF2_2AnoPdfGenerator";
import { imprimirFichaF3_2doAno } from "../../utils/fichas/2año/fichaF3_2AnoPdfGenerator";
import { imprimirFichaF4_2doAno } from "../../utils/fichas/2año/fichaF4_2AnoPdfGenerator";
import { imprimirFichaF5_2doAno } from "../../utils/fichas/2año/fichaF5_2AnoPdfGenerator";
import { imprimirFichaF6_2doAno } from "../../utils/fichas/2año/fichaF6_2AnoPdfGenerator";
import { imprimirCentralizador2doAno } from "../../utils/fichas/2año/centralizador2AnoPdfGenerator";

export const FICHAS_2DO_ANO = [
  { codigo: "2_ACTA_INICIO", nombre: "Acta de Inicio - 2do Año (IEPC-PEC)" },
  { codigo: "2_ACTA_EQUIPO", nombre: "Acta de Conformación de Equipo Comunitario" },
  { codigo: "2_F1", nombre: "Ficha F-1: Coordinación y Gestión Comunitaria" },
  { codigo: "2_F2", nombre: "Ficha F-2: Asistencia PEC (2 semanas / 10 días)" },
  { codigo: "2_F3", nombre: "Ficha F-3: Aplicación de Técnicas e Instrumentos" },
  { codigo: "2_F4", nombre: "Ficha F-4: Apoyo y Seguimiento Concreción Curricular" },
  { codigo: "2_F5", nombre: "Ficha F-5: Valoración del Docente Acompañante ESFM" },
  { codigo: "2_F6", nombre: "Ficha F-6: Valoración de la Producción IEPC-PEC" },
  { codigo: "CENTRALIZADOR", nombre: "Centralizador de Evaluación 2º Año" },
];

export const ejecutarImpresion2doAno = async (codigo, estudianteId) => {
  switch (codigo) {
    case "2_ACTA_INICIO": return await imprimirActaInicio2doAno(estudianteId);
    case "2_ACTA_EQUIPO": return await imprimirActaConformacion2doAno(estudianteId);
    case "2_F1": return await imprimirFichaF1_2doAno(estudianteId);
    case "2_F2": return await imprimirFichaF2_2doAno(estudianteId);
    case "2_F3": return await imprimirFichaF3_2doAno(estudianteId);
    case "2_F4": return await imprimirFichaF4_2doAno(estudianteId);
    case "2_F5": return await imprimirFichaF5_2doAno(estudianteId);
    case "2_F6": return await imprimirFichaF6_2doAno(estudianteId);
    case "CENTRALIZADOR": return await imprimirCentralizador2doAno(estudianteId);
    default:
      return {
        success: false,
        message: `La plantilla oficial para este documento (2do Año) está siendo configurada en el servidor.`,
      };
  }
};