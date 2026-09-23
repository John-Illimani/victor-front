import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { fichaF6_2doAnoService } from "../../../services/fichas/2año/fichaF6_2doAnoService";

// =============================================================================
// CONSTANTES Y CONFIGURACIÓN DE ESTILOS DE LA FICHA F-6
// =============================================================================
const TITULO_FICHA = "FICHA F-6";
const SUBTITULO_FICHA = "VALORACIÓN DE LA PRODUCCIÓN DE CONOCIMIENTOS DE LA\nIEPC-PEC";
const SECCION_DATOS = "DATOS REFERENCIALES:";

const DESCRIPCION_F6 = "La/el Docente Acompañante revisa y evalúa los productos finales de la IEPC-PEC, de acuerdo a las características y formatos establecidos por la ESFM/UA. Los criterios específicos de evaluación del documento deben ser definidos por la ESFM/ UA.";

// Estilos de Color
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);        // Dorado (#C9A751)
const COLOR_TABLE_HEADER = rgb(160 / 255, 48 / 255, 32 / 255); // Guindo / Rojo oscuro
const COLOR_HEADER_TEXT = rgb(1, 1, 1);                         // Blanco
const COLOR_ROW_PINK = rgb(253 / 255, 228 / 255, 222 / 255);    // Rosa claro
const COLOR_BORDER = rgb(0, 0, 0);

const BORDER = 1;

// Indicadores y Keys mapeados para Ficha F-6
const INDICADORES_F6 = [
  { key: "f6_criterio_1", cualiKey: "f6_val_cualitativa_1", text: "El contenido del informe concuerda con los datos plasmados en los instrumentos aplicados." },
  { key: "f6_criterio_2", cualiKey: "f6_val_cualitativa_2", text: "Describe las características económicas, socioculturales, políticas, demográficas de la comunidad." },
  { key: "f6_criterio_3", cualiKey: "f6_val_cualitativa_3", text: "Describe con amplitud los ámbitos descritos en la estructura del informe (ámbito institucional, curricular, clima institucional, gestión administrativa y otros)." },
  { key: "f6_criterio_4", cualiKey: "f6_val_cualitativa_4", text: "Describe los aspectos observados en el desarrollo de los procesos educativos: Estrategias pedagógico-didácticas, gestión de aula, procesos de evaluación, etc." },
  { key: "f6_criterio_5", cualiKey: "f6_val_cualitativa_5", text: "La redacción de la Sistematización de Experiencias es coherente y sin errores ortográficos. La redacción es original y propia." },
];

function cleanLiteralText(rawLiteral) {
  let lit = String(rawLiteral ?? "").trim().toUpperCase();
  if (lit.includes(" CON ")) {
    lit = lit.split(" CON ")[0].trim();
  } else if (lit.includes("/")) {
    lit = lit.split("/")[0].trim();
  }
  return lit;
}

const norm = (v) => String(v ?? "").trim();

function wrapTextToLines(text, font, maxWidth, fontSize) {
  const out = [];
  String(text ?? "").split(/\r?\n/).forEach((parrafo) => {
    if (!parrafo.trim()) {
      out.push("");
      return;
    }
    let current = "";
    parrafo.split(/\s+/).filter(Boolean).forEach((word) => {
      const test = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
        out.push(current);
        current = word;
      } else {
        current = test;
      }
    });
    if (current) out.push(current);
  });
  return out.length ? out : [""];
}

function drawDotted(page, x1, x2, y) {
  page.drawLine({
    start: { x: x1, y },
    end: { x: x2, y },
    thickness: 0.8,
    dashArray: [1.5, 1.5],
    color: COLOR_TEXT,
  });
}

function campoPunteado(page, { label, value, x, y, minLine = 50, endX, font, fontBold, size = 9, forceUpper = true }) {
  page.drawText(label, { x, y, size, font, color: COLOR_TEXT });
  const valueX = x + font.widthOfTextAtSize(label, size);
  let val = norm(value);
  if (forceUpper) {
    val = val.toUpperCase();
  }
  if (val) page.drawText(val, { x: valueX, y, size, font: fontBold, color: COLOR_TEXT });
  const valW = val ? fontBold.widthOfTextAtSize(val, size) : 0;
  const lineEnd = endX ?? valueX + Math.max(valW + 4, minLine);
  drawDotted(page, valueX, lineEnd, y - 2);
  return lineEnd;
}

