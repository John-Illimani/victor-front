import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { PDF417 } from "pdf417-generator";
import { centralizador2doAnoService } from "../../../../services/fichas/2año/centralizador2doAnoService";
import { userService } from "../../../../services/userService";

const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_BORDER = rgb(0, 0, 0);
const COLOR_TABLE_HEADER = rgb(230 / 255, 230 / 255, 230 / 255);

const BORDER = 0.8;

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

const plainTokens = (text, fontObj, color) =>
  String(text ?? '').split(/\s+/).filter(Boolean).map((w) => ({ text: w, font: fontObj, color }));

const boldTokens = (text, fontBoldObj, color) =>
  String(text ?? '').split(/\s+/).filter(Boolean).map((w) => ({ text: w, font: fontBoldObj, color }));

function drawJustifiedParagraph(page, tokens, { x, y, maxWidth, fontSize, lineHeight, spaceFont, indent = 0 }) {
  const spaceWidth = spaceFont.widthOfTextAtSize(' ', fontSize);
  const lines = [];
  let current = [];
  let currentWidth = 0;

  tokens.forEach((token) => {
    const wordWidth = token.font.widthOfTextAtSize(token.text, fontSize);
    const lineIndent = lines.length === 0 ? 0 : indent;
    const availableWidth = maxWidth - lineIndent;
    const extra = current.length > 0 ? spaceWidth : 0;

    if (currentWidth + extra + wordWidth > availableWidth && current.length > 0) {
      lines.push(current);
      current = [token];
      currentWidth = wordWidth;
    } else {
      current.push(token);
      currentWidth += extra + wordWidth;
    }
  });
  if (current.length) lines.push(current);

  let cursorY = y;
  lines.forEach((line, i) => {
    const isFirstLine = i === 0;
    const isLastLine = i === lines.length - 1;
    const lineX = isFirstLine ? x : x + indent;
    const lineMaxWidth = isFirstLine ? maxWidth : maxWidth - indent;

    const wordsWidth = line.reduce((sum, t) => sum + t.font.widthOfTextAtSize(t.text, fontSize), 0);
    const gaps = line.length - 1;
    const gapWidth = !isLastLine && gaps > 0
      ? (lineMaxWidth - wordsWidth) / gaps
      : spaceWidth;

    let cursorX = lineX;
    line.forEach((token) => {
      const wordW = token.font.widthOfTextAtSize(token.text, fontSize);
      page.drawText(token.text, {
        x: cursorX,
        y: cursorY,
        size: fontSize,
        font: token.font,
        color: token.color || COLOR_TEXT,
      });

      cursorX += wordW + gapWidth;
    });

    cursorY -= lineHeight;
  });

  return cursorY;
}

