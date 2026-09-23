import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaA14toAnoService } from '../../../services/fichas/4año/fichaA14toAnoService';

// PALETA DE COLORES INSTITUCIONALES
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);            // Dorado (#C9A751)
const COLOR_BORDER = rgb(0, 0, 0);

const BORDER = 0.8;

// CONVERTIR NÚMEROS ENTEROS A PALABRAS (DEL 0 AL 100)
function numeroALetras(num) {
  const n = Math.round(Number(num) || 0);
  if (n === 0) return "CERO";
  if (n === 100) return "CIEN";

  const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
  const especiales = ["DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
  const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];

  if (n < 10) return unidades[n];
  if (n >= 10 && n < 20) return especiales[n - 10];
  if (n === 20) return "VEINTE";
  if (n > 20 && n < 30) return `VEINTI${unidades[n - 20]}`;

  const u = n % 10;
  const d = Math.floor(n / 10);
  if (u === 0) return decenas[d];
  return `${decenas[d]} Y ${unidades[u]}`;
}

function obtenerLiteralRedondeado(puntajeFinal, literalFallback) {
  if (puntajeFinal !== undefined && puntajeFinal !== null && String(puntajeFinal).trim() !== "") {
    const numRedondeado = Math.round(parseFloat(puntajeFinal) || 0);
    return numeroALetras(numRedondeado);
  }
  if (!literalFallback) return "";
  let str = String(literalFallback).trim().toUpperCase();
  if (str.includes(" CON ")) str = str.split(" CON ")[0];
  return str.trim();
}

function wrapText(text, font, fontSize, maxWidth) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = "";

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawDottedLine(page, x1, x2, y) {
  page.drawLine({
    start: { x: x1, y },
    end: { x: x2, y },
    thickness: 0.8,
    dashArray: [1.5, 1.5],
    color: COLOR_TEXT,
  });
}

function hLine(page, x1, x2, y) {
  page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: BORDER, color: COLOR_BORDER });
}

function vLine(page, x, y1, y2) {
  page.drawLine({ start: { x, y: y1 }, end: { x, y: y2 }, thickness: BORDER, color: COLOR_BORDER });
}

function campoPunteado(page, { label, value, x, y, endX, minLine = 50, font, fontBold, size = 9, forceUpper = true }) {
  page.drawText(label, { x, y, size, font, color: COLOR_TEXT });
  const valueX = x + font.widthOfTextAtSize(label, size);
  let val = String(value ?? "").trim();
  if (forceUpper) val = val.toUpperCase();

  if (val) {
    page.drawText(val, { x: valueX, y, size, font: fontBold, color: COLOR_TEXT });
  }

  const valW = val ? fontBold.widthOfTextAtSize(val, size) : 0;
  const lineEnd = endX ?? (valW > 0 ? valueX + valW : valueX + minLine);

  drawDottedLine(page, valueX, lineEnd, y - 1.5);
  return lineEnd;
}

