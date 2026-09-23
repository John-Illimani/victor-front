import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaC25toAnoService } from '../../../services/fichas/5año/fichaC25toAnoService';
import { userService } from '../../../services/userService';

// PALETA DE COLORES INSTITUCIONALES (AZUL INSTITUCIONAL - 5TO AÑO)
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
          start: { x: cursorX, y: cursorY - 1.5 },
          end: { x: cursorX + wordW, y: cursorY - 1.5 },
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

export const imprimirFichaC2_5toAno = async (estudianteId) => {
  try {
    const response = await fichaC25toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha C-2."
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

    const integrantes = Array.isArray(d.integrantes)
      ? d.integrantes
      : (typeof d.integrantes === 'string' ? JSON.parse(d.integrantes) : []);

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
    const MARGIN_TOP = 141.73;          // 5.0 cm exactos
    const MARGIN_LEFT = 85.04;          // 3.0 cm exactos
    const MARGIN_RIGHT = 51.31;         // 1.81 cm exactos
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // TÍTULOS PRINCIPALES
    const title1 = "FICHA C-2";
    const title2 = "ACTA DE SOCIALIZACIÓN DEL TRABAJO DE GRADO";
    const title3 = "POR LA COMISIÓN COMUNITARIA DE EVALUACIÓN";

    const wT1 = fontBold.widthOfTextAtSize(title1, 13);
    page.drawText(title1, { x: CONTENT_CENTER_X - wT1 / 2, y: cursorY, size: 13, font: fontBold, color: COLOR_TITLE });
    cursorY -= 15;

    const wT2 = fontBold.widthOfTextAtSize(title2, 11);
    page.drawText(title2, { x: CONTENT_CENTER_X - wT2 / 2, y: cursorY, size: 11, font: fontBold, color: COLOR_TITLE });
    cursorY -= 14;

    const wT3 = fontBold.widthOfTextAtSize(title3, 11);
    page.drawText(title3, { x: CONTENT_CENTER_X - wT3 / 2, y: cursorY, size: 11, font: fontBold, color: COLOR_TITLE });
    cursorY -= 18;

    // DATOS REFERENCIALES
    page.drawText("DATOS REFERENCIALES", { x: MARGIN_LEFT, y: cursorY, size: 8.5, font: fontBold, color: COLOR_TEXT });
    cursorY -= 14;

    // Docente Tutor/a Acompañante
    const tokensTutor = [
      ...plainTokens("Docente Tutor/a Acompañante: ", fontBold),
      ...underlineTokens(docenteTutorNombre, fontBold)
    ];
    cursorY = drawJustifiedParagraph(page, tokensTutor, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 8,
      lineHeight: 11,
      spaceFont: font
    });
    cursorY -= 3;

    // Estudiante
    const tokensEst = [
      ...plainTokens("Estudiante: ", fontBold),
      ...underlineTokens(d.estudiante_nombre || d.apellidos_nombres || "", fontBold)
    ];
    cursorY = drawJustifiedParagraph(page, tokensEst, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 8,
      lineHeight: 11,
      spaceFont: font
    });

    cursorY -= 10;

    // CUADRO DATOS DE LA IEPC-PEC
    page.drawText("DATOS DE LA IEPC-PEC", { x: MARGIN_LEFT + 4, y: cursorY - 2, size: 8.5, font: fontBold, color: COLOR_TEXT });
    cursorY -= 6;

    const iepcTopY = cursorY;
    const iepcH = 50;

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
    const tokensFila1 = [
      ...plainTokens("Departamento: ", font),
      ...underlineTokens(depVal, fontBold),
      ...plainTokens("                             Distrito Educativo: ", font),
      ...underlineTokens(distVal, fontBold)
    ];
    drawJustifiedParagraph(page, tokensFila1, { x: MARGIN_LEFT + 6, y: iepcTopY - 11, maxWidth: CONTENT_WIDTH - 12, fontSize: 8, lineHeight: 11, spaceFont: font });

    // Fila 2: UE/CEA/CEE
    const tokensFila2 = [
      ...plainTokens("UE/CEA/CEE: ", font),
      ...underlineTokens(ueVal, fontBold)
    ];
    drawJustifiedParagraph(page, tokensFila2, { x: MARGIN_LEFT + 6, y: iepcTopY - 22, maxWidth: CONTENT_WIDTH - 12, fontSize: 8, lineHeight: 11, spaceFont: font });

    // Fila 3: Subsistema y Curso/Área
    const tokensFila3 = [
      ...plainTokens("Subsistema: ", font),
      ...underlineTokens(subVal, fontBold),
      ...plainTokens("                             Curso/Área: ", font),
      ...underlineTokens(curVal, fontBold)
    ];
    drawJustifiedParagraph(page, tokensFila3, { x: MARGIN_LEFT + 6, y: iepcTopY - 33, maxWidth: CONTENT_WIDTH - 12, fontSize: 8, lineHeight: 11, spaceFont: font });

    // Fila 4: Desarrollo PEC
    const tokensFila4 = [
      ...plainTokens("Desarrollo de la PEC: Del ", font),
      ...underlineTokens(fIniVal, fontBold),
      ...plainTokens(" Al ", font),
      ...underlineTokens(fFinVal, fontBold)
    ];
    drawJustifiedParagraph(page, tokensFila4, { x: MARGIN_LEFT + 6, y: iepcTopY - 44, maxWidth: CONTENT_WIDTH - 12, fontSize: 8, lineHeight: 11, spaceFont: font });

    vLine(page, MARGIN_LEFT, iepcTopY, iepcTopY - iepcH);
    vLine(page, RIGHT_X, iepcTopY, iepcTopY - iepcH);

    cursorY = iepcTopY - iepcH - 10;

    // Modalidad de Graduación
    const tokensMod = [
      ...plainTokens("Modalidad de Graduación: ", fontBold),
      ...underlineTokens(d.modalidad_graduacion || "", fontBold)
    ];
    cursorY = drawJustifiedParagraph(page, tokensMod, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 8,
      lineHeight: 11,
      spaceFont: font
    });
    cursorY -= 3;

    // Título del Trabajo de Grado
    const tokensTitulo = [
      ...plainTokens("Título del Trabajo de Grado: ", fontBold),
      ...underlineTokens(d.titulo_trabajo_grado || "", fontBold)
    ];
    cursorY = drawJustifiedParagraph(page, tokensTitulo, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 8,
      lineHeight: 11,
      spaceFont: font
    });

    cursorY -= 10;

    // TABLA DE CRITERIOS Y EVALUACIÓN DE INTEGRANTES DEL ECTG
    const colW = [235.65, 80, 80, 80];
    let cX = [MARGIN_LEFT];
    for (let i = 0; i < colW.length; i++) cX.push(cX[i] + colW[i]);

    const headerTopY = cursorY;
    const headerH = 45;

    fillRect(page, MARGIN_LEFT, headerTopY, CONTENT_WIDTH, headerH, COLOR_HEADER_BG);
    hLine(page, MARGIN_LEFT, RIGHT_X, headerTopY);
    hLine(page, MARGIN_LEFT, RIGHT_X, headerTopY - headerH);

    // Cabecera Columna 1
    const txtCritHeader = "CRITERIOS DE EVALUACIÓN EN LA SOCIALIZACIÓN";
    const cLines = wrapText(txtCritHeader, fontBold, 8, colW[0] - 8);
    let yC = headerTopY - 20;
    cLines.forEach(l => {
      page.drawText(l, { x: cX[0] + (colW[0] / 2) - (fontBold.widthOfTextAtSize(l, 8) / 2), y: yC, size: 8, font: fontBold, color: COLOR_WHITE });
      yC -= 9;
    });

    // Cabecera Integrantes ECTG
    const hEctg = "INTEGRANTES DEL ECTG";
    page.drawText(hEctg, { x: cX[1] + (240 / 2) - (fontBold.widthOfTextAtSize(hEctg, 8) / 2), y: headerTopY - 10, size: 8, font: fontBold, color: COLOR_WHITE });
    hLine(page, cX[1], RIGHT_X, headerTopY - 14);

    for (let i = 1; i <= 3; i++) {
      const m = integrantes[i - 1] || {};
      const nomStr = m.nombre_apellido || m.nombre || m.nombres_apellidos || "";
      const ciStr = m.ci || "";

      const startX = cX[i];
      page.drawText(`Nombre: ${nomStr}`, { x: startX + 3, y: headerTopY - 21, size: 6.5, font: fontBold, color: COLOR_WHITE });
      page.drawText(`C.I.: ${ciStr}`, { x: startX + 3, y: headerTopY - 29, size: 6.5, font: fontBold, color: COLOR_WHITE });
      page.drawText("Valoración de 1 a 100", { x: startX + 3, y: headerTopY - 38, size: 6.5, font: fontBold, color: COLOR_WHITE });
    }

    for (let c = 0; c < cX.length; c++) vLine(page, cX[c], headerTopY, headerTopY - headerH);

    cursorY -= headerH;

    // BLOQUES DE CRITERIOS EVALUATIVOS (Mapeo c1, c2, c3 desde calificaciones)
    const bloques = [
      {
        titulo: "Presentación del proceso de implementación de la propuesta educativa.",
        subtext: "Marco contextual y nudo problemático.\nPropuesta educativa elaborada por el ECTG, respondiendo al nudo problemático.\nProceso de implementación de la propuesta educativa.\nResultados alcanzados.",
        key: "c1"
      },
      {
        titulo: "Sustentación del Trabajo de Grado.",
        subtext: "• Sustentación de la propuesta educativa y los resultados alcanzados.\n• Proceso de diálogo y reflexión realizado en el marco de la Sistematización.\n• Conocimientos construidos a partir de la sistematización realizada. Aspectos que mejoraron en la propuesta educativa inicial.",
        key: "c2"
      },
      {
        titulo: "Controversia y argumentación",
        subtext: "• Responde con claridad y coherencia a las preguntas planteadas por la comisión de evaluación.",
        key: "c3"
      }
    ];

    bloques.forEach((b) => {
      const bTopY = cursorY;
      const titleLines = wrapText(b.titulo, fontBold, 8, colW[0] - 8);
      const subLines = b.subtext.split('\n').flatMap(line => wrapText(line, font, 7.5, colW[0] - 8));

      const totalLinesH = (titleLines.length * 9.5) + (subLines.length * 8.5) + 10;
      const blockH = Math.max(55, totalLinesH);

      hLine(page, MARGIN_LEFT, RIGHT_X, bTopY - blockH);

      let yText = bTopY - 11;
      titleLines.forEach(l => {
        page.drawText(l, { x: cX[0] + 4, y: yText, size: 8, font: fontBold, color: COLOR_TEXT });
        yText -= 9.5;
      });

      subLines.forEach(l => {
        page.drawText(l, { x: cX[0] + 4, y: yText, size: 7.5, font, color: COLOR_TEXT });
        yText -= 8.5;
      });

      // Extraer calificación de cada integrante (soporta calificaciones.c1 o c1 directo)
      for (let i = 1; i <= 3; i++) {
        const m = integrantes[i - 1] || {};
        const califs = m.calificaciones || {};
        const valNota = formatEnteroEstricto(califs[b.key] !== undefined ? califs[b.key] : m[b.key]);
        const wVal = fontBold.widthOfTextAtSize(valNota, 8.5);
        page.drawText(valNota, { x: cX[i] + (colW[i] / 2) - (wVal / 2), y: bTopY - (blockH / 2) - 3, size: 8.5, font: fontBold, color: COLOR_TEXT });
      }

      for (let c = 0; c < cX.length; c++) vLine(page, cX[c], bTopY, bTopY - blockH);

      cursorY -= blockH;
    });

    // FILA TOTAL
    const rowTotH = 16;
    hLine(page, MARGIN_LEFT, RIGHT_X, cursorY - rowTotH);

    const txtTot = "TOTAL";
    page.drawText(txtTot, { x: cX[0] + colW[0] - fontBold.widthOfTextAtSize(txtTot, 8.5) - 10, y: cursorY - 11, size: 8.5, font: fontBold, color: COLOR_TEXT });

    for (let i = 1; i <= 3; i++) {
      const m = integrantes[i - 1] || {};
      const totVal = formatEnteroEstricto(m.promedio_numeral !== undefined ? m.promedio_numeral : m.total);
      const wTot = fontBold.widthOfTextAtSize(totVal, 8.5);
      page.drawText(totVal, { x: cX[i] + (colW[i] / 2) - (wTot / 2), y: cursorY - 11, size: 8.5, font: fontBold, color: COLOR_TEXT });
    }

    for (let c = 0; c < cX.length; c++) vLine(page, cX[c], cursorY, cursorY - rowTotH);

    cursorY -= rowTotH + 20;

    // LUGAR Y FECHA CENTRADO DINÁMICAMENTE CON LÍNEA PUNTEADA EXACTA
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
    drawDottedLine(page, startX_LF + wLabelLF, startX_LF + totalLFWidth, cursorY - 2);

    cursorY -= 35;

    // FIRMAS DE LA COMISIÓN DE EVALUACIÓN (4 FIRMAS DISTRIBUIDAS)
    const sigColWidth = CONTENT_WIDTH / 4;
    const sigLineW = 95;

    const firmas = [
      { label: "Veedor/a", xCenter: MARGIN_LEFT + sigColWidth * 0.5 },
      { label: "Relator/a", xCenter: MARGIN_LEFT + sigColWidth * 1.5 },
      { label: "Secretario/a", xCenter: MARGIN_LEFT + sigColWidth * 2.5 },
      { label: "Presidente/a", xCenter: MARGIN_LEFT + sigColWidth * 3.5 }
    ];

    firmas.forEach((f) => {
      const lineStartX = f.xCenter - sigLineW / 2;
      const lineEndX = f.xCenter + sigLineW / 2;

      drawDottedLine(page, lineStartX, lineEndX, cursorY);

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
    console.error("Error al generar PDF de la Ficha C-2 (5to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};