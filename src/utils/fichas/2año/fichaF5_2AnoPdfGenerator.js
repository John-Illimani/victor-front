import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { fichaF5_2doAnoService } from "../../../services/fichas/2año/fichaF5_2doAnoService";

// =============================================================================
// CONSTANTES Y CONFIGURACIÓN DE ESTILOS DE LA FICHA F-5
// =============================================================================
const TITULO_FICHA = "FICHA F-5";
const SUBTITULO_FICHA = "VALORACIÓN DE LA/EL DOCENTE ACOMPAÑANTE DE LA\nESFM/UA";
const SECCION_DATOS = "DATOS REFERENCIALES:";

const DESCRIPCION_F5 = [
  "El/la docente acompañante de la ESFM/UA brinda apoyo, orientación y seguimiento al proceso de la IEPC-PEC antes y durante la Práctica Educativa Comunitaria.",
  "Cada integrante del Equipo Comunitario presenta sus Planes de Desarrollo Curricular (PDC), respectiva guía de concreción y las evidencias del proceso investigativo desarrollado en la UE/CEA/CEE.",
  "La evaluación tiene carácter es individual y considera: la responsabilidad, el desempeño formativo, el dominio curricular y la participación activa en la investigación, con especial atención al diagnóstico socioparticipativo."
];

// Estilos de Color
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);        // Dorado (#C9A751)
const COLOR_HEADER_GUINDO = rgb(160 / 255, 48 / 255, 32 / 255); // Rojo guindo del bloque descriptivo
const COLOR_TABLE_HEADER = rgb(239 / 255, 176 / 255, 161 / 255); // Salmón del encabezado de la tabla
const COLOR_ROW_PINK = rgb(253 / 255, 228 / 255, 222 / 255);    // Rosa suave para el bloque Literal
const COLOR_BORDER = rgb(0, 0, 0);

const BORDER = 1;

