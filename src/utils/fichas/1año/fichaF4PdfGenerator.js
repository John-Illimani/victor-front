import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { fichaF4Service } from "../../../services/fichas/1año/fichaF4Service";

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

// Helper para formatear y redondear notas/promedios al entero más cercano
function formatNota(val) {
  if (val === undefined || val === null || val === "") return "";
  const num = parseFloat(val);
  if (isNaN(num)) return "";
  return String(Math.round(num));
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

export const imprimirFichaF4_1erAno = async (estudianteId) => {
  try {
    const response = await fichaF4Service.getByEstudiante(estudianteId);

    if (!response || !response.existe || !response.datos) {
      return {
        success: false,
        message:
          "No existen datos registrados para la Ficha F-4 de este estudiante. Primero guarda el formulario.",
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
    // 1. TÍTULO Y SUBTÍTULO EN ARIAL BOLD (13 PT) - INICIO MÁS ARRIBA (675 PT)
    // =========================================================================
    let cursorY = 675;

    const t1 = "FICHA F-4";
    const t1W = fontBold.widthOfTextAtSize(t1, 13);
    page.drawText(t1, {
      x: CONTENT_CENTER_X - t1W / 2,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: COLOR_TITLE,
    });

    cursorY -= 16;

    const subTituloLineas = [
      "SEGUIMIENTO DE LA/EL DOCENTE GUÍA Y LA/EL DIRECTOR",
      "DE UE/CEA/CEE"
    ];

    subTituloLineas.forEach((linea) => {
      const lineW = fontBold.widthOfTextAtSize(linea, 13);
      page.drawText(linea, {
        x: CONTENT_CENTER_X - lineW / 2,
        y: cursorY,
        size: 13,
        font: fontBold,
        color: COLOR_TITLE,
      });
      cursorY -= 15;
    });

    cursorY -= 8;

    // Párrafo descriptivo superior (9 pt)
    const descText = "La/el Docente Guía y la/el Director realiza seguimiento a la/el estudiante, evaluando la presente ficha, antes de la finalización de la PEC.";
    const descLines = wrapText(descText, font, 9, CONTENT_WIDTH);
    
    descLines.forEach((line) => {
      page.drawText(line, {
        x: MARGIN_LEFT,
        y: cursorY,
        size: 9,
        font,
        color: COLOR_TEXT,
      });
      cursorY -= 11;
    });

    cursorY -= 6;

    // =========================================================================
    // 2. DATOS REFERENCIALES CON LÍNEAS PUNTEADAS DEBAJO
    // =========================================================================
    const refTitle = "DATOS REFERENCIALES DEL ESTUDIANTE:";
    page.drawText(refTitle, {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 9,
      font: fontBold,
      color: COLOR_TITLE,
    });
    cursorY -= 14;

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
        color: COLOR_TEXT,
      });
      cursorY -= 13;
    };

    drawReferentialField("Apellidos y nombres: ", d.apellidos_nombres);
    drawReferentialField("ESFM/UA: ", d.esfm_ua || "ESFM Simón Bolívar / UA El Alto");
    drawReferentialField("Especialidad: ", d.especialidad);

    cursorY -= 10;

    // =========================================================================
    // 3. TABLA EVALUATIVA PRINCIPAL (475.65 PT DE ANCHO ÚTIL)
    // =========================================================================
    const tableTop = cursorY;
    const colWidths = [115, 225, 135.65];
    const colX = [
      MARGIN_LEFT,
      MARGIN_LEFT + colWidths[0],
      MARGIN_LEFT + colWidths[0] + colWidths[1],
      MARGIN_LEFT + CONTENT_WIDTH,
    ];

    // Encabezado Amarillo (12 pt Bold)
    const headerHeight = 34;
    page.drawRectangle({
      x: MARGIN_LEFT,
      y: tableTop - headerHeight,
      width: CONTENT_WIDTH,
      height: headerHeight,
      color: COLOR_TABLE_HEADER,
    });

    const headers = [
      { text: "DIMENSIONES", x: colX[0] + colWidths[0] / 2 },
      { text: "INDICADORES", x: colX[1] + colWidths[1] / 2 },
      { text: "VALORACIÓN DE 1 A\n100 PUNTOS", x: colX[2] + colWidths[2] / 2 },
    ];

    headers.forEach((h) => {
      const lines = h.text.split("\n");
      const lineSpacing = 12;
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

    // Filas de las 4 dimensiones (SER, SABER, HACER, DECIDIR en 9 pt)
    const filasData = [
      {
        dim: "SER",
        indicadores: [
          "Demuestra puntualidad y respeto en el trato con estudiantes, madres/padres de familia, maestras, maestros y personal de la UE/CEA/CEE.",
          "Demuestra proactividad en la PEC."
        ],
        val: d.dimension_ser
      },
      {
        dim: "SABER",
        indicadores: [
          "Demuestra conocimientos sobre la realidad educativa de la institución.",
          "Manifiesta interés por el proceso pedagógico."
        ],
        val: d.dimension_saber
      },
      {
        dim: "HACER",
        indicadores: [
          "Realiza con esmero y diligencia las actividades previamente planificadas en su plan de acción con interés y compromiso."
        ],
        val: d.dimension_hacer
      },
      {
        dim: "DECIDIR",
        indicadores: [
          "Muestra iniciativa, creatividad en el acompañamiento y la lectura de la realidad en la UE/ CEA/CEE.",
          "Asume un compromiso de cambio en el contexto educativo."
        ],
        val: d.dimension_decidir
      },
    ];

    let rowY = tableTop - headerHeight;

    filasData.forEach((fila) => {
      const rowStartY = rowY;

      let totalIndLinesCount = 0;
      const processedInds = fila.indicadores.map((indText) => {
        const lines = wrapText(indText, font, 9, colWidths[1] - 16);
        totalIndLinesCount += lines.length;
        return lines;
      });

      const lineSpacing = 11;
      const cellPadding = 10;
      const dimHeight = Math.max(32, totalIndLinesCount * lineSpacing + cellPadding);
      const dimBottomY = rowY - dimHeight;

      let currentIndTextY = rowY - 10;
      processedInds.forEach((lines) => {
        lines.forEach((l) => {
          page.drawText(l, {
            x: colX[1] + 8,
            y: currentIndTextY,
            size: 9,
            font,
            color: COLOR_TEXT,
          });
          currentIndTextY -= lineSpacing;
        });
        currentIndTextY -= 2;
      });

      const valText = formatNota(fila.val);
      const valWidth = fontBold.widthOfTextAtSize(valText, 9);
      page.drawText(valText, {
        x: colX[2] + colWidths[2] / 2 - valWidth / 2,
        y: rowY - dimHeight / 2 - 3,
        size: 9,
        font: fontBold,
        color: COLOR_TEXT,
      });

      page.drawLine({
        start: { x: colX[1], y: dimBottomY },
        end: { x: colX[3], y: dimBottomY },
        thickness: 0.8,
        color: COLOR_BORDER,
      });

      const dimLines = wrapText(fila.dim, fontBold, 9, colWidths[0] - 12);
      const dimTextStartY = rowStartY - (rowStartY - dimBottomY) / 2 + (dimLines.length * 4);
      dimLines.forEach((dl, dlIdx) => {
        const dlW = fontBold.widthOfTextAtSize(dl, 9);
        page.drawText(dl, {
          x: colX[0] + colWidths[0] / 2 - dlW / 2,
          y: dimTextStartY - dlIdx * 11,
          size: 9,
          font: fontBold,
          color: COLOR_TEXT,
        });
      });

      page.drawLine({
        start: { x: colX[0], y: dimBottomY },
        end: { x: colX[3], y: dimBottomY },
        thickness: 0.8,
        color: COLOR_BORDER,
      });

      rowY = dimBottomY;
    });

    // --- FILA DE PROMEDIO NUMERAL (9 PT) ---
    const promNumY = rowY - 20;
    const promNumLabel = "Promedio numeral";
    const promNumLabelW = fontBold.widthOfTextAtSize(promNumLabel, 9);

    page.drawText(promNumLabel, {
      x: colX[2] - promNumLabelW - 8,
      y: rowY - 14,
      size: 9,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const promNumVal = formatNota(d.promedio_numeral);
    const promNumW = fontBold.widthOfTextAtSize(promNumVal, 9);
    page.drawText(promNumVal, {
      x: colX[2] + colWidths[2] / 2 - promNumW / 2,
      y: rowY - 14,
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
    const promLitY = promNumY - 20;
    page.drawText("Promedio literal", {
      x: colX[0] + 8,
      y: promNumY - 14,
      size: 9,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const promLitVal = formatLiteralOnly(d.promedio_literal);
    page.drawText(promLitVal, {
      x: colX[1] + 8,
      y: promNumY - 14,
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

    // Líneas verticales de la tabla
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

    // --- FILA DE OBSERVACIONES Y/O SUGERENCIAS (50 PT) ---
    const obsHeight = 50;
    const tableBottom = promLitY - obsHeight;

    page.drawText("Observaciones y/o sugerencias:", {
      x: MARGIN_LEFT + 8,
      y: promLitY - 14,
      size: 9,
      font: fontBold,
      color: COLOR_TEXT,
    });

    if (d.observaciones) {
      const obsText = String(d.observaciones);
      page.drawText(obsText, {
        x: MARGIN_LEFT + 8,
        y: promLitY - 26,
        size: 9,
        font,
        color: COLOR_TEXT,
        maxWidth: CONTENT_WIDTH - 16,
        lineHeight: 11,
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

    cursorY = tableBottom - 25;

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

    cursorY -= 35;

    // =========================================================================
    // 5. FIRMAS: DOCENTE GUÍA Y DIRECTOR/A UE/CEA/CEE CENTRADAS ABAJO (9 PT)
    // =========================================================================
    const sigWidth = 160;
    const sig1X = MARGIN_LEFT + 30;
    const sig2X = MARGIN_LEFT + CONTENT_WIDTH - sigWidth - 30;

    // Firma 1: Docente Guía
    page.drawLine({
      start: { x: sig1X, y: cursorY },
      end: { x: sig1X + sigWidth, y: cursorY },
      thickness: 0.8,
      dashArray: [2, 2],
      color: COLOR_BORDER,
    });

    const sigLbl1 = "Docente Guía";
    const sigLbl1W = font.widthOfTextAtSize(sigLbl1, 9);
    page.drawText(sigLbl1, {
      x: sig1X + sigWidth / 2 - sigLbl1W / 2,
      y: cursorY - 12,
      size: 9,
      font,
      color: COLOR_TEXT,
    });

    // Firma 2: Director/a UE/CEA/CEE
    page.drawLine({
      start: { x: sig2X, y: cursorY },
      end: { x: sig2X + sigWidth, y: cursorY },
      thickness: 0.8,
      dashArray: [2, 2],
      color: COLOR_BORDER,
    });

    const sigLbl2 = "Director/a UE/CEA/CEE";
    const sigLbl2W = font.widthOfTextAtSize(sigLbl2, 9);
    page.drawText(sigLbl2, {
      x: sig2X + sigWidth / 2 - sigLbl2W / 2,
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
    console.error("Error al generar PDF de Ficha F-4:", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`,
    };
  }
};