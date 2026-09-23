import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { fichaF3_2doAnoService } from "../../../services/fichas/2año/fichaF3_2doAnoService";

// =============================================================================
// CONSTANTES Y CONFIGURACIÓN DE ESTILOS
// =============================================================================
const TITULO_FICHA = "FICHA F-3";
const SUBTITULO_FICHA = "APLICACIÓN DE TÉCNICAS E INSTRUMENTOS DE\nINVESTIGACIÓN EDUCATIVA";
const INSTRUCCION_F3 = "El Equipo Comunitario aplica técnicas e instrumentos de investigación educativa. Las evidencias y resultados de las técnicas e instrumentos de investigación aplicados, deben ser evaluados por la/el docente acompañante de la ESFM/UA.";
const SECCION_DATOS = "DATOS REFERENCIALES DEL ESTUDIANTE:";

// Estilos de Color
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);        // Dorado (#C9A751)
const COLOR_HEADER = rgb(160 / 255, 48 / 255, 32 / 255);        // Rojo guindo de encabezado
const COLOR_ACTIVIDADES = rgb(239 / 255, 176 / 255, 161 / 255); // Salmón columna izquierda
const COLOR_PINK = rgb(246 / 255, 204 / 255, 194 / 255);        // Bloque observaciones/promedio
const COLOR_BORDER = rgb(0, 0, 0);

const BORDER = 1;

// Indicadores fijos de la Ficha F-3
const INDICADORES_F3 = [
  "Presenta los instrumentos diseñados y aplicados adecuadamente según el contexto de la comunidad educativa.",
  "Presenta los instrumentos aplicados en la UE/CEA/CEE de manera participativa y respetando los principios éticos en la investigación.",
  "Presenta instrumentos aplicados en el aula de manera coherente con los objetivos de la práctica.",
  "Identifica y explica las categorías de análisis que se desprenden de la información recogida en los instrumentos."
];

// =============================================================================
// FUNCIONES DE APOYO (HELPERS)
// =============================================================================

function numeroALiteral(num) {
  const n = Math.max(0, Math.min(100, Math.round(Number(num) || 0)));
  if (n === 100) return "CIEN";
  if (n === 0) return "CERO";

  const unidades = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
  const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  const especiales = {
    11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE", 15: "QUINCE",
    16: "DIECISEIS", 17: "DIECISIETE", 18: "DIECIOCHO", 19: "DIECINUEVE",
    21: "VEINTIUNO", 22: "VEINTIDOS", 23: "VEINTITRES", 24: "VEINTICUATRO", 25: "VEINTICINCO",
    26: "VEINTISEIS", 27: "VEINTISIETE", 28: "VEINTIOCHO", 29: "VEINTINUEVE",
  };

  if (n < 10) return unidades[n];
  if (especiales[n]) return especiales[n];
  const d = Math.floor(n / 10);
  const u = n % 10;
  return u === 0 ? decenas[d] : `${decenas[d]} Y ${unidades[u]}`;
}

const norm = (v) => String(v ?? "").trim();

function wrapTextToLines(text, font, maxWidth, fontSize) {
  const out = [];
  String(text ?? "").split(/\r?\n/).forEach((parrafo) => {
    if (!parrafo.trim()) {
      out.push("");
      return;
    }
    let current = "";
    parrafo.split(/\s+/).filter(Boolean).forEach((word) => {
      const test = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
        out.push(current);
        current = word;
      } else {
        current = test;
      }
    });
    if (current) out.push(current);
  });
  return out.length ? out : [""];
}

function drawDotted(page, x1, x2, y) {
  page.drawLine({
    start: { x: x1, y },
    end: { x: x2, y },
    thickness: 0.8,
    dashArray: [1.5, 1.5],
    color: COLOR_TEXT,
  });
}

function campoPunteado(page, { label, value, x, y, minLine = 50, endX, font, fontBold, size = 9 }) {
  page.drawText(label, { x, y, size, font, color: COLOR_TEXT });
  const valueX = x + font.widthOfTextAtSize(label, size);
  const val = norm(value).toUpperCase();
  if (val) page.drawText(val, { x: valueX, y, size, font: fontBold, color: COLOR_TEXT });
  const valW = val ? fontBold.widthOfTextAtSize(val, size) : 0;
  const lineEnd = endX ?? valueX + Math.max(valW + 4, minLine);
  drawDotted(page, valueX, lineEnd, y - 2);
  return lineEnd;
}

