import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { PDF417 } from "pdf417-generator";
import { centralizador1erAnoService } from "../../../../services/fichas/1año/centralizador1erAnoService";
import { userService } from "../../../../services/userService";

const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_BORDER = rgb(0, 0, 0);
const COLOR_TABLE_HEADER = rgb(230 / 255, 230 / 255, 230 / 255);

const plainTokens = (text, font, color) =>
  String(text ?? '').split(/\s+/).filter(Boolean).map((w) => ({ text: w, font, color }));

const boldTokens = (text, fontBold, color) =>
  String(text ?? '').split(/\s+/).filter(Boolean).map((w) => ({ text: w, font: fontBold, color }));

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

function formatNota(val) {
  if (val === undefined || val === null || val === "") return "0";
  const num = parseFloat(val);
  if (isNaN(num)) return "0";
  return String(Math.round(num));
}

function numeroALiteralEntero(num) {
  const n = Math.round(parseFloat(num) || 0);
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

export const imprimirCertificado1erAno = async (estudianteId, blockchainData = {}) => {
  try {
    const response = await centralizador1erAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return { success: false, message: "No existen datos registrados en el Centralizador del 1er Año." };
    }

    const d = response.datos;

    const txHash = blockchainData?.tx_hash || blockchainData?.txHash || '';
    const hashLocal = blockchainData?.hash_local || blockchainData?.hash || '';

    // OBTENER CARNET, ESPECIALIDAD Y NOMBRE COMPLETO DE LA API DE USUARIOS
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

    const urlPlantilla = "/pdf/1ano/plantillaCertificado.pdf";
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

    // 1. TÍTULO PRINCIPAL
    const t1 = "CERTIFICACIÓN";
    const t1W = fontBold.widthOfTextAtSize(t1, 15);
    page.drawText(t1, { x: CONTENT_CENTER_X - t1W / 2, y: cursorY, size: 15, font: fontBold, color: COLOR_TEXT });
    cursorY -= 22;

    // 2. ENCABEZADO DE ATRIBUCIONES (JUSTIFICADO A LA DERECHA)
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

    // PÁRRAFO CERTIFICA JUSTIFICADO CON DATOS Y NOMBRE EN NEGRITA
    const tokensCertifica = [
      ...plainTokens("Que el/la estudiante ", font),
      ...boldTokens(nombreEstudiante, fontBold),
      ...plainTokens(" con C.I. ", font),
      ...boldTokens(`${ciEstudiante} L.P.`, fontBold),
      ...plainTokens(", Código: ", font),
      ...boldTokens(codReg, fontBold),
      ...plainTokens(" de la especialidad de ", font),
      ...boldTokens(especialidadEstudiante.toUpperCase(), fontBold),
      ...plainTokens(" de la Escuela Superior de Formación de Maestras y Maestros Tecnológico y Humanístico El Alto, según registro que cursa en los archivos de la Coordinación Académica de Investigación Educativa y Producción de Conocimientos - Práctica Educativa Comunitaria (IEPC - PEC), se encuentra la documentación:", font)
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

    // 4. TABLA CENTRALIZADORA DE EVALUACIÓN (1ER AÑO)
    const tableTop = cursorY;
    const colW = [237.82, 237.83];
    const colX = [MARGIN_LEFT, MARGIN_LEFT + colW[0], MARGIN_LEFT + CONTENT_WIDTH];

    // Fila 1: Encabezado General
    const hHeader1 = 16;
    page.drawRectangle({ x: MARGIN_LEFT, y: tableTop - hHeader1, width: CONTENT_WIDTH, height: hHeader1, color: COLOR_TABLE_HEADER });
    const txtCentral = "CENTRALIZADOR DE LA EVALUACIÓN";
    const wCent = fontBold.widthOfTextAtSize(txtCentral, 9);
    page.drawText(txtCentral, { x: CONTENT_CENTER_X - wCent / 2, y: tableTop - 11, size: 9, font: fontBold, color: COLOR_TEXT });

    page.drawLine({ start: { x: MARGIN_LEFT, y: tableTop }, end: { x: colX[2], y: tableTop }, thickness: 0.8, color: COLOR_BORDER });
    page.drawLine({ start: { x: MARGIN_LEFT, y: tableTop - hHeader1 }, end: { x: colX[2], y: tableTop - hHeader1 }, thickness: 0.8, color: COLOR_BORDER });

    cursorY = tableTop - hHeader1;

    // Fila 2: Sub-encabezados (FICHAS - PUNTAJE)
    const hHeader2 = 18;
    page.drawRectangle({ x: MARGIN_LEFT, y: cursorY - hHeader2, width: CONTENT_WIDTH, height: hHeader2, color: COLOR_TABLE_HEADER });

    const headersCol = [
      { text: "FICHAS", x: colX[0] + colW[0] / 2 },
      { text: "PUNTAJE", x: colX[1] + colW[1] / 2 },
    ];

    headersCol.forEach((hc) => {
      const wHc = fontBold.widthOfTextAtSize(hc.text, 8);
      page.drawText(hc.text, { x: hc.x - wHc / 2, y: cursorY - 12, size: 8, font: fontBold, color: COLOR_TEXT });
    });

    page.drawLine({ start: { x: MARGIN_LEFT, y: cursorY - hHeader2 }, end: { x: colX[2], y: cursorY - hHeader2 }, thickness: 0.8, color: COLOR_BORDER });
    cursorY -= hHeader2;

    const filasFichas = [
      { label: "F-1", val: d.nota_f1 },
      { label: "F-2", val: d.nota_f2 },
      { label: "F-3", val: d.nota_f3 },
      { label: "F-4", val: d.nota_f4 },
      { label: "F-5", val: d.nota_f5 },
    ];

    filasFichas.forEach((fila) => {
      const rH = 18;
      const rBottom = cursorY - rH;

      page.drawText(fila.label, { x: colX[0] + 15, y: cursorY - 12, size: 8, font: fontBold, color: COLOR_TEXT });

      const notaText = formatNota(fila.val);
      const notaW = fontBold.widthOfTextAtSize(notaText, 8);
      page.drawText(notaText, { x: colX[1] + colW[1] / 2 - notaW / 2, y: cursorY - 12, size: 8, font: fontBold, color: COLOR_TEXT });

      page.drawLine({ start: { x: MARGIN_LEFT, y: rBottom }, end: { x: colX[2], y: rBottom }, thickness: 0.8, color: COLOR_BORDER });
      cursorY = rBottom;
    });

    // PROMEDIO FINAL
    const promNumVal = formatNota(d.promedio_numeral);
    const hProm = 18;
    const promLabel = "PROMEDIO FINAL";
    const promLabelW = fontBold.widthOfTextAtSize(promLabel, 8.5);

    page.drawText(promLabel, { x: colX[1] - promLabelW - 12, y: cursorY - 12, size: 8.5, font: fontBold, color: COLOR_TEXT });

    const promNumW = fontBold.widthOfTextAtSize(promNumVal, 8.5);
    page.drawText(promNumVal, { x: colX[1] + colW[1] / 2 - promNumW / 2, y: cursorY - 12, size: 8.5, font: fontBold, color: COLOR_TEXT });

    page.drawLine({ start: { x: MARGIN_LEFT, y: cursorY - hProm }, end: { x: colX[2], y: cursorY - hProm }, thickness: 0.8, color: COLOR_BORDER });
    cursorY -= hProm;

    // PROMEDIO LITERAL
    const litHeight = 22;
    const litLabel = "Promedio literal:";
    const litLabelW = fontBold.widthOfTextAtSize(litLabel, 8);

    page.drawText(litLabel, { x: colX[1] - litLabelW - 12, y: cursorY - 14, size: 8, font: fontBold, color: COLOR_TEXT });

    const literalLimpio = numeroALiteralEntero(d.promedio_numeral);
    const litValW = fontBold.widthOfTextAtSize(literalLimpio, 8.5);

    page.drawText(literalLimpio, { x: colX[1] + colW[1] / 2 - litValW / 2, y: cursorY - 14, size: 8.5, font: fontBold, color: COLOR_TEXT });

    page.drawLine({ start: { x: MARGIN_LEFT, y: cursorY - litHeight }, end: { x: colX[2], y: cursorY - litHeight }, thickness: 0.8, color: COLOR_BORDER });
    cursorY -= litHeight;

    // BORDES VERTICALES DE LA TABLA
    page.drawLine({ start: { x: colX[0], y: tableTop }, end: { x: colX[0], y: cursorY }, thickness: 0.8, color: COLOR_BORDER });
    page.drawLine({ start: { x: colX[1], y: tableTop - hHeader1 }, end: { x: colX[1], y: cursorY }, thickness: 0.8, color: COLOR_BORDER });
    page.drawLine({ start: { x: colX[2], y: tableTop }, end: { x: colX[2], y: cursorY }, thickness: 0.8, color: COLOR_BORDER });

    cursorY -= 15;

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
    const pdf417Y = 100;
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
    console.error("Error al generar PDF del Certificado (1er Año):", error);
    return { success: false, message: `Error al procesar el documento PDF: ${error.message}` };
  }
};