import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { actaPostergacion4toAnoService } from '../../../services/fichas/4año/actaPostergacion4toAnoService';
import { userService } from '../../../services/userService';

// PALETA DE COLORES INSTITUCIONALES Y TÉCNICOS
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);            // Dorado (#C9A751)
const COLOR_TABLE_HEADER = rgb(178 / 255, 34 / 255, 34 / 255);       // Rojo Guindo (#B22222)
const COLOR_BORDER = rgb(0, 0, 0);

const BORDER = 0.8;

// Helpers para Tokenización (Texto Fijo vs Texto Rellenado con línea punteada)
const plainTokens = (text, font, color) =>
  String(text ?? '').split(/\s+/).filter(Boolean).map((w) => ({ text: w, font, color }));

const underlineTokens = (text, font, color) =>
  String(text ?? '').split(/\s+/).filter(Boolean).map((w) => ({ text: w, font, color, underline: true }));

// FUNCIÓN DE JUSTIFICACIÓN POR TOKENS EXACTA
function drawJustifiedParagraph(page, tokens, { x, y, maxWidth, fontSize, lineHeight, spaceFont }) {
  const spaceWidth = spaceFont.widthOfTextAtSize(' ', fontSize);

  const lines = [];
  let current = [];
  let currentWidth = 0;

  tokens.forEach((token) => {
    const wordWidth = token.font.widthOfTextAtSize(token.text, fontSize);
    const extra = current.length > 0 ? spaceWidth : 0;
    if (currentWidth + extra + wordWidth > maxWidth && current.length > 0) {
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
    const isLastLine = i === lines.length - 1;
    const wordsWidth = line.reduce((sum, t) => sum + t.font.widthOfTextAtSize(t.text, fontSize), 0);
    const gaps = line.length - 1;
    const gapWidth = !isLastLine && gaps > 0
      ? (maxWidth - wordsWidth) / gaps
      : spaceWidth;

    let cursorX = x;
    line.forEach((token) => {
      const wordW = token.font.widthOfTextAtSize(token.text, fontSize);
      page.drawText(token.text, {
        x: cursorX,
        y: cursorY,
        size: fontSize,
        font: token.font,
        color: token.color || COLOR_TEXT,
      });

      // Trazado de línea punteada exactamente debajo de la palabra rellenada
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

export const imprimirActaPostergacion4toAno = async (estudianteId) => {
  try {
    const response = await actaPostergacion4toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para el Acta de Postergación."
      };
    }

    const d = response.datos;
    const integrantes = Array.isArray(d.estudiantes_ectg) ? d.estudiantes_ectg : [];

    // OBTENER Y MAPEAR EL NOMBRE DEL TUTOR DESDE LA API DE USUARIOS
    let tutorNombre = "";
    if (d.docente_tutor_id) {
      try {
        const usuariosRes = await userService.getUsers();
        const listaUsuarios = Array.isArray(usuariosRes) ? usuariosRes : (usuariosRes.datos || []);
        const tutorObj = listaUsuarios.find(u => String(u.id) === String(d.docente_tutor_id));
        if (tutorObj) {
          tutorNombre = `${tutorObj.nombre || ''} ${tutorObj.apellido || ''}`.trim().toUpperCase();
        }
      } catch (err) {
        console.warn("No se pudo obtener la lista de usuarios para el tutor:", err);
      }
    }

    const urlPlantilla = encodeURI('/pdf/4año/plantilla.pdf');
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

    // DIMENSIONES Y MÁRGENES ESTRICTOS
    const MARGIN_TOP = 141.73;          // 5.0 cm exactos (141.73 pt)
    const MARGIN_LEFT = 85.04;          // 3.0 cm exactos (85.04 pt)
    const MARGIN_RIGHT = 51.31;         // 1.81 cm exactos (51.31 pt)
    const MARGIN_BOTTOM = 141.73;       // 5.0 cm límite inferior de seguridad
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt exactos
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // 1. TÍTULOS PRINCIPALES (13 pt Bold, Dorado Institucional)
    const title1 = "ACTA DE POSTERGACIÓN";
    const title2 = "DE LA SOCIALIZACIÓN ORAL DEL DISEÑO METODOLÓGICO";

    const wT1 = fontBold.widthOfTextAtSize(title1, 12);
    page.drawText(title1, { x: CONTENT_CENTER_X - wT1 / 2, y: cursorY, size: 12, font: fontBold, color: COLOR_TITLE });
    cursorY -= 15;

    const wT2 = fontBold.widthOfTextAtSize(title2, 12);
    page.drawText(title2, { x: CONTENT_CENTER_X - wT2 / 2, y: cursorY, size: 12, font: fontBold, color: COLOR_TITLE });
    cursorY -= 20;

    // 2. ENCABEZADOS SUPERIORES
    const modalidadGrad = d.modalidad_graduacion || "Investigación Educativa Producción de Conocimientos";
    const tituloDiseno = d.titulo_diseno || "";

    const lblTutor = "Docente Tutor/a Acompañante: ";
    const wLblTutor = font.widthOfTextAtSize(lblTutor, 8.5);
    page.drawText(lblTutor, { x: MARGIN_LEFT, y: cursorY, size: 8.5, font, color: COLOR_TEXT });
    page.drawText(tutorNombre, { x: MARGIN_LEFT + wLblTutor, y: cursorY, size: 8.5, font: fontBold, color: COLOR_TEXT });
    drawDottedLine(page, MARGIN_LEFT + wLblTutor, RIGHT_X, cursorY - 2);
    cursorY -= 15;

    const lblMod = "Modalidad de Graduación: ";
    const wLblMod = font.widthOfTextAtSize(lblMod, 8.5);
    page.drawText(lblMod, { x: MARGIN_LEFT, y: cursorY, size: 8.5, font, color: COLOR_TEXT });
    page.drawText(modalidadGrad, { x: MARGIN_LEFT + wLblMod, y: cursorY, size: 8.5, font: fontBold, color: COLOR_TEXT });
    drawDottedLine(page, MARGIN_LEFT + wLblMod, RIGHT_X, cursorY - 2);
    cursorY -= 15;

    const lblTit = "Título del Diseño Metodológico: ";
    const wLblTit = font.widthOfTextAtSize(lblTit, 8.5);
    page.drawText(lblTit, { x: MARGIN_LEFT, y: cursorY, size: 8.5, font, color: COLOR_TEXT });
    page.drawText(tituloDiseno, { x: MARGIN_LEFT + wLblTit, y: cursorY, size: 8.5, font: fontBold, color: COLOR_TEXT });
    drawDottedLine(page, MARGIN_LEFT + wLblTit, RIGHT_X, cursorY - 2);
    cursorY -= 20;

    // 3. TABLA DE INTEGRANTES (ECTG)
    const colW = [30, 215.65, 130, 100];
    let cX = [MARGIN_LEFT];
    for (let i = 0; i < colW.length; i++) {
      cX.push(cX[i] + colW[i]);
    }

    const tableTop = cursorY;
    const tableHeaderH = 22;

    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, tableHeaderH, COLOR_TABLE_HEADER);
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop - tableHeaderH);

    const headers = [
      { text: "N°", x: cX[0] + 10, y: tableTop - 14 },
      { text: "NOMBRES Y APELLIDOS", x: cX[1] + 50, y: tableTop - 14 },
      { text: "ESPECIALIDAD", x: cX[2] + 35, y: tableTop - 14 },
      { text: "MODALIDAD DE INGRESO", x: cX[3] + 10, y: tableTop - 14 }
    ];

    headers.forEach(h => {
      page.drawText(h.text, { x: h.x, y: h.y, size: 7.5, font: fontBold, color: COLOR_WHITE });
    });

    for (let c = 0; c < cX.length; c++) {
      vLine(page, cX[c], tableTop, tableTop - tableHeaderH);
    }

    let currentY = tableTop - tableHeaderH;
    const rowH = 18;

    integrantes.forEach((est, idx) => {
      hLine(page, MARGIN_LEFT, RIGHT_X, currentY - rowH);

      const numStr = String(idx + 1);
      const nomStr = String(est.nombres || est.apellidos_nombres || "");
      const espStr = String(est.especialidad || "");
      const modIng = String(est.modalidad_ingreso || "");

      page.drawText(numStr, { x: cX[0] + 10, y: currentY - 12, size: 7.5, font, color: COLOR_TEXT });
      
      const nomLines = wrapText(nomStr, font, 7.5, colW[1] - 8);
      if (nomLines.length > 0) {
        page.drawText(nomLines[0], { x: cX[1] + 4, y: currentY - 12, size: 7.5, font, color: COLOR_TEXT });
      }

      const espLines = wrapText(espStr, font, 7.5, colW[2] - 8);
      if (espLines.length > 0) {
        page.drawText(espLines[0], { x: cX[2] + 4, y: currentY - 12, size: 7.5, font, color: COLOR_TEXT });
      }

      const modLines = wrapText(modIng, font, 7.5, colW[3] - 8);
      if (modLines.length > 0) {
        page.drawText(modLines[0], { x: cX[3] + 4, y: currentY - 12, size: 7.5, font, color: COLOR_TEXT });
      }

      for (let c = 0; c < cX.length; c++) {
        vLine(page, cX[c], currentY, currentY - rowH);
      }

      currentY -= rowH;
    });

    if (integrantes.length === 0) {
      for (let i = 1; i <= 2; i++) {
        hLine(page, MARGIN_LEFT, RIGHT_X, currentY - rowH);
        page.drawText(String(i), { x: cX[0] + 10, y: currentY - 12, size: 7.5, font, color: COLOR_TEXT });

        for (let c = 0; c < cX.length; c++) {
          vLine(page, cX[c], currentY, currentY - rowH);
        }
        currentY -= rowH;
      }
    }

    cursorY = currentY - 15;

    // 4. PÁRRAFOS JUSTIFICADOS CON TOKENS DINÁMICOS
    const ciudadActa = d.lugar_ciudad || "El Alto";
    const horaPost = d.hora_presentacion || "08:00";
    const diaPost = d.dia_post || "21";
    const mesPost = d.mes_post || "septiembre";
    const anoPost = String(d.ano_post || "2026").slice(0, 4);
    const ambientes = d.ambientes || "Instalaciones de la ESFM/UA";
    const motivos = d.motivos_postergacion || "";
    const estudiantesPosterga = d.estudiantes_posterga || "";
    const nuevaDia = d.nueva_fecha_dia || "";
    const nuevaMes = d.nueva_fecha_mes || "septiembre";

    const p1Tokens = [
      ...plainTokens("En la ciudad de", font),
      ...underlineTokens(`${ciudadActa},`, fontBold),
      ...plainTokens("a horas", font),
      ...underlineTokens(horaPost, fontBold),
      ...plainTokens("a los", font),
      ...underlineTokens(diaPost, fontBold),
      ...plainTokens("del mes de", font),
      ...underlineTokens(mesPost, fontBold),
      ...plainTokens("del año", font),
      ...underlineTokens(`${anoPost},`, fontBold),
      ...plainTokens("en ambientes de la", font),
      ...underlineTokens(`${ambientes},`, fontBold),
      ...plainTokens("se presentó el Equipo Comunitario de Trabajo de Grado, descrito previamente, a efectos de socializar su Diseño Metodológico, titulado:", font),
    ];

    cursorY = drawJustifiedParagraph(page, p1Tokens, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 8.5,
      lineHeight: 12.5,
      spaceFont: font,
    });

    cursorY -= 8;

    // Título del diseño destacado y centrado
    const titleDesignLines = wrapText(`"${tituloDiseno}"`, fontBold, 9, CONTENT_WIDTH - 20);
    titleDesignLines.forEach(line => {
      const wTD = fontBold.widthOfTextAtSize(line, 9);
      const textX = CONTENT_CENTER_X - wTD / 2;
      page.drawText(line, { x: textX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
      drawDottedLine(page, textX, textX + wTD, cursorY - 2);
      cursorY -= 13;
    });

    cursorY -= 6;

    const p2Tokens = [
      ...plainTokens("Sin embargo, por los motivos que a continuación se describen,", font),
      ...underlineTokens(motivos, fontBold),
      ...plainTokens("la presente Comisión Comunitaria de Evaluación, procedió a postergar el desarrollo de la Socialización del Diseño Metodológico:", font),
    ];

    cursorY = drawJustifiedParagraph(page, p2Tokens, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 8.5,
      lineHeight: 12.5,
      spaceFont: font,
    });

    cursorY -= 10;

    const p3Tokens = [
      ...plainTokens("Conforme a lo expuesto, la presente Comisión Comunitaria de Evaluación resuelve postergar a el/los estudiante/s", font),
      ...underlineTokens(estudiantesPosterga, fontBold),
      ...plainTokens("el desarrollo de la socialización, para el día", font),
      ...underlineTokens(nuevaDia, fontBold),
      ...plainTokens("del mes de", font),
      ...underlineTokens(nuevaMes, fontBold),
      ...plainTokens("del año en curso, quedando bajo responsabilidad de el/los estudiantes/s del ECTG, tomar las previsiones correspondientes. Regístrese, comuníquese y archívese.", font),
    ];

    cursorY = drawJustifiedParagraph(page, p3Tokens, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 8.5,
      lineHeight: 12.5,
      spaceFont: font,
    });

    cursorY -= 20;

    // 5. LUGAR Y FECHA CENTRADO DINÁMICAMENTE
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

    cursorY -= 45;

    // 6. BLOQUE DE FIRMAS INFERIORES (Alineadas correctamente con cursorY)
    const sigColWidth = CONTENT_WIDTH / 4;
    const sigLineW = 90;

    const firmas = [
      { label: "Firma Presidente/a", xCenter: MARGIN_LEFT + sigColWidth * 0.5 },
      { label: "Firma Secretario/a", xCenter: MARGIN_LEFT + sigColWidth * 1.5 },
      { label: "Firma Relator/a", xCenter: MARGIN_LEFT + sigColWidth * 2.5 },
      { label: "Firma Veedor/a", xCenter: MARGIN_LEFT + sigColWidth * 3.5 }
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
    console.error("Error al generar PDF del Acta de Postergación (4to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};