import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaB65toAnoService } from '../../../services/fichas/5año/fichaB65toAnoService';

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

// FUNCIÓN PARA FORMATEAR FECHA A FORMATO CORTO DD/MM/AAAA
function formatFechaCorta(dateStr) {
  if (!dateStr) return '..../..../....';
  const str = String(dateStr).trim();
  const dateOnly = str.includes('T') ? str.split('T')[0] : str;
  const parts = dateOnly.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateOnly;
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
  page.drawLine({ start: {x, y: y1 }, end: { x, y: y2 }, thickness: BORDER, color: COLOR_BORDER });
}

function fillRect(page, x, yTop, w, h, color) {
  page.drawRectangle({ x, y: yTop - h, width: w, height: h, color });
}

export const imprimirFichaB6_5toAno = async (estudianteId) => {
  try {
    const response = await fichaB65toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha B-6."
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

    // 1. DIMENSIONES Y MÁRGENES ESTRICTOS SOLICITADOS
    const MARGIN_TOP = 141.73;          // 5.0 cm exactos (141.73 pt)
    const MARGIN_LEFT = 85.04;          // 3.0 cm exactos (85.04 pt)
    const MARGIN_RIGHT = 51.31;         // 1.81 cm exactos (51.31 pt)
    const MARGIN_BOTTOM = 141.73;       // 5.0 cm límite inferior
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt exactos
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // TÍTULOS PRINCIPALES
    const title1 = "FICHA B-6";
    const title2 = "APOYO Y SEGUIMIENTO DE LA/EL DOCENTE TUTOR/A ACOMPAÑANTE";

    const wT1 = fontBold.widthOfTextAtSize(title1, 13);
    page.drawText(title1, { x: CONTENT_CENTER_X - wT1 / 2, y: cursorY, size: 13, font: fontBold, color: COLOR_TITLE });
    cursorY -= 15;

    const wT2 = fontBold.widthOfTextAtSize(title2, 12);
    page.drawText(title2, { x: CONTENT_CENTER_X - wT2 / 2, y: cursorY, size: 12, font: fontBold, color: COLOR_TITLE });
    cursorY -= 18;

    // INSTRUCCIÓN SUPERIOR JUSTIFICADA
    const instrText = "La/el docente acompañante de ESFM/UA realiza seguimiento a la/el estudiante practicante, evaluando los criterios descritos por lo menos 2 veces durante el desarrollo de la PEC.";
    const tokensInstr = plainTokens(instrText, font);
    cursorY = drawJustifiedParagraph(page, tokensInstr, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 8.5,
      lineHeight: 11,
      spaceFont: font
    });

    cursorY -= 8;

    // 2. ESTRUCTURA DE LA TABLA
    // Columnas: Dimensión (24), Criterio (151.65), V1 (55), V2 (55), Promedio (70), Observaciones (120) = 475.65 pt
    const colW = [24, 151.65, 55, 55, 70, 120];
    let cX = [MARGIN_LEFT];
    for (let i = 0; i < colW.length; i++) cX.push(cX[i] + colW[i]);

    const tableTop = cursorY;
    const tableHeaderH = 26;

    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, tableHeaderH, COLOR_HEADER_BG);
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop - tableHeaderH);

    // Texto de Cabecera
    const h1 = "CRITERIO DE EVALUACIÓN";
    page.drawText(h1, { x: cX[1] + (colW[1] / 2) - (fontBold.widthOfTextAtSize(h1, 7.5) / 2), y: tableTop - 15, size: 7.5, font: fontBold, color: COLOR_WHITE });

    // (A) 1ra Valoración
    page.drawText("(A) 1ra", { x: cX[2] + (colW[2] / 2) - (fontBold.widthOfTextAtSize("(A) 1ra", 6.5) / 2), y: tableTop - 7, size: 6.5, font: fontBold, color: COLOR_WHITE });
    page.drawText("Valoración", { x: cX[2] + (colW[2] / 2) - (fontBold.widthOfTextAtSize("Valoración", 6.5) / 2), y: tableTop - 14, size: 6.5, font: fontBold, color: COLOR_WHITE });
    page.drawText("De 1 a 100", { x: cX[2] + (colW[2] / 2) - (fontBold.widthOfTextAtSize("De 1 a 100", 6) / 2), y: tableTop - 21, size: 6, font: fontBold, color: COLOR_WHITE });

    // (B) 2da Valoración
    page.drawText("(B) 2da", { x: cX[3] + (colW[3] / 2) - (fontBold.widthOfTextAtSize("(B) 2da", 6.5) / 2), y: tableTop - 7, size: 6.5, font: fontBold, color: COLOR_WHITE });
    page.drawText("Valoración", { x: cX[3] + (colW[3] / 2) - (fontBold.widthOfTextAtSize("Valoración", 6.5) / 2), y: tableTop - 14, size: 6.5, font: fontBold, color: COLOR_WHITE });
    page.drawText("De 1 a 100", { x: cX[3] + (colW[3] / 2) - (fontBold.widthOfTextAtSize("De 1 a 100", 6) / 2), y: tableTop - 21, size: 6, font: fontBold, color: COLOR_WHITE });

    // (A+B)/2 Promedio
    page.drawText("(A+B) /2", { x: cX[4] + (colW[4] / 2) - (fontBold.widthOfTextAtSize("(A+B) /2", 6.5) / 2), y: tableTop - 10, size: 6.5, font: fontBold, color: COLOR_WHITE });
    page.drawText("Promedio parcial", { x: cX[4] + (colW[4] / 2) - (fontBold.widthOfTextAtSize("Promedio parcial", 6.5) / 2), y: tableTop - 18, size: 6.5, font: fontBold, color: COLOR_WHITE });

    // Observaciones
    page.drawText("OBSERVACIÓN", { x: cX[5] + (colW[5] / 2) - (fontBold.widthOfTextAtSize("OBSERVACIÓN", 6.5) / 2), y: tableTop - 10, size: 6.5, font: fontBold, color: COLOR_WHITE });
    page.drawText("RECOMENDACIÓN", { x: cX[5] + (colW[5] / 2) - (fontBold.widthOfTextAtSize("RECOMENDACIÓN", 6.5) / 2), y: tableTop - 18, size: 6.5, font: fontBold, color: COLOR_WHITE });

    for (let c = 0; c < cX.length; c++) vLine(page, cX[c], tableTop, tableTop - tableHeaderH);

    let currentY = tableTop - tableHeaderH;

    const parseNum = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };

    const dimensiones = [
      {
        nombre: "SER",
        v1: parseNum(d.v1_ser),
        v2: parseNum(d.v2_ser),
        obs: d.obs_ser,
        criterios: [
          "Responsabilidad y puntualidad en el desarrollo de la práctica educativa.",
          "Demuestra respeto en el trato con la comunidad de la UE/ CEA/CEE.",
          "Promueve la práctica de valores sociocomunitarios en la UE/CEA/CEE."
        ]
      },
      {
        nombre: "SABER",
        v1: parseNum(d.v1_saber),
        v2: parseNum(d.v2_saber),
        obs: d.obs_saber,
        criterios: [
          "Demuestra conocimiento en el manejo de los elementos curriculares del PDC.",
          "Asume sugerencias y observaciones a los PDC elaborados.",
          "Demuestra dominio de los contenidos de la especialidad."
        ]
      },
      {
        nombre: "HACER",
        v1: parseNum(d.v1_hacer),
        v2: parseNum(d.v2_hacer),
        obs: d.obs_hacer,
        criterios: [
          "Dominio de aula usando estrategias pertinentes.",
          "Manifiesta creatividad en el uso de recursos materiales y educativos.",
          "Utiliza instrumentos de evaluación."
        ]
      },
      {
        nombre: "DECIDIR",
        v1: parseNum(d.v1_decidir),
        v2: parseNum(d.v2_decidir),
        obs: d.obs_decidir,
        criterios: [
          "Promueve la participación de los actores educativos durante la clase.",
          "Demuestra aportes desde la implementación de la propuesta educativa.",
          "Demuestra iniciativa en la solución de problemas emergentes de la comunidad educativa."
        ]
      }
    ];

    let sumaPromedios = 0;

    dimensiones.forEach((dim) => {
      const dimTopY = currentY;
      let subY = currentY;

      // Renderizar los 3 criterios
      dim.criterios.forEach((critText) => {
        const critLines = wrapText(critText, font, 7.5, colW[1] - 8);
        const subH = Math.max(17, critLines.length * 8.5 + 4);

        hLine(page, cX[1], cX[2], subY - subH);

        let yT = subY - 9;
        critLines.forEach((l) => {
          page.drawText(l, { x: cX[1] + 4, y: yT, size: 7.5, font, color: COLOR_TEXT });
          yT -= 8.5;
        });

        subY -= subH;
      });

      const dimBlockH = dimTopY - subY;

      // Línea divisoria completa al finalizar las 3 filas
      hLine(page, MARGIN_LEFT, RIGHT_X, subY);

      // Texto vertical SER / SABER / HACER / DECIDIR
      const dimTxtW = fontBold.widthOfTextAtSize(dim.nombre, 8);
      const vertCenterX = MARGIN_LEFT + (colW[0] / 2) + 2.5;
      const vertCenterY = dimTopY - (dimBlockH / 2) - (dimTxtW / 2);

      page.drawText(dim.nombre, {
        x: vertCenterX,
        y: vertCenterY,
        size: 8,
        font: fontBold,
        color: COLOR_TEXT,
        rotate: { type: 'degrees', angle: 90 }
      });

      // (A) 1ra Valoración
      const strV1 = formatEnteroEstricto(dim.v1);
      const wV1 = fontBold.widthOfTextAtSize(strV1, 8);
      page.drawText(strV1, { x: cX[2] + (colW[2] / 2) - (wV1 / 2), y: dimTopY - (dimBlockH / 2) - 3, size: 8, font: fontBold, color: COLOR_TEXT });

      // (B) 2da Valoración
      const strV2 = formatEnteroEstricto(dim.v2);
      const wV2 = fontBold.widthOfTextAtSize(strV2, 8);
      page.drawText(strV2, { x: cX[3] + (colW[3] / 2) - (wV2 / 2), y: dimTopY - (dimBlockH / 2) - 3, size: 8, font: fontBold, color: COLOR_TEXT });

      // (A+B)/2 Promedio Parcial
      const promDim = Math.round((dim.v1 + dim.v2) / 2);
      sumaPromedios += promDim;
      const strPromDim = formatEnteroEstricto(promDim);
      const wPD = fontBold.widthOfTextAtSize(strPromDim, 8);
      page.drawText(strPromDim, { x: cX[4] + (colW[4] / 2) - (wPD / 2), y: dimTopY - (dimBlockH / 2) - 3, size: 8, font: fontBold, color: COLOR_TEXT });

      // Observaciones
      const obsLines = wrapText(dim.obs || "", font, 7.5, colW[5] - 8);
      let yObs = dimTopY - 10;
      obsLines.forEach((l) => {
        if (yObs > subY + 3) {
          page.drawText(l, { x: cX[5] + 4, y: yObs, size: 7.5, font, color: COLOR_TEXT });
          yObs -= 8.5;
        }
      });

      // Líneas verticales
      for (let c = 0; c < cX.length; c++) vLine(page, cX[c], dimTopY, subY);

      currentY = subY;
    });

   // FILA PROMEDIO FINAL NUMERAL
    const rowPromH = 16;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentY - rowPromH);

    const promFinalCalc = Math.round(sumaPromedios / 4);
    const promFinalVal = d.promedio_numeral && parseNum(d.promedio_numeral) > 0 ? parseNum(d.promedio_numeral) : promFinalCalc;

    // 1. Texto de la etiqueta ubicado en la columna de Promedio Parcial (cX[4] a cX[5])
    const txtPromLbl = "PROMEDIO FINAL NUMERAL";
    const wPFL = fontBold.widthOfTextAtSize(txtPromLbl, 6); // Usamos tamaño 6 para que encaje perfectamente
    page.drawText(txtPromLbl, { x: cX[4] + (colW[4] / 2) - (wPFL / 2)-13, y: currentY - 11, size: 6, font: fontBold, color: COLOR_TEXT });

    // 2. El número avanza a la siguiente celda (Columna Observaciones: cX[5] a RIGHT_X)
    const strPromFinal = formatEnteroEstricto(promFinalVal);
    const wPFV = fontBold.widthOfTextAtSize(strPromFinal, 9);
    page.drawText(strPromFinal, { x: cX[5] + (colW[5] / 2) - (wPFV / 2), y: currentY - 11, size: 9, font: fontBold, color: COLOR_TEXT });

    // Líneas verticales de la fila
    vLine(page, MARGIN_LEFT, currentY, currentY - rowPromH);
    vLine(page, cX[0], currentY, currentY - rowPromH);
    vLine(page, cX[5], currentY, currentY - rowPromH);
    vLine(page, RIGHT_X, currentY, currentY - rowPromH);

    currentY -= rowPromH;

    // SECCIÓN DE FECHAS Y FIRMAS DE 1RA Y 2DA VALORACIÓN
    const valBlockH = 50;
    const halfWidth = CONTENT_WIDTH / 2;

    hLine(page, MARGIN_LEFT, RIGHT_X, currentY - valBlockH);

    // Bloque 1ra Valoración
    const f1Str = formatFechaCorta(d.fecha_1ra_val);
    page.drawText("Fecha de la 1ra", { x: MARGIN_LEFT + 6, y: currentY - 11, size: 7.5, font: fontBold, color: COLOR_TEXT });
    page.drawText("Valoración:", { x: MARGIN_LEFT + 6, y: currentY - 19, size: 7.5, font: fontBold, color: COLOR_TEXT });
    page.drawText(f1Str, { x: MARGIN_LEFT + 10, y: currentY - 38, size: 7.5, font, color: COLOR_TEXT });

    page.drawText("Firma Docente Tutor/a:", { x: MARGIN_LEFT + 90, y: currentY - 11, size: 7.5, font: fontBold, color: COLOR_TEXT });
    drawDottedLine(page, MARGIN_LEFT + 90, MARGIN_LEFT + halfWidth - 10, currentY - 38);

    // Bloque 2da Valoración
    const f2Str = formatFechaCorta(d.fecha_2da_val);
    const rightBlockX = MARGIN_LEFT + halfWidth;

    page.drawText("Fecha de la 2da", { x: rightBlockX + 6, y: currentY - 11, size: 7.5, font: fontBold, color: COLOR_TEXT });
    page.drawText("Valoración:", { x: rightBlockX + 6, y: currentY - 19, size: 7.5, font: fontBold, color: COLOR_TEXT });
    page.drawText(f2Str, { x: rightBlockX + 10, y: currentY - 38, size: 7.5, font, color: COLOR_TEXT });

    page.drawText("Firma Docente Tutor/a:", { x: rightBlockX + 90, y: currentY - 11, size: 7.5, font: fontBold, color: COLOR_TEXT });
    drawDottedLine(page, rightBlockX + 90, RIGHT_X - 10, currentY - 38);

    // Líneas verticales de las cajas de valoración
    vLine(page, MARGIN_LEFT, currentY, currentY - valBlockH);
    vLine(page, MARGIN_LEFT + 82, currentY, currentY - valBlockH);
    vLine(page, rightBlockX, currentY, currentY - valBlockH);
    vLine(page, rightBlockX + 82, currentY, currentY - valBlockH);
    vLine(page, RIGHT_X, currentY, currentY - valBlockH);

    currentY -= valBlockH;

    cursorY = currentY - 30;

    // 3. FIRMAS INFERIORES PRINCIPALES
    const sigColWidth = CONTENT_WIDTH / 2;
    const sigLineW = 160;

    const firmas = [
      { label: "Estudiante", xCenter: MARGIN_LEFT + sigColWidth * 0.5 },
      { label: "Docente Tutor/a Acompañante", xCenter: MARGIN_LEFT + sigColWidth * 1.5 }
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
    console.error("Error al generar PDF de la Ficha B-6 (5to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};