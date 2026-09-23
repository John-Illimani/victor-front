import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaB34toAnoService } from '../../../services/fichas/4año/fichaB34toAnoService';

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

export const imprimirFichaB3_4toAno = async (estudianteId) => {
  try {
    const response = await fichaB34toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha B-3."
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

    // TÍTULO PRINCIPAL (Dorado 13 pt Bold Centrado)
    const titleLines = [
      "FICHA B-3",
      "VALORACIÓN DE LA CLASE COMUNITARIA"
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

    cursorY -= 8;

    // SUBTÍTULO / INSTRUCTIVO (SIN NEGRITA)
    const subTitle = "En esta clase participa un actor educativo como observador/a de la UE/CEA/CEE o ESFM/UA.";
    const subTitleLines = wrapText(subTitle, font, 9, CONTENT_WIDTH);
    subTitleLines.forEach((l) => {
      page.drawText(l, {
        x: MARGIN_LEFT,
        y: cursorY,
        size: 9,
        font,
        color: COLOR_TEXT,
      });
      cursorY -= 12;
    });

    cursorY -= 10;

    // ESTRUCTURA DE LA TABLA
    const tableTop = cursorY;
    const colWidths = [285.65, 190.00]; // Total: 475.65 pt
    const colX = [MARGIN_LEFT, MARGIN_LEFT + colWidths[0], RIGHT_X];

    // ENCABEZADOS DE TABLA
    const headerH = 22;
    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, headerH, COLOR_TABLE_HEADER);

    // Texto Columna 1
    const wH1 = fontBold.widthOfTextAtSize("Criterios de valoración", 10);
    page.drawText("Criterios de valoración", {
      x: colX[0] + (colWidths[0] / 2) - (wH1 / 2),
      y: tableTop - 15,
      size: 10,
      font: fontBold,
      color: COLOR_WHITE,
    });

    // Texto Columna 2
    const wH2 = fontBold.widthOfTextAtSize("Valoración de 1 a 100 puntos", 10);
    page.drawText("Valoración de 1 a 100 puntos", {
      x: colX[1] + (colWidths[1] / 2) - (wH2 / 2),
      y: tableTop - 15,
      size: 10,
      font: fontBold,
      color: COLOR_WHITE,
    });

    let currentTableY = tableTop - headerH;
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // CATEGORÍAS DE VALORACIÓN
    const categoriasList = [
      {
        key: "nota_planificacion",
        titulo: "PLANIFICACIÓN – CONCRECIÓN DEL PDC",
        items: [
          "Existe coherencia y relación del objetivo con el proceso pedagógico y los criterios de evaluación.",
          "Los elementos curriculares del PDC se relacionan con el desarrollo de la clase."
        ]
      },
      {
        key: "nota_desarrollo_contenidos",
        titulo: "DESARROLLO DE CONTENIDOS",
        items: [
          "Recupera conocimientos y experiencias de las y los estudiantes.",
          "Dinamiza la participación activa y crítica.",
          "Vincula nuevos conocimientos con hechos de la realidad y la vida cotidiana.",
          "Muestra conocimiento profundo de los contenidos de su especialidad.",
          "Demuestra dominio de aula."
        ]
      },
      {
        keyField: "nota_estrategias",
        titulo: "ESTRATEGIAS METODOLÓGICAS",
        items: [
          "Promueve el trabajo en equipo y el diálogo.",
          "Fomenta actividades para aprender haciendo.",
          "Utiliza materiales educativos y herramientas tecnológicas pertinentes.",
          "Promueve el aprendizaje centrado en el estudiante como protagonista activo."
        ]
      },
      {
        keyField: "nota_evaluacion",
        titulo: "EVALUACIÓN",
        items: [
          "Realiza la evaluación según el objetivo planificado en el PDC.",
          "- Utiliza instrumento(s) de evaluación."
        ]
      }
    ];

    categoriasList.forEach((cat) => {
      const catStartY = currentTableY;

      // Imprimir Título de Categoría en Negrita
      const titH = 14;
      page.drawText(cat.titulo, {
        x: colX[0] + 5,
        y: currentTableY - 10,
        size: 8,
        font: fontBold,
        color: COLOR_TEXT,
      });

      currentTableY -= titH;

      // Imprimir Ítems de la Categoría
      cat.items.forEach((itemTxt) => {
        const iLines = wrapText(itemTxt, font, 7.5, colWidths[0] - 10);
        const lineH = 8.5;
        const itemH = Math.max(14, iLines.length * lineH + 4);
        const textStartY = currentTableY - (itemH / 2) + ((iLines.length * lineH) / 2) - 5;

        iLines.forEach((l, idx) => {
          page.drawText(l, {
            x: colX[0] + 5,
            y: textStartY - idx * lineH,
            size: 7.5,
            font,
            color: COLOR_TEXT,
          });
        });

        currentTableY -= itemH;
      });

      const catEndY = currentTableY;
      const totalCatHeight = catStartY - catEndY;

      // VALORACIÓN UNIFICADA DE LA CATEGORÍA (CENTRADA VERTICALMENTE)
      const fieldKey = cat.keyField || cat.key;
      const valCat = d[fieldKey];

      if (valCat !== undefined && valCat !== null && String(valCat).trim() !== "") {
        const vNum = Math.round(parseFloat(valCat) || 0);
        const vStr = String(vNum);
        const wV = font.widthOfTextAtSize(vStr, 9);
        page.drawText(vStr, {
          x: colX[1] + (colWidths[1] / 2) - (wV / 2),
          y: catStartY - (totalCatHeight / 2) - 3,
          size: 9,
          font,
          color: COLOR_TEXT,
        });
      }

      hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);
    });

    // FILA DE PROMEDIO FINAL (ESTRUCTURA EXACTA DE LA REFERENCIA)
    const pfVal = d.promedio_numeral ?? d.puntaje_final ?? "";
    const yPromRow = currentTableY;
    const hNumRow = 18;
    const hLitRow = 18;
    const totalPromRowH = hNumRow + hLitRow;

    // Columna 1: Promedio Final (Número entero) Centrado Verticalmente
    page.drawText("Promedio Final (Número entero)", {
      x: MARGIN_LEFT + 6,
      y: yPromRow - 21,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    // Subdivisión de Columna 2: Fila Numeral
    const midCol2X = colX[1] + 75; // Divisoria entre 'Numeral:' y la nota

    page.drawText("Numeral:", {
      x: colX[1] + 6,
      y: yPromRow - 12,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    if (pfVal !== "") {
      const pfStr = String(Math.round(parseFloat(pfVal) || 0));
      const wPf = font.widthOfTextAtSize(pfStr, 9);
      page.drawText(pfStr, {
        x: midCol2X + ((RIGHT_X - midCol2X) / 2) - (wPf / 2),
        y: yPromRow - 12,
        size: 9,
        font,
        color: COLOR_TEXT,
      });
    }

    const yNumLine = yPromRow - hNumRow;
    hLine(page, colX[1], RIGHT_X, yNumLine);

    // Subdivisión de Columna 2: Fila Literal
    page.drawText("Literal:", {
      x: colX[1] + 6,
      y: yNumLine - 12,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const litVal = obtenerLiteralRedondeado(pfVal, d.promedio_literal);
    if (litVal) {
      page.drawText(litVal, {
        x: colX[1] + 6 + fontBold.widthOfTextAtSize("Literal:", 8.5) + 6,
        y: yNumLine - 12,
        size: 8.5,
        font,
        color: COLOR_TEXT,
      });
    }

    currentTableY -= totalPromRowH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // BORDES VERTICALES ADICIONALES DE LA SECCIÓN DE PROMEDIOS
    vLine(page, midCol2X, yPromRow, yNumLine);

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

    // BORDES VERTICALES DE LA TABLA PRINCIPAL Y DIVISIONES
    vLine(page, colX[0], tableTop, currentTableY); // Borde exterior izquierdo
    vLine(page, RIGHT_X, tableTop, currentTableY); // Borde exterior derecho
    vLine(page, colX[1], tableTop, yObsRow);       // División central (SOLO hasta arriba de Observaciones)

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

    // FIRMAS INFERIORES (3 FIRMAS)
    const colSigWidth = CONTENT_WIDTH / 3;
    const lineW = 125;

    const firmas = [
      {
        label: "Estudiante",
        xCenter: MARGIN_LEFT + colSigWidth * 0.5
      },
      {
        label: "Docente Guía\n(UE/CEA/CEE)",
        xCenter: MARGIN_LEFT + colSigWidth * 1.5
      },
      {
        label: "Observador (a)\n(UE/CEA/CEE/ESFM)",
        xCenter: MARGIN_LEFT + colSigWidth * 2.5
      }
    ];

    firmas.forEach((f) => {
      const lineStartX = f.xCenter - lineW / 2;
      const lineEndX = f.xCenter + lineW / 2;

      drawDottedLine(page, lineStartX, lineEndX, cursorY);

      const labelLines = f.label.split('\n');
      labelLines.forEach((l, idx) => {
        const w = fontBold.widthOfTextAtSize(l, 8);
        page.drawText(l, {
          x: f.xCenter - w / 2,
          y: cursorY - 12 - idx * 10,
          size: 8,
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
    console.error("Error al generar PDF de la Ficha B-3 (4to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};