function hLine(page, x1, x2, y) {
  page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: BORDER, color: COLOR_BORDER });
}

function vLine(page, x, y1, y2) {
  page.drawLine({ start: { x, y: y1 }, end: { x, y: y2 }, thickness: BORDER, color: COLOR_BORDER });
}

function fillRect(page, x, yTop, w, h, color) {
  page.drawRectangle({ x, y: yTop - h, width: w, height: h, color });
}

// =============================================================================
// GENERADOR DE PDF FICHA F-6 (2DO AÑO)
// =============================================================================
export const imprimirFichaF6_2doAno = async (estudianteId) => {
  try {
    const responseFicha = await fichaF6_2doAnoService.getByEstudiante(estudianteId);

    if (!responseFicha || !responseFicha.existe || !responseFicha.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha F-6 de 2do Año. Primero guarda el formulario.",
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

    page.setSize(612, 792);
    const pageWidth = 612;
    const pageHeight = 792;

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const MARGIN_TOP = (5 / 2.54) * 72;
    const MARGIN_LEFT = 85.04; // 3.0 cm
    const MARGIN_RIGHT = 51.31; // 1.81 cm
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT);
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // 1. TÍTULOS PRINCIPALES
    const wFicha = fontBold.widthOfTextAtSize(TITULO_FICHA, 13);
    page.drawText(TITULO_FICHA, {
      x: MARGIN_LEFT + CONTENT_WIDTH / 2 - wFicha / 2,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: COLOR_TITLE,
    });
    cursorY -= 18;

    const subLines = SUBTITULO_FICHA.split("\n");
    subLines.forEach((line) => {
      const wLine = fontBold.widthOfTextAtSize(line, 13);
      page.drawText(line, {
        x: MARGIN_LEFT + CONTENT_WIDTH / 2 - wLine / 2,
        y: cursorY,
        size: 13,
        font: fontBold,
        color: COLOR_TITLE,
      });
      cursorY -= 16;
    });
    cursorY -= 8;

    // PARÁMETROS DESCRIPTIVOS (TEXTO NORMAL - SIN NEGRITA)
    const descLines = wrapTextToLines(DESCRIPCION_F6, font, CONTENT_WIDTH, 8.5);
    descLines.forEach((line) => {
      page.drawText(line, {
        x: MARGIN_LEFT,
        y: cursorY,
        size: 8.5,
        font,
        color: COLOR_TEXT,
      });
      cursorY -= 11;
    });
    cursorY -= 6;

    page.drawText(SECCION_DATOS, {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 12,
      font: fontBold,
      color: COLOR_TITLE,
    });
    cursorY -= 18;

    // 2. DATOS REFERENCIALES
    campoPunteado(page, {
      label: "Nombres y Apellidos: ",
      value: d.apellidos_nombres,
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9,
      forceUpper: true,
    });
    cursorY -= 14;

    const esfmEnd = campoPunteado(page, {
      label: "ESFM/UA: ",
      value: d.esfm_ua,
      x: MARGIN_LEFT,
      y: cursorY,
      minLine: 180,
      font,
      fontBold,
      size: 9,
      forceUpper: true,
    });
    campoPunteado(page, {
      label: "Año de Formación: ",
      value: d.ano_formacion || "2do Año de Formación",
      x: esfmEnd + 15,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9,
      forceUpper: true,
    });
    cursorY -= 22;

    // 3. TABLA EVALUATIVA FICHA F-6
    const tableTop = cursorY;

    const colWidths = [82, 223.65, 100, 70];
    const colX = [MARGIN_LEFT];
    for (let i = 0; i < colWidths.length; i++) {
      colX.push(colX[i] + colWidths[i]);
    }

    const tableHeaderH = 34;
    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, tableHeaderH, COLOR_TABLE_HEADER);

    const headersText = [
      { text: "PRODUCTOS", col: 0, size: 8.5 },
      { text: "INDICADORES", col: 1, size: 8.5 },
      { text: "VALORACIÓN\nCUALITATIVA", col: 2, size: 8 },
      { text: "CALIFICACIÓN\nDe 1 a 100\npuntos", col: 3, size: 8 },
    ];

    const lineSpacing = 9;
    headersText.forEach(({ text, col, size }) => {
      const lines = text.split("\n");
      const totalTextHeight = lines.length * lineSpacing;
      let hy = tableTop - (tableHeaderH - totalTextHeight) / 2 - size + 1;

      lines.forEach((l) => {
        const lw = fontBold.widthOfTextAtSize(l, size);
        page.drawText(l, {
          x: colX[col] + colWidths[col] / 2 - lw / 2,
          y: hy,
          size,
          font: fontBold,
          color: COLOR_HEADER_TEXT,
        });
        hy -= lineSpacing;
      });
    });

    let currentY = tableTop - tableHeaderH;
    const hLinesToDraw = [tableTop, currentY];
    const productoTop = currentY;

    // Filas de Indicadores (Criterios + Valoración Cualitativa + Nota)
    INDICADORES_F6.forEach((ind) => {
      const rowTop = currentY;

      const indLines = wrapTextToLines(ind.text, fontBold, colWidths[1] - 8, 8);
      const cualiVal = d[ind.cualiKey] || "";
      const cualiLines = wrapTextToLines(cualiVal, font, colWidths[2] - 8, 7.5);

      const rowH = Math.max(indLines.length * 9.5 + 12, cualiLines.length * 9 + 12, 28);

      // Render Indicador
      let iy = rowTop - 11;
      indLines.forEach((il) => {
        page.drawText(il, { x: colX[1] + 4, y: iy, size: 8, font: fontBold, color: COLOR_TEXT });
        iy -= 9.5;
      });

      // Render Valoración Cualitativa
      let cy = rowTop - 11;
      cualiLines.forEach((cl) => {
        page.drawText(cl, { x: colX[2] + 4, y: cy, size: 7.5, font, color: COLOR_TEXT });
        cy -= 9;
      });

      // Render Calificación Numérica
      const valScore = d[ind.key];
      if (valScore !== undefined && valScore !== null && valScore !== "") {
        const scoreStr = String(Math.round(Number(valScore)));
        const sw = font.widthOfTextAtSize(scoreStr, 8.5);
        page.drawText(scoreStr, {
          x: colX[3] + colWidths[3] / 2 - sw / 2,
          y: rowTop - (rowH / 2) - 3,
          size: 8.5,
          font,
          color: COLOR_TEXT,
        });
      }

      currentY -= rowH;
      hLine(page, colX[1], RIGHT_X, currentY);
    });

    // Rellenar y Dibujar Texto del Producto Unificado (Columna 0)
    const productoH = productoTop - currentY;
    fillRect(page, colX[0], productoTop, colWidths[0], productoH, COLOR_ROW_PINK);

    const prodText = "Sistematización de la experiencia educativa.";
    const prodLines = wrapTextToLines(prodText, fontBold, colWidths[0] - 8, 8);
    let py = productoTop - (productoH / 2) + (prodLines.length * 4.5);
    prodLines.forEach((pl) => {
      page.drawText(pl, { x: colX[0] + 4, y: py, size: 8, font: fontBold, color: COLOR_TEXT });
      py -= 9.5;
    });

    hLinesToDraw.push(currentY);

    // Fila Promedio Final
    const promFinalTop = currentY;
    const rowPromH = 22;

    page.drawText("Promedio final (Número entero)", {
      x: colX[0] + 6,
      y: promFinalTop - 14,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const promFinalVal = d.promedio_numeral !== undefined && d.promedio_numeral !== null
      ? Math.round(Number(d.promedio_numeral))
      : 0;
    const pStr = String(promFinalVal);
    const pw = fontBold.widthOfTextAtSize(pStr, 8.5);
    page.drawText(pStr, {
      x: colX[3] + colWidths[3] / 2 - pw / 2,
      y: promFinalTop - 14,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    currentY -= rowPromH;
    hLinesToDraw.push(currentY);

    // Fila Literal
    const literalTop = currentY;
    const rowLitH = 22;

    const litLabel = "Literal: ";
    page.drawText(litLabel, {
      x: colX[0] + 6,
      y: literalTop - 14,
      size: 8.5,
      font,
      color: COLOR_TEXT,
    });

    const litValClean = cleanLiteralText(d.promedio_literal || "CERO");
    if (litValClean) {
      page.drawText(litValClean, {
        x: colX[0] + 6 + font.widthOfTextAtSize(litLabel, 8.5),
        y: literalTop - 14,
        size: 8.5,
        font: fontBold,
        color: COLOR_TEXT,
      });
    }

    currentY -= rowLitH;
    hLinesToDraw.push(currentY);

    // Fila Observaciones y/o sugerencias
    const obsTop = currentY;
    const obsVal = d.observaciones || "";
    const obsLines = wrapTextToLines(obsVal, font, CONTENT_WIDTH - 12, 8);
    const rowObsH = Math.max(obsLines.length * 9.5 + 18, 32);

    page.drawText("Observaciones y/o sugerencias:", {
      x: colX[0] + 6,
      y: obsTop - 11,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    let oy = obsTop - 22;
    obsLines.forEach((ol) => {
      page.drawText(ol, { x: colX[0] + 6, y: oy, size: 8, font, color: COLOR_TEXT });
      oy -= 9.5;
    });

    currentY -= rowObsH;
    hLinesToDraw.push(currentY);

    const tableBottom = currentY;

    // Líneas Horizontales
    hLinesToDraw.forEach((y) => hLine(page, MARGIN_LEFT, RIGHT_X, y));

    // Líneas Verticales
    vLine(page, colX[0], tableTop, tableBottom);
    vLine(page, colX[1], tableTop, promFinalTop);
    vLine(page, colX[2], tableTop, promFinalTop);
    vLine(page, colX[3], tableTop, literalTop);
    vLine(page, RIGHT_X, tableTop, tableBottom);

    cursorY = tableBottom - 30;

    // 4. LUGAR Y FECHA (FORMATO MINÚSCULAS Y ALINEACIÓN EXACTA AL MARGEN DERECHO 1.81 CM)
    const labelFecha = "Lugar y fecha: ";
    const mesFormateado = (d.mes || "septiembre").toLowerCase();
    const ciudadFormateada = d.lugar_ciudad ? d.lugar_ciudad : "El Alto";
    const valFechaText = `${ciudadFormateada}, ${d.dia || "21"} de ${mesFormateado} de ${d.ano || "2026"}`;

    const fontLabelSize = 8.5;
    const wLabel = font.widthOfTextAtSize(labelFecha, fontLabelSize);
    const wValue = fontBold.widthOfTextAtSize(valFechaText, fontLabelSize);

    const minLineLen = Math.max(wValue + 8, 170);
    const fechaStartX = RIGHT_X - wLabel - minLineLen;

    campoPunteado(page, {
      label: labelFecha,
      value: valFechaText,
      x: fechaStartX,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: fontLabelSize,
      forceUpper: false,
    });

    cursorY -= 45;

    // 5. FIRMAS DE CONFORMIDAD
    const sigWidth = 170;
    const sig1X = MARGIN_LEFT + 20;
    const sig2X = RIGHT_X - sigWidth - 20;

    const firmas = [
      { x: sig1X, label: "Estudiante" },
      { x: sig2X, label: "Vo Bo Docente Acompañante de la\nESFM/UA" },
    ];

    firmas.forEach(({ x, label }) => {
      page.drawLine({
        start: { x, y: cursorY },
        end: { x: x + sigWidth, y: cursorY },
        thickness: 0.8,
        dashArray: [1.5, 1.5],
        color: COLOR_BORDER,
      });

      const lines = label.split("\n");
      let ly = cursorY - 12;
      lines.forEach((l) => {
        const lw = font.widthOfTextAtSize(l, 8.5);
        page.drawText(l, {
          x: x + sigWidth / 2 - lw / 2,
          y: ly,
          size: 8.5,
          font,
          color: COLOR_TEXT,
        });
        ly -= 10;
      });
    });

    // 6. RENDERIZADO
    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, "_blank");
    return { success: true };
  } catch (error) {
    console.error("Error al generar PDF de Ficha F-6 de 2do Año:", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`,
    };
  }
};