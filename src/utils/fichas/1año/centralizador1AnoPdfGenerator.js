import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { PDF417 } from "pdf417-generator";
import { centralizador1erAnoService } from "../../../services/fichas/1año/centralizador1erAnoService";

const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255); 
const COLOR_TABLE_HEADER = rgb(247 / 255, 181 / 255, 0); 
const COLOR_BORDER = rgb(0, 0, 0);

function wrapText(text, font, fontSize, maxWidth) {
  if (!text) return [];
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}

function formatNota(val) {
  if (val === undefined || val === null || val === "") return "0";
  const num = parseFloat(val);
  if (isNaN(num)) return "0";
  return num % 1 === 0 ? String(Math.round(num)) : String(num);
}

function formatPromedioRedondeado(val) {
  if (val === undefined || val === null || val === "") return "0";
  const num = parseFloat(val);
  if (isNaN(num)) return "0";
  return String(Math.round(num));
}

function numeroALiteralEntero(num) {
  const n = Math.round(parseFloat(num) || 0);
  if (n <= 0) return "CERO";
  if (n >= 100) return "CIEN";

  const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
  const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  const especiales = {
    11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE", 15: "QUINCE",
    16: "DIECISÉIS", 17: "DIECISIETE", 18: "DIECIOCHO", 19: "DIECINUEVE",
    21: "VEINTIUNO", 22: "VEINTIDÓS", 23: "VEINTITRÉS", 24: "VEINTICUATRO",
    25: "VEINTICINCO", 26: "VEINTISÉIS", 27: "VEINTISIETE", 28: "VEINTIOCHO", 29: "VEINTINUEVE"
  };

  if (n < 10) return unidades[n];
  if (especiales[n]) return especiales[n];

  const d = Math.floor(n / 10);
  const u = n % 10;
  if (d === 2) return `VEINTI${unidades[u]}`;
  return u === 0 ? decenas[d] : `${decenas[d]} Y ${unidades[u]}`;
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

export const imprimirCentralizador1erAno = async (estudianteId, blockchainData = {}) => {
  try {
    const response = await centralizador1erAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return { success: false, message: "No existen datos registrados para el Cuadro Centralizador." };
    }

    const d = response.datos;

    const txHash = blockchainData?.tx_hash || blockchainData?.txHash || '';
    const hashLocal = blockchainData?.hash_local || blockchainData?.hash || '';

    const urlPlantilla = "/pdf/1ano/plantilla.pdf";
    const resFetch = await fetch(urlPlantilla);

    if (!resFetch.ok) {
      return { success: false, message: `No se encontró la plantilla en la ruta: ${urlPlantilla}.` };
    }

    const pdfBytes = await resFetch.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    pdfDoc.registerFontkit(fontkit);

    const page = pdfDoc.getPages()[0];
    page.setSize(612, 792); 
    const pageWidth = 612;

    let fontCalibri, fontCalibriBold, fontArialBold;
    try {
      const resCalibri = await fetch("/fonts/calibri.ttf");
      const calibriBytes = await resCalibri.arrayBuffer();
      fontCalibri = await pdfDoc.embedFont(calibriBytes);

      const resCalibriBold = await fetch("/fonts/calibri-bold.ttf");
      const calibriBoldBytes = await resCalibriBold.arrayBuffer();
      fontCalibriBold = await pdfDoc.embedFont(calibriBoldBytes);

      const resArialBold = await fetch("/fonts/arial-bold.ttf");
      const arialBoldBytes = await resArialBold.arrayBuffer();
      fontArialBold = await pdfDoc.embedFont(arialBoldBytes);
    } catch (e) {
      fontCalibri = await pdfDoc.embedFont(StandardFonts.Helvetica);
      fontCalibriBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      fontArialBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    }

    const MARGIN_LEFT = 85.04;  
    const MARGIN_RIGHT = 51.31; 
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); 
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;       

    let cursorY = 665;

    // TÍTULO
    const t1 = "CUADRO CENTRALIZADOR";
    const t1W = fontArialBold.widthOfTextAtSize(t1, 13);
    page.drawText(t1, { x: CONTENT_CENTER_X - t1W / 2, y: cursorY, size: 13, font: fontArialBold, color: COLOR_TITLE });

    cursorY -= 18;
    const descText = "La o el docente acompañante centraliza y promedia las calificaciones obtenidas por la o el estudiante";
    const descLines = wrapText(descText, fontCalibri, 9, CONTENT_WIDTH);
    
    descLines.forEach((line) => {
      page.drawText(line, { x: MARGIN_LEFT, y: cursorY, size: 9, font: fontCalibri, color: COLOR_TEXT });
      cursorY -= 14;
    });

    cursorY -= 4;

    // DATOS REFERENCIALES
    const refTitle = "DATOS REFERENCIALES DEL ESTUDIANTE:";
    page.drawText(refTitle, { x: MARGIN_LEFT, y: cursorY, size: 9.5, font: fontCalibriBold, color: COLOR_TITLE });
    cursorY -= 16;

    const maxLineRight = pageWidth - MARGIN_RIGHT; // Límite estricto del margen derecho

    const drawReferentialField = (label, value) => {
      page.drawText(label, { x: MARGIN_LEFT, y: cursorY, size: 9, font: fontCalibri, color: COLOR_TEXT });
      const labelW = fontCalibri.widthOfTextAtSize(label, 9);
      const valX = MARGIN_LEFT + labelW;
      
      // 1. DIBUJAR LA LÍNEA PUNTEADA DE FONDO DESDE EL INICIO DEL CAMPO HASTA EL MARGEN DERECHO
      page.drawLine({
        start: { x: valX, y: cursorY - 1 },
        end: { x: maxLineRight, y: cursorY - 1 },
        thickness: 0.8,
        dashArray: [1, 1.5], // Patrón de puntitos finos
        color: COLOR_TEXT,
      });

      // 2. DIBUJAR EL TEXTO DEL CAMPO SOBREPUESTO EN NEGRITA
      const valText = (value && String(value).trim() !== "" ? value : "").toUpperCase();
      if (valText) {
        page.drawText(valText, { x: valX, y: cursorY, size: 9, font: fontCalibriBold, color: COLOR_TEXT });
      }

      cursorY -= 15;
    };

    drawReferentialField("Apellidos y nombres: ", d.apellidos_nombres);
    drawReferentialField("ESFM/UA: ", d.esfm_ua || "ESFM Simón Bolívar / UA El Alto");
    drawReferentialField("Especialidad: ", d.especialidad);

    cursorY -= 15;

    // TABLA CENTRALIZADORA
    const tableTop = cursorY;
    const colWidths = [237.82, 237.83]; 
    const colX = [MARGIN_LEFT, MARGIN_LEFT + colWidths[0], MARGIN_LEFT + CONTENT_WIDTH];

    const headerHeight = 28;
    page.drawRectangle({ x: MARGIN_LEFT, y: tableTop - headerHeight, width: CONTENT_WIDTH, height: headerHeight, color: COLOR_TABLE_HEADER });

    const headers = [
      { text: "FICHAS", x: colX[0] + colWidths[0] / 2 },
      { text: "PUNTAJE", x: colX[1] + colWidths[1] / 2 },
    ];

    headers.forEach((h) => {
      const textWidth = fontCalibriBold.widthOfTextAtSize(h.text, 12);
      page.drawText(h.text, { x: h.x - textWidth / 2, y: tableTop - 19, size: 12, font: fontCalibriBold, color: COLOR_TEXT });
    });

    page.drawLine({ start: { x: MARGIN_LEFT, y: tableTop }, end: { x: colX[2], y: tableTop }, thickness: 0.8, color: COLOR_BORDER });
    page.drawLine({ start: { x: MARGIN_LEFT, y: tableTop - headerHeight }, end: { x: colX[2], y: tableTop - headerHeight }, thickness: 0.8, color: COLOR_BORDER });

    const filasFichas = [
      { label: "F-1", val: d.nota_f1 },
      { label: "F-2", val: d.nota_f2 },
      { label: "F-3", val: d.nota_f3 },
      { label: "F-4", val: d.nota_f4 },
      { label: "F-5", val: d.nota_f5 },
    ];

    let rowY = tableTop - headerHeight;
    const rowHeight = 22;

    filasFichas.forEach((fila) => {
      const rowBottomY = rowY - rowHeight;

      page.drawText(fila.label, { x: colX[0] + 15, y: rowY - 15, size: 9, font: fontCalibriBold, color: COLOR_TEXT });

      const notaText = formatNota(fila.val);
      const notaW = fontCalibriBold.widthOfTextAtSize(notaText, 9);
      page.drawText(notaText, { x: colX[1] + colWidths[1] / 2 - notaW / 2, y: rowY - 15, size: 9, font: fontCalibriBold, color: COLOR_TEXT });

      page.drawLine({ start: { x: MARGIN_LEFT, y: rowBottomY }, end: { x: colX[2], y: rowBottomY }, thickness: 0.8, color: COLOR_BORDER });
      rowY = rowBottomY;
    });

    // PROMEDIO FINAL
    const promFinalY = rowY - rowHeight;
    const promLabel = "PROMEDIO FINAL";
    const promLabelW = fontCalibriBold.widthOfTextAtSize(promLabel, 9);

    page.drawText(promLabel, { x: colX[0] + colWidths[0] / 2 - promLabelW / 2, y: rowY - 15, size: 9, font: fontCalibriBold, color: COLOR_TEXT });

    const promNumVal = formatPromedioRedondeado(d.promedio_numeral);
    const promNumW = fontCalibriBold.widthOfTextAtSize(promNumVal, 9);
    page.drawText(promNumVal, { x: colX[1] + colWidths[1] / 2 - promNumW / 2, y: rowY - 15, size: 9, font: fontCalibriBold, color: COLOR_TEXT });

    page.drawLine({ start: { x: MARGIN_LEFT, y: promFinalY }, end: { x: colX[2], y: promFinalY }, thickness: 0.8, color: COLOR_BORDER });

    // PROMEDIO LITERAL
    const litHeight = 35;
    const tableBottom = promFinalY - litHeight;

    page.drawText("Promedio literal:", { x: MARGIN_LEFT + 8, y: promFinalY - 21, size: 9, font: fontCalibriBold, color: COLOR_TEXT });

    const literalLimpio = numeroALiteralEntero(d.promedio_numeral);
    page.drawText(literalLimpio, { x: MARGIN_LEFT + 92, y: promFinalY - 21, size: 9, font: fontCalibriBold, color: COLOR_TEXT });

    // BORDES EXTERIORES
    page.drawLine({ start: { x: MARGIN_LEFT, y: tableBottom }, end: { x: colX[2], y: tableBottom }, thickness: 0.8, color: COLOR_BORDER });
    page.drawLine({ start: { x: MARGIN_LEFT, y: tableTop }, end: { x: MARGIN_LEFT, y: tableBottom }, thickness: 0.8, color: COLOR_BORDER });
    page.drawLine({ start: { x: colX[1], y: tableTop }, end: { x: colX[1], y: promFinalY }, thickness: 0.8, color: COLOR_BORDER });
    page.drawLine({ start: { x: colX[2], y: tableTop }, end: { x: colX[2], y: tableBottom }, thickness: 0.8, color: COLOR_BORDER });

    cursorY = tableBottom - 35;

    // FECHA
    const lblFecha = "Lugar y fecha: ";
    const valFecha = `${d.lugar_ciudad || "El Alto"}, ${d.dia || "17"} de ${d.mes || "septiembre"} de ${d.ano || "2026"}`;
    
    const wLbl = fontCalibri.widthOfTextAtSize(lblFecha, 9);
    const wVal = fontCalibriBold.widthOfTextAtSize(valFecha, 9);
    const totalFechaW = wLbl + wVal;
    
    const fechaStartX = CONTENT_CENTER_X - totalFechaW / 2;

    page.drawText(lblFecha, { x: fechaStartX, y: cursorY, size: 9, font: fontCalibri, color: COLOR_TEXT });
    
    const fechaValStartX = fechaStartX + wLbl;
    page.drawText(valFecha, { x: fechaValStartX, y: cursorY, size: 9, font: fontCalibriBold, color: COLOR_TEXT });
    
    page.drawLine({ 
      start: { x: fechaValStartX, y: cursorY - 2 }, 
      end: { x: fechaValStartX + wVal, y: cursorY - 2 }, 
      thickness: 0.8, 
      dashArray: [1.5, 1.5], 
      color: COLOR_TEXT 
    });

    cursorY -= 50;

    // FIRMAS
    const sigWidth = 160;
    const sig1X = MARGIN_LEFT + 30;
    const sig2X = MARGIN_LEFT + CONTENT_WIDTH - sigWidth - 30;

    page.drawLine({ start: { x: sig1X, y: cursorY }, end: { x: sig1X + sigWidth, y: cursorY }, thickness: 0.8, dashArray: [2, 2], color: COLOR_BORDER });
    const sigLbl1 = "Estudiante";
    const sigLbl1W = fontCalibri.widthOfTextAtSize(sigLbl1, 9);
    page.drawText(sigLbl1, { x: sig1X + sigWidth / 2 - sigLbl1W / 2, y: cursorY - 14, size: 9, font: fontCalibri, color: COLOR_TEXT });

    page.drawLine({ start: { x: sig2X, y: cursorY }, end: { x: sig2X + sigWidth, y: cursorY }, thickness: 0.8, dashArray: [2, 2], color: COLOR_BORDER });
    const sigLbl2 = "Docente Acompañante ESFM/UA";
    const sigLbl2W = fontCalibri.widthOfTextAtSize(sigLbl2, 9);
    page.drawText(sigLbl2, { x: sig2X + sigWidth / 2 - sigLbl2W / 2, y: cursorY - 14, size: 9, font: fontCalibri, color: COLOR_TEXT });

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
    const blob = new Blob([pdfFinalBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, "_blank");
    return { success: true };
  } catch (error) {
    console.error("Error al generar PDF del Cuadro Centralizador:", error);
    return { success: false, message: `Error al procesar el documento PDF: ${error.message}` };
  }
};