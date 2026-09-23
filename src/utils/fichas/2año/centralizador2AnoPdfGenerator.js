import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { PDF417 } from "pdf417-generator";
import { centralizador2doAnoService } from "../../../services/fichas/2año/centralizador2doAnoService";

// Paleta de Colores Institucionales
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);        // Dorado (#C9A751)
const COLOR_TABLE_HEADER = rgb(178 / 255, 34 / 255, 34 / 255);  // Rojo Guindo (#B22222)
const COLOR_HEADER_TEXT = rgb(1, 1, 1);                         // Blanco
const COLOR_ROW_PINK = rgb(253 / 255, 228 / 255, 222 / 255);    // Fondo Etapa (#FDE4DE)
const COLOR_BORDER = rgb(0, 0, 0);

const BORDER = 1;

const FILAS_CENTRALIZADOR = [
  {
    etapaKey: "ETAPA\nPREPARATORIA\n(ANTES DE LA\nPEC)",
    etapaRows: 2,
    actividad: "Plan de acción del equipo comunitario de la PEC.",
    ficha: "F-1",
    fichaRows: 2,
    notaRows: 2,
    fieldKey: "nota_f1"
  },
  {
    etapaKey: null,
    actividad: "Instrumentos de diagnóstico debidamente validados.",
    ficha: null,
    fichaRows: 0,
    notaRows: 0,
    fieldKey: null
  },
  {
    etapaKey: "ETAPA DE\nEJECUCIÓN\n(DURANTE)",
    etapaRows: 4,
    actividad: "Asistencia a la Práctica Educativa Comunitaria (PEC). F-2 100%",
    ficha: "F-2",
    fichaRows: 1,
    notaRows: 1,
    fieldKey: "nota_f2"
  },
  {
    etapaKey: null,
    actividad: "Instrumentos de investigación educativa aplicados en cada espacio geográfico (comunidad , UE/CEE/CEA aula ).",
    ficha: "F-3",
    fichaRows: 1,
    notaRows: 1,
    fieldKey: "nota_f3"
  },
  {
    etapaKey: null,
    actividad: "Apoyo y seguimiento del Docente Guía de UE/ CEA/CEE, en la Concreción Curricular.",
    ficha: "F-4",
    fichaRows: 1,
    notaRows: 1,
    fieldKey: "nota_f4"
  },
  {
    etapaKey: null,
    actividad: "Valoración de la/el Docente Acompañante de la ESFM/UA",
    ficha: "F-5",
    fichaRows: 1,
    notaRows: 1,
    fieldKey: "nota_f5"
  },
  {
    etapaKey: "ETAPA DE\nPRODUCCIÓN\n(DESPUÉS)",
    etapaRows: 1,
    actividad: "Valoración del documento Diagnóstico Socioeducativo.",
    ficha: "F-6",
    fichaRows: 1,
    notaRows: 1,
    fieldKey: "nota_f6"
  }
];

function formatNotaEntero(val) {
  if (val === undefined || val === null || val === "") return "";
  const num = Number(val);
  if (isNaN(num)) return "";
  return String(Math.round(num));
}

function numeroALiteralEntero(num) {
  const n = Math.round(Number(num) || 0);
  if (n <= 0) return "CERO";
  if (n >= 100) return "CIEN";

  const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
  const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  const especiales = {
    11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE", 15: "QUINCE",
    16: "DIECISÉIS", 17: "DIECISIETE", 18: "DIECIOCHO", 19: "DIECINUEVE",
    21: "VEINTIUNO", 22: "VEINTIDÓS", 23: "VEINTITRÉS", 24: "VEINTICUATRO",
    25: "VEINTICINCO", 26: "VEINTISÉIS", 27: "VEINTISIETE", 28: "VEINTIOCHO", 29: "VEINTINUEVE"
  };

  if (n < 10) return unidades[n];
  if (especiales[n]) return especiales[n];

  const d = Math.floor(n / 10);
  const u = n % 10;
  if (d === 2) return `VEINTI${unidades[u]}`;
  return u === 0 ? decenas[d] : `${decenas[d]} Y ${unidades[u]}`;
}

