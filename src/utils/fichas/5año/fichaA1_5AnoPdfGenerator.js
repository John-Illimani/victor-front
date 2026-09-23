import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaA15toAnoService } from '../../../services/fichas/5año/fichaA15toAnoService';

// PALETA DE COLORES INSTITUCIONALES (5TO AÑO - AZUL INSTITUCIONAL)
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_TITLE = rgb(0 / 255, 114 / 255, 187 / 255);             // Azul (#0072BB)
const COLOR_HEADER_BG = rgb(0 / 255, 114 / 255, 187 / 255);          // Azul (#0072BB)
const COLOR_BORDER = rgb(0 / 255, 114 / 255, 187 / 255);          // Borde Azul (#0072BB)

const BORDER = 0.8;

// FUNCIÓN PARA FORMATEAR NÚMEROS A ENTEROS ESTRICTOS (Ej. 45 o 100)
function formatEnteroEstricto(val) {
  if (val === undefined || val === null || val === '') return '0';
  const num = parseFloat(val);
  if (isNaN(num)) return '0';
  return String(Math.round(num));
}

// FUNCIÓN PARA LIMPIAR EL LITERAL (ELIMINA "CON 00/100" Y DEJA SOLO PALABRAS EN MAYÚSCULA)
function cleanLiteral(literalStr) {
  if (!literalStr) return 'CERO';
  let clean = String(literalStr)
    .toUpperCase()
    .replace(/\s+CON\s+\d+\/\d+/gi, '')
    .replace(/\s+00\/100/gi, '')
    .trim();
  return clean || 'CERO';
}

const plainTokens = (text, font, color) =>
  String(text ?? '').split(/\s+/).filter(Boolean).map((w) => ({ text: w, font, color }));

