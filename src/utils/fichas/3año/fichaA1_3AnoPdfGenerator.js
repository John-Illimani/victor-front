import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaA13erAnoService } from '../../../services/fichas/3año/fichaA13erAnoService';

// Paleta de Colores Institucionales
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);            // Dorado (#C9A751)
const COLOR_TABLE_HEADER = rgb(155 / 255, 168 / 255, 102 / 255);    // Verde Oliva (#9BA866)
const COLOR_OBS_BG = rgb(240 / 255, 243 / 255, 230 / 255);          // Fondo Suave Observaciones
const COLOR_BORDER = rgb(0, 0, 0);

const BORDER = 0.8;

// FUNCIÓN PARA CONVERTIR NÚMEROS ENTEROS A PALABRAS (DEL 0 AL 100)
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

// HELPER PARA OBTENER EL LITERAL DEL NÚMERO REDONDEADO
function obtenerLiteralRedondeado(puntajeFinal, literalFallback) {
  if (puntajeFinal !== undefined && puntajeFinal !== null && String(puntajeFinal).trim() !== "") {
    const numRedondeado = Math.round(parseFloat(puntajeFinal) || 0);
    return numeroALetras(numRedondeado);
  }
  
  // Fallback si no hay número: limpiar el texto raw
  if (!literalFallback) return "";
  let str = String(literalFallback).trim().toUpperCase();
  if (str.includes(" CON ")) str = str.split(" CON ")[0];
  return str.trim();
}

// Trazo de Línea Punteada Horizontal
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

// Dibujar campo de texto con línea punteada dinámica de fondo
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

