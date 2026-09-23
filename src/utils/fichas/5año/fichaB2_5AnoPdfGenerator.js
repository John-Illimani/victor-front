import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaB25toAnoService } from '../../../services/fichas/5año/fichaB25toAnoService';

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

export const imprimirFichaB2_5toAno = async (estudianteId) => {
  try {
    const response = await fichaB25toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha B-2."
      };
    }

    const d = response.datos;
    const pdcData = typeof d.pdc_data === 'string' 
      ? JSON.parse(d.pdc_data) 
      : (d.pdc_data || {});

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

    // DIMENSIONES Y MÁRGENES ESTRICTOS SOLICITADOS
    const MARGIN_TOP = 141.73;          // 5.0 cm exactos (141.73 pt)
    const MARGIN_LEFT = 85.04;          // 3.0 cm exactos (85.04 pt)
    const MARGIN_RIGHT = 51.31;         // 1.81 cm exactos (51.31 pt)
    const MARGIN_BOTTOM = 141.73;       // 5.0 cm límite inferior
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt exactos
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    // HELPER PARA NUEVA PÁGINA
    const createNewPage = async () => {
      let newPage;
      try {
        const resFetch = await fetch(urlPlantilla);
        if (resFetch.ok) {
          const pdfBytes = await resFetch.arrayBuffer();
          const tempDoc = await PDFDocument.load(pdfBytes);
          const [copiedPage] = await pdfDoc.copyPages(tempDoc, [0]);
          newPage = pdfDoc.addPage(copiedPage);
        } else {
          newPage = pdfDoc.addPage([612, 792]);
        }
      } catch (e) {
        newPage = pdfDoc.addPage([612, 792]);
      }
      newPage.setSize(612, 792);
      return newPage;
    };

    let page = pdfDoc.getPages()[0];
    page.setSize(612, 792);
    let cursorY = pageHeight - MARGIN_TOP;

    // 1. TÍTULO E INSTRUCCIONES (Página 1)
    const title1 = "FICHA B-2";
    const title2 = "CONCRECIÓN CURRICULAR - APLICACIÓN DEL PDC";

    const wT1 = fontBold.widthOfTextAtSize(title1, 13);
    page.drawText(title1, { x: CONTENT_CENTER_X - wT1 / 2, y: cursorY, size: 13, font: fontBold, color: COLOR_TITLE });
    cursorY -= 15;

    const wT2 = fontBold.widthOfTextAtSize(title2, 11.5);
    page.drawText(title2, { x: CONTENT_CENTER_X - wT2 / 2, y: cursorY, size: 11.5, font: fontBold, color: COLOR_TITLE });
    cursorY -= 18;

    const instrucciones = [
      { text: "- La/el estudiante practicante desarrolla los PDCs en el paralelo asignado en la UE/CEA/CEE.", isBullet: true },
      { text: "- La/el Docente Guía de UE/CEA/CEE evalúa el desarrollo del PDC.", isBullet: true },
      { text: "- En caso de que el desarrollo del PDC no contemple de forma explícita la implementación de alguno de los criterios de la propuesta educativa, el acápite no debe ser evaluado. El promedio final debe considerar únicamente los aspectos evaluados.", isBullet: true }
    ];

    instrucciones.forEach((ins) => {
      const tokens = plainTokens(ins.text, font);
      cursorY = drawJustifiedParagraph(page, tokens, {
        x: MARGIN_LEFT,
        y: cursorY,
        maxWidth: CONTENT_WIDTH,
        fontSize: 8.5,
        lineHeight: 11,
        spaceFont: font,
        indent: 10
      });
      cursorY -= 2;
    });

    cursorY -= 10;

    // RENDERIZADO DE UN BLOQUE TARJETA PDC
    const drawPdcCard = (targetPage, yTop, numPdc, pdcObj = {}) => {
      // Columnas: Nro (28), Criterios (317.65), Valoración (65), Promedio (65) = 475.65 pt
      const colW = [28, 317.65, 65, 65];
      let cX = [MARGIN_LEFT];
      for (let i = 0; i < colW.length; i++) cX.push(cX[i] + colW[i]);

      const headerH = 22;
      fillRect(targetPage, MARGIN_LEFT, yTop, CONTENT_WIDTH, headerH, COLOR_HEADER_BG);
      hLine(targetPage, MARGIN_LEFT, RIGHT_X, yTop);
      hLine(targetPage, MARGIN_LEFT, RIGHT_X, yTop - headerH);

      // Texto Cabecera
      targetPage.drawText("NRO.", { x: cX[0] + 3, y: yTop - 14, size: 7.5, font: fontBold, color: COLOR_WHITE });
      const txtCrit = "CRITERIOS DE EVALUACIÓN";
      targetPage.drawText(txtCrit, { x: cX[1] + (colW[1] / 2) - (fontBold.widthOfTextAtSize(txtCrit, 8) / 2), y: yTop - 14, size: 8, font: fontBold, color: COLOR_WHITE });

      const txtVal1 = "VALORACIÓN";
      const txtVal2 = "SOBRE 100";
      const txtVal3 = "PUNTOS";
      targetPage.drawText(txtVal1, { x: cX[2] + (colW[2] / 2) - (fontBold.widthOfTextAtSize(txtVal1, 6.5) / 2), y: yTop - 8, size: 6.5, font: fontBold, color: COLOR_WHITE });
      targetPage.drawText(txtVal2, { x: cX[2] + (colW[2] / 2) - (fontBold.widthOfTextAtSize(txtVal2, 6.5) / 2), y: yTop - 14, size: 6.5, font: fontBold, color: COLOR_WHITE });
      targetPage.drawText(txtVal3, { x: cX[2] + (colW[2] / 2) - (fontBold.widthOfTextAtSize(txtVal3, 6.5) / 2), y: yTop - 20, size: 6.5, font: fontBold, color: COLOR_WHITE });

      const txtProm1 = "PROMEDIO";
      const txtProm2 = "POR PDC";
      targetPage.drawText(txtProm1, { x: cX[3] + (colW[3] / 2) - (fontBold.widthOfTextAtSize(txtProm1, 7) / 2), y: yTop - 10, size: 7, font: fontBold, color: COLOR_WHITE });
      targetPage.drawText(txtProm2, { x: cX[3] + (colW[3] / 2) - (fontBold.widthOfTextAtSize(txtProm2, 7) / 2), y: yTop - 18, size: 7, font: fontBold, color: COLOR_WHITE });

      for (let c = 0; c < cX.length; c++) vLine(targetPage, cX[c], yTop, yTop - headerH);

      let cardY = yTop - headerH;

      // Sub-criterios 1, 2 y 3
      const crit1 = "ELEMENTOS CURRICULARES: Planteamiento y relación del Objetivo con las Orientaciones Metodológicas y los Criterios de Evaluación.";
      const crit2 = "PROPUESTA EDUCATIVA: Orientación metodológica del desarrollo y fortalecimiento de capacidades específicas, coherentes con el área de Saberes y conocimientos del año de escolaridad acompañados de materiales específicos y de apoyo para la implementación de la propuesta.";
      const crit3 = "CONCRECIÓN CURRICULAR:\nDemuestra dominio de la especialidad desarrollando actividades con estrategias didácticas, participativas.\nPromueve el aprendizaje centrado en el estudiante como protagonista activo.\nDemuestra manejo de aula, uso del espacio, recursos.\nRealiza la evaluación del objetivo planificado en el PDC.";

      // Ponderaciones de los tres acápites
      const n1 = pdcObj.elementos_curriculares !== undefined ? pdcObj.elementos_curriculares : pdcObj.nota_elementos;
      const n2 = pdcObj.propuesta_educativa !== undefined ? pdcObj.propuesta_educativa : pdcObj.nota_propuesta;
      const n3 = pdcObj.concrecion_curricular !== undefined ? pdcObj.concrecion_curricular : pdcObj.nota_concrecion;
      const promPdc = pdcObj.promedio_pdc !== undefined ? pdcObj.promedio_pdc : pdcObj.promedio;

      // Fila Sub-criterio 1
      const c1Lines = wrapText(crit1, font, 7.5, colW[1] - 8);
      const r1H = Math.max(26, c1Lines.length * 9.5 + 6);
      hLine(targetPage, cX[1], cX[3], cardY - r1H);

      let yC1 = cardY - 10;
      c1Lines.forEach(l => { targetPage.drawText(l, { x: cX[1] + 4, y: yC1, size: 7.5, font, color: COLOR_TEXT }); yC1 -= 9; });
      
      const strN1 = formatEnteroEstricto(n1);
      targetPage.drawText(strN1, { x: cX[2] + (colW[2] / 2) - (fontBold.widthOfTextAtSize(strN1, 8) / 2), y: cardY - (r1H / 2) - 3, size: 8, font: fontBold, color: COLOR_TEXT });

      vLine(targetPage, cX[2], cardY, cardY - r1H);
      vLine(targetPage, cX[3], cardY, cardY - r1H);
      cardY -= r1H;

      // Fila Sub-criterio 2
      const c2Lines = wrapText(crit2, font, 7.5, colW[1] - 8);
      const r2H = Math.max(32, c2Lines.length * 9.5 + 6);
      hLine(targetPage, cX[1], cX[3], cardY - r2H);

      let yC2 = cardY - 10;
      c2Lines.forEach(l => { targetPage.drawText(l, { x: cX[1] + 4, y: yC2, size: 7.5, font, color: COLOR_TEXT }); yC2 -= 9; });

      const strN2 = formatEnteroEstricto(n2);
      targetPage.drawText(strN2, { x: cX[2] + (colW[2] / 2) - (fontBold.widthOfTextAtSize(strN2, 8) / 2), y: cardY - (r2H / 2) - 3, size: 8, font: fontBold, color: COLOR_TEXT });

      vLine(targetPage, cX[2], cardY, cardY - r2H);
      vLine(targetPage, cX[3], cardY, cardY - r2H);
      cardY -= r2H;

      // Fila Sub-criterio 3
      const c3Lines = crit3.split('\n').flatMap(line => wrapText(line, font, 7.5, colW[1] - 8));
      const r3H = Math.max(50, c3Lines.length * 9 + 6);
      hLine(targetPage, cX[1], cX[3], cardY - r3H);

      let yC3 = cardY - 10;
      c3Lines.forEach(l => { targetPage.drawText(l, { x: cX[1] + 4, y: yC3, size: 7.5, font, color: COLOR_TEXT }); yC3 -= 9; });

      const strN3 = formatEnteroEstricto(n3);
      targetPage.drawText(strN3, { x: cX[2] + (colW[2] / 2) - (fontBold.widthOfTextAtSize(strN3, 8) / 2), y: cardY - (r3H / 2) - 3, size: 8, font: fontBold, color: COLOR_TEXT });

      vLine(targetPage, cX[2], cardY, cardY - r3H);
      vLine(targetPage, cX[3], cardY, cardY - r3H);
      cardY -= r3H;

      // Fila Observaciones / Tiempo (CÁLCULO EXACTO DE ESPACIADOS Y BORDES)
      const tiempoStr = String(pdcObj.tiempo_implementacion ?? pdcObj.tiempo ?? "");
      const obsStr = String(pdcObj.observaciones ?? pdcObj.sugerencias ?? "");

      const rInfoH = 26;
      hLine(targetPage, cX[1], RIGHT_X, cardY - rInfoH);

      // Tiempo de implementación
      const lblTiempo = "Tiempo de implementación del PDC: ";
      const wLblTiempo = fontBold.widthOfTextAtSize(lblTiempo, 7.5);
      targetPage.drawText(lblTiempo, { x: cX[1] + 4, y: cardY - 10, size: 7.5, font: fontBold, color: COLOR_TEXT });
      
      const startX_TiempoVal = cX[1] + 4 + wLblTiempo;
      targetPage.drawText(tiempoStr, { x: startX_TiempoVal, y: cardY - 10, size: 7.5, font, color: COLOR_TEXT });
      drawDottedLine(targetPage, startX_TiempoVal, cX[1] + colW[1] - 6, cardY - 11);

      // Observaciones / sugerencias
      const lblObs = "Observaciones y/o sugerencias: ";
      const wLblObs = fontBold.widthOfTextAtSize(lblObs, 7.5);
      targetPage.drawText(lblObs, { x: cX[1] + 4, y: cardY - 21, size: 7.5, font: fontBold, color: COLOR_TEXT });

      const startX_ObsVal = cX[1] + 4 + wLblObs;
      targetPage.drawText(obsStr, { x: startX_ObsVal, y: cardY - 21, size: 7.5, font, color: COLOR_TEXT });
      drawDottedLine(targetPage, startX_ObsVal, cX[1] + colW[1] - 6, cardY - 22);

      const subTotalBodyH = r1H + r2H + r3H + rInfoH;
      const totalBlockH = subTotalBodyH + headerH;

      // Columna 1: PDC X (Texto Rotado a 90 grados)
      const pdcTxt = `PDC ${numPdc}`;
      const pdcTxtW = fontBold.widthOfTextAtSize(pdcTxt, 9);
      const vertCenterX = MARGIN_LEFT + (colW[0] / 2) + 3;
      const vertCenterY = (yTop - headerH) - (subTotalBodyH / 2) - (pdcTxtW / 2);

      targetPage.drawText(pdcTxt, {
        x: vertCenterX,
        y: vertCenterY,
        size: 9,
        font: fontBold,
        color: COLOR_TEXT,
        rotate: { type: 'degrees', angle: 90 }
      });

      // Columna 4: Promedio por PDC Unificado
      const strPromPdc = formatEnteroEstricto(promPdc);
      const wPP = fontBold.widthOfTextAtSize(strPromPdc, 9);
      targetPage.drawText(strPromPdc, {
        x: cX[3] + (colW[3] / 2) - (wPP / 2),
        y: (yTop - headerH) - (subTotalBodyH / 2) - 4,
        size: 9,
        font: fontBold,
        color: COLOR_TEXT
      });

      vLine(targetPage, MARGIN_LEFT, yTop, yTop - totalBlockH);
      vLine(targetPage, cX[1], yTop, yTop - totalBlockH);
      vLine(targetPage, cX[3], yTop, yTop - totalBlockH);
      vLine(targetPage, RIGHT_X, yTop, yTop - totalBlockH);

      hLine(targetPage, MARGIN_LEFT, RIGHT_X, yTop - totalBlockH);

      return totalBlockH + 12;
    };

    // Determinar cantidad total de PDCs registrados
    const pdcKeys = Object.keys(pdcData);
    const totalPdcs = Math.max(2, pdcKeys.length);

    let pdcCountOnPage = 0;

    for (let p = 1; p <= totalPdcs; p++) {
      const pKey = String(p);
      const pdcObj = pdcData[pKey] || pdcData[`pdc_${p}`] || {};

      if (pdcCountOnPage >= 2) {
        page = await createNewPage();
        cursorY = pageHeight - MARGIN_TOP;
        pdcCountOnPage = 0;
      }

      const consumedH = drawPdcCard(page, cursorY, p, pdcObj);
      cursorY -= consumedH;
      pdcCountOnPage++;
    }

    // Pie de página: Fecha y Firmas en la última página
    cursorY -= 15;

    if (cursorY < MARGIN_BOTTOM + 80) {
      page = await createNewPage();
      cursorY = pageHeight - MARGIN_TOP - 20;
    }

    // FECHA CENTRADA
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

    // FIRMAS INFERIORES
    const sigColWidth = CONTENT_WIDTH / 2;
    const sigLineW = 160;

    const firmas = [
      { label: "Estudiante", xCenter: MARGIN_LEFT + sigColWidth * 0.5 },
      { label: "Docente Guía UE/CEA/CEE", xCenter: MARGIN_LEFT + sigColWidth * 1.5 }
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
    console.error("Error al generar PDF de la Ficha B-2 (5to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};