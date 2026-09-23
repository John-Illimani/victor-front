import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaB33erAnoService } from '../../../services/fichas/3año/fichaB33erAnoService';

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

export const imprimirFichaB3_3erAno = async (estudianteId) => {
  try {
    const response = await fichaB33erAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha B-3."
      };
    }

    const d = response.datos;

    // PARSEAR PDCS (DESDE JSONB O OBJETO)
    let pdcsData = {};
    if (d.pdcs) {
      pdcsData = typeof d.pdcs === 'string' ? JSON.parse(d.pdcs) : d.pdcs;
    }

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
    const MARGIN_TOP = (5 / 2.54) * 72; 
    const MARGIN_LEFT = 85.04;          
    const MARGIN_RIGHT = 51.31;         
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // TÍTULO PRINCIPAL (Dorado 13 pt Bold Centrado)
    const titleLines = [
      "FICHA B-3",
      "APOYO Y SEGUIMIENTO DEL DOCENTE GUÍA DE LA",
      "UE/CEA/CEE EN LA CONCRECIÓN CURRICULAR"
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

    cursorY -= 6;

    page.drawText("DATOS REFERENCIALES:", {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 9.5,
      font: fontBold,
      color: COLOR_TEXT,
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
      label: "Apellido(s) y Nombre(s) del(a) estudiante: ",
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
      label: "Especialidad: ",
      value: d.especialidad || "",
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9,
    });
    cursorY -= 18;

    // RECUADRO INSTRUCTIVO
    const boxH = 42;
    page.drawRectangle({
      x: MARGIN_LEFT,
      y: cursorY - boxH,
      width: CONTENT_WIDTH,
      height: boxH,
      borderColor: COLOR_BORDER,
      borderWidth: 0.8,
    });

    const b1 = "•   La/el Docente Guía realiza acompañamiento y seguimiento a la/el estudiante integrante del Equipo Comunitario, de";
    const b1_2 = "acuerdo con la modalidad de atención y el desarrollo de la práctica educativa comunitaria.";
    const b2 = "•   La presente ficha valora la concreción curricular, el desempeño pedagógico y el proceso investigativo desarrollado en";
    const b2_2 = "torno al diagnóstico socioparticipativo.";

    page.drawText(b1, { x: MARGIN_LEFT + 8, y: cursorY - 10, size: 7.5, font, color: COLOR_TEXT });
    page.drawText(b1_2, { x: MARGIN_LEFT + 16, y: cursorY - 17, size: 7.5, font, color: COLOR_TEXT });
    page.drawText(b2, { x: MARGIN_LEFT + 8, y: cursorY - 26, size: 7.5, font, color: COLOR_TEXT });
    page.drawText(b2_2, { x: MARGIN_LEFT + 16, y: cursorY - 33, size: 7.5, font, color: COLOR_TEXT });

    cursorY -= (boxH + 8);

    // TABLA B-3: CRITERIOS DE EVALUACIÓN
    const tableTop = cursorY;

    // DEFINICIÓN DE ANCHOS DE COLUMNAS PARA EVITAR DESBORDAMIENTO
    const cWidths = [60, 82, 63, 72, 72, 68, 58.65]; // Total: 475.65 pt
    const cX = [MARGIN_LEFT];
    for (let i = 0; i < cWidths.length; i++) cX.push(cX[i] + cWidths[i]);

    // BANDA VERDE DE ENCABEZADO "CRITERIOS DE EVALUACIÓN"
    const topHeaderH = 16;
    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, topHeaderH, COLOR_TABLE_HEADER);

    const txtCrit = "CRITERIOS DE EVALUACIÓN";
    page.drawText(txtCrit, {
      x: CONTENT_CENTER_X - fontBold.widthOfTextAtSize(txtCrit, 8.5) / 2,
      y: tableTop - 11,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    let currentTableY = tableTop - topHeaderH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // CABECERAS DE COLUMNAS DE LA TABLA
    const headerH = 88;

    const columnHeaders = [
      "PDC Plan de desarrollo curricular",
      "Demuestra coherencia entre objetivo de aprendizaje, contenidos, momentos del proceso formativo, criterios de evaluación, recursos/materiales y productos.",
      "Articula el PDC con los problemas emergentes del contexto.",
      "Utiliza recursos/materiales, promoviendo la participación y el desarrollo de capacidades, habilidades y/o potencialidades en las y los estudiantes.",
      "Demuestra compromiso a través de la aplicación de estrategias metodológicas para desarrollar procesos creativos, propositivos y reflexivos.",
      "Demuestra respeto, la responsabilidad, puntualidad, trato cordial y acompañamiento a los miembros de la UE/CEA/CEE.",
      "Promedio Parcial de cada PDC (Número entero)"
    ];

    columnHeaders.forEach((text, i) => {
      const lines = wrapText(text, fontBold, 6, cWidths[i] - 4);
      const lineH = 7;
      const startY = currentTableY - 8;

      lines.forEach((l, lIdx) => {
        const w = fontBold.widthOfTextAtSize(l, 6);
        page.drawText(l, {
          x: cX[i] + cWidths[i] / 2 - w / 2,
          y: startY - lIdx * lineH,
          size: 6,
          font: fontBold,
          color: COLOR_TEXT,
        });
      });
    });

    currentTableY -= headerH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // FILA DE ESCALA (1 a 100 puntos / Puntos.)
    const scaleH = 22;
    page.drawText("Puntaje", { x: cX[0] + 6, y: currentTableY - 14, size: 7.5, font: fontBold, color: COLOR_TEXT });

    for (let colIdx = 1; colIdx <= 5; colIdx++) {
      const scaleTxt = "1 a 100 puntos";
      const lines = wrapText(scaleTxt, font, 6.5, cWidths[colIdx] - 2);
      lines.forEach((sl, sIdx) => {
        const w = font.widthOfTextAtSize(sl, 6.5);
        page.drawText(sl, {
          x: cX[colIdx] + cWidths[colIdx] / 2 - w / 2,
          y: currentTableY - 10 - sIdx * 7,
          size: 6.5,
          font,
          color: COLOR_TEXT,
        });
      });
    }

    const txtPuntos = "Puntos.";
    const wPuntos = font.widthOfTextAtSize(txtPuntos, 7);
    page.drawText(txtPuntos, { x: cX[6] + cWidths[6] / 2 - wPuntos / 2, y: currentTableY - 14, size: 7, font, color: COLOR_TEXT });

    currentTableY -= scaleH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    // FILAS DE PDCS (SOPORTA CLAVES EXACTAS DE BASE DE DATOS)
    const pdcKeys = [
      { keyNames: ["PDC 1", "pdc1"], label: "PDC 1" },
      { keyNames: ["PDC 2", "pdc2"], label: "PDC 2" },
      { keyNames: ["PDC 3", "pdc3"], label: "PDC 3" },
      { keyNames: ["PDC (Clase comunitaria)", "pdc_comunitaria"], label: "PDC (Clase\ncomunitaria)" }
    ];

    const rowH = 24;

    pdcKeys.forEach((pdcItem) => {
      // Buscar el objeto correspondiente en pdcsData usando cualquier clave válida
      let itemData = {};
      for (const kn of pdcItem.keyNames) {
        if (pdcsData[kn]) {
          itemData = pdcsData[kn];
          break;
        }
      }

      // Columna 0: Nombre de PDC
      const lblLines = pdcItem.label.split("\n");
      lblLines.forEach((ll, lIdx) => {
        page.drawText(ll, { x: cX[0] + 4, y: currentTableY - 11 - lIdx * 8, size: 7, font: fontBold, color: COLOR_TEXT });
      });

      // Columnas 1 a 5: Criterios c1 a c5
      for (let cIdx = 1; cIdx <= 5; cIdx++) {
        const valC = itemData[`c${cIdx}`];
        if (valC !== undefined && valC !== null && String(valC).trim() !== "") {
          const valNum = Math.round(parseFloat(valC) || 0);
          const valStr = String(valNum);
          const w = font.widthOfTextAtSize(valStr, 8);
          page.drawText(valStr, {
            x: cX[cIdx] + cWidths[cIdx] / 2 - w / 2,
            y: currentTableY - 15,
            size: 8,
            font,
            color: COLOR_TEXT,
          });
        }
      }

      // Columna 6: Promedio Parcial del PDC
      const promPdc = itemData.promedio_parcial ?? itemData.promedio;
      if (promPdc !== undefined && promPdc !== null && String(promPdc).trim() !== "") {
        const promNum = Math.round(parseFloat(promPdc) || 0);
        const promStr = String(promNum);
        const wProm = fontBold.widthOfTextAtSize(promStr, 8.5);
        page.drawText(promStr, {
          x: cX[6] + cWidths[6] / 2 - wProm / 2,
          y: currentTableY - 15,
          size: 8.5,
          font: fontBold,
          color: COLOR_TEXT,
        });
      }

      currentTableY -= rowH;
      hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);
    });

    // BORDES VERTICALES DE EVALUACIÓN (Inician debajo de la banda verde de cabecera)
    const headerStartY = tableTop - topHeaderH;
    cX.forEach((lineX) => vLine(page, lineX, headerStartY, currentTableY));

    // FILA COMBINADA 1: PROMEDIO TOTAL (NÚMERO ENTERO)
    const finalH = 20;
    const yPuntajeFinal = currentTableY;

    const pfLabel = "Promedio Total (Número entero)";
    const pfW = fontBold.widthOfTextAtSize(pfLabel, 8.5);
    page.drawText(pfLabel, { x: cX[6] - pfW - 8, y: yPuntajeFinal - 13, size: 8.5, font: fontBold, color: COLOR_TEXT });

    const pfVal = d.promedio_total ?? d.promedio_numeral ?? "";
    if (pfVal !== "") {
      const pfStr = String(Math.round(parseFloat(pfVal) || 0));
      const pfValW = fontBold.widthOfTextAtSize(pfStr, 9);
      page.drawText(pfStr, { x: cX[6] + cWidths[6] / 2 - pfValW / 2, y: yPuntajeFinal - 13, size: 9, font: fontBold, color: COLOR_TEXT });
    }

    currentTableY -= finalH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    vLine(page, MARGIN_LEFT, yPuntajeFinal, currentTableY);
    vLine(page, cX[6], yPuntajeFinal, currentTableY);
    vLine(page, RIGHT_X, yPuntajeFinal, currentTableY);

    // FILA COMBINADA 2: LITERAL
    const litH = 22;
    const yLiteral = currentTableY;

    const litLabel = "Literal: ";
    page.drawText(litLabel, { x: MARGIN_LEFT + 6, y: yLiteral - 14, size: 8.5, font: fontBold, color: COLOR_TEXT });

    const litVal = obtenerLiteralRedondeado(pfVal, d.promedio_literal);
    if (litVal) {
      page.drawText(litVal, { x: MARGIN_LEFT + 6 + fontBold.widthOfTextAtSize(litLabel, 8.5), y: yLiteral - 14, size: 8.5, font: fontBold, color: COLOR_TEXT });
    }

    currentTableY -= litH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    vLine(page, MARGIN_LEFT, yLiteral, currentTableY);
    vLine(page, RIGHT_X, yLiteral, currentTableY);

    // RECUADRO DE OBSERVACIONES Y/O SUGERENCIAS
    const obsHeaderH = 18;
    const yObsHeader = currentTableY;
    fillRect(page, MARGIN_LEFT, yObsHeader, CONTENT_WIDTH, obsHeaderH, COLOR_TABLE_HEADER);
    page.drawText("OBSERVACIONES Y/O SUGERENCIAS DE LA CONCRECIÓN CURRICULAR Y/O DE LA CLASE COMUNITARIA:", { x: MARGIN_LEFT + 6, y: yObsHeader - 12, size: 7.5, font: fontBold, color: COLOR_TEXT });

    currentTableY -= obsHeaderH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    const obsBoxH = 38;
    const yObsBox = currentTableY;

    const obsVal = String(d.observaciones || "").trim();
    if (obsVal) {
      const obsLines = wrapText(obsVal, font, 8, CONTENT_WIDTH - 12);
      obsLines.forEach((l, idx) => {
        if (idx < 3) {
          page.drawText(l, { x: MARGIN_LEFT + 6, y: yObsBox - 13 - idx * 10, size: 8, font, color: COLOR_TEXT });
        }
      });
    }

    currentTableY -= obsBoxH;
    hLine(page, MARGIN_LEFT, RIGHT_X, currentTableY);

    vLine(page, MARGIN_LEFT, yObsHeader, currentTableY);
    vLine(page, RIGHT_X, yObsHeader, currentTableY);

    cursorY = currentTableY - 20;

    // LUGAR Y FECHA ALINEADO DE FORMA EXACTA
    const lblFecha = "Lugar y fecha: ";
    const valFecha = `${d.lugar_ciudad || 'El Alto'}, ${d.dia || String(new Date().getDate())} de ${d.mes || 'septiembre'} de ${d.ano || '2026'}`;

    const wLbl = font.widthOfTextAtSize(lblFecha, 8.5);
    const wVal = fontBold.widthOfTextAtSize(valFecha, 8.5);
    const totalFechaW = wLbl + wVal;
    const fechaStartX = RIGHT_X - totalFechaW;

    page.drawText(lblFecha, { x: fechaStartX, y: cursorY, size: 8.5, font, color: COLOR_TEXT });

    const valStartX = fechaStartX + wLbl;
    page.drawText(valFecha, { x: valStartX, y: cursorY, size: 8.5, font: fontBold, color: COLOR_TEXT });
    drawDottedLine(page, valStartX, valStartX + wVal, cursorY - 1.5);

    cursorY -= 48;

    // FIRMAS INFERIORES
    const colSigWidth = CONTENT_WIDTH / 2;
    const lineW = 170;

    const firmas = [
      {
        label: "Estudiante de ESFM/UA",
        xCenter: MARGIN_LEFT + colSigWidth * 0.5
      },
      {
        label: "Docente Guía de la UE/CEE/CEA",
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
    console.error("Error al generar PDF de la Ficha B-3 (3er Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};