function hLine(page, x1, x2, y) {
  page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: BORDER, color: COLOR_BORDER });
}

function vLine(page, x, y1, y2) {
  page.drawLine({ start: { x, y: y1 }, end: { x, y: y2 }, thickness: BORDER, color: COLOR_BORDER });
}

function fillRect(page, x, yTop, w, h, color) {
  page.drawRectangle({ x, y: yTop - h, width: w, height: h, color });
}

// =============================================================================
// GENERADOR DE PDF FICHA F-3 (2DO AÑO)
// =============================================================================
export const imprimirFichaF3_2doAno = async (estudianteId) => {
  try {
    const responseFicha = await fichaF3_2doAnoService.getByEstudiante(estudianteId);

    if (!responseFicha || !responseFicha.existe || !responseFicha.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha F-3 de 2do Año. Primero guarda el formulario.",
      };
    }

    const d = responseFicha.datos;

    const urlPlantilla = "/pdf/2año/plantilla.pdf";
    const resFetch = await fetch(urlPlantilla);
    const contentType = resFetch.headers.get("content-type");

    if (!resFetch.ok || (contentType && contentType.includes("text/html"))) {
      return {
        success: false,
        message: `No se encontró la plantilla en la ruta: ${urlPlantilla}.`,
      };
    }

    const pdfBytes = await resFetch.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPages()[0];

    page.setSize(612, 792); // Formato Carta
    const pageWidth = 612;
    const pageHeight = 792;

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Margen superior de 5 cm (141.73 pt)
    const MARGIN_TOP = (5 / 2.54) * 72;
    const MARGIN_LEFT = 85.04;   // 3 cm
    const MARGIN_RIGHT = 51.31;  // 1.81 cm
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // =========================================================================
    // 1. TÍTULOS PRINCIPALES
    // =========================================================================
    const wFicha = fontBold.widthOfTextAtSize(TITULO_FICHA, 13);
    page.drawText(TITULO_FICHA, {
      x: MARGIN_LEFT + CONTENT_WIDTH / 2 - wFicha / 2,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: COLOR_TITLE,
    });
    cursorY -= 18;

    const subLines = SUBTITULO_FICHA.split("\n");
    subLines.forEach((line) => {
      const wLine = fontBold.widthOfTextAtSize(line, 13);
      page.drawText(line, {
        x: MARGIN_LEFT + CONTENT_WIDTH / 2 - wLine / 2,
        y: cursorY,
        size: 13,
        font: fontBold,
        color: COLOR_TITLE,
      });
      cursorY -= 16;
    });
    cursorY -= 6;

    const instLines = wrapTextToLines(INSTRUCCION_F3, font, CONTENT_WIDTH, 9);
    instLines.forEach((line) => {
      page.drawText(line, {
        x: MARGIN_LEFT,
        y: cursorY,
        size: 9,
        font,
        color: COLOR_TEXT,
      });
      cursorY -= 11;
    });
    cursorY -= 10;

    page.drawText(SECCION_DATOS, {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: COLOR_TITLE,
    });
    cursorY -= 18;

    // =========================================================================
    // 2. DATOS REFERENCIALES DEL ESTUDIANTE
    // =========================================================================
    campoPunteado(page, {
      label: "Nombres y Apellidos: ",
      value: d.apellidos_nombres,
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9,
    });
    cursorY -= 14;

    const esfmEnd = campoPunteado(page, {
      label: "ESFM/UA: ",
      value: d.esfm_ua,
      x: MARGIN_LEFT,
      y: cursorY,
      minLine: 180,
      font,
      fontBold,
      size: 9,
    });
    campoPunteado(page, {
      label: "Especialidad: ",
      value: d.especialidad,
      x: esfmEnd + 15,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9,
    });
    cursorY -= 20;

    // =========================================================================
    // 3. TABLA EVALUATIVA (ANCHOS DE COLUMNA AJUSTADOS)
    // =========================================================================
    const tableTop = cursorY;

    // Se reduce Indicadores de 255 a 235 para darle 120.65 pt a Calificación
    const colWidths = [120, 235, CONTENT_WIDTH - 120 - 235]; 
    const colX = [
      MARGIN_LEFT,
      MARGIN_LEFT + colWidths[0],
      MARGIN_LEFT + colWidths[0] + colWidths[1],
      RIGHT_X,
    ];

    const headerSubH = 22;
    const headerColH = 34;
    const cellPad = 6;

    // A. Encabezado Principal
    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, headerSubH, COLOR_HEADER);
    const titleHeader = "INSTRUMENTOS DE INVESTIGACIÓN APLICADOS";
    const wTitleHeader = fontBold.widthOfTextAtSize(titleHeader, 12);
    page.drawText(titleHeader, {
      x: MARGIN_LEFT + CONTENT_WIDTH / 2 - wTitleHeader / 2,
      y: tableTop - 15,
      size: 12,
      font: fontBold,
      color: COLOR_WHITE,
    });

    // B. Subencabezados
    const subHeaderTop = tableTop - headerSubH;
    fillRect(page, MARGIN_LEFT, subHeaderTop, CONTENT_WIDTH, headerColH, COLOR_HEADER);

    const subHeaders = [
      { text: ["ACTIVIDADES"], x: colX[0], w: colWidths[0] },
      { text: ["INDICADORES"], x: colX[1], w: colWidths[1] },
      { text: ["CALIFICACIÓN DE 1", "A 100 PUNTOS"], x: colX[2], w: colWidths[2] },
    ];

    subHeaders.forEach(({ text, x, w }) => {
      const lineCount = text.length;
      let startY = subHeaderTop - (headerColH / 2) + (lineCount === 2 ? 6 : -4);
      text.forEach((t) => {
        const tw = fontBold.widthOfTextAtSize(t, 12);
        page.drawText(t, {
          x: x + w / 2 - tw / 2,
          y: startY,
          size: 12,
          font: fontBold,
          color: COLOR_WHITE,
        });
        startY -= 13;
      });
    });

    // C. Filas de Indicadores y Calificaciones
    const criteriosValores = [
      d.f3_criterio_1,
      d.f3_criterio_2,
      d.f3_criterio_3,
      d.f3_criterio_4,
    ];

    let rowTop = subHeaderTop - headerColH;
    const rowBoundaries = [rowTop];

    INDICADORES_F3.forEach((indicadorText, index) => {
      const indLines = wrapTextToLines(indicadorText, font, colWidths[1] - cellPad * 2, 9);
      const rHeight = Math.max(40, indLines.length * 10.5 + 12);

      fillRect(page, colX[1], rowTop, colWidths[1] + colWidths[2], rHeight, COLOR_WHITE);

      let ty = rowTop - (rHeight - (indLines.length * 10.5)) / 2 - 8;
      indLines.forEach((l) => {
        page.drawText(l, {
          x: colX[1] + cellPad,
          y: ty,
          size: 9,
          font,
          color: COLOR_TEXT,
        });
        ty -= 10.5;
      });

      const valCal = criteriosValores[index] !== undefined && criteriosValores[index] !== null 
        ? String(Math.round(Number(criteriosValores[index]))) 
        : "";
      if (valCal) {
        const cw = fontBold.widthOfTextAtSize(valCal, 9);
        page.drawText(valCal, {
          x: colX[2] + colWidths[2] / 2 - cw / 2,
          y: rowTop - rHeight / 2 - 3,
          size: 9,
          font: fontBold,
          color: COLOR_TEXT,
        });
      }

      rowTop -= rHeight;
      rowBoundaries.push(rowTop);
    });

    const tablaIndicadoresBottom = rowTop;
    const totalAlturaIndicadores = rowBoundaries[0] - tablaIndicadoresBottom;

    // D. Columna Izquierda UNIFICADA (Celda única de Actividades)
    fillRect(page, colX[0], rowBoundaries[0], colWidths[0], totalAlturaIndicadores, COLOR_ACTIVIDADES);
    const actText = "Instrumentos de diagnóstico validados";
    const actLines = wrapTextToLines(actText, fontBold, colWidths[0] - cellPad * 2, 9);
    let actY = rowBoundaries[0] - (totalAlturaIndicadores - (actLines.length * 11)) / 2 - 8;
    actLines.forEach((al) => {
      page.drawText(al, {
        x: colX[0] + cellPad,
        y: actY,
        size: 9,
        font: fontBold,
        color: COLOR_TEXT,
      });
      actY -= 11;
    });

    // E. Bloques Inferiores (Promedio, Literal, Observaciones)
    const promH = 22;
    const litH = 22;
    const obsH = 45;

    const promTop = tablaIndicadoresBottom;
    const litTop = promTop - promH;
    const obsTop = litTop - litH;
    const tableBottom = obsTop - obsH;

    fillRect(page, colX[0], promTop, colWidths[0] + colWidths[1], promH, COLOR_PINK);
    fillRect(page, colX[2], promTop, colWidths[2], promH, COLOR_PINK);
    fillRect(page, colX[0], litTop, CONTENT_WIDTH, litH, COLOR_WHITE);
    fillRect(page, colX[0], obsTop, CONTENT_WIDTH, obsH, COLOR_PINK);

    page.drawText("Promedio final (Número entero)", {
      x: colX[0] + 8,
      y: promTop - 14,
      size: 9,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const promVal = d.promedio_numeral !== undefined && d.promedio_numeral !== null 
      ? Math.round(Number(d.promedio_numeral)) 
      : 0;
    const promValStr = String(promVal);

    const pw = fontBold.widthOfTextAtSize(promValStr, 9);
    page.drawText(promValStr, {
      x: colX[2] + colWidths[2] / 2 - pw / 2,
      y: promTop - 14,
      size: 9,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const litVal = numeroALiteral(promVal);
    page.drawText(`Literal: ${litVal}`, {
      x: colX[0] + 8,
      y: litTop - 14,
      size: 9,
      font,
      color: COLOR_TEXT,
    });

    page.drawText("Observaciones y/o sugerencias:", {
      x: colX[0] + 8,
      y: obsTop - 13,
      size: 9,
      font: fontBold,
      color: COLOR_TEXT,
    });

    if (d.observaciones) {
      const obsLines = wrapTextToLines(d.observaciones, font, CONTENT_WIDTH - 16, 9);
      let obsY = obsTop - 25;
      obsLines.slice(0, 2).forEach((ol) => {
        page.drawText(ol, {
          x: colX[0] + 8,
          y: obsY,
          size: 9,
          font,
          color: COLOR_TEXT,
        });
        obsY -= 10.5;
      });
    }

    // F. Rejilla de Líneas de la Tabla
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, subHeaderTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, rowBoundaries[0]);

    for (let i = 1; i < rowBoundaries.length - 1; i++) {
      hLine(page, colX[1], RIGHT_X, rowBoundaries[i]);
    }

    hLine(page, MARGIN_LEFT, RIGHT_X, tablaIndicadoresBottom);
    hLine(page, MARGIN_LEFT, RIGHT_X, litTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, obsTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, tableBottom);

    vLine(page, colX[0], tableTop, tableBottom);
    vLine(page, colX[1], subHeaderTop, promTop);
    vLine(page, colX[2], subHeaderTop, promTop);
    vLine(page, colX[3], tableTop, tableBottom);

    cursorY = tableBottom - 35;

    // =========================================================================
    // 4. LUGAR, FECHA Y FIRMAS
    // =========================================================================
    const lblFechaText = "Lugar y fecha: ";
    const valFechaText = `${d.lugar_ciudad || "El Alto"}, ${d.dia || ""} de ${d.mes || ""} de ${d.ano || ""}`;

    const wLblFecha = font.widthOfTextAtSize(lblFechaText, 9);
    const wValFecha = fontBold.widthOfTextAtSize(valFechaText, 9);
    const fechaStartX = RIGHT_X - (wLblFecha + wValFecha);

    page.drawText(lblFechaText, { x: fechaStartX, y: cursorY, size: 9, font, color: COLOR_TEXT });
    const valFechaX = fechaStartX + wLblFecha;
    page.drawText(valFechaText, { x: valFechaX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    drawDotted(page, valFechaX, RIGHT_X, cursorY - 1.5);

    cursorY -= 50;

    const sigWidth = 170;
    const sig1X = MARGIN_LEFT + 20;
    const sig2X = RIGHT_X - sigWidth - 20;

    const firmas = [
      { x: sig1X, label: "Estudiante" },
      { x: sig2X, label: "Vo Bo Docente Acompañante IEPC-PEC" },
    ];

    firmas.forEach(({ x, label }) => {
      page.drawLine({
        start: { x, y: cursorY },
        end: { x: x + sigWidth, y: cursorY },
        thickness: 0.8,
        dashArray: [2, 2],
        color: COLOR_BORDER,
      });
      const lw = font.widthOfTextAtSize(label, 9);
      page.drawText(label, {
        x: x + sigWidth / 2 - lw / 2,
        y: cursorY - 12,
        size: 9,
        font,
        color: COLOR_TEXT,
      });
    });

    // =========================================================================
    // 5. RENDERIZADO Y APERTURA DE PDF
    // =========================================================================
    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, "_blank");
    return { success: true };
  } catch (error) {
    console.error("Error al generar PDF de Ficha F-3 de 2do Año:", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`,
    };
  }
};