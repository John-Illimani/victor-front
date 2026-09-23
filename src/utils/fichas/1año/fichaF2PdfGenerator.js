import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { fichaF2Service } from "../../../services/fichas/1año/fichaF2Service";

// =============================================================================
// COLORES INSTITUCIONALES OFICIALES
// =============================================================================
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255); // Dorado oficial (#C9A751)
const COLOR_TABLE_HEADER = rgb(247 / 255, 181 / 255, 0); // Amarillo institucional (#F7B500)
const COLOR_BORDER = rgb(0, 0, 0);

// Helper para envolver texto automáticamente en celdas o campos
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

// Helper para formatear notas y porcentajes
function formatNota(val) {
  if (val === undefined || val === null || val === "") return "";
  const num = parseFloat(val);
  if (isNaN(num)) return "";
  return num % 1 === 0 ? String(Math.round(num)) : String(num);
}

// Helper para limpiar fechas con formato ISO a formato limpio con guiones (DD-MM-AA)
function formatFecha(val) {
  if (!val) return "............";
  const str = String(val).trim();
  if (str.includes("T")) {
    const fechaPart = str.split("T")[0];
    const partes = fechaPart.split("-");
    if (partes.length === 3) {
      return `${partes[2]}-${partes[1]}-${partes[0].slice(-2)}`;
    }
  }
  return str;
}

