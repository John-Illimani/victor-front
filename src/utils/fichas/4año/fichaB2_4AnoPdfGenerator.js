import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaB24toAnoService } from '../../../services/fichas/4año/fichaB24toAnoService';

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
  page.drawText(label, { x, y, size, font: fontBold, color: COLOR_TEXT });
  const valueX = x + fontBold.widthOfTextAtSize(label, size);
  let val = String(value ?? "").trim();
  if (forceUpper) val = val.toUpperCase();

  if (val) {
    page.drawText(val, { x: valueX, y, size, font, color: COLOR_TEXT });
  }

  const valW = val ? font.widthOfTextAtSize(val, size) : 0;
  const lineEnd = endX ?? (valW > 0 ? valueX + valW : valueX + minLine);

  drawDottedLine(page, valueX, lineEnd, y - 1.5);
  return lineEnd;
}

export const imprimirFichaB2_4toAno = async (estudianteId) => {
  try {
    const response = await fichaB24toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha B-2."
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
      "FICHA B-2",
      "CONCRECIÓN CURRICULAR - DESARROLLO DEL PDC"
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

    // DATOS REFERENCIALES (ESTUDIANTE)
    campoPunteado(page, {
      label: "Estudiante: ",
      value: d.apellidos_nombres || "",
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9.5,
    });
    cursorY -= 20;

    // ANCHOS DE COLUMNAS (1 COLUMNA DE CRITERIOS + 5 COLUMNAS PDC)
    const colCritW = 245.65;
    const pdcColW = 46; // 46 * 5 = 230 pt => Total: 475.65 pt
    const colX = [
      MARGIN_LEFT,
      MARGIN_LEFT + colCritW,
      MARGIN_LEFT + colCritW + pdcColW,
      MARGIN_LEFT + colCritW + pdcColW * 2,
      MARGIN_LEFT + colCritW + pdcColW * 3,
      MARGIN_LEFT + colCritW + pdcColW * 4,
      RIGHT_X
    ];

    const tableTop = cursorY;
    const headerH = 45;
    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, headerH, COLOR_TABLE_HEADER);

    // Texto Encabezado Criterios
    const wCritH = fontBold.widthOfTextAtSize("Criterios de Evaluación", 10);
    page.drawText("Criterios de Evaluación", {
      x: MARGIN_LEFT + (colCritW / 2) - (wCritH / 2),
      y: tableTop - 25,
      size: 10,
      font: fontBold,
      color: COLOR_WHITE,
    });

    // Encabezados PDC 1 a PDC 5
    const pdcHeaders = ["PDC 1", "PDC 2", "PDC 3", "PDC 4", "PDC 5"];

    pdcHeaders.forEach((pdcTxt, idx) => {
      const xPdc = colX[idx + 1];
      const wPdc = fontBold.widthOfTextAtSize(pdcTxt, 8.5);
      page.drawText(pdcTxt, {
        x: xPdc + (pdcColW / 2) - (wPdc / 2),
        y: tableTop - 12,
        size: 8.5,
        font: fontBold,
        color: COLOR_WHITE,
      });

      const subLines = ["De 1 a", "100", "puntos"];
      subLines.forEach((sL, sIdx) => {
        const wSub = font.widthOfTextAtSize(sL, 7);
        page.drawText(sL, {
          x: xPdc + (pdcColW / 2) - (wSub / 2),
          y: tableTop - 23 - sIdx * 7.5,
          size: 7,
          font,
          color: COLOR_WHITE,
        });
      });
    });

    let currentTableY = tableTop - headerH;
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // ESTRUCTURA DE CRITERIOS AGRUPADOS POR CATEGORÍA
    const secciones = [
      {
        catKey: "cat_0",
        titulo: "PLANIFICACIÓN – CONCRECIÓN DEL PDC",
        criterios: [
          "Existe coherencia y relación del objetivo con el proceso pedagógico y los criterios de evaluación.",
          "Los elementos curriculares del PDC se relacionan con el desarrollo de la clase."
        ]
      },
      {
        catKey: "cat_1",
        titulo: "DESARROLLO DE CONTENIDOS",
        criterios: [
          "Recupera conocimientos y experiencias de las y los estudiantes.",
          "Dinamiza la participación activa y crítica.",
          "Vincula nuevos conocimientos con hechos de la realidad y la vida cotidiana.",
          "Muestra conocimiento profundo de los contenidos de su especialidad.",
          "-Demuestra dominio de aula."
        ]
      },
      {
        catKey: "cat_2",
        titulo: "ESTRATEGIAS METODOLÓGICAS",
        criterios: [
          "Promueve el trabajo en equipo y el diálogo.",
          "Fomenta actividades para aprender haciendo.",
          "Utiliza materiales educativos y herramientas tecnológicas pertinentes.",
          "Promueve el aprendizaje centrado en el estudiante como protagonista activo."
        ]
      },
      {
        catKey: "cat_3",
        titulo: "EVALUACIÓN",
        criterios: [
          "Realiza la evaluación según el objetivo planificado en el PDC.",
          "-Utiliza instrumento(s) de evaluación."
        ]
      }
    ];

    const califsObj = typeof d.calificaciones === 'object' && d.calificaciones !== null ? d.calificaciones : {};

    secciones.forEach((sec) => {
      // Título de Sección en Negrita
      const secH = 14;
      page.drawText(sec.titulo, {
        x: MARGIN_LEFT + 4,
        y: currentTableY - 10,
        size: 7.5,
        font: fontBold,
        color: COLOR_TEXT,
      });

      const catStartY = currentTableY - secH;
      currentTableY -= secH;

      // Renderizar los textos de los ítems de la categoría
      sec.criterios.forEach((critText) => {
        const cLines = wrapText(critText, font, 7, colCritW - 8);
        const lineH = 8;
        const rowH = Math.max(16, cLines.length * lineH + 5);
        const textStartY = currentTableY - (rowH / 2) + ((cLines.length * lineH) / 2) - 5;

        cLines.forEach((l, idx) => {
          page.drawText(l, {
            x: MARGIN_LEFT + 4,
            y: textStartY - idx * lineH,
            size: 7,
            font,
            color: COLOR_TEXT,
          });
        });

        currentTableY -= rowH;
      });

      const catEndY = currentTableY;
      const totalCatHeight = catStartY - catEndY;

      // UNA SOLA NOTA POR CATEGORÍA PARA CADA PDC (CENTRADA VERTICALMENTE)
      for (let pIdx = 1; pIdx <= 5; pIdx++) {
        const pdcKey = `PDC ${pIdx}`;
        const pdcData = califsObj[pdcKey] || {};
        const val = pdcData[sec.catKey];

        if (val !== undefined && val !== null && String(val).trim() !== "") {
          const vNum = Math.round(parseFloat(val) || 0);
          const vStr = String(vNum);
          const wV = font.widthOfTextAtSize(vStr, 8);
          page.drawText(vStr, {
            x: colX[pIdx] + (pdcColW / 2) - (wV / 2),
            y: catStartY - (totalCatHeight / 2) - 3,
            size: 8,
            font,
            color: COLOR_TEXT,
          });
        }
      }

      hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);
    });

    // ============================================================================
    // SECCIÓN INFERIOR DE PROMEDIOS (ESTRUCTURA EXACTA DE LA IMAGEN DE REFERENCIA)
    // ============================================================================
    const promBlockStartY = currentTableY;
    const promPdcObj = typeof d.promedios_pdc === 'object' && d.promedios_pdc !== null ? d.promedios_pdc : {};
    const pfVal = d.promedio_numeral ?? d.puntaje_final ?? "";

    const hRow = 18; // Altura estándar de cada fila inferior
    const yLine1 = promBlockStartY - hRow;
    const yLine2 = yLine1 - hRow;
    const yLine3 = yLine2 - hRow;

    const splitX = MARGIN_LEFT + 130; // División para la columna de Promedio / Puntaje final

    // 1. FILA 1: "Promedio (Número entero)" | "De cada PDC" | [PROMEDIOS PDC 1-5]
    page.drawText("Promedio (Número entero)", {
      x: MARGIN_LEFT + 4,
      y: promBlockStartY - 25, // Centrado verticalmente
      size: 8,
      font: fontBold,
      color: COLOR_TEXT,
    });

    page.drawText("De cada PDC", {
      x: splitX + 4,
      y: promBlockStartY - 12,
      size: 8,
      font: fontBold,
      color: COLOR_TEXT,
    });

    for (let pIdx = 1; pIdx <= 5; pIdx++) {
      const pdcKey = `PDC ${pIdx}`;
      const pVal = promPdcObj[pdcKey] ?? promPdcObj[`pdc_${pIdx}`] ?? "";
      if (pVal !== undefined && pVal !== null && String(pVal).trim() !== "") {
        const pNum = Math.round(parseFloat(pVal) || 0);
        const pStr = String(pNum);
        const wP = font.widthOfTextAtSize(pStr, 8);
        page.drawText(pStr, {
          x: colX[pIdx] + (pdcColW / 2) - (wP / 2),
          y: promBlockStartY - 12,
          size: 8,
          font,
          color: COLOR_TEXT,
        });
      }
    }

    hLine(page, splitX, RIGHT_X, yLine1);

    // 2. FILAS 2 y 3: "Puntaje final" | "Numeral:" / "Literal:" | VALORES
    page.drawText("Puntaje final", {
      x: splitX + 4,
      y: yLine1 - 18, // Centrado entre la fila Numeral y Literal
      size: 8,
      font: fontBold,
      color: COLOR_TEXT,
    });

    // FILA 2: Numeral
    page.drawText("Numeral:", {
      x: colX[1] + 4,
      y: yLine1 - 12,
      size: 8,
      font: fontBold,
      color: COLOR_TEXT,
    });

    if (pfVal !== "") {
      const pfStr = String(Math.round(parseFloat(pfVal) || 0));
      const wPf = font.widthOfTextAtSize(pfStr, 8.5);
      page.drawText(pfStr, {
        x: colX[3] + ((RIGHT_X - colX[3]) / 2) - (wPf / 2),
        y: yLine1 - 12,
        size: 8.5,
        font,
        color: COLOR_TEXT,
      });
    }

    hLine(page, colX[1], RIGHT_X, yLine2);

    // FILA 3: Literal
    page.drawText("Literal:", {
      x: colX[1] + 4,
      y: yLine2 - 12,
      size: 8,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const litVal = obtenerLiteralRedondeado(pfVal, d.promedio_literal);
    if (litVal) {
      page.drawText(litVal, {
        x: colX[3] + 4,
        y: yLine2 - 12,
        size: 8,
        font,
        color: COLOR_TEXT,
      });
    }

    currentTableY = yLine3;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // ============================================================================
    // BORDES VERTICALES EXACTOS PARA CADA CELDA
    // ============================================================================
    
    // Líneas verticales de la tabla superior (Criterios y PDC 1-5)
    colX.forEach(xPos => vLine(page, xPos, tableTop, promBlockStartY));
    
    // Borde izquierdo y derecho generales de la sección inferior
    vLine(page, MARGIN_LEFT, promBlockStartY, currentTableY);
    vLine(page, RIGHT_X, promBlockStartY, currentTableY);

    // Separadores sección inferior
    vLine(page, splitX, promBlockStartY, currentTableY); // Entre Promedio y De cada PDC/Puntaje final
    vLine(page, colX[1], promBlockStartY, currentTableY); // Entre De cada PDC/Puntaje final y PDCs
    
    // Separadores de los PDCs en la fila 1 ("De cada PDC")
    vLine(page, colX[2], promBlockStartY, yLine1); // PDC 1 | 2
    vLine(page, colX[3], promBlockStartY, yLine1); // PDC 2 | 3
    vLine(page, colX[4], promBlockStartY, yLine1); // PDC 3 | 4
    vLine(page, colX[5], promBlockStartY, yLine1); // PDC 4 | 5

    // Separador para la celda unida de Numeral/Literal (inicia en PDC 3)
    vLine(page, colX[3], yLine1, currentTableY);


    // ============================================================================
    // RECUADRO DE OBSERVACIONES Y/O SUGERENCIAS
    // ============================================================================
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
        label: "Estudiante",
        xCenter: MARGIN_LEFT + colSigWidth * 0.5
      },
      {
        label: "Docente Guía\n(UE/CEA/CEE)",
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
    console.error("Error al generar PDF de la Ficha B-2 (4to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};