function wrapTextToLines(text, fontObj, maxWidth, fontSize) {
  const out = [];
  String(text ?? "").split(/\r?\n/).forEach((parrafo) => {
    if (!parrafo.trim()) {
      out.push("");
      return;
    }
    let current = "";
    parrafo.split(/\s+/).filter(Boolean).forEach((word) => {
      const test = current ? `${current} ${word}` : word;
      if (fontObj.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
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

export const imprimirCertificado2doAno = async (estudianteId, blockchainData = {}) => {
  try {
    const responseCentralizador = await centralizador2doAnoService.getByEstudiante(estudianteId);

    if (!responseCentralizador || !responseCentralizador.datos) {
      return { success: false, message: "No existen datos registrados para el Centralizador de 2do Año." };
    }

    const d = responseCentralizador.datos;

    const txHash = blockchainData?.tx_hash || blockchainData?.txHash || '';
    const hashLocal = blockchainData?.hash_local || blockchainData?.hash || '';

    let nombreEstudiante = d.apellidos_nombres || d.estudiante_nombre || "";
    let ciEstudiante = d.ci || d.estudiante_ci || "S/N";
    let especialidadEstudiante = d.especialidad || "";

    try {
      const usuarios = await userService.getUsers();
      if (Array.isArray(usuarios)) {
        const uEst = usuarios.find(u => 
          String(u.id) === String(estudianteId) || 
          String(u.ci) === String(estudianteId) || 
          String(u.username) === String(estudianteId)
        );

        if (uEst) {
          const nom = uEst.nombre || "";
          const ape = uEst.apellido || "";
          nombreEstudiante = `${nom} ${ape}`.trim().toUpperCase();
          ciEstudiante = uEst.ci || ciEstudiante;
          especialidadEstudiante = uEst.especialidad || especialidadEstudiante;
        }
      }
    } catch (errUser) {
      console.warn("No se pudo obtener el perfil del usuario desde la API:", errUser);
    }

    const urlPlantilla = "/pdf/2año/plantillaCertificado.pdf";
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

    const MARGIN_LEFT = 60;          
    const MARGIN_RIGHT = 60;         
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT);
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = 665;

    // 1. TÍTULO PRINCIPAL (CENTRADO)
    const t1 = "CERTIFICACIÓN";
    const t1W = fontBold.widthOfTextAtSize(t1, 15);
    page.drawText(t1, { x: CONTENT_CENTER_X - t1W / 2, y: cursorY, size: 15, font: fontBold, color: COLOR_TEXT });
    cursorY -= 22;

    // 2. ENCABEZADO DE ATRIBUCIONES
    const headerWidth = 310;
    const headerX = RIGHT_X - headerWidth;
    const tokensHeader = plainTokens("LA DIRECCIÓN ACADÉMICA Y COORDINACIÓN ACADÉMICA IEPC - PEC DE LA ESCUELA SUPERIOR DE FORMACIÓN DE MAESTRAS Y MAESTROS TECNOLÓGICO Y HUMANÍSTICO EL ALTO, EN USO DE SUS ATRIBUCIONES:", font);

    cursorY = drawJustifiedParagraph(page, tokensHeader, {
      x: headerX,
      y: cursorY,
      maxWidth: headerWidth,
      fontSize: 8.5,
      lineHeight: 11,
      spaceFont: font
    });

    cursorY -= 14;

    // 3. CERTIFICA:
    page.drawText("CERTIFICA:", { x: MARGIN_LEFT, y: cursorY, size: 9.5, font: fontBold, color: COLOR_TEXT });
    cursorY -= 14;

    const codReg = `206-${ciEstudiante}`;

    const tokensCertifica = [
      ...plainTokens("Que el/la estudiante ", font),
      ...boldTokens(nombreEstudiante, fontBold),
      ...plainTokens(" con C.I. ", font),
      ...boldTokens(`${ciEstudiante} L.P.`, fontBold),
      ...plainTokens(", Código: ", font),
      ...boldTokens(codReg, fontBold),
      ...plainTokens(" de la especialidad de ", font),
      ...boldTokens(especialidadEstudiante.toUpperCase(), fontBold),
      ...plainTokens(" de la Escuela Superior de Formación de Maestros Tecnológico y Humanístico El Alto, según registro que cursa en los archivos de la Coordinación Académica de Investigación Educativa y Producción de Conocimientos - Práctica Educativa Comunitaria (IEPC - PEC), se encuentra la documentación:", font)
    ];

    cursorY = drawJustifiedParagraph(page, tokensCertifica, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 8.5,
      lineHeight: 11,
      spaceFont: font
    });

    cursorY -= 8;
    page.drawText("Cuadro Centralizador de Evaluación Anual, con los siguientes datos:", { x: MARGIN_LEFT, y: cursorY, size: 8.5, font, color: COLOR_TEXT });
    cursorY -= 16;

    // 4. TABLA CENTRALIZADORA DE EVALUACIÓN 2DO AÑO
    const tableTop = cursorY;
    const colWidths = [105, 246.65, 65, 75.35];
    const colX = [MARGIN_LEFT];
    for (let i = 0; i < colWidths.length; i++) colX.push(colX[i] + colWidths[i]);

    const tableHeaderH = 16;
    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, tableHeaderH, COLOR_TABLE_HEADER);

    const seccionText = "CENTRALIZADOR DE LA EVALUACIÓN";
    const wHeaderMain = fontBold.widthOfTextAtSize(seccionText, 9);
    page.drawText(seccionText, {
      x: CONTENT_CENTER_X - wHeaderMain / 2,
      y: tableTop - 11,
      size: 9,
      font: fontBold,
      color: COLOR_TEXT,
    });

    let currentY = tableTop - tableHeaderH;

    const subHeaderH = 18;
    fillRect(page, MARGIN_LEFT, currentY, CONTENT_WIDTH, subHeaderH, COLOR_TABLE_HEADER);

    const subHeaders = [
      { text: "ETAPA", col: 0, size: 8 },
      { text: "ACTIVIDADES", col: 1, size: 8 },
      { text: "FICHA", col: 2, size: 8 },
      { text: "PUNTAJE", col: 3, size: 8 },
    ];

    subHeaders.forEach(({ text, col, size }) => {
      const lw = fontBold.widthOfTextAtSize(text, size);
      page.drawText(text, {
        x: colX[col] + colWidths[col] / 2 - lw / 2,
        y: currentY - 12,
        size,
        font: fontBold,
        color: COLOR_TEXT,
      });
    });

    currentY -= subHeaderH;
    const hLinesToDraw = [tableTop, tableTop - tableHeaderH, currentY];

    let etapaInfoCurrent = null;
    let fichaInfoCurrent = null;
    let notaInfoCurrent = null;

    FILAS_CENTRALIZADOR.forEach((row, rowIndex) => {
      const rowTop = currentY;

      const actLines = wrapTextToLines(row.actividad, fontBold, colWidths[1] - 10, 7.5);
      let rowH = Math.max(actLines.length * 8.5 + 8, 20);

      if (rowIndex === FILAS_CENTRALIZADOR.length - 1) {
        rowH = Math.max(rowH, 38);
      }

      let ay = rowTop - 10;
      actLines.forEach((al) => {
        page.drawText(al, { x: colX[1] + 5, y: ay, size: 7.5, font: fontBold, color: COLOR_TEXT });
        ay -= 8.5;
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
          const fw = fontBold.widthOfTextAtSize(fichaInfoCurrent.text, 8);
          page.drawText(fichaInfoCurrent.text, {
            x: colX[2] + colWidths[2] / 2 - fw / 2,
            y: fTop - fH / 2 - 3,
            size: 8,
            font: fontBold,
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
            const sw = fontBold.widthOfTextAtSize(notaInfoCurrent.text, 8);
            page.drawText(notaInfoCurrent.text, {
              x: colX[3] + colWidths[3] / 2 - sw / 2,
              y: nTop - nH / 2 - 3,
              size: 8,
              font: fontBold,
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

          const eLines = etapaInfoCurrent.text.split("\n");
          const lineHeight = 8.5;
          const totalTextH = eLines.length * lineHeight;
          let ey = eTop - (eH / 2) + (totalTextH / 2) - (lineHeight / 2);

          eLines.forEach((el) => {
            const elw = fontBold.widthOfTextAtSize(el, 7);
            page.drawText(el, {
              x: colX[0] + colWidths[0] / 2 - elw / 2,
              y: ey,
              size: 7,
              font: fontBold,
              color: COLOR_TEXT,
            });
            ey -= lineHeight;
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

      if (rowIndex === 1 || rowIndex === 5) {
        hLine(page, colX[0], colX[1], currentY);
      }
    });

    hLinesToDraw.push(currentY);

    // PROMEDIO FINAL
    const promFinalTop = currentY;
    const promLabel = "PROMEDIO FINAL";
    const promLabelW = fontBold.widthOfTextAtSize(promLabel, 8.5);

    page.drawText(promLabel, { x: colX[3] - promLabelW - 12, y: promFinalTop - 12, size: 8.5, font: fontBold, color: COLOR_TEXT });

    const pStr = formatNotaEntero(d.promedio_numeral);
    if (pStr) {
      const pw = fontBold.widthOfTextAtSize(pStr, 8.5);
      page.drawText(pStr, { x: colX[3] + colWidths[3] / 2 - pw / 2, y: promFinalTop - 12, size: 8.5, font: fontBold, color: COLOR_TEXT });
    }

    currentY -= 18;
    hLinesToDraw.push(currentY);

    // PROMEDIO LITERAL
    const literalTop = currentY;
    const litLabel = "Promedio literal:";
    const litLabelW = fontBold.widthOfTextAtSize(litLabel, 8);

    page.drawText(litLabel, { x: colX[3] - litLabelW - 12, y: literalTop - 14, size: 8, font: fontBold, color: COLOR_TEXT });

    const litValClean = numeroALiteralEntero(d.promedio_numeral);
    const litLines = wrapTextToLines(litValClean, fontBold, colWidths[3] - 8, 8.5);

    let litY = literalTop - 11;
    litLines.forEach((lLine) => {
      const lw = fontBold.widthOfTextAtSize(lLine, 8.5);
      page.drawText(lLine, {
        x: colX[3] + colWidths[3] / 2 - lw / 2,
        y: litY,
        size: 8.5,
        font: fontBold,
        color: COLOR_TEXT,
      });
      litY -= 10;
    });

    currentY = litY - 6;
    hLinesToDraw.push(currentY);

    const tableBottom = currentY;

    // BORDES Y LÍNEAS DE LA TABLA
    hLinesToDraw.forEach((y) => hLine(page, MARGIN_LEFT, RIGHT_X, y));
    vLine(page, colX[0], tableTop, tableBottom);
    vLine(page, colX[1], tableTop - tableHeaderH, promFinalTop);
    vLine(page, colX[2], tableTop - tableHeaderH, promFinalTop);
    vLine(page, colX[3], tableTop - tableHeaderH, tableBottom);
    vLine(page, RIGHT_X, tableTop, tableBottom);

    cursorY = tableBottom - 15;

    // 5. LUGAR Y FECHA
    const ciudad = d.lugar_ciudad || "El Alto";
    const dia = d.dia || "21";
    const mes = d.mes || "septiembre";
    const ano = String(d.ano || "2026").slice(0, 4);

    const txtLF = `Lugar y fecha: ${ciudad}, ${dia} de ${mes} de ${ano}`;
    const wLF = font.widthOfTextAtSize(txtLF, 8.5);
    page.drawText(txtLF, { x: CONTENT_CENTER_X - wLF / 2, y: cursorY, size: 8.5, font, color: COLOR_TEXT });

    cursorY -= 14;
    page.drawText("Fuente: Archivos de Coordinación Académica IEPC-PEC", { x: MARGIN_LEFT, y: cursorY, size: 7.5, font, color: COLOR_TEXT });

    cursorY -= 18;

    // 6. PÁRRAFO DE APROBACIÓN FINAL JUSTIFICADO
    const tokensAprob = [
      ...plainTokens("Por lo tanto, el/la estudiante cuenta con la ", font),
      ...boldTokens("APROBACIÓN", fontBold),
      ...plainTokens(` en la Investigación Educativa y Producción de Conocimientos - Práctica Educativa Comunitaria (IEPC - PEC) en fase anual de la gestión académica ${ano}, que cursa en los archivos institucionales.`, font)
    ];

    cursorY = drawJustifiedParagraph(page, tokensAprob, {
      x: MARGIN_LEFT,
      y: cursorY,
      maxWidth: CONTENT_WIDTH,
      fontSize: 8.5,
      lineHeight: 11,
      spaceFont: font
    });

    cursorY -= 12;

    // 7. PIE Y FIRMAS
    page.drawText("Es cuanto se certifica para fines consiguientes del(a) interesado(a).", { x: MARGIN_LEFT, y: cursorY, size: 8.5, font, color: COLOR_TEXT });

    const fechaActualStr = `El Alto, ${new Date().getDate()} de ${new Date().toLocaleString("es-BO", { month: "long" })} de ${new Date().getFullYear()}`;
    page.drawText(fechaActualStr, { x: MARGIN_LEFT + CONTENT_WIDTH - font.widthOfTextAtSize(fechaActualStr, 8.5), y: cursorY, size: 8.5, font, color: COLOR_TEXT });

    cursorY -= 50;

    const sigLineW = 160;
    const startSigX = CONTENT_CENTER_X - sigLineW / 2;
    const endSigX = CONTENT_CENTER_X + sigLineW / 2;

    page.drawLine({ start: { x: startSigX, y: cursorY }, end: { x: endSigX, y: cursorY }, thickness: 0.8, dashArray: [1.5, 1.5], color: COLOR_TEXT });

    page.drawText("Lic. José Paucar Caya", { x: CONTENT_CENTER_X - fontBold.widthOfTextAtSize("Lic. José Paucar Caya", 8.5) / 2, y: cursorY - 10, size: 8.5, font: fontBold, color: COLOR_TEXT });
    page.drawText("COORDINADOR ACADÉMICO IEPC-PEC", { x: CONTENT_CENTER_X - fontBold.widthOfTextAtSize("COORDINADOR ACADÉMICO IEPC-PEC", 7.5) / 2, y: cursorY - 19, size: 7.5, font: fontBold, color: COLOR_TEXT });
    page.drawText("E.S.F.M.T.H. EL ALTO", { x: CONTENT_CENTER_X - fontBold.widthOfTextAtSize("E.S.F.M.T.H. EL ALTO", 7.5) / 2, y: cursorY - 27, size: 7.5, font: fontBold, color: COLOR_TEXT });

    // CÓDIGO PDF417 BLOCKCHAIN EN EL LADO INFERIOR IZQUIERDO
    const pdf417X = MARGIN_LEFT;
    const pdf417Y = 50;
    const pdf417Width = 180;
    const pdf417Height = 40;

    const txHashValido = txHash || hashLocal || estudianteId;
    const pdf417TextData = `ESTUDIANTE:${nombreEstudiante}|TX_HASH:${txHashValido}|HASH_LOCAL:${hashLocal || "NO_DISPONIBLE"}`;

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
    console.error("Error al generar PDF del Certificado de 2do Año:", error);
    return { success: false, message: `Error al procesar el PDF: ${error.message}` };
  }
};