export const imprimirFichaF2_1erAno = async (estudianteId) => {
  try {
    const response = await fichaF2Service.getByEstudiante(estudianteId);

    if (!response || !response.existe || !response.datos) {
      return {
        success: false,
        message:
          "No existen datos registrados para la Ficha F-2 de este estudiante. Primero guarda el formulario.",
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
    page.setSize(612, 792); // Tamaña Carta
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

    const t1 = "FICHA F-2";
    const t1W = fontBold.widthOfTextAtSize(t1, 13);
    page.drawText(t1, {
      x: CONTENT_CENTER_X - t1W / 2,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: COLOR_TITLE,
    });

    cursorY -= 18;

    const subTituloLineas = [
      "CONTROL DE ASISTENCIA DE LA PRÁCTICA EDUCATIVA",
      "COMUNITARIA (PEC)"
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
      cursorY -= 16;
    });

    cursorY -= 10;

    // Párrafo descriptivo superior (9 pt)
    const descText = "La presente ficha debe ser sellada por la/el docente guía de la UE/CEA/CEE y la/el Directora y debe registrar la asistencia, faltas y atrasos del estudiante.";
    const descLines = wrapText(descText, font, 9, CONTENT_WIDTH);
    
    descLines.forEach((line) => {
      page.drawText(line, {
        x: MARGIN_LEFT,
        y: cursorY,
        size: 9,
        font,
        color: COLOR_TEXT,
      });
      cursorY -= 13;
    });

    cursorY -= 10;

    // =========================================================================
    // 2. TABLA PRINCIPAL: INFORME DE ACTIVIDADES DE LA SEMANA (ENCABEZADOS EN 12 PT)
    // =========================================================================
    const tableTop = cursorY;
    const colWidths = [45, CONTENT_WIDTH - 45];
    const colX = [MARGIN_LEFT, MARGIN_LEFT + colWidths[0], MARGIN_LEFT + CONTENT_WIDTH];

    const headerHeight = 28;
    page.drawRectangle({
      x: MARGIN_LEFT,
      y: tableTop - headerHeight,
      width: CONTENT_WIDTH,
      height: headerHeight,
      color: COLOR_TABLE_HEADER,
    });

    const h1 = "Nº";
    const h1W = fontBold.widthOfTextAtSize(h1, 12);
    page.drawText(h1, {
      x: colX[0] + colWidths[0] / 2 - h1W / 2,
      y: tableTop - 18,
      size: 12,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const h2 = "BREVE INFORME DE ACTIVIDADES DE LA SEMANA";
    const h2W = fontBold.widthOfTextAtSize(h2, 12);
    page.drawText(h2, {
      x: colX[1] + colWidths[1] / 2 - h2W / 2,
      y: tableTop - 18,
      size: 12,
      font: fontBold,
      color: COLOR_TEXT,
    });

    page.drawLine({
      start: { x: MARGIN_LEFT, y: tableTop - headerHeight },
      end: { x: colX[2], y: tableTop - headerHeight },
      thickness: 0.8,
      color: COLOR_BORDER,
    });

    const diasData = [
      { num: "Día 1", text: d.actividades_dia1 },
      { num: "Día 2", text: d.actividades_dia2 },
      { num: "Día 3", text: d.actividades_dia3 },
      { num: "Día 4", text: d.actividades_dia4 },
      { num: "Día 5", text: d.actividades_dia5 },
    ];

    let rowY = tableTop - headerHeight;
    const rowHeight = 42;

    diasData.forEach((dia) => {
      const nextRowY = rowY - rowHeight;

      const diaW = fontBold.widthOfTextAtSize(dia.num, 9);
      page.drawText(dia.num, {
        x: colX[0] + colWidths[0] / 2 - diaW / 2,
        y: rowY - 24,
        size: 9,
        font: fontBold,
        color: COLOR_TEXT,
      });

      const promptLabel = "Breve detalle de actividades realizadas por la/el estudiante:";
      page.drawText(promptLabel, {
        x: colX[1] + 8,
        y: rowY - 12,
        size: 9,
        font: fontBold,
        color: rgb(0.3, 0.3, 0.3),
      });

      if (dia.text) {
        const actLines = wrapText(String(dia.text), font, 9, colWidths[1] - 16);
        actLines.slice(0, 2).forEach((l, lIdx) => {
          page.drawText(l, {
            x: colX[1] + 8,
            y: rowY - 24 - lIdx * 11,
            size: 9,
            font,
            color: COLOR_TEXT,
          });
        });
      } else {
        for (let lineIdx = 0; lineIdx < 2; lineIdx++) {
          page.drawLine({
            start: { x: colX[1] + 8, y: rowY - 24 - lineIdx * 11 },
            end: { x: colX[2] - 8, y: rowY - 24 - lineIdx * 11 },
            thickness: 0.5,
            dashArray: [1.5, 1.5],
            color: rgb(0.6, 0.6, 0.6),
          });
        }
      }

      page.drawLine({
        start: { x: MARGIN_LEFT, y: nextRowY },
        end: { x: colX[2], y: nextRowY },
        thickness: 0.8,
        color: COLOR_BORDER,
      });

      rowY = nextRowY;
    });

    [colX[0], colX[1], colX[2]].forEach((xPos) => {
      page.drawLine({
        start: { x: xPos, y: tableTop },
        end: { x: xPos, y: rowY },
        thickness: 0.8,
        color: COLOR_BORDER,
      });
    });

    cursorY = rowY - 18;

    // =========================================================================
    // 3. TABLA INFERIOR: CONTROL DE DÍAS, FECHAS, ASISTENCIA Y VALORACIÓN (9 PT)
    // =========================================================================
    const subTableTop = cursorY;
    const subColWidths = [335, CONTENT_WIDTH - 335];
    const subColX = [MARGIN_LEFT, MARGIN_LEFT + subColWidths[0], MARGIN_LEFT + CONTENT_WIDTH];

    const subRow1Y = subTableTop - 24;
    const subRow2Y = subRow1Y - 26;
    const subRow3Y = subRow2Y - 22;

    // --- FILA 1: Fechas de inicio y conclusión de PEC con líneas punteadas ---
    page.drawText("Fecha de inicio de la PEC:", { x: MARGIN_LEFT + 8, y: subTableTop - 16, size: 9, font: fontBold, color: COLOR_TEXT });
    const fInicioVal = formatFecha(d.fecha_inicio_pec);
    const fInicioX = MARGIN_LEFT + 130;
    page.drawText(fInicioVal, { x: fInicioX, y: subTableTop - 16, size: 9, font: fontBold, color: COLOR_TEXT });
    
    const wFI = fontBold.widthOfTextAtSize(fInicioVal, 9);
    page.drawLine({
      start: { x: fInicioX, y: subTableTop - 18 },
      end: { x: fInicioX + Math.max(wFI, 50), y: subTableTop - 18 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });

    page.drawText("Fecha de conclusión:", { x: MARGIN_LEFT + 190, y: subTableTop - 16, size: 9, font: fontBold, color: COLOR_TEXT });
    const fConcVal = formatFecha(d.fecha_conclusion_pec);
    const fConcX = MARGIN_LEFT + 290;
    page.drawText(fConcVal, { x: fConcX, y: subTableTop - 16, size: 9, font: fontBold, color: COLOR_TEXT });

    const wFC = fontBold.widthOfTextAtSize(fConcVal, 9);
    page.drawLine({
      start: { x: fConcX, y: subTableTop - 18 },
      end: { x: fConcX + Math.max(wFC, 50), y: subTableTop - 18 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });

    // Cuadro Derecho: Porcentaje total de asistencia
    page.drawText("Porcentaje total", { x: subColX[1] + 6, y: subTableTop - 11, size: 9, font: fontBold, color: COLOR_TEXT });
    page.drawText("de asistencia:", { x: subColX[1] + 6, y: subTableTop - 20, size: 9, font: fontBold, color: COLOR_TEXT });

    page.drawLine({
      start: { x: MARGIN_LEFT, y: subRow1Y },
      end: { x: subColX[1], y: subRow1Y },
      thickness: 0.8,
      color: COLOR_BORDER,
    });

    // --- FILA 2: Totales y Porcentaje con línea punteada debajo ---
    const tDias = formatNota(d.total_dias) || "5";
    const tFaltas = formatNota(d.total_faltas) || "0";
    const tAtrasos = formatNota(d.total_atrasos) || "0";

    page.drawText(`Total días: ${tDias}`, { x: MARGIN_LEFT + 8, y: subRow1Y - 17, size: 9, font: fontBold, color: COLOR_TEXT });
    page.drawText(`Total Faltas: ${tFaltas}`, { x: MARGIN_LEFT + 115, y: subRow1Y - 17, size: 9, font: fontBold, color: COLOR_TEXT });
    page.drawText(`Total Atrasos: ${tAtrasos}`, { x: MARGIN_LEFT + 225, y: subRow1Y - 17, size: 9, font: fontBold, color: COLOR_TEXT });

    const pAsisVal = `${formatNota(d.porcentaje_asistencia || 100)}/100%`;
    const pAsisW = fontBold.widthOfTextAtSize(pAsisVal, 9);
    const pAsisX = subColX[1] + subColWidths[1] / 2 - pAsisW / 2;
    
    page.drawText(pAsisVal, { x: pAsisX, y: subRow1Y - 17, size: 9, font: fontBold, color: COLOR_TEXT });
    
    page.drawLine({
      start: { x: pAsisX, y: subRow1Y - 19 },
      end: { x: pAsisX + pAsisW, y: subRow1Y - 19 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });

    page.drawLine({
      start: { x: MARGIN_LEFT, y: subRow2Y },
      end: { x: subColX[2], y: subRow2Y },
      thickness: 0.8,
      color: COLOR_BORDER,
    });

    // --- FILA 3: Valoración sobre 100 puntos con línea punteada ---
    const valLabel = "Valoración sobre 100 puntos: ";
    const valVal = `${formatNota(d.valoracion_100 || 100)} PUNTOS`;
    
    page.drawText(valLabel, { x: MARGIN_LEFT + 8, y: subRow2Y - 15, size: 9, font: fontBold, color: COLOR_TEXT });
    
    const valLabelW = fontBold.widthOfTextAtSize(valLabel, 9);
    const valStartX = MARGIN_LEFT + 8 + valLabelW;
    page.drawText(valVal, { x: valStartX, y: subRow2Y - 15, size: 9, font: fontBold, color: COLOR_TEXT });

    const valValW = fontBold.widthOfTextAtSize(valVal, 9);
    page.drawLine({
      start: { x: valStartX, y: subRow2Y - 17 },
      end: { x: valStartX + valValW, y: subRow2Y - 17 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });

    page.drawLine({
      start: { x: MARGIN_LEFT, y: subRow3Y },
      end: { x: subColX[2], y: subRow3Y },
      thickness: 0.8,
      color: COLOR_BORDER,
    });

    // Líneas verticales cuadro inferior
    page.drawLine({ start: { x: MARGIN_LEFT, y: subTableTop }, end: { x: MARGIN_LEFT, y: subRow3Y }, thickness: 0.8, color: COLOR_BORDER });
    page.drawLine({ start: { x: subColX[1], y: subTableTop }, end: { x: subColX[1], y: subRow2Y }, thickness: 0.8, color: COLOR_BORDER });
    page.drawLine({ start: { x: subColX[2], y: subTableTop }, end: { x: subColX[2], y: subRow3Y }, thickness: 0.8, color: COLOR_BORDER });

    page.drawLine({
      start: { x: MARGIN_LEFT, y: subTableTop },
      end: { x: subColX[2], y: subTableTop },
      thickness: 0.8,
      color: COLOR_BORDER,
    });

    cursorY = subRow3Y - 25;

    // =========================================================================
    // 4. LUGAR Y FECHA DE EMISIÓN CENTRADO ABAJO CON LÍNEA PUNTEADA DEBAJO (9 PT)
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
    // 5. FIRMAS: DOCENTE GUÍA Y DIRECTOR/A UE/CEA/CEE CENTRADAS ABAJO (9 PT)
    // =========================================================================
    const sigWidth = 160;
    const sig1X = MARGIN_LEFT + 30;
    const sig2X = MARGIN_LEFT + CONTENT_WIDTH - sigWidth - 30;

    page.drawLine({
      start: { x: sig1X, y: cursorY },
      end: { x: sig1X + sigWidth, y: cursorY },
      thickness: 0.8,
      dashArray: [2, 2],
      color: COLOR_BORDER,
    });

    const lbl1 = "Docente Guía UE/CEA/CEE";
    const lbl1W = font.widthOfTextAtSize(lbl1, 9);
    page.drawText(lbl1, {
      x: sig1X + sigWidth / 2 - lbl1W / 2,
      y: cursorY - 14,
      size: 9,
      font,
      color: COLOR_TEXT,
    });

    page.drawLine({
      start: { x: sig2X, y: cursorY },
      end: { x: sig2X + sigWidth, y: cursorY },
      thickness: 0.8,
      dashArray: [2, 2],
      color: COLOR_BORDER,
    });

    const lbl2 = "Director/a UE/CEA/CEE";
    const lbl2W = font.widthOfTextAtSize(lbl2, 9);
    page.drawText(lbl2, {
      x: sig2X + sigWidth / 2 - lbl2W / 2,
      y: cursorY - 14,
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
    console.error("Error al generar PDF de Ficha F-2:", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`,
    };
  }
};