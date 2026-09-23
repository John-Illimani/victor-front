import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { fichaF3Service } from "../../../services/fichas/1año/fichaF3Service";

// =============================================================================
// COLORES INSTITUCIONALES OFICIALES
// =============================================================================
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255); // Dorado oficial (#C9A751)
const COLOR_TABLE_HEADER = rgb(247 / 255, 181 / 255, 0); // Amarillo institucional (#F7B500)
const COLOR_BORDER = rgb(0, 0, 0);

// Helper para envolver texto automáticamente
function wrapText(text, font, fontSize, maxWidth) {
  if (!text) return [];
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}

// Helper para notas numéricas
function formatNota(val) {
  if (val === undefined || val === null || val === "") return "";
  const num = parseFloat(val);
  if (isNaN(num)) return "";
  return num % 1 === 0 ? String(Math.round(num)) : String(num);
}

// Helper para limpiar el literal dejando solo el número o texto principal
function formatLiteralOnly(literal) {
  if (!literal) return "";
  return String(literal)
    .toUpperCase()
    .replace(/\s+CON\s+\d+\/\d+/g, "")
    .replace(/\s+00\/100/g, "")
    .replace(/\s+PUNTOS/g, "")
    .trim();
}

export const imprimirFichaF3_1erAno = async (estudianteId) => {
  try {
    const response = await fichaF3Service.getByEstudiante(estudianteId);

    if (!response || !response.existe || !response.datos) {
      return {
        success: false,
        message:
          "No existen datos registrados para la Ficha F-3 de este estudiante. Primero guarda el formulario.",
      };
    }

    const d = response.datos;

    const urlPlantilla = "/pdf/1ano/plantilla.pdf";
    const resFetch = await fetch(urlPlantilla);

    if (!resFetch.ok) {
      return {
        success: false,
        message: `No se encontró la plantilla en la ruta: ${urlPlantilla}.`,
      };
    }

    const pdfBytes = await resFetch.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPages()[0];

    // =========================================================================
    // CONFIGURACIÓN DE PÁGINA Y MÁRGENES (3 cm Izq, 1.81 cm Der)
    // =========================================================================
    page.setSize(612, 792);
    const pageWidth = 612;

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const MARGIN_LEFT = 85.04;  // 3 cm exactos
    const MARGIN_RIGHT = 51.31; // 1.81 cm exactos
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;       // 322.865 pt

    // =========================================================================
    // 1. TÍTULO Y SUBTÍTULO EN ARIAL BOLD (13 PT)
    // =========================================================================
    let cursorY = 665;

    const t1 = "FICHA F-3";
    const t1W = fontBold.widthOfTextAtSize(t1, 13);
    page.drawText(t1, {
      x: CONTENT_CENTER_X - t1W / 2,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: COLOR_TITLE,
    });

    cursorY -= 18;

    const subTitulo1 = "APLICACIÓN DE TÉCNICAS E INSTRUMENTOS DE";
    const subW1 = fontBold.widthOfTextAtSize(subTitulo1, 13);
    page.drawText(subTitulo1, {
      x: CONTENT_CENTER_X - subW1 / 2,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: COLOR_TITLE,
    });

    cursorY -= 16;

    const subTitulo2 = "INVESTIGACIÓN EDUCATIVA";
    const subW2 = fontBold.widthOfTextAtSize(subTitulo2, 13);
    page.drawText(subTitulo2, {
      x: CONTENT_CENTER_X - subW2 / 2,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: COLOR_TITLE,
    });

    cursorY -= 20;

    // Párrafo descriptivo superior (9 pt)
    const descText = "El Equipo Comunitario aplica técnicas e instrumentos de investigación educativa. Las evidencias y resultados de las técnicas e instrumentos de investigación aplicados, deben ser evaluados por la/el docente acompañante de la ESFM/UA.";
    const descLines = wrapText(descText, font, 9, CONTENT_WIDTH);
    
    descLines.forEach((line) => {
      page.drawText(line, {
        x: MARGIN_LEFT,
        y: cursorY,
        size: 9,
        font,
        color: COLOR_TEXT,
      });
      cursorY -= 12;
    });

    cursorY -= 8;

    // =========================================================================
    // 2. DATOS REFERENCIALES DEL ESTUDIANTE CON LÍNEAS PUNTEADAS DEBAJO
    // =========================================================================
    const refTitle = "DATOS REFERENCIALES DEL ESTUDIANTE:";
    page.drawText(refTitle, {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 9,
      font: fontBold,
      color: COLOR_TITLE,
    });
    cursorY -= 16;

    const maxLineRight = MARGIN_LEFT + CONTENT_WIDTH;

    const drawReferentialField = (label, value) => {
      page.drawText(label, { x: MARGIN_LEFT + 15, y: cursorY, size: 9, font, color: COLOR_TEXT });
      const labelW = font.widthOfTextAtSize(label, 9);
      const valX = MARGIN_LEFT + 15 + labelW;
      
      const valText = (value && String(value).trim() !== "" ? value : "").toUpperCase();
      if (valText) {
        page.drawText(valText, { x: valX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
      }
      
      const valW = fontBold.widthOfTextAtSize(valText, 9);
      const lineEndX = valX + Math.max(valW, 140);

      page.drawLine({ 
        start: { x: valX, y: cursorY - 2 }, 
        end: { x: lineEndX, y: cursorY - 2 }, 
        thickness: 0.8, 
        dashArray: [1.5, 1.5], 
        color: COLOR_TEXT 
      });
      cursorY -= 15;
    };

    drawReferentialField("Apellidos y nombres: ", d.apellidos_nombres);
    drawReferentialField("ESFM/UA: ", d.esfm_ua || "ESFM Simón Bolívar / UA El Alto");
    drawReferentialField("Especialidad: ", d.especialidad);

    cursorY -= 15;

    // =========================================================================
    // 3. TABLA EVALUATIVA PRINCIPAL (475.65 PT DE ANCHO ÚTIL)
    // =========================================================================
    const tableTop = cursorY;
    const colWidths = [115, 225, 135.65]; // Anchos ajustados para cabecera 12pt
    const colX = [
      MARGIN_LEFT,
      MARGIN_LEFT + colWidths[0],
      MARGIN_LEFT + colWidths[0] + colWidths[1],
      MARGIN_LEFT + CONTENT_WIDTH,
    ];

    // Encabezado Amarillo (12 pt Bold)
    const headerHeight = 36;
    page.drawRectangle({
      x: MARGIN_LEFT,
      y: tableTop - headerHeight,
      width: CONTENT_WIDTH,
      height: headerHeight,
      color: COLOR_TABLE_HEADER,
    });

    const headers = [
      { text: "ACTIVIDADES", x: colX[0] + colWidths[0] / 2 },
      { text: "INDICADORES", x: colX[1] + colWidths[1] / 2 },
      { text: "VALORACIÓN DE 1 A\n100 PUNTOS", x: colX[2] + colWidths[2] / 2 },
    ];

    headers.forEach((h) => {
      const lines = h.text.split("\n");
      const lineSpacing = 13;
      const totalTextHeight = (lines.length - 1) * lineSpacing;
      const startY = tableTop - (headerHeight / 2) + (totalTextHeight / 2) - 3;

      lines.forEach((line, lineIdx) => {
        const textWidth = fontBold.widthOfTextAtSize(line, 12);
        page.drawText(line, {
          x: h.x - textWidth / 2,
          y: startY - lineIdx * lineSpacing,
          size: 12,
          font: fontBold,
          color: COLOR_TEXT,
        });
      });
    });

    page.drawLine({
      start: { x: MARGIN_LEFT, y: tableTop },
      end: { x: colX[3], y: tableTop },
      thickness: 0.8,
      color: COLOR_BORDER,
    });

    page.drawLine({
      start: { x: MARGIN_LEFT, y: tableTop - headerHeight },
      end: { x: colX[3], y: tableTop - headerHeight },
      thickness: 0.8,
      color: COLOR_BORDER,
    });

    // Filas de la tabla (Contenido en 9 pt)
    const filasData = [
      { text: "Presenta instrumentos aplicados en el contexto de la unidad educativa.", val: d.instrumentos_comunidad },
      { text: "Presenta instrumentos aplicados en la UE/CEA/CEE.", val: d.instrumentos_ue },
      { text: "Presenta instrumentos aplicados en el AULA.", val: d.instrumentos_aula },
    ];

    let rowY = tableTop - headerHeight;
    const rowHeights = [45, 45, 45];

    filasData.forEach((fila, idx) => {
      const currentHeight = rowHeights[idx];
      const nextRowY = rowY - currentHeight;

      // Indicador Texto (9 pt)
      const indLines = wrapText(fila.text, font, 9, colWidths[1] - 16);
      indLines.forEach((l, lIdx) => {
        page.drawText(l, {
          x: colX[1] + 8,
          y: rowY - 14 - lIdx * 11,
          size: 9,
          font,
          color: COLOR_TEXT,
        });
      });

      // Valoración Nota (9 pt Bold)
      const valText = formatNota(fila.val);
      const valWidth = fontBold.widthOfTextAtSize(valText, 9);
      page.drawText(valText, {
        x: colX[2] + colWidths[2] / 2 - valWidth / 2,
        y: rowY - currentHeight / 2 - 3,
        size: 9,
        font: fontBold,
        color: COLOR_TEXT,
      });

      // Línea horizontal interna
      page.drawLine({
        start: { x: colX[1], y: nextRowY },
        end: { x: colX[3], y: nextRowY },
        thickness: 0.8,
        color: COLOR_BORDER,
      });

      rowY = nextRowY;
    });

    // Texto Actividad principal (Abarca las 3 filas en 9 pt Bold)
    const actText = "Instrumentos de diagnóstico validados";
    const actLines = wrapText(actText, fontBold, 9, colWidths[0] - 16);
    const actStartY = (tableTop - headerHeight + rowY) / 2 + (actLines.length * 6);
    
    actLines.forEach((l, lIdx) => {
      const lW = fontBold.widthOfTextAtSize(l, 9);
      page.drawText(l, {
        x: colX[0] + colWidths[0] / 2 - lW / 2,
        y: actStartY - lIdx * 12,
        size: 9,
        font: fontBold,
        color: COLOR_TEXT,
      });
    });

    // Línea completa entre actividad y filas inferiores de promedio
    page.drawLine({
      start: { x: colX[0], y: rowY },
      end: { x: colX[3], y: rowY },
      thickness: 0.8,
      color: COLOR_BORDER,
    });

    // --- FILA DE PROMEDIO NUMERAL (9 PT) ---
    const promNumY = rowY - 22;
    const promNumLabel = "Promedio numeral";
    const promNumLabelW = fontBold.widthOfTextAtSize(promNumLabel, 9);

    page.drawText(promNumLabel, {
      x: colX[2] - promNumLabelW - 8,
      y: rowY - 15,
      size: 9,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const promNumVal = formatNota(d.promedio_numeral);
    const promNumW = fontBold.widthOfTextAtSize(promNumVal, 9);
    page.drawText(promNumVal, {
      x: colX[2] + colWidths[2] / 2 - promNumW / 2,
      y: rowY - 15,
      size: 9,
      font: fontBold,
      color: COLOR_TEXT,
    });

    page.drawLine({
      start: { x: MARGIN_LEFT, y: promNumY },
      end: { x: colX[3], y: promNumY },
      thickness: 0.8,
      color: COLOR_BORDER,
    });

    // --- FILA DE PROMEDIO LITERAL (9 PT) ---
    const promLitY = promNumY - 22;
    page.drawText("Promedio literal", {
      x: colX[0] + 8,
      y: promNumY - 15,
      size: 9,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const promLitVal = formatLiteralOnly(d.promedio_literal);
    page.drawText(promLitVal, {
      x: colX[1] + 8,
      y: promNumY - 15,
      size: 9,
      font,
      color: COLOR_TEXT,
    });

    page.drawLine({
      start: { x: MARGIN_LEFT, y: promLitY },
      end: { x: colX[3], y: promLitY },
      thickness: 0.8,
      color: COLOR_BORDER,
    });

    // Líneas verticales de la tabla superior de evaluación
    [colX[0], colX[1], colX[3]].forEach((xPos) => {
      page.drawLine({
        start: { x: xPos, y: tableTop },
        end: { x: xPos, y: promLitY },
        thickness: 0.8,
        color: COLOR_BORDER,
      });
    });

    page.drawLine({
      start: { x: colX[2], y: tableTop },
      end: { x: colX[2], y: promNumY },
      thickness: 0.8,
      color: COLOR_BORDER,
    });

    // --- FILA DE OBSERVACIONES Y/O SUGERENCIAS (9 PT) ---
    const obsHeight = 65;
    const tableBottom = promLitY - obsHeight;

    page.drawText("Observaciones y/o sugerencias:", {
      x: MARGIN_LEFT + 8,
      y: promLitY - 16,
      size: 9,
      font: fontBold,
      color: COLOR_TEXT,
    });

    if (d.observaciones) {
      const obsText = String(d.observaciones);
      page.drawText(obsText, {
        x: MARGIN_LEFT + 8,
        y: promLitY - 32,
        size: 9,
        font,
        color: COLOR_TEXT,
        maxWidth: CONTENT_WIDTH - 16,
        lineHeight: 13,
      });
    }

    // Cierre del marco exterior de la tabla
    page.drawLine({
      start: { x: MARGIN_LEFT, y: tableBottom },
      end: { x: colX[3], y: tableBottom },
      thickness: 0.8,
      color: COLOR_BORDER,
    });

    page.drawLine({
      start: { x: MARGIN_LEFT, y: tableTop },
      end: { x: MARGIN_LEFT, y: tableBottom },
      thickness: 0.8,
      color: COLOR_BORDER,
    });

    page.drawLine({
      start: { x: colX[3], y: tableTop },
      end: { x: colX[3], y: tableBottom },
      thickness: 0.8,
      color: COLOR_BORDER,
    });

    cursorY = tableBottom - 35;

    // =========================================================================
    // 4. LUGAR Y FECHA CENTRADO ABAJO CON LÍNEA PUNTEADA DEBAJO (9 PT)
    // =========================================================================
    const lblFecha = "Lugar y fecha: ";
    const valFecha = `${d.lugar_ciudad || "El Alto"}, ${d.dia || "17"} de ${d.mes || "septiembre"} de ${d.ano || "2026"}`;
    
    const wLbl = font.widthOfTextAtSize(lblFecha, 9);
    const wVal = fontBold.widthOfTextAtSize(valFecha, 9);
    const totalFechaW = wLbl + wVal;
    
    const fechaStartX = CONTENT_CENTER_X - totalFechaW / 2;

    page.drawText(lblFecha, { x: fechaStartX, y: cursorY, size: 9, font, color: COLOR_TEXT });
    
    const fechaValStartX = fechaStartX + wLbl;
    page.drawText(valFecha, { x: fechaValStartX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    
    page.drawLine({
      start: { x: fechaValStartX, y: cursorY - 2 },
      end: { x: fechaValStartX + wVal, y: cursorY - 2 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });

    cursorY -= 45;

    // =========================================================================
    // 5. FIRMA: DOCENTE ACOMPAÑANTE ESFM/UA CENTRADA AL MEDIO (9 PT)
    // =========================================================================
    const sigLine = "..........................................................";
    const sigLabel = "Docente Acompañante ESFM/UA";

    const sigLineW = font.widthOfTextAtSize(sigLine, 9);
    const sigLabelW = font.widthOfTextAtSize(sigLabel, 9);

    page.drawText(sigLine, {
      x: CONTENT_CENTER_X - sigLineW / 2,
      y: cursorY,
      size: 9,
      font,
      color: COLOR_TEXT,
    });

    page.drawText(sigLabel, {
      x: CONTENT_CENTER_X - sigLabelW / 2,
      y: cursorY - 12,
      size: 9,
      font,
      color: COLOR_TEXT,
    });

    // =========================================================================
    // 6. RENDERIZAR Y MOSTRAR EN NAVEGADOR
    // =========================================================================
    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, "_blank");
    return { success: true };
  } catch (error) {
    console.error("Error al generar PDF de Ficha F-3:", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`,
    };
  }
};