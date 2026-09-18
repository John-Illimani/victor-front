import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { actaConformacionService } from '../../../services/fichas/1año/actaConformacionService';

// =============================================================================
// COLORES INSTITUCIONALES OFICIALES (ANALIZADOS DEL PDF)
// =============================================================================
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);     // Dorado oficial (#C9A751)
const COLOR_TABLE_HEADER = rgb(247 / 255, 181 / 255, 0);   // Amarillo institucional (#F7B500)
const COLOR_BORDER = rgb(0, 0, 0);

// =============================================================================
// HELPERS DE LAYOUT (HELVETICA = ARIAL)
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
      page.drawText(token.text, {
        x: cursorX,
        y: cursorY,
        size: fontSize,
        font: token.font,
        color: token.color || COLOR_TEXT,
      });
      cursorX += token.font.widthOfTextAtSize(token.text, fontSize) + gapWidth;
    });

    cursorY -= lineHeight;
  });

  return cursorY;
}

const plainTokens = (text, font, color) =>
  text.split(/\s+/).filter(Boolean).map((w) => ({ text: w, font, color }));

function drawTable(page, { x, y, width, colFractions, headerHeight, rowHeight, rows, headers, font, fontBold }) {
  const colWidths = colFractions.map((f) => f * width);
  const colX = [x];
  colWidths.forEach((w, i) => colX.push(colX[i] + w));

  const totalHeight = headerHeight + rowHeight * rows.length;
  const top = y;
  const bottom = y - totalHeight;

  // Fondo amarillo/dorado del encabezado
  page.drawRectangle({
    x,
    y: top - headerHeight,
    width,
    height: headerHeight,
    color: COLOR_TABLE_HEADER,
  });

  // Líneas horizontales
  const rowLinesY = [top, top - headerHeight];
  for (let i = 1; i <= rows.length; i++) rowLinesY.push(top - headerHeight - rowHeight * i);
  rowLinesY.forEach((lineY) => {
    page.drawLine({ start: { x, y: lineY }, end: { x: x + width, y: lineY }, thickness: 0.8, color: COLOR_BORDER });
  });

  // Líneas verticales
  colX.forEach((lineX) => {
    page.drawLine({ start: { x: lineX, y: top }, end: { x: lineX, y: bottom }, thickness: 0.8, color: COLOR_BORDER });
  });

  // Texto del encabezado (Arial/Helvetica Bold 9.5pt)
  headers.forEach((text, i) => {
    const colCenter = colX[i] + colWidths[i] / 2;
    const textWidth = fontBold.widthOfTextAtSize(text, 9.5);
    page.drawText(text, {
      x: colCenter - textWidth / 2,
      y: top - headerHeight / 2 - 3.5,
      size: 9.5,
      font: fontBold,
      color: COLOR_TEXT,
    });
  });

  // Filas de datos (Arial/Helvetica Regular/Bold 9pt)
  rows.forEach((rowValues, r) => {
    const rowTop = top - headerHeight - rowHeight * r;
    rowValues.forEach((cell, c) => {
      const align = cell.align || 'center';
      const cellFont = cell.bold ? fontBold : font;
      const textWidth = cellFont.widthOfTextAtSize(cell.text, 9);
      let textX;
      if (align === 'center') textX = colX[c] + colWidths[c] / 2 - textWidth / 2;
      else textX = colX[c] + 6;
      
      page.drawText(cell.text, {
        x: textX,
        y: rowTop - rowHeight / 2 - 3.5,
        size: 9,
        font: cellFont,
        color: COLOR_TEXT,
      });
    });
  });

  return bottom;
}

