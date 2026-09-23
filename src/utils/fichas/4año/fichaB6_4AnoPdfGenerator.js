import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaB64toAnoService } from '../../../services/fichas/4año/fichaB64toAnoService';

// PALETA DE COLORES INSTITUCIONALES
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);            // Dorado (#C9A751)
const COLOR_TABLE_HEADER = rgb(201 / 255, 167 / 255, 81 / 255);      // Dorado/Ocre
const COLOR_BORDER = rgb(0, 0, 0);

const BORDER = 0.8;

// FORMATO DE NÚMEROS: Muestra entero si no tiene decimales o conserva decimales si existen
function formatearNumero(val) {
  if (val === null || val === undefined || val === '' || isNaN(val)) return '';
  const num = Number(val);
  if (Number.isInteger(num)) {
    return String(Math.trunc(num));
  }
  return String(parseFloat(num.toFixed(2)));
}

// FORMATO DE FECHA CORTA: 'YYYY/MM/DD'
function formatearFechaCorta(valor) {
  if (!valor) return '';
  const fecha = new Date(valor);
  if (isNaN(fecha.getTime())) return String(valor);
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
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

export const imprimirFichaB6_4toAno = async (estudianteId) => {
  try {
    const response = await fichaB64toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha B-6."
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
    page.setSize(612, 792);
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

    // MÁRGENES ESTRICTOS SOLICITADOS
    const MARGIN_TOP = (5 / 2.54) * 72; // 141.73 pt (5 cm)
    const MARGIN_LEFT = 85.04;          // 85.04 pt (3 cm)
    const MARGIN_RIGHT = 51.31;         // 51.31 pt (1.81 cm)
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt exactos
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // TÍTULO PRINCIPAL
    const titleLines = [
      "FICHA B-6",
      "SEGUIMIENTO Y APOYO DE LA/EL DOCENTE TUTOR/A ACOMPAÑANTE"
    ];

    titleLines.forEach((line) => {
      const w = fontBold.widthOfTextAtSize(line, 12);
      page.drawText(line, {
        x: CONTENT_CENTER_X - w / 2,
        y: cursorY,
        size: 12,
        font: fontBold,
        color: COLOR_TITLE,
      });
      cursorY -= 15;
    });

    cursorY -= 8;

    // SUBTÍTULO INSTRUCTIVO
    const subTitle = "La o el docente tutor/a acompañante debe realizar mínimamente dos seguimientos durante el desarrollo de la PEC. La ficha permite valorar avances, registrar observaciones y comprobar la respuesta del estudiante a las orientaciones recibidas.";
    const subTitleLines = wrapText(subTitle, font, 8.5, CONTENT_WIDTH);
    subTitleLines.forEach((l) => {
      page.drawText(l, {
        x: MARGIN_LEFT,
        y: cursorY,
        size: 8.5,
        font,
        color: COLOR_TEXT,
      });
      cursorY -= 11;
    });

    cursorY -= 10;

    // ESTRUCTURA DE COLUMNAS ADAPTADA AL ANCHO ÚTIL DE 475.65 pt
    const tableTop = cursorY;
    const colWidths = [28, 257.32, 60, 60, 70.33]; // Total: 475.65 pt
    const colX = [
      MARGIN_LEFT,
      MARGIN_LEFT + colWidths[0],
      MARGIN_LEFT + colWidths[0] + colWidths[1],
      MARGIN_LEFT + colWidths[0] + colWidths[1] + colWidths[2],
      MARGIN_LEFT + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
      RIGHT_X
    ];

    // ENCABEZADOS DE TABLA (ALTURA AMPLIADA A 40 pt PARA EVITAR CORTES)
    const headerH = 40;
    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, headerH, COLOR_TABLE_HEADER);

    const h1 = fontBold.widthOfTextAtSize("Criterio de evaluación", 9);
    page.drawText("Criterio de evaluación", {
      x: colX[0] + ((colWidths[0] + colWidths[1]) / 2) - (h1 / 2),
      y: tableTop - 24,
      size: 9,
      font: fontBold,
      color: COLOR_WHITE,
    });

    // Columnas A y B con líneas explícitas y centradas
    const headA = ["(A) 1ra", "Valoración", "de 1 a 100"];
    headA.forEach((line, idx) => {
      const w = fontBold.widthOfTextAtSize(line, 7.5);
      page.drawText(line, {
        x: colX[2] + (colWidths[2] / 2) - (w / 2),
        y: tableTop - 11 - idx * 10,
        size: 7.5,
        font: fontBold,
        color: COLOR_WHITE,
      });
    });

    const headB = ["(B) 2da", "Valoración", "de 1 a 100"];
    headB.forEach((line, idx) => {
      const w = fontBold.widthOfTextAtSize(line, 7.5);
      page.drawText(line, {
        x: colX[3] + (colWidths[3] / 2) - (w / 2),
        y: tableTop - 11 - idx * 10,
        size: 7.5,
        font: fontBold,
        color: COLOR_WHITE,
      });
    });

    const headP = ["(A+B)/2", "Promedio", "parcial"];
    headP.forEach((line, idx) => {
      const w = fontBold.widthOfTextAtSize(line, 7.5);
      page.drawText(line, {
        x: colX[4] + (colWidths[4] / 2) - (w / 2),
        y: tableTop - 11 - idx * 10,
        size: 7.5,
        font: fontBold,
        color: COLOR_WHITE,
      });
    });

    let currentTableY = tableTop - headerH;
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // BORDES VERTICALES EXTERNOS DEL ENCABEZADO
    vLine(page, colX[0], tableTop, currentTableY);
    vLine(page, colX[5], tableTop, currentTableY);

    // CATEGORÍAS (DIMENSIONES)
    const dimensiones = [
      {
        nombre: 'SER',
        keyA: 'ser_a',
        keyB: 'ser_b',
        criterios: [
          'Responsabilidad, compromiso y puntualidad en el desarrollo de la práctica educativa.',
          'Respeto en el trato con estudiantes, padres/ madres de familia, maestras, maestros y personal de la UE/CEA/CEE.',
          'Demuestra un trabajo cohesionado en equipo.'
        ]
      },
      {
        nombre: 'SABER',
        keyA: 'saber_a',
        keyB: 'saber_b',
        criterios: [
          'Conocimiento y manejo de elementos curriculares de la planificación.',
          'Conocimiento y dominio de elementos propios de su especialidad.',
          'Promueve el fortalecimiento del pensamiento crítico y reflexivo con las y los estudiantes.'
        ]
      },
      {
        nombre: 'HACER',
        keyA: 'hacer_a',
        keyB: 'hacer_b',
        criterios: [
          'Dominio de aula usando estrategias pertinentes.',
          'Manifiesta creatividad en el uso de recursos materiales y educativos.',
          'Utiliza instrumentos de evaluación durante la concreción curricular.'
        ]
      },
      {
        nombre: 'DECIDIR',
        keyA: 'decidir_a',
        keyB: 'decidir_b',
        criterios: [
          'Asume las sugerencias y observaciones a los PDC elaborados.',
          'Aplica acciones de manera oportuna para la solución de problemas en el aula.',
          'Demuestra iniciativa en la solución de problemas emergentes de la comunidad educativa.'
        ]
      }
    ];

    const promediosParciales = [];

    dimensiones.forEach((dim) => {
      const dimStartY = currentTableY;

      dim.criterios.forEach((critText) => {
        const cLines = wrapText(critText, font, 7.5, colWidths[1] - 8);
        const lineH = 8.5;
        const itemH = Math.max(16, cLines.length * lineH + 4);
        const textStartY = currentTableY - (itemH / 2) + ((cLines.length * lineH) / 2) - 5;

        cLines.forEach((l, idx) => {
          page.drawText(l, {
            x: colX[1] + 4,
            y: textStartY - idx * lineH,
            size: 7.5,
            font,
            color: COLOR_TEXT,
          });
        });

        currentTableY -= itemH;
        hLine(page, colX[1], colX[2], currentTableY);
      });

      const dimEndY = currentTableY;
      const totalDimHeight = dimStartY - dimEndY;

      // TEXTO VERTICAL NOMBRE DIMENSIÓN
      const dimNameWidth = fontBold.widthOfTextAtSize(dim.nombre, 8);
      page.drawText(dim.nombre, {
        x: colX[0] + (colWidths[0] / 2) - 4,
        y: dimStartY - (totalDimHeight / 2) - (dimNameWidth / 2),
        size: 8,
        font: fontBold,
        color: COLOR_TEXT,
        rotate: { type: 'degrees', angle: 90 }
      });

      // VALORES A Y B (UNA SOLA CELDA VERTICAL LIMPIA)
      const valA = d[dim.keyA];
      const valB = d[dim.keyB];

      if (valA !== undefined && valA !== null && String(valA).trim() !== "") {
        const strA = formatearNumero(valA);
        const wA = font.widthOfTextAtSize(strA, 8.5);
        page.drawText(strA, {
          x: colX[2] + (colWidths[2] / 2) - (wA / 2),
          y: dimStartY - (totalDimHeight / 2) - 3,
          size: 8.5,
          font,
          color: COLOR_TEXT,
        });
      }

      if (valB !== undefined && valB !== null && String(valB).trim() !== "") {
        const strB = formatearNumero(valB);
        const wB = font.widthOfTextAtSize(strB, 8.5);
        page.drawText(strB, {
          x: colX[3] + (colWidths[3] / 2) - (wB / 2),
          y: dimStartY - (totalDimHeight / 2) - 3,
          size: 8.5,
          font,
          color: COLOR_TEXT,
        });
      }

      // PROMEDIO PARCIAL DE DIMENSIÓN
      const nA = parseFloat(valA);
      const nB = parseFloat(valB);
      const arrVal = [nA, nB].filter(n => !isNaN(n));

      if (arrVal.length > 0) {
        const promParcialRaw = arrVal.reduce((a, b) => a + b, 0) / arrVal.length;
        promediosParciales.push(promParcialRaw);

        const strProm = formatearNumero(promParcialRaw);
        const wP = fontBold.widthOfTextAtSize(strProm, 8.5);
        page.drawText(strProm, {
          x: colX[4] + (colWidths[4] / 2) - (wP / 2),
          y: dimStartY - (totalDimHeight / 2) - 3,
          size: 8.5,
          font: fontBold,
          color: COLOR_TEXT,
        });
      }

      // BORDES VERTICALES EXTERNOS DE LA DIMENSIÓN
      vLine(page, colX[0], dimStartY, dimEndY);
      vLine(page, colX[1], dimStartY, dimEndY);
      vLine(page, colX[2], dimStartY, dimEndY);
      vLine(page, colX[3], dimStartY, dimEndY);
      vLine(page, colX[4], dimStartY, dimEndY);
      vLine(page, colX[5], dimStartY, dimEndY);

      hLine(page, MARGIN_LEFT, RIGHT_X, dimEndY);
    });

    // CÁLCULO PROMEDIO FINAL
    const promFinalRaw = promediosParciales.length > 0
      ? promediosParciales.reduce((a, b) => a + b, 0) / promediosParciales.length
      : 0;

    const promFinalStr = formatearNumero(d.promedio_numeral ?? promFinalRaw);

    // 1. FILA DE PROMEDIO FINAL
    const yPromStart = currentTableY;
    const hPromRow = 20;
    const yPromEnd = yPromStart - hPromRow;

    const labelProm = "Promedio Final (Número entero)";
    const wLabelProm = fontBold.widthOfTextAtSize(labelProm, 8.5);

    page.drawText(labelProm, {
      x: colX[4] - 8 - wLabelProm,
      y: yPromStart - 13,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    if (promFinalStr) {
      const wPF = fontBold.widthOfTextAtSize(promFinalStr, 9);
      page.drawText(promFinalStr, {
        x: colX[4] + (colWidths[4] / 2) - (wPF / 2),
        y: yPromStart - 13,
        size: 9,
        font: fontBold,
        color: COLOR_TEXT,
      });
    }

    hLine(page, MARGIN_LEFT, RIGHT_X, yPromEnd);

    vLine(page, colX[0], yPromStart, yPromEnd);
    vLine(page, colX[4], yPromStart, yPromEnd);
    vLine(page, colX[5], yPromStart, yPromEnd);

    currentTableY = yPromEnd;

    // 2. SECCIÓN DE FECHAS DE VALORACIÓN Y FIRMA DOCENTE TUTOR/A
    const yFVStart = currentTableY;
    const hFVRow = 32;
    const yFVEnd = yFVStart - hFVRow;

    const fvColWidth = CONTENT_WIDTH / 4;
    const fvColX = [
      MARGIN_LEFT,
      MARGIN_LEFT + fvColWidth,
      MARGIN_LEFT + fvColWidth * 2,
      MARGIN_LEFT + fvColWidth * 3,
      RIGHT_X
    ];

    const fecha1ra = d.fecha_1ra_val ? formatearFechaCorta(d.fecha_1ra_val) : '';
    const fecha2da = d.fecha_2da_val ? formatearFechaCorta(d.fecha_2da_val) : '';
    const puntosTutor = '.....................................';

    page.drawText("Fecha de la 1ra", {
      x: fvColX[0] + 6, y: yFVStart - 13, size: 8, font: fontBold, color: COLOR_TEXT,
    });
    page.drawText(`Valoración: ${fecha1ra}`, {
      x: fvColX[0] + 6, y: yFVStart - 24, size: 8, font, color: COLOR_TEXT,
    });

    page.drawText("Firma Docente", {
      x: fvColX[1] + 6, y: yFVStart - 13, size: 8, font: fontBold, color: COLOR_TEXT,
    });
    page.drawText(`Tutor/a:${puntosTutor}`, {
      x: fvColX[1] + 6, y: yFVStart - 24, size: 8, font, color: COLOR_TEXT,
    });

    page.drawText("Fecha de la 2da", {
      x: fvColX[2] + 6, y: yFVStart - 13, size: 8, font: fontBold, color: COLOR_TEXT,
    });
    page.drawText(`Valoración: ${fecha2da}`, {
      x: fvColX[2] + 6, y: yFVStart - 24, size: 8, font, color: COLOR_TEXT,
    });

    page.drawText("Firma Docente", {
      x: fvColX[3] + 6, y: yFVStart - 13, size: 8, font: fontBold, color: COLOR_TEXT,
    });
    page.drawText(`Tutor/a:${puntosTutor}`, {
      x: fvColX[3] + 6, y: yFVStart - 24, size: 8, font, color: COLOR_TEXT,
    });

    hLine(page, MARGIN_LEFT, RIGHT_X, yFVEnd);

    vLine(page, fvColX[0], yFVStart, yFVEnd);
    vLine(page, fvColX[1], yFVStart, yFVEnd);
    vLine(page, fvColX[2], yFVStart, yFVEnd);
    vLine(page, fvColX[3], yFVStart, yFVEnd);
    vLine(page, fvColX[4], yFVStart, yFVEnd);

    currentTableY = yFVEnd;
    cursorY = currentTableY - 45;

    // 3. FIRMAS INFERIORES
    const colSigWidth = CONTENT_WIDTH / 2;
    const lineW = 160;

    const firmas = [
      {
        label: "Estudiante",
        xCenter: MARGIN_LEFT + colSigWidth * 0.5
      },
      {
        label: "Docente Tutor/a Acompañante",
        xCenter: MARGIN_LEFT + colSigWidth * 1.5
      }
    ];

    firmas.forEach((f) => {
      const lineStartX = f.xCenter - lineW / 2;
      const lineEndX = f.xCenter + lineW / 2;

      drawDottedLine(page, lineStartX, lineEndX, cursorY);

      const w = fontBold.widthOfTextAtSize(f.label, 8.5);
      page.drawText(f.label, {
        x: f.xCenter - w / 2,
        y: cursorY - 12,
        size: 8.5,
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
    console.error("Error al generar PDF de la Ficha B-6 (4to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};