import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { fichaF1Service } from "../../../services/fichas/1año/fichaF1Service";

// =============================================================================
// COLORES INSTITUCIONALES OFICIALES
// =============================================================================
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255); // Dorado oficial (#C9A751)
const COLOR_TABLE_HEADER = rgb(247 / 255, 181 / 255, 0); // Amarillo institucional (#F7B500)
const COLOR_BORDER = rgb(0, 0, 0);

// Helper para envolver texto automáticamente según el ancho disponible
function wrapText(text, font, fontSize, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
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

// Helper para formatear notas: Enteros sin decimales (45), decimales completos (78.45)
function formatNota(val) {
  if (val === undefined || val === null || val === "") return "";
  const num = parseFloat(val);
  if (isNaN(num)) return "";
  return num % 1 === 0 ? String(Math.round(num)) : String(num);
}

// Helper para limpiar el literal dejando solo el número entero
function formatLiteralOnly(literal) {
  if (!literal) return "";
  return String(literal)
    .toUpperCase()
    .replace(/\s+CON\s+\d+\/\d+/g, "")
    .replace(/\s+00\/100/g, "")
    .replace(/\s+PUNTOS/g, "")
    .trim();
}

export const imprimirFichaF1_1erAno = async (estudianteId) => {
  try {
    const response = await fichaF1Service.getByEstudiante(estudianteId);

    if (!response || !response.existe || !response.datos) {
      return {
        success: false,
        message:
          "No existen datos registrados para la Ficha F-1 de este estudiante. Primero guarda la evaluación.",
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
    page.setSize(612, 792); // Tamaño Carta Estándar
    const pageWidth = 612;

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const MARGIN_LEFT = 85.04;  // 3 cm exactos
    const MARGIN_RIGHT = 51.31; // 1.81 cm exactos
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;       // 322.865 pt

    // =========================================================================
    // 1. TÍTULO OFICIAL EN ARIAL BOLD (13 PT)
    // =========================================================================
    let cursorY = 665;

    const t1 = "FICHA F-1";
    const t1W = fontBold.widthOfTextAtSize(t1, 13);
    page.drawText(t1, {
      x: CONTENT_CENTER_X - t1W / 2,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: COLOR_TITLE,
    });

    cursorY -= 18;

    const subTitulo =
      "ELABORACIÓN Y VALIDACIÓN DE INSTRUMENTOS DE INVESTIGACIÓN";
    const subW = fontBold.widthOfTextAtSize(subTitulo, 13);
    page.drawText(subTitulo, {
      x: CONTENT_CENTER_X - subW / 2,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: COLOR_TITLE,
    });

    cursorY -= 22;

    // =========================================================================
    // 2. TABLA EVALUATIVA COMPLETA (475.65 PT DE ANCHO ÚTIL)
    // =========================================================================
    const tableTop = cursorY;

    // REDISTRIBUCIÓN DE ANCHOS:
    // Columna 1 (Actividades): 115 pt
    // Columna 2 (Indicadores): 225 pt (se reduce para dar espacio a la valoración)
    // Columna 3 (Valoración): 135.65 pt (se amplía para que quepa 12pt holgadamente)
    const colWidths = [115, 225, 135.65];
    const colX = [
      MARGIN_LEFT,
      MARGIN_LEFT + colWidths[0],
      MARGIN_LEFT + colWidths[0] + colWidths[1],
      MARGIN_LEFT + CONTENT_WIDTH,
    ];

    // --- ENCABEZADO DE LA TABLA (12 PT BOLD SIEMPRE) ---
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
        // Texto estricto en 12 pt Bold
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

    // LÍNEAS HORIZONTALES DEL ENCABEZADO
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

    // --- FILAS Y CRITERIOS EVALUATIVOS (CONTENIDO EN 9 PT) ---
    const filasData = [
      {
        actividad: "Plan de acción del\nEquipo Comunitario\nde la PEC.",
        indicadores: [
          {
            text: "Elabora y presenta el plan de acción al docente de Investigación en base a información preliminar.",
            val: d.f1_criterio_1,
          },
          {
            text: "El plan de acción contempla la observación a los tres escenarios geográficos: comunidad, UE/CEA/ CEE, aula.",
            val: d.f1_criterio_2,
          },
        ],
      },
      {
        actividad: "Instrumentos\nvalidados.",
        indicadores: [
          {
            text: "Elabora y presenta instrumentos sellados y validados pertinentes al contexto de la PEC.",
            val: d.f1_criterio_3,
          },
          {
            text: "Los instrumentos validados responden a la aplicación en los 3 escenarios geográficos.",
            val: d.f1_criterio_4,
          },
        ],
      },
    ];

    let rowY = tableTop - headerHeight;

    filasData.forEach((row) => {
      const rowStartY = rowY;

      row.indicadores.forEach((ind) => {
        const indMaxWidth = colWidths[1] - 16;
        const lines = wrapText(ind.text, font, 9, indMaxWidth);

        const lineSpacing = 12;
        const cellPadding = 16;
        const indHeight = Math.max(
          36,
          lines.length * lineSpacing + cellPadding
        );
        const indBottomY = rowY - indHeight;

        // Texto del indicador (9 pt)
        const textStartY = rowY - 13;
        lines.forEach((l, lIdx) => {
          page.drawText(l, {
            x: colX[1] + 8,
            y: textStartY - lIdx * lineSpacing,
            size: 9,
            font,
            color: COLOR_TEXT,
          });
        });

        // Puntaje formateado (9 pt)
        const valText = formatNota(ind.val);
        const valWidth = fontBold.widthOfTextAtSize(valText, 9);
        page.drawText(valText, {
          x: colX[2] + colWidths[2] / 2 - valWidth / 2,
          y: rowY - indHeight / 2 - 3,
          size: 9,
          font: fontBold,
          color: COLOR_TEXT,
        });

        // Línea divisoria interna de indicador
        page.drawLine({
          start: { x: colX[1], y: indBottomY },
          end: { x: colX[3], y: indBottomY },
          thickness: 0.8,
          color: COLOR_BORDER,
        });

        rowY = indBottomY;
      });

      // Texto de Actividad (9 pt Centrado verticalmente)
      const actLines = row.actividad.split("\n");
      const actHeight = rowStartY - rowY;
      const actLineSpacing = 12;
      const actTextStartY =
        rowStartY -
        actHeight / 2 +
        ((actLines.length - 1) * actLineSpacing) / 2 -
        3;

      actLines.forEach((l, lIdx) => {
        page.drawText(l, {
          x: colX[0] + 8,
          y: actTextStartY - lIdx * actLineSpacing,
          size: 9,
          font: fontBold,
          color: COLOR_TEXT,
        });
      });

      // Línea divisoria completa entre actividades
      page.drawLine({
        start: { x: colX[0], y: rowY },
        end: { x: colX[3], y: rowY },
        thickness: 0.8,
        color: COLOR_BORDER,
      });
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

    // --- LÍNEAS VERTICALES DE LA TABLA ---
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

    // --- FILA INTEGRADA DE OBSERVACIONES Y/O SUGERENCIAS (9 PT) ---
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

    // BASE Y BORDES EXTERNOS FINALES
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
    // 3. LUGAR Y FECHA DE EMISIÓN CENTRADO ABAJO CON LÍNEA PUNTEADA DEBAJO
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
      color: COLOR_TEXT 
    });

    cursorY -= 45;

    // =========================================================================
    // 4. FIRMAS DE ESTUDIANTES (CENTRADO INFERIOR DISTRIBUIDO)
    // =========================================================================
    const signatureWidth = 95;
    const totalSignatures = 3;
    const gapBetween =
      (CONTENT_WIDTH - signatureWidth * totalSignatures) /
      (totalSignatures - 1);

    for (let i = 0; i < totalSignatures; i++) {
      const sigX = MARGIN_LEFT + i * (signatureWidth + gapBetween);

      page.drawLine({
        start: { x: sigX, y: cursorY },
        end: { x: sigX + signatureWidth, y: cursorY },
        thickness: 0.8,
        color: COLOR_BORDER,
      });

      const label = "Estudiante";
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
    // 5. FIRMA DEL DOCENTE DE INVESTIGACIÓN ESFM/UA (CENTRADO)
    // =========================================================================
    const docLine =
      "..........................................................";
    const docLabel = "Docente de investigación ESFM/UA";
    const docLineW = font.widthOfTextAtSize(docLine, 9);
    const docLabelW = font.widthOfTextAtSize(docLabel, 9);

    page.drawText(docLine, {
      x: CONTENT_CENTER_X - docLineW / 2,
      y: cursorY,
      size: 9,
      font,
      color: COLOR_TEXT,
    });

    page.drawText(docLabel, {
      x: CONTENT_CENTER_X - docLabelW / 2,
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
    console.error("Error al generar PDF de Ficha F-1:", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`,
    };
  }
};