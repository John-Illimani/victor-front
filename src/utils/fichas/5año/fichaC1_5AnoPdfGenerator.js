import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaC15toAnoService } from '../../../services/fichas/5año/fichaC15toAnoService';
import { userService } from '../../../services/userService';

// PALETA DE COLORES INSTITUCIONALES (AZUL INSTITUCIONAL - 5TO AÑO)
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_TITLE = rgb(0 / 255, 114 / 255, 187 / 255);             // Azul (#0072BB)
const COLOR_HEADER_BG = rgb(0 / 255, 114 / 255, 187 / 255);          // Azul (#0072BB)
const COLOR_BORDER = rgb(0 / 255, 114 / 255, 187 / 255);          // Borde Azul (#0072BB)

const BORDER = 0.8;

// FUNCIÓN PARA FORMATEAR NÚMEROS A ENTEROS ESTRICTOS (Ej. 100 o 85)
function formatEnteroEstricto(val) {
  if (val === undefined || val === null || val === '') return '';
  const num = parseFloat(val);
  if (isNaN(num)) return '';
  return String(Math.round(num));
}

// FUNCIÓN PARA FORMATEAR FECHAS A FORMATO CORTO DD/MM/AAAA
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

const underlineTokens = (text, font, color) =>
  String(text ?? '').split(/\s+/).filter(Boolean).map((w) => ({ text: w, font, color, underline: true }));

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

      if (token.underline) {
        page.drawLine({
          start: { x: cursorX, y: cursorY - 2.5 },
          end: { x: cursorX + wordW, y: cursorY - 2.5 },
          thickness: 0.8,
          dashArray: [1.5, 1.5],
          color: token.color || COLOR_TEXT,
        });
      }

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

