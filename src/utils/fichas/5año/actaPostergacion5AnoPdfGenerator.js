import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { actaPostergacion5toAnoService } from '../../../services/fichas/5año/actaPostergacion5toAnoService';
import { userService } from '../../../services/userService';

// PALETA DE COLORES INSTITUCIONALES (AZUL INSTITUCIONAL - 5TO AÑO)
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_TITLE = rgb(0 / 255, 114 / 255, 187 / 255);             // Azul (#0072BB)
const COLOR_HEADER_BG = rgb(0 / 255, 114 / 255, 187 / 255);          // Azul (#0072BB)
const COLOR_BORDER = rgb(0 / 255, 114 / 255, 187 / 255);          // Borde Azul (#0072BB)

const BORDER = 0.8;

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

export const imprimirActaPostergacion5toAno = async (estudianteId) => {
  try {
    const response = await actaPostergacion5toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para el Acta de Postergación."
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

    const integrantes = Array.isArray(d.estudiantes_ectg)
      ? d.estudiantes_ectg
      : (typeof d.estudiantes_ectg === 'string' ? JSON.parse(d.estudiantes_ectg) : []);

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
    const maxLineRight = pageWidth - MARGIN_RIGHT; // Margen derecho estricto de rincón a rincón

    let cursorY = pageHeight - MARGIN_TOP;

    // HELPER DE DATOS REFERENCIALES DE RINCÓN A RINCÓN (ETIQUETA NORMAL, VALOR EN NEGRITA)
    const drawFullReferentialField = (label, value) => {
      page.drawText(label, { x: MARGIN_LEFT, y: cursorY, size: 8, font, color: COLOR_TEXT });
      const labelW = font.widthOfTextAtSize(label, 8);
      const valX = MARGIN_LEFT + labelW;
      
      // Trazado de rincón a rincón
      drawDottedLine(page, valX, maxLineRight, cursorY - 2.5);

      const valText = (value && String(value).trim() !== "" ? value : "").toUpperCase();
      if (valText) {
        page.drawText(valText, { x: valX, y: cursorY, size: 8, font: fontBold, color: COLOR_TEXT });
      }

      cursorY -= 14;
    };

    // TÍTULO PRINCIPAL
    const title = "ACTA DE POSTERGACIÓN DE LA SOCIALIZACIÓN DEL TRABAJO DE GRADO";
    const wT = fontBold.widthOfTextAtSize(title, 11);
    page.drawText(title, { x: CONTENT_CENTER_X - wT / 2, y: cursorY, size: 11, font: fontBold, color: COLOR_TITLE });
    cursorY -= 20;

    // DATOS REFERENCIALES
    page.drawText("DATOS REFERENCIALES", { x: MARGIN_LEFT, y: cursorY, size: 8.5, font: fontBold, color: COLOR_TEXT });
    cursorY -= 14;

    // Docente Tutor/a Acompañante de Rincón a Rincón
    drawFullReferentialField("Docente Tutor/a Acompañante: ", docenteTutorNombre);

    // Modalidad de Graduación de Rincón a Rincón
    drawFullReferentialField("Modalidad de Graduación: ", d.modalidad_graduacion || "");

    // Título del Trabajo de Grado de Rincón a Rincón
    drawFullReferentialField("Título del Trabajo de Grado: ", d.titulo_trabajo_grado || "");

    cursorY -= 8;

    // TABLA DE INTEGRANTES DEL ECTG
    const colW1 = [20, 180, 165.65, 110];
    let cX1 = [MARGIN_LEFT];
    for (let i = 0; i < colW1.length; i++) cX1.push(cX1[i] + colW1[i]);

    const hECTGH = 16;
    fillRect(page, MARGIN_LEFT, cursorY, CONTENT_WIDTH, hECTGH, COLOR_HEADER_BG);
    hLine(page, MARGIN_LEFT, RIGHT_X, cursorY);
    hLine(page, MARGIN_LEFT, RIGHT_X, cursorY - hECTGH);

    page.drawText("Nº", { x: cX1[0] + 5, y: cursorY - 11, size: 7.5, font: fontBold, color: COLOR_WHITE });
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

    cursorY -= 15;

    // PÁRRAFO 1 - PRESENTACIÓN
    const tokensP1 = [
      ...plainTokens("En la ciudad de: ", font),
      ...underlineTokens(d.lugar_ciudad || "El Alto", fontBold),
      ...plainTokens(" en ambientes de la ESFM/UA: ", font),
      ...underlineTokens(d.ambientes || "Instalaciones de la ESFM/UA", fontBold),
      ...plainTokens(", a los ", font),
      ...underlineTokens(d.dia_post || String(new Date().getDate()), fontBold),
      ...plainTokens(" días del mes de ", font),
      ...underlineTokens(d.mes_post || "SEPTIEMBRE", fontBold),
      ...plainTokens(", se presentó el Equipo Comunitario de Trabajo de Grado, descrito previamente, a efectos de socializar su Trabajo de Final de Grado, titulado: ", font),
      ...underlineTokens(d.titulo_trabajo_titulado || d.titulo_trabajo_grado || "", fontBold)
    ];

    cursorY = drawJustifiedParagraph(page, tokensP1, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 8.5,
      lineHeight: 12,
      spaceFont: font
    });

    cursorY -= 8;

    // PÁRRAFO 2 - MOTIVOS DE POSTERGACIÓN
    const tokensP2 = [
      ...plainTokens("Sin embargo, por los motivos que a continuación se describen, la presente Comisión Comunitaria de Evaluación, procedió a postergar el desarrollo de la Socialización del Trabajo Final de Grado: ", font),
      ...underlineTokens(d.motivos_postergacion || "", fontBold)
    ];

    cursorY = drawJustifiedParagraph(page, tokensP2, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 8.5,
      lineHeight: 12,
      spaceFont: font
    });

    cursorY -= 8;

    // PÁRRAFO 3 - RESOLUCIÓN Y NUEVA FECHA
    const tokensP3 = [
      ...plainTokens("Conforme a lo expuesto, la presente Comisión Comunitaria de Evaluación resuelve postergar al/los estudiante(s): ", font),
      ...underlineTokens(d.estudiantes_posterga || d.estudiante_nombre || "", fontBold),
      ...plainTokens(" para el desarrollo de la socialización de su Trabajo Final de Grado, el día ", font),
      ...underlineTokens(d.nueva_fecha_dia || ".....", fontBold),
      ...plainTokens(", del mes ", font),
      ...underlineTokens(d.nueva_fecha_mes || "SEPTIEMBRE", fontBold),
      ...plainTokens(" del año en curso, quedando bajo responsabilidad del o los postergado(s) tomar las previsiones correspondientes.", font)
    ];

    cursorY = drawJustifiedParagraph(page, tokensP3, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 8.5,
      lineHeight: 12,
      spaceFont: font
    });

    cursorY -= 12;

    // NOTA DE REGÍSTRESE
    page.drawText("Regístrese, comuníquese y archívese.", { x: MARGIN_LEFT, y: cursorY, size: 8.5, font, color: COLOR_TEXT });
    cursorY -= 20;

    // LUGAR Y FECHA CENTRADO DINÁMICAMENTE CON LÍNEA PUNTEADA SEPARADA (-2.5pt)
    const ciudad = d.lugar_ciudad || "El Alto";
    const dia = d.dia || "22";
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

    cursorY -= 40;

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

    cursorY -= 35;

    // NOTAS Y PIE DE PÁGINA FINAL (IZQUIERDA)
    const notasPie = [
      "Nota: Cualquier enmienda o raspadura invalida el presente documento",
      "Original: Estudiante",
      "Original: Archivo de Coordinación Académica de IEPC-PEC",
      "Copia: File personal Unidad de Archivo y Kardex."
    ];

    notasPie.forEach((np, idx) => {
      const isBold = idx === 0;
      page.drawText(np, {
        x: MARGIN_LEFT,
        y: cursorY,
        size: 6.5,
        font: isBold ? fontBold : font,
        color: COLOR_TEXT
      });
      cursorY -= 8;
    });

    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, '_blank');
    return { success: true };

  } catch (error) {
    console.error("Error al generar PDF del Acta de Postergación (5to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};