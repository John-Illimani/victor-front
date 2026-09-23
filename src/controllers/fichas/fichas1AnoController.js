import { imprimirActaConformacion1erAno } from "../../utils/fichas/1año/actaPdfGenerator";
import { imprimirFichaF1_1erAno } from "../../utils/fichas/1año/fichaF1PdfGenerator";
// Próximos imports que iremos habilitando:
import { imprimirFichaF2_1erAno } from "../../utils/fichas/1año/fichaF2PdfGenerator";
import { imprimirFichaF3_1erAno } from "../../utils/fichas/1año/fichaF3PdfGenerator";
import { imprimirFichaF4_1erAno } from "../../utils/fichas/1año/fichaF4PdfGenerator";
import { imprimirFichaF5_1erAno } from "../../utils/fichas/1año/fichaF5PdfGenerator";
import { imprimirCentralizador1erAno } from "../../utils/fichas/1año/centralizador1AnoPdfGenerator";

export const FICHAS_1ER_ANO = [
  { codigo: "1_ACTA_EQUIPO", nombre: "Acta de Conformación del Equipo Comunitario" },
  { codigo: "1_F1", nombre: "Ficha F-1: Elaboración y Validación de Instrumentos" },
  { codigo: "1_F2", nombre: "Ficha F-2: Control de Asistencia PEC (Días detallados)" },
  { codigo: "1_F3", nombre: "Ficha F-3: Aplicación de Técnicas e Instrumentos" },
  { codigo: "1_F4", nombre: "Ficha F-4: Seguimiento del Docente Guía y Director" },
  { codigo: "1_F5", nombre: "Ficha F-5: Valoración de la Producción de Conocimientos" },
  { codigo: "CENTRALIZADOR", nombre: "Cuadro Centralizador de Evaluación 1er Año" },
];

export const ejecutarImpresion1erAno = async (codigo, estudianteId) => {
  switch (codigo) {
    case "1_ACTA_EQUIPO":
      return await imprimirActaConformacion1erAno(estudianteId);
    case "1_F1":
      return await imprimirFichaF1_1erAno(estudianteId);
    case "1_F2": return await imprimirFichaF2_1erAno(estudianteId);
    case "1_F3": return await imprimirFichaF3_1erAno(estudianteId);
    case "1_F4": return await imprimirFichaF4_1erAno(estudianteId);
    case "1_F5": return await imprimirFichaF5_1erAno(estudianteId);
    case "CENTRALIZADOR": return await imprimirCentralizador1erAno(estudianteId);
    default:
      return {
        success: false,
        message: `La plantilla oficial para este documento (1er Año) está siendo configurada en el servidor.`,
      };
  }
};