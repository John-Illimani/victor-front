import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { actaConformacionService } from '../../../services/fichas/1año/actaConformacionService';

// =============================================================================
// COLORES INSTITUCIONALES OFICIALES
// =============================================================================
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);     // Dorado oficial (#C9A751)
const COLOR_TABLE_HEADER = rgb(247 / 255, 181 / 255, 0);   // Amarillo institucional (#F7B500)
const COLOR_BORDER = rgb(0, 0, 0);

// =============================================================================
// HELPERS DE LAYOUT Y FORMATO
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

      // Si el token representa datos rellenados, se dibuja la línea punteada justo por debajo
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

function drawTable(page, { x, y, width, colFractions, headerHeight, rowHeight, rows, headers, font, fontBold }) {
  const colWidths = colFractions.map((f) => f * width);
  const colX = [x];
  colWidths.forEach((w, i) => colX.push(colX[i] + w));

  const totalHeight = headerHeight + rowHeight * rows.length;
  const top = y;
  const bottom = y - totalHeight;

  // Fondo amarillo institucional del encabezado
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

  // Texto del encabezado en tamaño 12 pt
  headers.forEach((text, i) => {
    const colCenter = colX[i] + colWidths[i] / 2;
    const textWidth = fontBold.widthOfTextAtSize(text, 12);
    page.drawText(text, {
      x: colCenter - textWidth / 2,
      y: top - headerHeight / 2 - 4,
      size: 12,
      font: fontBold,
      color: COLOR_TEXT,
    });
  });

  // Filas de datos en tamaño 9 pt
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
        y: rowTop - rowHeight / 2 - 3,
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

    // HOJA TAMAÑO CARTA Y MÁRGENES SOLICITADOS (3 cm izq, 1.81 cm der)
    page.setSize(612, 792);
    const pageWidth = 612;

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const MARGIN_LEFT = 85.04;  // 3 cm exactos
    const MARGIN_RIGHT = 51.31; // 1.81 cm exactos
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;       // 322.865 pt

    // =========================================================================
    // 1. TÍTULO PRINCIPAL (13pt Bold Arial/Helvetica, Centrado en Área Útil)
    // =========================================================================
    let cursorY = 665;
    const titleLines = [
      'ACTA DE CONFORMACIÓN DEL EQUIPO COMUNITARIO DE INVESTIGACIÓN',
      'EDUCATIVA PRODUCCIÓN DE CONOCIMIENTOS PEC',
    ];
    titleLines.forEach((line) => {
      const w = fontBold.widthOfTextAtSize(line, 13);
      page.drawText(line, {
        x: CONTENT_CENTER_X - w / 2,
        y: cursorY,
        size: 13,
        font: fontBold,
        color: COLOR_TITLE,
      });
      cursorY -= 17;
    });

    cursorY -= 6;

    // =========================================================================
    // 2. PÁRRAFO INTRODUCTORIO (DATOS SUBRAYADOS CON LÍNEAS PUNTEADAS - 9pt)
    // =========================================================================
    const integrantes = typeof d.integrantes === 'string' ? JSON.parse(d.integrantes) : (d.integrantes || []);

    const intro = [
      ...plainTokens('En la ciudad/localidad de', font),
      ...underlineTokens(`${d.lugar_ciudad || 'El Alto'},`, fontBold),
      ...plainTokens('del departamento de', font),
      ...underlineTokens(`${d.departamento || 'La Paz'},`, fontBold),
      ...plainTokens('en predios de la ESFM/UA', font),
      ...underlineTokens(`${d.esfm_predios || 'ESFM Simón Bolívar / UA El Alto'},`, font),
      ...plainTokens('a horas', font),
      ...underlineTokens(`${d.hora || '09:00'}`, font),
      ...plainTokens('del día', font),
      ...underlineTokens(`${d.dia || '17'},`, font),
      ...plainTokens('del mes de', font),
      ...underlineTokens(`${d.mes || 'septiembre'},`, font),
      ...plainTokens('de la gestión', font),
      ...underlineTokens(`${d.gestion || '2026'},`, fontBold),
      ...plainTokens('los estudiantes de primer año de formación de la especialidad de', font),
      ...underlineTokens(`${(d.especialidad || 'EDUCACIÓN INICIAL EN FAMILIA COMUNITARIA').toUpperCase()},`, fontBold),
      ...plainTokens('se reúnen con la finalidad de conformar el Equipo Comunitario IEPC-PEC, por los siguientes integrantes:', font),
    ];

    cursorY = drawJustifiedParagraph(page, intro, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 9,
      lineHeight: 13.5,
      spaceFont: font,
    });

    cursorY -= 12;

    // =========================================================================
    // 3. TABLA DE INTEGRANTES CENTRADA (ENCABEZADOS 12pt, CONTENIDO 9pt)
    // =========================================================================
    const TABLE_WIDTH = 360; 
    const tableX = CONTENT_CENTER_X - TABLE_WIDTH / 2;

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
      headerHeight: 24,
      rowHeight: 20,
      headers: ['No.', 'NOMBRES Y APELLIDOS', 'C.I.'],
      rows: filas,
      font,
      fontBold,
    });

    cursorY -= 20;

    // =========================================================================
    // 4. RESPONSABILIDADES Y COMPROMISOS (9pt Regular / Bold)
    // =========================================================================
    page.drawText('Asumiendo las siguientes responsabilidades y compromisos:', {
      x: MARGIN_LEFT, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT,
    });
    cursorY -= 14;

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
        fontSize: 9,
        lineHeight: 13,
        spaceFont: font,
      });
      cursorY -= 6;
    });

    cursorY -= 8;

    // =========================================================================
    // 5. LUGAR Y FECHA (CENTRADO SOBRE ÁREA ÚTIL EN 9pt CON LÍNEA PUNTEADA)
    // =========================================================================
    const lblFecha = 'Lugar y fecha: ';
    const valFecha = `${d.lugar_ciudad || 'El Alto'}, ${d.dia || '17'} de ${d.mes || 'septiembre'} de ${d.gestion || '2026'}`;
    
    const wLbl = font.widthOfTextAtSize(lblFecha, 9);
    const wVal = fontBold.widthOfTextAtSize(valFecha, 9);
    const totalFechaW = wLbl + wVal;
    
    const fechaStartX = CONTENT_CENTER_X - totalFechaW / 2;

    page.drawText(lblFecha, { x: fechaStartX, y: cursorY, size: 9, font, color: COLOR_TEXT });
    
    const valStartX = fechaStartX + wLbl;
    page.drawText(valFecha, { x: valStartX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    
    // Línea punteada bajo la fecha
    page.drawLine({
      start: { x: valStartX, y: cursorY - 1.5 },
      end: { x: valStartX + wVal, y: cursorY - 1.5 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });

    cursorY -= 45;

    // =========================================================================
    // 6. FIRMAS DE ESTUDIANTES (CENTRADO INFERIOR DISTRIBUIDO)
    // =========================================================================
    const signatureWidth = 95;
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
      const labelW = font.widthOfTextAtSize(label, 9);
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
    // 7. FIRMA VO.BO. (CENTRADO PERFECTO)
    // =========================================================================
    const voboLine = '..........................................................';
    const voboText = 'Vo.Bo. Coordinación Académica IEPC-PEC';

    const voboLineW = font.widthOfTextAtSize(voboLine, 9);
    const voboTextW = font.widthOfTextAtSize(voboText, 9);

    page.drawText(voboLine, {
      x: CONTENT_CENTER_X - voboLineW / 2,
      y: cursorY,
      size: 9,
      font,
      color: COLOR_TEXT,
    });
    
    page.drawText(voboText, {
      x: CONTENT_CENTER_X - voboTextW / 2,
      y: cursorY - 12,
      size: 9,
      font,
      color: COLOR_TEXT,
    });

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