export const imprimirFichaA1_3erAno = async (estudianteId) => {
  try {
    const response = await fichaA13erAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha A-1."
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

    // MÁRGENES ESTRICTOS: 5 CM ARRIBA (141.73 PT), 3 CM IZQ (85.04 PT), 1.81 CM DER (51.31 PT)
    const MARGIN_TOP = (5 / 2.54) * 72; 
    const MARGIN_LEFT = 85.04;          
    const MARGIN_RIGHT = 51.31;         
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // TÍTULO PRINCIPAL (Dorado 13 pt Bold Centrado)
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
      cursorY -= 17;
    });

    cursorY -= 8;

    // SUBTÍTULO
    page.drawText("DATOS REFERENCIALES DEL ESTUDIANTE:", {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 9.5,
      font: fontBold,
      color: COLOR_TEXT,
    });
    cursorY -= 16;

    // DATOS PUNTEADOS
    campoPunteado(page, {
      label: "Nombres y Apellidos: ",
      value: d.apellidos_nombres || "",
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9,
    });
    cursorY -= 16;

    const esfmEnd = campoPunteado(page, {
      label: "ESFM/UA: ",
      value: d.esfm_ua || "ESFM Simón Bolívar / UA El Alto",
      x: MARGIN_LEFT,
      y: cursorY,
      minLine: 180,
      font,
      fontBold,
      size: 9,
    });

    campoPunteado(page, {
      label: "Año de Formación: ",
      value: d.ano_formacion || "3er Año",
      x: esfmEnd + 15,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9,
    });
    cursorY -= 16;

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

    const bullet1 = "•   El equipo comunitario diseña, valida y aplica técnicas e instrumentos de investigación, bajo el enfoque de la";
    const bullet1_cont = "Investigación Acción Participativa; posteriormente procesa, analiza e interpreta la información.";
    const bullet2 = "•   Responsable de evaluar: Docente de investigación de la ESFM/UA.";

    page.drawText(bullet1, { x: MARGIN_LEFT + 10, y: cursorY - 12, size: 8, font, color: COLOR_TEXT });
    page.drawText(bullet1_cont, { x: MARGIN_LEFT + 20, y: cursorY - 21, size: 8, font: fontBold, color: COLOR_TEXT });
    page.drawText(bullet2, { x: MARGIN_LEFT + 10, y: cursorY - 33, size: 8, font, color: COLOR_TEXT });

    cursorY -= (boxH + 10);

    // TABLA DE EVALUACIÓN
    const tableTop = cursorY;
    const colWidths = [120, 100, 100, 100, 55.65]; // Total: 475.65 pt
    const colX = [MARGIN_LEFT];
    for (let i = 0; i < colWidths.length; i++) colX.push(colX[i] + colWidths[i]);

    const headerH = 45;
    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, headerH, COLOR_TABLE_HEADER);

    const headers = [
      ["TÉCNICAS E", "INSTRUMENTOS DE", "INVESTIGACIÓN"],
      ["DISEÑO Y VALIDACIÓN", "DE TÉCNICAS E", "INSTRUMENTOS DE", "INVESTIGACIÓN"],
      ["APLICACIÓN DE", "TÉCNICAS E", "INSTRUMENTOS DE", "INVESTIGACIÓN"],
      ["ORDEN, ANÁLISIS,", "REFLEXIÓN E", "INTERPRETACIÓN DE", "LA INFORMACIÓN"],
      ["PROMEDIO"]
    ];

    headers.forEach((lines, colIdx) => {
      const lineH = 9;
      const startY = tableTop - (headerH / 2) + ((lines.length * lineH) / 2) - 6;

      lines.forEach((lineText, lineIdx) => {
        const w = fontBold.widthOfTextAtSize(lineText, 7.5);
        page.drawText(lineText, {
          x: colX[colIdx] + colWidths[colIdx] / 2 - w / 2,
          y: startY - lineIdx * lineH,
          size: 7.5,
          font: fontBold,
          color: COLOR_TEXT,
        });
      });
    });

    let currentTableY = tableTop - headerH;
    const hLines = [tableTop, currentTableY];

    // FILA DE ESCALA (1 a 100 puntos)
    const scaleH = 18;
    page.drawText("Puntaje", { x: colX[0] + colWidths[0] / 2 - fontBold.widthOfTextAtSize("Puntaje", 8) / 2, y: currentTableY - 12, size: 8, font: fontBold, color: COLOR_TEXT });

    [1, 2, 3].forEach((colIdx) => {
      const scaleText = "1 a 100 puntos";
      const w = font.widthOfTextAtSize(scaleText, 8);
      page.drawText(scaleText, { x: colX[colIdx] + colWidths[colIdx] / 2 - w / 2, y: currentTableY - 12, size: 8, font, color: COLOR_TEXT });
    });

    currentTableY -= scaleH;
    hLines.push(currentTableY);

    // FILAS DATO (4 FILAS DE TÉCNICAS)
    const rawTecnicas = Array.isArray(d.tecnicas_evaluacion) ? d.tecnicas_evaluacion : [];
    const filasTecnicas = [0, 1, 2, 3].map((idx) => rawTecnicas[idx] || {});

    filasTecnicas.forEach((item) => {
      const rowH = 22;

      // Columna 0: Nombre Técnica
      const tecNombre = String(item.tecnica || item.nombre || "").toUpperCase();
      if (tecNombre) {
        page.drawText(tecNombre, { x: colX[0] + 6, y: currentTableY - 14, size: 8, font: fontBold, color: COLOR_TEXT });
      }

      // Columnas 1, 2, 3: Notas de la API
      const n1 = item.nota_diseno ?? item.nota1 ?? item.diseno;
      const n2 = item.nota_aplicacion ?? item.nota2 ?? item.aplicacion;
      const n3 = item.nota_analisis ?? item.nota3 ?? item.analisis;

      [n1, n2, n3].forEach((val, cIdx) => {
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          const valStr = String(val);
          const w = font.widthOfTextAtSize(valStr, 8.5);
          page.drawText(valStr, { x: colX[cIdx + 1] + colWidths[cIdx + 1] / 2 - w / 2, y: currentTableY - 14, size: 8.5, font, color: COLOR_TEXT });
        }
      });

      // Columna 4: Promedio por técnica
      const promRow = item.promedio;
      if (promRow !== undefined && promRow !== null && String(promRow).trim() !== "") {
        const promStr = String(promRow);
        const wProm = fontBold.widthOfTextAtSize(promStr, 8.5);
        page.drawText(promStr, { x: colX[4] + colWidths[4] / 2 - wProm / 2, y: currentTableY - 14, size: 8.5, font: fontBold, color: COLOR_TEXT });
      }

      currentTableY -= rowH;
      hLines.push(currentTableY);
    });

    // BORDES VERTICALES DE LA SECCIÓN DE EVALUACIÓN
    colX.forEach((lineX) => vLine(page, lineX, tableTop, currentTableY));

    // FILA COMBINADA 1: PUNTAJE FINAL
    const finalH = 22;
    const yPuntajeFinal = currentTableY;

    const pfLabel = "Puntaje Final (Número entero)";
    const pfW = fontBold.widthOfTextAtSize(pfLabel, 8.5);
    page.drawText(pfLabel, { x: colX[4] - pfW - 8, y: yPuntajeFinal - 14, size: 8.5, font: fontBold, color: COLOR_TEXT });

    const pfVal = d.puntaje_final ?? d.promedio_numeral ?? "";
    if (pfVal !== "") {
      const pfStr = String(Math.round(parseFloat(pfVal) || 0));
      const pfValW = fontBold.widthOfTextAtSize(pfStr, 9);
      page.drawText(pfStr, { x: colX[4] + colWidths[4] / 2 - pfValW / 2, y: yPuntajeFinal - 14, size: 9, font: fontBold, color: COLOR_TEXT });
    }

    currentTableY -= finalH;
    hLines.push(currentTableY);

    vLine(page, MARGIN_LEFT, yPuntajeFinal, currentTableY);
    vLine(page, colX[4], yPuntajeFinal, currentTableY);
    vLine(page, RIGHT_X, yPuntajeFinal, currentTableY);

    // FILA COMBINADA 2: LITERAL (CALCULADO DINÁMICAMENTE SEGÚN EL NÚMERO REDONDEADO)
    const litH = 24;
    const yLiteral = currentTableY;

    const litLabel = "Literal: ";
    page.drawText(litLabel, { x: MARGIN_LEFT + 6, y: yLiteral - 15, size: 8.5, font: fontBold, color: COLOR_TEXT });

    // Convierte el valor redondeado a palabras (ej. 36.58 -> 37 -> "TREINTA Y SIETE")
    const litVal = obtenerLiteralRedondeado(pfVal, d.promedio_literal);
    if (litVal) {
      page.drawText(litVal, { x: MARGIN_LEFT + 6 + fontBold.widthOfTextAtSize(litLabel, 8.5), y: yLiteral - 15, size: 8.5, font: fontBold, color: COLOR_TEXT });
    }

    currentTableY -= litH;
    hLines.push(currentTableY);

    vLine(page, MARGIN_LEFT, yLiteral, currentTableY);
    vLine(page, RIGHT_X, yLiteral, currentTableY);

    // Dibujar todas las líneas horizontales
    hLines.forEach((lineY) => hLine(page, MARGIN_LEFT, RIGHT_X, lineY));

    cursorY = currentTableY - 18;

    // RECUADRO DE OBSERVACIONES
    const obsH = 45;
    fillRect(page, MARGIN_LEFT, cursorY, CONTENT_WIDTH, obsH, COLOR_OBS_BG);

    page.drawRectangle({
      x: MARGIN_LEFT,
      y: cursorY - obsH,
      width: CONTENT_WIDTH,
      height: obsH,
      borderColor: COLOR_BORDER,
      borderWidth: 0.8,
    });

    hLine(page, MARGIN_LEFT, RIGHT_X, cursorY - 18);

    page.drawText("Observaciones:", { x: MARGIN_LEFT + 6, y: cursorY - 13, size: 8.5, font: fontBold, color: COLOR_TEXT });

    const obsVal = String(d.observaciones || "").trim();
    if (obsVal) {
      page.drawText(obsVal, { x: MARGIN_LEFT + 6, y: cursorY - 32, size: 8, font, color: COLOR_TEXT });
    }

    cursorY -= (obsH + 25);

    // LUGAR Y FECHA CENTRADO
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

    cursorY -= 65;

    // FIRMAS INFERIORES
    const colSigWidth = CONTENT_WIDTH / 2;
    const lineW = 170;

    const firmas = [
      {
        label: "Estudiante",
        xCenter: MARGIN_LEFT + colSigWidth * 0.5
      },
      {
        label: "Docente de Investigación\nde la ESFM/UA",
        xCenter: MARGIN_LEFT + colSigWidth * 1.5
      }
    ];

    firmas.forEach((f) => {
      const lineStartX = f.xCenter - lineW / 2;
      const lineEndX = f.xCenter + lineW / 2;

      drawDottedLine(page, lineStartX, lineEndX, cursorY);

      const lines = f.label.split("\n");
      let fy = cursorY - 12;

      lines.forEach((l) => {
        const lw = fontBold.widthOfTextAtSize(l, 8.5);
        page.drawText(l, {
          x: f.xCenter - lw / 2,
          y: fy,
          size: 8.5,
          font: fontBold,
          color: COLOR_TEXT,
        });
        fy -= 10;
      });
    });

    // Renderizar PDF
    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, '_blank');
    return { success: true };

  } catch (error) {
    console.error("Error al generar PDF de la Ficha A-1 (3er Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};