// Estructura de las Etapas y Criterios Fijos
const ETAPAS_F5 = [
  {
    etapa: "Antes de la PEC\nPlanificación y organización para la concreción curricular",
    criterios: [
      { key: "f5_criterio_1", obsKey: "f5_obs_1", text: "Presenta el Plan de Desarrollo Curricular y otros documentos de apoyo requeridos para el desarrollo de la práctica." },
      { key: "f5_criterio_2", obsKey: "f5_obs_2", text: "Elabora la guía de concreción del PDC de manera clara, precisa y coherente con el proceso formativo." }
    ]
  },
  {
    etapa: "Durante la PEC\nConcreción curricular e investigación educativa en el marco de la práctica educativa comunitaria",
    criterios: [
      { key: "f5_criterio_3", obsKey: "f5_obs_3", text: "Demuestra responsabilidad y puntualidad en el desarrollo de la práctica educativa comunitaria y del proceso investigativo en la UE/CEA/CEE." },
      { key: "f5_criterio_4", obsKey: "f5_obs_4", text: "Manifiesta iniciativa, creatividad y dominio en la concreción curricular y en las actividades vinculadas al diagnóstico socioparticipativo." },
      { key: "f5_criterio_5", obsKey: "f5_obs_5", text: "Aplica técnicas e instrumentos de investigación de manera pertinente para la identificación, análisis y priorización de necesidades, problemáticas y/o potencialidades." }
    ]
  }
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
// GENERADOR DE PDF FICHA F-5 (2DO AÑO)
// =============================================================================
export const imprimirFichaF5_2doAno = async (estudianteId) => {
  try {
    const responseFicha = await fichaF5_2doAnoService.getByEstudiante(estudianteId);

    if (!responseFicha || !responseFicha.existe || !responseFicha.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha F-5 de 2do Año. Primero guarda el formulario.",
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
    const MARGIN_LEFT = 85.04;
    const MARGIN_RIGHT = 51.31;
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
    cursorY -= 6;

    page.drawText(SECCION_DATOS, {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 13,
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
      label: "Año de Formación: ",
      value: d.ano_formacion || "2do Año de Formación",
      x: esfmEnd + 15,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9,
    });
    cursorY -= 20;

    // 3. BLOQUE DESCRIPTIVO GUINDO
    const descBlockTop = cursorY;
    let descLinesAll = [];
    DESCRIPCION_F5.forEach((pText) => {
      const lines = wrapTextToLines(pText, fontBold, CONTENT_WIDTH - 12, 8);
      descLinesAll.push(...lines, "");
    });
    if (descLinesAll[descLinesAll.length - 1] === "") descLinesAll.pop();

    const descBlockH = descLinesAll.length * 9.5 + 8;
    fillRect(page, MARGIN_LEFT, descBlockTop, CONTENT_WIDTH, descBlockH, COLOR_HEADER_GUINDO);

    let descY = descBlockTop - 11;
    descLinesAll.forEach((line) => {
      if (line !== "") {
        page.drawText(line, {
          x: MARGIN_LEFT + 6,
          y: descY,
          size: 8,
          font: fontBold,
          color: COLOR_WHITE,
        });
      }
      descY -= 9.5;
    });

    hLine(page, MARGIN_LEFT, RIGHT_X, descBlockTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, descBlockTop - descBlockH);
    vLine(page, MARGIN_LEFT, descBlockTop, descBlockTop - descBlockH);
    vLine(page, RIGHT_X, descBlockTop, descBlockTop - descBlockH);

    cursorY = descBlockTop - descBlockH;

    // 4. TABLA EVALUATIVA FICHA F-5
    const tableTop = cursorY;

    const colWidths = [82, 223.65, 70, 100];
    const colX = [MARGIN_LEFT];
    for (let i = 0; i < colWidths.length; i++) {
      colX.push(colX[i] + colWidths[i]);
    }

    const tableHeaderH = 34;

    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, tableHeaderH, COLOR_TABLE_HEADER);

    const headersText = [
      { text: "Etapa", col: 0, size: 8.5 },
      { text: "Criterios de evaluación", col: 1, size: 8.5 },
      { text: "Valoración\n1 a 100\npuntos", col: 2, size: 8 },
      { text: "Observación /\nRecomendación", col: 3, size: 8 },
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
          color: COLOR_TEXT,
        });
        hy -= lineSpacing;
      });
    });

    let currentY = tableTop - tableHeaderH;
    const hLinesToDraw = [tableTop, currentY];

    // Filas de Datos (Etapas y Criterios)
    ETAPAS_F5.forEach((etapaObj) => {
      const etapaTop = currentY;

      etapaObj.criterios.forEach((crit) => {
        const critTop = currentY;

        const critLines = wrapTextToLines(crit.text, font, colWidths[1] - 8, 8);
        const obsVal = d[crit.obsKey] || "";
        const obsLines = wrapTextToLines(obsVal, font, colWidths[3] - 8, 7.5);

        const rowH = Math.max(critLines.length * 9.5 + 12, obsLines.length * 9 + 12, 28);

        // Render Criterio
        let cy = critTop - 11;
        critLines.forEach((cl) => {
          page.drawText(cl, { x: colX[1] + 4, y: cy, size: 8, font, color: COLOR_TEXT });
          cy -= 9.5;
        });

        // Render Valoración
        const valScore = d[crit.key];
        if (valScore !== undefined && valScore !== null && valScore !== "") {
          const scoreStr = String(Math.round(Number(valScore)));
          const sw = font.widthOfTextAtSize(scoreStr, 8.5);
          page.drawText(scoreStr, {
            x: colX[2] + colWidths[2] / 2 - sw / 2,
            y: critTop - (rowH / 2) - 3,
            size: 8.5,
            font,
            color: COLOR_TEXT,
          });
        }

        // Render Observación
        let oy = critTop - 11;
        obsLines.forEach((ol) => {
          page.drawText(ol, { x: colX[3] + 4, y: oy, size: 7.5, font, color: COLOR_TEXT });
          oy -= 9;
        });

        currentY -= rowH;
        hLine(page, colX[1], RIGHT_X, currentY);
      });

      // Celda unificada para la Etapa
      const etapaH = etapaTop - currentY;
      const etapaLines = etapaObj.etapa.split("\n").flatMap((p) => wrapTextToLines(p, fontBold, colWidths[0] - 6, 8));
      let ey = etapaTop - (etapaH / 2) + (etapaLines.length * 4.5);
      etapaLines.forEach((el) => {
        page.drawText(el, { x: colX[0] + 3, y: ey, size: 8, font: fontBold, color: COLOR_TEXT });
        ey -= 9;
      });

      hLinesToDraw.push(currentY);
    });

    // Fila Puntaje Final
    const puntFinalTop = currentY;
    const rowPuntH = 22;

    page.drawText("Puntaje Final (Número entero)", {
      x: colX[0] + 6,
      y: puntFinalTop - 14,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const puntFinalVal = d.puntaje_final !== undefined && d.puntaje_final !== null
      ? Math.round(Number(d.puntaje_final))
      : 0;
    const pStr = String(puntFinalVal);
    const pw = fontBold.widthOfTextAtSize(pStr, 8.5);
    page.drawText(pStr, {
      x: colX[2] + colWidths[2] / 2 - pw / 2,
      y: puntFinalTop - 14,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    currentY -= rowPuntH;
    hLinesToDraw.push(currentY);

    // Fila Literal
    const literalTop = currentY;
    const rowLitH = 22;

    fillRect(page, MARGIN_LEFT, literalTop, CONTENT_WIDTH, rowLitH, COLOR_ROW_PINK);

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

    const tableBottom = currentY;

    // Líneas Horizontales principales
    hLinesToDraw.forEach((y) => hLine(page, MARGIN_LEFT, RIGHT_X, y));

    // Líneas Verticales
    vLine(page, colX[0], tableTop, tableBottom);
    vLine(page, colX[1], tableTop, puntFinalTop);
    vLine(page, colX[2], tableTop, literalTop);
    vLine(page, colX[3], tableTop, literalTop);
    vLine(page, RIGHT_X, tableTop, tableBottom);

    // 5. SECCIÓN DE FIRMAS AL PIE
    cursorY = tableBottom - 65;

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
    console.error("Error al generar PDF de Ficha F-5 de 2do Año:", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`,
    };
  }
};