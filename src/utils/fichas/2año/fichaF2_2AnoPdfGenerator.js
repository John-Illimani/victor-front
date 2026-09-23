import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { fichaF2_2doAnoService } from "../../../services/fichas/2año/fichaF2_2doAnoService";

// =============================================================================
// CONSTANTES Y CONFIGURACIÓN
// =============================================================================
const TITULO_F2 = "FICHA F-2";
const SUBTITULO_F2 = "ASISTENCIA: PRÁCTICA EDUCATIVA COMUNITARIA (PEC)";
const INSTRUCCION_F2 = "La presente ficha debe ser llenada durante la Práctica Educativa Comunitaria en la UE/CEA/CEE (2 semanas), por la/el estudiante practicante, sellado y evaluado por la/el docente guía de la UE/CEA/CEE.";

const TOTAL_DIAS = 10;

// Estilos de Color
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);      // Dorado (#C9A751)
const COLOR_BORDER = rgb(0, 0, 0);

const COLOR_HEADER = rgb(160 / 255, 48 / 255, 32 / 255);      // Rojo guindo de encabezado
const COLOR_DIA = rgb(239 / 255, 176 / 255, 161 / 255);       // Salmón de días
const COLOR_PINK = rgb(246 / 255, 204 / 255, 194 / 255);      // Bloques de fechas y literal
const COLOR_PINK_SOFT = rgb(249 / 255, 218 / 255, 212 / 255); // Bloque de nota total

const BORDER = 1;

// =============================================================================
// HELPER FUNCTIONS
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

