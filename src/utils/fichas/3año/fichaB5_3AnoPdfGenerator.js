import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaB53erAnoService } from '../../../services/fichas/3año/fichaB53erAnoService';

// Paleta de Colores Institucionales
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);            // Dorado (#C9A751)
const COLOR_TABLE_HEADER = rgb(155 / 255, 168 / 255, 102 / 255);    // Verde Oliva (#9BA866)
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

function fillRect(page, x, yTop, w, h, color) {
  page.drawRectangle({ x, y: yTop - h, width: w, height: h, color });
}

function campoPunteado(page, { label, value, x, y, endX, minLine = 50, font, fontBold, size = 8.5, forceUpper = true }) {
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

export const imprimirFichaB5_3erAno = async (estudianteId) => {
  try {
    const response = await fichaB53erAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha B-5."
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

    // Carga de Fuentes
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
    const MARGIN_TOP = (5 / 2.54) * 72; 
    const MARGIN_LEFT = 85.04;          
    const MARGIN_RIGHT = 51.31;         
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // TÍTULO PRINCIPAL (Dorado Bold Centrado)
    const titleLines = [
      "FICHA B-5",
      "PRESENTACIÓN DEL INFORME DEL DIAGNÓSTICO",
      "SOCIOPARTICIPATIVO"
    ];

    titleLines.forEach((line) => {
      const w = fontBold.widthOfTextAtSize(line, 12.5);
      page.drawText(line, {
        x: CONTENT_CENTER_X - w / 2,
        y: cursorY,
        size: 12.5,
        font: fontBold,
        color: COLOR_TITLE,
      });
      cursorY -= 15;
    });

    cursorY -= 4;

    page.drawText("DATOS REFERENCIALES:", {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });
    cursorY -= 13;

    campoPunteado(page, {
      label: "ESFM/UA: ",
      value: d.esfm_ua || "ESFM Simón Bolívar / UA El Alto",
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 8,
    });
    cursorY -= 13;

    campoPunteado(page, {
      label: "Apellido(s) y Nombre(s) del(a) estudiante: ",
      value: d.apellidos_nombres || "",
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 8,
    });
    cursorY -= 13;

    campoPunteado(page, {
      label: "Especialidad: ",
      value: d.especialidad || "",
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 8,
    });
    cursorY -= 16;

    // RECUADRO INSTRUCTIVO
    const boxH = 34;
    page.drawRectangle({
      x: MARGIN_LEFT,
      y: cursorY - boxH,
      width: CONTENT_WIDTH,
      height: boxH,
      borderColor: COLOR_BORDER,
      borderWidth: 0.8,
    });

    const instTxt = "La ficha B-4 evalúa la presentación del informe del diagnóstico socioparticipativo, considerando el análisis del contexto educativo, la identificación y priorización de problemas, así como la coherencia en la redacción académica y el uso de normas APA (6ta y/o 7ma edición).";
    const instLines = wrapText(instTxt, fontBold, 7, CONTENT_WIDTH - 12);
    instLines.forEach((l, idx) => {
      page.drawText(l, {
        x: MARGIN_LEFT + 6,
        y: cursorY - 10 - idx * 8.5,
        size: 7,
        font: fontBold,
        color: COLOR_TEXT,
      });
    });

    cursorY -= (boxH + 8);

    // ESTRUCTURA DE LA TABLA
    const tableTop = cursorY;
    const colWidths = [165, 245.65, 65]; // Total: 475.65 pt
    const colX = [MARGIN_LEFT, MARGIN_LEFT + colWidths[0], MARGIN_LEFT + colWidths[0] + colWidths[1], RIGHT_X];

    // ENCABEZADOS DE TABLA (Verde Oliva)
    const headerH = 22;
    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, headerH, COLOR_TABLE_HEADER);

    const headers = [
      { text: "CRITERIOS DE EVALUACIÓN", x: colX[0], w: colWidths[0] },
      { text: "VALORACIÓN CUALITATIVA", x: colX[1], w: colWidths[1] },
      { text: "PUNTAJE (1-100)", x: colX[2], w: colWidths[2] }
    ];

    headers.forEach(h => {
      const lines = wrapText(h.text, fontBold, 7.5, h.w - 4);
      lines.forEach((l, idx) => {
        const w = fontBold.widthOfTextAtSize(l, 7.5);
        page.drawText(l, {
          x: h.x + (h.w / 2) - (w / 2),
          y: tableTop - 13 - idx * 8,
          size: 7.5,
          font: fontBold,
          color: COLOR_TEXT,
        });
      });
    });

    let currentTableY = tableTop - headerH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // LISTA DE LOS 10 CRITERIOS DE EVALUACIÓN CON SUS OBSERVACIONES
    const criteriosList = [
      { key: "c1", obsKey: "obs_c1", text: "Descripción del contexto educativo y características de la UE/CEA/CEE" },
      { key: "c2", obsKey: "obs_c2", text: "Análisis de la información (Aspectos sociales, económicos, culturales, etc.)" },
      { key: "c3", obsKey: "obs_c3", text: "Formulación adecuada del nudo problemático." },
      { key: "c4", obsKey: "obs_c4", text: "Preguntas problematizadoras, pertinentes al nudo." },
      { key: "c5", obsKey: "obs_c5", text: "Metodología del proceso IEPC-PEC." },
      { key: "c6", obsKey: "obs_c6", text: "Marco reflexivo teórico." },
      { key: "c7", obsKey: "obs_c7", text: "Alternativa de solución planteada" },
      { key: "c8", obsKey: "obs_c8", text: "Conclusiones y recomendaciones" },
      { key: "c9", obsKey: "obs_c9", text: "Claridad y coherencia en la redacción." },
      { key: "c10", obsKey: "obs_c10", text: "Uso de normas APA (6ta y/o 7ma edición)." }
    ];

    criteriosList.forEach((crit) => {
      const cLines = wrapText(crit.text, font, 7, colWidths[0] - 8);
      
      // Columna 2: Observación Cualitativa Individual
      const obsText = String(d[crit.obsKey] || "").trim();
      const obsLines = wrapText(obsText, font, 7, colWidths[1] - 8);

      const maxLines = Math.max(cLines.length, obsLines.length, 1);
      const rowH = Math.max(19, maxLines * 8 + 8);

      // Dibujar Columna 1: Criterio
      const cStartY = currentTableY - (rowH / 2) + ((cLines.length * 8) / 2) - 5;
      cLines.forEach((l, idx) => {
        page.drawText(l, {
          x: colX[0] + 5,
          y: cStartY - idx * 8,
          size: 7,
          font,
          color: COLOR_TEXT,
        });
      });

      // Dibujar Columna 2: Valoración Cualitativa
      if (obsLines.length > 0) {
        const obsStartY = currentTableY - (rowH / 2) + ((obsLines.length * 8) / 2) - 5;
        obsLines.forEach((l, idx) => {
          page.drawText(l, {
            x: colX[1] + 5,
            y: obsStartY - idx * 8,
            size: 7,
            font,
            color: COLOR_TEXT,
          });
        });
      }

      // Dibujar Columna 3: Puntaje (c1 a c10)
      const valC = d[crit.key];
      if (valC !== undefined && valC !== null && String(valC).trim() !== "") {
        const vNum = Math.round(parseFloat(valC) || 0);
        const vStr = String(vNum);
        const wV = font.widthOfTextAtSize(vStr, 8);
        page.drawText(vStr, {
          x: colX[2] + (colWidths[2] / 2) - (wV / 2),
          y: currentTableY - (rowH / 2) - 3,
          size: 8,
          font,
          color: COLOR_TEXT,
        });
      }

      currentTableY -= rowH;
      hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);
    });

    // BORDES VERTICALES DE LA TABLA DE CRITERIOS
    colX.forEach(xPos => vLine(page, xPos, tableTop, currentTableY));

    // FILA PROMEDIO / PUNTAJE FINAL LITERAL
    const litH = 18;
    const yLitRow = currentTableY;

    const pfVal = d.puntaje_final ?? d.promedio_numeral ?? "";
    const litVal = obtenerLiteralRedondeado(pfVal, d.promedio_literal);

    page.drawText("Literal:", {
      x: MARGIN_LEFT + 6,
      y: yLitRow - 12,
      size: 8,
      font: fontBold,
      color: COLOR_TEXT,
    });

    if (litVal) {
      page.drawText(litVal, {
        x: MARGIN_LEFT + 6 + fontBold.widthOfTextAtSize("Literal:", 8) + 6,
        y: yLitRow - 12,
        size: 8.5,
        font: fontBold,
        color: COLOR_TEXT,
      });
    }

    currentTableY -= litH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    vLine(page, MARGIN_LEFT, yLitRow, currentTableY);
    vLine(page, RIGHT_X, yLitRow, currentTableY);

    // RECUADRO DE OBSERVACIONES
    const obsHeaderH = 16;
    const yObsHeader = currentTableY;
    fillRect(page, MARGIN_LEFT, yObsHeader, CONTENT_WIDTH, obsHeaderH, COLOR_TABLE_HEADER);

    page.drawText("OBSERVACIONES Y/O SUGERENCIAS DE LA CONCRECIÓN CURRICULAR Y/O DE LA CLASE COMUNITARIA:", {
      x: MARGIN_LEFT + 6,
      y: yObsHeader - 11,
      size: 7,
      font: fontBold,
      color: COLOR_TEXT,
    });

    currentTableY -= obsHeaderH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    const obsBoxH = 32;
    const yObsBox = currentTableY;

    const obsVal = String(d.observaciones || "").trim();
    if (obsVal) {
      const obsLines = wrapText(obsVal, font, 7.5, CONTENT_WIDTH - 12);
      obsLines.forEach((l, idx) => {
        if (idx < 3) {
          page.drawText(l, {
            x: MARGIN_LEFT + 6,
            y: yObsBox - 11 - idx * 9,
            size: 7.5,
            font,
            color: COLOR_TEXT,
          });
        }
      });
    }

    currentTableY -= obsBoxH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    vLine(page, MARGIN_LEFT, yObsHeader, currentTableY);
    vLine(page, RIGHT_X, yObsHeader, currentTableY);

    cursorY = currentTableY - 14;

    // LUGAR Y FECHA
    const lblFecha = "Lugar y fecha: ";
    const valFecha = `${d.lugar_ciudad || 'El Alto'}, ${d.dia || String(new Date().getDate())} de ${d.mes || 'septiembre'} de ${d.ano || '2026'}`;

    const wLbl = font.widthOfTextAtSize(lblFecha, 8);
    const wVal = fontBold.widthOfTextAtSize(valFecha, 8);
    const totalFechaW = wLbl + wVal;
    const fechaStartX = RIGHT_X - totalFechaW;

    page.drawText(lblFecha, { x: fechaStartX, y: cursorY, size: 8, font, color: COLOR_TEXT });

    const valStartX = fechaStartX + wLbl;
    page.drawText(valFecha, { x: valStartX, y: cursorY, size: 8, font: fontBold, color: COLOR_TEXT });
    drawDottedLine(page, valStartX, valStartX + wVal, cursorY - 1.5);

    cursorY -= 36;

    // FIRMAS INFERIORES: 3 ESTUDIANTES (ARRIBA) + 2 DOCENTES (ABAJO)
    const col3Width = CONTENT_WIDTH / 3;
    const sigLine3W = 120;

    const estudiantesSigs = [
      { label: "Estudiante", xCenter: MARGIN_LEFT + col3Width * 0.5 },
      { label: "Estudiante", xCenter: MARGIN_LEFT + col3Width * 1.5 },
      { label: "Estudiante", xCenter: MARGIN_LEFT + col3Width * 2.5 }
    ];

    estudiantesSigs.forEach((f) => {
      const lineStartX = f.xCenter - sigLine3W / 2;
      const lineEndX = f.xCenter + sigLine3W / 2;

      drawDottedLine(page, lineStartX, lineEndX, cursorY);

      const w = fontBold.widthOfTextAtSize(f.label, 8);
      page.drawText(f.label, {
        x: f.xCenter - w / 2,
        y: cursorY - 10,
        size: 8,
        font: fontBold,
        color: COLOR_TEXT,
      });
    });

    cursorY -= 40;

    const col2Width = CONTENT_WIDTH / 2;
    const sigLine2W = 160;

    const docentesSigs = [
      { label: "Docente Acompañante ESFM/UA", xCenter: MARGIN_LEFT + col2Width * 0.5 },
      { label: "Docente Investigación", xCenter: MARGIN_LEFT + col2Width * 1.5 }
    ];

    docentesSigs.forEach((f) => {
      const lineStartX = f.xCenter - sigLine2W / 2;
      const lineEndX = f.xCenter + sigLine2W / 2;

      drawDottedLine(page, lineStartX, lineEndX, cursorY);

      const w = fontBold.widthOfTextAtSize(f.label, 8);
      page.drawText(f.label, {
        x: f.xCenter - w / 2,
        y: cursorY - 10,
        size: 8,
        font: fontBold,
        color: COLOR_TEXT,
      });
    });

    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, '_blank');
    return { success: true };

  } catch (error) {
    console.error("Error al generar PDF de la Ficha B-5 (3er Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};