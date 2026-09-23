import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaB14toAnoService } from '../../../services/fichas/4año/fichaB14toAnoService';

// PALETA DE COLORES INSTITUCIONALES
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);            // Dorado (#C9A751)
const COLOR_TABLE_HEADER = rgb(201 / 255, 167 / 255, 81 / 255);      // Dorado/Ocre Tabla (#C9A751)
const COLOR_BORDER = rgb(0, 0, 0);

const BORDER = 0.8;

// CONVERTIR NÚMEROS ENTEROS A PALABRAS (DEL 0 AL 100)
function numeroALetras(num) {
  const n = Math.round(Number(num) || 0);
  if (n === 0) return "CERO";
  if (n === 100) return "CIEN";

  const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
  const especiales = ["DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
  const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];

  if (n < 10) return unidades[n];
  if (n >= 10 && n < 20) return especiales[n - 10];
  if (n === 20) return "VEINTE";
  if (n > 20 && n < 30) return `VEINTI${unidades[n - 20]}`;

  const u = n % 10;
  const d = Math.floor(n / 10);
  if (u === 0) return decenas[d];
  return `${decenas[d]} Y ${unidades[u]}`;
}

function obtenerLiteralRedondeado(puntajeFinal, literalFallback) {
  if (puntajeFinal !== undefined && puntajeFinal !== null && String(puntajeFinal).trim() !== "") {
    const numRedondeado = Math.round(parseFloat(puntajeFinal) || 0);
    return numeroALetras(numRedondeado);
  }
  if (!literalFallback) return "";
  let str = String(literalFallback).trim().toUpperCase();
  if (str.includes(" CON ")) str = str.split(" CON ")[0];
  return str.trim();
}

function formatearFechaISO(strFecha) {
  if (!strFecha) return "";
  const s = String(strFecha).trim();
  if (s.includes("T")) return s.split("T")[0];
  return s.slice(0, 10);
}

