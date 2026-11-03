import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { actaConformacionService } from '../../../services/fichas/1año/actaConformacionService';
import { studentService } from '../../../services/studentService';

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

// Deja solo dígitos del C.I. (ignora espacios, guiones y extensiones como "LP")
const normCi = (v) => String(v ?? '').replace(/\D/g, '');
const normNombre = (v) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

const plainTokens = (text, font, color) =>
  String(text ?? '').split(/\s+/).filter(Boolean).map((w) => ({ text: w, font, color }));

const underlineTokens = (text, font, color) =>
  String(text ?? '').split(/\s+/).filter(Boolean).map((w) => ({ text: w, font, color, underline: true }));

function drawTable(page, { x, y, width, colFractions, headerHeight, rowHeight, rows, headers, font, fontBold }) {
  const colWidths = colFractions.map((f) => f * width);
  const colX = [x];
  colWidths.forEach((w, i) => colX.push(colX[i] + w));

  const totalHeight = headerHeight + rowHeight * rows.length;
  const top = y;
  const bottom = y - totalHeight;

  page.drawRectangle({
    x,
    y: top - headerHeight,
    width,
    height: headerHeight,
    color: COLOR_TABLE_HEADER,
  });

  const rowLinesY = [top, top - headerHeight];
  for (let i = 1; i <= rows.length; i++) rowLinesY.push(top - headerHeight - rowHeight * i);
  rowLinesY.forEach((lineY) => {
    page.drawLine({ start: { x, y: lineY }, end: { x: x + width, y: lineY }, thickness: 0.8, color: COLOR_BORDER });
  });

  colX.forEach((lineX) => {
    page.drawLine({ start: { x: lineX, y: top }, end: { x: lineX, y: bottom }, thickness: 0.8, color: COLOR_BORDER });
  });

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

// estudianteId              -> ID con el que se carga el acta (puede ser el del titular del equipo)
// estudianteSeleccionadoId  -> ID del estudiante realmente seleccionado (el que debe ir en la fila N° 1)
export const imprimirActaConformacion1erAno = async (estudianteId, estudianteSeleccionadoId = estudianteId) => {
  try {
    let response = await actaConformacionService.getByEstudiante(estudianteId);
    let datosActa = null;
    let estudianteLogueado = null;

    try {
      const todosEstudiantes = await studentService.getStudents();
      const listaEsts = Array.isArray(todosEstudiantes) ? todosEstudiantes : todosEstudiantes?.estudiantes || [];
      
      estudianteLogueado = listaEsts.find(e => String(e.id) === String(estudianteSeleccionadoId));
      const ciActual = estudianteLogueado ? String(estudianteLogueado.ci || '').trim() : '';

      if (response && response.existe && response.datos) {
        datosActa = response.datos;
      } else {
        // Búsqueda cruzada por C.I.
        for (const est of listaEsts) {
          if (String(est.id) === String(estudianteId)) continue;
          const resAlt = await actaConformacionService.getByEstudiante(est.id);
          if (resAlt.existe && resAlt.datos && Array.isArray(resAlt.datos.integrantes)) {
            const pertenece = resAlt.datos.integrantes.some(int => 
              normCi(int.ci) !== '' && normCi(int.ci) === normCi(ciActual)
            );
            if (pertenece) {
              datosActa = resAlt.datos;
              break;
            }
          }
        }
      }
    } catch (errAlt) {
      console.warn("Búsqueda cruzada de PDF no disponible:", errAlt);
    }

    if (!datosActa || Object.keys(datosActa).length === 0) {
      return {
        success: false,
        message: "No existen datos registrados para el Acta de este estudiante. Primero debes guardar el formulario."
      };
    }

    const d = datosActa;
    let integrantes = typeof d.integrantes === 'string' ? JSON.parse(d.integrantes) : (d.integrantes || []);

    // =========================================================================
    // ESTUDIANTE SELECCIONADO EN LA PRIMERA FILA (N° 1)
    // - Si figura en la lista de integrantes -> se mueve a la posición [0].
    // - Si es el dueño del acta y no figura -> se agrega al inicio.
    // - Si no tiene registro en el acta -> se respeta el orden original.
    // =========================================================================
    if (estudianteLogueado) {
      const ciSel = normCi(estudianteLogueado.ci);
      const nombreSel = normNombre(`${estudianteLogueado.apellido || ''} ${estudianteLogueado.nombre || ''}`);

      // 1. Quitar duplicados (por C.I. o nombre) manteniendo el orden
      const vistos = new Set();
      const listaUnica = [];
      (integrantes || []).forEach((item) => {
        const key = normCi(item.ci) || normNombre(item.apellidos_nombres);
        if (key && !vistos.has(key)) {
          vistos.add(key);
          listaUnica.push(item);
        }
      });

      // 2. Ubicar al estudiante seleccionado
      const idx = listaUnica.findIndex((int) => {
        const c = normCi(int.ci);
        if (ciSel && c) return c === ciSel;
        return normNombre(int.apellidos_nombres) === nombreSel;
      });

      if (idx !== -1) {
        // Está en el acta: lo subimos a la fila 1
        const [encontrado] = listaUnica.splice(idx, 1);
        integrantes = [
          {
            ...encontrado,
            apellidos_nombres: `${estudianteLogueado.apellido || ''} ${estudianteLogueado.nombre || ''}`.trim(),
            ci: estudianteLogueado.ci || encontrado.ci || '',
          },
          ...listaUnica,
        ];
      } else if (String(estudianteId) === String(estudianteSeleccionadoId)) {
        // Es el dueño del acta pero no figura en la lista: lo agregamos al inicio
        integrantes = [
          {
            apellidos_nombres: `${estudianteLogueado.apellido || ''} ${estudianteLogueado.nombre || ''}`.trim(),
            ci: estudianteLogueado.ci || '',
          },
          ...listaUnica,
        ];
      } else {
        // No tiene registro en este acta: orden normal
        integrantes = listaUnica;
      }
    }

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

    page.setSize(612, 792);
    const pageWidth = 612;

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const MARGIN_LEFT = 85.04;  
    const MARGIN_RIGHT = 51.31; 
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); 
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;       

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

    const lblFecha = 'Lugar y fecha: ';
    const valFecha = `${d.lugar_ciudad || 'El Alto'}, ${d.dia || '17'} de ${d.mes || 'septiembre'} de ${d.gestion || '2026'}`;
    
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