function wrapTextToLines(text, font, maxWidth, fontSize) {
  const out = [];
  String(text ?? "").split(/\r?\n/).forEach((parrafo) => {
    if (!parrafo.trim()) {
      out.push("");
      return;
    }
    let current = "";
    parrafo.split(/\s+/).filter(Boolean).forEach((word) => {
      const test = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
        out.push(current);
        current = word;
      } else {
        current = test;
      }
    });
    if (current) out.push(current);
  });
  return out.length ? out : [""];
}

function drawDotted(page, x1, x2, y) {
  page.drawLine({
    start: { x: x1, y },
    end: { x: x2, y },
    thickness: 0.8,
    dashArray: [1.5, 1.5],
    color: COLOR_TEXT,
  });
}

function campoPunteado(page, { label, value, x, y, minLine = 0, endX, font, fontBold, size = 9, forceUpper = true }) {
  page.drawText(label, { x, y, size, font, color: COLOR_TEXT });
  const valueX = x + font.widthOfTextAtSize(label, size);
  let val = String(value ?? "").trim();
  if (forceUpper) val = val.toUpperCase();
  
  if (val) {
    page.drawText(val, { x: valueX, y, size, font: fontBold, color: COLOR_TEXT });
  }
  
  const valW = val ? fontBold.widthOfTextAtSize(val, size) : 0;
  const lineEnd = endX ?? (valW > 0 ? valueX + valW : valueX + minLine);
  
  drawDotted(page, valueX, lineEnd, y - 2);
  return lineEnd;
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

const generarPdf417DataUrl = (texto) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    try {
      PDF417.draw(texto, canvas, 2, 2);
      resolve(canvas.toDataURL('image/png'));
    } catch (e) {
      console.error("Error al renderizar código PDF417:", e);
      resolve(null);
    }
  });
};

