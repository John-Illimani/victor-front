import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { fichaF1_2doAnoService } from "../../../services/fichas/2año/fichaF1_2doAnoService";

// =============================================================================
// COLORES INSTITUCIONALES OFICIALES Y TONOS DE TABLA
// =============================================================================
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);       // Dorado oficial (#C9A751)
const COLOR_BORDER = rgb(0, 0, 0);

const COLOR_MAIN_HEADER = rgb(155 / 255, 25 / 255, 25 / 255);   // Rojo guindo oscuro para "ETAPA PREPARATORIA"
const COLOR_SUB_HEADER = rgb(205 / 255, 75 / 255, 75 / 255);    // Rojo/coral más claro para los encabezados de columnas
const COLOR_ACTIVITY_BG = rgb(245 / 255, 222 / 255, 222 / 255); // Fondo rosado/melocotón claro institucional

// =============================================================================
// HELPER PARA CONVERTIR NÚMEROS A LITERALES EXACTOS (Ej. 100 -> CIEN)
// =============================================================================
function numeroALiteral(num) {
  const n = Math.round(Number(num) || 0);
  if (n === 100) return "CIEN";
  if (n === 0) return "CERO";
  
  const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
  const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  const especiales = {
    11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE", 15: "QUINCE",
    16: "DIECISEIS", 17: "DIECISIETE", 18: "DIECIOCHO", 19: "DIECINUEVE",
    21: "VEINTIUNO", 22: "VEINTIDOS", 23: "VEINTITRES", 24: "VEINTICUATRO", 25: "VEINTICINCO",
    26: "VEINTISEIS", 27: "VEINTISIETE", 28: "VEINTIOCHO", 29: "VEINTINUEVE"
  };

  if (n < 10) return unidades[n];
  if (especiales[n]) return especiales[n];
  if (n >= 20 && n < 30) return "VEINTI" + unidades[n % 10];
  
  const d = Math.floor(n / 10);
  const u = n % 10;
  if (u === 0) return decenas[d];
  return `${decenas[d]} Y ${unidades[u]}`;
}

// =============================================================================
// HELPERS DE FORMATO Y PÁRRAFOS JUSTIFICADOS CON LÍNEAS PUNTEADAS
// =============================================================================
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
    const gapWidth = !isLastLine && gaps > 0 ? (maxWidth - wordsWidth) / gaps : spaceWidth;

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

const plainTokens = (text, font, color) =>
  text.split(/\s+/).filter(Boolean).map((w) => ({ text: w, font, color }));