function formatFecha(v) {
  if (!v) return "";
  const s = String(v);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const dt = new Date(s);
  if (Number.isNaN(dt.getTime())) return s;
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${dt.getFullYear()}`;
}

function parseDias(raw) {
  let arr = raw;
  if (typeof arr === "string") {
    try { arr = JSON.parse(arr); } catch { arr = []; }
  }
  if (!Array.isArray(arr)) arr = [];
  return Array.from({ length: TOTAL_DIAS }, (_, i) => {
    const src = arr[i] || {};
    return {
      actividad: norm(src.actividad ?? src.detalle),
      valoracion: src.valoracion ?? src.nota ?? "",
    };
  });
}

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
// GENERADOR DE PDF
// =============================================================================
export const imprimirFichaF2_2doAno = async (estudianteId) => {
  try {
    const responseFicha = await fichaF2_2doAnoService.getByEstudiante(estudianteId);

    if (!responseFicha || !responseFicha.existe || !responseFicha.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha F-2 de 2do Año. Primero guarda el formulario.",
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

    page.setSize(612, 792);
    const pageWidth = 612;
    const pageHeight = 792;

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const MARGIN_LEFT = 85.04;   // 3 cm
    const MARGIN_RIGHT = 51.31;  // 1.81 cm
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT);
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    // MARGEN SUPERIOR EXACTO DE 5.0 CM (141.73 PT) DESDE EL BORDE SUPERIOR DE LA HOJA
    const MARGIN_TOP = 141.73;
    let cursorY = pageHeight - MARGIN_TOP; // 650.27 pt

    // =========================================================================
    // 1. ENCABEZADO Y TÍTULOS (FICHA F-2 Y SUBTÍTULO)
    // =========================================================================
    const t1W = fontBold.widthOfTextAtSize(TITULO_F2, 13);
    page.drawText(TITULO_F2, {
      x: CONTENT_CENTER_X - t1W / 2,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: COLOR_TITLE,
    });
    cursorY -= 17;

    const t2W = fontBold.widthOfTextAtSize(SUBTITULO_F2, 13);
    page.drawText(SUBTITULO_F2, {
      x: CONTENT_CENTER_X - t2W / 2,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: COLOR_TITLE,
    });
    cursorY -= 22;

    // Instrucción superior
    const instLines = wrapTextToLines(INSTRUCCION_F2, font, CONTENT_WIDTH, 8);
    instLines.forEach((line) => {
      page.drawText(line, {
        x: MARGIN_LEFT,
        y: cursorY,
        size: 8,
        font,
        color: COLOR_TEXT,
      });
      cursorY -= 10;
    });
    cursorY -= 14;

    // =========================================================================
    // 2. DATOS REFERENCIALES DEL ESTUDIANTE
    // =========================================================================
    page.drawText("DATOS REFERENCIALES DEL ESTUDIANTE:", {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 9,
      font: fontBold,
      color: COLOR_TITLE,
    });
    cursorY -= 16;

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
    cursorY -= 18;

    // =========================================================================
    // 3. TABLA DE REGISTRO
    // =========================================================================
    const tableTop = cursorY;

    const colWidths = [45, 343, CONTENT_WIDTH - 45 - 343];
    const colX = [
      MARGIN_LEFT,
      MARGIN_LEFT + colWidths[0],
      MARGIN_LEFT + colWidths[0] + colWidths[1],
      RIGHT_X,
    ];

    const headerH = 36;
    const rowMinH = 20;
    const fechasH = 46;
    const asistH = 28;
    const literalH = 30;

    const fs = 8.5;
    const headerFontSize = 12;
    const actSize = 8;
    const actLH = 9.5;
    const cellPad = 5;

    // Encabezados de tabla
    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, headerH, COLOR_HEADER);

    page.drawText("Nº", {
      x: colX[0] + 6,
      y: tableTop - headerH / 2 - 4,
      size: headerFontSize,
      font: fontBold,
      color: COLOR_WHITE,
    });

    const detalleTxt = "DETALLE DE LAS ACTIVIDADES REALIZADAS EN LA PEC";
    const detalleW = fontBold.widthOfTextAtSize(detalleTxt, headerFontSize);
    page.drawText(detalleTxt, {
      x: colX[1] + colWidths[1] / 2 - detalleW / 2,
      y: tableTop - headerH / 2 - 4,
      size: headerFontSize,
      font: fontBold,
      color: COLOR_WHITE,
    });

    ["Valoración", "(1-100)"].forEach((linea, i) => {
      const w = fontBold.widthOfTextAtSize(linea, headerFontSize);
      page.drawText(linea, {
        x: colX[2] + colWidths[2] / 2 - w / 2,
        y: tableTop - headerH / 2 + 5 - i * 13,
        size: headerFontSize,
        font: fontBold,
        color: COLOR_WHITE,
      });
    });

    // Filas Días 1 al 10 (Texto de días horizontal)
    const dias = parseDias(d.dias);
    let rowTop = tableTop - headerH;
    const rowBoundaries = [rowTop];

    dias.forEach((fila, i) => {
      const lines = wrapTextToLines(fila.actividad, font, colWidths[1] - cellPad * 2, actSize);
      const rowH = Math.max(rowMinH, lines.length * actLH + 6);

      fillRect(page, colX[0], rowTop, colWidths[0], rowH, COLOR_DIA);
      fillRect(page, colX[1], rowTop, colWidths[1] + colWidths[2], rowH, COLOR_WHITE);

      const diaTxt = `Día ${i + 1}`;
      const diaSize = 8;
      const diaW = fontBold.widthOfTextAtSize(diaTxt, diaSize);
      const diaX = colX[0] + colWidths[0] / 2 - diaW / 2;
      const diaY = rowTop - rowH / 2 - 3;

      page.drawText(diaTxt, {
        x: diaX,
        y: diaY,
        size: diaSize,
        font: fontBold,
        color: COLOR_TEXT,
      });

      if (fila.actividad) {
        const blockH = lines.length * actLH;
        let ty = rowTop - (rowH - blockH) / 2 - 7;
        lines.forEach((l) => {
          page.drawText(l, {
            x: colX[1] + cellPad,
            y: ty,
            size: actSize,
            font,
            color: COLOR_TEXT,
          });
          ty -= actLH;
        });
      }

      const valStr = fila.valoracion === "" || fila.valoracion === null ? "" : String(fila.valoracion);
      if (valStr) {
        const vw = fontBold.widthOfTextAtSize(valStr, fs);
        page.drawText(valStr, {
          x: colX[2] + colWidths[2] / 2 - vw / 2,
          y: rowTop - rowH / 2 - 3,
          size: fs,
          font: fontBold,
          color: COLOR_TEXT,
        });
      }

      rowTop -= rowH;
      rowBoundaries.push(rowTop);
    });

    const diasBottom = rowTop;

    // Bloque inferior
    const fechasTop = diasBottom;
    const asistTop = fechasTop - fechasH;
    const literalTop = asistTop - asistH;
    const tableBottom = literalTop - literalH;
    const leftW = colWidths[0] + colWidths[1];

    fillRect(page, colX[0], fechasTop, leftW, fechasH, COLOR_PINK);
    fillRect(page, colX[0], asistTop, leftW, asistH, COLOR_WHITE);
    fillRect(page, colX[0], literalTop, leftW, literalH, COLOR_PINK);
    fillRect(page, colX[2], fechasTop, colWidths[2], fechasH + asistH, COLOR_PINK_SOFT);
    fillRect(page, colX[2], literalTop, colWidths[2], literalH, COLOR_PINK);

    const textX = colX[0] + 8;
    const dotEnd = colX[0] + 280;

    // Fechas
    const fechaInicio = formatFecha(d.fecha_inicio_pec);
    const y1 = fechasTop - 14;
    page.drawText("Fecha inicio de la PEC:", { x: textX, y: y1, size: fs, font, color: COLOR_TEXT });
    if (fechaInicio) {
      page.drawText(fechaInicio, {
        x: textX + font.widthOfTextAtSize("Fecha inicio de la PEC: ", fs),
        y: y1,
        size: fs,
        font: fontBold,
        color: COLOR_TEXT,
      });
    }
    drawDotted(page, textX, dotEnd, y1 - 6);

    const fechaConc = formatFecha(d.fecha_conclusion_pec);
    const y2 = fechasTop - 34;
    page.drawText("Fecha conclusión de la PEC:", { x: textX, y: y2, size: fs, font, color: COLOR_TEXT });
    if (fechaConc) {
      page.drawText(fechaConc, {
        x: textX + font.widthOfTextAtSize("Fecha conclusión de la PEC: ", fs),
        y: y2,
        size: fs,
        font: fontBold,
        color: COLOR_TEXT,
      });
    }
    drawDotted(page, textX, dotEnd, y2 - 6);

    // Valoración %
    const valorTotal = String(Math.round(Number(d.valoracion_100 ?? 0)) || 0);
    const sufijo = "/100%";
    const wNum = fontBold.widthOfTextAtSize(valorTotal, fs);
    const wSuf = font.widthOfTextAtSize(sufijo, fs);
    const totalX = colX[2] + colWidths[2] / 2 - (wNum + wSuf) / 2;
    const totalY = fechasTop - (fechasH + asistH) / 2 - 3;
    page.drawText(valorTotal, { x: totalX, y: totalY, size: fs, font: fontBold, color: COLOR_TEXT });
    page.drawText(sufijo, { x: totalX + wNum, y: totalY, size: fs, font, color: COLOR_TEXT });

    // Asistencias / Faltas / Atrasos
    const yTot = asistTop - asistH / 2 - 3;
    let tx = textX;
    [
      { label: "Total, asistencias: ", value: d.total_dias, lineW: 38, gap: 8 },
      { label: "Total faltas: ", value: d.total_faltas, lineW: 38, gap: 8 },
      { label: "Total atrasos: ", value: d.total_atrasos, lineW: 50, gap: 0 },
    ].forEach(({ label, value, lineW, gap }) => {
      page.drawText(label, { x: tx, y: yTot, size: fs, font, color: COLOR_TEXT });
      tx += font.widthOfTextAtSize(label, fs);
      const val = norm(value);
      if (val) {
        const vw = fontBold.widthOfTextAtSize(val, fs);
        page.drawText(val, {
          x: tx + lineW / 2 - vw / 2,
          y: yTot,
          size: fs,
          font: fontBold,
          color: COLOR_TEXT,
        });
      }
      drawDotted(page, tx, tx + lineW, yTot - 2);
      tx += lineW + gap;
    });

    // Literal
    const valNum = Math.round(Number(d.valoracion_100 ?? 0)) || 0;
    const literal = numeroALiteral(valNum);
    const yLit = literalTop - 14;
    page.drawText("Literal:", { x: textX, y: yLit, size: fs, font, color: COLOR_TEXT });
    page.drawText(literal, {
      x: textX + font.widthOfTextAtSize("Literal: ", fs),
      y: yLit,
      size: fs,
      font: fontBold,
      color: COLOR_TEXT,
    });
    drawDotted(page, textX, colX[0] + 370, yLit - 6);

    // Rejilla de la Tabla
    rowBoundaries.forEach((y) => hLine(page, MARGIN_LEFT, RIGHT_X, y));
    hLine(page, colX[0], colX[2], asistTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, literalTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, tableBottom);

    vLine(page, colX[0], tableTop, tableBottom);
    vLine(page, colX[3], tableTop, tableBottom);
    vLine(page, colX[1], tableTop, diasBottom);
    vLine(page, colX[2], tableTop, tableBottom);

    cursorY = tableBottom - 20;

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

    cursorY -= 45;

    const sigWidth = 170;
    const sig1X = MARGIN_LEFT + 20;
    const sig2X = RIGHT_X - sigWidth - 20;

    const firmas = [
      { x: sig1X, label: "Estudiante" },
      { x: sig2X, label: "Docente Guía" },
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
    // 5. RENDERIZADO Y DESCARGA
    // =========================================================================
    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, "_blank");
    return { success: true };
  } catch (error) {
    console.error("Error al generar PDF de Ficha F-2 de 2do Año:", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`,
    };
  }
};