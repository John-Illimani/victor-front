import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaB13erAnoService } from '../../../services/fichas/3año/fichaB13erAnoService';
import { userService } from '../../../services/userService';

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

// HELPER PARA DIVIDIR TEXTO EN MÚLTIPLES LÍNEAS SEGÚN ANCHO REAL EN PUNTOS
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

export const imprimirFichaB1_3erAno = async (estudianteId) => {
  try {
    const response = await fichaB13erAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha B-1."
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

    // Carga de Fuentes
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

    // TÍTULO PRINCIPAL (Dorado 13 pt Bold Centrado)
    const titleLines = [
      "FICHA B-1",
      "APOYO Y SEGUIMIENTO DEL DOCENTE",
      "ACOMPAÑANTE DE LA ESFM/UA"
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

    page.drawText("DATOS REFERENCIALES:", {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 9.5,
      font: fontBold,
      color: COLOR_TEXT,
    });
    cursorY -= 15;

    campoPunteado(page, {
      label: "ESFM/UA: ",
      value: d.esfm_ua || "ESFM Simón Bolívar / UA El Alto",
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9,
    });
    cursorY -= 15;

    campoPunteado(page, {
      label: "Apellido(s) y Nombre(s) del(a) estudiante: ",
      value: d.apellidos_nombres || "",
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9,
    });
    cursorY -= 15;

    campoPunteado(page, {
      label: "Especialidad: ",
      value: d.especialidad || "",
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9,
    });
    cursorY -= 18;

    // RECUADRO INSTRUCTIVO
    const boxH = 48;
    page.drawRectangle({
      x: MARGIN_LEFT,
      y: cursorY - boxH,
      width: CONTENT_WIDTH,
      height: boxH,
      borderColor: COLOR_BORDER,
      borderWidth: 0.8,
    });

    const b1 = "•   La/el Docente Acompañante de la ESFM/UA realiza apoyo, orientación y seguimiento al proceso de la IEPC-";
    const b1_2 = "PEC antes y durante la Práctica Educativa Comunitaria.";
    const b2 = "•   Cada integrante del equipo comunitario presenta sus PDC y la guía de concreción correspondiente, además";
    const b2_2 = "de las evidencias del proceso investigativo desarrollado en la UE/CEA/CEE.";
    const b3 = "•   La evaluación es individual y valora la responsabilidad, el acompañamiento formativo, el dominio curricular y";
    const b3_2 = "la participación en el proceso investigativo, con énfasis en el diagnóstico socioparticipativo.";

    page.drawText(b1, { x: MARGIN_LEFT + 8, y: cursorY - 10, size: 7.5, font, color: COLOR_TEXT });
    page.drawText(b1_2, { x: MARGIN_LEFT + 16, y: cursorY - 17, size: 7.5, font, color: COLOR_TEXT });
    page.drawText(b2, { x: MARGIN_LEFT + 8, y: cursorY - 25, size: 7.5, font, color: COLOR_TEXT });
    page.drawText(b2_2, { x: MARGIN_LEFT + 16, y: cursorY - 32, size: 7.5, font, color: COLOR_TEXT });
    page.drawText(b3, { x: MARGIN_LEFT + 8, y: cursorY - 40, size: 7.5, font, color: COLOR_TEXT });

    cursorY -= (boxH + 8);

    // ESTRUCTURA DE LA TABLA DE EVALUACIÓN
    const tableTop = cursorY;
    const colWidths = [110, 205.65, 80, 80]; // Total: 475.65 pt
    const colX = [MARGIN_LEFT];
    for (let i = 0; i < colWidths.length; i++) colX.push(colX[i] + colWidths[i]);

    const headerH = 28;
    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, headerH, COLOR_TABLE_HEADER);

    const headers = [
      { text: "ETAPA", col: 0 },
      { text: "CRITERIOS DE EVALUACIÓN", col: 1 },
      { text: "VALORACIÓN\n1 A 100 PUNTOS", col: 2 },
      { text: "OBSERVACIONES", col: 3 }
    ];

    headers.forEach(({ text, col }) => {
      const lines = text.split("\n");
      const lineH = 8.5;
      const startY = tableTop - (headerH / 2) + ((lines.length * lineH) / 2) - 5;

      lines.forEach((l, idx) => {
        const w = fontBold.widthOfTextAtSize(l, 8);
        page.drawText(l, {
          x: colX[col] + colWidths[col] / 2 - w / 2,
          y: startY - idx * lineH,
          size: 8,
          font: fontBold,
          color: COLOR_TEXT,
        });
      });
    });

    let currentTableY = tableTop - headerH;

    // DEFINICIÓN DE CRITERIOS CON OBSERVACIONES INDIVIDUALES
    const criterios = [
      {
        item: "Presenta Planes de Desarrollo Curricular y otros documentos de apoyo requeridos para el desarrollo de la práctica.",
        val: d.c1,
        obs: d.obs_c1,
        grupo: 1
      },
      {
        item: "Elabora la guía de concreción de cada PDC de manera clara, precisa y coherente con el proceso formativo.",
        val: d.c2,
        obs: d.obs_c2,
        grupo: 1
      },
      {
        item: "Demuestra responsabilidad y puntualidad en el desarrollo de la Práctica Educativa Comunitaria y del proceso investigativo en la UE/CEA/CEE.",
        val: d.c3,
        obs: d.obs_c3,
        grupo: 2
      },
      {
        item: "Manifiesta iniciativa, creatividad y dominio en la concreción curricular y en las actividades vinculadas al diagnóstico socioparticipativo.",
        val: d.c4,
        obs: d.obs_c4,
        grupo: 2
      },
      {
        item: "Aplica técnicas e instrumentos de investigación de manera pertinente para la identificación, análisis y priorización de necesidades, problemas y/o potencialidades.",
        val: d.c5,
        obs: d.obs_c5,
        grupo: 2
      }
    ];

    const topGrupo1 = currentTableY;
    let bottomGrupo1 = currentTableY;

    criterios.forEach((c, idx) => {
      const maxColTextWidth = colWidths[1] - 10;
      const itemLines = wrapText(c.item, font, 7.5, maxColTextWidth);
      
      const lineH = 9.5;
      const rowH = Math.max(30, itemLines.length * lineH + 12);
      const textStartY = currentTableY - (rowH / 2) + ((itemLines.length * lineH) / 2) - 7;

      itemLines.forEach((l, lineIdx) => {
        page.drawText(l, {
          x: colX[1] + 5,
          y: textStartY - lineIdx * lineH,
          size: 7.5,
          font,
          color: COLOR_TEXT,
        });
      });

      // VALORACIÓN
      if (c.val !== undefined && c.val !== null && String(c.val).trim() !== "") {
        const valNum = Math.round(parseFloat(c.val) || 0);
        const valStr = String(valNum);
        const wVal = font.widthOfTextAtSize(valStr, 8.5);
        page.drawText(valStr, {
          x: colX[2] + colWidths[2] / 2 - wVal / 2,
          y: currentTableY - (rowH / 2) - 3,
          size: 8.5,
          font,
          color: COLOR_TEXT,
        });
      }

      // OBSERVACIÓN INDIVIDUAL POR CRITERIO
      const obsVal = String(c.obs || "").trim();
      if (obsVal) {
        const obsLines = wrapText(obsVal, font, 7, colWidths[3] - 8);
        obsLines.forEach((ol, oIdx) => {
          if (oIdx < 3) {
            page.drawText(ol, {
              x: colX[3] + 4,
              y: currentTableY - 12 - oIdx * 8.5,
              size: 7,
              font,
              color: COLOR_TEXT,
            });
          }
        });
      }

      currentTableY -= rowH;

      if (idx === 1) {
        bottomGrupo1 = currentTableY;
      }

      // Línea divisoria en columnas de Criterios, Valoración y Observaciones
      page.drawLine({
        start: { x: colX[1], y: currentTableY },
        end: { x: RIGHT_X, y: currentTableY },
        thickness: BORDER,
        color: COLOR_BORDER,
      });
    });

    const bottomGrupo2 = currentTableY;

    // LÍNEA DIVISORIA COMPLETA QUE SEPARA LOS CRITERIOS DE LA FILA PUNTAJE FINAL
    hLine(page, MARGIN_LEFT, RIGHT_X, bottomGrupo2);

    // DIBUJAR LÍNEA COMPLETA ENTRE GRUPO 1 Y GRUPO 2
    hLine(page, MARGIN_LEFT, RIGHT_X, bottomGrupo1);

    // TEXTO CENTRADO DE LAS ETAPAS
    const yE1Center = (topGrupo1 + bottomGrupo1) / 2;
    const e1Lines = ["Antes de la PEC:", "Planificación y", "organización para la", "concreción curricular."];
    e1Lines.forEach((l, idx) => {
      const w = fontBold.widthOfTextAtSize(l, 7.5);
      page.drawText(l, { x: colX[0] + colWidths[0] / 2 - w / 2, y: yE1Center + 12 - idx * 9, size: 7.5, font: fontBold, color: COLOR_TEXT });
    });

    const yE2Center = (bottomGrupo1 + bottomGrupo2) / 2;
    const e2Lines = ["Durante la PEC:", "Concreción curricular", "e investigación", "educativa en el", "marco de la Práctica", "Educativa", "Comunitaria."];
    e2Lines.forEach((l, idx) => {
      const w = fontBold.widthOfTextAtSize(l, 7);
      page.drawText(l, { x: colX[0] + colWidths[0] / 2 - w / 2, y: yE2Center + 22 - idx * 8, size: 7, font: fontBold, color: COLOR_TEXT });
    });

    // BORDES VERTICALES DE EVALUACIÓN
    colX.forEach((lineX) => vLine(page, lineX, tableTop, currentTableY));

    // FILA COMBINADA 1: PUNTAJE FINAL
    const finalH = 20;
    const yPuntajeFinal = currentTableY;

    const pfLabel = "Puntaje Final (Número entero)";
    const pfW = fontBold.widthOfTextAtSize(pfLabel, 8.5);
    page.drawText(pfLabel, { x: colX[2] - pfW - 8, y: yPuntajeFinal - 13, size: 8.5, font: fontBold, color: COLOR_TEXT });

    const pfVal = d.puntaje_final ?? d.promedio_numeral ?? "";
    if (pfVal !== "") {
      const pfStr = String(Math.round(parseFloat(pfVal) || 0));
      const pfValW = fontBold.widthOfTextAtSize(pfStr, 9);
      page.drawText(pfStr, { x: colX[2] + colWidths[2] / 2 - pfValW / 2, y: yPuntajeFinal - 13, size: 9, font: fontBold, color: COLOR_TEXT });
    }

    currentTableY -= finalH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    vLine(page, MARGIN_LEFT, yPuntajeFinal, currentTableY);
    vLine(page, colX[2], yPuntajeFinal, currentTableY);
    vLine(page, RIGHT_X, yPuntajeFinal, currentTableY);

    // FILA COMBINADA 2: LITERAL
    const litH = 22;
    const yLiteral = currentTableY;

    const litLabel = "Literal: ";
    page.drawText(litLabel, { x: MARGIN_LEFT + 6, y: yLiteral - 14, size: 8.5, font: fontBold, color: COLOR_TEXT });

    const litVal = obtenerLiteralRedondeado(pfVal, d.promedio_literal);
    if (litVal) {
      page.drawText(litVal, { x: MARGIN_LEFT + 6 + fontBold.widthOfTextAtSize(litLabel, 8.5), y: yLiteral - 14, size: 8.5, font: fontBold, color: COLOR_TEXT });
    }

    currentTableY -= litH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    vLine(page, MARGIN_LEFT, yLiteral, currentTableY);
    vLine(page, RIGHT_X, yLiteral, currentTableY);

    // SECCIÓN INTEGRADA: RECOMENDACIONES Y/O SUGERENCIAS
    const recHeaderH = 18;
    const yRecHeader = currentTableY;
    fillRect(page, MARGIN_LEFT, yRecHeader, CONTENT_WIDTH, recHeaderH, COLOR_TABLE_HEADER);
    page.drawText("RECOMENDACIONES Y/O SUGERENCIAS:", { x: MARGIN_LEFT + 6, y: yRecHeader - 12, size: 8.5, font: fontBold, color: COLOR_TEXT });

    currentTableY -= recHeaderH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    const recBoxH = 38;
    const yRecBox = currentTableY;

    const recVal = String(d.recomendaciones || "").trim();
    if (recVal) {
      const recLines = wrapText(recVal, font, 8, CONTENT_WIDTH - 12);
      recLines.forEach((l, idx) => {
        if (idx < 3) {
          page.drawText(l, { x: MARGIN_LEFT + 6, y: yRecBox - 13 - idx * 10, size: 8, font, color: COLOR_TEXT });
        }
      });
    }

    currentTableY -= recBoxH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // BORDES EXTERIORES DE RECOMENDACIONES
    vLine(page, MARGIN_LEFT, yRecHeader, currentTableY);
    vLine(page, RIGHT_X, yRecHeader, currentTableY);

    cursorY = currentTableY - 20;

    // LUGAR Y FECHA CENTRADO
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

    cursorY -= 48;

    // FIRMAS INFERIORES AJUSTADAS
    const colSigWidth = CONTENT_WIDTH / 2;
    const lineW = 170;

    const firmas = [
      {
        label: "Estudiante de ESFM/UA",
        xCenter: MARGIN_LEFT + colSigWidth * 0.5
      },
      {
        label: "Acompañante de la ESFM/UA",
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
    console.error("Error al generar PDF de la Ficha B-1 (3er Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};