export const imprimirActaConformacion1erAno = async (estudianteId) => {
  try {
    const response = await actaConformacionService.getByEstudiante(estudianteId);

    if (!response || !response.existe || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para el Acta de este estudiante. Primero debes guardar el formulario."
      };
    }

    const d = response.datos;

    const urlPlantilla = '/pdf/1ano/plantilla.pdf';
    const resFetch = await fetch(urlPlantilla);

    const contentType = resFetch.headers.get("content-type");
    if (!resFetch.ok || (contentType && contentType.includes("text/html"))) {
      return {
        success: false,
        message: `No se encontró la plantilla en: ${urlPlantilla}.`
      };
    }

    const pdfBytes = await resFetch.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPages()[0];

    // =========================================================================
    // FORZAR TAMAÑO CARTA (LETTER: 8.5 x 11 pulgadas -> 612 x 792 pt)
    // =========================================================================
    page.setSize(612, 792);
    const pageWidth = 612;

    // FUENTE ARIAL (Helvetica es la fuente nativa idéntica a Arial en PDF)
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // MARGEN IZQUIERDO DE 3 CM (85.04 pt) Y DERECHO (70 pt)
    const MARGIN_LEFT = 85.04;
    const MARGIN_RIGHT = 70;
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT);

    // =========================================================================
    // 1. TÍTULO EN DORADO INSTITUCIONAL (11pt Bold)
    // =========================================================================
    let cursorY = 665;
    const titleLines = [
      'ACTA DE CONFORMACIÓN DEL EQUIPO COMUNITARIO DE INVESTIGACIÓN',
      'EDUCATIVA PRODUCCIÓN DE CONOCIMIENTOS PEC',
    ];
    titleLines.forEach((line) => {
      const w = fontBold.widthOfTextAtSize(line, 11);
      page.drawText(line, { x: pageWidth / 2 - w / 2, y: cursorY, size: 11, font: fontBold, color: COLOR_TITLE });
      cursorY -= 15;
    });

    cursorY -= 6;

    // =========================================================================
    // 2. PÁRRAFO INTRODUCTORIO (10pt Regular / Bold)
    // =========================================================================
    const integrantes = typeof d.integrantes === 'string' ? JSON.parse(d.integrantes) : (d.integrantes || []);

    const intro = [
      ...plainTokens('En la ciudad/localidad de', font),
      ...plainTokens(`${d.lugar_ciudad || 'El Alto'},`, fontBold),
      ...plainTokens('del departamento de', font),
      ...plainTokens(`${d.departamento || 'La Paz'},`, fontBold),
      ...plainTokens('en predios de la ESFM/UA', font),
      ...plainTokens(`${d.esfm_predios || 'ESFM Simón Bolívar / UA El Alto'},`, font),
      ...plainTokens('a horas', font),
      ...plainTokens(`${d.hora || '09:00'}`, font),
      ...plainTokens('del día', font),
      ...plainTokens(`${d.dia || '17'},`, font),
      ...plainTokens('del mes de', font),
      ...plainTokens(`${d.mes || 'septiembre'},`, font),
      ...plainTokens('de la gestión', font),
      ...plainTokens(`${d.gestion || '2026'},`, fontBold),
      ...plainTokens('los estudiantes de primer año de formación de la especialidad de', font),
      ...plainTokens(`${(d.especialidad || 'EDUCACIÓN INICIAL EN FAMILIA COMUNITARIA').toUpperCase()},`, fontBold),
      ...plainTokens('se reúnen con la finalidad de conformar el Equipo Comunitario IEPC-PEC, por los siguientes integrantes:', font),
    ];

    cursorY = drawJustifiedParagraph(page, intro, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 10,
      lineHeight: 14,
      spaceFont: font,
    });

    cursorY -= 12;

    // =========================================================================
    // 3. TABLA DE INTEGRANTES CENTRADA (360 pt de ancho)
    // =========================================================================
    const TABLE_WIDTH = 360; 
    const tableX = (pageWidth - TABLE_WIDTH) / 2;

    const filas = [0, 1, 2].map((i) => {
      const int = integrantes[i];
      if (!int) return [{ text: `${i + 1}` }, { text: '' }, { text: '' }];
      
      const nombreCompleto = int.apellidos_nombres 
        ? int.apellidos_nombres.trim() 
        : `${int.nombre || int.nombres || ''} ${int.apellido || int.apellidos || ''}`.trim();

      return [
        { text: `${i + 1}` },
        { text: nombreCompleto.toUpperCase(), bold: true, align: 'left' },
        { text: String(int.ci || '') },
      ];
    });

    cursorY = drawTable(page, {
      x: tableX,
      y: cursorY,
      width: TABLE_WIDTH,
      colFractions: [0.10, 0.65, 0.25],
      headerHeight: 22,
      rowHeight: 20,
      headers: ['No.', 'NOMBRES Y APELLIDOS', 'C.I.'],
      rows: filas,
      font,
      fontBold,
    });

    cursorY -= 22;

    // =========================================================================
    // 4. RESPONSABILIDADES Y COMPROMISOS (10pt Regular / Bold)
    // =========================================================================
    page.drawText('Asumiendo las siguientes responsabilidades y compromisos:', {
      x: MARGIN_LEFT, y: cursorY, size: 10, font: fontBold, color: COLOR_TEXT,
    });
    cursorY -= 16;

    const compromisos = [
      'Implementar procesos de Investigación Educativa Producción de Conocimientos durante la PEC de la presente gestión en la UE/CEA/CEE asignada.',
      'Cumplir con responsabilidad, puntualidad y de manera comunitaria las actividades previstas de la práctica educativa comunitaria.',
      'El equipo comunitario, asume el compromiso de trabajo hasta concluir las actividades planificadas de la IEPC-PEC de la presente gestión.',
      'El incumplimiento de cualquiera de los compromisos anteriores resultará en la suspensión y reprobación de la PEC.',
      'En prueba de consentimiento, de manera voluntaria se firma en señal de conformidad y cumplimiento a un solo efecto, el incumplimiento será resuelto de acuerdo a normativa vigente.',
    ];

    compromisos.forEach((texto) => {
      cursorY = drawJustifiedParagraph(page, plainTokens(texto, font), {
        x: MARGIN_LEFT,
        y: cursorY,
        maxWidth: CONTENT_WIDTH,
        fontSize: 10,
        lineHeight: 13.5,
        spaceFont: font,
      });
      cursorY -= 8;
    });

    cursorY -= 6;

    // =========================================================================
    // 5. LUGAR Y FECHA (10pt)
    // =========================================================================
    const fechaPie = `${d.lugar_ciudad || 'El Alto'}, ${d.dia || '17'} de ${d.mes || 'septiembre'} de ${d.gestion || '2026'}`;
    const fechaX = MARGIN_LEFT + 150;
    
    page.drawText('Lugar y fecha: ', { x: fechaX, y: cursorY, size: 10, font, color: COLOR_TEXT });
    page.drawText(fechaPie, { x: fechaX + font.widthOfTextAtSize('Lugar y fecha: ', 10), y: cursorY, size: 10, font: fontBold, color: COLOR_TEXT });

    cursorY -= 40;

    // =========================================================================
    // 6. FIRMAS DE ESTUDIANTES (9pt)
    // =========================================================================
    const signatureWidth = 75;
    const totalSignatures = 3;
    const rightAvailableWidth = pageWidth - MARGIN_RIGHT - fechaX;
    const gapBetween = (rightAvailableWidth - (signatureWidth * totalSignatures)) / (totalSignatures - 1);
    
    for (let i = 0; i < totalSignatures; i++) {
      const sigX = fechaX + i * (signatureWidth + gapBetween);
      
      page.drawLine({
        start: { x: sigX, y: cursorY },
        end: { x: sigX + signatureWidth, y: cursorY },
        thickness: 0.8,
        color: COLOR_BORDER,
      });
      const label = 'Estudiante';
      const labelW = font.widthOfTextAtSize(label, 9);
      page.drawText(label, { x: sigX + signatureWidth / 2 - labelW / 2, y: cursorY - 11, size: 9, font, color: COLOR_TEXT });
    }

    cursorY -= 38;

    // =========================================================================
    // 7. FIRMA VO.BO. (9pt)
    // =========================================================================
    const voboX = MARGIN_LEFT + 240;
    const voboLine = '..........................................................';
    const voboText = 'Vo.Bo. Coordinación Académica IEPC-PEC';

    page.drawText(voboLine, { x: voboX, y: cursorY, size: 10, font, color: COLOR_TEXT });
    
    const voboTextW = font.widthOfTextAtSize(voboText, 9);
    const lineW = font.widthOfTextAtSize(voboLine, 10);
    page.drawText(voboText, { x: voboX + (lineW / 2) - (voboTextW / 2), y: cursorY - 11, size: 9, font, color: COLOR_TEXT });

    // =========================================================================
    // 8. RENDERIZAR Y MOSTRAR EN NAVEGADOR
    // =========================================================================
    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, '_blank');
    return { success: true };

  } catch (error) {
    console.error("Error al generar PDF del Acta:", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};