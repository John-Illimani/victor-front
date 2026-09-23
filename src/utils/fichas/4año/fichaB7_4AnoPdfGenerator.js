import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaB74toAnoService } from '../../../services/fichas/4año/fichaB74toAnoService';

// PALETA DE COLORES INSTITUCIONALES Y TÉCNICOS
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);            // Dorado Institucional (#C9A751)
const COLOR_TABLE_HEADER = rgb(201 / 255, 167 / 255, 81 / 255);      // Ocre/Dorado de Encabezados (#C9A751)
const COLOR_BORDER = rgb(0, 0, 0);

const BORDER = 0.8;

// CONVERSIÓN DE NÚMEROS ENTEROS A PALABRAS (DEL 0 AL 100) - SIN "CON 00/100"
function numeroALetras(num) {
  const n = Math.round(Number(num) || 0);
  if (n <= 0) return "CERO";
  if (n >= 100) return "CIEN";

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

// FORMATO DE FECHA ESTRICTO (YYYY/MM/DD)
function formatearFecha(fechaStr) {
  if (!fechaStr) return "";
  const cleanStr = String(fechaStr).split('T')[0];
  const parts = cleanStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')}`;
  }
  return fechaStr;
}

export const imprimirFichaB7_4toAno = async (estudianteId) => {
  try {
    const response = await fichaB74toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha B-7."
      };
    }

    const d = response.datos;
    const ev = typeof d.evaluaciones === 'string' ? JSON.parse(d.evaluaciones || '{}') : (d.evaluaciones || {});

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

    // REGISTRO DE FONTKIT PARA CARACTERES ESPECIALES (Ñ, tildes)
    pdfDoc.registerFontkit(fontkit);

    const page = pdfDoc.getPages()[0];
    page.setSize(612, 792); // Formato Carta
    const pageWidth = 612;
    const pageHeight = 792;

    // CARGA DE FUENTES CALIBRI (calibri.ttf y calibri-bold.ttf)
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

    // REGULARIZACIÓN DE MÁRGENES ESTRICTOS
    const MARGIN_TOP = (5 / 2.54) * 72; // 141.73 pt (5 cm exactos)
    const MARGIN_LEFT = 85.04;          // 85.04 pt (3 cm exactos)
    const MARGIN_RIGHT = 51.31;         // 51.31 pt (1.81 cm exactos)
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // 1. TÍTULO PRINCIPAL (13 pt Bold, Dorado Institucional)
    const title1 = "FICHA B-7";
    const title2 = "DIAGNÓSTICO SOCIOPARTICIPATIVO DE LA UE/CEA/CEE";

    const wT1 = fontBold.widthOfTextAtSize(title1, 13);
    page.drawText(title1, {
      x: CONTENT_CENTER_X - wT1 / 2,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: COLOR_TITLE,
    });
    cursorY -= 16;

    const wT2 = fontBold.widthOfTextAtSize(title2, 13);
    page.drawText(title2, {
      x: CONTENT_CENTER_X - wT2 / 2,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: COLOR_TITLE,
    });
    cursorY -= 16;

    // 2. PARRAFO DESCRIPTIVO (9 pt Regular)
    const desc = "El ECTG presenta un informe sobre los principales resultados del diagnóstico socioparticipativo, elaborado con apoyo de instrumentos de investigación y revisión documental. Se socializa a la comunidad educativa en la última semana de la PEC.";
    const descLines = wrapText(desc, font, 9, CONTENT_WIDTH);

    descLines.forEach((line) => {
      page.drawText(line, {
        x: MARGIN_LEFT,
        y: cursorY,
        size: 9,
        font,
        color: COLOR_TEXT,
      });
      cursorY -= 12;
    });

    cursorY -= 6;

    // 3. TABLA DE DATOS CABECERA (5 FILAS DE INFORMACIÓN GENERAL)
    const tableHeaderTop = cursorY;
    const labelColWidth = 150; 

    hLine(page, MARGIN_LEFT, RIGHT_X, tableHeaderTop);

    const headerRows = [
      { label: "ESFM/UA:", value: d.esfm_ua || "ESFM Simón Bolívar / UA El Alto" },
      { label: "Especialidad:", value: d.especialidad || "" },
      { label: "Integrantes del ECTG:", value: d.integrantes_ectg || "" },
      { label: "UE/CEA/CEE:", value: d.ue_cea_cee || "" },
      { label: "Fecha:", value: formatearFecha(d.fecha_evaluacion) }
    ];

    headerRows.forEach((row) => {
      const rowHeight = 18;
      page.drawText(row.label, {
        x: MARGIN_LEFT + 6,
        y: cursorY - 12,
        size: 9.5,
        font: fontBold,
        color: COLOR_TEXT,
      });

      if (row.value) {
        page.drawText(String(row.value), {
          x: MARGIN_LEFT + labelColWidth + 6,
          y: cursorY - 12,
          size: 9,
          font,
          color: COLOR_TEXT,
        });
      }

      cursorY -= rowHeight;
      hLine(page, MARGIN_LEFT, RIGHT_X, cursorY);
    });

    vLine(page, MARGIN_LEFT, tableHeaderTop, cursorY);
    vLine(page, MARGIN_LEFT + labelColWidth, tableHeaderTop, cursorY);
    vLine(page, RIGHT_X, tableHeaderTop, cursorY);

    cursorY -= 4;

    // 4. TABLA PRINCIPAL DE DIAGNÓSTICO SOCIOPARTICIPATIVO
    const wCol1 = 180; 
    const wCol2 = 180; 
    const wCol3 = CONTENT_WIDTH - (wCol1 + wCol2); // 115.65 pt

    const mainColX = [
      MARGIN_LEFT,
      MARGIN_LEFT + wCol1,
      MARGIN_LEFT + wCol1 + wCol2,
      RIGHT_X
    ];

    const mainTableTop = cursorY;
    const headerH = 36;

    fillRect(page, MARGIN_LEFT, mainTableTop, CONTENT_WIDTH, headerH, COLOR_TABLE_HEADER);

    const head1Lines = ["Descripción del contexto en el que", "se ubica la UE/CEA/CEE"];
    head1Lines.forEach((l, idx) => {
      const w = fontBold.widthOfTextAtSize(l, 8.5);
      page.drawText(l, {
        x: mainColX[0] + (wCol1 / 2) - (w / 2),
        y: mainTableTop - 14 - idx * 10,
        size: 8.5,
        font: fontBold,
        color: COLOR_WHITE,
      });
    });

    const wH2 = fontBold.widthOfTextAtSize("Valoración cualitativa del informe", 8.5);
    page.drawText("Valoración cualitativa del informe", {
      x: mainColX[1] + (wCol2 / 2) - (wH2 / 2),
      y: mainTableTop - 20,
      size: 8.5,
      font: fontBold,
      color: COLOR_WHITE,
    });

    const head3Lines = ["Valoración", "1 a 100 puntos"];
    head3Lines.forEach((l, idx) => {
      const w = fontBold.widthOfTextAtSize(l, 8.5);
      page.drawText(l, {
        x: mainColX[2] + (wCol3 / 2) - (w / 2),
        y: mainTableTop - 14 - idx * 11,
        size: 8.5,
        font: fontBold,
        color: COLOR_WHITE,
      });
    });

    let currentMainY = mainTableTop - headerH;
    hLine(page, MARGIN_LEFT, RIGHT_X, mainTableTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, currentMainY);

    // CRITERIOS DE LA FICHA B-7 (Mapeados a a1 hasta a7)
    const criteriosUnicos = [
      { key: "a1", label: "Características económicas, socioculturales y políticas del contexto." },
      { key: "a2", label: "Descripción de la UE/CEA/CEE (ubicación, dependencia, subsistema, datos estadísticos, personal, etc.)." },
      { key: "a3", label: "Características del proceso educativo observadas en la concreción curricular y la participación estudiantil." },
      { key: "a4", label: "Características de la gestión institucional: dirección, organización, POA y relación con la comunidad." },
      { key: "a5", label: "Organización y procesamiento de la información recabada." },
      { key: "a6", label: "Identificación y priorización reflexiva de problemas, necesidades y potencialidades." },
      { key: "a7", label: "Formulación pertinente del nudo problemático y preguntas problematizadoras." }
    ];

    criteriosUnicos.forEach((crit) => {
      const cLines = wrapText(crit.label, font, 7.5, wCol1 - 8);
      const lineH = 8.5;
      const rowH = Math.max(22, cLines.length * lineH + 6);
      const textStartY = currentMainY - 10;

      cLines.forEach((l, idx) => {
        page.drawText(l, {
          x: mainColX[0] + 4,
          y: textStartY - idx * lineH,
          size: 7.5,
          font,
          color: COLOR_TEXT,
        });
      });

      const itemEval = ev[crit.key] || {};
      const cuali = itemEval.cualitativa || ev[`${crit.key}_cualitativa`] || "";
      if (cuali) {
        const cualiLines = wrapText(String(cuali), font, 7.5, wCol2 - 8);
        cualiLines.forEach((cl, idx) => {
          page.drawText(cl, {
            x: mainColX[1] + 4,
            y: textStartY - idx * lineH,
            size: 7.5,
            font,
            color: COLOR_TEXT,
          });
        });
      }

      const cuantitativa = itemEval.nota ?? itemEval.cuantitativa ?? ev[`${crit.key}_cuantitativa`] ?? null;
      if (cuantitativa !== null && cuantitativa !== undefined && String(cuantitativa).trim() !== "") {
        const numVal = Math.round(parseFloat(cuantitativa) || 0);
        const strVal = String(numVal);
        const wVal = font.widthOfTextAtSize(strVal, 8.5);
        page.drawText(strVal, {
          x: mainColX[2] + (wCol3 / 2) - (wVal / 2),
          y: currentMainY - (rowH / 2) - 3,
          size: 8.5,
          font,
          color: COLOR_TEXT,
        });
      }

      currentMainY -= rowH;
      hLine(page, MARGIN_LEFT, RIGHT_X, currentMainY);
    });

    // 5. FILAS DE PROMEDIO FINAL
    const yPromTop = currentMainY;
    const hPromNumRow = 18;
    const hPromLitRow = 20;
    const totalPromH = hPromNumRow + hPromLitRow; // 38 pt
    const yPromEnd = yPromTop - totalPromH;

    const pfNumeralRaw = parseFloat(d.promedio_numeral || 0);
    const pfNumeralEntero = Math.round(pfNumeralRaw);
    const pfLiteralPalabras = numeroALetras(pfNumeralEntero);

    // Celda Izquierda: Promedio Final (Número entero)
    const labelProm = "Promedio Final (Número entero)";
    page.drawText(labelProm, {
      x: mainColX[0] + 8,
      y: yPromTop - (totalPromH / 2) - 3,
      size: 9,
      font: fontBold,
      color: COLOR_TEXT,
    });

    // --- Fila Numeral ---
    page.drawText("Numeral:", {
      x: mainColX[1] + 6,
      y: yPromTop - 12,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const strNum = String(pfNumeralEntero);
    page.drawText(strNum, {
      x: mainColX[2] + 8,
      y: yPromTop - 12,
      size: 9,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const yMid = yPromTop - hPromNumRow;
    hLine(page, mainColX[1], RIGHT_X, yMid);

    // --- Fila Literal ---
    page.drawText("Literal:", {
      x: mainColX[1] + 6,
      y: yMid - 13,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const strLit = pfLiteralPalabras;
    page.drawText(strLit, {
      x: mainColX[1] + 55,
      y: yMid - 13,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    hLine(page, MARGIN_LEFT, RIGHT_X, yPromEnd);

    // BORDES Y LÍNEAS VERTICALES CONTINUAS DESDE LA CABECERA HASTA EL FINAL DE LA TABLA[cite: 42]
    vLine(page, mainColX[0], mainTableTop, yPromEnd);
    vLine(page, mainColX[1], mainTableTop, yPromEnd);
    vLine(page, mainColX[2], mainTableTop, yMid); // Solo hasta la fila Numeral
    vLine(page, RIGHT_X, mainTableTop, yPromEnd);

    currentMainY = yPromEnd;

    cursorY = currentMainY - 24;

    // 6. LUGAR Y FECHA (Etiqueta normal, Fecha en negrita)
    const ciudad = d.lugar_ciudad || "El Alto";
    const dia = d.dia || String(new Date().getDate());
    const mes = d.mes || "septiembre";
    const ano = String(d.ano || "2026").slice(0, 4);

    const txtLugarLabel = "Lugar y fecha: ";
    const txtLugarValor = `${ciudad}, ${dia} de ${mes} de ${ano}`;

    const wLabelLF = font.widthOfTextAtSize(txtLugarLabel, 9);
    const wValLF = fontBold.widthOfTextAtSize(txtLugarValor, 9);
    const totalLFWidth = wLabelLF + wValLF;

    const startX_LF = CONTENT_CENTER_X - (totalLFWidth / 2);

    page.drawText(txtLugarLabel, {
      x: startX_LF,
      y: cursorY,
      size: 9,
      font: font, 
      color: COLOR_TEXT,
    });

    page.drawText(txtLugarValor, {
      x: startX_LF + wLabelLF,
      y: cursorY,
      size: 9,
      font: fontBold, 
      color: COLOR_TEXT,
    });

    drawDottedLine(page, startX_LF + wLabelLF, startX_LF + totalLFWidth, cursorY - 2);

    cursorY -= 55;

    // 7. BLOQUE DE FIRMAS INFERIORES
    const sigColWidth = CONTENT_WIDTH / 4;
    const sigLineW = 100;

    const firmas = [
      { label: "Estudiante", sub: "", xCenter: MARGIN_LEFT + sigColWidth * 0.5 },
      { label: "Estudiante", sub: "", xCenter: MARGIN_LEFT + sigColWidth * 1.5 },
      { label: "Docente Guía", sub: "(UE/CEA/CEE)", xCenter: MARGIN_LEFT + sigColWidth * 2.5 },
      { label: "Observador (a)", sub: "(UE/CEA/CEE/ESFM)", xCenter: MARGIN_LEFT + sigColWidth * 3.5 }
    ];

    firmas.forEach((f) => {
      const lineStartX = f.xCenter - sigLineW / 2;
      const lineEndX = f.xCenter + sigLineW / 2;

      drawDottedLine(page, lineStartX, lineEndX, cursorY);

      const wL = fontBold.widthOfTextAtSize(f.label, 8.5);
      page.drawText(f.label, {
        x: f.xCenter - wL / 2,
        y: cursorY - 12,
        size: 8.5,
        font: fontBold,
        color: COLOR_TEXT,
      });

      if (f.sub) {
        const wS = fontBold.widthOfTextAtSize(f.sub, 8);
        page.drawText(f.sub, {
          x: f.xCenter - wS / 2,
          y: cursorY - 22,
          size: 8,
          font: fontBold,
          color: COLOR_TEXT,
        });
      }
    });

    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, '_blank');
    return { success: true };

  } catch (error) {
    console.error("Error al generar PDF de la Ficha B-7 (4to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};