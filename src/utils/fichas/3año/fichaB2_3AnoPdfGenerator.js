import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaB23erAnoService } from '../../../services/fichas/3año/fichaB23erAnoService';

// Paleta de Colores Institucionales
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);            // Dorado (#C9A751)
const COLOR_TABLE_HEADER = rgb(155 / 255, 168 / 255, 102 / 255);    // Verde Oliva (#9BA866)
const COLOR_BORDER = rgb(0, 0, 0);

const BORDER = 0.8;

// CONVERTIR FECHAS ISO A YYYY-MM-DD
function formatFechaISO(strFecha) {
  if (!strFecha) return "";
  const s = String(strFecha).trim();
  if (s.includes("T")) return s.split("T")[0];
  return s;
}

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

export const imprimirFichaB2_3erAno = async (estudianteId) => {
  try {
    const response = await fichaB23erAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha B-2."
      };
    }

    const d = response.datos;

    // PARSEAR LAS SEMANAS REGISTRADAS (JSONB O ARRAY)
    let semanasData = [];
    if (d.semanas) {
      semanasData = typeof d.semanas === 'string' ? JSON.parse(d.semanas) : d.semanas;
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
    page.setSize(612, 792); // Tamaño Carta
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

    // TÍTULO PRINCIPAL (Dorado 13 pt Bold Centrado)
    const titleLines = [
      "FICHA B-2",
      "ASISTENCIA – PRÁCTICA EDUCATIVA COMUNITARIA"
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
      cursorY -= 18;
    });

    cursorY -= 4;

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
    const boxH = 46;
    page.drawRectangle({
      x: MARGIN_LEFT,
      y: cursorY - boxH,
      width: CONTENT_WIDTH,
      height: boxH,
      borderColor: COLOR_BORDER,
      borderWidth: 0.8,
    });

    const b1 = "Para el llenado de la Ficha B-2 la/el Docente Acompañante de la ESFM/UA verifica el REGISTRO DE ASISTENCIA DE";
    const b2 = "LA PEC (registro del estudiante, donde día a día registra su asistencia y actividades desarrolladas en la práctica";
    const b3 = "educativa comunitaria, con el visto bueno correspondiente de las autoridades de la UE/CEA/CEE).";

    page.drawText(b1, { x: MARGIN_LEFT + 8, y: cursorY - 12, size: 7.5, font, color: COLOR_TEXT });
    page.drawText(b2, { x: MARGIN_LEFT + 8, y: cursorY - 23, size: 7.5, font, color: COLOR_TEXT });
    page.drawText(b3, { x: MARGIN_LEFT + 8, y: cursorY - 34, size: 7.5, font, color: COLOR_TEXT });

    cursorY -= (boxH + 12);

    // TABLA SUPERIOR: DURACIÓN DE LA IEPC-PEC (Verde Oliva)
    const durHeaderH = 20;
    fillRect(page, MARGIN_LEFT, cursorY, CONTENT_WIDTH, durHeaderH, COLOR_TABLE_HEADER);

    const lblDur = "DURACIÓN DE LA IEPC-PEC EN LA UE/CEA/CEE:";
    page.drawText(lblDur, { x: MARGIN_LEFT + 12, y: cursorY - 13, size: 8.5, font: fontBold, color: COLOR_TEXT });

    const lblSem = "4 SEMANAS";
    const wSem = fontBold.widthOfTextAtSize(lblSem, 8.5);
    page.drawText(lblSem, { x: RIGHT_X - wSem - 12, y: cursorY - 13, size: 8.5, font: fontBold, color: COLOR_TEXT });

    let tableY = cursorY - durHeaderH;
    hLine(page, MARGIN_LEFT, RIGHT_X, tableY);

    // FECHAS DE INICIO Y CONCLUSIÓN DE IEPC-PEC (FORMATO LIMPIO YYYY-MM-DD)
    const datesH = 32;
    const halfW = CONTENT_WIDTH / 2;
    const midX = MARGIN_LEFT + halfW;

    page.drawText("FECHA DE INICIO DE LA IEPC-PEC:", { x: MARGIN_LEFT + 8, y: tableY - 12, size: 8, font: fontBold, color: COLOR_TEXT });
    page.drawText("FECHA DE CONCLUSIÓN DE IEPC-PEC:", { x: midX + 8, y: tableY - 12, size: 8, font: fontBold, color: COLOR_TEXT });

    const valInicio = formatFechaISO(d.fecha_inicio_pec);
    const valConc = formatFechaISO(d.fecha_conclusion_pec);

    campoPunteado(page, {
      label: "",
      value: valInicio,
      x: MARGIN_LEFT + 8,
      y: tableY - 24,
      endX: midX - 8,
      font,
      fontBold,
      size: 8,
    });

    campoPunteado(page, {
      label: "",
      value: valConc,
      x: midX + 8,
      y: tableY - 24,
      endX: RIGHT_X - 8,
      font,
      fontBold,
      size: 8,
    });

    const yAfterDates = tableY - datesH;
    hLine(page, MARGIN_LEFT, RIGHT_X, yAfterDates);
    vLine(page, MARGIN_LEFT, cursorY, yAfterDates);
    vLine(page, midX, tableY, yAfterDates);
    vLine(page, RIGHT_X, cursorY, yAfterDates);

    tableY = yAfterDates;

    // ENCABEZADO "REGISTRO DE ASISTENCIA"
    const regHeaderH = 18;
    page.drawText("REGISTRO DE ASISTENCIA", {
      x: CONTENT_CENTER_X - fontBold.widthOfTextAtSize("REGISTRO DE ASISTENCIA", 8.5) / 2,
      y: tableY - 12,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    tableY -= regHeaderH;
    hLine(page, MARGIN_LEFT, RIGHT_X, tableY);
    vLine(page, MARGIN_LEFT, yAfterDates, tableY);
    vLine(page, RIGHT_X, yAfterDates, tableY);

    // CABECERA DE LA TABLA DE ASISTENCIA (Verde Oliva)
    const gridColsW = [80, 85, 85, 85, 140.65]; // Total: 475.65 pt
    const gridColX = [MARGIN_LEFT];
    for (let i = 0; i < gridColsW.length; i++) gridColX.push(gridColX[i] + gridColsW[i]);

    const gridHeaderH = 26;
    fillRect(page, MARGIN_LEFT, tableY, CONTENT_WIDTH, gridHeaderH, COLOR_TABLE_HEADER);

    const headersGrid = [
      "SEMANA",
      "N° ASISTENCIA",
      "N° INASISTENCIA",
      "N° ATRASOS",
      "VALORACIÓN SOBRE 100 PUNTOS"
    ];

    headersGrid.forEach((hText, i) => {
      const wText = fontBold.widthOfTextAtSize(hText, 7.5);
      page.drawText(hText, {
        x: gridColX[i] + gridColsW[i] / 2 - wText / 2,
        y: tableY - 16,
        size: 7.5,
        font: fontBold,
        color: COLOR_TEXT,
      });
    });

    const yGridTop = tableY;
    tableY -= gridHeaderH;
    hLine(page, MARGIN_LEFT, RIGHT_X, tableY);

    // FILAS DE SEMANAS (1 A 4)
    const rowH = 26;
    for (let semNum = 1; semNum <= 4; semNum++) {
      const semObj = semanasData.find(s => {
        const numS = String(s.semana || '').replace(/\D/g, '');
        return Number(numS) === semNum || semanasData.indexOf(s) === semNum - 1;
      }) || {};

      // Columna 0: Nombre Semana
      const txtSem = `Semana ${semNum}`;
      page.drawText(txtSem, { x: gridColX[0] + 12, y: tableY - 16, size: 8, font, color: COLOR_TEXT });

      // Columna 1: Asistencia
      if (semObj.asistencia !== undefined && semObj.asistencia !== null && String(semObj.asistencia).trim() !== "") {
        const valStr = String(semObj.asistencia);
        page.drawText(valStr, { x: gridColX[1] + gridColsW[1] / 2 - font.widthOfTextAtSize(valStr, 8) / 2, y: tableY - 16, size: 8, font, color: COLOR_TEXT });
      }

      // Columna 2: Inasistencia
      if (semObj.inasistencia !== undefined && semObj.inasistencia !== null && String(semObj.inasistencia).trim() !== "") {
        const valStr = String(semObj.inasistencia);
        page.drawText(valStr, { x: gridColX[2] + gridColsW[2] / 2 - font.widthOfTextAtSize(valStr, 8) / 2, y: tableY - 16, size: 8, font, color: COLOR_TEXT });
      }

      // Columna 3: Atrasos
      if (semObj.atrasos !== undefined && semObj.atrasos !== null && String(semObj.atrasos).trim() !== "") {
        const valStr = String(semObj.atrasos);
        page.drawText(valStr, { x: gridColX[3] + gridColsW[3] / 2 - font.widthOfTextAtSize(valStr, 8) / 2, y: tableY - 16, size: 8, font, color: COLOR_TEXT });
      }

      // Columna 4: Valoración sobre 100
      if (semObj.valoracion !== undefined && semObj.valoracion !== null && String(semObj.valoracion).trim() !== "") {
        const valNum = Math.round(parseFloat(semObj.valoracion) || 0);
        const valStr = String(valNum);
        page.drawText(valStr, { x: gridColX[4] + gridColsW[4] / 2 - font.widthOfTextAtSize(valStr, 8.5) / 2, y: tableY - 16, size: 8.5, font, color: COLOR_TEXT });
      }

      tableY -= rowH;
      hLine(page, MARGIN_LEFT, RIGHT_X, tableY);
    }

    // BORDES VERTICALES DE LA TABLA DE SEMANAS
    gridColX.forEach((gx) => vLine(page, gx, yGridTop, tableY));

    // FILA COMBINADA DE PROMEDIO LITERAL
    const litRowH = 22;
    const yLiteralRow = tableY;

    const litLabel = "Literal: ";
    page.drawText(litLabel, { x: MARGIN_LEFT + 8, y: yLiteralRow - 14, size: 8.5, font: fontBold, color: COLOR_TEXT });

    const pfVal = d.promedio_numeral ?? "";
    const litVal = obtenerLiteralRedondeado(pfVal, d.promedio_literal);
    
    if (litVal) {
      page.drawText(litVal, {
        x: MARGIN_LEFT + 8 + fontBold.widthOfTextAtSize(litLabel, 8.5),
        y: yLiteralRow - 14,
        size: 8.5,
        font: fontBold,
        color: COLOR_TEXT,
      });
    }

    const startPunteadoLit = MARGIN_LEFT + 8 + fontBold.widthOfTextAtSize(litLabel, 8.5);
    const endPunteadoLit = litVal ? startPunteadoLit + fontBold.widthOfTextAtSize(litVal, 8.5) : startPunteadoLit + 200;
    drawDottedLine(page, startPunteadoLit, endPunteadoLit, yLiteralRow - 15.5);

    tableY -= litRowH;
    hLine(page, MARGIN_LEFT, RIGHT_X, tableY);
    vLine(page, MARGIN_LEFT, yLiteralRow, tableY);
    vLine(page, RIGHT_X, yLiteralRow, tableY);

    // SECCIÓN DE OBSERVACIONES
    const obsHeaderH = 18;
    const yObsHeader = tableY;
    fillRect(page, MARGIN_LEFT, yObsHeader, CONTENT_WIDTH, obsHeaderH, COLOR_TABLE_HEADER);
    page.drawText("OBSERVACIONES:", { x: MARGIN_LEFT + 6, y: yObsHeader - 12, size: 8.5, font: fontBold, color: COLOR_TEXT });

    tableY -= obsHeaderH;
    hLine(page, MARGIN_LEFT, RIGHT_X, tableY);

    const obsBoxH = 55;
    const yObsBox = tableY;

    const o1 = "La inasistencia a la PEC es motivo y/o causa para la retención en el año de formación.";
    const o2 = "Tres atrasos continuos o discontinuos se registrarán como una inasistencia, por tanto, queda automáticamente";
    const o2_2 = "suspendido de la PEC.";
    const o3 = "Se otorgará licencia solo en casos excepcionales: embarazos, accidentes, cirugía y otros con respaldo documental que";
    const o3_2 = "debe ser presentado oportunamente.";

    page.drawText(o1, { x: MARGIN_LEFT + 6, y: yObsBox - 11, size: 7.5, font, color: COLOR_TEXT });
    page.drawText(o2, { x: MARGIN_LEFT + 6, y: yObsBox - 21, size: 7.5, font, color: COLOR_TEXT });
    page.drawText(o2_2, { x: MARGIN_LEFT + 6, y: yObsBox - 29, size: 7.5, font, color: COLOR_TEXT });
    page.drawText(o3, { x: MARGIN_LEFT + 6, y: yObsBox - 39, size: 7.5, font, color: COLOR_TEXT });
    page.drawText(o3_2, { x: MARGIN_LEFT + 6, y: yObsBox - 47, size: 7.5, font, color: COLOR_TEXT });

    tableY -= obsBoxH;
    hLine(page, MARGIN_LEFT, RIGHT_X, tableY);

    vLine(page, MARGIN_LEFT, yObsHeader, tableY);
    vLine(page, RIGHT_X, yObsHeader, tableY);

    cursorY = tableY - 22;

    // LUGAR Y FECHA (AJUSTE EXACTO DE LÍNEA PUNTEADA SIN DESBORDAMIENTO)
    const lblFecha = "Lugar y fecha: ";
    const valFecha = `${d.lugar_ciudad || 'El Alto'}, ${d.dia || String(new Date().getDate())} de ${d.mes || 'septiembre'} de ${d.ano || '2026'}`;

    const wLbl = font.widthOfTextAtSize(lblFecha, 8.5);
    const wVal = fontBold.widthOfTextAtSize(valFecha, 8.5);
    const totalFechaW = wLbl + wVal;
    const fechaStartX = RIGHT_X - totalFechaW;

    page.drawText(lblFecha, { x: fechaStartX, y: cursorY, size: 8.5, font, color: COLOR_TEXT });

    const valStartX = fechaStartX + wLbl;
    page.drawText(valFecha, { x: valStartX, y: cursorY, size: 8.5, font: fontBold, color: COLOR_TEXT });

    // La línea punteada termina EXACTAMENTE donde termina la última letra de la fecha
    drawDottedLine(page, valStartX, valStartX + wVal, cursorY - 1.5);

    cursorY -= 52;

    // 3 FIRMAS INFERIORES REGULARMENTE DISTRIBUIDAS
    const colSigWidth = CONTENT_WIDTH / 3;
    const lineW = 125;

    const firmas = [
      {
        label: "Estudiante de ESFM/UA",
        xCenter: MARGIN_LEFT + colSigWidth * 0.5
      },
      {
        label: "Docente Guía de la\nUE/CEA/CEE",
        xCenter: MARGIN_LEFT + colSigWidth * 1.5
      },
      {
        label: "Director/a de la UE/CEA/CEE",
        xCenter: MARGIN_LEFT + colSigWidth * 2.5
      }
    ];

    firmas.forEach((f) => {
      const lineStartX = f.xCenter - lineW / 2;
      const lineEndX = f.xCenter + lineW / 2;

      drawDottedLine(page, lineStartX, lineEndX, cursorY);

      const lines = f.label.split("\n");
      lines.forEach((l, idx) => {
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
    console.error("Error al generar PDF de la Ficha B-2 (3er Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};