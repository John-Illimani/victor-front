import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaB54toAnoService } from '../../../services/fichas/4año/fichaB54toAnoService';

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

export const imprimirFichaB5_4toAno = async (estudianteId) => {
  try {
    const response = await fichaB54toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha B-5."
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
      "FICHA B-5",
      "SEGUIMIENTO Y APOYO DE LA/EL DOCENTE GUÍA"
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

    cursorY -= 6;

    // ESTUDIANTE
    campoPunteado(page, {
      label: "Nombre del estudiante: ",
      value: d.apellidos_nombres || "",
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9,
    });
    cursorY -= 16;

    // SUBTÍTULO / INSTRUCTIVO (SIN NEGRITA)
    const subTitle = "La o el docente guía realiza seguimiento a cada integrante del ECTG antes de la finalización de la PEC, valorando la dimensión formativa, el dominio teórico-metodológico, la concreción y la capacidad de proponer mejoras.";
    const subTitleLines = wrapText(subTitle, font, 8.5, CONTENT_WIDTH);
    subTitleLines.forEach((l) => {
      page.drawText(l, {
        x: MARGIN_LEFT,
        y: cursorY,
        size: 8.5,
        font,
        color: COLOR_TEXT,
      });
      cursorY -= 11;
    });

    cursorY -= 8;

    // ANCHOS Y POSICIONES DE COLUMNAS
    const wDimCol = 18;     // Columna vertical para Ser, Saber, Hacer, Decidir
    const wCritCol = 287.65;
    const wValCol = 170.00; // Total: 18 + 287.65 + 170 = 475.65 pt

    const colX = [
      MARGIN_LEFT,
      MARGIN_LEFT + wDimCol,
      MARGIN_LEFT + wDimCol + wCritCol,
      RIGHT_X
    ];

    const tableTop = cursorY;
    const headerH = 22;
    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, headerH, COLOR_TABLE_HEADER);

    // Texto Encabezado Columna Criterios
    const wH1 = fontBold.widthOfTextAtSize("Criterio de evaluación", 10);
    page.drawText("Criterio de evaluación", {
      x: colX[0] + ((wDimCol + wCritCol) / 2) - (wH1 / 2),
      y: tableTop - 15,
      size: 10,
      font: fontBold,
      color: COLOR_WHITE,
    });

    // Texto Encabezado Columna Valoración
    const wH2 = fontBold.widthOfTextAtSize("Valoración del 1 a 100", 10);
    page.drawText("Valoración del 1 a 100", {
      x: colX[2] + (wValCol / 2) - (wH2 / 2),
      y: tableTop - 15,
      size: 10,
      font: fontBold,
      color: COLOR_WHITE,
    });

    let currentTableY = tableTop - headerH;
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // ESTRUCTURA DE DIMENSIONES (c1, c2, c3, c4)
    const dimensiones = [
      {
        key: "c1",
        nombre: "Ser",
        criterios: [
          "Responsabilidad, compromiso y puntualidad en el desarrollo de la práctica educativa.",
          "Respeto en el trato con estudiantes, padres/ madres de familia, maestras, maestros y personal de la UE/CEA/CEE.",
          "Promueve la práctica de valores sociocomunitarios en la UE/CEA/CEE."
        ]
      },
      {
        key: "c2",
        nombre: "Saber",
        criterios: [
          "Conocimiento y manejo de elementos curriculares de la planificación.",
          "Conocimiento y dominio de elementos propios de su especialidad.",
          "Promueve el fortalecimiento del pensamiento crítico y reflexivo con las y los estudiantes."
        ]
      },
      {
        key: "c3",
        nombre: "Hacer",
        criterios: [
          "Dominio de aula usando estrategias pertinentes.",
          "Manifiesta creatividad en el uso de recursos materiales y educativos.",
          "Utiliza instrumentos de evaluación durante la concreción curricular."
        ]
      },
      {
        key: "c4",
        nombre: "Decidir",
        criterios: [
          "Asume las sugerencias y observaciones a los PDC elaborados.",
          "Aplica acciones de manera oportuna para la solución de problemas en el aula.",
          "Demuestra iniciativa en la solución de problemas emergentes de la comunidad educativa."
        ]
      }
    ];

    dimensiones.forEach((dim) => {
      const dimStartY = currentTableY;

      // Dibujar los criterios de la dimensión
      dim.criterios.forEach((critText) => {
        const cLines = wrapText(critText, font, 7.5, wCritCol - 8);
        const lineH = 8.5;
        const rowH = Math.max(15, cLines.length * lineH + 4);
        const textStartY = currentTableY - (rowH / 2) + ((cLines.length * lineH) / 2) - 5;

        cLines.forEach((l, idx) => {
          page.drawText(l, {
            x: colX[1] + 4,
            y: textStartY - idx * lineH,
            size: 7.5,
            font,
            color: COLOR_TEXT,
          });
        });

        currentTableY -= rowH;
        hLine(page, colX[1], colX[2], currentTableY);
      });

      const dimEndY = currentTableY;
      const totalDimH = dimStartY - dimEndY;

      // VALORACIÓN UNIFICADA DE LA DIMENSIÓN (CENTRADA VERTICALMENTE)
      const val = d[dim.key];
      if (val !== undefined && val !== null && String(val).trim() !== "") {
        const vNum = Math.round(parseFloat(val) || 0);
        const vStr = String(vNum);
        const wV = font.widthOfTextAtSize(vStr, 8.5);
        page.drawText(vStr, {
          x: colX[2] + (wValCol / 2) - (wV / 2),
          y: dimStartY - (totalDimH / 2) - 3,
          size: 8.5,
          font,
          color: COLOR_TEXT,
        });
      }

      // DIBUJAR TEXTO ROTADO VERTICALMENTE EN LA COLUMNA IZQUIERDA
      const wLabel = fontBold.widthOfTextAtSize(dim.nombre, 8.5);
      page.drawText(dim.nombre, {
        x: colX[0] + (wDimCol / 2) - 3,
        y: dimStartY - (totalDimH / 2) - (wLabel / 2),
        size: 8.5,
        font: fontBold,
        color: COLOR_TEXT,
        rotate: degrees(90)
      });

      hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);
    });

    // FILA DE PROMEDIO FINAL (ESTRUCTURA EXACTA DE LA IMAGEN 2 DE REFERENCIA)
    const pfVal = d.promedio_numeral ?? d.puntaje_final ?? "";
    const yPromRow = currentTableY;
    const hNumRow = 18;
    const hLitRow = 18;
    const totalPromRowH = hNumRow + hLitRow;

    // Columna 1: Promedio Final (Número entero)
    page.drawText("Promedio Final (Número entero)", {
      x: MARGIN_LEFT + 6,
      y: yPromRow - 22,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    // Fila Numeral: "Numeral:" en colX[2] y la nota centrada en el cuadro
    const midSubX = colX[2] + 65;

    page.drawText("Numeral:", {
      x: colX[2] + 6,
      y: yPromRow - 12,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    if (pfVal !== "") {
      const pfStr = String(Math.round(parseFloat(pfVal) || 0));
      const wPf = font.widthOfTextAtSize(pfStr, 9);
      page.drawText(pfStr, {
        x: midSubX + ((RIGHT_X - midSubX) / 2) - (wPf / 2),
        y: yPromRow - 12,
        size: 9,
        font,
        color: COLOR_TEXT,
      });
    }

    const yNumLine = yPromRow - hNumRow;
    hLine(page, colX[2], RIGHT_X, yNumLine);

    // Fila Literal: "Literal:" en colX[2] y el texto en mayúsculas a continuación
    page.drawText("Literal:", {
      x: colX[2] + 6,
      y: yNumLine - 12,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const litVal = obtenerLiteralRedondeado(pfVal, d.promedio_literal);
    if (litVal) {
      page.drawText(litVal, {
        x: colX[2] + 6 + fontBold.widthOfTextAtSize("Literal:", 8.5) + 6,
        y: yNumLine - 12,
        size: 8.5,
        font,
        color: COLOR_TEXT,
      });
    }

    currentTableY -= totalPromRowH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // BORDES VERTICALES SECCIÓN PROMEDIO (línea completa: fila Numeral + fila Literal)
    vLine(page, midSubX, yPromRow, yPromRow - totalPromRowH);

    // RECUADRO DE OBSERVACIONES Y/O SUGERENCIAS (CELDA ÚNICA A LO ANCHO)
    const obsRowH = 38;
    const yObsRow = currentTableY;

    page.drawText("Observaciones/Sugerencias:", {
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
            y: yObsRow - 24 - idx * 10,
            size: 8,
            font,
            color: COLOR_TEXT,
          });
        }
      });
    }

    currentTableY -= obsRowH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // BORDES VERTICALES PRINCIPALES
    vLine(page, colX[0], tableTop, currentTableY);
    vLine(page, colX[1], tableTop, yPromRow);
    vLine(page, colX[2], tableTop, currentTableY);
    vLine(page, RIGHT_X, tableTop, currentTableY);

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
        label: "Docente Guía (UE/CEA/CEE)",
        xCenter: MARGIN_LEFT + colSigWidth * 1.5
      }
    ];

    firmas.forEach((f) => {
      const lineStartX = f.xCenter - lineW / 2;
      const lineEndX = f.xCenter + lineW / 2;

      drawDottedLine(page, lineStartX, lineEndX, cursorY);

      const w = fontBold.widthOfTextAtSize(f.label, 8.5);
      page.drawText(f.label, {
        x: f.xCenter - w / 2,
        y: cursorY - 12,
        size: 8.5,
        font: fontBold,
        color: COLOR_TEXT,
      });
    });

    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, '_blank');
    return { success: true };

  } catch (error) {
    console.error("Error al generar PDF de la Ficha B-5 (4to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};