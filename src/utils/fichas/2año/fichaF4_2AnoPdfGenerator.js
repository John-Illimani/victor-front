import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { fichaF4_2doAnoService } from "../../../services/fichas/2año/fichaF4_2doAnoService";

// =============================================================================
// CONSTANTES Y CONFIGURACIÓN DE ESTILOS DE LA FICHA F-4
// =============================================================================
const TITULO_FICHA = "FICHA F 4";
const SUBTITULO_FICHA = "APOYO Y SEGUIMIENTO DEL DOCENTE GUÍA DE UE/CEA/CEE A LA\nCONCRECIÓN CURRICULAR";
const INSTRUCCION_F4 = "La/el docente guía realiza seguimiento del proceso de concreción curricular a la/el estudiante integrante del Equipo Comunitario y evalúa el desempeño mediante esta ficha, antes de finalizar la PEC.";
const SECCION_DATOS = "DATOS REFERENCIALES DEL ESTUDIANTE";

// Estilos de Color
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);        // Dorado (#C9A751)
const COLOR_HEADER = rgb(160 / 255, 48 / 255, 32 / 255);        // Rojo guindo
const COLOR_ACTIVIDADES = rgb(239 / 255, 176 / 255, 161 / 255); // Salmón (Columna PDC)
const COLOR_ROW_PINK = rgb(253 / 255, 228 / 255, 222 / 255);   // Rosa suave
const COLOR_PINK = rgb(246 / 255, 204 / 255, 194 / 255);        // Bloque observaciones/promedio
const COLOR_BORDER = rgb(0, 0, 0);

const BORDER = 1;

// Criterios fijos de la Ficha F-4 (5 columnas de evaluación)
const CRITERIOS_F4 = [
  "Existe coherencia entre los diferentes elementos curriculares del PDC.",
  "Demuestra conocimiento de los contenidos de su especialidad",
  "Utiliza recursos/materiales de apoyo, promoviendo la participación y desarrollo de capacidades, habilidades y/o potencialidades en las/los estudiantes.",
  "Demuestra compromiso a través de la aplicación de estrategias metodológicas para el desarrollo de capacidades creativas, propositivas en las/los estudiantes.",
  "Demuestra respeto, responsabilidad puntualidad, trato cortés y amable con cada uno de los miembros de la UE/CEA/C"
];

// Claves que vienen dentro del JSON de cada PDC
const CRITERIOS_KEYS = [
  "coherencia_elementos",
  "conocimiento_contenidos",
  "recursos_materiales",
  "estrategias_metodologicas",
  "valores_respeto"
];

// =============================================================================
// FUNCIONES DE APOYO (HELPERS)
// =============================================================================

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

