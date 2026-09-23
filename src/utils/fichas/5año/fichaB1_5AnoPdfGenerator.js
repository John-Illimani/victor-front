import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaB15toAnoService } from '../../../services/fichas/5año/fichaB15toAnoService';

// PALETA DE COLORES INSTITUCIONALES (AZUL INSTITUCIONAL)
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_TITLE = rgb(0 / 255, 114 / 255, 187 / 255);             // Azul (#0072BB)
const COLOR_HEADER_BG = rgb(0 / 255, 114 / 255, 187 / 255);          // Azul (#0072BB)
const COLOR_BORDER = rgb(0 / 255, 114 / 255, 187 / 255);          // Borde Azul (#0072BB)

const BORDER = 0.8;

// FUNCIÓN PARA FORMATEAR NÚMEROS A ENTEROS ESTRICTOS
function formatEnteroEstricto(val) {
  if (val === undefined || val === null || val === '') return '0';
  const num = parseFloat(val);
  if (isNaN(num)) return '0';
  return String(Math.round(num));
}

// FUNCIÓN PARA FORMATEAR FECHAS Y QUITAR EL TIMESTAMP (EJ. "2026-09-24T04:00:00.000Z" -> "2026-09-24")
function formatOnlyDate(dateStr) {
  if (!dateStr) return '..................';
  const str = String(dateStr).trim();
  if (str.includes('T')) {
    return str.split('T')[0];
  }
  return str.slice(0, 10);
}

