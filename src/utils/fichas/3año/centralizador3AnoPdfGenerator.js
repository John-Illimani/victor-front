import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { PDF417 } from 'pdf417-generator';
import { centralizador3erAnoService } from '../../../services/fichas/3año/centralizador3erAnoService';

// Paleta de Colores Institucionales
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);            // Dorado (#C9A751)
const COLOR_TABLE_HEADER = rgb(155 / 255, 168 / 255, 102 / 255);    // Verde Oliva (#9BA866)
const COLOR_BORDER = rgb(0, 0, 0);

const BORDER = 0.8;

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

function campoPunteado(page, { label, value, x, y, endX, minLine = 50, font, fontBold, size = 8.5, forceUpper = true }) {
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

const generarPdf417DataUrl = (texto) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    try {
      PDF417.draw(texto, canvas, 2, 2);
      resolve(canvas.toDataURL('image/png'));
    } catch (e) {
      console.error("Error al renderizar código PDF417:", e);
      resolve(null);
    }
  });
};

export const imprimirCentralizador3erAno = async (estudianteId, blockchainData = {}) => {
  try {
    const response = await centralizador3erAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para el Centralizador."
      };
    }

    const d = response.datos;

    const txHash = blockchainData?.tx_hash || blockchainData?.txHash || '';
    const hashLocal = blockchainData?.hash_local || blockchainData?.hash || '';

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
    page.setSize(612, 792); 
    const pageWidth = 612;
    const pageHeight = 792;

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

    const MARGIN_TOP = (5 / 2.54) * 72; 
    const MARGIN_LEFT = 85.04;          
    const MARGIN_RIGHT = 51.31;         
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT);
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // TÍTULO PRINCIPAL
    const titleLines = [
      "CENTRALIZADOR DE EVALUACIÓN",
      "IEPC-PEC 3º AÑO DE FORMACIÓN"
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

    page.drawText("DATOS REFERENCIALES:", {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 8.5,
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
      size: 8.5,
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
      size: 8.5,
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
      size: 8.5,
    });
    cursorY -= 20;

    // TABLA
    const tableTop = cursorY;
    const colWidths = [120, 215.65, 70, 70];
    const colX = [MARGIN_LEFT, MARGIN_LEFT + colWidths[0], MARGIN_LEFT + colWidths[0] + colWidths[1], MARGIN_LEFT + colWidths[0] + colWidths[1] + colWidths[2], RIGHT_X];

    const bannerH = 18;
    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, bannerH, COLOR_TABLE_HEADER);

    const bannerText = "CENTRALIZADOR DE LA EVALUACIÓN";
    const wBanner = fontBold.widthOfTextAtSize(bannerText, 9);
    page.drawText(bannerText, {
      x: CONTENT_CENTER_X - wBanner / 2,
      y: tableTop - 12,
      size: 9,
      font: fontBold,
      color: COLOR_TEXT,
    });

    let currentTableY = tableTop - bannerH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    const headerH = 20;
    fillRect(page, MARGIN_LEFT, currentTableY, CONTENT_WIDTH, headerH, COLOR_TABLE_HEADER);

    const headers = [
      { text: "Etapa", x: colX[0], w: colWidths[0] },
      { text: "Actividades", x: colX[1], w: colWidths[1] },
      { text: "Ficha", x: colX[2], w: colWidths[2] },
      { text: "Puntaje", x: colX[3], w: colWidths[3] }
    ];

    headers.forEach(h => {
      const w = fontBold.widthOfTextAtSize(h.text, 8.5);
      page.drawText(h.text, {
        x: h.x + (h.w / 2) - (w / 2),
        y: currentTableY - 14,
        size: 8.5,
        font: fontBold,
        color: COLOR_TEXT,
      });
    });

    currentTableY -= headerH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    const etapas = [
      {
        nombre: "Etapa preparatoria",
        items: [
          { act: "Técnicas e instrumentos de investigación", ficha: "A-1", val: d.nota_a1 }
        ]
      },
      {
        nombre: "Etapa de ejecución",
        items: [
          { act: "Apoyo – seguimiento del Docente Acompañante de la ESFM/UA", ficha: "B-1", val: d.nota_b1 },
          { act: "Asistencia práctica educativa comunitaria.", ficha: "B-2", val: d.nota_b2 },
          { act: "Apoyo - Seguimiento del docente guía de la UE/ CEA/CEE, en la concreción curricular.", ficha: "B-3", val: d.nota_b3 },
          { act: "Seguimiento y apoyo del docente tutor/acompañante", ficha: "B-4", val: d.nota_b4 }
        ]
      },
      {
        nombre: "Etapa de producción",
        items: [
          { act: "Presentación del informe diagnóstico socioparticipativo", ficha: "B-5", val: d.nota_b5 }
        ]
      }
    ];

    etapas.forEach((etapa) => {
      const etapaTopY = currentTableY;

      etapa.items.forEach((item, idx) => {
        const itemLines = wrapText(item.act, font, 7.5, colWidths[1] - 10);
        const lineH = 9;
        const rowH = Math.max(22, itemLines.length * lineH + 8);
        const textStartY = currentTableY - (rowH / 2) + ((itemLines.length * lineH) / 2) - 6;

        itemLines.forEach((l, lIdx) => {
          page.drawText(l, {
            x: colX[1] + 5,
            y: textStartY - lIdx * lineH,
            size: 7.5,
            font,
            color: COLOR_TEXT,
          });
        });

        const wFicha = fontBold.widthOfTextAtSize(item.ficha, 8.5);
        page.drawText(item.ficha, {
          x: colX[2] + (colWidths[2] / 2) - (wFicha / 2),
          y: currentTableY - (rowH / 2) - 3,
          size: 8.5,
          font: fontBold,
          color: COLOR_TEXT,
        });

        if (item.val !== undefined && item.val !== null && String(item.val).trim() !== "") {
          const vNum = Math.round(parseFloat(item.val) || 0);
          const vStr = String(vNum);
          const wV = font.widthOfTextAtSize(vStr, 8.5);
          page.drawText(vStr, {
            x: colX[3] + (colWidths[3] / 2) - (wV / 2),
            y: currentTableY - (rowH / 2) - 3,
            size: 8.5,
            font,
            color: COLOR_TEXT,
          });
        }

        currentTableY -= rowH;

        if (idx < etapa.items.length - 1) {
          hLine(page, colX[1], RIGHT_X, currentTableY);
        }
      });

      const etapaBottomY = currentTableY;
      const etapaCenterY = (etapaTopY + etapaBottomY) / 2;
      page.drawText(etapa.nombre, {
        x: MARGIN_LEFT + colWidths[0] / 2 - fontBold.widthOfTextAtSize(etapa.nombre, 8) / 2,
        y: etapaCenterY - 3,
        size: 8,
        font: fontBold,
        color: COLOR_TEXT,
      });

      hLine(page, MARGIN_LEFT, RIGHT_X, etapaBottomY);
    });

    const pfVal = d.promedio_numeral ?? "";
    const promH = 20;
    const yPromRow = currentTableY;

    page.drawText("Promedio (Número entero)", {
      x: MARGIN_LEFT + 6,
      y: yPromRow - 13,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    if (pfVal !== "") {
      const pfStr = String(Math.round(parseFloat(pfVal) || 0));
      const wPf = fontBold.widthOfTextAtSize(pfStr, 9.5);
      page.drawText(pfStr, {
        x: colX[3] + (colWidths[3] / 2) - (wPf / 2),
        y: yPromRow - 13,
        size: 9.5,
        font: fontBold,
        color: COLOR_TEXT,
      });
    }

    currentTableY -= promH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    const litRowH = 22;
    const yLitRow = currentTableY;
    const litVal = obtenerLiteralRedondeado(pfVal, d.promedio_literal);

    page.drawText("Literal:", {
      x: MARGIN_LEFT + 6,
      y: yLitRow - 14,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    if (litVal) {
      page.drawText(litVal, {
        x: MARGIN_LEFT + 6 + fontBold.widthOfTextAtSize("Literal:", 8.5) + 6,
        y: yLitRow - 14,
        size: 8.5,
        font: fontBold,
        color: COLOR_TEXT,
      });
    }

    currentTableY -= litRowH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    vLine(page, colX[0], tableTop, currentTableY);
    vLine(page, colX[1], tableTop, yPromRow);
    vLine(page, colX[2], tableTop, yPromRow);
    vLine(page, colX[3], tableTop, yLitRow);
    vLine(page, RIGHT_X, tableTop, currentTableY);

    cursorY = currentTableY - 15;

    // OBSERVACIONES
    const obsHeaderH = 16;
    const yObsHeader = cursorY;
    fillRect(page, MARGIN_LEFT, yObsHeader, CONTENT_WIDTH, obsHeaderH, COLOR_TABLE_HEADER);

    page.drawText("OBSERVACIONES Y/O SUGERENCIAS:", {
      x: MARGIN_LEFT + 6,
      y: yObsHeader - 11,
      size: 8,
      font: fontBold,
      color: COLOR_TEXT,
    });

    cursorY -= obsHeaderH;
    hLine(page, MARGIN_LEFT, RIGHT_X, cursorY);

    const obsBoxH = 40;
    const yObsBox = cursorY;

    const obsVal = String(d.observaciones || "").trim();
    if (obsVal) {
      const obsLines = wrapText(obsVal, font, 7.5, CONTENT_WIDTH - 12);
      obsLines.forEach((l, idx) => {
        if (idx < 3) {
          page.drawText(l, {
            x: MARGIN_LEFT + 6,
            y: yObsBox - 12 - idx * 9,
            size: 7.5,
            font,
            color: COLOR_TEXT,
          });
        }
      });
    }

    cursorY -= obsBoxH;
    hLine(page, MARGIN_LEFT, RIGHT_X, cursorY);

    vLine(page, MARGIN_LEFT, yObsHeader, cursorY);
    vLine(page, RIGHT_X, yObsHeader, cursorY);

    cursorY -= 20;

    // FECHA
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

    cursorY -= 45;

    // FIRMAS
    const colSigWidth = CONTENT_WIDTH / 2;
    const lineW = 160;

    const firmas = [
      {
        label: "Estudiante de ESFM/UA",
        xCenter: MARGIN_LEFT + colSigWidth * 0.5
      },
      {
        label: "Docente\nAcompañante de la ESFM/UA",
        xCenter: MARGIN_LEFT + colSigWidth * 1.5
      }
    ];

    firmas.forEach((f) => {
      const lineStartX = f.xCenter - lineW / 2;
      const lineEndX = f.xCenter + lineW / 2;

      drawDottedLine(page, lineStartX, lineEndX, cursorY);

      const labelLines = f.label.split('\n');
      labelLines.forEach((l, idx) => {
        const w = fontBold.widthOfTextAtSize(l, 8);
        page.drawText(l, {
          x: f.xCenter - w / 2,
          y: cursorY - 12 - idx * 10,
          size: 8,
          font: fontBold,
          color: COLOR_TEXT,
        });
      });
    });

    // CÓDIGO PDF417 BLOCKCHAIN
    const pdf417X = MARGIN_LEFT;
    const pdf417Y = 100;
    const pdf417Width = 200;
    const pdf417Height = 45;

    const txHashValido = txHash || hashLocal || estudianteId;
    const pdf417TextData = `ESTUDIANTE:${d.apellidos_nombres || ''}|TX_HASH:${txHashValido}|HASH_LOCAL:${hashLocal || "NO_DISPONIBLE"}`;

    const pdf417DataUrl = await generarPdf417DataUrl(pdf417TextData);

    if (pdf417DataUrl) {
      const pdf417Image = await pdfDoc.embedPng(pdf417DataUrl);
      page.drawImage(pdf417Image, {
        x: pdf417X,
        y: pdf417Y,
        width: pdf417Width,
        height: pdf417Height
      });
    }

    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, '_blank');
    return { success: true };

  } catch (error) {
    console.error("Error al generar PDF del Centralizador 3er Año:", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};