export const imprimirCentralizador2doAno = async (estudianteId, blockchainData = {}) => {
  try {
    const responseCentralizador = await centralizador2doAnoService.getByEstudiante(estudianteId);

    if (!responseCentralizador || !responseCentralizador.datos) {
      return { success: false, message: "No existen datos registrados para el Centralizador." };
    }

    const d = responseCentralizador.datos;

    const txHash = blockchainData?.tx_hash || blockchainData?.txHash || '';
    const hashLocal = blockchainData?.hash_local || blockchainData?.hash || '';

    const urlPlantilla = encodeURI("/pdf/2año/plantilla.pdf");
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

    let font, fontBold;
    try {
      const resCalibri = await fetch("/fonts/calibri.ttf");
      const calibriBytes = await resCalibri.arrayBuffer();
      font = await pdfDoc.embedFont(calibriBytes);

      const resCalibriBold = await fetch("/fonts/calibri-bold.ttf");
      const calibriBoldBytes = await resCalibriBold.arrayBuffer();
      fontBold = await pdfDoc.embedFont(calibriBoldBytes);
    } catch (e) {
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    }

    const MARGIN_TOP = (5 / 2.54) * 72; 
    const MARGIN_LEFT = 85.04;          
    const MARGIN_RIGHT = 51.31;         
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT);
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // TÍTULOS
    const titulos = ["CENTRALIZADOR DE EVALUACIÓN IEPC-PEC 2º AÑO DE", "FORMACIÓN"];
    titulos.forEach((line) => {
      const wLine = fontBold.widthOfTextAtSize(line, 13);
      page.drawText(line, {
        x: MARGIN_LEFT + CONTENT_WIDTH / 2 - wLine / 2,
        y: cursorY,
        size: 13,
        font: fontBold,
        color: COLOR_TITLE,
      });
      cursorY -= 16;
    });
    cursorY -= 2;

    page.drawText("Responsable de llenar docente acompañante de la ESFM/UA.", {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 9.5,
      font: fontBold,
      color: COLOR_TEXT,
    });
    cursorY -= 18;

    // DATOS REFERENCIALES
    campoPunteado(page, {
      label: "Nombres y Apellidos: ",
      value: d.apellidos_nombres || "",
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9,
      forceUpper: true,
    });
    cursorY -= 16;

    const esfmEnd = campoPunteado(page, {
      label: "ESFM/UA: ",
      value: d.esfm_ua || "ESFM/UA - El Alto",
      x: MARGIN_LEFT,
      y: cursorY,
      minLine: 180,
      font,
      fontBold,
      size: 9,
      forceUpper: true,
    });
    
    campoPunteado(page, {
      label: "Año de Formación: ",
      value: d.ano_formacion || "2do Año de Formación",
      x: esfmEnd + 15,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9,
      forceUpper: true,
    });
    cursorY -= 18;

    // TABLA
    const tableTop = cursorY;
    const colWidths = [105, 240.65, 60, 70];
    const colX = [MARGIN_LEFT];
    for (let i = 0; i < colWidths.length; i++) colX.push(colX[i] + colWidths[i]);

    const tableHeaderH = 22;
    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, tableHeaderH, COLOR_TABLE_HEADER);

    const seccionText = "EVALUACIÓN DE LA PEC DE SEGUNDO AÑO DE FORMACIÓN";
    const wHeaderMain = fontBold.widthOfTextAtSize(seccionText, 12);
    page.drawText(seccionText, {
      x: MARGIN_LEFT + CONTENT_WIDTH / 2 - wHeaderMain / 2,
      y: tableTop - 15,
      size: 12,
      font: fontBold,
      color: COLOR_HEADER_TEXT,
    });

    let currentY = tableTop - tableHeaderH;
    const subHeaderH = 24;
    fillRect(page, MARGIN_LEFT, currentY, CONTENT_WIDTH, subHeaderH, COLOR_TABLE_HEADER);

    const subHeaders = [
      { text: "ETAPA", col: 0, size: 8.5 },
      { text: "ACTIVIDADES", col: 1, size: 8.5 },
      { text: "FICHA", col: 2, size: 8.5 },
      { text: "CALIFICACIÓN\nOBTENIDA", col: 3, size: 8.5 },
    ];

    subHeaders.forEach(({ text, col, size }) => {
      const lines = text.split("\n");
      let hy = currentY - (subHeaderH - (lines.length * 8.5)) / 2 - size + 1;
      lines.forEach((l) => {
        const lw = fontBold.widthOfTextAtSize(l, size);
        page.drawText(l, {
          x: colX[col] + colWidths[col] / 2 - lw / 2,
          y: hy,
          size,
          font: fontBold,
          color: COLOR_HEADER_TEXT,
        });
        hy -= 8.5;
      });
    });

    currentY -= subHeaderH;
    const hLinesToDraw = [tableTop, tableTop - tableHeaderH, currentY];

    let etapaInfoCurrent = null;
    let fichaInfoCurrent = null;
    let notaInfoCurrent = null;

    FILAS_CENTRALIZADOR.forEach((row) => {
      const rowTop = currentY;

      const actLines = wrapTextToLines(row.actividad, fontBold, colWidths[1] - 10, 8);
      const rowH = Math.max(actLines.length * 9.5 + 12, 26);

      let ay = rowTop - 11;
      actLines.forEach((al) => {
        page.drawText(al, { x: colX[1] + 5, y: ay, size: 8, font: fontBold, color: COLOR_TEXT });
        ay -= 9.5;
      });

      if (row.fichaRows > 0 && row.ficha) {
        fichaInfoCurrent = { text: row.ficha, topY: rowTop, rowsCount: row.fichaRows, completedH: 0 };
      }

      if (fichaInfoCurrent) {
        fichaInfoCurrent.completedH += rowH;
        fichaInfoCurrent.rowsCount--;

        if (fichaInfoCurrent.rowsCount === 0) {
          const fH = fichaInfoCurrent.completedH;
          const fTop = fichaInfoCurrent.topY;
          const fw = font.widthOfTextAtSize(fichaInfoCurrent.text, 8);
          page.drawText(fichaInfoCurrent.text, {
            x: colX[2] + colWidths[2] / 2 - fw / 2,
            y: fTop - fH / 2 - 3,
            size: 8,
            font,
            color: COLOR_TEXT,
          });
          fichaInfoCurrent = null;
        }
      }

      if (row.notaRows > 0 && row.fieldKey) {
        const scoreStr = formatNotaEntero(d[row.fieldKey]);
        notaInfoCurrent = { text: scoreStr, topY: rowTop, rowsCount: row.notaRows, completedH: 0 };
      }

      if (notaInfoCurrent) {
        notaInfoCurrent.completedH += rowH;
        notaInfoCurrent.rowsCount--;

        if (notaInfoCurrent.rowsCount === 0) {
          if (notaInfoCurrent.text) {
            const nH = notaInfoCurrent.completedH;
            const nTop = notaInfoCurrent.topY;
            const sw = font.widthOfTextAtSize(notaInfoCurrent.text, 8.5);
            page.drawText(notaInfoCurrent.text, {
              x: colX[3] + colWidths[3] / 2 - sw / 2,
              y: nTop - nH / 2 - 3,
              size: 8.5,
              font,
              color: COLOR_TEXT,
            });
          }
          notaInfoCurrent = null;
        }
      }

      if (row.etapaKey) {
        etapaInfoCurrent = { text: row.etapaKey, topY: rowTop, rowsCount: row.etapaRows, completedH: 0 };
      }

      if (etapaInfoCurrent) {
        etapaInfoCurrent.completedH += rowH;
        etapaInfoCurrent.rowsCount--;

        if (etapaInfoCurrent.rowsCount === 0) {
          const eH = etapaInfoCurrent.completedH;
          const eTop = etapaInfoCurrent.topY;
          fillRect(page, colX[0], eTop, colWidths[0], eH, COLOR_ROW_PINK);

          const eLines = etapaInfoCurrent.text.split("\n");
          let ey = eTop - (eH / 2) + (eLines.length * 4);
          eLines.forEach((el) => {
            const elw = fontBold.widthOfTextAtSize(el, 7.5);
            page.drawText(el, {
              x: colX[0] + colWidths[0] / 2 - elw / 2,
              y: ey,
              size: 7.5,
              font: fontBold,
              color: COLOR_TEXT,
            });
            ey -= 8.5;
          });
          etapaInfoCurrent = null;
        }
      }

      currentY -= rowH;
      
      if (row.fichaRows === 2) {
        hLine(page, colX[1], colX[2], currentY);
      } else {
        hLine(page, colX[1], RIGHT_X, currentY);
      }
    });

    hLinesToDraw.push(currentY);

    // PROMEDIO
    const promFinalTop = currentY;
    page.drawText("Promedio Total", { x: colX[0] + 6, y: promFinalTop - 13, size: 8.5, font: fontBold, color: COLOR_TEXT });

    const pStr = formatNotaEntero(d.promedio_numeral);
    if (pStr) {
      const pw = fontBold.widthOfTextAtSize(pStr, 8.5);
      page.drawText(pStr, { x: colX[3] + colWidths[3] / 2 - pw / 2, y: promFinalTop - 13, size: 8.5, font: fontBold, color: COLOR_TEXT });
    }

    currentY -= 20;
    hLinesToDraw.push(currentY);

    // LITERAL
    const literalTop = currentY;
    fillRect(page, colX[0], literalTop, CONTENT_WIDTH, 20, COLOR_ROW_PINK);
    page.drawText("Literal: ", { x: colX[0] + 6, y: literalTop - 13, size: 8.5, font, color: COLOR_TEXT });

    const litValClean = numeroALiteralEntero(d.promedio_numeral);
    page.drawText(litValClean, {
      x: colX[0] + 6 + font.widthOfTextAtSize("Literal: ", 8.5),
      y: literalTop - 13,
      size: 8.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    currentY -= 20;
    hLinesToDraw.push(currentY);

    // OBSERVACIONES
    const obsTop = currentY;
    const obsLines = wrapTextToLines(d.observaciones || "", font, CONTENT_WIDTH - 12, 8.5);
    const rowObsH = Math.max(obsLines.length * 9 + 16, 32);

    page.drawText("Observaciones y/o sugerencias:", { x: colX[0] + 6, y: obsTop - 11, size: 8.5, font: fontBold, color: COLOR_TEXT });

    let oy = obsTop - 20;
    obsLines.forEach((ol) => {
      page.drawText(ol, { x: colX[0] + 6, y: oy, size: 8.5, font, color: COLOR_TEXT });
      oy -= 9;
    });

    currentY -= rowObsH;
    hLinesToDraw.push(currentY);

    const tableBottom = currentY;

    hLinesToDraw.forEach((y) => hLine(page, MARGIN_LEFT, RIGHT_X, y));
    vLine(page, colX[0], tableTop, tableBottom);
    vLine(page, colX[1], tableTop - tableHeaderH, promFinalTop);
    vLine(page, colX[2], tableTop - tableHeaderH, promFinalTop);
    vLine(page, colX[3], tableTop - tableHeaderH, literalTop);
    vLine(page, RIGHT_X, tableTop, tableBottom);

    cursorY = tableBottom - 35;

    // FECHA
    const labelFecha = "Lugar y fecha: ";
    const mesFormateado = String(d.mes || "septiembre").toLowerCase();
    const ciudadFormateada = d.lugar_ciudad || "El Alto";
    const valFechaText = `${ciudadFormateada}, ${d.dia || "21"} de ${mesFormateado} de ${d.ano || "2026"}`;

    const fontLabelSize = 8.5;
    const wLabel = font.widthOfTextAtSize(labelFecha, fontLabelSize);
    const wValue = fontBold.widthOfTextAtSize(valFechaText, fontLabelSize);
    const fechaTotalW = wLabel + wValue;
    const fechaStartX = MARGIN_LEFT + CONTENT_WIDTH / 2 - fechaTotalW / 2;

    campoPunteado(page, {
      label: labelFecha,
      value: valFechaText,
      x: fechaStartX,
      y: cursorY,
      font,
      fontBold,
      size: fontLabelSize,
      forceUpper: false,
    });

    cursorY -= 55;

    // FIRMAS
    const colWidthSig = CONTENT_WIDTH / 3;
    const lineW = 140;

    const firmas = [
      {
        titulo: "Estudiante",
        xCenter: MARGIN_LEFT + colWidthSig * 0.5
      },
      {
        titulo: "Docente Acompañante de la ESFM/UA",
        xCenter: MARGIN_LEFT + colWidthSig * 1.5
      },
      {
        titulo: "Coordinador (a) Académica IEPC-PEC o\nCoordinador (a) de la UA",
        xCenter: MARGIN_LEFT + colWidthSig * 2.5
      }
    ];

    firmas.forEach((f) => {
      const lineStartX = f.xCenter - lineW / 2;
      const lineEndX = f.xCenter + lineW / 2;

      page.drawLine({
        start: { x: lineStartX, y: cursorY },
        end: { x: lineEndX, y: cursorY },
        thickness: 0.8,
        dashArray: [1.5, 1.5],
        color: COLOR_BORDER,
      });

      const fLines = f.titulo.split("\n");
      let fy = cursorY - 12;

      fLines.forEach((fl) => {
        const flW = fontBold.widthOfTextAtSize(fl, 8);
        page.drawText(fl, {
          x: f.xCenter - flW / 2,
          y: fy,
          size: 8,
          font: fontBold,
          color: COLOR_TEXT,
        });
        fy -= 9.5;
      });
    });

    // CÓDIGO PDF417 BLOCKCHAIN
    const pdf417X = MARGIN_LEFT;
    const pdf417Y = 90;
    const pdf417Width = 200;
    const pdf417Height = 45;

    const txHashValido = txHash || hashLocal || estudianteId;
    const pdf417TextData = `ESTUDIANTE:${d.apellidos_nombres || ''}|TX_HASH:${txHashValido}|HASH_LOCAL:${hashLocal || "NO_DISPONIBLE"}`;

    const pdf417DataUrl = await generarPdf417DataUrl(pdf417TextData);

    if (pdf417DataUrl) {
      const pdf417Image = await pdfDoc.embedPng(pdf417DataUrl);
      page.drawImage(pdf417Image, {
        x: pdf417X,
        y: pdf417Y,
        width: pdf417Width,
        height: pdf417Height
      });
    }

    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");

    return { success: true };
  } catch (error) {
    console.error("Error al generar PDF del Centralizador de 2do Año:", error);
    return { success: false, message: `Error al procesar el PDF: ${error.message}` };
  }
};