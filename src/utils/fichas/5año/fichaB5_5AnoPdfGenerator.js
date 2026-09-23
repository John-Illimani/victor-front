import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaB55toAnoService } from '../../../services/fichas/5año/fichaB55toAnoService';

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

export const imprimirFichaB5_5toAno = async (estudianteId) => {
  try {
    const response = await fichaB55toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha B-5."
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

    // TÍTULOS PRINCIPALES (13 pt Bold, Centrados)
    const title1 = "FICHA B-5";
    const title2 = "SEGUIMIENTO Y APOYO DE LA/EL DOCENTE GUÍA";

    const wT1 = fontBold.widthOfTextAtSize(title1, 13);
    page.drawText(title1, { x: CONTENT_CENTER_X - wT1 / 2, y: cursorY, size: 13, font: fontBold, color: COLOR_TITLE });
    cursorY -= 15;

    const wT2 = fontBold.widthOfTextAtSize(title2, 13);
    page.drawText(title2, { x: CONTENT_CENTER_X - wT2 / 2, y: cursorY, size: 13, font: fontBold, color: COLOR_TITLE });
    cursorY -= 18;

    // INSTRUCCIÓN SUPERIOR JUSTIFICADA
    const instrText = "La/el docente guía realiza seguimiento a la/el estudiante integrante del ECTG, evaluando antes de la finalización de la PEC los siguientes criterios.";
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

    // 2. TABLA DE EVALUACIÓN
    // Columnas: Dimensión (26), Criterio (239.65), Valoración (60), Observación/Recomendación (150) = 475.65 pt
    const colW = [26, 239.65, 60, 150];
    let cX = [MARGIN_LEFT];
    for (let i = 0; i < colW.length; i++) cX.push(cX[i] + colW[i]);

    const tableTop = cursorY;
    const tableHeaderH = 24;

    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, tableHeaderH, COLOR_HEADER_BG);
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop - tableHeaderH);

    // Cabeceras de Tabla
    const h1 = "CRITERIO DE EVALUACIÓN";
    const h2_1 = "Valoración";
    const h2_2 = "del 1 a";
    const h2_3 = "100";
    const h3_1 = "Observación/";
    const h3_2 = "Recomendación";

    page.drawText(h1, { x: cX[1] + (colW[1] / 2) - (fontBold.widthOfTextAtSize(h1, 8.5) / 2), y: tableTop - 15, size: 8.5, font: fontBold, color: COLOR_WHITE });

    page.drawText(h2_1, { x: cX[2] + (colW[2] / 2) - (fontBold.widthOfTextAtSize(h2_1, 6.5) / 2), y: tableTop - 7, size: 6.5, font: fontBold, color: COLOR_WHITE });
    page.drawText(h2_2, { x: cX[2] + (colW[2] / 2) - (fontBold.widthOfTextAtSize(h2_2, 6.5) / 2), y: tableTop - 14, size: 6.5, font: fontBold, color: COLOR_WHITE });
    page.drawText(h2_3, { x: cX[2] + (colW[2] / 2) - (fontBold.widthOfTextAtSize(h2_3, 6.5) / 2), y: tableTop - 21, size: 6.5, font: fontBold, color: COLOR_WHITE });

    page.drawText(h3_1, { x: cX[3] + (colW[3] / 2) - (fontBold.widthOfTextAtSize(h3_1, 7.5) / 2), y: tableTop - 9, size: 7.5, font: fontBold, color: COLOR_WHITE });
    page.drawText(h3_2, { x: cX[3] + (colW[3] / 2) - (fontBold.widthOfTextAtSize(h3_2, 7.5) / 2), y: tableTop - 18, size: 7.5, font: fontBold, color: COLOR_WHITE });

    for (let c = 0; c < cX.length; c++) vLine(page, cX[c], tableTop, tableTop - tableHeaderH);

    let currentY = tableTop - tableHeaderH;

    const parseNum = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
    const nSer = parseNum(d.nota_ser);
    const nSaber = parseNum(d.nota_saber);
    const nHacer = parseNum(d.nota_hacer);
    const nDecidir = parseNum(d.nota_decidir);
    const promCalc = Math.round((nSer + nSaber + nHacer + nDecidir) / 4);

    // Definición de Dimensiones y Sub-criterios
    const dimensiones = [
      {
        nombre: "SER",
        nota: nSer,
        obs: d.obs_ser,
        criterios: [
          "Responsabilidad, compromiso y puntualidad en el desarrollo de práctica educativa",
          "Respeto en el trato con estudiantes, padres/ madres de familia, maestras, maestros y personal de la UE/CEA/CEE",
          "Promueve la práctica de valores sociocomunitarios en la UE/CEA/CEE"
        ]
      },
      {
        nombre: "SABER",
        nota: nSaber,
        obs: d.obs_saber,
        criterios: [
          "Conocimiento y manejo de elementos curriculares del MESCP",
          "Conocimiento y dominio de elementos propios de su especialidad",
          "Promueve el fortalecimiento del pensamiento crítico y reflexivo con las y los estudiantes."
        ]
      },
      {
        nombre: "HACER",
        nota: nHacer,
        obs: d.obs_hacer,
        criterios: [
          "Dominio de aula usando estrategias pertinentes.",
          "Manifiesta creatividad en el uso de recursos materiales y educativos en la implementación de la propuesta.",
          "Utiliza instrumentos de evaluación durante la concreción curricular."
        ]
      },
      {
        nombre: "DECIDIR",
        nota: nDecidir,
        obs: d.obs_decidir,
        criterios: [
          "Asume sugerencias y observaciones a los PDC elaborados.",
          "Demuestra aportes desde la implementación de la propuesta educativa.",
          "Demuestra iniciativa en la solución de problemas emergentes de la comunidad educativa."
        ]
      }
    ];

    dimensiones.forEach((dim) => {
      const dimTopY = currentY;
      let subY = currentY;

      // Renderizar los 3 criterios por dimensión
      dim.criterios.forEach((critText, idx) => {
        const critLines = wrapText(critText, font, 8, colW[1] - 8);
        const subH = Math.max(18, critLines.length * 9 + 4);

        // Se dibuja la línea interna solo para separar las sub-filas de la columna Criterio
        hLine(page, cX[1], cX[2], subY - subH);

        let yT = subY - 9.5;
        critLines.forEach((l) => {
          page.drawText(l, { x: cX[1] + 4, y: yT, size: 8, font, color: COLOR_TEXT });
          yT -= 9;
        });

        subY -= subH;
      });

      const dimBlockH = dimTopY - subY;

      // Línea divisoria completa al finalizar las 3 filas de la dimensión
      hLine(page, MARGIN_LEFT, RIGHT_X, subY);

      // 1. DIBUJAR TEXTO VERTICAL "SER / SABER / HACER / DECIDIR"
      const dimTxtW = fontBold.widthOfTextAtSize(dim.nombre, 8.5);
      const vertCenterX = MARGIN_LEFT + (colW[0] / 2) + 2.5;
      const vertCenterY = dimTopY - (dimBlockH / 2) - (dimTxtW / 2);

      page.drawText(dim.nombre, {
        x: vertCenterX,
        y: vertCenterY,
        size: 8.5,
        font: fontBold,
        color: COLOR_TEXT,
        rotate: { type: 'degrees', angle: 90 }
      });

      // 2. DIBUJAR NOTA DE LA DIMENSIÓN EN CELDA UNIFICADA
      const strNota = formatEnteroEstricto(dim.nota);
      const wNota = fontBold.widthOfTextAtSize(strNota, 8.5);
      page.drawText(strNota, {
        x: cX[2] + (colW[2] / 2) - (wNota / 2),
        y: dimTopY - (dimBlockH / 2) - 3,
        size: 8.5,
        font: fontBold,
        color: COLOR_TEXT
      });

      // 3. DIBUJAR OBSERVACIÓN/RECOMENDACIÓN EN CELDA UNIFICADA
      const obsLines = wrapText(dim.obs || "", font, 8, colW[3] - 8);
      let yObs = dimTopY - 10;
      obsLines.forEach((l) => {
        if (yObs > subY + 3) {
          page.drawText(l, { x: cX[3] + 4, y: yObs, size: 8, font, color: COLOR_TEXT });
          yObs -= 9;
        }
      });

      // Dibujar líneas verticales
      vLine(page, MARGIN_LEFT, dimTopY, subY);
      vLine(page, cX[1], dimTopY, subY);
      vLine(page, cX[2], dimTopY, subY);
      vLine(page, cX[3], dimTopY, subY);
      vLine(page, RIGHT_X, dimTopY, subY);

      currentY = subY;
    });

    // FILAS PROMEDIO NUMERAL Y LITERAL
    const rowPromH = 15;
    const strProm = formatEnteroEstricto(d.promedio_numeral && parseNum(d.promedio_numeral) > 0 ? d.promedio_numeral : promCalc);

    // Fila Promedio Numeral
    hLine(page, cX[1] + 120, RIGHT_X, currentY - rowPromH);
    page.drawText("PROMEDIO", { x: cX[0] + 30, y: currentY - 11, size: 8.5, font: fontBold, color: COLOR_TEXT });
    page.drawText("NUMERAL:", { x: cX[1] + colW[1] - 55, y: currentY - 11, size: 8.5, font: fontBold, color: COLOR_TEXT });
    page.drawText(strProm, { x: cX[2] + 10, y: currentY - 11, size: 8.5, font: fontBold, color: COLOR_TEXT });

    vLine(page, MARGIN_LEFT, currentY, currentY - rowPromH);
    vLine(page, cX[0], currentY, currentY - rowPromH);
    vLine(page, cX[1] + 120, currentY, currentY - rowPromH);
    vLine(page, cX[2], currentY, currentY - rowPromH);
    vLine(page, RIGHT_X, currentY, currentY - rowPromH);

    currentY -= rowPromH;

    // Fila Promedio Literal
    hLine(page, MARGIN_LEFT, RIGHT_X, currentY - rowPromH);
    const litClean = cleanLiteral(d.promedio_literal);
    page.drawText("LITERAL:", { x: cX[1] + colW[1] - 48, y: currentY - 11, size: 8.5, font: fontBold, color: COLOR_TEXT });
    page.drawText(litClean, { x: cX[2] + 10, y: currentY - 11, size: 8.5, font: fontBold, color: COLOR_TEXT });

    vLine(page, MARGIN_LEFT, currentY, currentY - rowPromH);
    vLine(page, cX[0], currentY, currentY - rowPromH);
    vLine(page, cX[1] + 120, currentY, currentY - rowPromH);
    vLine(page, cX[2], currentY, currentY - rowPromH);
    vLine(page, RIGHT_X, currentY, currentY - rowPromH);

    currentY -= rowPromH;

    // FILA OBSERVACIONES / SUGERENCIAS
    const obsGenLines = wrapText(`Observaciones/Sugerencias: ${d.observaciones_sugerencias || ""}`, font, 8.5, CONTENT_WIDTH - 12);
    const rowObsH = Math.max(26, obsGenLines.length * 10 + 8);
    hLine(page, MARGIN_LEFT, RIGHT_X, currentY - rowObsH);

    let yObsGen = currentY - 11;
    obsGenLines.forEach((l) => {
      page.drawText(l, { x: MARGIN_LEFT + 6, y: yObsGen, size: 8.5, font, color: COLOR_TEXT });
      yObsGen -= 10;
    });

    vLine(page, MARGIN_LEFT, currentY, currentY - rowObsH);
    vLine(page, RIGHT_X, currentY, currentY - rowObsH);

    currentY -= rowObsH;

    cursorY = currentY - 22;

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

    cursorY -= 35;

    // 4. FIRMAS INFERIORES
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
    console.error("Error al generar PDF de la Ficha B-5 (5to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};