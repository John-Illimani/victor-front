import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { actaSocializacion3erAnoService } from '../../../services/fichas/3año/actaSocializacion3erAnoService';

// Paleta de Colores Institucionales
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255); // Dorado (#C9A751)

// Helpers para Tokenización (Texto Fijo vs Texto Rellenado)
const plainTokens = (text, font, color) =>
  String(text ?? '').split(/\s+/).filter(Boolean).map((w) => ({ text: w, font, color }));

const underlineTokens = (text, font, color) =>
  String(text ?? '').split(/\s+/).filter(Boolean).map((w) => ({ text: w, font, color, underline: true }));

// Trazo de Línea Punteada Horizontal
function drawDottedLine(page, x1, x2, y) {
  page.drawLine({
    start: { x: x1, y },
    end: { x: x2, y },
    thickness: 0.8,
    dashArray: [1.5, 1.5],
    color: COLOR_TEXT,
  });
}

// Función de Justificación por Tokens Exacta (Renderizado Palabra por Palabra)
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
        drawDottedLine(page, cursorX, cursorX + wordW, cursorY - 1.5);
      }

      cursorX += wordW + gapWidth;
    });

    cursorY -= lineHeight;
  });

  return cursorY;
}

export const imprimirActaSocializacion3erAno = async (estudianteId) => {
  try {
    const response = await actaSocializacion3erAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para el Acta de Socialización del Diagnóstico."
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

    // Carga de Fuentes Calibri
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
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // TÍTULO PRINCIPAL (13 pt Bold Dorado Centrado)
    const titleLines = [
      "ACTA DE SOCIALIZACIÓN DEL DIAGNÓSTICO",
      "DEL EQUIPO COMUNITARIO"
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

    cursorY -= 10;

    // PÁRRAFO INTRODUCTORIO JUSTIFICADO Y TOKENIZADO
    const introTokensList = [
      ...plainTokens('En la ciudad/localidad de', font),
      ...underlineTokens(`${d.lugar_ciudad || 'El Alto'},`, fontBold),
      ...plainTokens('en el distrito de', font),
      ...underlineTokens(`${d.distrito || 'Distrito 1'},`, fontBold),
      ...plainTokens('a horas', font),
      ...underlineTokens(`${d.hora || '10:00'}`, fontBold),
      ...plainTokens('del día', font),
      ...underlineTokens(`${d.dia || '21'}`, fontBold),
      ...plainTokens('del mes de', font),
      ...underlineTokens(`${d.mes || 'SEPTIEMBRE'}`, fontBold),
      ...plainTokens('de la gestión', font),
      ...underlineTokens(`${d.gestion || '2026'},`, fontBold),
      ...plainTokens('las y los estudiantes del Equipo Comunitario, de la especialidad de', font),
      ...underlineTokens(`${(d.especialidad || 'EDUCACIÓN PRIMARIA COMUNITARIA VOCACIONAL').toUpperCase()}`, fontBold),
      ...plainTokens('se reúnen con la finalidad de socializar el diagnóstico desarrollado en la UE/CEA/CEE:', font),
      ...underlineTokens(`${d.ue_cea_cee || ''}`, fontBold),
    ];

    cursorY = drawJustifiedParagraph(page, introTokensList, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 9.5,
      lineHeight: 14.5,
      spaceFont: font,
    });

    cursorY -= 14;

    // PÁRRAFO SECUNDARIO DE OBSERVACIONES
    const secText = "Después de socializar los resultados parciales y principales hallazgos se toman en cuentas las siguientes observaciones y/o sugerencias de los asistentes:";
    cursorY = drawJustifiedParagraph(page, plainTokens(secText, font), {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 9.5,
      lineHeight: 14,
      spaceFont: font,
    });

    cursorY -= 16;

    // LISTA DE OBSERVACIONES (NUMERADAS DEL 1 AL 4)
    const observaciones = [
      d.observacion_1 || '',
      d.observacion_2 || '',
      d.observacion_3 || '',
      d.observacion_4 || ''
    ];

    observaciones.forEach((obs, index) => {
      const numLabel = `${index + 1}.`;
      page.drawText(numLabel, {
        x: MARGIN_LEFT,
        y: cursorY,
        size: 9.5,
        font: fontBold,
        color: COLOR_TEXT,
      });

      const labelWidth = fontBold.widthOfTextAtSize(numLabel, 9.5) + 4;
      const lineStartX = MARGIN_LEFT + labelWidth;

      // Si hay texto registrado en la observación
      const valObs = String(obs ?? '').trim();
      if (valObs) {
        page.drawText(valObs, {
          x: lineStartX,
          y: cursorY,
          size: 9,
          font: fontBold,
          color: COLOR_TEXT,
        });
      }

      // Dibujar línea punteada completa para cada punto
      drawDottedLine(page, lineStartX, RIGHT_X, cursorY - 2);

      cursorY -= 22;
    });

    cursorY -= 8;

    // LEYENDA PREVIA A FIRMAS
    const leyendaFirmas = "En conformidad del diagnóstico presentado firman los participantes:";
    page.drawText(leyendaFirmas, {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 9.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    cursorY -= 45;

    // FILA 1 DE FIRMAS (3 ESTUDIANTES)
    const colWidth3 = CONTENT_WIDTH / 3;
    const lineW3 = 120;

    [0, 1, 2].forEach((i) => {
      const xCenter = MARGIN_LEFT + colWidth3 * (i + 0.5);
      const lineStartX = xCenter - lineW3 / 2;
      const lineEndX = xCenter + lineW3 / 2;

      drawDottedLine(page, lineStartX, lineEndX, cursorY);

      const labelEst = "Estudiante";
      const wEst = fontBold.widthOfTextAtSize(labelEst, 8.5);
      page.drawText(labelEst, {
        x: xCenter - wEst / 2,
        y: cursorY - 12,
        size: 8.5,
        font: fontBold,
        color: COLOR_TEXT,
      });
    });

    cursorY -= 50;

    // FILA 2 DE FIRMAS (DIRECTOR UE/CEA/CEE Y DOCENTE GUÍA)
    const colWidth2 = CONTENT_WIDTH / 2;
    const lineW2 = 150;

    const fila2 = [
      { label: "Director de UE/CEA/CEE", colIndex: 0 },
      { label: "Docente Guía", colIndex: 1 }
    ];

    fila2.forEach((item) => {
      const xCenter = MARGIN_LEFT + colWidth2 * (item.colIndex + 0.5);
      const lineStartX = xCenter - lineW2 / 2;
      const lineEndX = xCenter + lineW2 / 2;

      drawDottedLine(page, lineStartX, lineEndX, cursorY);

      const wLabel = fontBold.widthOfTextAtSize(item.label, 8.5);
      page.drawText(item.label, {
        x: xCenter - wLabel / 2,
        y: cursorY - 12,
        size: 8.5,
        font: fontBold,
        color: COLOR_TEXT,
      });
    });

    cursorY -= 55;

    // FILA 3 DE FIRMAS (REPRESENTANTE COMUNIDAD Y DOCENTE ACOMPAÑANTE ESFM/UA)
    const lineW3ra = 170;

    const fila3 = [
      "Representante de la Comunidad",
      "Docente Acompañante de la ESFM/UA"
    ];

    fila3.forEach((lbl) => {
      const lineStartX = CONTENT_CENTER_X - lineW3ra / 2;
      const lineEndX = CONTENT_CENTER_X + lineW3ra / 2;

      drawDottedLine(page, lineStartX, lineEndX, cursorY);

      const wLbl = fontBold.widthOfTextAtSize(lbl, 8.5);
      page.drawText(lbl, {
        x: CONTENT_CENTER_X - wLbl / 2,
        y: cursorY - 12,
        size: 8.5,
        font: fontBold,
        color: COLOR_TEXT,
      });

      cursorY -= 42;
    });

    // Guardar y renderizar PDF en ventana emergente
    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, '_blank');
    return { success: true };

  } catch (error) {
    console.error("Error al generar PDF del Acta de Socialización (3er Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};