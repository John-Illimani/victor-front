import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaB35toAnoService } from '../../../services/fichas/5año/fichaB35toAnoService';

// PALETA DE COLORES INSTITUCIONALES (AZUL INSTITUCIONAL)
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_TITLE = rgb(0 / 255, 114 / 255, 187 / 255);             // Azul (#0072BB)
const COLOR_HEADER_BG = rgb(0 / 255, 114 / 255, 187 / 255);          // Azul (#0072BB)
const COLOR_BORDER = rgb(0 / 255, 114 / 255, 187 / 255);          // Borde Azul (#0072BB)

const BORDER = 0.8;

// FUNCIÓN PARA FORMATEAR NÚMEROS A ENTEROS ESTRICTOS
function formatEnteroEstricto(val) {
  if (val === undefined || val === null || val === '') return '0';
  const num = parseFloat(val);
  if (isNaN(num)) return '0';
  return String(Math.round(num));
}

// FUNCIÓN PARA LIMPIAR EL LITERAL (ELIMINA "CON 00/100")
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

export const imprimirFichaB3_5toAno = async (estudianteId) => {
  try {
    const response = await fichaB35toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha B-3."
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

    // DIMENSIONES Y MÁRGENES ESTRICTOS
    const MARGIN_TOP = 141.73;          // 5.0 cm exactos (141.73 pt)
    const MARGIN_LEFT = 85.04;          // 3.0 cm exactos (85.04 pt)
    const MARGIN_RIGHT = 51.31;         // 1.81 cm exactos (51.31 pt)
    const MARGIN_BOTTOM = 141.73;       // 5.0 cm límite inferior
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt exactos
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // 1. TÍTULOS PRINCIPALES (13 pt Bold, Centrados)
    const title1 = "FICHA B-3";
    const title2 = "VALORACIÓN DE LA CLASE COMUNITARIA";

    const wT1 = fontBold.widthOfTextAtSize(title1, 13);
    page.drawText(title1, { x: CONTENT_CENTER_X - wT1 / 2, y: cursorY, size: 13, font: fontBold, color: COLOR_TITLE });
    cursorY -= 16;

    const wT2 = fontBold.widthOfTextAtSize(title2, 13);
    page.drawText(title2, { x: CONTENT_CENTER_X - wT2 / 2, y: cursorY, size: 13, font: fontBold, color: COLOR_TITLE });
    cursorY -= 20;

    // INSTRUCCIONES SUPERIORES JUSTIFICADAS
    const instrucciones = [
      { text: "- La/el estudiante practicante desarrolla 1 clase comunitaria donde comparte la implementación de su Propuesta Educativa articulado al desarrollo curricular.", isBullet: true },
      { text: "- Participa al menos un miembro de la comunidad educativa (director/a, maestra/o de la UE/CEA/CEE, padres de familia, consejo educativo, gobierno estudiantil, autoridad o docente ESFM/UA)", isBullet: true }
    ];

    instrucciones.forEach((ins) => {
      const tokens = plainTokens(ins.text, font);
      cursorY = drawJustifiedParagraph(page, tokens, {
        x: MARGIN_LEFT,
        y: cursorY,
        maxWidth: CONTENT_WIDTH,
        fontSize: 8.5,
        lineHeight: 11.5,
        spaceFont: font,
        indent: 10
      });
      cursorY -= 3;
    });

    cursorY -= 10;

    // 2. ESTRUCTURA DE LA TABLA
    // Columnas: Criterio (255.65), Valoración (110), Promedio (110) = 475.65 pt
    const colW = [255.65, 110, 110];
    let cX = [MARGIN_LEFT];
    for (let i = 0; i < colW.length; i++) cX.push(cX[i] + colW[i]);

    const tableTop = cursorY;
    const tableHeaderH = 26;

    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, tableHeaderH, COLOR_HEADER_BG);
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop - tableHeaderH);

    // Cabeceras
    const h1 = "CRITERIO";
    const h2Line1 = "VALORACIÓN SOBRE 100";
    const h2Line2 = "PUNTOS";
    const h3 = "PROMEDIO";

    page.drawText(h1, { x: cX[0] + (colW[0] / 2) - (fontBold.widthOfTextAtSize(h1, 8.5) / 2), y: tableTop - 16, size: 8.5, font: fontBold, color: COLOR_WHITE });

    page.drawText(h2Line1, { x: cX[1] + (colW[1] / 2) - (fontBold.widthOfTextAtSize(h2Line1, 7.5) / 2), y: tableTop - 10, size: 7.5, font: fontBold, color: COLOR_WHITE });
    page.drawText(h2Line2, { x: cX[1] + (colW[1] / 2) - (fontBold.widthOfTextAtSize(h2Line2, 7.5) / 2), y: tableTop - 20, size: 7.5, font: fontBold, color: COLOR_WHITE });

    page.drawText(h3, { x: cX[2] + (colW[2] / 2) - (fontBold.widthOfTextAtSize(h3, 8.5) / 2), y: tableTop - 16, size: 8.5, font: fontBold, color: COLOR_WHITE });

    for (let c = 0; c < cX.length; c++) vLine(page, cX[c], tableTop, tableTop - tableHeaderH);

    let currentY = tableTop - tableHeaderH;

    const parseNum = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
    const nC1 = parseNum(d.nota_c1);
    const nC2 = parseNum(d.nota_c2);
    const nC3 = parseNum(d.nota_c3);
    const promCalc = Math.round((nC1 + nC2 + nC3) / 3);

    // Sub-criterios
    const crit1 = "ELEMENTOS CURRICULARES: Planteamiento y relación del Objetivo con las Orientaciones Metodológicas y los Criterios de Evaluación.";
    const crit2 = "PROPUESTA EDUCATIVA: Orientación metodológica del desarrollo y fortalecimiento de capacidades específicas, coherentes con el área de Saberes y conocimientos del año de escolaridad acompañados de materiales específicos y de apoyo para la implementación de la propuesta.";
    const crit3 = "CONCRECIÓN CURRICULAR:\nDemuestra dominio de la especialidad desarrollando actividades con estrategias didácticas, participativas.\nPromueve el aprendizaje centrado en el estudiante como protagonista activo.\nDemuestra manejo de aula, uso del espacio, recursos.\nRealiza la evaluación del objetivo planificado en el PDC.";

    // Fila Sub-criterio 1
    const c1Lines = wrapText(crit1, font, 8, colW[0] - 8);
    const r1H = Math.max(30, c1Lines.length * 10 + 6);
    hLine(page, cX[0], cX[2], currentY - r1H);

    let yC1 = currentY - 11;
    c1Lines.forEach(l => { page.drawText(l, { x: cX[0] + 4, y: yC1, size: 8, font, color: COLOR_TEXT }); yC1 -= 10; });

    const strN1 = formatEnteroEstricto(nC1);
    page.drawText(strN1, { x: cX[1] + (colW[1] / 2) - (fontBold.widthOfTextAtSize(strN1, 8.5) / 2), y: currentY - (r1H / 2) - 3, size: 8.5, font: fontBold, color: COLOR_TEXT });

    vLine(page, cX[1], currentY, currentY - r1H);
    vLine(page, cX[2], currentY, currentY - r1H);
    currentY -= r1H;

    // Fila Sub-criterio 2
    const c2Lines = wrapText(crit2, font, 8, colW[0] - 8);
    const r2H = Math.max(40, c2Lines.length * 10 + 6);
    hLine(page, cX[0], cX[2], currentY - r2H);

    let yC2 = currentY - 11;
    c2Lines.forEach(l => { page.drawText(l, { x: cX[0] + 4, y: yC2, size: 8, font, color: COLOR_TEXT }); yC2 -= 10; });

    const strN2 = formatEnteroEstricto(nC2);
    page.drawText(strN2, { x: cX[1] + (colW[1] / 2) - (fontBold.widthOfTextAtSize(strN2, 8.5) / 2), y: currentY - (r2H / 2) - 3, size: 8.5, font: fontBold, color: COLOR_TEXT });

    vLine(page, cX[1], currentY, currentY - r2H);
    vLine(page, cX[2], currentY, currentY - r2H);
    currentY -= r2H;

    // Fila Sub-criterio 3
    const c3Lines = crit3.split('\n').flatMap(line => wrapText(line, font, 8, colW[0] - 8));
    const r3H = Math.max(65, c3Lines.length * 9.5 + 6);
    hLine(page, cX[0], cX[2], currentY - r3H);

    let yC3 = currentY - 11;
    c3Lines.forEach(l => { page.drawText(l, { x: cX[0] + 4, y: yC3, size: 8, font, color: COLOR_TEXT }); yC3 -= 9.5; });

    const strN3 = formatEnteroEstricto(nC3);
    page.drawText(strN3, { x: cX[1] + (colW[1] / 2) - (fontBold.widthOfTextAtSize(strN3, 8.5) / 2), y: currentY - (r3H / 2) - 3, size: 8.5, font: fontBold, color: COLOR_TEXT });

    vLine(page, cX[1], currentY, currentY - r3H);
    vLine(page, cX[2], currentY, currentY - r3H);
    currentY -= r3H;
    hLine(page, cX[2], RIGHT_X, currentY);

    // PROMEDIO UNIFICADO EN LA TERCERA COLUMNA
    const totalBodyH = r1H + r2H + r3H;
    const strProm = formatEnteroEstricto(d.promedio_numeral !== undefined && d.promedio_numeral > 0 ? d.promedio_numeral : promCalc);
    const wProm = fontBold.widthOfTextAtSize(strProm, 10);
    page.drawText(strProm, {
      x: cX[2] + (colW[2] / 2) - (wProm / 2),
      y: (tableTop - tableHeaderH) - (totalBodyH / 2) - 4,
      size: 10,
      font: fontBold,
      color: COLOR_TEXT
    });

    // FILA LITERAL
   const rowLitH = 20;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentY - rowLitH);

    const litClean = cleanLiteral(d.promedio_literal);
    
    // 1. Dibuja "LITERAL:" alineado a la derecha en la primera columna (Criterio)
    const txtLabel = "LITERAL:";
    const wLitLabel = fontBold.widthOfTextAtSize(txtLabel, 8.5);
    page.drawText(txtLabel, { 
      x: cX[1] - wLitLabel - 6, 
      y: currentY - 14, 
      size: 8.5, 
      font: fontBold, 
      color: COLOR_TEXT 
    });

    // 2. Dibuja el valor del literal centrado en la siguiente columna (Valoración)
    const wLitVal = fontBold.widthOfTextAtSize(litClean, 8.5);
    page.drawText(litClean, { 
      x: cX[1] + (colW[1] / 2) - (wLitVal / 2), 
      y: currentY - 14, 
      size: 8.5, 
      font: fontBold, 
      color: COLOR_TEXT 
    });

    vLine(page, MARGIN_LEFT, currentY, currentY - rowLitH);
    vLine(page, cX[1], currentY, currentY - rowLitH);
    

    currentY -= rowLitH;
    

    // FILA LOGROS Y DIFICULTADES DE LA CLASE COMUNITARIA
    const logrosText = `LOGROS Y DIFICULTADES DE LA CLASE COMUNITARIA:\n${d.logros_dificultades || ""}`;
    const logrosLines = logrosText.split('\n').flatMap(line => wrapText(line, font, 8.5, CONTENT_WIDTH - 12));
    const rowLogrosH = Math.max(60, logrosLines.length * 11 + 12);

    hLine(page, MARGIN_LEFT, RIGHT_X, currentY - rowLogrosH);

    let yLog = currentY - 14;
    logrosLines.forEach((l, idx) => {
      const isHeader = idx === 0 && l.startsWith("LOGROS Y DIFICULTADES");
      page.drawText(l, { x: MARGIN_LEFT + 6, y: yLog, size: 8.5, font: isHeader ? fontBold : font, color: COLOR_TEXT });
      yLog -= 11;
    });

    vLine(page, MARGIN_LEFT, tableTop, currentY - rowLogrosH);
    vLine(page, RIGHT_X, tableTop, currentY - rowLogrosH);

    cursorY = currentY - rowLogrosH - 25;

    // 3. LUGAR Y FECHA CENTRADO DINÁMICAMENTE
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

    // 4. FIRMAS INFERIORES (3 FIRMAS)
    const sigColWidth = CONTENT_WIDTH / 3;
    const sigLineW = 130;

    const firmas = [
      { label: "Estudiante", xCenter: MARGIN_LEFT + sigColWidth * 0.5 },
      { label: "Observador(a) (UE/CEA/CEE/ESFM)", xCenter: MARGIN_LEFT + sigColWidth * 1.5 },
      { label: "Docente Guía UE/ CEA/ CEE", xCenter: MARGIN_LEFT + sigColWidth * 2.5 }
    ];

    firmas.forEach((f) => {
      const lineStartX = f.xCenter - sigLineW / 2;
      const lineEndX = f.xCenter + sigLineW / 2;

      page.drawLine({
        start: { x: lineStartX, y: cursorY },
        end: { x: lineEndX, y: cursorY },
        thickness: 0.8,
        color: COLOR_BORDER,
      });

      const wL = fontBold.widthOfTextAtSize(f.label, 8);
      page.drawText(f.label, {
        x: f.xCenter - wL / 2,
        y: cursorY - 11,
        size: 8,
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
    console.error("Error al generar PDF de la Ficha B-3 (5to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};