export const imprimirFichaA1_4toAno = async (estudianteId) => {
  try {
    const response = await fichaA14toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha A-1."
      };
    }

    const d = response.datos;

    const urlPlantilla = encodeURI('/pdf/4año/plantilla.pdf');
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

    // MÁRGENES ESTRICTOS (5 CM ARRIBA, 3 CM IZQ, 1.81 CM DER)
    const MARGIN_TOP = (5 / 2.54) * 72; // 141.73 pt
    const MARGIN_LEFT = 85.04;          // 85.04 pt
    const MARGIN_RIGHT = 51.31;         // 51.31 pt
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // TÍTULO PRINCIPAL
    const titleLines = [
      "FICHA A-1",
      "TÉCNICAS E INSTRUMENTOS DE INVESTIGACIÓN"
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

    cursorY -= 10;

    // DATOS REFERENCIALES
    page.drawText("DATOS REFERENCIALES:", {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 9.5,
      font: fontBold,
      color: COLOR_TEXT,
    });
    cursorY -= 15;

    campoPunteado(page, {
      label: "Docente en formación: ",
      value: d.apellidos_nombres || "",
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9,
    });
    cursorY -= 15;

    campoPunteado(page, {
      label: "ESFM/UA: ",
      value: d.esfm_ua || "ESFM Simón Bolívar / UA El Alto",
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9,
    });
    cursorY -= 15;

    campoPunteado(page, {
      label: "Año de formación: ",
      value: d.ano_formacion || "4to Año",
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9,
    });
    cursorY -= 15;

    campoPunteado(page, {
      label: "Especialidad: ",
      value: d.especialidad || "",
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9,
    });
    cursorY -= 20;

    // RECUADRO INSTRUCTIVO / RESPONSABLE
    const instTxt = "El Equipo Comunitario de Trabajo de Grado diseña y aplica técnicas e instrumentos de investigación. Posteriormente procesa e interpreta la información.\nResponsable de evaluar, docente de investigación de la ESFM/UA.";
    const instLines = instTxt.split('\n');
    
    let boxH = 34;
    page.drawRectangle({
      x: MARGIN_LEFT,
      y: cursorY - boxH,
      width: CONTENT_WIDTH,
      height: boxH,
      borderColor: COLOR_BORDER,
      borderWidth: 0.8,
    });

    let instY = cursorY - 12;
    instLines.forEach((l) => {
      const wrapped = wrapText(l, fontBold, 8, CONTENT_WIDTH - 12);
      wrapped.forEach((wLine) => {
        const wWidth = fontBold.widthOfTextAtSize(wLine, 8);
        page.drawText(wLine, {
          x: CONTENT_CENTER_X - wWidth / 2,
          y: instY,
          size: 8,
          font: fontBold,
          color: COLOR_TEXT,
        });
        instY -= 10;
      });
    });

    cursorY -= (boxH + 10);

    // ESTRUCTURA DE LA TABLA (5 COLUMNAS)
    const tableTop = cursorY;
    const colWidths = [85, 115, 115, 110, 50.65]; // Total: 475.65 pt
    const colX = [
      MARGIN_LEFT,
      MARGIN_LEFT + colWidths[0],
      MARGIN_LEFT + colWidths[0] + colWidths[1],
      MARGIN_LEFT + colWidths[0] + colWidths[1] + colWidths[2],
      MARGIN_LEFT + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
      RIGHT_X
    ];

    // ALTURA TOTAL DE LA CABECERA COMPLETA
    const headerH = 60;
    const subHeaderH = 16;
    const totalHeaderH = headerH + subHeaderH;

    // DIBUJAR ENCABEZADO COLUMNA 1 (COMBINADA VERTICALMENTE SIN LÍNEA INTERMEDIA)
    const h1Lines = wrapText("Técnicas e instrumentos de investigación", fontBold, 7.5, colWidths[0] - 6);
    const startH1Y = tableTop - (totalHeaderH / 2) + ((h1Lines.length * 8.5) / 2) - 6;

    h1Lines.forEach((l, idx) => {
      const w = fontBold.widthOfTextAtSize(l, 7.5);
      page.drawText(l, {
        x: colX[0] + (colWidths[0] / 2) - (w / 2),
        y: startH1Y - idx * 8.5,
        size: 7.5,
        font: fontBold,
        color: COLOR_TEXT,
      });
    });

    // ENCABEZADOS DE LAS COLUMNAS 2 A 5
    const otherHeaders = [
      { text: "Diseño y validación de técnicas e instrumentos de investigación (Se evalúa antes de la PEC).", x: colX[1], w: colWidths[1] },
      { text: "Aplicación de técnicas e instrumentos de investigación (Se evalúa durante el proceso de la PEC).", x: colX[2], w: colWidths[2] },
      { text: "Orden, análisis, reflexión e interpretación de la información. (Se evalúa durante el proceso de la PEC).", x: colX[3], w: colWidths[3] },
      { text: "Promedio", x: colX[4], w: colWidths[4] }
    ];

    otherHeaders.forEach((h) => {
      const lines = wrapText(h.text, fontBold, 7.5, h.w - 6);
      const startTextY = tableTop - (headerH / 2) + ((lines.length * 8.5) / 2) - 6;

      lines.forEach((l, idx) => {
        const w = fontBold.widthOfTextAtSize(l, 7.5);
        page.drawText(l, {
          x: h.x + (h.w / 2) - (w / 2),
          y: startTextY - idx * 8.5,
          size: 7.5,
          font: fontBold,
          color: COLOR_TEXT,
        });
      });
    });

    // LÍNEA SUPERIOR DE LA TABLA
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop);

    // LÍNEA DIVISORIA DE SUB-ENCABEZADO (SÓLO DE LA COLUMNA 2 A LA 5, DEJA VACÍA Y UNIDA LA COLUMNA 1)
    const subHeaderY = tableTop - headerH;
    hLine(page, colX[1], RIGHT_X, subHeaderY);

    // SUB-ENCABEZADOS "1 a 100 puntos" EN COLUMNAS DE EVALUACIÓN (2, 3, 4)
    [1, 2, 3].forEach((colIdx) => {
      const subTxt = "1 a 100 puntos";
      const wSub = font.widthOfTextAtSize(subTxt, 7.5);
      page.drawText(subTxt, {
        x: colX[colIdx] + (colWidths[colIdx] / 2) - (wSub / 2),
        y: subHeaderY - 11,
        size: 7.5,
        font,
        color: COLOR_TEXT,
      });
    });

    let currentTableY = tableTop - totalHeaderH;
    
    // LÍNEA HORIZONTAL DE Cierre De CABECERA COMPLETA DE BORDE A BORDE
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // OBTENER Y PROCESAR LISTA DE TÉCNICAS DESDE LA BASE DE DATOS
    let tecnicas = Array.isArray(d.tecnicas_evaluacion) && d.tecnicas_evaluacion.length > 0
      ? d.tecnicas_evaluacion
      : [
          { tecnica: "", c1: d.c1_diseno_validacion, c2: d.c2_aplicacion_tecnicas, c3: d.c3_orden_analisis },
          { tecnica: "", c1: "", c2: "", c3: "" },
          { tecnica: "", c1: "", c2: "", c3: "" }
        ];

    while (tecnicas.length < 3) {
      tecnicas.push({ tecnica: "", c1: "", c2: "", c3: "" });
    }

    tecnicas.forEach((t) => {
      const rowH = 22;

      // Columna 1: Nombre / Descripción de la Técnica (propiedad 'tecnica')
      const nombreTecnica = t.tecnica || t.nombre || "";
      if (nombreTecnica) {
        const tLines = wrapText(nombreTecnica, font, 7.5, colWidths[0] - 6);
        tLines.forEach((l, idx) => {
          page.drawText(l, {
            x: colX[0] + 4,
            y: currentTableY - 13 - idx * 8,
            size: 7.5,
            font,
            color: COLOR_TEXT,
          });
        });
      }

      // Columnas 2, 3, 4: Criterios Individuales (c1, c2, c3)
      const c1Val = t.c1 ?? d.c1_diseno_validacion;
      const c2Val = t.c2 ?? d.c2_aplicacion_tecnicas;
      const c3Val = t.c3 ?? d.c3_orden_analisis;

      const cVals = [c1Val, c2Val, c3Val];
      let sumNotas = 0;
      let cantNotas = 0;

      cVals.forEach((cVal, cIdx) => {
        if (cVal !== undefined && cVal !== null && String(cVal).trim() !== "") {
          const vNum = parseFloat(cVal);
          if (!isNaN(vNum)) {
            sumNotas += vNum;
            cantNotas++;
            const vStr = String(Math.round(vNum));
            const wV = font.widthOfTextAtSize(vStr, 8.5);
            page.drawText(vStr, {
              x: colX[cIdx + 1] + (colWidths[cIdx + 1] / 2) - (wV / 2),
              y: currentTableY - 14,
              size: 8.5,
              font,
              color: COLOR_TEXT,
            });
          }
        }
      });

      // Columna 5: Promedio de la fila de la técnica
      if (cantNotas > 0) {
        const promTecnica = Math.round(sumNotas / cantNotas);
        const pStr = String(promTecnica);
        const wP = font.widthOfTextAtSize(pStr, 8.5);
        page.drawText(pStr, {
          x: colX[4] + (colWidths[4] / 2) - (wP / 2),
          y: currentTableY - 14,
          size: 8.5,
          font,
          color: COLOR_TEXT,
        });
      }

      currentTableY -= rowH;
      hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);
    });

    // FILA PROMEDIO FINAL (NÚMERO ENTERO) CON CELDA INDEPENDIENTE EN LA ÚLTIMA COLUMNA
    const pfVal = d.puntaje_final ?? d.promedio_numeral ?? "";
    const promRowH = 20;
    const yPromRow = currentTableY;

    page.drawText("Promedio Final (Número entero)", {
      x: MARGIN_LEFT + 6,
      y: yPromRow - 13,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    if (pfVal !== "") {
      const pfStr = String(Math.round(parseFloat(pfVal) || 0));
      const wPf = fontBold.widthOfTextAtSize(pfStr, 9.5);
      page.drawText(pfStr, {
        x: colX[4] + (colWidths[4] / 2) - (wPf / 2),
        y: yPromRow - 13,
        size: 9.5,
        font: fontBold,
        color: COLOR_TEXT,
      });
    }

    currentTableY -= promRowH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // FILA CONTINUA PARA EL "LITERAL:"
    const litRowH = 22;
    const yLitRow = currentTableY;

    const litVal = obtenerLiteralRedondeado(pfVal, d.promedio_literal);

    page.drawText("Literal:", {
      x: MARGIN_LEFT + 6,
      y: yLitRow - 14,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    if (litVal) {
      page.drawText(litVal, {
        x: MARGIN_LEFT + 6 + fontBold.widthOfTextAtSize("Literal:", 8.5) + 6,
        y: yLitRow - 14,
        size: 8.5,
        font: fontBold,
        color: COLOR_TEXT,
      });
    }

    currentTableY -= litRowH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // FILA CONTINUA PARA OBSERVACIONES Y/O SUGERENCIAS
    const obsRowH = 34;
    const yObsRow = currentTableY;

    page.drawText("Observaciones y/o sugerencias:", {
      x: MARGIN_LEFT + 6,
      y: yObsRow - 12,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const obsVal = String(d.observaciones || "").trim();
    if (obsVal) {
      const obsLines = wrapText(obsVal, font, 7.5, CONTENT_WIDTH - 12);
      obsLines.forEach((l, idx) => {
        if (idx < 2) {
          page.drawText(l, {
            x: MARGIN_LEFT + 6,
            y: yObsRow - 22 - idx * 9,
            size: 7.5,
            font,
            color: COLOR_TEXT,
          });
        }
      });
    }

    currentTableY -= obsRowH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // BORDES VERTICALES DE LA TABLA COMPLETA
    vLine(page, colX[0], tableTop, currentTableY);
    vLine(page, colX[1], tableTop, yPromRow);
    vLine(page, colX[2], tableTop, yPromRow);
    vLine(page, colX[3], tableTop, yPromRow);
    vLine(page, colX[4], tableTop, yPromRow - promRowH); // Mantiene el borde separador de celda para el Promedio Final
    vLine(page, RIGHT_X, tableTop, currentTableY);

    cursorY = currentTableY - 20;

    // LUGAR Y FECHA CENTRADO HORIZONTALMENTE
    const lblFecha = "Lugar y fecha: ";
    const valFecha = `${d.lugar_ciudad || 'El Alto'}, ${d.dia || String(new Date().getDate())} de ${d.mes || 'septiembre'} de ${d.ano || '2026'}`;

    const wLbl = font.widthOfTextAtSize(lblFecha, 8.5);
    const wVal = fontBold.widthOfTextAtSize(valFecha, 8.5);
    const totalFechaW = wLbl + wVal;
    
    const fechaStartX = CONTENT_CENTER_X - totalFechaW / 2;

    page.drawText(lblFecha, { x: fechaStartX, y: cursorY, size: 8.5, font, color: COLOR_TEXT });

    const valStartX = fechaStartX + wLbl;
    page.drawText(valFecha, { x: valStartX, y: cursorY, size: 8.5, font: fontBold, color: COLOR_TEXT });
    drawDottedLine(page, valStartX, valStartX + wVal, cursorY - 1.5);

    cursorY -= 55;

    // FIRMAS INFERIORES (2 FIRMAS)
    const colSigWidth = CONTENT_WIDTH / 2;
    const lineW = 160;

    const firmas = [
      {
        label: "Estudiante",
        xCenter: MARGIN_LEFT + colSigWidth * 0.5
      },
      {
        label: "Docente de Investigación\nESFM/UA.",
        xCenter: MARGIN_LEFT + colSigWidth * 1.5
      }
    ];

    firmas.forEach((f) => {
      const lineStartX = f.xCenter - lineW / 2;
      const lineEndX = f.xCenter + lineW / 2;

      drawDottedLine(page, lineStartX, lineEndX, cursorY);

      const labelLines = f.label.split('\n');
      labelLines.forEach((l, idx) => {
        const w = fontBold.widthOfTextAtSize(l, 8.5);
        page.drawText(l, {
          x: f.xCenter - w / 2,
          y: cursorY - 12 - idx * 10,
          size: 8.5,
          font: fontBold,
          color: COLOR_TEXT,
        });
      });
    });

    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, '_blank');
    return { success: true };

  } catch (error) {
    console.error("Error al generar PDF de la Ficha A-1 (4to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};