function wrapTextToLines(text, font, maxWidth, fontSize) {
  if (!text) return [""];
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export const imprimirFichaF1_2doAno = async (estudianteId) => {
  try {
    const responseFicha = await fichaF1_2doAnoService.getByEstudiante(estudianteId);

    if (!responseFicha || !responseFicha.existe || !responseFicha.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha F-1 de 2do Año. Primero guarda el formulario.",
      };
    }

    const d = responseFicha.datos;

    const urlPlantilla = "/pdf/2año/plantilla.pdf";
    const resFetch = await fetch(urlPlantilla);
    const contentType = resFetch.headers.get("content-type");

    if (!resFetch.ok || (contentType && contentType.includes("text/html"))) {
      return {
        success: false,
        message: `No se encontró la plantilla en la ruta: ${urlPlantilla}. Verifica que el archivo exista en 'public/pdf/2año/plantilla.pdf'.`,
      };
    }

    const pdfBytes = await resFetch.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPages()[0];

    page.setSize(612, 792);
    const pageWidth = 612;

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const MARGIN_LEFT = 85.04;  // 3 cm exactos[cite: 8]
    const MARGIN_RIGHT = 51.31; // 1.81 cm exactos[cite: 8]
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt[cite: 8]
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;

    let cursorY = 675;

    // =========================================================================
    // 1. TÍTULOS PRINCIPALES (13 PT BOLD CENTRADOS)
    // =========================================================================
    const t1 = "FICHA F-1";
    const t1W = fontBold.widthOfTextAtSize(t1, 13);
    page.drawText(t1, {
      x: CONTENT_CENTER_X - t1W / 2,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: COLOR_TITLE,
    });
    cursorY -= 17;

    const t2 = "COORDINACIÓN Y GESTIÓN COMUNITARIA CON LA UE/CEA/CEE";
    const t2W = fontBold.widthOfTextAtSize(t2, 13);
    page.drawText(t2, {
      x: CONTENT_CENTER_X - t2W / 2,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: COLOR_TITLE,
    });
    cursorY -= 20;

    // =========================================================================
    // 2. PÁRRAFO INTRODUCTORIO (9 PT JUSTIFICADO)
    // =========================================================================
    const intro1 = "El Equipo Comunitario de IEPC – PEC coordina y gestiona información referencial con la UE/CEA/CEE asignada a fin de realizar una adecuada planificación adecuada (Plan de acción).";
    cursorY = drawJustifiedParagraph(page, plainTokens(intro1, font), {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 9,
      lineHeight: 13,
      spaceFont: font,
    });
    cursorY -= 6;

    const intro2 = "Las actividades programadas por la ESFM/UA deben ser evaluadas por la/el docente de Investigación.";
    cursorY = drawJustifiedParagraph(page, plainTokens(intro2, font), {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 9,
      lineHeight: 13,
      spaceFont: font,
    });
    cursorY -= 15;

    // =========================================================================
    // 3. DATOS REFERENCIALES DEL ESTUDIANTE (9 PT CON LÍNEAS PUNTEADAS)
    // =========================================================================
    page.drawText("DATOS REFERENCIALES DEL ESTUDIANTE:", {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 9,
      font: fontBold,
      color: COLOR_TITLE,
    });
    cursorY -= 16;

    const lblNom = "Nombres y Apellidos: ";
    page.drawText(lblNom, { x: MARGIN_LEFT, y: cursorY, size: 9, font, color: COLOR_TEXT });
    const lblNomW = font.widthOfTextAtSize(lblNom, 9);
    const valNomX = MARGIN_LEFT + lblNomW;
    const valNom = (d.apellidos_nombres || "").toUpperCase();
    if (valNom.trim()) {
      page.drawText(valNom, { x: valNomX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    }
    const valNomW = fontBold.widthOfTextAtSize(valNom, 9);
    page.drawLine({
      start: { x: valNomX, y: cursorY - 2 },
      end: { x: valNomX + Math.max(valNomW, 350), y: cursorY - 2 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });
    cursorY -= 16;

    const lblEsfm = "ESFM/UA: ";
    page.drawText(lblEsfm, { x: MARGIN_LEFT, y: cursorY, size: 9, font, color: COLOR_TEXT });
    const lblEsfmW = font.widthOfTextAtSize(lblEsfm, 9);
    const valEsfmX = MARGIN_LEFT + lblEsfmW;
    const valEsfm = (d.esfm_ua || "ESFM Simón Bolívar / UA El Alto").toUpperCase();
    page.drawText(valEsfm, { x: valEsfmX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    const valEsfmW = fontBold.widthOfTextAtSize(valEsfm, 9);
    page.drawLine({
      start: { x: valEsfmX, y: cursorY - 2 },
      end: { x: valEsfmX + Math.max(valEsfmW, 160), y: cursorY - 2 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });

    const lblEspX = valEsfmX + Math.max(valEsfmW, 160) + 15;
    const lblEsp = "Especialidad: ";
    page.drawText(lblEsp, { x: lblEspX, y: cursorY, size: 9, font, color: COLOR_TEXT });
    const lblEspW = font.widthOfTextAtSize(lblEsp, 9);
    const valEspX = lblEspX + lblEspW;
    const valEsp = (d.especialidad || "").toUpperCase();
    if (valEsp) {
      page.drawText(valEsp, { x: valEspX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    }
    const valEspW = fontBold.widthOfTextAtSize(valEsp, 9);
    page.drawLine({
      start: { x: valEspX, y: cursorY - 2 },
      end: { x: MARGIN_LEFT + CONTENT_WIDTH, y: cursorY - 2 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });
    cursorY -= 20;

    // =========================================================================
    // 4. TABLA MASTER ÚNICA E INTEGRAL (COLUMNA CALIFICACIÓN ANCHA, INDICADORES REDUCIDA)
    // =========================================================================
    const tableTop = cursorY;
    // Anchos ajustados: Actividades = 110, Indicadores = 250.65 (reducida), Calificación = 115 (agrandada)
    const colWidths = [110, 250.65, 115];
    const colX = [
      MARGIN_LEFT,
      MARGIN_LEFT + colWidths[0],
      MARGIN_LEFT + colWidths[0] + colWidths[1],
      MARGIN_LEFT + CONTENT_WIDTH,
    ];

    const topHeaderHeight = 22;
    const subHeaderHeight = 26;

    // 4.1 Encabezado superior unificado (ETAPA PREPARATORIA)[cite: 10, 13]
    page.drawRectangle({
      x: MARGIN_LEFT,
      y: tableTop - topHeaderHeight,
      width: CONTENT_WIDTH,
      height: topHeaderHeight,
      color: COLOR_MAIN_HEADER,
    });
    const topHeaderText = "ETAPA PREPARATORIA (antes de la PEC)";
    const topHeaderW = fontBold.widthOfTextAtSize(topHeaderText, 12);
    page.drawText(topHeaderText, {
      x: CONTENT_CENTER_X - topHeaderW / 2,
      y: tableTop - topHeaderHeight / 2 - 4,
      size: 12,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    // 4.2 Sub-encabezados de columnas[cite: 10, 13]
    const subHeaderY = tableTop - topHeaderHeight;
    page.drawRectangle({
      x: MARGIN_LEFT,
      y: subHeaderY - subHeaderHeight,
      width: CONTENT_WIDTH,
      height: subHeaderHeight,
      color: COLOR_SUB_HEADER,
    });

    page.drawLine({ start: { x: colX[1], y: subHeaderY }, end: { x: colX[1], y: subHeaderY - subHeaderHeight }, thickness: 0.8, color: COLOR_BORDER });
    page.drawLine({ start: { x: colX[2], y: subHeaderY }, end: { x: colX[2], y: subHeaderY - subHeaderHeight }, thickness: 0.8, color: COLOR_BORDER });

    const subHeaders = [
      { text: "ACTIVIDADES", x: colX[0] + colWidths[0] / 2 },
      { text: "INDICADORES", x: colX[1] + colWidths[1] / 2 },
      { text: "CALIFICACIÓN\nDe 1 a 100 puntos", x: colX[2] + colWidths[2] / 2 },
    ];

    subHeaders.forEach((sh, i) => {
      const lines = sh.text.split("\n");
      const shSize = 11;
      lines.forEach((line, lineIdx) => {
        const lw = fontBold.widthOfTextAtSize(line, shSize);
        const ly = lines.length === 1 
          ? subHeaderY - subHeaderHeight / 2 - 4 
          : subHeaderY - 9 - (lineIdx * 10);
        page.drawText(line, {
          x: colX[i] + colWidths[i] / 2 - lw / 2,
          y: ly,
          size: shSize,
          font: fontBold,
          color: rgb(1, 1, 1),
        });
      });
    });

    let currentTableRowY = subHeaderY - subHeaderHeight;

    const rowsData = [
      {
        activity: "Plan de acción del Equipo Comunitario de la PEC",
        indicators: [
          "Elabora y presenta el Plan de Acción al docente de Investigación, tomando como base a información preliminar recabada.",
          "El Plan de Acción contempla la observación a los tres escenarios geográficos: comunidad, UE/CEA/ CEE y aula."
        ],
        grades: [d.f1_criterio_1 ?? 0, d.f1_criterio_2 ?? 0]
      },
      {
        activity: "Instrumentos validados",
        indicators: [
          "Elabora y presenta los instrumentos debidamente sellados y validados.",
          "Los instrumentos validados responden a su aplicación en los tres escenarios geográficos definidos."
        ],
        grades: [d.f1_criterio_3 ?? 0, d.f1_criterio_4 ?? 0]
      }
    ];

    const fontSize = 9;
    const cellPadding = 6;
    const lineHeight = 12;

    // 4.3 Filas de Actividades e Indicadores[cite: 8, 9]
    rowsData.forEach((rowData) => {
      const indLinesArray = rowData.indicators.map(ind => wrapTextToLines(ind, font, colWidths[1] - (cellPadding * 2), fontSize));
      const totalSubLines = indLinesArray.reduce((sum, lines) => sum + lines.length, 0);
      const rowHeight = Math.max(65, (totalSubLines * lineHeight) + (cellPadding * 2) + 10);
      const nextRowY = currentTableRowY - rowHeight;

      page.drawRectangle({
        x: colX[0],
        y: nextRowY,
        width: CONTENT_WIDTH,
        height: rowHeight,
        color: COLOR_ACTIVITY_BG,
      });

      const actLines = wrapTextToLines(rowData.activity, fontBold, colWidths[0] - (cellPadding * 2), fontSize);
      let actY = currentTableRowY - (rowHeight / 2) + ((actLines.length * lineHeight) / 2) - 3;
      actLines.forEach(line => {
        const lw = fontBold.widthOfTextAtSize(line, fontSize);
        page.drawText(line, {
          x: colX[0] + colWidths[0] / 2 - lw / 2,
          y: actY,
          size: fontSize,
          font: fontBold,
          color: COLOR_TEXT,
        });
        actY -= lineHeight;
      });

      const subRowHeight = rowHeight / 2;
      rowData.indicators.forEach((indText, subIdx) => {
        const subTopY = currentTableRowY - (subIdx * subRowHeight);

        if (subIdx > 0) {
          page.drawLine({
            start: { x: colX[1], y: subTopY },
            end: { x: colX[2], y: subTopY },
            thickness: 0.8,
            color: COLOR_BORDER,
          });
        }

        const subLines = wrapTextToLines(indText, font, colWidths[1] - (cellPadding * 2), fontSize);
        let subY = subTopY - cellPadding - 9;
        if (subLines.length > 1) {
          subY = subTopY - ((subRowHeight - (subLines.length * lineHeight)) / 2) - 7;
        }
        subLines.forEach(l => {
          page.drawText(l, {
            x: colX[1] + cellPadding,
            y: subY,
            size: fontSize,
            font,
            color: COLOR_TEXT,
          });
          subY -= lineHeight;
        });

        const rawGrade = Number(rowData.grades[subIdx] ?? 0);
        const gradeVal = Number.isInteger(rawGrade) ? String(rawGrade) : rawGrade.toFixed(2);
        const gw = fontBold.widthOfTextAtSize(gradeVal, fontSize);
        page.drawText(gradeVal, {
          x: colX[2] + colWidths[2] / 2 - gw / 2,
          y: subTopY - subRowHeight / 2 - 3,
          size: fontSize,
          font: fontBold,
          color: COLOR_TEXT,
        });
      });

      page.drawLine({ start: { x: MARGIN_LEFT, y: nextRowY }, end: { x: MARGIN_LEFT + CONTENT_WIDTH, y: nextRowY }, thickness: 0.8, color: COLOR_BORDER });
      colX.forEach(lx => {
        page.drawLine({ start: { x: lx, y: currentTableRowY }, end: { x: lx, y: nextRowY }, thickness: 0.8, color: COLOR_BORDER });
      });

      currentTableRowY = nextRowY;
    });

    // 4.4 Fila de Promedio Final (Línea divisoria vertical extendida continuamente)[cite: 8, 9]
    const promHeight = 22;
    const promNextY = currentTableRowY - promHeight;
    page.drawRectangle({
      x: MARGIN_LEFT,
      y: promNextY,
      width: CONTENT_WIDTH,
      height: promHeight,
      color: COLOR_ACTIVITY_BG,
    });

    const promLabel = "Promedio final (Número entero)";
    page.drawText(promLabel, {
      x: colX[0] + 8,
      y: currentTableRowY - promHeight / 2 - 3,
      size: fontSize,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const promNumVal = Math.round(Number(d.promedio_numeral ?? 0));
    const promValStr = String(promNumVal);
    const promValW = fontBold.widthOfTextAtSize(promValStr, fontSize);
    page.drawText(promValStr, {
      x: colX[2] + colWidths[2] / 2 - promValW / 2,
      y: currentTableRowY - promHeight / 2 - 3,
      size: fontSize,
      font: fontBold,
      color: COLOR_TEXT,
    });

    page.drawLine({ start: { x: MARGIN_LEFT, y: promNextY }, end: { x: MARGIN_LEFT + CONTENT_WIDTH, y: promNextY }, thickness: 0.8, color: COLOR_BORDER });
    page.drawLine({ start: { x: colX[0], y: currentTableRowY }, end: { x: colX[0], y: promNextY }, thickness: 0.8, color: COLOR_BORDER });
    page.drawLine({ start: { x: colX[2], y: currentTableRowY }, end: { x: colX[2], y: promNextY }, thickness: 0.8, color: COLOR_BORDER });
    page.drawLine({ start: { x: colX[3], y: currentTableRowY }, end: { x: colX[3], y: promNextY }, thickness: 0.8, color: COLOR_BORDER });

    currentTableRowY = promNextY;

    // 4.5 Fila de Literal (Línea divisoria vertical extendida continuamente)[cite: 8, 9]
    const litHeight = 20;
    const litNextY = currentTableRowY - litHeight;
    page.drawRectangle({
      x: MARGIN_LEFT,
      y: litNextY,
      width: CONTENT_WIDTH,
      height: litHeight,
      color: rgb(1, 1, 1),
    });

    page.drawText("Literal:", {
      x: colX[0] + 8,
      y: currentTableRowY - litHeight / 2 - 3,
      size: fontSize,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const litVal = numeroALiteral(promNumVal);
    page.drawText(litVal, {
      x: colX[0] + 55,
      y: currentTableRowY - litHeight / 2 - 3,
      size: fontSize,
      font: fontBold,
      color: COLOR_TEXT,
    });

    page.drawLine({ start: { x: MARGIN_LEFT, y: litNextY }, end: { x: MARGIN_LEFT + CONTENT_WIDTH, y: litNextY }, thickness: 0.8, color: COLOR_BORDER });
    page.drawLine({ start: { x: colX[0], y: currentTableRowY }, end: { x: colX[0], y: litNextY }, thickness: 0.8, color: COLOR_BORDER });
    page.drawLine({ start: { x: colX[2], y: currentTableRowY }, end: { x: colX[2], y: litNextY }, thickness: 0.8, color: COLOR_BORDER });
    page.drawLine({ start: { x: colX[3], y: currentTableRowY }, end: { x: colX[3], y: litNextY }, thickness: 0.8, color: COLOR_BORDER });

    currentTableRowY = litNextY;

    // 4.6 Fila de Observaciones y/o sugerencias (Línea divisoria vertical extendida continuamente)[cite: 8, 9]
    const obsHeight = 34;
    const obsNextY = currentTableRowY - obsHeight;
    page.drawRectangle({
      x: MARGIN_LEFT,
      y: obsNextY,
      width: CONTENT_WIDTH,
      height: obsHeight,
      color: COLOR_ACTIVITY_BG,
    });

    page.drawText("Observaciones y/o sugerencias:", {
      x: colX[0] + 8,
      y: currentTableRowY - 12,
      size: fontSize,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const obsVal = String(d.observaciones || "");
    if (obsVal) {
      page.drawText(obsVal, {
        x: colX[0] + 8,
        y: currentTableRowY - 24,
        size: fontSize,
        font,
        color: COLOR_TEXT,
      });
    }

    page.drawLine({ start: { x: MARGIN_LEFT, y: obsNextY }, end: { x: MARGIN_LEFT + CONTENT_WIDTH, y: obsNextY }, thickness: 0.8, color: COLOR_BORDER });
    page.drawLine({ start: { x: colX[0], y: currentTableRowY }, end: { x: colX[0], y: obsNextY }, thickness: 0.8, color: COLOR_BORDER });
    page.drawLine({ start: { x: colX[2], y: currentTableRowY }, end: { x: colX[2], y: obsNextY }, thickness: 0.8, color: COLOR_BORDER });
    page.drawLine({ start: { x: colX[3], y: currentTableRowY }, end: { x: colX[3], y: obsNextY }, thickness: 0.8, color: COLOR_BORDER });

    cursorY = obsNextY - 25;

    // =========================================================================
    // 5. LUGAR, FECHA Y FIRMAS (9 PT - "Lugar y fecha:" normal, fecha en negrita)[cite: 15, 16]
    // =========================================================================
    const lblFechaText = "Lugar y fecha: ";
    const valFechaText = `${d.lugar_ciudad || 'El Alto'}, ${d.dia || '21'} de ${d.mes || 'septiembre'} de ${d.ano || '2026'}`;

    const wLblFecha = font.widthOfTextAtSize(lblFechaText, 9);
    const wValFecha = fontBold.widthOfTextAtSize(valFechaText, 9);
    const totalFechaW = wLblFecha + wValFecha;
    const fechaStartX = MARGIN_LEFT + CONTENT_WIDTH - totalFechaW;

    // "Lugar y fecha: " normal
    page.drawText(lblFechaText, {
      x: fechaStartX,
      y: cursorY,
      size: 9,
      font,
      color: COLOR_TEXT,
    });

    // Fecha en negrita
    const valFechaX = fechaStartX + wLblFecha;
    page.drawText(valFechaText, {
      x: valFechaX,
      y: cursorY,
      size: 9,
      font: fontBold,
      color: COLOR_TEXT,
    });

    // Línea punteada debajo únicamente de la fecha (o de todo el bloque de fecha)
    page.drawLine({
      start: { x: valFechaX, y: cursorY - 1.5 },
      end: { x: MARGIN_LEFT + CONTENT_WIDTH, y: cursorY - 1.5 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });

    cursorY -= 55;

    const sigWidth = 180;
    const sig1X = MARGIN_LEFT + 15;
    const sig2X = MARGIN_LEFT + CONTENT_WIDTH - sigWidth - 15;

    // Firma Estudiante
    page.drawLine({
      start: { x: sig1X, y: cursorY },
      end: { x: sig1X + sigWidth, y: cursorY },
      thickness: 0.8,
      dashArray: [2, 2],
      color: COLOR_BORDER,
    });
    const estLabel = "Estudiante";
    const estLW = font.widthOfTextAtSize(estLabel, 9);
    page.drawText(estLabel, {
      x: sig1X + sigWidth / 2 - estLW / 2,
      y: cursorY - 12,
      size: 9,
      font,
      color: COLOR_TEXT,
    });

    // Firma Docente IEPC-PEC
    page.drawLine({
      start: { x: sig2X, y: cursorY },
      end: { x: sig2X + sigWidth, y: cursorY },
      thickness: 0.8,
      dashArray: [2, 2],
      color: COLOR_BORDER,
    });
    const docLabel = "Docente IEPC-PEC";
    const docLW = font.widthOfTextAtSize(docLabel, 9);
    page.drawText(docLabel, {
      x: sig2X + sigWidth / 2 - docLW / 2,
      y: cursorY - 12,
      size: 9,
      font,
      color: COLOR_TEXT,
    });

    // =========================================================================
    // 6. RENDERIZAR Y ABRIR EN NAVEGADOR
    // =========================================================================
    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, "_blank");
    return { success: true };
  } catch (error) {
    console.error("Error al generar PDF de Ficha F-1 de 2do Año:", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`,
    };
  }
};