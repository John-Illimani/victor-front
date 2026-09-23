import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { actaConformacion2doAnoService } from "../../../services/fichas/2año/actaConformacion2doAnoService";

// =============================================================================
// COLORES INSTITUCIONALES OFICIALES
// =============================================================================
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);       // Dorado oficial (#C9A751)
const COLOR_TABLE_HEADER = rgb(178 / 255, 34 / 255, 34 / 255); // Rojo Guindo / Marrón institucional (#B22222)
const COLOR_BORDER = rgb(0, 0, 0);

// =============================================================================
// HELPERS DE LAYOUT Y FORMATO CON LÍNEAS PUNTEADAS
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

      // Dibujar línea punteada exacta bajo cada dato rellenado del párrafo
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

const underlineTokens = (text, font, color) =>
  text.split(/\s+/).filter(Boolean).map((w) => ({ text: w, font, color, underline: true }));

// Helper para envolver texto en celdas de tabla manteniendo el contenido estricto en 9 pt fijo
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

function drawTable(page, { x, y, width, colFractions, headerHeight, rows, headers, font, fontBold }) {
  const colWidths = colFractions.map((f) => f * width);
  const colX = [x];
  colWidths.forEach((w, i) => colX.push(colX[i] + w));

  const fontSize = 9; // Contenido estrictamente en 9 pt (Calibri)
  const cellPadding = 6;
  const lineHeight = 11;

  const processedRows = rows.map((rowValues) => {
    const cellLinesArray = rowValues.map((cell, c) => {
      const cellFont = cell.bold ? fontBold : font;
      const maxCellWidth = colWidths[c] - (cellPadding * 2);
      return wrapTextToLines(cell.text, cellFont, maxCellWidth, fontSize);
    });

    const maxLines = Math.max(...cellLinesArray.map((lines) => lines.length), 1);
    const calculatedRowHeight = Math.max(20, (maxLines * lineHeight) + (cellPadding * 1.5));

    return {
      cellLinesArray,
      height: calculatedRowHeight
    };
  });

  const totalRowsHeight = processedRows.reduce((sum, r) => sum + r.height, 0);
  const totalHeight = headerHeight + totalRowsHeight;
  const top = y;
  const bottom = y - totalHeight;

  // Fondo del encabezado de la tabla (Rojo Guindo Institucional)
  page.drawRectangle({
    x,
    y: top - headerHeight,
    width,
    height: headerHeight,
    color: COLOR_TABLE_HEADER,
  });

  // Líneas horizontales del encabezado
  page.drawLine({ start: { x, y: top }, end: { x: x + width, y: top }, thickness: 0.8, color: COLOR_BORDER });
  page.drawLine({ start: { x, y: top - headerHeight }, end: { x: x + width, y: top - headerHeight }, thickness: 0.8, color: COLOR_BORDER });

  // Líneas verticales del encabezado
  colX.forEach((lineX) => {
    page.drawLine({ start: { x: lineX, y: top }, end: { x: lineX, y: top - headerHeight }, thickness: 0.8, color: COLOR_BORDER });
  });

  // Encabezados de columna estrictamente en tamaño 12 pt Bold (Texto blanco)
  headers.forEach((text, i) => {
    const colCenter = colX[i] + colWidths[i] / 2;
    const textWidth = fontBold.widthOfTextAtSize(text, 12);
    page.drawText(text, {
      x: colCenter - textWidth / 2,
      y: top - headerHeight / 2 - 4,
      size: 12, // 12 pt en nombres de cada columna
      font: fontBold,
      color: rgb(1, 1, 1),
    });
  });

  // Renderizar filas de datos con multilínea automática
  let currentTableRowY = top - headerHeight;

  processedRows.forEach((rowObj, r) => {
    const rowHeight = rowObj.height;
    const nextRowY = currentTableRowY - rowHeight;

    rowObj.cellLinesArray.forEach((lines, c) => {
      const cell = rows[r][c];
      const align = cell.align || 'center';
      const cellFont = cell.bold ? fontBold : font;

      let textCursorY = currentTableRowY - cellPadding - 9;
      if (lines.length > 1) {
        textCursorY = currentTableRowY - ((rowHeight - (lines.length * lineHeight)) / 2) - 8;
      }

      lines.forEach((lineText) => {
        const textWidth = cellFont.widthOfTextAtSize(lineText, fontSize);
        let textX;
        if (align === 'center') {
          textX = colX[c] + colWidths[c] / 2 - textWidth / 2;
        } else {
          textX = colX[c] + cellPadding;
        }

        page.drawText(lineText, {
          x: textX,
          y: textCursorY,
          size: fontSize, // 9 pt en contenido
          font: cellFont,
          color: COLOR_TEXT,
        });

        textCursorY -= lineHeight;
      });
    });

    page.drawLine({ start: { x, y: nextRowY }, end: { x: x + width, y: nextRowY }, thickness: 0.8, color: COLOR_BORDER });

    colX.forEach((lineX) => {
      page.drawLine({ start: { x: lineX, y: currentTableRowY }, end: { x: lineX, y: nextRowY }, thickness: 0.8, color: COLOR_BORDER });
    });

    currentTableRowY = nextRowY;
  });

  return bottom;
}

