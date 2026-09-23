import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaA24toAnoService } from '../../../services/fichas/4año/fichaA24toAnoService';

// PALETA DE COLORES INSTITUCIONALES
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);            // Dorado (#C9A751)
const COLOR_TABLE_HEADER = rgb(201 / 255, 167 / 255, 81 / 255);      // Dorado/Ocre Tabla (#C9A751)
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

export const imprimirFichaA2_4toAno = async (estudianteId) => {
  try {
    const response = await fichaA24toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha A-2."
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
      "FICHA A-2",
      "ELABORACIÓN DE PLANES DE DESARROLLO CURRICULAR – PDC"
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

    // PÁRRAFOS EXPLICATIVOS E INSTRUCTIVOS
    const descTexts = [
      "Cada integrante del ECTG elabora y presenta los Planes de Desarrollo Curricular (PDC) establecidos para su posterior implementación en la UE/CEA/CEE.",
      "Educación Inicial en Familia Comunitaria (EIFC), Educación Primaria Comunitaria Vocacional (EPCV) y Educación Especial desarrollan cuatro (4) PDC incluyendo la clase comunitaria.",
      "Educación Secundaria Comunitaria Productiva (ESCP) desarrollan seis (6) PDC, incluyendo la clase comunitaria."
    ];

    descTexts.forEach((pText) => {
      const wrapped = wrapText(pText, font, 9, CONTENT_WIDTH);
      wrapped.forEach((wLine) => {
        page.drawText(wLine, {
          x: MARGIN_LEFT,
          y: cursorY,
          size: 9,
          font,
          color: COLOR_TEXT,
        });
        cursorY -= 11;
      });
      cursorY -= 4;
    });

    cursorY -= 6;

    // ESTRUCTURA DE LA TABLA
    const tableTop = cursorY;
    const colWidths = [200, 275.65]; // Total: 475.65 pt
    const colX = [MARGIN_LEFT, MARGIN_LEFT + colWidths[0], RIGHT_X];

    // ENCABEZADOS DE TABLA
    const headerH = 22;
    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, headerH, COLOR_TABLE_HEADER);

    // Texto Columna 1
    const wH1 = fontBold.widthOfTextAtSize("Criterio", 11);
    page.drawText("Criterio", {
      x: colX[0] + (colWidths[0] / 2) - (wH1 / 2),
      y: tableTop - 15,
      size: 11,
      font: fontBold,
      color: COLOR_WHITE,
    });

    // Texto Columna 2
    const wH2 = fontBold.widthOfTextAtSize("Valoración de 1 a 100 puntos", 11);
    page.drawText("Valoración de 1 a 100 puntos", {
      x: colX[1] + (colWidths[1] / 2) - (wH2 / 2),
      y: tableTop - 15,
      size: 11,
      font: fontBold,
      color: COLOR_WHITE,
    });

    let currentTableY = tableTop - headerH;
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // CRITERIOS DE EVALUACIÓN
    const criteriosList = [
      { key: "c1", text: "Claridad en el planteamiento del objetivo respecto a los resultados o logros a alcanzar con las y los estudiantes." },
      { key: "c2", text: "Planteamiento coherente de los procesos pedagógicos según contenido(s) a desarrollar." },
      { key: "c3", text: "Recursos y materiales educativos pertinentes." },
      { key: "c4", text: "Planteamiento de estrategias e instrumentos de evaluación coherentes." },
      { key: "c5", text: "Articulación adecuada entre los elementos curriculares del PDC." }
    ];

    criteriosList.forEach((crit) => {
      const cLines = wrapText(crit.text, font, 8.5, colWidths[0] - 10);
      const lineH = 10;
      const rowH = Math.max(24, cLines.length * lineH + 8);
      const textStartY = currentTableY - (rowH / 2) + ((cLines.length * lineH) / 2) - 7;

      cLines.forEach((l, idx) => {
        page.drawText(l, {
          x: colX[0] + 5,
          y: textStartY - idx * lineH,
          size: 8.5,
          font,
          color: COLOR_TEXT,
        });
      });

      // Nota del Criterio
      const valC = d[crit.key];
      if (valC !== undefined && valC !== null && String(valC).trim() !== "") {
        const vNum = Math.round(parseFloat(valC) || 0);
        const vStr = String(vNum);
        const wV = font.widthOfTextAtSize(vStr, 9);
        page.drawText(vStr, {
          x: colX[1] + (colWidths[1] / 2) - (wV / 2),
          y: currentTableY - (rowH / 2) - 3,
          size: 9,
          font,
          color: COLOR_TEXT,
        });
      }

      currentTableY -= rowH;
      hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);
    });

    // FILA DE PROMEDIO FINAL (CELDA COMBINADA CON NUMERAL Y LITERAL)
    const pfVal = d.promedio_numeral ?? d.puntaje_final ?? "";
    const promRowH = 36;
    const yPromRow = currentTableY;

    // Columna 1: Promedio Final (Número entero)
    const pLabelLines = ["Promedio Final (Número", "entero)"];
    pLabelLines.forEach((l, idx) => {
      page.drawText(l, {
        x: MARGIN_LEFT + 6,
        y: yPromRow - 14 - idx * 10,
        size: 8.5,
        font: fontBold,
        color: COLOR_TEXT,
      });
    });

    // Subdivisión Columna 2: Numeral y Literal
    const midX = MARGIN_LEFT + 120;
    
    // Fila Numeral:
    page.drawText("Numeral:", {
      x: midX + 6,
      y: yPromRow - 12,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    if (pfVal !== "") {
      const pfStr = String(Math.round(parseFloat(pfVal) || 0));
      const wPf = font.widthOfTextAtSize(pfStr, 9);
      page.drawText(pfStr, {
        x: colX[1] + (colWidths[1] / 2) - (wPf / 2),
        y: yPromRow - 12,
        size: 9,
        font,
        color: COLOR_TEXT,
      });
    }

    hLine(page, midX, RIGHT_X, yPromRow - 18);

    // Fila Literal:
    page.drawText("Literal:", {
      x: midX + 6,
      y: yPromRow - 30,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const litVal = obtenerLiteralRedondeado(pfVal, d.promedio_literal);
    if (litVal) {
      const wLit = font.widthOfTextAtSize(litVal, 8.5);
      page.drawText(litVal, {
        x: colX[1] + (colWidths[1] / 2) - (wLit / 2),
        y: yPromRow - 30,
        size: 8.5,
        font,
        color: COLOR_TEXT,
      });
    }

    currentTableY -= promRowH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // RECUADRO DE OBSERVACIONES Y/O SUGERENCIAS
    const obsRowH = 40;
    const yObsRow = currentTableY;

    page.drawText("Observaciones y/o sugerencias:", {
      x: MARGIN_LEFT + 6,
      y: yObsRow - 13,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const obsVal = String(d.observaciones || "").trim();
    if (obsVal) {
      const obsLines = wrapText(obsVal, font, 8, CONTENT_WIDTH - 12);
      obsLines.forEach((l, idx) => {
        if (idx < 2) {
          page.drawText(l, {
            x: MARGIN_LEFT + 6,
            y: yObsRow - 25 - idx * 10,
            size: 8,
            font,
            color: COLOR_TEXT,
          });
        }
      });
    }

    currentTableY -= obsRowH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // BORDES VERTICALES DE LA TABLA
    vLine(page, colX[0], tableTop, currentTableY);
    vLine(page, colX[1], tableTop, currentTableY);
    vLine(page, midX, yPromRow, yPromRow - promRowH);
    vLine(page, RIGHT_X, tableTop, currentTableY);

    cursorY = currentTableY - 20;

    // LUGAR Y FECHA CENTRADO HORIZONTALMENTE
    const lblFecha = "Lugar y fecha: ";
    const valFecha = `${d.lugar_ciudad || 'El Alto'}, ${d.dia || String(new Date().getDate())} de ${d.mes || 'septiembre'} de ${d.ano || '2026'}`;

    const wLbl = font.widthOfTextAtSize(lblFecha, 9);
    const wVal = fontBold.widthOfTextAtSize(valFecha, 9);
    const totalFechaW = wLbl + wVal;
    
    const fechaStartX = CONTENT_CENTER_X - totalFechaW / 2;

    page.drawText(lblFecha, { x: fechaStartX, y: cursorY, size: 9, font, color: COLOR_TEXT });

    const valStartX = fechaStartX + wLbl;
    page.drawText(valFecha, { x: valStartX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
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
        label: "Docente Tutor Acompañante\nESFM/UA.",
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
    console.error("Error al generar PDF de la Ficha A-2 (4to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};