export const imprimirFichaC1_5toAno = async (estudianteId) => {
  try {
    const response = await fichaC15toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha C-1."
      };
    }

    const d = response.datos;

    // BÚSQUEDA DINÁMICA DEL NOMBRE DEL DOCENTE TUTOR POR ID
    let docenteTutorNombre = d.docente_tutor_nombre || "";
    if (d.docente_tutor_id) {
      try {
        const usuarios = await userService.getUsers();
        if (Array.isArray(usuarios)) {
          const tutorUser = usuarios.find(u => String(u.id) === String(d.docente_tutor_id));
          if (tutorUser) {
            const nom = tutorUser.nombre || "";
            const ape = tutorUser.apellido || "";
            docenteTutorNombre = `${nom} ${ape}`.trim();
          }
        }
      } catch (errUser) {
        console.warn("No se pudo obtener la lista de usuarios para el tutor:", errUser);
      }
    }

    const integrantes = Array.isArray(d.integrantes_ectg)
      ? d.integrantes_ectg
      : (typeof d.integrantes_ectg === 'string' ? JSON.parse(d.integrantes_ectg) : []);
    const notasCriterios = typeof d.notas_criterios === 'string'
      ? JSON.parse(d.notas_criterios)
      : (d.notas_criterios || {});

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
    const maxLineRight = pageWidth - MARGIN_RIGHT; // Límite estricto de rincón a rincón

    let cursorY = pageHeight - MARGIN_TOP;

    // HELPER DE DATOS REFERENCIALES CON LÍNEAS DE RINCÓN A RINCÓN
    const drawFullReferentialField = (label, value) => {
      page.drawText(label, { x: MARGIN_LEFT, y: cursorY, size: 8.5, font: font, color: COLOR_TEXT });
      const labelW = fontBold.widthOfTextAtSize(label, 8.5);
      const valX = MARGIN_LEFT + labelW;
      
      // Trazado de rincón a rincón
      drawDottedLine(page, valX, maxLineRight, cursorY - 2.5);

      const valText = (value && String(value).trim() !== "" ? value : "").toUpperCase();
      if (valText) {
        page.drawText(valText, { x: valX, y: cursorY, size: 8.5, font: fontBold, color: COLOR_TEXT });
      }

      cursorY -= 14;
    };

    // TÍTULOS PRINCIPALES (13 pt Bold, Centrados)
    const title1 = "FICHA C-1";
    const title2 = "EVALUACIÓN DEL DOCUMENTO DE TRABAJO DE GRADO";
    const title3 = "POR LA/EL DOCENTE TUTOR/A ACOMPAÑANTE";

    const wT1 = fontBold.widthOfTextAtSize(title1, 13);
    page.drawText(title1, { x: CONTENT_CENTER_X - wT1 / 2, y: cursorY, size: 13, font: fontBold, color: COLOR_TITLE });
    cursorY -= 15;

    const wT2 = fontBold.widthOfTextAtSize(title2, 11);
    page.drawText(title2, { x: CONTENT_CENTER_X - wT2 / 2, y: cursorY, size: 11, font: fontBold, color: COLOR_TITLE });
    cursorY -= 14;

    const wT3 = fontBold.widthOfTextAtSize(title3, 11);
    page.drawText(title3, { x: CONTENT_CENTER_X - wT3 / 2, y: cursorY, size: 11, font: font, color: COLOR_TITLE });
    cursorY -= 18;

    // I. DATOS REFERENCIALES (9.5 pt Bold)
    page.drawText("I. DATOS REFERENCIALES", { x: MARGIN_LEFT, y: cursorY, size: 9.5, font: fontBold, color: COLOR_TEXT });
    cursorY -= 16;

    // Docente Tutor/a Acompañante de Rincón a Rincón
    drawFullReferentialField("Docente Tutor/a Acompañante: ", docenteTutorNombre);

    // Estudiante de Rincón a Rincón
    drawFullReferentialField("Estudiante: ", d.estudiante_nombre || d.apellidos_nombres || "");

    page.drawText("Integrantes del ECTG:", { x: MARGIN_LEFT, y: cursorY, size: 8.5, font: font, color: COLOR_TEXT });
    cursorY -= 12;

    // TABLA INTEGRANTES DEL ECTG
    const colW1 = [20, 180, 165.65, 110];
    let cX1 = [MARGIN_LEFT];
    for (let i = 0; i < colW1.length; i++) cX1.push(cX1[i] + colW1[i]);

    const hECTGH = 16;
    fillRect(page, MARGIN_LEFT, cursorY, CONTENT_WIDTH, hECTGH, COLOR_HEADER_BG);
    hLine(page, MARGIN_LEFT, RIGHT_X, cursorY);
    hLine(page, MARGIN_LEFT, RIGHT_X, cursorY - hECTGH);

    page.drawText("N°", { x: cX1[0] + 5, y: cursorY - 11, size: 7.5, font: fontBold, color: COLOR_WHITE });
    const hE1 = "NOMBRES Y APELLIDOS";
    page.drawText(hE1, { x: cX1[1] + (colW1[1] / 2) - (fontBold.widthOfTextAtSize(hE1, 7.5) / 2), y: cursorY - 11, size: 7.5, font: fontBold, color: COLOR_WHITE });
    const hE2 = "ESPECIALIDAD";
    page.drawText(hE2, { x: cX1[2] + (colW1[2] / 2) - (fontBold.widthOfTextAtSize(hE2, 7.5) / 2), y: cursorY - 11, size: 7.5, font: fontBold, color: COLOR_WHITE });
    const hE3 = "MODALIDAD DE INGRESO";
    page.drawText(hE3, { x: cX1[3] + (colW1[3] / 2) - (fontBold.widthOfTextAtSize(hE3, 7.5) / 2), y: cursorY - 11, size: 7.5, font: fontBold, color: COLOR_WHITE });

    for (let c = 0; c < cX1.length; c++) vLine(page, cX1[c], cursorY, cursorY - hECTGH);

    cursorY -= hECTGH;

    const rowECTGH = 16;
    for (let r = 1; r <= 3; r++) {
      const member = integrantes[r - 1] || {};
      const nombreVal = member.nombres || member.nombres_apellidos || member.apellidos_nombres || "";
      const espVal = member.especialidad || "";
      const modVal = member.modalidad_ingreso || "";

      hLine(page, MARGIN_LEFT, RIGHT_X, cursorY - rowECTGH);

      page.drawText(String(r), { x: cX1[0] + 6, y: cursorY - 11, size: 7.5, font: fontBold, color: COLOR_TEXT });
      
      const nLines = wrapText(nombreVal, font, 7.5, colW1[1] - 6);
      if (nLines[0]) page.drawText(nLines[0], { x: cX1[1] + 4, y: cursorY - 11, size: 7.5, font, color: COLOR_TEXT });

      const eLines = wrapText(espVal, font, 7.5, colW1[2] - 6);
      if (eLines[0]) page.drawText(eLines[0], { x: cX1[2] + 4, y: cursorY - 11, size: 7.5, font, color: COLOR_TEXT });

      const mLines = wrapText(modVal, font, 7.5, colW1[3] - 6);
      if (mLines[0]) page.drawText(mLines[0], { x: cX1[3] + 4, y: cursorY - 11, size: 7.5, font, color: COLOR_TEXT });

      for (let c = 0; c < cX1.length; c++) vLine(page, cX1[c], cursorY, cursorY - rowECTGH);
      cursorY -= rowECTGH;
    }

    cursorY -= 12;

    // CUADRO DATOS DE LA IEPC-PEC CON LÍNEAS DE RINCÓN A RINCÓN
    page.drawText("DATOS DE LA IEPC-PEC", { x: MARGIN_LEFT + 4, y: cursorY - 2, size: 8.5, font: fontBold, color: COLOR_TEXT });
    cursorY -= 6;

    const iepcTopY = cursorY;
    const iepcH = 52;

    hLine(page, MARGIN_LEFT, RIGHT_X, iepcTopY);
    hLine(page, MARGIN_LEFT, RIGHT_X, iepcTopY - iepcH);

    const depVal = d.departamento_pec || "La Paz";
    const distVal = d.distrito_educativo || "";
    const ueVal = d.ue_cea_cee || "";
    const subVal = d.subsistema || "";
    const curVal = d.curso_area || "";
    const fIniVal = formatFechaCorta(d.fecha_pec_inicio);
    const fFinVal = formatFechaCorta(d.fecha_pec_fin);

    // Fila 1: Departamento y Distrito
    const lblDep = "Departamento: ";
    page.drawText(lblDep, { x: MARGIN_LEFT + 6, y: iepcTopY - 12, size: 8, font, color: COLOR_TEXT });
    const wDepLbl = font.widthOfTextAtSize(lblDep, 8);
    drawDottedLine(page, MARGIN_LEFT + 6 + wDepLbl, MARGIN_LEFT + 220, iepcTopY - 14.5);
    if (depVal) page.drawText(depVal.toUpperCase(), { x: MARGIN_LEFT + 6 + wDepLbl, y: iepcTopY - 12, size: 8, font: fontBold, color: COLOR_TEXT });

    const lblDist = "Distrito Educativo: ";
    page.drawText(lblDist, { x: MARGIN_LEFT + 230, y: iepcTopY - 12, size: 8, font, color: COLOR_TEXT });
    const wDistLbl = font.widthOfTextAtSize(lblDist, 8);
    drawDottedLine(page, MARGIN_LEFT + 230 + wDistLbl, maxLineRight - 6, iepcTopY - 14.5);
    if (distVal) page.drawText(distVal.toUpperCase(), { x: MARGIN_LEFT + 230 + wDistLbl, y: iepcTopY - 12, size: 8, font: fontBold, color: COLOR_TEXT });

    // Fila 2: UE/CEA/CEE
    const lblUe = "UE/CEA/CEE: ";
    page.drawText(lblUe, { x: MARGIN_LEFT + 6, y: iepcTopY - 23, size: 8, font, color: COLOR_TEXT });
    const wUeLbl = font.widthOfTextAtSize(lblUe, 8);
    drawDottedLine(page, MARGIN_LEFT + 6 + wUeLbl, maxLineRight - 6, iepcTopY - 25.5);
    if (ueVal) page.drawText(ueVal.toUpperCase(), { x: MARGIN_LEFT + 6 + wUeLbl, y: iepcTopY - 23, size: 8, font: fontBold, color: COLOR_TEXT });

    // Fila 3: Subsistema y Curso/Área
    const lblSub = "Subsistema: ";
    page.drawText(lblSub, { x: MARGIN_LEFT + 6, y: iepcTopY - 34, size: 8, font, color: COLOR_TEXT });
    const wSubLbl = font.widthOfTextAtSize(lblSub, 8);
    drawDottedLine(page, MARGIN_LEFT + 6 + wSubLbl, MARGIN_LEFT + 220, iepcTopY - 36.5);
    if (subVal) page.drawText(subVal.toUpperCase(), { x: MARGIN_LEFT + 6 + wSubLbl, y: iepcTopY - 34, size: 8, font: fontBold, color: COLOR_TEXT });

    const lblCur = "Curso/Área: ";
    page.drawText(lblCur, { x: MARGIN_LEFT + 230, y: iepcTopY - 34, size: 8, font, color: COLOR_TEXT });
    const wCurLbl = font.widthOfTextAtSize(lblCur, 8);
    drawDottedLine(page, MARGIN_LEFT + 230 + wCurLbl, maxLineRight - 6, iepcTopY - 36.5);
    if (curVal) page.drawText(curVal.toUpperCase(), { x: MARGIN_LEFT + 230 + wCurLbl, y: iepcTopY - 34, size: 8, font: fontBold, color: COLOR_TEXT });

    // Fila 4: Desarrollo PEC
    const lblPec1 = "Desarrollo de la PEC: Del ";
    page.drawText(lblPec1, { x: MARGIN_LEFT + 6, y: iepcTopY - 45, size: 8, font, color: COLOR_TEXT });
    const wPec1Lbl = font.widthOfTextAtSize(lblPec1, 8);
    drawDottedLine(page, MARGIN_LEFT + 6 + wPec1Lbl, MARGIN_LEFT + 220, iepcTopY - 47.5);
    if (fIniVal) page.drawText(fIniVal, { x: MARGIN_LEFT + 6 + wPec1Lbl, y: iepcTopY - 45, size: 8, font: fontBold, color: COLOR_TEXT });

    const lblPec2 = "Al ";
    page.drawText(lblPec2, { x: MARGIN_LEFT + 230, y: iepcTopY - 45, size: 8, font, color: COLOR_TEXT });
    const wPec2Lbl = font.widthOfTextAtSize(lblPec2, 8);
    drawDottedLine(page, MARGIN_LEFT + 230 + wPec2Lbl, maxLineRight - 6, iepcTopY - 47.5);
    if (fFinVal) page.drawText(fFinVal, { x: MARGIN_LEFT + 230 + wPec2Lbl, y: iepcTopY - 45, size: 8, font: fontBold, color: COLOR_TEXT });

    vLine(page, MARGIN_LEFT, iepcTopY, iepcTopY - iepcH);
    vLine(page, RIGHT_X, iepcTopY, iepcTopY - iepcH);

    cursorY = iepcTopY - iepcH - 12;

    // II. EVALUACIÓN DEL DOCUMENTO DE TRABAJO DE GRADO
    page.drawText("II. EVALUACIÓN DEL DOCUMENTO DE TRABAJO DE GRADO", { x: MARGIN_LEFT, y: cursorY, size: 9.5, font: fontBold, color: COLOR_TEXT });
    cursorY -= 14;

    // TABLA DE CRITERIOS DE EVALUACIÓN
    const colW2 = [335.65, 60, 80];
    let cX2 = [MARGIN_LEFT];
    for (let i = 0; i < colW2.length; i++) cX2.push(cX2[i] + colW2[i]);

    const hEvalH = 22;
    fillRect(page, MARGIN_LEFT, cursorY, CONTENT_WIDTH, hEvalH, COLOR_HEADER_BG);
    hLine(page, MARGIN_LEFT, RIGHT_X, cursorY);
    hLine(page, MARGIN_LEFT, RIGHT_X, cursorY - hEvalH);

    const hCrit = "CRITERIOS DE EVALUACIÓN ESPECÍFICOS";
    page.drawText(hCrit, { x: cX2[0] + (colW2[0] / 2) - (fontBold.widthOfTextAtSize(hCrit, 8) / 2), y: cursorY - 14, size: 8, font: fontBold, color: COLOR_WHITE });

    const hVal = "VALORACIÓN";
    page.drawText(hVal, { x: cX2[1] + ((colW2[1] + colW2[2]) / 2) - (fontBold.widthOfTextAtSize(hVal, 7.5) / 2), y: cursorY - 7, size: 7.5, font: fontBold, color: COLOR_WHITE });

    page.drawText("Puntaje", { x: cX2[1] + (colW2[1] / 2) - (fontBold.widthOfTextAtSize("Puntaje", 6.5) / 2), y: cursorY - 14, size: 6.5, font: fontBold, color: COLOR_WHITE });
    page.drawText("Máximo", { x: cX2[1] + (colW2[1] / 2) - (fontBold.widthOfTextAtSize("Máximo", 6.5) / 2), y: cursorY - 20, size: 6.5, font: fontBold, color: COLOR_WHITE });

    page.drawText("Puntaje", { x: cX2[2] + (colW2[2] / 2) - (fontBold.widthOfTextAtSize("Puntaje", 6.5) / 2), y: cursorY - 14, size: 6.5, font: fontBold, color: COLOR_WHITE });
    page.drawText("Asignado", { x: cX2[2] + (colW2[2] / 2) - (fontBold.widthOfTextAtSize("Asignado", 6.5) / 2), y: cursorY - 20, size: 6.5, font: fontBold, color: COLOR_WHITE });

    for (let c = 0; c < cX2.length; c++) vLine(page, cX2[c], cursorY, cursorY - hEvalH);

    cursorY -= hEvalH;

    const criterios = [
      "Presentación del Marco contextual y nudo problemático. Coherencia, pertinencia, relevancia.",
      "Presentación de la Propuesta Educativa, coherente con una modalidad de graduación.",
      "Presenta instrumentos y procesos de investigación en la implementación de la propuesta educativa.",
      "Presenta la sistematización de la experiencia educativa, de acuerdo a orientaciones y estructura sugerida.",
      "Producción de conocimientos y aportes específicos a la reflexión de la práctica educativa en la especialidad.",
      "Cumple con formalidades de rigor académico. Redacción, sintaxis, formato, normas APA en citas y referencias bibliográficas."
    ];

    let sumaNotas = 0;
    let cantidadNotas = 0;

    criterios.forEach((critText, idx) => {
      const cLines = wrapText(critText, font, 7.5, colW2[0] - 8);
      const rH = Math.max(16, cLines.length * 8.5 + 4);

      hLine(page, MARGIN_LEFT, RIGHT_X, cursorY - rH);

      let yC = cursorY - 9;
      cLines.forEach(l => {
        page.drawText(l, { x: cX2[0] + 4, y: yC, size: 7.5, font, color: COLOR_TEXT });
        yC -= 8.5;
      });

      page.drawText("100", { x: cX2[1] + (colW2[1] / 2) - (fontBold.widthOfTextAtSize("100", 7.5) / 2), y: cursorY - (rH / 2) - 2.5, size: 7.5, font: fontBold, color: COLOR_TEXT });

      const nKey = `c${idx + 1}`;
      const notaVal = notasCriterios[nKey] !== undefined ? notasCriterios[nKey] : notasCriterios[`criterio_${idx + 1}`];
      if (notaVal !== undefined && notaVal !== null) {
        const num = parseFloat(notaVal);
        if (!isNaN(num)) {
          sumaNotas += num;
          cantidadNotas++;
        }
      }

      const strNota = formatEnteroEstricto(notaVal);
      page.drawText(strNota, { x: cX2[2] + (colW2[2] / 2) - (fontBold.widthOfTextAtSize(strNota, 7.5) / 2), y: cursorY - (rH / 2) - 2.5, size: 7.5, font: fontBold, color: COLOR_TEXT });

      for (let c = 0; c < cX2.length; c++) vLine(page, cX2[c], cursorY, cursorY - rH);

      cursorY -= rH;
    });

    // FILA PROMEDIO
    const rowPromH = 16;
    hLine(page, MARGIN_LEFT, RIGHT_X, cursorY - rowPromH);

    const txtProm = "PROMEDIO";
    page.drawText(txtProm, { x: cX2[0] + colW2[0] - fontBold.widthOfTextAtSize(txtProm, 8) - 10, y: cursorY - 11, size: 8, font: fontBold, color: COLOR_TEXT });
    page.drawText("100", { x: cX2[1] + (colW2[1] / 2) - (fontBold.widthOfTextAtSize("100", 8) / 2), y: cursorY - 11, size: 8, font: fontBold, color: COLOR_TEXT });

    const promCalc = cantidadNotas > 0 ? Math.round(sumaNotas / cantidadNotas) : 0;
    const promFinal = d.promedio_numeral && parseFloat(d.promedio_numeral) > 0 ? d.promedio_numeral : promCalc;
    const strPromFinal = formatEnteroEstricto(promFinal);

    page.drawText(strPromFinal, { x: cX2[2] + (colW2[2] / 2) - (fontBold.widthOfTextAtSize(strPromFinal, 8) / 2), y: cursorY - 11, size: 8, font: fontBold, color: COLOR_TEXT });

    for (let c = 0; c < cX2.length; c++) vLine(page, cX2[c], cursorY, cursorY - rowPromH);

    cursorY -= rowPromH;

    // SUGERENCIAS Y RECOMENDACIONES
    const sugText = `Sugerencias y recomendaciones: ${d.sugerencias_recomendaciones || ""}`;
    const sugLines = wrapText(sugText, font, 8, CONTENT_WIDTH - 12);
    const rowSugH = Math.max(30, sugLines.length * 9.5 + 8);

    hLine(page, MARGIN_LEFT, RIGHT_X, cursorY - rowSugH);

    let ySug = cursorY - 11;
    sugLines.forEach(l => {
      page.drawText(l, { x: MARGIN_LEFT + 6, y: ySug, size: 8, font, color: COLOR_TEXT });
      ySug -= 9.5;
    });

    vLine(page, MARGIN_LEFT, cursorY, cursorY - rowSugH);
    vLine(page, RIGHT_X, cursorY, cursorY - rowSugH);

    cursorY -= rowSugH + 20;

    // LUGAR Y FECHA CENTRADO DINÁMICAMENTE CON LÍNEA PUNTEADA EXACTA SEPARADA (-2.5pt)
    const ciudad = d.lugar_ciudad || "El Alto";
    const dia = d.dia || "21";
    const mes = d.mes || "septiembre";
    const ano = String(d.ano || "2026").slice(0, 4);

    const txtLugarLabel = "Lugar y fecha: ";
    const txtLugarValor = `${ciudad}, ${dia} de ${mes} de ${ano}`;

    const wLabelLF = font.widthOfTextAtSize(txtLugarLabel, 8.5);
    const wValLF = fontBold.widthOfTextAtSize(txtLugarValor, 8.5);
    const totalLFWidth = wLabelLF + wValLF;
    const startX_LF = CONTENT_CENTER_X - (totalLFWidth / 2);

    page.drawText(txtLugarLabel, { x: startX_LF, y: cursorY, size: 8.5, font, color: COLOR_TEXT });
    page.drawText(txtLugarValor, { x: startX_LF + wLabelLF, y: cursorY, size: 8.5, font: fontBold, color: COLOR_TEXT });
    drawDottedLine(page, startX_LF + wLabelLF, startX_LF + totalLFWidth, cursorY - 2.5);

    cursorY -= 35;

    // FIRMA DOCENTE TUTOR/A ACOMPAÑANTE
    const sigLineW = 160;
    const startSigX = CONTENT_CENTER_X - sigLineW / 2;
    const endSigX = CONTENT_CENTER_X + sigLineW / 2;

    drawDottedLine(page, startSigX, endSigX, cursorY);

    const txtF1 = "Firma y sello";
    const txtF2 = "DOCENTE TUTOR/A ACOMPAÑANTE";

    page.drawText(txtF1, { x: CONTENT_CENTER_X - (fontBold.widthOfTextAtSize(txtF1, 8) / 2), y: cursorY - 10, size: 8, font: fontBold, color: COLOR_TEXT });
    page.drawText(txtF2, { x: CONTENT_CENTER_X - (fontBold.widthOfTextAtSize(txtF2, 8) / 2), y: cursorY - 20, size: 8, font: fontBold, color: COLOR_TEXT });

    cursorY -= 35;

    // NOTAS ACLARATORIAS INFERIORES EN VIÑETAS
    const notas = [
      "Durante la segunda presentación preliminar del Trabajo de Grado, la o el Docente Tutor/a Acompañante evalúa el Documento final.",
      "La aprobación del Documento de Trabajo de Grado habilita a cada integrante del ECTG a la socialización del mismo, en fecha y lugar previsto por la ESFM/UA.",
      "Cualquier enmienda o raspadura invalida el presente documento."
    ];

    notas.forEach((n) => {
      const nLines = wrapText(n, font, 7, CONTENT_WIDTH - 12);
      page.drawText("•", { x: MARGIN_LEFT, y: cursorY, size: 7, font, color: COLOR_TEXT });
      let yN = cursorY;
      nLines.forEach(l => {
        page.drawText(l, { x: MARGIN_LEFT + 10, y: yN, size: 7, font, color: COLOR_TEXT });
        yN -= 8;
      });
      cursorY = yN - 2;
    });

    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, '_blank');
    return { success: true };

  } catch (error) {
    console.error("Error al generar PDF de la Ficha C-1 (5to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};