function campoPunteado(page, { label, value, x, y, minLine = 50, endX, font, fontBold, size = 9 }) {
  page.drawText(label, { x, y, size, font, color: COLOR_TEXT });
  const valueX = x + font.widthOfTextAtSize(label, size);
  const val = norm(value).toUpperCase();
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
// GENERADOR DE PDF FICHA F-4 (2DO AÑO)
// =============================================================================
export const imprimirFichaF4_2doAno = async (estudianteId) => {
  try {
    const responseFicha = await fichaF4_2doAnoService.getByEstudiante(estudianteId);

    if (!responseFicha || !responseFicha.existe || !responseFicha.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha F-4 de 2do Año. Primero guarda el formulario.",
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

    page.setSize(612, 792); // Formato Carta
    const pageWidth = 612;
    const pageHeight = 792;

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Márgenes
    const MARGIN_TOP = (5 / 2.54) * 72;
    const MARGIN_LEFT = 85.04;   // 3 cm
    const MARGIN_RIGHT = 51.31;  // 1.81 cm
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // =========================================================================
    // 1. TÍTULOS PRINCIPALES
    // =========================================================================
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
    cursorY -= 6;

    const instLines = wrapTextToLines(INSTRUCCION_F4, font, CONTENT_WIDTH, 9);
    instLines.forEach((line) => {
      page.drawText(line, {
        x: MARGIN_LEFT,
        y: cursorY,
        size: 9,
        font,
        color: COLOR_TEXT,
      });
      cursorY -= 11;
    });
    cursorY -= 10;

    page.drawText(SECCION_DATOS, {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: COLOR_TITLE,
    });
    cursorY -= 18;

    // =========================================================================
    // 2. DATOS REFERENCIALES DEL ESTUDIANTE
    // =========================================================================
    campoPunteado(page, {
      label: "Nombres y Apellidos: ",
      value: d.apellidos_nombres,
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9,
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
    });
    campoPunteado(page, {
      label: "Especialidad: ",
      value: d.especialidad,
      x: esfmEnd + 15,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9,
    });
    cursorY -= 20;

    // =========================================================================
    // 3. TABLA EVALUATIVA FICHA F-4
    // =========================================================================
    const tableTop = cursorY;

    // Anchos de columna: [PDC, C1, C2, C3, C4, C5, PromParcial]
    const colWidths = [65, 62, 62, 68, 78, 72, 68.65];
    const colX = [MARGIN_LEFT];
    for (let i = 0; i < colWidths.length; i++) {
      colX.push(colX[i] + colWidths[i]);
    }

    const headerTitleH = 22;
    const headerCritH = 145; 
    const headerSubRangeH = 25; 

    // A. Encabezado "Plan de Desarrollo Curricular."
    fillRect(page, colX[0], tableTop, colWidths[0], headerTitleH + headerCritH + headerSubRangeH, COLOR_ACTIVIDADES);
    
    const pdcTitleLines = wrapTextToLines("Plan de Desarrollo Curricular.", fontBold, colWidths[0] - 6, 8.5);
    let pdcTitleY = tableTop - 65;
    pdcTitleLines.forEach((tl) => {
      page.drawText(tl, { x: colX[0] + 4, y: pdcTitleY, size: 8.5, font: fontBold, color: COLOR_TEXT });
      pdcTitleY -= 10;
    });

    // Encabezado Guindo Criterios
    fillRect(page, colX[1], tableTop, CONTENT_WIDTH - colWidths[0], headerTitleH, COLOR_HEADER);
    const mainCritTitle = "CRITERIOS DE EVALUACIÓN";
    const wMainCrit = fontBold.widthOfTextAtSize(mainCritTitle, 11);
    page.drawText(mainCritTitle, {
      x: colX[1] + (CONTENT_WIDTH - colWidths[0]) / 2 - wMainCrit / 2,
      y: tableTop - 15,
      size: 11,
      font: fontBold,
      color: COLOR_WHITE,
    });

    // B. Subencabezados Criterios y Promedio Parcial
    const critHeaderTop = tableTop - headerTitleH;
    fillRect(page, colX[1], critHeaderTop, CONTENT_WIDTH - colWidths[0], headerCritH, COLOR_HEADER);

    CRITERIOS_F4.forEach((critText, idx) => {
      const cIndex = idx + 1;
      const cLines = wrapTextToLines(critText, fontBold, colWidths[cIndex] - 6, 7.2);
      let cy = critHeaderTop - 12;
      cLines.forEach((cl) => {
        page.drawText(cl, {
          x: colX[cIndex] + 3,
          y: cy,
          size: 7.2,
          font: fontBold,
          color: COLOR_WHITE,
        });
        cy -= 9;
      });
    });

    const promParcLines = ["Promedio", "Parcial de", "cada PDC", "(Número", "entero)"];
    let py = critHeaderTop - 20;
    promParcLines.forEach((pl) => {
      const pw = fontBold.widthOfTextAtSize(pl, 7.5);
      page.drawText(pl, {
        x: colX[6] + colWidths[6] / 2 - pw / 2,
        y: py,
        size: 7.5,
        font: fontBold,
        color: COLOR_WHITE,
      });
      py -= 10;
    });

    // C. Fila Rango "1 a 100 Puntos." y "Puntos."
    const subRangeTop = critHeaderTop - headerCritH;
    fillRect(page, colX[1], subRangeTop, CONTENT_WIDTH - colWidths[0], headerSubRangeH, COLOR_WHITE);

    for (let i = 1; i <= 5; i++) {
      const rangeText = "1 a 100\nPuntos.";
      const rLines = rangeText.split("\n");
      let ry = subRangeTop - 9;
      rLines.forEach((rl) => {
        const rw = font.widthOfTextAtSize(rl, 8);
        page.drawText(rl, {
          x: colX[i] + colWidths[i] / 2 - rw / 2,
          y: ry,
          size: 8,
          font,
          color: COLOR_TEXT,
        });
        ry -= 9;
      });
    }

    const pntText = "Puntos.";
    const pntW = font.widthOfTextAtSize(pntText, 8);
    page.drawText(pntText, {
      x: colX[6] + colWidths[6] / 2 - pntW / 2,
      y: subRangeTop - 14,
      size: 8,
      font,
      color: COLOR_TEXT,
    });

    // D. Filas de Datos (PDC 1 y PDC 2)
    const pdcsData = d.pdcs || { "PDC 1": {}, "PDC 2": {} };
    const pdcKeys = ["PDC 1", "PDC 2"];
    const rowH = 26;

    let currentRowTop = subRangeTop - headerSubRangeH;
    const rowBoundaries = [subRangeTop, currentRowTop];

    pdcKeys.forEach((pdcKey) => {
      const pdcObj = pdcsData[pdcKey] || {};

      fillRect(page, colX[0], currentRowTop, colWidths[0], rowH, COLOR_ACTIVIDADES);
      fillRect(page, colX[1], currentRowTop, CONTENT_WIDTH - colWidths[0], rowH, COLOR_ROW_PINK);

      // Label PDC
      const pdcLabelW = fontBold.widthOfTextAtSize(pdcKey, 9);
      page.drawText(pdcKey, {
        x: colX[0] + colWidths[0] / 2 - pdcLabelW / 2,
        y: currentRowTop - 16,
        size: 9,
        font: fontBold,
        color: COLOR_TEXT,
      });

      // Calificaciones de los 5 Criterios
      CRITERIOS_KEYS.forEach((keyName, i) => {
        const colIdx = i + 1;
        const val = pdcObj[keyName];
        if (val !== undefined && val !== null && val !== "") {
          const valStr = String(Math.round(Number(val)));
          const vw = font.widthOfTextAtSize(valStr, 9);
          page.drawText(valStr, {
            x: colX[colIdx] + colWidths[colIdx] / 2 - vw / 2,
            y: currentRowTop - 16,
            size: 9,
            font,
            color: COLOR_TEXT,
          });
        }
      });

      // Promedio Parcial
      const promParcial = pdcObj.promedio_parcial;
      if (promParcial !== undefined && promParcial !== null && promParcial !== "") {
        const promStr = String(Math.round(Number(promParcial)));
        const pw = fontBold.widthOfTextAtSize(promStr, 9);
        page.drawText(promStr, {
          x: colX[6] + colWidths[6] / 2 - pw / 2,
          y: currentRowTop - 16,
          size: 9,
          font: fontBold,
          color: COLOR_TEXT,
        });
      }

      currentRowTop -= rowH;
      rowBoundaries.push(currentRowTop);
    });

    const tablaPdcBottom = currentRowTop;

    // E. Bloques Inferiores (Promedio Total, Observaciones)
    const promTotH = 22;
    const obsH = 45;

    const promTotTop = tablaPdcBottom;
    const obsTop = promTotTop - promTotH;
    const tableBottom = obsTop - obsH;

    fillRect(page, colX[0], promTotTop, colX[6] - colX[0], promTotH, COLOR_WHITE);
    fillRect(page, colX[6], promTotTop, colWidths[6], promTotH, COLOR_WHITE);
    fillRect(page, colX[0], obsTop, CONTENT_WIDTH, obsH, COLOR_PINK);

    // Promedio Total
    page.drawText("Promedio Total (Número entero)", {
      x: colX[0] + 8,
      y: promTotTop - 14,
      size: 9,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const promVal = d.promedio_total !== undefined && d.promedio_total !== null
      ? Math.round(Number(d.promedio_total))
      : 0;
    const promValStr = String(promVal);

    const ptw = fontBold.widthOfTextAtSize(promValStr, 9);
    page.drawText(promValStr, {
      x: colX[6] + colWidths[6] / 2 - ptw / 2,
      y: promTotTop - 14,
      size: 9,
      font: fontBold,
      color: COLOR_TEXT,
    });

    // Observaciones
    page.drawText("Observaciones y/o sugerencias de la concreción curricular:", {
      x: colX[0] + 8,
      y: obsTop - 13,
      size: 9,
      font: fontBold,
      color: COLOR_TEXT,
    });

    if (d.observaciones) {
      const obsLines = wrapTextToLines(d.observaciones, font, CONTENT_WIDTH - 16, 9);
      let obsY = obsTop - 25;
      obsLines.slice(0, 2).forEach((ol) => {
        page.drawText(ol, {
          x: colX[0] + 8,
          y: obsY,
          size: 9,
          font,
          color: COLOR_TEXT,
        });
        obsY -= 10.5;
      });
    }

    // F. Rejilla de Líneas de la Tabla
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop);
    hLine(page, colX[1], RIGHT_X, critHeaderTop);
    hLine(page, colX[1], RIGHT_X, subRangeTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, rowBoundaries[1]);
    hLine(page, MARGIN_LEFT, RIGHT_X, rowBoundaries[2]);
    hLine(page, MARGIN_LEFT, RIGHT_X, tablaPdcBottom);
    hLine(page, MARGIN_LEFT, RIGHT_X, obsTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, tableBottom);

    // Líneas Verticales
    vLine(page, colX[0], tableTop, tableBottom);
    vLine(page, colX[1], tableTop, tablaPdcBottom);
    vLine(page, colX[2], critHeaderTop, tablaPdcBottom);
    vLine(page, colX[3], critHeaderTop, tablaPdcBottom);
    vLine(page, colX[4], critHeaderTop, tablaPdcBottom);
    vLine(page, colX[5], critHeaderTop, tablaPdcBottom);
    vLine(page, colX[6], critHeaderTop, obsTop);
    vLine(page, RIGHT_X, tableTop, tableBottom);

    cursorY = tableBottom - 35;

    // =========================================================================
    // 4. LUGAR, FECHA Y FIRMAS
    // =========================================================================
    const lblFechaText = "Lugar y fecha: ";
    const valFechaText = `${d.lugar_ciudad || "El Alto"}, ${d.dia || ""} de ${d.mes || ""} de ${d.ano || ""}`;

    const wLblFecha = font.widthOfTextAtSize(lblFechaText, 9);
    const wValFecha = fontBold.widthOfTextAtSize(valFechaText, 9);
    const fechaStartX = RIGHT_X - (wLblFecha + wValFecha);

    page.drawText(lblFechaText, { x: fechaStartX, y: cursorY, size: 9, font, color: COLOR_TEXT });
    const valFechaX = fechaStartX + wLblFecha;
    page.drawText(valFechaText, { x: valFechaX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    drawDotted(page, valFechaX, RIGHT_X, cursorY - 1.5);

    cursorY -= 50;

    const sigWidth = 170;
    const sig1X = MARGIN_LEFT + 20;
    const sig2X = RIGHT_X - sigWidth - 20;

    const firmas = [
      { x: sig1X, label: "Estudiante" },
      { x: sig2X, label: "Docente Guía" },
    ];

    firmas.forEach(({ x, label }) => {
      page.drawLine({
        start: { x, y: cursorY },
        end: { x: x + sigWidth, y: cursorY },
        thickness: 0.8,
        dashArray: [2, 2],
        color: COLOR_BORDER,
      });
      const lw = font.widthOfTextAtSize(label, 9);
      page.drawText(label, {
        x: x + sigWidth / 2 - lw / 2,
        y: cursorY - 12,
        size: 9,
        font,
        color: COLOR_TEXT,
      });
    });

    // =========================================================================
    // 5. RENDERIZADO Y APERTURA DE PDF
    // =========================================================================
    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, "_blank");
    return { success: true };
  } catch (error) {
    console.error("Error al generar PDF de Ficha F-4 de 2do Año:", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`,
    };
  }
};