// FUNCIÓN DE JUSTIFICACIÓN DE PÁRRAFOS CON SANGRÍA OPCIONAL (INDENT)
function drawJustifiedParagraph(page, tokens, { x, y, maxWidth, fontSize, lineHeight, spaceFont, indent = 0 }) {
  const spaceWidth = spaceFont.widthOfTextAtSize(' ', fontSize);

  const lines = [];
  let current = [];
  let currentWidth = 0;

  tokens.forEach((token) => {
    const wordWidth = token.font.widthOfTextAtSize(token.text, fontSize);
    const lineIndent = lines.length === 0 ? 0 : indent;
    const availableWidth = maxWidth - lineIndent;
    const extra = current.length > 0 ? spaceWidth : 0;

    if (currentWidth + extra + wordWidth > availableWidth && current.length > 0) {
      lines.push(current);
      current = [token];
      currentWidth = wordWidth;
    } else {
      current.push(token);
      currentWidth += extra + wordWidth;
    }
  });
  if (current.length) lines.push(current);

  let cursorY = y;
  lines.forEach((line, i) => {
    const isFirstLine = i === 0;
    const isLastLine = i === lines.length - 1;
    const lineX = isFirstLine ? x : x + indent;
    const lineMaxWidth = isFirstLine ? maxWidth : maxWidth - indent;

    const wordsWidth = line.reduce((sum, t) => sum + t.font.widthOfTextAtSize(t.text, fontSize), 0);
    const gaps = line.length - 1;
    const gapWidth = !isLastLine && gaps > 0
      ? (lineMaxWidth - wordsWidth) / gaps
      : spaceWidth;

    let cursorX = lineX;
    line.forEach((token) => {
      const wordW = token.font.widthOfTextAtSize(token.text, fontSize);
      page.drawText(token.text, {
        x: cursorX,
        y: cursorY,
        size: fontSize,
        font: token.font,
        color: token.color || COLOR_TEXT,
      });

      cursorX += wordW + gapWidth;
    });

    cursorY -= lineHeight;
  });

  return cursorY;
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

export const imprimirFichaA1_5toAno = async (estudianteId) => {
  try {
    const response = await fichaA15toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha A-1."
      };
    }

    const d = response.datos;

    const urlPlantilla = encodeURI('/pdf/5año/plantilla.pdf');
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

    let page = pdfDoc.getPages()[0];
    page.setSize(612, 792); // Formato Carta
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

    // 1. DIMENSIONES Y MÁRGENES ESTRICTOS
    const MARGIN_TOP = 141.73;          // 5.0 cm exactos (141.73 pt)
    const MARGIN_LEFT = 85.04;          // 3.0 cm exactos (85.04 pt)
    const MARGIN_RIGHT = 51.31;         // 1.81 cm exactos (51.31 pt)
    const MARGIN_BOTTOM = 141.73;       // 5.0 cm límite inferior
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt exactos
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // TÍTULOS PRINCIPALES (13 pt Bold, Azul Institucional, Centrados)
    const title1 = "FICHA A-1";
    const title2 = "PLANIFICACIÓN Y ELABORACIÓN DE PDC";

    const wT1 = fontBold.widthOfTextAtSize(title1, 13);
    page.drawText(title1, { x: CONTENT_CENTER_X - wT1 / 2, y: cursorY, size: 13, font: fontBold, color: COLOR_TITLE });
    cursorY -= 16;

    const wT2 = fontBold.widthOfTextAtSize(title2, 13);
    page.drawText(title2, { x: CONTENT_CENTER_X - wT2 / 2, y: cursorY, size: 13, font: fontBold, color: COLOR_TITLE });
    cursorY -= 20;

    // INSTRUCCIONES SUPERIORES JUSTIFICADAS CON SANGRÍA EN VIÑETAS
    const instrucciones = [
      { text: "Cada integrante del ECTG elabora y presenta la cantidad de:", isBullet: false },
      { text: "- 6 PDC incluido la clase comunitaria en el nivel inicial y primaria, todos articulados a la propuesta educativa.", isBullet: true },
      { text: "- En el nivel secundario 10 PDC incluido la clase comunitaria de los cuales 5 PDC como mínimo articulados a la propuesta educativa.", isBullet: true },
      { text: "- Los mismos son evaluados a través de la presente ficha.", isBullet: true },
      { text: "- El docente de la UF de Didáctica y PEC II, es el responsable de apoyar en la elaboración de PDCs, así también considerar su evaluación.", isBullet: true }
    ];

    instrucciones.forEach((ins) => {
      const tokens = plainTokens(ins.text, font);
      const indentVal = ins.isBullet ? 12 : 0;

      cursorY = drawJustifiedParagraph(page, tokens, {
        x: MARGIN_LEFT,
        y: cursorY,
        maxWidth: CONTENT_WIDTH,
        fontSize: 9,
        lineHeight: 12,
        spaceFont: font,
        indent: indentVal
      });

      cursorY -= 2;
    });

    cursorY -= 8;

    // 2. TABLA DE EVALUACIÓN
    // Columnas: Criterio (130), Observaciones/Sugerencias (275.65), Valoración (70) = 475.65 pt
    const colW = [130, 275.65, 70];
    let cX = [MARGIN_LEFT];
    for (let i = 0; i < colW.length; i++) {
      cX.push(cX[i] + colW[i]);
    }

    const tableTop = cursorY;
    const tableHeaderH = 34;

    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, tableHeaderH, COLOR_HEADER_BG);
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop - tableHeaderH);

    // Cabeceras de Tabla (12 pt / 8.5 pt Bold en Blanco)
    const h1 = "Criterio";
    const h2Line1 = "Observaciones/Sugerencias de la o el Docente de";
    const h2Line2 = "Especialidad de ESFM/UA";
    const h3Line1 = "VALORACIÓN";
    const h3Line2 = "De 1 a 100";
    const h3Line3 = "PUNTOS";

    page.drawText(h1, { x: cX[0] + (colW[0] / 2) - (fontBold.widthOfTextAtSize(h1, 9.5) / 2), y: tableTop - 20, size: 9.5, font: fontBold, color: COLOR_WHITE });

    page.drawText(h2Line1, { x: cX[1] + (colW[1] / 2) - (fontBold.widthOfTextAtSize(h2Line1, 8.5) / 2), y: tableTop - 13, size: 8.5, font: fontBold, color: COLOR_WHITE });
    page.drawText(h2Line2, { x: cX[1] + (colW[1] / 2) - (fontBold.widthOfTextAtSize(h2Line2, 8.5) / 2), y: tableTop - 24, size: 8.5, font: fontBold, color: COLOR_WHITE });

    page.drawText(h3Line1, { x: cX[2] + (colW[2] / 2) - (fontBold.widthOfTextAtSize(h3Line1, 8) / 2), y: tableTop - 10, size: 8, font: fontBold, color: COLOR_WHITE });
    page.drawText(h3Line2, { x: cX[2] + (colW[2] / 2) - (fontBold.widthOfTextAtSize(h3Line2, 8) / 2), y: tableTop - 19, size: 8, font: fontBold, color: COLOR_WHITE });
    page.drawText(h3Line3, { x: cX[2] + (colW[2] / 2) - (fontBold.widthOfTextAtSize(h3Line3, 8) / 2), y: tableTop - 28, size: 8, font: fontBold, color: COLOR_WHITE });

    for (let c = 0; c < cX.length; c++) {
      vLine(page, cX[c], tableTop, tableTop - tableHeaderH);
    }

    let currentY = tableTop - tableHeaderH;

    const parseNum = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
    const nC1 = parseNum(d.nota_c1);
    const nC2 = parseNum(d.nota_c2);
    const nC3 = parseNum(d.nota_c3);
    const promCalc = Math.round((nC1 + nC2 + nC3) / 3);

    // Función para renderizar filas dinámicas con auto-ajuste de altura
    const drawDynamicRow = (criterioText, obsText, notaVal) => {
      const critLines = wrapText(criterioText, font, 9, colW[0] - 8);
      const obsLines = wrapText(obsText || "", font, 9, colW[1] - 8);

      const maxLines = Math.max(critLines.length, obsLines.length, 1);
      const rH = Math.max(30, maxLines * 11 + 10);
      const nextY = currentY - rH;

      hLine(page, MARGIN_LEFT, RIGHT_X, nextY);

      // Criterio (9 pt)
      let cY = currentY - 13;
      critLines.forEach(l => {
        page.drawText(l, { x: cX[0] + 4, y: cY, size: 9, font, color: COLOR_TEXT });
        cY -= 11;
      });

      // Observaciones (9 pt)
      let oY = currentY - 13;
      obsLines.forEach(l => {
        page.drawText(l, { x: cX[1] + 4, y: oY, size: 9, font, color: COLOR_TEXT });
        oY -= 11;
      });

      // Nota Entera (9 pt Bold)
      const nStr = formatEnteroEstricto(notaVal);
      const wN = fontBold.widthOfTextAtSize(nStr, 9);
      page.drawText(nStr, { x: cX[2] + (colW[2] / 2) - (wN / 2), y: currentY - (rH / 2) - 3, size: 9, font: fontBold, color: COLOR_TEXT });

      for (let c = 0; c < cX.length; c++) {
        vLine(page, cX[c], currentY, nextY);
      }

      currentY = nextY;
    };

    // Filas para los Criterios
    drawDynamicRow("Planteamiento de elementos curriculares (Objetivo, Orientaciones Metodológicas y Criterios de Evaluación).", d.observacion_c1, nC1);
    drawDynamicRow("Articulación de la Propuesta Educativa del ECTG al desarrollo curricular establecido en el Currículo Base del SEP.", d.observacion_c2, nC2);
    drawDynamicRow("Socialización oral de un PDC. Uso adecuado de estrategias metodológicas y recursos educativos.", d.observacion_c3, nC3);

    // FILA PROMEDIO
    const rowPromH = 18;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentY - rowPromH);

    const txtProm = "PROMEDIO:";
    const wTxtProm = fontBold.widthOfTextAtSize(txtProm, 9);
    page.drawText(txtProm, { x: cX[1] + colW[1] - wTxtProm - 10, y: currentY - 12, size: 9, font: fontBold, color: COLOR_TEXT });

    const strProm = formatEnteroEstricto(d.promedio_numeral !== undefined && d.promedio_numeral > 0 ? d.promedio_numeral : promCalc);
    const wProm = fontBold.widthOfTextAtSize(strProm, 9);
    page.drawText(strProm, { x: cX[2] + (colW[2] / 2) - (wProm / 2), y: currentY - 12, size: 9, font: fontBold, color: COLOR_TEXT });

    vLine(page, MARGIN_LEFT, currentY, currentY - rowPromH);
    vLine(page, cX[2], currentY, currentY - rowPromH);
    vLine(page, RIGHT_X, currentY, currentY - rowPromH);

    currentY -= rowPromH;

    // FILA LITERAL ESTRICTO (SIN FRACCIÓN)
    const rowLitH = 18;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentY - rowLitH);

    const literalLimpio = cleanLiteral(d.promedio_literal);
    const promLitText = `LITERAL: ${literalLimpio}`;
    page.drawText(promLitText, { x: MARGIN_LEFT + 6, y: currentY - 12, size: 9, font: fontBold, color: COLOR_TEXT });

    vLine(page, MARGIN_LEFT, currentY, currentY - rowLitH);
    vLine(page, RIGHT_X, currentY, currentY - rowLitH);

    currentY -= rowLitH;

    // FILA OBSERVACIONES GENERALES
    const obsGenLines = wrapText(`OBSERVACIONES: ${d.observaciones_generales || ""}`, font, 9, CONTENT_WIDTH - 12);
    const rowObsH = Math.max(30, obsGenLines.length * 11 + 10);
    hLine(page, MARGIN_LEFT, RIGHT_X, currentY - rowObsH);

    let obsY = currentY - 12;
    obsGenLines.forEach(l => {
      page.drawText(l, { x: MARGIN_LEFT + 6, y: obsY, size: 9, font, color: COLOR_TEXT });
      obsY -= 11;
    });

    vLine(page, MARGIN_LEFT, currentY, currentY - rowObsH);
    vLine(page, RIGHT_X, currentY, currentY - rowObsH);

    currentY -= rowObsH;

    cursorY = currentY - 20;

    // 3. LUGAR Y FECHA CENTRADO DINÁMICAMENTE CON LÍNEA PUNTEADA EXACTA
    const ciudad = d.lugar_ciudad || "El Alto";
    const dia = d.dia || "21";
    const mes = d.mes || "septiembre";
    const ano = String(d.ano || "2026").slice(0, 4);

    const txtLugarLabel = "Lugar y fecha: ";
    const txtLugarValor = `${ciudad}, ${dia} de ${mes} de ${ano}`;

    const wLabelLF = font.widthOfTextAtSize(txtLugarLabel, 9);
    const wValLF = fontBold.widthOfTextAtSize(txtLugarValor, 9);
    const totalLFWidth = wLabelLF + wValLF;
    const startX_LF = CONTENT_CENTER_X - (totalLFWidth / 2);

    page.drawText(txtLugarLabel, { x: startX_LF, y: cursorY, size: 9, font, color: COLOR_TEXT });
    page.drawText(txtLugarValor, { x: startX_LF + wLabelLF, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    drawDottedLine(page, startX_LF + wLabelLF, startX_LF + totalLFWidth, cursorY - 2);

    cursorY -= 45;

    if (cursorY < MARGIN_BOTTOM) {
      page = pdfDoc.addPage([612, 792]);
      cursorY = pageHeight - MARGIN_TOP - 20;
    }

    // 4. FIRMAS INFERIORES
    const sigColWidth = CONTENT_WIDTH / 2;
    const sigLineW = 160;

    const firmas = [
      { label: "Estudiante", xCenter: MARGIN_LEFT + sigColWidth * 0.5 },
      { label: "Docente de Didáctica y PEC II ESFM/UA", xCenter: MARGIN_LEFT + sigColWidth * 1.5 }
    ];

    firmas.forEach((f) => {
      const lineStartX = f.xCenter - sigLineW / 2;
      const lineEndX = f.xCenter + sigLineW / 2;

      drawDottedLine(page, lineStartX, lineEndX, cursorY);

      const wL = fontBold.widthOfTextAtSize(f.label, 9);
      page.drawText(f.label, {
        x: f.xCenter - wL / 2,
        y: cursorY - 11,
        size: 9,
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
    console.error("Error al generar PDF de la Ficha A-1 (5to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};