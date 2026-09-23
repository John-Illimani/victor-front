import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaC14toAnoService } from '../../../services/fichas/4año/fichaC14toAnoService';

// PALETA DE COLORES INSTITUCIONALES Y TÉCNICOS
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);            // Dorado Institucional (#C9A751)
const COLOR_TABLE_HEADER = rgb(178 / 255, 34 / 255, 34 / 255);       // Rojo Guindo Institucional (#B22222)
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

export const imprimirFichaC1_4toAno = async (estudianteId) => {
  try {
    const response = await fichaC14toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha C-1."
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

    // DIMENSIONES Y MÁRGENES ESTRICTOS SOLICITADOS
    const MARGIN_TOP = 141.73;          // 5.0 cm exactos (141.73 pt)[cite: 41]
    const MARGIN_LEFT = 85.04;          // 3.0 cm exactos (85.04 pt)[cite: 41]
    const MARGIN_RIGHT = 51.31;         // 1.81 cm exactos (51.31 pt)[cite: 41]
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt exactos[cite: 41]
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // 1. TÍTULO PRINCIPAL (13 pt Bold, Dorado Institucional)[cite: 41]
    const title1 = "FICHA C-1";
    const title2 = "EVALUACIÓN DEL DOCUMENTO DE DISEÑO METODOLÓGICO POR LA/EL";
    const title3 = "DOCENTE TUTOR/A ACOMPAÑANTE";

    const wT1 = fontBold.widthOfTextAtSize(title1, 13);
    page.drawText(title1, {
      x: CONTENT_CENTER_X - wT1 / 2,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: COLOR_TITLE,
    });
    cursorY -= 15;

    const wT2 = fontBold.widthOfTextAtSize(title2, 12);
    page.drawText(title2, {
      x: CONTENT_CENTER_X - wT2 / 2,
      y: cursorY,
      size: 12,
      font: fontBold,
      color: COLOR_TITLE,
    });
    cursorY -= 15;

    const wT3 = fontBold.widthOfTextAtSize(title3, 12);
    page.drawText(title3, {
      x: CONTENT_CENTER_X - wT3 / 2,
      y: cursorY,
      size: 12,
      font: fontBold,
      color: COLOR_TITLE,
    });
    cursorY -= 18;

    // 2. PARRAFO DESCRIPTIVO (9 pt Regular)[cite: 41]
    const desc = "La aprobación del documento es habilitante para la socialización ante la Comisión Comunitaria de Evaluación.";
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

    // 3. TABLA DE INFORMACIÓN GENERAL (3 FILAS) - ETIQUETA AMPLIADA A 170 pt
    const tableHeaderTop = cursorY;
    const labelColWidth = 170; 
    const valColWidth = CONTENT_WIDTH - labelColWidth;

    hLine(page, MARGIN_LEFT, RIGHT_X, tableHeaderTop);

    const headerRows = [
      { label: "Integrante del ECTG", value: d.integrante_ectg || "" },
      { label: "Modalidad de Graduación", value: d.modalidad_graduacion || "" },
      { label: "Título del Diseño Metodológico", value: d.titulo_diseno_metodologico || "" }
    ];

    headerRows.forEach((row) => {
      const rowHeight = row.label.includes("Título") ? 26 : 20;
      
      page.drawText(row.label, {
        x: MARGIN_LEFT + 6,
        y: cursorY - 14,
        size: 9.5,
        font: fontBold,
        color: COLOR_TEXT,
      });

      if (row.value) {
        const valLines = wrapText(String(row.value), font, 9, valColWidth - 12);
        valLines.forEach((vl, idx) => {
          page.drawText(vl, {
            x: MARGIN_LEFT + labelColWidth + 6,
            y: cursorY - 14 - (idx * 10),
            size: 9,
            font,
            color: COLOR_TEXT,
          });
        });
      }

      cursorY -= rowHeight;
      hLine(page, MARGIN_LEFT, RIGHT_X, cursorY);
    });

    vLine(page, MARGIN_LEFT, tableHeaderTop, cursorY);
    vLine(page, MARGIN_LEFT + labelColWidth, tableHeaderTop, cursorY);
    vLine(page, RIGHT_X, tableHeaderTop, cursorY);

    cursorY -= 4;

    // 4. TABLA PRINCIPAL DE CRITERIOS DE EVALUACIÓN
    const wCol1 = 285.65; // Criterios de evaluación
    const wCol2 = 90;     // Puntaje máximo
    const wCol3 = CONTENT_WIDTH - (wCol1 + wCol2); // 100 pt (Puntaje asignado)

    const mainColX = [
      MARGIN_LEFT,
      MARGIN_LEFT + wCol1,
      MARGIN_LEFT + wCol1 + wCol2,
      RIGHT_X
    ];

    const mainTableTop = cursorY;
    const headerH = 28;

    fillRect(page, MARGIN_LEFT, mainTableTop, CONTENT_WIDTH, headerH, COLOR_TABLE_HEADER);

    const wH1 = fontBold.widthOfTextAtSize("Criterios de evaluación", 12);
    page.drawText("Criterios de evaluación", {
      x: mainColX[0] + (wCol1 / 2) - (wH1 / 2),
      y: mainTableTop - 18,
      size: 12,
      font: fontBold,
      color: COLOR_WHITE,
    });

    const head2Lines = ["Puntaje", "máximo"];
    head2Lines.forEach((l, idx) => {
      const w = fontBold.widthOfTextAtSize(l, 10);
      page.drawText(l, {
        x: mainColX[1] + (wCol2 / 2) - (w / 2),
        y: mainTableTop - 10 - idx * 11,
        size: 10,
        font: fontBold,
        color: COLOR_WHITE,
      });
    });

    const wH3 = fontBold.widthOfTextAtSize("Puntaje asignado", 10);
    page.drawText("Puntaje asignado", {
      x: mainColX[2] + (wCol3 / 2) - (wH3 / 2),
      y: mainTableTop - 18,
      size: 10,
      font: fontBold,
      color: COLOR_WHITE,
    });

    let currentMainY = mainTableTop - headerH;
    hLine(page, MARGIN_LEFT, RIGHT_X, mainTableTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, currentMainY);

    // 10 CRITERIOS DE LA FICHA C-1
    const criterios = [
      { key: "c1", label: "Se evidencia una elaboración participativa y corresponsable entre todos los integrantes del ECTG, recuperando los aspectos más relevantes y pertinentes del proceso de la IEPC-PEC." },
      { key: "c2", label: "Lectura adecuada, analítica, reflexiva, profunda y clara de la realidad del contexto y de la UE/CEA/CEE." },
      { key: "c3", label: "Planteamiento coherente de la problematización y de las preguntas problematizadoras para el diálogo con actores." },
      { key: "c4", label: "Las herramientas e instrumentos de investigación son adecuados para el diálogo con los actores y para el recojo de información relevante sobre el problema, necesidad o potencialidad identificada." },
      { key: "c5", label: "La organización, análisis e interpretación de la información recogida es coherente y sistemática." },
      { key: "c6", label: "Denota una pertinente selección y lectura de textos que permiten profundizar la comprensión del problema, necesidad o potencialidad identificada." },
      { key: "c7", label: "Plantea una propuesta clara, integral, transformadora y coherente en procura de responder al nudo problemático identificado." },
      { key: "c8", label: "El diagnóstico socioparticipativo fue socializado y enriquecido con los aportes de la comunidad educativa de la UE/CEA/CEE según el acta de socialización del documento en la comunidad educativa." },
      { key: "c9", label: "Propone un proceso de implementación de trabajo de grado coherente con la modalidad de graduación elegida." },
      { key: "c10", label: "Utiliza adecuadamente las normas APA 7ma edición en citas y referencias bibliográficas." }
    ];

    criterios.forEach((crit) => {
      const cLines = wrapText(crit.label, font, 8, wCol1 - 8);
      const lineH = 9.5;
      const rowH = Math.max(22, cLines.length * lineH + 6);
      const textStartY = currentMainY - 8;

      cLines.forEach((l, idx) => {
        page.drawText(l, {
          x: mainColX[0] + 4,
          y: textStartY - idx * lineH,
          size: 8,
          font,
          color: COLOR_TEXT,
        });
      });

      const maxScoreStr = "10";
      const wMax = font.widthOfTextAtSize(maxScoreStr, 9);
      page.drawText(maxScoreStr, {
        x: mainColX[1] + (wCol2 / 2) - (wMax / 2),
        y: currentMainY - (rowH / 2) - 3,
        size: 9,
        font,
        color: COLOR_TEXT,
      });

      const valAsignado = d[crit.key];
      if (valAsignado !== null && valAsignado !== undefined && String(valAsignado).trim() !== "") {
        const numVal = Math.round(parseFloat(valAsignado) || 0);
        const strVal = String(numVal);
        const wVal = font.widthOfTextAtSize(strVal, 9);
        page.drawText(strVal, {
          x: mainColX[2] + (wCol3 / 2) - (wVal / 2),
          y: currentMainY - (rowH / 2) - 3,
          size: 9,
          font,
          color: COLOR_TEXT,
        });
      }

      currentMainY -= rowH;
      hLine(page, MARGIN_LEFT, RIGHT_X, currentMainY);
    });

    // 5. FILAS DE PUNTAJE FINAL Y LITERAL (CELDA DE PUNTAJE FINAL UNIFICADA HASTA ANTES DE LA COLUMNA DE PUNTOS Y LITERAL DE LADO A LADO)
    const yPromTop = currentMainY;
    const hFinalRow = 20;
    const hLiteralRow = 20;
    const totalBottomH = hFinalRow + hLiteralRow; // 40 pt
    const yPromEnd = yPromTop - totalBottomH;

    const totalRaw = parseFloat(d.puntaje_final || 0);
    const totalEntero = Math.round(totalRaw);
    const literalTexto = d.puntaje_literal && d.puntaje_literal !== 'CERO CON 00/100' 
      ? String(d.puntaje_literal).replace(/ CON 00\/100/g, '') 
      : numeroALetras(totalEntero);

    // Fila 1: Puntaje Final (Texto unificado abarcando desde Col 1 hasta antes de la Col 3)[cite: 43]
    page.drawText("Puntaje Final", {
      x: mainColX[0] + 6,
      y: yPromTop - 14,
      size: 9.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const strTotal = String(totalEntero);
    const wTotal = fontBold.widthOfTextAtSize(strTotal, 10);
    page.drawText(strTotal, {
      x: mainColX[2] + (wCol3 / 2) - (wTotal / 2),
      y: yPromTop - 14,
      size: 10,
      font: fontBold,
      color: COLOR_TEXT,
    });

    const yMid = yPromTop - hFinalRow;
    hLine(page, mainColX[0], RIGHT_X, yMid);

    // Fila 2: Literal (CELDA UNIFICADA DE LADO A LADO EN TODA LA FILA)[cite: 43]
    page.drawText("Literal:", {
      x: mainColX[0] + 6,
      y: yMid - 14,
      size: 9.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    page.drawText(literalTexto, {
      x: mainColX[0] + 65,
      y: yMid - 14,
      size: 9.5,
      font: fontBold,
      color: COLOR_TEXT,
    });

    hLine(page, MARGIN_LEFT, RIGHT_X, yPromEnd);

    // BORDES Y LÍNEAS VERTICALES DE LA TABLA PRINCIPAL (Sin línea vertical en la fila de literal)[cite: 43]
    vLine(page, mainColX[0], mainTableTop, yPromEnd);
    vLine(page, mainColX[2], mainTableTop, yMid); // Solo separa la celda de puntaje final antes de la nota[cite: 43]
    vLine(page, RIGHT_X, mainTableTop, yPromEnd);

    currentMainY = yPromEnd;

    cursorY = currentMainY - 30;

    // 6. LUGAR Y FECHA CENTRADO DINÁMICAMENTE CON LÍNEA PUNTEADA[cite: 41]
    const ciudad = d.lugar_ciudad || "El Alto";
    const dia = d.dia || String(new Date().getDate());
    const mes = d.mes || "SEPTIEMBRE";
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
      font, 
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

    cursorY -= 35;

    // 7. BLOQUE DE FIRMA INFERIOR (DOCENTE TUTOR/A ACOMPAÑANTE CENTRADO)
    const sigLineW = 180;
    const lineStartX = CONTENT_CENTER_X - sigLineW / 2;
    const lineEndX = CONTENT_CENTER_X + sigLineW / 2;

    drawDottedLine(page, lineStartX, lineEndX, cursorY);

    const sigLabel = "Docente Tutor/a Acompañante";
    const wSig = fontBold.widthOfTextAtSize(sigLabel, 9);
    page.drawText(sigLabel, {
      x: CONTENT_CENTER_X - wSig / 2,
      y: cursorY - 12,
      size: 9,
      font: fontBold,
      color: COLOR_TEXT,
    });

    // GUARDAR Y ABRIR PDF EN NUEVA PESTAÑA
    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, '_blank');
    return { success: true };

  } catch (error) {
    console.error("Error al generar PDF de la Ficha C-1 (4to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};