// FUNCIÓN PARA LIMPIAR EL LITERAL (ELIMINA "CON 00/100")
function cleanLiteral(literalStr) {
  if (!literalStr) return 'CIEN';
  let clean = String(literalStr)
    .toUpperCase()
    .replace(/\s+CON\s+\d+\/\d+/gi, '')
    .replace(/\s+00\/100/gi, '')
    .trim();
  return clean || 'CIEN';
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

export const imprimirFichaB1_5toAno = async (estudianteId) => {
  try {
    const response = await fichaB15toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha B-1."
      };
    }

    const d = response.datos;
    const semanasData = typeof d.semanas_data === 'string' 
      ? JSON.parse(d.semanas_data) 
      : (d.semanas_data || {});

    const urlPlantilla = encodeURI('/pdf/5año/plantilla.pdf');
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

    const pageWidth = 612;
    const pageHeight = 792;

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

    // DIMENSIONES Y MÁRGENES ESTRICTOS
    const MARGIN_TOP = 141.73;          // 5.0 cm exactos (141.73 pt)
    const MARGIN_LEFT = 85.04;          // 3.0 cm exactos (85.04 pt)
    const MARGIN_RIGHT = 51.31;         // 1.81 cm exactos (51.31 pt)
    const MARGIN_BOTTOM = 141.73;       // 5.0 cm límite inferior
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt exactos
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    // HELPER PARA AÑADIR OTRA PÁGINA CON LA PLANTILLA
    const createNewPage = async () => {
      let newPage;
      try {
        const resFetch = await fetch(urlPlantilla);
        if (resFetch.ok) {
          const pdfBytes = await resFetch.arrayBuffer();
          const tempDoc = await PDFDocument.load(pdfBytes);
          const [copiedPage] = await pdfDoc.copyPages(tempDoc, [0]);
          newPage = pdfDoc.addPage(copiedPage);
        } else {
          newPage = pdfDoc.addPage([612, 792]);
        }
      } catch (e) {
        newPage = pdfDoc.addPage([612, 792]);
      }
      newPage.setSize(612, 792);
      return newPage;
    };

    let page = pdfDoc.getPages()[0];
    page.setSize(612, 792);
    let cursorY = pageHeight - MARGIN_TOP;

    // 1. ENCABEZADO Y TÍTULOS (Página 1)
    const title1 = "FICHA B-1";
    const title2 = "CONTROL DE ASISTENCIA DE LA PRÁCTICA EDUCATIVA COMUNITARIA (PEC)";

    const wT1 = fontBold.widthOfTextAtSize(title1, 13);
    page.drawText(title1, { x: CONTENT_CENTER_X - wT1 / 2, y: cursorY, size: 13, font: fontBold, color: COLOR_TITLE });
    cursorY -= 15;

    const wT2 = fontBold.widthOfTextAtSize(title2, 11);
    page.drawText(title2, { x: CONTENT_CENTER_X - wT2 / 2, y: cursorY, size: 11, font: fontBold, color: COLOR_TITLE });
    cursorY -= 18;

    const instr = "La presente ficha debe ser sellada de forma semanal por la/el docente guía de la UE/CEA/ CEE, debiendo la o el estudiante practicante contar con el registro gradual de su ficha de acompañamiento.";
    const instrLines = wrapText(instr, font, 8.5, CONTENT_WIDTH - 10);
    page.drawText("-", { x: MARGIN_LEFT, y: cursorY, size: 8.5, font, color: COLOR_TEXT });
    let iY = cursorY;
    instrLines.forEach((l) => {
      page.drawText(l, { x: MARGIN_LEFT + 10, y: iY, size: 8.5, font, color: COLOR_TEXT });
      iY -= 11;
    });
    cursorY = iY - 10;

    // DIBUJO DE TARJETA DE SEMANA
    const drawSemanaCard = (targetPage, yTop, numSemana, semData = {}) => {
      const cardHeight = 102;
      const col1W = 28;  // Ancho Columna N°
      const col2W = CONTENT_WIDTH - col1W; // Ancho Columna Breve Informe
      const xCol2 = MARGIN_LEFT + col1W;

      hLine(targetPage, MARGIN_LEFT, RIGHT_X, yTop);

      // Cabecera de la tabla en el primer bloque
      const headerH = 16;
      fillRect(targetPage, MARGIN_LEFT, yTop, CONTENT_WIDTH, headerH, COLOR_HEADER_BG);
      hLine(targetPage, MARGIN_LEFT, RIGHT_X, yTop - headerH);

      targetPage.drawText("N°", { x: MARGIN_LEFT + 8, y: yTop - 11, size: 8, font: fontBold, color: COLOR_WHITE });
      const txtInf = "Breve informe de actividades de la semana";
      targetPage.drawText(txtInf, { x: xCol2 + (col2W / 2) - (fontBold.widthOfTextAtSize(txtInf, 8) / 2), y: yTop - 11, size: 8, font: fontBold, color: COLOR_WHITE });

      let cardY = yTop - headerH;

      // COLUMNA IZQUIERDA: DIBUJO CENTRADO DEL TEXTO VERTICAL "Semana X"
      const semTxt = `Semana ${numSemana}`;
      const semTxtW = fontBold.widthOfTextAtSize(semTxt, 8);
      
      // Coordenadas para centrar perfectamente el texto rotado a 90 grados
      const vertCenterX = MARGIN_LEFT + (col1W / 2) + 2.5; 
      const vertCenterY = cardY - (cardHeight / 2) - (semTxtW / 2);

      targetPage.drawText(semTxt, { 
        x: vertCenterX, 
        y: vertCenterY, 
        size: 8, 
        font: fontBold, 
        color: COLOR_TEXT, 
        rotate: { type: 'degrees', angle: 90 } 
      });

      // Mapeo de compatibilidad de campos
      const diasVal = semData.dias !== undefined ? semData.dias : semData.dias_asistencia;
      const faltasVal = semData.faltas;
      const atrasosVal = semData.atrasos;
      const detalleVal = semData.detalle !== undefined ? semData.detalle : semData.detalle_actividades;

      // Sub-bloque 1: Cajas de Asistencia, Faltas y Atrasos
      const boxW = 40;
      const boxH = 11;
      const boxRightX = xCol2 + 160;

      // Días Asistencia
      targetPage.drawText("Días de asistencia", { x: xCol2 + 6, y: cardY - 11, size: 8, font, color: COLOR_TEXT });
      targetPage.drawRectangle({ x: boxRightX, y: cardY - 13, width: boxW, height: boxH, borderColor: COLOR_BORDER, borderWidth: 0.8 });
      const txtDias = formatEnteroEstricto(diasVal);
      targetPage.drawText(txtDias, { x: boxRightX + (boxW / 2) - (fontBold.widthOfTextAtSize(txtDias, 8) / 2), y: cardY - 10, size: 8, font: fontBold, color: COLOR_TEXT });

      // Faltas
      targetPage.drawText("Faltas (Cantidad de días)", { x: xCol2 + 6, y: cardY - 24, size: 8, font, color: COLOR_TEXT });
      targetPage.drawRectangle({ x: boxRightX, y: cardY - 26, width: boxW, height: boxH, borderColor: COLOR_BORDER, borderWidth: 0.8 });
      const txtFaltas = formatEnteroEstricto(faltasVal);
      targetPage.drawText(txtFaltas, { x: boxRightX + (boxW / 2) - (fontBold.widthOfTextAtSize(txtFaltas, 8) / 2), y: cardY - 23, size: 8, font: fontBold, color: COLOR_TEXT });

      // Atrasos
      targetPage.drawText("Atrasos (Minutos)", { x: xCol2 + 6, y: cardY - 37, size: 8, font, color: COLOR_TEXT });
      targetPage.drawRectangle({ x: boxRightX, y: cardY - 39, width: boxW, height: boxH, borderColor: COLOR_BORDER, borderWidth: 0.8 });
      const txtAtrasos = formatEnteroEstricto(atrasosVal);
      targetPage.drawText(txtAtrasos, { x: boxRightX + (boxW / 2) - (fontBold.widthOfTextAtSize(txtAtrasos, 8) / 2), y: cardY - 36, size: 8, font: fontBold, color: COLOR_TEXT });

      // Sub-bloque 2: Detalle de Actividades
      targetPage.drawText("Breve detalle de actividades realizadas por la/el estudiante practicante, en el marco la", { x: xCol2 + 6, y: cardY - 49, size: 7.5, font: fontBold, color: COLOR_TEXT });
      targetPage.drawText("implementación de la propuesta educativa", { x: xCol2 + 6, y: cardY - 58, size: 7.5, font: fontBold, color: COLOR_TEXT });
      targetPage.drawText("(A elaborar por la/el estudiante practicante):", { x: xCol2 + 6, y: cardY - 67, size: 7.5, font, color: COLOR_TEXT });

      // Líneas punteadas de detalle
      const dLines = wrapText(detalleVal || "", font, 7.5, col2W - 12);

      let lineY = cardY - 78;
      for (let l = 0; l < 2; l++) {
        if (dLines[l]) {
          targetPage.drawText(dLines[l], { x: xCol2 + 6, y: lineY + 1.5, size: 7.5, font, color: COLOR_TEXT });
        }
        drawDottedLine(targetPage, xCol2 + 6, RIGHT_X - 10, lineY);
        lineY -= 10;
      }

      const totalBlockH = cardHeight + headerH;
      hLine(targetPage, MARGIN_LEFT, RIGHT_X, yTop - totalBlockH);
      vLine(targetPage, MARGIN_LEFT, yTop, yTop - totalBlockH);
      vLine(targetPage, xCol2, yTop, yTop - totalBlockH);
      vLine(targetPage, RIGHT_X, yTop, yTop - totalBlockH);

      return totalBlockH + 8;
    };

    // PÁGINA 1: Semanas 1 a 4
    for (let s = 1; s <= 4; s++) {
      const semObj = semanasData[String(s)] || semanasData[`semana_${s}`] || {};
      const consumedH = drawSemanaCard(page, cursorY, s, semObj);
      cursorY -= consumedH;
    }

    // PÁGINA 2: Semanas 5 a 8
    page = await createNewPage();
    cursorY = pageHeight - MARGIN_TOP;

    for (let s = 5; s <= 8; s++) {
      const semObj = semanasData[String(s)] || semanasData[`semana_${s}`] || {};
      const consumedH = drawSemanaCard(page, cursorY, s, semObj);
      cursorY -= consumedH;
    }

    // PÁGINA 3: Semanas 9, 10 + Cuadro Resumen + Fecha + Firmas
    page = await createNewPage();
    cursorY = pageHeight - MARGIN_TOP;

    for (let s = 9; s <= 10; s++) {
      const semObj = semanasData[String(s)] || semanasData[`semana_${s}`] || {};
      const consumedH = drawSemanaCard(page, cursorY, s, semObj);
      cursorY -= consumedH;
    }

    cursorY -= 12;

    // CUADRO RESUMEN Y PONDERACIÓN FINAL
    const resTableW = CONTENT_WIDTH;
    const resCol1W = resTableW - 130;

    const rTop = cursorY;
    const row1H = 24;
    const row2H = 22;
    const row3H = 22;
    const totalResH = row1H + row2H + row3H;

    // Fila 1: Fechas de la PEC (Sin timestamps largos)
    hLine(page, MARGIN_LEFT, RIGHT_X, rTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, rTop - row1H);

    const fInicioClean = formatOnlyDate(d.fecha_inicio_pec);
    const fConcClean = formatOnlyDate(d.fecha_conclusion_pec);

    page.drawText(`Fecha de inicio de la PEC: ${fInicioClean}`, { x: MARGIN_LEFT + 6, y: rTop - 15, size: 8, font, color: COLOR_TEXT });
    page.drawText(`Fecha de conclusión de la PEC: ${fConcClean}`, { x: MARGIN_LEFT + 185, y: rTop - 15, size: 8, font, color: COLOR_TEXT });

    const txtPorcLabel = "Porcentaje total de";
    const txtPorcLabel2 = "asistencia:";
    page.drawText(txtPorcLabel, { x: MARGIN_LEFT + resCol1W + 6, y: rTop - 9, size: 7.5, font: fontBold, color: COLOR_TEXT });
    page.drawText(txtPorcLabel2, { x: MARGIN_LEFT + resCol1W + 6, y: rTop - 18, size: 7.5, font: fontBold, color: COLOR_TEXT });

    // Fila 2: Totales de Días, Faltas y Atrasos
    hLine(page, MARGIN_LEFT, RIGHT_X, rTop - row1H - row2H);
    const tDias = formatEnteroEstricto(d.total_dias);
    const tFaltas = formatEnteroEstricto(d.total_faltas);
    const tAtrasos = formatEnteroEstricto(d.total_atrasos);
    const porcAsist = formatEnteroEstricto(d.porcentaje_asistencia);

    page.drawText(`Total días: ${tDias}`, { x: MARGIN_LEFT + 6, y: rTop - row1H - 14, size: 8.5, font, color: COLOR_TEXT });
    page.drawText(`Total Faltas: ${tFaltas}`, { x: MARGIN_LEFT + 120, y: rTop - row1H - 14, size: 8.5, font, color: COLOR_TEXT });
    page.drawText(`Total Atrasos: ${tAtrasos}`, { x: MARGIN_LEFT + 230, y: rTop - row1H - 14, size: 8.5, font, color: COLOR_TEXT });

    page.drawText(`${porcAsist} /100%`, { x: MARGIN_LEFT + resCol1W + 28, y: rTop - row1H - 14, size: 8.5, font: fontBold, color: COLOR_TEXT });

    // Fila 3: Valoración sobre 100 puntos
    hLine(page, MARGIN_LEFT, RIGHT_X, rTop - totalResH);
    const val100Str = formatEnteroEstricto(d.valoracion_100);
    const litClean = cleanLiteral(d.promedio_literal);
    page.drawText(`Valoración sobre 100 puntos: ${val100Str} (${litClean})`, { x: MARGIN_LEFT + 6, y: rTop - row1H - row2H - 14, size: 8.5, font: fontBold, color: COLOR_TEXT });

    // Líneas verticales del cuadro resumen
    vLine(page, MARGIN_LEFT, rTop, rTop - totalResH);
    vLine(page, MARGIN_LEFT + resCol1W, rTop, rTop - row1H - row2H);
    vLine(page, RIGHT_X, rTop, rTop - totalResH);

    cursorY = rTop - totalResH - 35;

    // LUGAR Y FECHA CENTRADO
    const ciudad = d.lugar_ciudad || "El Alto";
    const dia = d.dia || "21";
    const mes = d.mes || "septiembre";
    const ano = String(d.ano || "2026").slice(0, 4);

    const txtLugarLabel = "Lugar y fecha: ";
    const txtLugarValor = `${ciudad}, ${dia} de ${mes} de ${ano}`;

    const wLabelLF = font.widthOfTextAtSize(txtLugarLabel, 9);
    const wValLF = fontBold.widthOfTextAtSize(txtLugarValor, 9);
    const totalLFWidth = wLabelLF + wValLF;
    const startX_LF = CONTENT_CENTER_X - (totalLFWidth / 2);

    page.drawText(txtLugarLabel, { x: startX_LF, y: cursorY, size: 9, font, color: COLOR_TEXT });
    page.drawText(txtLugarValor, { x: startX_LF + wLabelLF, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    drawDottedLine(page, startX_LF + wLabelLF, startX_LF + totalLFWidth, cursorY - 2);

    cursorY -= 45;

    // FIRMAS INFERIORES
    const sigColWidth = CONTENT_WIDTH / 2;
    const sigLineW = 160;

    const firmas = [
      { label: "Docente Guía UE/CEA/CEE", xCenter: MARGIN_LEFT + sigColWidth * 0.5 },
      { label: "Director/a UE/CEA/CEE", xCenter: MARGIN_LEFT + sigColWidth * 1.5 }
    ];

    firmas.forEach((f) => {
      const lineStartX = f.xCenter - sigLineW / 2;
      const lineEndX = f.xCenter + sigLineW / 2;

      drawDottedLine(page, lineStartX, lineEndX, cursorY);

      const wL = fontBold.widthOfTextAtSize(f.label, 8.5);
      page.drawText(f.label, {
        x: f.xCenter - wL / 2,
        y: cursorY - 11,
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
    console.error("Error al generar PDF de la Ficha B-1 (5to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};