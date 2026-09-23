import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { actaConformacion3erAnoService } from '../../../services/fichas/3año/actaConformacion3erAnoService';

// Paleta de Colores Institucionales
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);            // Dorado (#C9A751)
const COLOR_TABLE_HEADER = rgb(155 / 255, 168 / 255, 102 / 255);    // Verde Oliva (#9BA866)
const COLOR_BORDER = rgb(0, 0, 0);

// Helpers para Tokenización (Texto Fijo vs Texto Rellenado)
const plainTokens = (text, font, color) =>
  String(text ?? '').split(/\s+/).filter(Boolean).map((w) => ({ text: w, font, color }));

const underlineTokens = (text, font, color) =>
  String(text ?? '').split(/\s+/).filter(Boolean).map((w) => ({ text: w, font, color, underline: true }));

// Función de Justificación por Tokens Exacta (Basada en 1er Año)
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

export const imprimirActaEquipo3erAno = async (estudianteId) => {
  try {
    const response = await actaConformacion3erAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para el Acta de Conformación de Equipo."
      };
    }

    const d = response.datos;

    const urlPlantilla = encodeURI('/pdf/3año/plantilla.pdf');
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

    const page = pdfDoc.getPages()[0];
    page.setSize(612, 792); // Carta
    const pageWidth = 612;
    const pageHeight = 792;

    // Carga de Fuentes Calibri con soporte de la 'ñ'
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

    // MÁRGENES ESTRICTOS: 5 CM ARRIBA (141.73 PT), 3 CM IZQ (85.04 PT), 1.81 CM DER (51.31 PT)
    const MARGIN_TOP = (5 / 2.54) * 72; 
    const MARGIN_LEFT = 85.04;          
    const MARGIN_RIGHT = 51.31;         
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;

    let cursorY = pageHeight - MARGIN_TOP;

    // TÍTULO PRINCIPAL (13 pt Bold Dorado Centrado)
    const titleLines = [
      "ACTA DE CONFORMACIÓN Y COMPROMISO DEL EQUIPO",
      "COMUNITARIO DE INVESTIGACIÓN EDUCATIVA",
      "PRODUCCIÓN DE CONOCIMIENTOS",
      "PRÁCTICA EDUCATIVA COMUNITARIA"
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
      cursorY -= 16;
    });

    cursorY -= 8;

    // PÁRRAFO INTRODUCTORIO JUSTIFICADO TOKENIZADO (IGUAL AL PRIMER AÑO)
    const introTokensList = [
      ...plainTokens('En la ciudad/localidad de', font),
      ...underlineTokens(`${d.lugar_ciudad || 'El Alto'},`, fontBold),
      ...plainTokens('del departamento de', font),
      ...underlineTokens(`${d.departamento || 'La Paz'},`, fontBold),
      ...plainTokens('en predios de la ESFM/UA', font),
      ...underlineTokens(`${d.esfm_ua || 'ESFM Simón Bolívar / UA El Alto'},`, fontBold),
      ...plainTokens('a horas', font),
      ...underlineTokens(`${d.hora || '09:00'}`, fontBold),
      ...plainTokens('del día', font),
      ...underlineTokens(`${d.dia || '21'},`, fontBold),
      ...plainTokens('del mes de', font),
      ...underlineTokens(`${d.mes || 'septiembre'},`, fontBold),
      ...plainTokens('de la gestión', font),
      ...underlineTokens(`${d.gestion || '2026'},`, fontBold),
      ...plainTokens('los estudiantes de tercer año de formación de la especialidad de', font),
      ...underlineTokens(`${(d.especialidad || 'EDUCACIÓN PRIMARIA COMUNITARIA VOCACIONAL').toUpperCase()},`, fontBold),
      ...plainTokens('se reúnen con la finalidad de conformar el Equipo Comunitario IEPC-PEC con el siguiente detalle:', font),
    ];

    cursorY = drawJustifiedParagraph(page, introTokensList, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 9,
      lineHeight: 13.5,
      spaceFont: font,
    });

    cursorY -= 14;

    // TABLA DE INTEGRANTES DEL EQUIPO COMUNITARIO
    const tableTop = cursorY;
    const colWidths = [35, 240.65, 100, 100];
    const colX = [MARGIN_LEFT];
    for (let i = 0; i < colWidths.length; i++) colX.push(colX[i] + colWidths[i]);

    const headerH = 22;
    page.drawRectangle({
      x: MARGIN_LEFT,
      y: tableTop - headerH,
      width: CONTENT_WIDTH,
      height: headerH,
      color: COLOR_TABLE_HEADER,
    });

    const headers = [
      { text: "N°", col: 0 },
      { text: "APELLIDOS Y NOMBRES", col: 1 },
      { text: "C.I.", col: 2 },
      { text: "Nro. DE CELULAR", col: 3 }
    ];

    headers.forEach(({ text, col }) => {
      const wHeader = fontBold.widthOfTextAtSize(text, 8.5);
      page.drawText(text, {
        x: colX[col] + colWidths[col] / 2 - wHeader / 2,
        y: tableTop - 14,
        size: 8.5,
        font: fontBold,
        color: COLOR_TEXT,
      });
    });

    let currentTableY = tableTop - headerH;
    const hLines = [tableTop, currentTableY];

    const rawIntegrantes = Array.isArray(d.integrantes) ? d.integrantes : [];
    const integrantes = [0, 1, 2].map((idx) => rawIntegrantes[idx] || {});

    integrantes.forEach((item, index) => {
      const rowTop = currentTableY;
      const rowH = 22;

      // N°
      const numStr = String(index + 1);
      const nw = font.widthOfTextAtSize(numStr, 9);
      page.drawText(numStr, { x: colX[0] + colWidths[0] / 2 - nw / 2, y: rowTop - 14, size: 9, font, color: COLOR_TEXT });

      // Apellidos y Nombres
      const nomStr = String(item.apellidos_nombres || "").toUpperCase();
      if (nomStr) {
        page.drawText(nomStr, { x: colX[1] + 8, y: rowTop - 14, size: 9, font: fontBold, color: COLOR_TEXT });
      }

      // C.I.
      const ciStr = String(item.ci || "").toUpperCase();
      if (ciStr) {
        const ciW = font.widthOfTextAtSize(ciStr, 9);
        page.drawText(ciStr, { x: colX[2] + colWidths[2] / 2 - ciW / 2, y: rowTop - 14, size: 9, font, color: COLOR_TEXT });
      }

      // Nro. de Celular
      const celStr = String(item.celular || item.telefono || "").toUpperCase();
      if (celStr) {
        const celW = font.widthOfTextAtSize(celStr, 9);
        page.drawText(celStr, { x: colX[3] + colWidths[3] / 2 - celW / 2, y: rowTop - 14, size: 9, font, color: COLOR_TEXT });
      }

      currentTableY -= rowH;
      hLines.push(currentTableY);
    });

    // Bordes de Tabla
    hLines.forEach((lineY) => {
      page.drawLine({ start: { x: MARGIN_LEFT, y: lineY }, end: { x: MARGIN_LEFT + CONTENT_WIDTH, y: lineY }, thickness: 0.8, color: COLOR_BORDER });
    });
    colX.forEach((lineX) => {
      page.drawLine({ start: { x: lineX, y: tableTop }, end: { x: lineX, y: currentTableY }, thickness: 0.8, color: COLOR_BORDER });
    });

    cursorY = currentTableY - 18;

    // SUBTÍTULO
    page.drawText("Asumiendo las siguientes responsabilidades y compromisos:", {
      x: MARGIN_LEFT, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT,
    });
    cursorY -= 14;

    // COMPROMISOS CON VIÑETA JUSTIFICADOS
    const compromisos = [
      "Implementar procesos de investigación educativa durante la Práctica Educativa Comunitaria de la presente gestión en la UE/CEA/CEE asignada.",
      "Cumplir con responsabilidad, puntualidad y de manera comunitaria las actividades previstas de la Práctica Educativa Comunitaria.",
      "Desarrollar el proceso investigativo con énfasis en la identificación, análisis y priorización de necesidades, problemas y/o potencialidades del contexto educativo.",
      "Participar corresponsablemente en la elaboración del diagnóstico socio participativo y en la presentación del informe, en el marco del proceso formativo de tercer año.",
      "En prueba de conformidad y previa lectura del acta, de manera voluntaria se firma en señal de conformidad y cumplimiento."
    ];

    compromisos.forEach((texto) => {
      page.drawText("•", { x: MARGIN_LEFT + 15, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });

      cursorY = drawJustifiedParagraph(page, plainTokens(texto, font), {
        x: MARGIN_LEFT + 28,
        y: cursorY,
        maxWidth: CONTENT_WIDTH - 28,
        fontSize: 9,
        lineHeight: 12.5,
        spaceFont: font,
      });
      cursorY -= 4;
    });

    cursorY -= 12;

    // LUGAR Y FECHA CENTRADO SOBRE EL ÁREA ÚTIL
    const lblFecha = 'Lugar y fecha: ';
    const valFecha = `${d.lugar_ciudad || 'El Alto'}, ${d.dia || '21'} de ${d.mes || 'septiembre'} de ${d.gestion || '2026'}`;
    
    const wLbl = font.widthOfTextAtSize(lblFecha, 8.5);
    const wVal = fontBold.widthOfTextAtSize(valFecha, 8.5);
    const totalFechaW = wLbl + wVal;
    
    const fechaStartX = CONTENT_CENTER_X - totalFechaW / 2;

    page.drawText(lblFecha, { x: fechaStartX, y: cursorY, size: 8.5, font, color: COLOR_TEXT });
    
    const valStartX = fechaStartX + wLbl;
    page.drawText(valFecha, { x: valStartX, y: cursorY, size: 8.5, font: fontBold, color: COLOR_TEXT });
    
    page.drawLine({
      start: { x: valStartX, y: cursorY - 1.5 },
      end: { x: valStartX + wVal, y: cursorY - 1.5 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });

    cursorY -= 45;

    // 3 FIRMAS SUPERIORES DE ESTUDIANTES
    const colWidthSig = CONTENT_WIDTH / 3;
    const lineW = 120;

    [0, 1, 2].forEach((i) => {
      const xCenter = MARGIN_LEFT + colWidthSig * (i + 0.5);
      const lineStartX = xCenter - lineW / 2;
      const lineEndX = xCenter + lineW / 2;

      page.drawLine({
        start: { x: lineStartX, y: cursorY },
        end: { x: lineEndX, y: cursorY },
        thickness: 0.8,
        dashArray: [1.5, 1.5],
        color: COLOR_TEXT,
      });

      const labelEst = "Estudiante";
      const wEst = fontBold.widthOfTextAtSize(labelEst, 8);
      page.drawText(labelEst, {
        x: xCenter - wEst / 2,
        y: cursorY - 12,
        size: 8,
        font: fontBold,
        color: COLOR_TEXT,
      });
    });

    cursorY -= 50;

    // FIRMA INFERIOR CENTRADA (DOCENTE INVESTIGACIÓN ESFM/UA)
    const lineWDocente = 170;
    const lineDocStartX = CONTENT_CENTER_X - lineWDocente / 2;
    const lineDocEndX = CONTENT_CENTER_X + lineWDocente / 2;

    page.drawLine({
      start: { x: lineDocStartX, y: cursorY },
      end: { x: lineDocEndX, y: cursorY },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });

    const labelDoc = "Docente Investigación de la ESFM/UA";
    const wDoc = fontBold.widthOfTextAtSize(labelDoc, 8);
    page.drawText(labelDoc, {
      x: CONTENT_CENTER_X - wDoc / 2,
      y: cursorY - 12,
      size: 8,
      font: fontBold,
      color: COLOR_TEXT,
    });

    // Renderizar y abrir PDF en nueva pestaña
    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, '_blank');
    return { success: true };

  } catch (error) {
    console.error("Error al generar PDF del Acta de Conformación (3er Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};