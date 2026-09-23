import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { centralizador5toAnoService } from '../../../services/fichas/5año/centralizador5toAnoService';
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

export const imprimirCentralizador5toAno = async (estudianteId) => {
  try {
    const response = await centralizador5toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para el Centralizador de 5to Año."
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

    // DIMENSIONES Y MÁRGENES ESTRICTOS SOLICITADOS
    const MARGIN_TOP = 141.73;          
    const MARGIN_LEFT = 85.04;          
    const MARGIN_RIGHT = 51.31;         
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt exactos
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // TÍTULO PRINCIPAL
    const title = "FICHA CENTRALIZADORA DE EVALUACIÓN CUALITATIVA-CUANTITATIVA";
    const wT = fontBold.widthOfTextAtSize(title, 11);
    page.drawText(title, { x: CONTENT_CENTER_X - wT / 2, y: cursorY, size: 11, font: fontBold, color: COLOR_TITLE });
    cursorY -= 22;

    // DATOS REFERENCIALES
    page.drawText("DATOS REFERENCIALES", { x: MARGIN_LEFT, y: cursorY, size: 8.5, font: fontBold, color: COLOR_TEXT });
    cursorY -= 14;

    // Docente Tutor/a Acompañante
    const tokensTutor = [
      ...plainTokens("Docente Tutor/a Acompañante: ", font),
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
      ...plainTokens("Estudiante: ", font),
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
    cursorY -= 3;

    // Especialidad
    const tokensEsp = [
      ...plainTokens("Especialidad: ", font),
      ...underlineTokens(d.especialidad || "", fontBold)
    ];
    cursorY = drawJustifiedParagraph(page, tokensEsp, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 8,
      lineHeight: 11,
      spaceFont: font
    });

    cursorY -= 15;

    // TABLA CENTRALIZADORA
    // Reajuste de anchos: ETAPA (75), ACTIVIDAD (85), INDICADOR (180.65), INSTRUMENTO (85), PUNTAJE (50) = 475.65 pt
    const colW = [75, 85, 180.65, 85, 50];
    let cX = [MARGIN_LEFT];
    for (let i = 0; i < colW.length; i++) cX.push(cX[i] + colW[i]);

    // CABECERA SECCIÓN GENERAL
    const secTopY = cursorY;
    const secH = 16;
    fillRect(page, MARGIN_LEFT, secTopY, CONTENT_WIDTH, secH, COLOR_HEADER_BG);
    hLine(page, MARGIN_LEFT, RIGHT_X, secTopY);
    hLine(page, MARGIN_LEFT, RIGHT_X, secTopY - secH);

    const txtSecHeader = "EVALUACIÓN DE LA PEC";
    page.drawText(txtSecHeader, { x: CONTENT_CENTER_X - (fontBold.widthOfTextAtSize(txtSecHeader, 8.5) / 2), y: secTopY - 11, size: 8.5, font: fontBold, color: COLOR_WHITE });

    cursorY -= secH;

    // CABECERA COLUMNAS
    const headTopY = cursorY;
    const headH = 16;
    fillRect(page, MARGIN_LEFT, headTopY, CONTENT_WIDTH, headH, COLOR_HEADER_BG);
    hLine(page, MARGIN_LEFT, RIGHT_X, headTopY - headH);

    const headers = ["ETAPA", "ACTIVIDAD", "INDICADOR", "INSTRUMENTO", "PUNTAJE"];
    headers.forEach((hText, idx) => {
      const wH = fontBold.widthOfTextAtSize(hText, 7.5);
      page.drawText(hText, { x: cX[idx] + (colW[idx] / 2) - (wH / 2), y: headTopY - 11, size: 7.5, font: fontBold, color: COLOR_WHITE });
    });

    for (let c = 0; c < cX.length; c++) vLine(page, cX[c], secTopY, headTopY - headH);

    cursorY -= headH;

    // FILAS EVALUATIVAS DE PLANIFICACIÓN Y EJECUCIÓN
    const filasPec = [
      {
        etapa: "Planificación y Organización",
        etapaSpan: 1,
        actividad: "Elaboración de PDC",
        indicador: "PDC elaborado por cada integrante del ECTG. La elaboración es comunitaria, pero la valoración es individual, evitando copias y plagios de PDC entre los integrantes del ECTG",
        instrumento: "Ficha A-1",
        puntaje: formatEnteroEstricto(d.nota_a1)
      },
      {
        etapa: "Ejecución",
        etapaSpan: 4,
        actividad: "Asistencia regular",
        indicador: "Control de asistencia regular a la PEC. Se tomará en cuenta ausencias y atrasos.",
        instrumento: "Ficha B-1",
        puntaje: formatEnteroEstricto(d.nota_b1)
      },
      {
        etapa: "Ejecución",
        etapaSpan: 0,
        actividad: "Concreción Curricular",
        indicador: "Implementación individual de cada integrante del ECTG, de un mínimo de 9 PDCs y 1 Clase Comunitaria",
        instrumento: "Ficha Promedio Final B-4",
        puntaje: formatEnteroEstricto(d.nota_b4)
      },
      {
        etapa: "Ejecución",
        etapaSpan: 0,
        actividad: "Seguimiento",
        indicador: "- Apoyo y seguimiento por parte de la/el Docente Guía de la UE/CEA/CEE",
        instrumento: "Ficha B-5",
        puntaje: formatEnteroEstricto(d.nota_b5)
      },
      {
        etapa: "Ejecución",
        etapaSpan: 0,
        actividad: "Seguimiento",
        indicador: "- Apoyo y seguimiento por parte de/el Docente Acompañante",
        instrumento: "Ficha B-6",
        puntaje: formatEnteroEstricto(d.nota_b6)
      }
    ];

    let ejecYStart = 0;
    filasPec.forEach((f, idx) => {
      const indLines = wrapText(f.indicador, font, 7, colW[2] - 8);
      const actLines = wrapText(f.actividad, fontBold, 7.5, colW[1] - 8);
      const insLines = wrapText(f.instrumento, font, 7.5, colW[3] - 8);

      const rH = Math.max(24, indLines.length * 8 + 6, insLines.length * 8 + 6);
      const rowTopY = cursorY;

      if (idx === 1) ejecYStart = rowTopY;

      // SOLO dibuja la línea completa de extremo a extremo para la Fila 0 o la última fila
      // Para las filas internas de "Ejecución", la línea se dibuja sólo a partir de la columna ACTIVIDAD (cX[1])
      if (idx === 0 || idx === filasPec.length - 1) {
        hLine(page, MARGIN_LEFT, RIGHT_X, rowTopY - rH);
      } else {
        hLine(page, cX[1], RIGHT_X, rowTopY - rH);
      }

      // Etapa Planificación y Organización
      if (idx === 0) {
        const etLines = wrapText(f.etapa, fontBold, 7.5, colW[0] - 6);
        let yEt = rowTopY - (rH / 2) + ((etLines.length - 1) * 4);
        etLines.forEach(l => {
          page.drawText(l, { x: cX[0] + (colW[0] / 2) - (fontBold.widthOfTextAtSize(l, 7.5) / 2), y: yEt, size: 7.5, font: fontBold, color: COLOR_TEXT });
          yEt -= 8.5;
        });
      }

      // Actividad
      let yAct = rowTopY - (rH / 2) + ((actLines.length - 1) * 4);
      actLines.forEach(l => {
        page.drawText(l, { x: cX[1] + (colW[1] / 2) - (fontBold.widthOfTextAtSize(l, 7.5) / 2), y: yAct, size: 7.5, font: fontBold, color: COLOR_TEXT });
        yAct -= 8.5;
      });

      // Indicador
      let yInd = rowTopY - 9;
      indLines.forEach(l => {
        page.drawText(l, { x: cX[2] + 4, y: yInd, size: 7, font, color: COLOR_TEXT });
        yInd -= 8;
      });

      // Instrumento
      let yIns = rowTopY - (rH / 2) + ((insLines.length - 1) * 4);
      insLines.forEach(l => {
        page.drawText(l, { x: cX[3] + (colW[3] / 2) - (font.widthOfTextAtSize(l, 7.5) / 2), y: yIns, size: 7.5, font, color: COLOR_TEXT });
        yIns -= 8.5;
      });

      // Puntaje
      page.drawText(f.puntaje, { x: cX[4] + (colW[4] / 2) - (fontBold.widthOfTextAtSize(f.puntaje, 8) / 2), y: rowTopY - (rH / 2) - 3, size: 8, font: fontBold, color: COLOR_TEXT });

      for (let c = 1; c <= 5; c++) vLine(page, cX[c], rowTopY, rowTopY - rH);

      cursorY -= rH;
    });

    // Dibujar vertical unificada de la columna ETAPA
    vLine(page, cX[0], headTopY - headH, cursorY);
    vLine(page, cX[1], headTopY - headH, cursorY);

    const txtEjec = "Ejecución";
    page.drawText(txtEjec, { x: cX[0] + (colW[0] / 2) - (fontBold.widthOfTextAtSize(txtEjec, 8) / 2), y: ejecYStart - ((ejecYStart - cursorY) / 2) - 3, size: 8, font: fontBold, color: COLOR_TEXT });

    // CALIFICACIÓN PROMEDIO FINAL 1
    const prom1H = 16;
    hLine(page, MARGIN_LEFT, RIGHT_X, cursorY - prom1H);

    const txtProm1 = "CALIFICACIÓN PROMEDIO FINAL 1";
    page.drawText(txtProm1, { x: cX[3] - fontBold.widthOfTextAtSize(txtProm1, 8) - 10, y: cursorY - 11, size: 8, font: fontBold, color: COLOR_TEXT });

    const valProm1 = formatEnteroEstricto(d.promedio_final_1);
    page.drawText(valProm1, { x: cX[4] + (colW[4] / 2) - (fontBold.widthOfTextAtSize(valProm1, 8.5) / 2), y: cursorY - 11, size: 8.5, font: fontBold, color: COLOR_TEXT });

    vLine(page, cX[0], cursorY, cursorY - prom1H);
    vLine(page, cX[4], cursorY, cursorY - prom1H);
    vLine(page, cX[5], cursorY, cursorY - prom1H);

    cursorY -= prom1H;

    // SECCIÓN SOCIALIZACIÓN
    const filasSoc = [
      {
        actividad: "Elaboración del Trabajo de Grado",
        indicador: "Documento del Trabajo de Grado.",
        instrumento: "Ficha C-1",
        puntaje: formatEnteroEstricto(d.nota_c1)
      },
      {
        actividad: "Socialización Comunitaria.",
        indicador: "Socialización Comunitaria del Trabajo de Grado",
        instrumento: "Ficha C-2",
        puntaje: formatEnteroEstricto(d.nota_c2)
      }
    ];

    const socYStart = cursorY;
    filasSoc.forEach((f, idx) => {
      const indLines = wrapText(f.indicador, font, 7.5, colW[2] - 8);
      const actLines = wrapText(f.actividad, fontBold, 7.5, colW[1] - 8);

      const rH = Math.max(24, actLines.length * 8.5 + 8, indLines.length * 8.5 + 8);
      const rowTopY = cursorY;

      // SOLO dibuja la línea divisoria a partir de la columna ACTIVIDAD para no cortar la celda unificada "Socialización"
      if (idx === filasSoc.length - 1) {
        hLine(page, MARGIN_LEFT, RIGHT_X, rowTopY - rH);
      } else {
        hLine(page, cX[1], RIGHT_X, rowTopY - rH);
      }

      // Actividad
      let yAct = rowTopY - (rH / 2) + ((actLines.length - 1) * 4);
      actLines.forEach(l => {
        page.drawText(l, { x: cX[1] + 4, y: yAct, size: 7.5, font: fontBold, color: COLOR_TEXT });
        yAct -= 8.5;
      });

      // Indicador
      let yInd = rowTopY - (rH / 2) + ((indLines.length - 1) * 4);
      indLines.forEach(l => {
        page.drawText(l, { x: cX[2] + 4, y: yInd, size: 7.5, font, color: COLOR_TEXT });
        yInd -= 8.5;
      });

      // Instrumento
      page.drawText(f.instrumento, { x: cX[3] + (colW[3] / 2) - (font.widthOfTextAtSize(f.instrumento, 7.5) / 2), y: rowTopY - (rH / 2) - 3, size: 7.5, font, color: COLOR_TEXT });

      // Puntaje
      page.drawText(f.puntaje, { x: cX[4] + (colW[4] / 2) - (fontBold.widthOfTextAtSize(f.puntaje, 8) / 2), y: rowTopY - (rH / 2) - 3, size: 8, font: fontBold, color: COLOR_TEXT });

      for (let c = 1; c <= 5; c++) vLine(page, cX[c], rowTopY, rowTopY - rH);

      cursorY -= rH;
    });

    // Dibujar Etapa "Socialización" Unificada
    vLine(page, cX[0], socYStart, cursorY);
    const txtSoc = "Socialización";
    page.drawText(txtSoc, { x: cX[0] + (colW[0] / 2) - (fontBold.widthOfTextAtSize(txtSoc, 8) / 2), y: socYStart - ((socYStart - cursorY) / 2) - 3, size: 8, font: fontBold, color: COLOR_TEXT });

    // CALIFICACIÓN PROMEDIO FINAL 2
    const prom2H = 16;
    hLine(page, MARGIN_LEFT, RIGHT_X, cursorY - prom2H);

    const txtProm2 = "CALIFICACIÓN PROMEDIO FINAL 2";
    page.drawText(txtProm2, { x: cX[3] - fontBold.widthOfTextAtSize(txtProm2, 8) - 10, y: cursorY - 11, size: 8, font: fontBold, color: COLOR_TEXT });

    const valProm2 = formatEnteroEstricto(d.promedio_final_2);
    page.drawText(valProm2, { x: cX[4] + (colW[4] / 2) - (fontBold.widthOfTextAtSize(valProm2, 8.5) / 2), y: cursorY - 11, size: 8.5, font: fontBold, color: COLOR_TEXT });

    vLine(page, cX[0], cursorY, cursorY - prom2H);
    vLine(page, cX[4], cursorY, cursorY - prom2H);
    vLine(page, cX[5], cursorY, cursorY - prom2H);

    cursorY -= prom2H;

    // INSTRUCCIONES Y REGLAS
    const notasReglas = [
      "• Todos los instrumentos aplicados deben ser evaluados sobre 100 puntos.",
      "• La CALIFICACIÓN FINAL 1 es igual al promedio de las calificaciones obtenidas en la etapa de Planificación y Organización, y Ejecución.",
      "• La nota final alcanzada sobre 100 puntos, debe ser incorporado al SIFMWEB.",
      "• De la CALIFICACIÓN FINAL 1, el SIFMWEB pondera la calificación al 20% y lo replica en todas las UF semestralizadas del 1er Semestre.",
      "• La calificación FICHA C-1 (Documento del Trabajo de Grado) se registra en el SIFMWEB donde se pondera la calificación al 20% y se replica en todas las UF semestralizadas del 2do semestre.",
      "• La CALIFICACIÓN PROMEDIO FINAL 2 (Ficha C-1 y Ficha C-2) se registra en el SIFMWEB posterior a la socialización de trabajo de grado."
    ];

    let totalNotasH = 10;
    const parsedNotas = notasReglas.map(n => {
      const lines = wrapText(n, font, 7, CONTENT_WIDTH - 12);
      totalNotasH += lines.length * 8 + 2;
      return lines;
    });

    const boxTopY = cursorY;
    hLine(page, MARGIN_LEFT, RIGHT_X, boxTopY - totalNotasH);

    let yNote = boxTopY - 9;
    parsedNotas.forEach(lines => {
      lines.forEach(l => {
        page.drawText(l, { x: MARGIN_LEFT + 6, y: yNote, size: 7, font, color: COLOR_TEXT });
        yNote -= 8;
      });
      yNote -= 2;
    });

    vLine(page, MARGIN_LEFT, boxTopY, boxTopY - totalNotasH);
    vLine(page, RIGHT_X, boxTopY, boxTopY - totalNotasH);

    cursorY = boxTopY - totalNotasH - 20;

    // LUGAR Y FECHA
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

    cursorY -= 40;

    // FIRMAS
    const sigColWidth = CONTENT_WIDTH / 2;
    const sigLineW = 150;

    const firmas = [
      { f1: "DOCENTE TUTOR/A", f2: "ACOMPAÑANTE", xCenter: MARGIN_LEFT + sigColWidth * 0.5 },
      { f1: "Vo.Bo. COORDINADOR/A IEPC-PEC", f2: "", xCenter: MARGIN_LEFT + sigColWidth * 1.5 }
    ];

    firmas.forEach((f) => {
      const lineStartX = f.xCenter - sigLineW / 2;
      const lineEndX = f.xCenter + sigLineW / 2;

      drawDottedLine(page, lineStartX, lineEndX, cursorY);

      const wL1 = fontBold.widthOfTextAtSize(f.f1, 8);
      page.drawText(f.f1, {
        x: f.xCenter - wL1 / 2,
        y: cursorY - 11,
        size: 8,
        font: fontBold,
        color: COLOR_TEXT,
      });

      if (f.f2) {
        const wL2 = fontBold.widthOfTextAtSize(f.f2, 8);
        page.drawText(f.f2, {
          x: f.xCenter - wL2 / 2,
          y: cursorY - 20,
          size: 8,
          font: fontBold,
          color: COLOR_TEXT,
        });
      }
    });

    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, '_blank');
    return { success: true };

  } catch (error) {
    console.error("Error al generar PDF del Centralizador (5to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};