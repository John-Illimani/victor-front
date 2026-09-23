import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { actaFinalEvaluacion4toAnoService } from '../../../services/fichas/4año/actaFinalEvaluacion4toAnoService';

// PALETA DE COLORES INSTITUCIONALES Y TÉCNICOS
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);            // Dorado Institucional (#C9A751)
const COLOR_TABLE_HEADER = rgb(178 / 255, 34 / 255, 34 / 255);       // Rojo Guindo Institucional (#B22222)
const COLOR_BORDER = rgb(0, 0, 0);

const BORDER = 0.8;

// Helpers para Tokenización (Texto Fijo vs Texto Rellenado con línea punteada)
const plainTokens = (text, font, color) =>
  String(text ?? '').split(/\s+/).filter(Boolean).map((w) => ({ text: w, font, color }));

const underlineTokens = (text, font, color) =>
  String(text ?? '').split(/\s+/).filter(Boolean).map((w) => ({ text: w, font, color, underline: true }));

// FUNCIÓN DE JUSTIFICACIÓN POR TOKENS EXACTA (CON LÍNEA PUNTEADA BAJO DATOS DINÁMICOS)
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

      // Trazado de línea punteada exactamente debajo de la palabra rellenada dinámicamente
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

export const imprimirActaFinal4toAno = async (estudianteId) => {
  try {
    const response = await actaFinalEvaluacion4toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para el Acta Final."
      };
    }

    const d = response.datos;
    const integrantes = Array.isArray(d.integrantes) ? d.integrantes : [];

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

    // DIMENSIONES Y MÁRGENES ESTRICTOS SOLICITADOS
    const MARGIN_TOP = 141.73;          // 5.0 cm exactos (141.73 pt)
    const MARGIN_LEFT = 85.04;          // 3.0 cm exactos (85.04 pt)
    const MARGIN_RIGHT = 51.31;         // 1.81 cm exactos (51.31 pt)
    const MARGIN_BOTTOM = 141.73;       // 5.0 cm límite inferior de seguridad
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt exactos
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // 1. TÍTULOS PRINCIPALES (13 pt Bold, Dorado Institucional)
    const title1 = "ACTA FINAL DEL PROCESO DE EVALUACIÓN DEL DISEÑO METODOLÓGICO";
    const title2 = "DE IMPLEMENTACIÓN DEL TRABAJO DE GRADO";

    const wT1 = fontBold.widthOfTextAtSize(title1, 12);
    page.drawText(title1, { x: CONTENT_CENTER_X - wT1 / 2, y: cursorY, size: 12, font: fontBold, color: COLOR_TITLE });
    cursorY -= 15;

    const wT2 = fontBold.widthOfTextAtSize(title2, 12);
    page.drawText(title2, { x: CONTENT_CENTER_X - wT2 / 2, y: cursorY, size: 12, font: fontBold, color: COLOR_TITLE });
    cursorY -= 20;

    // 2. PRIMER PÁRRAFO JUSTIFICADO CON TOKENS DINÁMICOS Y LÍNEAS PUNTEADAS
    const esfmUa = d.esfm_ua || "ESFM Simón Bolívar / UA El Alto";
    const ciudadActa = d.lugar_ciudad || "El Alto";
    const horaActa = d.hora_acta || "08:00";
    const diaActa = d.dia_acta || "21";
    const mesActa = d.mes_acta || "septiembre";
    const anoActa = String(d.ano_acta || "2026").slice(0, 4);
    const tituloDiseno = d.titulo_diseno || "45";
    const modalidadGrad = d.modalidad_graduacion || "Investigación Educativa Producción de Conocimientos";

    const p1Tokens = [
      ...plainTokens("En la ESFM/UA", font),
      ...underlineTokens(`"${esfmUa}"`, fontBold),
      ...plainTokens("de la ciudad de", font),
      ...underlineTokens(`${ciudadActa},`, fontBold),
      ...plainTokens("a horas", font),
      ...underlineTokens(horaActa, fontBold),
      ...plainTokens("del día", font),
      ...underlineTokens(diaActa, fontBold),
      ...plainTokens("del mes de", font),
      ...underlineTokens(mesActa, fontBold),
      ...plainTokens("de", font),
      ...underlineTokens(`${anoActa}.`, fontBold),
      ...plainTokens("De acuerdo al Reglamento de Trabajo de Grado de Formación Inicial de Maestros/as (R.M. N° 2938/2017) y el Protocolo de Evaluación establecido, se constituyó la Comisión Comunitaria de Evaluación de la Socialización Comunitaria Pública, con la finalidad de evaluar la Exposición Grupal del Diseño Metodológico de Implementación de Trabajo de Grado titulado:", font),
    ];

    cursorY = drawJustifiedParagraph(page, p1Tokens, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 8.5,
      lineHeight: 13,
      spaceFont: font,
    });

    cursorY -= 10;

    // Título del diseño destacado, centrado y con línea punteada
    const titleLines = wrapText(`"${tituloDiseno}"`, fontBold, 9.5, CONTENT_WIDTH - 20);
    titleLines.forEach(line => {
      const wTL = fontBold.widthOfTextAtSize(line, 9.5);
      const textX = CONTENT_CENTER_X - wTL / 2;
      page.drawText(line, { x: textX, y: cursorY, size: 9.5, font: fontBold, color: COLOR_TEXT });
      drawDottedLine(page, textX, textX + wTL, cursorY - 2);
      cursorY -= 14;
    });

    cursorY -= 6;

    // PÁRRAFO DE MODALIDAD CON TOKENS DINÁMICOS
    const p2Tokens = [
      ...plainTokens("De la Modalidad:", font),
      ...underlineTokens(`${modalidadGrad}.`, fontBold),
    ];

    cursorY = drawJustifiedParagraph(page, p2Tokens, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 8.5,
      lineHeight: 13,
      spaceFont: font,
    });

    cursorY -= 10;

    // TERCER PÁRRAFO JUSTIFICADO
    const p3Text = "Los miembros del Equipo Comunitario de Trabajo de Grado (ECTG), luego de la exposición grupal del Diseño Metodológico de Implementación de Trabajo de Grado, conforme a la modalidad de graduación optada, respondieron a las preguntas y escucharon las observaciones y sugerencias efectuadas por la Comisión Comunitaria de Evaluación de la Socialización (CCES). Posteriormente, en sesión reservada, se valoró la exposición grupal realizada, emitiéndose así el Informe de Evaluación de la misma. Concluida dicha etapa y con base en la calificación emitida por la/el Docente Acompañante del Diseño Metodológico de Implementación de Trabajo de Grado (Documento) y la calificación emitida por la Comisión de Evaluación de la Socialización Comunitaria (Exposición Grupal), se reinstaló la sesión para dar lectura al puntaje asignado a cada miembro del Equipo Comunitario de Trabajo de Grado, cuyo detalle se presenta a continuación:";
    
    cursorY = drawJustifiedParagraph(page, plainTokens(p3Text, font), {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 8.5,
      lineHeight: 13,
      spaceFont: font,
    });

    cursorY -= 12;

    // Control preventivo de salto de página si la tabla no cabe
    if (cursorY < MARGIN_BOTTOM + 120) {
      page = pdfDoc.addPage([612, 792]);
      cursorY = pageHeight - MARGIN_TOP;
    }

    // 3. TABLA DE CALIFICACIONES FINALES (Ancho exacto 475.65 pt con 7 columnas)[cite: 16]
    const colW = [25, 60, 155.65, 55, 65, 55, 60];
    let cX = [MARGIN_LEFT];
    for (let i = 0; i < colW.length; i++) {
      cX.push(cX[i] + colW[i]);
    }

    const tableTop = cursorY;
    const tableHeaderH = 36;

    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, tableHeaderH, COLOR_TABLE_HEADER);
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop - tableHeaderH);

    // Encabezado principal superior ("PUNTAJE FINAL" centrado y un poco más arriba)
    const puntajeFinalHeaderX = cX[3];
    const puntajeFinalHeaderW = colW[3] + colW[4] + colW[5];
    const wPuntajeText = fontBold.widthOfTextAtSize("PUNTAJE FINAL", 7.5);
    page.drawText("PUNTAJE FINAL", { 
      x: puntajeFinalHeaderX + (puntajeFinalHeaderW / 2) - (wPuntajeText / 2), 
      y: tableTop - 9, 
      size: 7.5, 
      font: fontBold, 
      color: COLOR_WHITE 
    });

    // Subtítulos de celdas simples (No., C.I., NOMBRES Y APELLIDOS, Promedio) centrados verticalmente y más arriba
    const wNo = fontBold.widthOfTextAtSize("No.", 7);
    page.drawText("No.", { x: cX[0] + (colW[0] / 2) - (wNo / 2), y: tableTop - 24, size: 7, font: fontBold, color: COLOR_WHITE });

    const wCI = fontBold.widthOfTextAtSize("C.I.", 7);
    page.drawText("C.I.", { x: cX[1] + (colW[1] / 2) - (wCI / 2), y: tableTop - 24, size: 7, font: fontBold, color: COLOR_WHITE });

    const wNom = fontBold.widthOfTextAtSize("NOMBRES Y APELLIDOS", 7);
    page.drawText("NOMBRES Y APELLIDOS", { x: cX[2] + (colW[2] / 2) - (wNom / 2), y: tableTop - 24, size: 7, font: fontBold, color: COLOR_WHITE });

    const wProm = fontBold.widthOfTextAtSize("Promedio", 7);
    page.drawText("Promedio", { x: cX[5] + (colW[5] / 2) - (wProm / 2), y: tableTop - 24, size: 7, font: fontBold, color: COLOR_WHITE });

    // Subtítulos de las subcolumnas de PUNTAJE FINAL (Doc. Diseño, Socializa Comunitaria) más arriba
    const wDocD = fontBold.widthOfTextAtSize("Doc. Diseño", 6.5);
    page.drawText("Doc. Diseño", { x: cX[3] + (colW[3] / 2) - (wDocD / 2), y: tableTop - 24, size: 6.5, font: fontBold, color: COLOR_WHITE });

    const wSocC = fontBold.widthOfTextAtSize("Socializa", 6.5);
    page.drawText("Socializa", { x: cX[4] + (colW[4] / 2) - (wSocC / 2), y: tableTop - 21, size: 6.5, font: fontBold, color: COLOR_WHITE });
    const wSocC2 = fontBold.widthOfTextAtSize("Comunitaria", 6.5);
    page.drawText("Comunitaria", { x: cX[4] + (colW[4] / 2) - (wSocC2 / 2), y: tableTop - 29, size: 6.5, font: fontBold, color: COLOR_WHITE });

    // Subtítulos de Resultado (Aprobado/reprobado) más arriba
    const wRes1 = fontBold.widthOfTextAtSize("Resultado", 6.5);
    page.drawText("Resultado", { x: cX[6] + (colW[6] / 2) - (wRes1 / 2), y: tableTop - 18, size: 6.5, font: fontBold, color: COLOR_WHITE });
    const wRes2 = fontBold.widthOfTextAtSize("(Aprobado/", 6);
    page.drawText("(Aprobado/", { x: cX[6] + (colW[6] / 2) - (wRes2 / 2), y: tableTop - 25, size: 6, font: fontBold, color: COLOR_WHITE });
    const wRes3 = fontBold.widthOfTextAtSize("reprobado)", 6);
    page.drawText("reprobado)", { x: cX[6] + (colW[6] / 2) - (wRes3 / 2), y: tableTop - 30, size: 6, font: fontBold, color: COLOR_WHITE });

    hLine(page, cX[3], cX[6], tableTop - 15);
    

    for (let c = 0; c < cX.length; c++) {
      // Evitar que las líneas verticales de las subcolumnas corten el título superior "PUNTAJE FINAL"
      const vTop = (c === 4 || c === 5) ? tableTop - 15 : tableTop;
      vLine(page, cX[c], vTop, tableTop - tableHeaderH);
    }

    let currentY = tableTop - tableHeaderH;

    // Filas de Integrantes[cite: 16]
    const rowH = 20;
    integrantes.forEach((est, idx) => {
      hLine(page, MARGIN_LEFT, RIGHT_X, currentY - rowH);

      const numStr = String(idx + 1);
      const ciStr = String(est.ci || "");
      const nomStr = String(est.nombres || est.nombre_apellido || "");
      const notaDoc = est.nota_diseno !== undefined ? String(Math.round(parseFloat(est.nota_diseno) || 0)) : (est.nota_documento !== undefined ? String(Math.round(parseFloat(est.nota_documento) || 0)) : "");
      const notaSoc = est.nota_socializacion !== undefined ? String(Math.round(parseFloat(est.nota_socializacion) || 0)) : "";
      const promedio = est.promedio !== undefined ? String(Math.round(parseFloat(est.promedio) || 0)) : (est.promedio_numeral !== undefined ? String(Math.round(parseFloat(est.promedio_numeral) || 0)) : "");
      const resultado = String(est.resultado || "Aprobado");

      page.drawText(numStr, { x: cX[0] + 8, y: currentY - 13, size: 7.5, font, color: COLOR_TEXT });
      page.drawText(ciStr, { x: cX[1] + 4, y: currentY - 13, size: 7.5, font, color: COLOR_TEXT });
      
      const nomLines = wrapText(nomStr, font, 7.5, colW[2] - 8);
      if (nomLines.length > 0) {
        page.drawText(nomLines[0], { x: cX[2] + 4, y: currentY - 13, size: 7.5, font, color: COLOR_TEXT });
      }

      page.drawText(notaDoc, { x: cX[3] + (colW[3] / 2) - 4, y: currentY - 13, size: 7.5, font, color: COLOR_TEXT });
      page.drawText(notaSoc, { x: cX[4] + (colW[4] / 2) - 4, y: currentY - 13, size: 7.5, font, color: COLOR_TEXT });
      page.drawText(promedio, { x: cX[5] + (colW[5] / 2) - 4, y: currentY - 13, size: 7.5, font, color: COLOR_TEXT });
      
      const wRes = font.widthOfTextAtSize(resultado, 7.5);
      page.drawText(resultado, { x: cX[6] + (colW[6] / 2) - (wRes / 2), y: currentY - 13, size: 7.5, font, color: COLOR_TEXT });

      for (let c = 0; c < cX.length; c++) {
        vLine(page, cX[c], currentY, currentY - rowH);
      }

      currentY -= rowH;
    });

    if (integrantes.length === 0) {
      for (let i = 1; i <= 2; i++) {
        hLine(page, MARGIN_LEFT, RIGHT_X, currentY - rowH);
        page.drawText(String(i), { x: cX[0] + 8, y: currentY - 13, size: 7.5, font, color: COLOR_TEXT });

        for (let c = 0; c < cX.length; c++) {
          vLine(page, cX[c], currentY, currentY - rowH);
        }
        currentY -= rowH;
      }
    }

    currentY -= 15;

    // Control preventivo antes de la leyenda final y firmas[cite: 16]
    if (currentY < MARGIN_BOTTOM + 90) {
      page = pdfDoc.addPage([612, 792]);
      currentY = pageHeight - MARGIN_TOP;
    }

    // Párrafo de cierre[cite: 16]
    const cierreText = "En fe de lo cual se levanta el acta para fines consiguientes.";
    page.drawText(cierreText, { x: MARGIN_LEFT, y: currentY, size: 8.5, font, color: COLOR_TEXT });

    currentY -= 30;

    // 4. LUGAR Y FECHA CENTRADO DINÁMICAMENTE CON LÍNEA PUNTEADA (Valores en Negrita)[cite: 16]
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

    page.drawText(txtLugarLabel, { x: startX_LF, y: currentY, size: 8.5, font, color: COLOR_TEXT });
    page.drawText(txtLugarValor, { x: startX_LF + wLabelLF, y: currentY, size: 8.5, font: fontBold, color: COLOR_TEXT });
    drawDottedLine(page, startX_LF + wLabelLF, startX_LF + totalLFWidth, currentY - 2);

    currentY -= 45;

    // Control preventivo si las firmas superan el margen inferior[cite: 16]
    if (currentY < MARGIN_BOTTOM) {
      page = pdfDoc.addPage([612, 792]);
      currentY = pageHeight - MARGIN_TOP - 20;
    }

    // 5. BLOQUE DE FIRMAS INFERIORES (Presidenta/e, Secretaria/o, Relator/a, Veedor/a)[cite: 16]
    const sigColWidth = CONTENT_WIDTH / 4;
    const sigLineW = 90;

    const firmas = [
      { label: "Firma Presidenta/e", xCenter: MARGIN_LEFT + sigColWidth * 0.5 },
      { label: "Firma Secretaria/o", xCenter: MARGIN_LEFT + sigColWidth * 1.5 },
      { label: "Firma Relator/a", xCenter: MARGIN_LEFT + sigColWidth * 2.5 },
      { label: "Firma Veedor/a", xCenter: MARGIN_LEFT + sigColWidth * 3.5 }
    ];

    firmas.forEach((f) => {
      const lineStartX = f.xCenter - sigLineW / 2;
      const lineEndX = f.xCenter + sigLineW / 2;

      drawDottedLine(page, lineStartX, lineEndX, currentY);

      const wL = fontBold.widthOfTextAtSize(f.label, 8);
      page.drawText(f.label, {
        x: f.xCenter - wL / 2,
        y: currentY - 11,
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
    console.error("Error al generar PDF del Acta Final (4to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};