function wrapText(text, font, fontSize, maxWidth) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = "";

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawDottedLine(page, x1, x2, y) {
  page.drawLine({
    start: { x: x1, y },
    end: { x: x2, y },
    thickness: 0.8,
    dashArray: [1.5, 1.5],
    color: COLOR_TEXT,
  });
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

function campoPunteado(page, { label, value, x, y, endX, minLine = 50, font, fontBold, size = 9, forceUpper = true }) {
  page.drawText(label, { x, y, size, font, color: COLOR_TEXT });
  const valueX = x + font.widthOfTextAtSize(label, size);
  let val = String(value ?? "").trim();
  if (forceUpper) val = val.toUpperCase();

  if (val) {
    page.drawText(val, { x: valueX, y, size, font: fontBold, color: COLOR_TEXT });
  }

  const valW = val ? fontBold.widthOfTextAtSize(val, size) : 0;
  const lineEnd = endX ?? (valW > 0 ? valueX + valW : valueX + minLine);

  drawDottedLine(page, valueX, lineEnd, y - 1.5);
  return lineEnd;
}

export const imprimirFichaB1_4toAno = async (estudianteId) => {
  try {
    const response = await fichaB14toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha B-1."
      };
    }

    const d = response.datos;

    const urlPlantilla = encodeURI('/pdf/4año/plantilla.pdf');
    let pdfDoc;

    try {
      const resFetch = await fetch(urlPlantilla);
      const contentType = resFetch.headers.get("content-type");

      if (resFetch.ok && contentType && contentType.includes("application/pdf")) {
        const pdfBytes = await resFetch.arrayBuffer();
        pdfDoc = await PDFDocument.load(pdfBytes);
      } else {
        pdfDoc = await PDFDocument.create();
        pdfDoc.addPage([612, 792]);
      }
    } catch (e) {
      pdfDoc = await PDFDocument.create();
      pdfDoc.addPage([612, 792]);
    }

    pdfDoc.registerFontkit(fontkit);

    const page = pdfDoc.getPages()[0];
    page.setSize(612, 792); // Carta
    const pageWidth = 612;
    const pageHeight = 792;

    // Carga de Fuentes Calibri
    let font, fontBold;
    try {
      const resCalibri = await fetch('/fonts/calibri.ttf');
      const calibriBytes = await resCalibri.arrayBuffer();
      font = await pdfDoc.embedFont(calibriBytes);

      const resCalibriBold = await fetch('/fonts/calibri-bold.ttf');
      const calibriBoldBytes = await resCalibriBold.arrayBuffer();
      fontBold = await pdfDoc.embedFont(calibriBoldBytes);
    } catch (e) {
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    }

    // MÁRGENES ESTRICTOS (5 CM ARRIBA, 3 CM IZQ, 1.81 CM DER)
    const MARGIN_TOP = (5 / 2.54) * 72; // 141.73 pt
    const MARGIN_LEFT = 85.04;          // 85.04 pt
    const MARGIN_RIGHT = 51.31;         // 51.31 pt
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // TÍTULO PRINCIPAL (Dorado 13 pt Bold Centrado)
    const titleLines = [
      "FICHA B-1",
      "CONTROL DE ASISTENCIA DE LA PRÁCTICA EDUCATIVA COMUNITARIA (PEC)"
    ];

    titleLines.forEach((line) => {
      const w = fontBold.widthOfTextAtSize(line, 13);
      page.drawText(line, {
        x: CONTENT_CENTER_X - w / 2,
        y: cursorY,
        size: 13,
        font: fontBold,
        color: COLOR_TITLE,
      });
      cursorY -= 16;
    });

    cursorY -= 10;

    // ESTUDIANTE Y TEXTO EXPLICATIVO
    campoPunteado(page, {
      label: "Estudiante: ",
      value: d.apellidos_nombres || "",
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      fontBold,
      font,
      size: 9.5,
    });
    cursorY -= 20;

    const expText = "Para el llenado de la Ficha B-1 se debe verificar EL REGISTRO DE ASISTENCIA DE LA PEC (registro del estudiante).";
    const expLines = wrapText(expText, font, 9, CONTENT_WIDTH);
    expLines.forEach((l) => {
      page.drawText(l, { x: MARGIN_LEFT, y: cursorY, size: 9, font, color: COLOR_TEXT });
      cursorY -= 11;
    });

    cursorY -= 10;

    // BLOQUE SUPERIOR DE LA TABLA: DURACIÓN DE LA IEPC-PEC (6 semanas)
    const tableTop = cursorY;
    const bannerH = 20;
    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, bannerH, COLOR_TABLE_HEADER);

    const txtDuracion1 = "Duración de la IEPC-PEC en la UE/CEA/CEE:";
    page.drawText(txtDuracion1, {
      x: MARGIN_LEFT + 6,
      y: tableTop - 14,
      size: 9.5,
      font: fontBold,
      color: COLOR_WHITE,
    });

    const txtDuracion2 = "6 semanas";
    const wDur2 = fontBold.widthOfTextAtSize(txtDuracion2, 9.5);
    page.drawText(txtDuracion2, {
      x: RIGHT_X - 15 - wDur2,
      y: tableTop - 14,
      size: 9.5,
      font: fontBold,
      color: COLOR_WHITE,
    });

    let currentTableY = tableTop - bannerH;
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // FECHAS DE INICIO Y CONCLUSIÓN (Formato ISO recortado a YYYY-MM-DD)
    const fechaBoxH = 32;
    const colMidX = MARGIN_LEFT + CONTENT_WIDTH / 2;

    page.drawText("Fecha de Inicio de la IEPC-PEC:", {
      x: MARGIN_LEFT + 6,
      y: currentTableY - 12,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const fInicio = formatearFechaISO(d.fecha_inicio);
    drawDottedLine(page, MARGIN_LEFT + 6, colMidX - 10, currentTableY - 25);
    if (fInicio) {
      page.drawText(fInicio, {
        x: MARGIN_LEFT + 10,
        y: currentTableY - 24,
        size: 8.5,
        font,
        color: COLOR_TEXT,
      });
    }

    page.drawText("Fecha de Conclusión de IEPC-PEC:", {
      x: colMidX + 6,
      y: currentTableY - 12,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const fConc = formatearFechaISO(d.fecha_conclusion);
    drawDottedLine(page, colMidX + 6, RIGHT_X - 10, currentTableY - 25);
    if (fConc) {
      page.drawText(fConc, {
        x: colMidX + 10,
        y: currentTableY - 24,
        size: 8.5,
        font,
        color: COLOR_TEXT,
      });
    }

    vLine(page, MARGIN_LEFT, currentTableY, currentTableY - fechaBoxH);
    vLine(page, colMidX, currentTableY, currentTableY - fechaBoxH);
    vLine(page, RIGHT_X, currentTableY, currentTableY - fechaBoxH);

    currentTableY -= fechaBoxH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // HEADER INTERMEDIO "REGISTRO DE ASISTENCIA"
    const regHeaderH = 18;
    const wRegTxt = fontBold.widthOfTextAtSize("REGISTRO DE ASISTENCIA", 10);
    page.drawText("REGISTRO DE ASISTENCIA", {
      x: CONTENT_CENTER_X - wRegTxt / 2,
      y: currentTableY - 13,
      size: 10,
      font: fontBold,
      color: COLOR_TEXT,
    });

    currentTableY -= regHeaderH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // CABECERAS DE COLUMNA DEL REGISTRO DE ASISTENCIA
    const colWidths = [95, 80, 80, 80, 140.65]; // Total: 475.65 pt
    const colX = [
      MARGIN_LEFT,
      MARGIN_LEFT + colWidths[0],
      MARGIN_LEFT + colWidths[0] + colWidths[1],
      MARGIN_LEFT + colWidths[0] + colWidths[1] + colWidths[2],
      MARGIN_LEFT + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
      RIGHT_X
    ];

    const subHeaderH = 22;
    fillRect(page, MARGIN_LEFT, currentTableY, CONTENT_WIDTH, subHeaderH, COLOR_TABLE_HEADER);

    const headers = [
      { text: "Semana", x: colX[0], w: colWidths[0] },
      { text: "N.º Asistencia", x: colX[1], w: colWidths[1] },
      { text: "N.º Inasistencia", x: colX[2], w: colWidths[2] },
      { text: "N.º Atrasos", x: colX[3], w: colWidths[3] },
      { text: "Valoración de 1 a 100 puntos", x: colX[4], w: colWidths[4] }
    ];

    headers.forEach((h) => {
      const lines = wrapText(h.text, fontBold, 8, h.w - 4);
      const startTextY = currentTableY - (subHeaderH / 2) + ((lines.length * 8.5) / 2) - 6;

      lines.forEach((l, idx) => {
        const w = fontBold.widthOfTextAtSize(l, 8);
        page.drawText(l, {
          x: h.x + (h.w / 2) - (w / 2),
          y: startTextY - idx * 8.5,
          size: 8,
          font: fontBold,
          color: COLOR_WHITE,
        });
      });
    });

    currentTableY -= subHeaderH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // PROCESAMIENTO DE LAS 6 SEMANAS DE ASISTENCIA
    const semanasObj = typeof d.semanas === 'object' && d.semanas !== null ? d.semanas : {};

    for (let i = 1; i <= 6; i++) {
      const rowH = 18;
      const semData = semanasObj[`Semana ${i}`] || semanasObj[`semana_${i}`] || semanasObj[`s${i}`] || {};

      // Columna 1: Semana i
      const semTxt = `Semana ${i}`;
      page.drawText(semTxt, {
        x: colX[0] + 10,
        y: currentTableY - 13,
        size: 8.5,
        font,
        color: COLOR_TEXT,
      });

      // Columnas 2, 3, 4, 5: Asistencia, Inasistencia, Atrasos, Nota
      const vals = [
        semData.asistencia ?? semData.asis ?? "",
        semData.inasistencia ?? semData.inasis ?? "",
        semData.atrasos ?? semData.atra ?? "",
        semData.nota ?? semData.valoracion ?? ""
      ];

      vals.forEach((v, idx) => {
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          const numV = Math.round(parseFloat(v) || 0);
          const strV = String(numV);
          const wV = font.widthOfTextAtSize(strV, 8.5);
          page.drawText(strV, {
            x: colX[idx + 1] + (colWidths[idx + 1] / 2) - (wV / 2),
            y: currentTableY - 13,
            size: 8.5,
            font,
            color: COLOR_TEXT,
          });
        }
      });

      currentTableY -= rowH;
      hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);
    }

    // FILA DE PROMEDIO FINAL (ESTRUCTURA IDÉNTICA A LA IMAGEN 3)
    const pfVal = d.promedio_numeral ?? d.puntaje_final ?? "";
    const yPromRow = currentTableY;

    // Fila 1: Numeral
    const numRowH = 18;

    // Columna 1: Promedio Final (Número entero)
    page.drawText("Promedio Final", {
      x: MARGIN_LEFT + 6,
      y: yPromRow - 12,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    // Columna 3-4: "Numeral:"
    page.drawText("Numeral:", {
      x: colX[3] + colWidths[3] - fontBold.widthOfTextAtSize("Numeral:", 8.5) - 6,
      y: yPromRow - 12,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    // Columna 5: Valor del Numeral
    if (pfVal !== "") {
      const pfStr = String(Math.round(parseFloat(pfVal) || 0));
      const wPf = font.widthOfTextAtSize(pfStr, 9);
      page.drawText(pfStr, {
        x: colX[4] + (colWidths[4] / 2) - (wPf / 2),
        y: yPromRow - 12,
        size: 9,
        font,
        color: COLOR_TEXT,
      });
    }

    currentTableY -= numRowH;
    hLine(page, colX[1], RIGHT_X, currentTableY);

    // Fila 2: Literal (Abarca de la columna 2 a la 5 continua)
    const litRowH = 18;
    const yLitRow = currentTableY;

    page.drawText("(Número entero)", {
      x: MARGIN_LEFT + 6,
      y: yLitRow - 12,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    page.drawText("Literal :", {
      x: colX[1] + 6,
      y: yLitRow - 12,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const litVal = obtenerLiteralRedondeado(pfVal, d.promedio_literal);
    if (litVal) {
      page.drawText(litVal, {
        x: colX[1] + 6 + fontBold.widthOfTextAtSize("Literal :", 8.5) + 6,
        y: yLitRow - 12,
        size: 8.5,
        font,
        color: COLOR_TEXT,
      });
    }

    currentTableY -= litRowH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // BORDES VERTICALES DE LA TABLA COMPLETA
    const tableHeaderY = tableTop - bannerH - fechaBoxH - regHeaderH;
    colX.forEach(xPos => vLine(page, xPos, tableHeaderY, yPromRow));
    vLine(page, colX[0], yPromRow, currentTableY);
    vLine(page, colX[1], yPromRow, currentTableY);
    vLine(page, colX[4], yPromRow, yPromRow - numRowH); // Separador vertical solo en la fila Numeral
    vLine(page, RIGHT_X, yPromRow, currentTableY);

    // RECUADRO DE OBSERVACIONES Y/O SUGERENCIAS
    const obsRowH = 40;
    const yObsRow = currentTableY;

    page.drawText("Observaciones y/o sugerencias:", {
      x: MARGIN_LEFT + 6,
      y: yObsRow - 13,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const obsVal = String(d.observaciones || "").trim();
    if (obsVal) {
      const obsLines = wrapText(obsVal, font, 8, CONTENT_WIDTH - 12);
      obsLines.forEach((l, idx) => {
        if (idx < 2) {
          page.drawText(l, {
            x: MARGIN_LEFT + 6,
            y: yObsRow - 25 - idx * 10,
            size: 8,
            font,
            color: COLOR_TEXT,
          });
        }
      });
    }

    currentTableY -= obsRowH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    vLine(page, MARGIN_LEFT, yObsRow, currentTableY);
    vLine(page, RIGHT_X, yObsRow, currentTableY);

    // RECUADRO INFORMATIVO DE NORMATIVA
    const normBoxH = 42;
    const yNormRow = currentTableY;

    const normLines = [
      "La inasistencia a la PEC es motivo y/o causa para la retención en el año de formación:",
      "Tres retrasos continuos o discontinuos se registrarán como una inasistencia, por tanto, queda automáticamente suspendido de la PEC.",
      "Se otorgará la licencia solo en casos excepcionales: embarazos, accidentes, cirugía y otros con respaldo documental que debe ser presentado oportunamente."
    ];

    let normY = yNormRow - 10;
    normLines.forEach((lineText, idx) => {
      const isBold = idx === 0;
      const wrapped = wrapText(lineText, isBold ? fontBold : font, 7.5, CONTENT_WIDTH - 12);
      wrapped.forEach((wL) => {
        page.drawText(wL, {
          x: MARGIN_LEFT + 6,
          y: normY,
          size: 7.5,
          font: isBold ? fontBold : font,
          color: COLOR_TEXT,
        });
        normY -= 9;
      });
    });

    currentTableY -= normBoxH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    vLine(page, MARGIN_LEFT, yNormRow, currentTableY);
    vLine(page, RIGHT_X, yNormRow, currentTableY);

    cursorY = currentTableY - 18;

    // LUGAR Y FECHA CENTRADO HORIZONTALMENTE
    const lblFecha = "Lugar y fecha: ";
    const valFecha = `${d.lugar_ciudad || 'El Alto'}, ${d.dia || String(new Date().getDate())} de ${d.mes || 'septiembre'} de ${d.ano || '2026'}`;

    const wLbl = font.widthOfTextAtSize(lblFecha, 8.5);
    const wVal = fontBold.widthOfTextAtSize(valFecha, 8.5);
    const totalFechaW = wLbl + wVal;
    
    const fechaStartX = CONTENT_CENTER_X - totalFechaW / 2;

    page.drawText(lblFecha, { x: fechaStartX, y: cursorY, size: 8.5, font, color: COLOR_TEXT });

    const valStartX = fechaStartX + wLbl;
    page.drawText(valFecha, { x: valStartX, y: cursorY, size: 8.5, font: fontBold, color: COLOR_TEXT });
    drawDottedLine(page, valStartX, valStartX + wVal, cursorY - 1.5);

    cursorY -= 50;

    // FIRMAS INFERIORES (2 FIRMAS)
    const colSigWidth = CONTENT_WIDTH / 2;
    const lineW = 160;

    const firmas = [
      {
        label: "Docente Guía de la\n(UE/CEA/CEE)",
        xCenter: MARGIN_LEFT + colSigWidth * 0.5
      },
      {
        label: "Director de la\n(UE/CEA/CEE)",
        xCenter: MARGIN_LEFT + colSigWidth * 1.5
      }
    ];

    firmas.forEach((f) => {
      const lineStartX = f.xCenter - lineW / 2;
      const lineEndX = f.xCenter + lineW / 2;

      drawDottedLine(page, lineStartX, lineEndX, cursorY);

      const labelLines = f.label.split('\n');
      labelLines.forEach((l, idx) => {
        const w = fontBold.widthOfTextAtSize(l, 8.5);
        page.drawText(l, {
          x: f.xCenter - w / 2,
          y: cursorY - 12 - idx * 10,
          size: 8.5,
          font: fontBold,
          color: COLOR_TEXT,
        });
      });
    });

    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, '_blank');
    return { success: true };

  } catch (error) {
    console.error("Error al generar PDF de la Ficha B-1 (4to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};