export const imprimirActaConformacion2doAno = async (estudianteId) => {
  try {
    // ÚNICA LLAMADA AL SERVICIO PROPIO DE LA API DEL ACTA
    const responseFicha = await actaConformacion2doAnoService.getByEstudiante(estudianteId);

    if (!responseFicha || !responseFicha.existe || !responseFicha.datos) {
      return {
        success: false,
        message: "No existen datos registrados para el Acta de Conformación de 2do Año. Primero guarda el formulario.",
      };
    }

    const d = responseFicha.datos;

    const urlPlantilla = "/pdf/2año/plantilla.pdf";
    const resFetch = await fetch(urlPlantilla);
    const contentType = resFetch.headers.get("content-type");

    if (!resFetch.ok || (contentType && contentType.includes("text/html"))) {
      return {
        success: false,
        message: `No se encontró la plantilla en la ruta: ${urlPlantilla}.`,
      };
    }

    const pdfBytes = await resFetch.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPages()[0];

    // CONFIGURACIÓN DE PÁGINA Y MÁRGENES (3 cm Izq [85.04 pt], 1.81 cm Der [51.31 pt])
    page.setSize(612, 792);
    const pageWidth = 612;

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const MARGIN_LEFT = 85.04;
    const MARGIN_RIGHT = 51.31;
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;

    // =========================================================================
    // 1. TÍTULO PRINCIPAL ESTRICTAMENTE EN 13 PT BOLD (3 líneas)
    // =========================================================================
    let cursorY = 665;
    const titleLines = [
      "ACTA DE CONFORMACIÓN DEL EQUIPO COMUNITARIO DE",
      "INVESTIGACIÓN EDUCATIVA Y PRODUCCIÓN DE",
      "CONOCIMIENTOS PRÁCTICA EDUCATIVA COMUNITARIA",
    ];

    titleLines.forEach((line) => {
      const w = fontBold.widthOfTextAtSize(line, 13); // 13 pt en títulos
      page.drawText(line, {
        x: CONTENT_CENTER_X - w / 2,
        y: cursorY,
        size: 13,
        font: fontBold,
        color: COLOR_TITLE,
      });
      cursorY -= 17;
    });

    cursorY -= 10;

    // =========================================================================
    // 2. PÁRRAFO INTRODUCTORIO CON LÍNEAS PUNTEADAS EN 9 PT
    // =========================================================================
    const integrantes = typeof d.integrantes === 'string' ? JSON.parse(d.integrantes) : (d.integrantes || []);
    const esfmPrediosFinal = d.esfm_predios || "ESFM Simón Bolívar / UA El Alto";
    const especialidadFinal = (d.especialidad || "Educación Primaria Comunitaria Vocacional").toUpperCase();

    const intro = [
      ...plainTokens('En la ciudad/localidad de', font),
      ...underlineTokens(`${d.lugar_ciudad || 'El Alto'},`, fontBold),
      ...plainTokens('del departamento de', font),
      ...underlineTokens(`${d.departamento || 'La Paz'},`, fontBold),
      ...plainTokens('en predios de la ESFM/UA', font),
      ...underlineTokens(`${esfmPrediosFinal},`, font),
      ...plainTokens('a horas', font),
      ...underlineTokens(`${d.hora || '09:00'}`, font),
      ...plainTokens('del día', font),
      ...underlineTokens(`${d.dia || '10'},`, font),
      ...plainTokens('del mes de', font),
      ...underlineTokens(`${d.mes || 'septiembre'},`, font),
      ...plainTokens('de la gestión', font),
      ...underlineTokens(`${d.gestion || '2026'},`, fontBold),
      ...plainTokens('los estudiantes de segundo año de formación de la especialidad de', font),
      ...underlineTokens(`${especialidadFinal},`, fontBold),
      ...plainTokens('se reúnen con la finalidad de conformar el Equipo Comunitario IEPC-PEC, por los siguientes integrantes:', font),
    ];

    cursorY = drawJustifiedParagraph(page, intro, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 9, // 9 pt en contenido general
      lineHeight: 13.5,
      spaceFont: font,
    });

    cursorY -= 14;

    // =========================================================================
    // 3. TABLA DE INTEGRANTES (ENCABEZADOS 12 PT Y CONTENIDO 9 PT)
    // =========================================================================
    const colWidths = [30, 205, 150, 90.65]; // Total 475.65 pt

    const filas = [0, 1, 2].map((i) => {
      const int = integrantes[i];
      if (!int) return [{ text: `${i + 1}` }, { text: '' }, { text: '' }, { text: '' }];
      
      const nombreCompleto = int.apellidos_nombres 
        ? int.apellidos_nombres.trim() 
        : `${int.nombre || int.nombres || ''} ${int.apellido || int.apellidos || ''}`.trim();

      return [
        { text: `${i + 1}` },
        { text: nombreCompleto.toUpperCase(), bold: true, align: 'left' },
        { text: String(int.especialidad || especialidadFinal).toUpperCase(), align: 'left' },
        { text: String(int.ci || '') },
      ];
    });

    cursorY = drawTable(page, {
      x: MARGIN_LEFT,
      y: cursorY,
      width: CONTENT_WIDTH,
      colFractions: [colWidths[0]/CONTENT_WIDTH, colWidths[1]/CONTENT_WIDTH, colWidths[2]/CONTENT_WIDTH, colWidths[3]/CONTENT_WIDTH],
      headerHeight: 26,
      headers: ['Nº', 'APELLIDOS Y NOMBRES', 'ESPECIALIDAD', 'C.I.'], // 12 pt gestionado internamente
      rows: filas,                                                     // 9 pt gestionado internamente
      font,
      fontBold,
    });

    cursorY -= 16;

    // =========================================================================
    // 4. RESPONSABILIDADES Y COMPROMISOS (9 PT)
    // =========================================================================
    page.drawText('Asumiendo las siguientes responsabilidades y compromisos:', {
      x: MARGIN_LEFT, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT,
    });
    cursorY -= 14;

    const bullets = [
      'Implementar procesos de investigación educativa y producción de conocimientos durante la PEC de la presente gestión en la UE/CEA/CEE asignada.',
      'Cumplir con responsabilidad, puntualidad y de manera comunitaria las actividades previstas de la práctica educativa comunitaria.',
      'El equipo comunitario, asume el compromiso de trabajo hasta concluir las actividades planificadas de la IEPC-PEC de la presente gestión.',
    ];

    bullets.forEach((texto) => {
      page.drawText('•', { x: MARGIN_LEFT + 10, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
      cursorY = drawJustifiedParagraph(page, plainTokens(texto, font), {
        x: MARGIN_LEFT + 25,
        y: cursorY,
        maxWidth: CONTENT_WIDTH - 25,
        fontSize: 9, // 9 pt
        lineHeight: 12.5,
        spaceFont: font,
      });
      cursorY -= 4;
    });

    cursorY -= 4;

    const parrafosFinales = [
      'En prueba de consentimiento, de manera voluntaria se firma en señal de conformidad y cumplimiento a un solo efecto, el incumplimiento será resuelto de acuerdo a normativa vigente.',
      'El incumplimiento de cualquiera de los compromisos anteriores resultará en la suspensión y reprobación de la PEC.'
    ];

    parrafosFinales.forEach((texto, idx) => {
      cursorY = drawJustifiedParagraph(page, plainTokens(texto, font), {
        x: MARGIN_LEFT,
        y: cursorY,
        maxWidth: CONTENT_WIDTH,
        fontSize: 9, // 9 pt
        lineHeight: 12.5,
        spaceFont: font,
      });
      if (idx === 0) cursorY -= 6;
    });

    cursorY -= 18;

    // =========================================================================
    // 5. LUGAR Y FECHA (9 PT CON LÍNEA PUNTEADA)
    // =========================================================================
    const lblFecha = 'Lugar y fecha: ';
    const valFecha = `${d.lugar_ciudad || 'El Alto'}, ${d.dia || '10'} de ${d.mes || 'septiembre'} de ${d.gestion || '2026'}`;
    
    const wLbl = font.widthOfTextAtSize(lblFecha, 9);
    const wVal = fontBold.widthOfTextAtSize(valFecha, 9);
    const totalFechaW = wLbl + wVal;
    
    const fechaStartX = CONTENT_CENTER_X - totalFechaW / 2;

    page.drawText(lblFecha, { x: fechaStartX, y: cursorY, size: 9, font, color: COLOR_TEXT });
    
    const valStartX = fechaStartX + wLbl;
    page.drawText(valFecha, { x: valStartX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    
    page.drawLine({
      start: { x: valStartX, y: cursorY - 1.5 },
      end: { x: valStartX + wVal, y: cursorY - 1.5 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });

    cursorY -= 45;

    // =========================================================================
    // 6. FIRMAS DE ESTUDIANTES (9 PT)
    // =========================================================================
    const signatureWidth = 110;
    const totalSignatures = 3;
    const gapBetween = (CONTENT_WIDTH - signatureWidth * totalSignatures) / (totalSignatures - 1);
    
    for (let i = 0; i < totalSignatures; i++) {
      const sigX = MARGIN_LEFT + i * (signatureWidth + gapBetween);
      
      page.drawLine({
        start: { x: sigX, y: cursorY },
        end: { x: sigX + signatureWidth, y: cursorY },
        thickness: 0.8,
        color: COLOR_BORDER,
      });
      const label = 'Estudiante';
      const labelW = font.widthOfTextAtSize(label, 9); // 9 pt
      page.drawText(label, {
        x: sigX + signatureWidth / 2 - labelW / 2,
        y: cursorY - 12,
        size: 9,
        font,
        color: COLOR_TEXT,
      });
    }

    cursorY -= 45;

    // =========================================================================
    // 7. FIRMA COORDINADOR (9 PT)
    // =========================================================================
    const coordLine = '..........................................................';
    const coordText1 = 'Coordinador(a) IEPC-PEC';
    const coordText2 = 'o Coordinador(a) UA.';

    const coordLineW = font.widthOfTextAtSize(coordLine, 9);
    const coordText1W = font.widthOfTextAtSize(coordText1, 9);
    const coordText2W = font.widthOfTextAtSize(coordText2, 9);

    page.drawText(coordLine, {
      x: CONTENT_CENTER_X - coordLineW / 2,
      y: cursorY,
      size: 9,
      font,
      color: COLOR_TEXT,
    });
    
    page.drawText(coordText1, {
      x: CONTENT_CENTER_X - coordText1W / 2,
      y: cursorY - 12,
      size: 9, // 9 pt
      font,
      color: COLOR_TEXT,
    });

    page.drawText(coordText2, {
      x: CONTENT_CENTER_X - coordText2W / 2,
      y: cursorY - 22,
      size: 9, // 9 pt
      font,
      color: COLOR_TEXT,
    });

    // =========================================================================
    // 8. RENDERIZAR Y MOSTRAR EN NAVEGADOR
    // =========================================================================
    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, "_blank");
    return { success: true };
  } catch (error) {
    console.error("Error al generar PDF de Acta de Conformación 2do Año:", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`,
    };
  }
};