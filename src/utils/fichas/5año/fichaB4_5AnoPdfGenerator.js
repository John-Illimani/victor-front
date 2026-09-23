import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaB45toAnoService } from '../../../services/fichas/5año/fichaB45toAnoService';

// PALETA DE COLORES INSTITUCIONALES (AZUL INSTITUCIONAL)
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_TITLE = rgb(0 / 255, 114 / 255, 187 / 255);             // Azul (#0072BB)
const COLOR_HEADER_BG = rgb(0 / 255, 114 / 255, 187 / 255);          // Azul (#0072BB)
const COLOR_BORDER = rgb(0 / 255, 114 / 255, 187 / 255);          // Borde Azul (#0072BB)

const BORDER = 0.8;

// FUNCIÓN PARA FORMATEAR NÚMEROS A ENTEROS ESTRICTOS
function formatEnteroEstricto(val) {
  if (val === undefined || val === null || val === '') return '';
  const num = parseFloat(val);
  if (isNaN(num)) return '';
  return String(Math.round(num));
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

export const imprimirFichaB4_5toAno = async (estudianteId) => {
  try {
    const response = await fichaB45toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha B-4."
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

    // 1. TÍTULOS PRINCIPALES
    const title1 = "FICHA B-4";
    const title2 = "CENTRALIZADOR DE DESARROLLO DE PDC";

    const wT1 = fontBold.widthOfTextAtSize(title1, 13);
    page.drawText(title1, { x: CONTENT_CENTER_X - wT1 / 2, y: cursorY, size: 13, font: fontBold, color: COLOR_TITLE });
    cursorY -= 16;

    const wT2 = fontBold.widthOfTextAtSize(title2, 13);
    page.drawText(title2, { x: CONTENT_CENTER_X - wT2 / 2, y: cursorY, size: 13, font: fontBold, color: COLOR_TITLE });
    cursorY -= 20;

    // INSTRUCCIÓN SUPERIOR JUSTIFICADA
    const instr = "La/el docente acompañante centraliza y promedia las calificaciones obtenidas por la/el estudiante practicante en el desarrollo de los PDC. El promedio debe realizarse de acuerdo a la cantidad total de PDC ejecutados.";
    const tokensInstr = plainTokens(instr, font);
    cursorY = drawJustifiedParagraph(page, tokensInstr, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 8.5,
      lineHeight: 11.5,
      spaceFont: font
    });

    cursorY -= 15;

    // 2. TABLA CENTRALIZADORA
    // Columnas: PDC (275.65 pt), PUNTAJE (200 pt) = 475.65 pt
    const colW = [275.65, 200];
    let cX = [MARGIN_LEFT];
    for (let i = 0; i < colW.length; i++) cX.push(cX[i] + colW[i]);

    const tableTop = cursorY;
    const headerH = 22;

    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, headerH, COLOR_HEADER_BG);
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop - headerH);

    // Cabeceras
    const txtPdcHeader = "PDC";
    const txtPuntHeader = "PUNTAJE";

    page.drawText(txtPdcHeader, { x: cX[0] + (colW[0] / 2) - (fontBold.widthOfTextAtSize(txtPdcHeader, 8.5) / 2), y: tableTop - 14, size: 8.5, font: fontBold, color: COLOR_WHITE });
    page.drawText(txtPuntHeader, { x: cX[1] + (colW[1] / 2) - (fontBold.widthOfTextAtSize(txtPuntHeader, 8.5) / 2), y: tableTop - 14, size: 8.5, font: fontBold, color: COLOR_WHITE });

    vLine(page, cX[0], tableTop, tableTop - headerH);
    vLine(page, cX[1], tableTop, tableTop - headerH);
    vLine(page, RIGHT_X, tableTop, tableTop - headerH);

    let currentY = tableTop - headerH;

    // PDCs 1 al 9 + Clase Comunitaria
    const parseNum = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
    const items = [
      { label: "PDC 1", val: parseNum(d.pdc_1) },
      { label: "PDC 2", val: parseNum(d.pdc_2) },
      { label: "PDC 3", val: parseNum(d.pdc_3) },
      { label: "PDC 4", val: parseNum(d.pdc_4) },
      { label: "PDC 5", val: parseNum(d.pdc_5) },
      { label: "PDC 6", val: parseNum(d.pdc_6) },
      { label: "PDC 7", val: parseNum(d.pdc_7) },
      { label: "PDC 8", val: parseNum(d.pdc_8) },
      { label: "PDC 9", val: parseNum(d.pdc_9) },
      { label: "Desarrollo de Clase Comunitaria", val: parseNum(d.clase_comunitaria) }
    ];

    // Cálculo dinámico de promedio
    const notasValidas = items.map(i => i.val).filter(v => v > 0);
    const sumaTotal = notasValidas.reduce((a, b) => a + b, 0);
    const promCalculado = notasValidas.length > 0 ? Math.round(sumaTotal / notasValidas.length) : 0;
    const promFinal = d.promedio_numeral && parseNum(d.promedio_numeral) > 0 ? parseNum(d.promedio_numeral) : promCalculado;

    const rowH = 18;

    items.forEach((item) => {
      hLine(page, MARGIN_LEFT, RIGHT_X, currentY - rowH);

      page.drawText(item.label, { x: cX[0] + 10, y: currentY - 12, size: 8.5, font: fontBold, color: COLOR_TEXT });

      const strVal = formatEnteroEstricto(item.val);
      if (strVal) {
        const wVal = fontBold.widthOfTextAtSize(strVal, 8.5);
        page.drawText(strVal, { x: cX[1] + (colW[1] / 2) - (wVal / 2), y: currentY - 12, size: 8.5, font: fontBold, color: COLOR_TEXT });
      }

      vLine(page, MARGIN_LEFT, currentY, currentY - rowH);
      vLine(page, cX[1], currentY, currentY - rowH);
      vLine(page, RIGHT_X, currentY, currentY - rowH);

      currentY -= rowH;
    });

    // FILA PROMEDIO
    const rowPromH = 20;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentY - rowPromH);

    const txtPromLabel = "PROMEDIO";
    const wPromLbl = fontBold.widthOfTextAtSize(txtPromLabel, 9);
    page.drawText(txtPromLabel, { x: cX[0] + colW[0] - wPromLbl - 15, y: currentY - 13, size: 9, font: fontBold, color: COLOR_TEXT });

    const strPromFinal = formatEnteroEstricto(promFinal);
    const wPF = fontBold.widthOfTextAtSize(strPromFinal, 9.5);
    page.drawText(strPromFinal, { x: cX[1] + (colW[1] / 2) - (wPF / 2), y: currentY - 13, size: 9.5, font: fontBold, color: COLOR_TEXT });

    vLine(page, MARGIN_LEFT, currentY, currentY - rowPromH);
    vLine(page, cX[1], currentY, currentY - rowPromH);
    vLine(page, RIGHT_X, currentY, currentY - rowPromH);

    currentY -= rowPromH;

    cursorY = currentY - 30;

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

    // 4. FIRMAS INFERIORES
    const sigColWidth = CONTENT_WIDTH / 2;
    const sigLineW = 160;

    const firmas = [
      { label: "Estudiante", xCenter: MARGIN_LEFT + sigColWidth * 0.5 },
      { label: "Docente Tutor/a Acompañante", xCenter: MARGIN_LEFT + sigColWidth * 1.5 }
    ];

    firmas.forEach((f) => {
      const lineStartX = f.xCenter - sigLineW / 2;
      const lineEndX = f.xCenter + sigLineW / 2;

      drawDottedLine(page, lineStartX, lineEndX, cursorY);

      const wL = fontBold.widthOfTextAtSize(f.label, 8.5);
      page.drawText(f.label, {
        x: f.xCenter - wL / 2,
        y: cursorY - 11,
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
    console.error("Error al generar PDF de la Ficha B-4 (5to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};