import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaB43erAnoService } from '../../../services/fichas/3año/fichaB43erAnoService';

// Paleta de Colores Institucionales
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);            // Dorado (#C9A751)
const COLOR_TABLE_HEADER = rgb(155 / 255, 168 / 255, 102 / 255);    // Verde Oliva (#9BA866)
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

export const imprimirFichaB4_3erAno = async (estudianteId) => {
  try {
    const response = await fichaB43erAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha B-4."
      };
    }

    const d = response.datos;

    const urlPlantilla = encodeURI('/pdf/3año/plantilla.pdf');
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
    const MARGIN_TOP = (5 / 2.54) * 72; 
    const MARGIN_LEFT = 85.04;          
    const MARGIN_RIGHT = 51.31;         
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // TÍTULO PRINCIPAL
    const titleLines = [
      "FICHA B-4",
      "SEGUIMIENTO Y APOYO DEL DOCENTE",
      "TUTOR/ACOMPAÑANTE"
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

    // NOMBRE DEL ESTUDIANTE
    campoPunteado(page, {
      label: "Nombre del estudiante: ",
      value: d.apellidos_nombres || "",
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 8.5,
    });

    cursorY -= 15;

    // INSTRUCCIÓN
    const instTxt = "La o el docente guía realiza seguimiento a cada integrante del ECTG antes de la finalización de la PEC, valorando la dimensión formativa, el dominio teórico-metodológico, la concreción y la capacidad de proponer mejoras.";
    const instLines = wrapText(instTxt, font, 7.5, CONTENT_WIDTH);
    instLines.forEach((l, idx) => {
      page.drawText(l, {
        x: MARGIN_LEFT,
        y: cursorY - idx * 9,
        size: 7.5,
        font,
        color: COLOR_TEXT,
      });
    });

    cursorY -= (instLines.length * 9 + 6);

    // ESTRUCTURA DE LA TABLA (SE ANCHA LA PRIMERA COLUMNA A 42 PT)
    const tableTop = cursorY;
    const colWidths = [42, 273.65, 160]; // Total: 475.65 pt
    const colX = [MARGIN_LEFT, MARGIN_LEFT + colWidths[0], MARGIN_LEFT + colWidths[0] + colWidths[1], RIGHT_X];

    // ENCABEZADOS DE TABLA (Verde Oliva)
    const headerH = 24;
    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, headerH, COLOR_TABLE_HEADER);

    const hTxt1 = "CRITERIO DE EVALUACIÓN";
    const hTxt2 = "VALORACIÓN DEL 1 A 100";

    const wH1 = fontBold.widthOfTextAtSize(hTxt1, 8.5);
    page.drawText(hTxt1, {
      x: MARGIN_LEFT + colWidths[0] + (colWidths[1] / 2) - (wH1 / 2),
      y: tableTop - 15,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const wH2 = fontBold.widthOfTextAtSize(hTxt2, 8.5);
    page.drawText(hTxt2, {
      x: colX[2] + (colWidths[2] / 2) - (wH2 / 2),
      y: tableTop - 15,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    let currentTableY = tableTop - headerH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // CONFIGURACIÓN DE CRITERIOS ORGANIZADOS POR DIMENSIÓN
    const dimensiones = [
      {
        nombre: "Ser",
        val: d.ser,
        criterios: [
          "Responsabilidad, compromiso y puntualidad en el desarrollo de la práctica educativa.",
          "Respeto en el trato con estudiantes, padres/ madres de familia, maestras, maestros y personal de la UE/CEA/CEE.",
          "Promueve la práctica de valores sociocomunitarios en la UE/CEA/CEE."
        ]
      },
      {
        nombre: "Saber",
        val: d.saber,
        criterios: [
          "Conocimiento y manejo de elementos curriculares de la planificación.",
          "Conocimiento y dominio de elementos propios de su especialidad.",
          "Promueve el fortalecimiento del pensamiento crítico y reflexivo con las y los estudiantes.",
          "Dominio de aula usando estrategias pertinentes."
        ]
      },
      {
        nombre: "Hacer",
        val: d.hacer,
        criterios: [
          "Manifiesta creatividad en el uso de recursos materiales y educativos.",
          "Utiliza instrumentos de evaluación durante la concreción curricular."
        ]
      },
      {
        nombre: "Decidir",
        val: d.decidir,
        criterios: [
          "Asume las sugerencias y observaciones a los PDC elaborados.",
          "Aplica acciones de manera oportuna para la mejora de la PEC de manera oportuna."
        ]
      }
    ];

    dimensiones.forEach((dim) => {
      const dimTopY = currentTableY;

      dim.criterios.forEach((critText, idx) => {
        const itemLines = wrapText(critText, font, 7.5, colWidths[1] - 10);
        const lineH = 9;
        const rowH = Math.max(20, itemLines.length * lineH + 8);
        const textStartY = currentTableY - (rowH / 2) + ((itemLines.length * lineH) / 2) - 6;

        itemLines.forEach((l, lineIdx) => {
          page.drawText(l, {
            x: colX[1] + 5,
            y: textStartY - lineIdx * lineH,
            size: 7.5,
            font,
            color: COLOR_TEXT,
          });
        });

        currentTableY -= rowH;

        // Línea horizontal interna solo en la columna de Criterios
        if (idx < dim.criterios.length - 1) {
          hLine(page, colX[1], colX[2], currentTableY);
        }
      });

      const dimBottomY = currentTableY;

      // Imprimir Nota Única de la Dimensión centrada
      if (dim.val !== undefined && dim.val !== null && String(dim.val).trim() !== "") {
        const vNum = Math.round(parseFloat(dim.val) || 0);
        const vStr = String(vNum);
        const wV = fontBold.widthOfTextAtSize(vStr, 9.5);
        const centerY = (dimTopY + dimBottomY) / 2;
        
        page.drawText(vStr, {
          x: colX[2] + (colWidths[2] / 2) - (wV / 2),
          y: centerY - 3,
          size: 9.5,
          font: fontBold,
          color: COLOR_TEXT,
        });
      }

      // Imprimir Etiqueta Dimensión centrada cómodamente en la columna de 42 pt
      const dimCenterY = (dimTopY + dimBottomY) / 2;
      page.drawText(dim.nombre, {
        x: MARGIN_LEFT + colWidths[0] / 2 - fontBold.widthOfTextAtSize(dim.nombre, 8.5) / 2,
        y: dimCenterY - 3,
        size: 8.5,
        font: fontBold,
        color: COLOR_TEXT,
      });

      // Línea divisoria completa al final de la dimensión
      hLine(page, MARGIN_LEFT, RIGHT_X, dimBottomY);
    });

    // BORDES VERTICALES DE EVALUACIÓN
    vLine(page, colX[0], tableTop, currentTableY);
    vLine(page, colX[1], tableTop, currentTableY);
    vLine(page, colX[2], tableTop, currentTableY);
    vLine(page, colX[3], tableTop, currentTableY);

    // FILA DEL PROMEDIO FINAL
    const pfVal = d.promedio_numeral ?? "";
    const pfStr = pfVal !== "" ? String(Math.round(parseFloat(pfVal) || 0)) : "";
    const litVal = obtenerLiteralRedondeado(pfVal, d.promedio_literal);

    const widthColNum = 165;
    const splitX = MARGIN_LEFT + widthColNum;

    const rowNumH = 20;
    const yNumRow = currentTableY;

    // Columna 1 (Izquierda): Promedio Final (Número entero)
    page.drawText("Promedio Final (Número entero)", {
      x: MARGIN_LEFT + 6,
      y: yNumRow - 13,
      size: 8,
      font: fontBold,
      color: COLOR_TEXT,
    });

    // Columna 2 (Centro - Arriba): Numeral:
    page.drawText("Numeral:", {
      x: splitX + 6,
      y: yNumRow - 13,
      size: 8,
      font: fontBold,
      color: COLOR_TEXT,
    });

    // Columna 3 (Derecha - Arriba): Valor del Numeral
    if (pfStr) {
      const wPf = fontBold.widthOfTextAtSize(pfStr, 9.5);
      page.drawText(pfStr, {
        x: colX[2] + (colWidths[2] / 2) - (wPf / 2),
        y: yNumRow - 13,
        size: 9.5,
        font: fontBold,
        color: COLOR_TEXT,
      });
    }

    currentTableY -= rowNumH;

    // Línea horizontal divisoria interna
    hLine(page, splitX, RIGHT_X, currentTableY);

    const rowLitH = 22;
    const yLitRow = currentTableY;

    // Columna 2 (Centro - Abajo): Literal: Y VALOR
    page.drawText("Literal:", {
      x: splitX + 6,
      y: yLitRow - 14,
      size: 8,
      font: fontBold,
      color: COLOR_TEXT,
    });

    if (litVal) {
      page.drawText(litVal, {
        x: splitX + 6 + fontBold.widthOfTextAtSize("Literal:", 8) + 6,
        y: yLitRow - 14,
        size: 8.5,
        font: fontBold,
        color: COLOR_TEXT,
      });
    }

    currentTableY -= rowLitH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // Bordes verticales de la sección de Promedio Final
    vLine(page, MARGIN_LEFT, yNumRow, currentTableY);
    vLine(page, splitX, yNumRow, currentTableY);
    vLine(page, colX[2], yNumRow, yNumRow - rowNumH);
    vLine(page, colX[3], yNumRow, currentTableY);

    // RECUADRO OBSERVACIONES/SUGERENCIAS
    const obsBoxH = 42;
    const yObsBox = currentTableY;

    page.drawText("Observaciones/Sugerencias:", {
      x: MARGIN_LEFT + 6,
      y: yObsBox - 12,
      size: 8,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const obsVal = String(d.observaciones || "").trim();
    if (obsVal) {
      const obsLines = wrapText(obsVal, font, 7.5, CONTENT_WIDTH - 12);
      obsLines.forEach((l, idx) => {
        if (idx < 3) {
          page.drawText(l, {
            x: MARGIN_LEFT + 6,
            y: yObsBox - 23 - idx * 9,
            size: 7.5,
            font,
            color: COLOR_TEXT,
          });
        }
      });
    }

    currentTableY -= obsBoxH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    vLine(page, MARGIN_LEFT, yObsBox, currentTableY);
    vLine(page, RIGHT_X, yObsBox, currentTableY);

    cursorY = currentTableY - 20;

    // LUGAR Y FECHA
    const lblFecha = "Lugar y fecha: ";
    const valFecha = `${d.lugar_ciudad || 'El Alto'}, ${d.dia || String(new Date().getDate())} de ${d.mes || 'septiembre'} de ${d.ano || '2026'}`;

    const wLbl = font.widthOfTextAtSize(lblFecha, 8.5);
    const wVal = fontBold.widthOfTextAtSize(valFecha, 8.5);
    const totalFechaW = wLbl + wVal;
    const fechaStartX = RIGHT_X - totalFechaW;

    page.drawText(lblFecha, { x: fechaStartX, y: cursorY, size: 8.5, font, color: COLOR_TEXT });

    const valStartX = fechaStartX + wLbl;
    page.drawText(valFecha, { x: valStartX, y: cursorY, size: 8.5, font: fontBold, color: COLOR_TEXT });
    drawDottedLine(page, valStartX, valStartX + wVal, cursorY - 1.5);

    cursorY -= 48;

    // FIRMAS INFERIORES
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
    console.error("Error al generar PDF de la Ficha B-4 (3er Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};