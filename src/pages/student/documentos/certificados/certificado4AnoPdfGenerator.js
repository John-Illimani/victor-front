import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { PDF417 } from "pdf417-generator";
import { centralizador4toAnoService } from "../../../../services/fichas/4año/centralizador4toAnoService";
import { userService } from "../../../../services/userService";

const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_BORDER = rgb(0, 0, 0);
const COLOR_TABLE_HEADER = rgb(230 / 255, 230 / 255, 230 / 255);

const BORDER = 0.8;

function formatNumero(val) {
  if (val === undefined || val === null || val === '') return '';
  const num = parseFloat(val);
  if (isNaN(num)) return '';
  if (Number.isInteger(num)) {
    return String(num);
  }
  return String(parseFloat(num.toFixed(2)));
}

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

function wrapText(text, fontObj, fontSize, maxWidth) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = "";

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = fontObj.widthOfTextAtSize(testLine, fontSize);

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

export const imprimirCertificado4toAno = async (estudianteId, blockchainData = {}) => {
  try {
    const response = await centralizador4toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha Centralizadora de 4to Año."
      };
    }

    const d = response.datos;

    const txHash = blockchainData?.tx_hash || blockchainData?.txHash || '';
    const hashLocal = blockchainData?.hash_local || blockchainData?.hash || '';

    let nombreEstudiante = d.integrante_ectg || d.apellidos_nombres || "";
    let ciEstudiante = d.ci || "S/N";
    let especialidadEstudiante = d.especialidad || "";

    try {
      const usuariosRes = await userService.getUsers();
      const listaUsuarios = Array.isArray(usuariosRes) ? usuariosRes : (usuariosRes.datos || []);
      const uEst = listaUsuarios.find(u => 
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
    } catch (err) {
      console.warn("No se pudo obtener el perfil de usuario:", err);
    }

    const urlPlantilla = encodeURI('/pdf/4año/plantillaCertificado.pdf');
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

    const codReg = `406-${ciEstudiante}`;

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
    cursorY -= 14;

    const parseNum = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
    const nA1 = parseNum(d.nota_a1);
    const nA2 = parseNum(d.nota_a2);
    const nB1 = parseNum(d.nota_b1);
    const nB4 = parseNum(d.nota_b4);
    const nB5 = parseNum(d.nota_b5);
    const nB6 = parseNum(d.nota_b6);
    const nB7 = parseNum(d.nota_b7);
    const nC1 = parseNum(d.nota_c1);
    const nC2 = parseNum(d.nota_c2);

    const promParcialEtapa12 = (nA1 + nA2 + nB1 + nB4 + nB5 + nB6 + nB7) / 7;
    const promSocializacionC1C2 = (nC1 + nC2) / 2;

    // 4. ESTRUCTURA DE LA TABLA CENTRALIZADORA DE 4TO AÑO
    const colW = [75, 105, 110, 113.65, 88.35];
    let cX = [MARGIN_LEFT];
    for (let i = 0; i < colW.length; i++) {
      cX.push(cX[i] + colW[i]);
    }

    const tableTop = cursorY;
    const tableHeaderH = 18;

    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, tableHeaderH, COLOR_TABLE_HEADER);
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop - tableHeaderH);

    const headers = [
      { text: "Etapa", x: cX[0] + 24 },
      { text: "Actividad", x: cX[1] + 32 },
      { text: "Indicador", x: cX[2] + 35 },
      { text: "Instrumento", x: cX[3] + 30 },
      { text: "Puntaje", x: cX[4] + 25 }
    ];

    headers.forEach(h => {
      page.drawText(h.text, { x: h.x, y: tableTop - 12, size: 8, font: fontBold, color: COLOR_TEXT });
    });

    for (let c = 0; c < cX.length; c++) {
      vLine(page, cX[c], tableTop, tableTop - tableHeaderH);
    }

    let currentY = tableTop - tableHeaderH;

    const drawRowDynamic = (actText, indText, instText, puntajeVal) => {
      const aLines = wrapText(actText, font, 7, colW[1] - 8);
      const iLines = wrapText(indText, font, 7, colW[2] - 8);
      const instLines = wrapText(instText, font, 7, colW[3] - 8);

      const maxLines = Math.max(aLines.length, iLines.length, instLines.length, 1);
      const rH = Math.max(22, maxLines * 9.5 + 8);
      const nextY = currentY - rH;

      hLine(page, cX[1], RIGHT_X, nextY);

      let aY = currentY - 11;
      aLines.forEach(l => {
        page.drawText(l, { x: cX[1] + 4, y: aY, size: 7, font, color: COLOR_TEXT });
        aY -= 9;
      });

      let iY = currentY - 11;
      iLines.forEach(l => {
        page.drawText(l, { x: cX[2] + 4, y: iY, size: 7, font, color: COLOR_TEXT });
        iY -= 9;
      });

      let instY = currentY - 11;
      instLines.forEach(l => {
        page.drawText(l, { x: cX[3] + 4, y: instY, size: 7, font, color: COLOR_TEXT });
        instY -= 9;
      });

      const pStr = formatNumero(puntajeVal);
      const wP = fontBold.widthOfTextAtSize(pStr, 8);
      page.drawText(pStr, { x: cX[4] + (colW[4] / 2) - (wP / 2), y: currentY - (rH / 2) - 3, size: 8, font: fontBold, color: COLOR_TEXT });

      for (let c = 1; c < cX.length; c++) {
        vLine(page, cX[c], currentY, nextY);
      }

      currentY = nextY;
      return rH;
    };

    // ETAPA 1
    const stage1TopY = currentY;
    let stage1H = 0;
    stage1H += drawRowDynamic("Técnicas e instrumentos de investigación.", "Desempeño en el proceso de la PEC.", "Ficha A-1", nA1);
    stage1H += drawRowDynamic("Elaboración de planes de desarrollo curricular (PDC).", "PDC elaborados por cada integrante.", "Ficha A-2", nA2);

    hLine(page, MARGIN_LEFT, cX[1], currentY);
    vLine(page, cX[0], stage1TopY, currentY);

    const e1Lines = wrapText("Planificación y organización", fontBold, 7.5, colW[0] - 6);
    let e1Y = stage1TopY - (stage1H / 2) + ((e1Lines.length * 9) / 2) - 4;
    e1Lines.forEach(l => {
      const wL = fontBold.widthOfTextAtSize(l, 7.5);
      page.drawText(l, { x: cX[0] + (colW[0] / 2) - (wL / 2), y: e1Y, size: 7.5, font: fontBold, color: COLOR_TEXT });
      e1Y -= 9;
    });

    // ETAPA 2
    const stage2TopY = currentY;
    let stage2H = 0;
    stage2H += drawRowDynamic("Control de asistencia de la práctica educativa comunitaria (PEC).", "Control de asistencia, faltas y atrasos.", "Ficha B-1", nB1);
    stage2H += drawRowDynamic("Concreción curricular", "Desarrollo de PDC y de la clase comunitaria.", "Ficha B-4 (Promedio B-2, B-3)", nB4);
    stage2H += drawRowDynamic("Seguimiento y apoyo", "Del docente guía.", "Fichas B-5", nB5);
    stage2H += drawRowDynamic("", "Del docente tutor.", "Fichas B-6", nB6);
    stage2H += drawRowDynamic("Socialización del Diagnóstico socioparticipativo de la UE/CEA/CEE.", "Presentación de resultados del diagnóstico", "Ficha B-7", nB7);

    hLine(page, MARGIN_LEFT, cX[1], currentY);
    vLine(page, cX[0], stage2TopY, currentY);

    const e2Lines = wrapText("Ejecución", fontBold, 7.5, colW[0] - 6);
    let e2Y = stage2TopY - (stage2H / 2) + ((e2Lines.length * 9) / 2) - 4;
    e2Lines.forEach(l => {
      const wL = fontBold.widthOfTextAtSize(l, 7.5);
      page.drawText(l, { x: cX[0] + (colW[0] / 2) - (wL / 2), y: e2Y, size: 7.5, font: fontBold, color: COLOR_TEXT });
      e2Y -= 9;
    });

    // FILA PROMEDIO PARCIAL
    const subtotalH = 16;
    fillRect(page, cX[0], currentY, CONTENT_WIDTH, subtotalH, COLOR_TABLE_HEADER);
    hLine(page, MARGIN_LEFT, RIGHT_X, currentY - subtotalH);

    const txtSub = "CALIFICACION PROMEDIO PARCIAL";
    const wSub = fontBold.widthOfTextAtSize(txtSub, 7.5);
    page.drawText(txtSub, { x: cX[3] - wSub - 12, y: currentY - 11, size: 7.5, font: fontBold, color: COLOR_TEXT });

    const strPromParcial1 = formatNumero(promParcialEtapa12);
    const wPP1 = fontBold.widthOfTextAtSize(strPromParcial1, 8.5);
    page.drawText(strPromParcial1, { x: cX[4] + (colW[4] / 2) - (wPP1 / 2), y: currentY - 11, size: 8.5, font: fontBold, color: COLOR_TEXT });

    vLine(page, cX[0], currentY, currentY - subtotalH);
    vLine(page, cX[4], currentY, currentY - subtotalH);
    vLine(page, cX[5], currentY, currentY - subtotalH);

    currentY -= subtotalH;

    // ETAPA 3
    const stage3TopY = currentY;
    let stage3H = 0;
    stage3H += drawRowDynamic("Evaluación del Documento del Diseño Metodológico por la/el docente tutor/a acompañante.", "Evaluación del documento", "Ficha C-1", nC1);
    stage3H += drawRowDynamic("Socialización del Diseño Metodológico - Comisión Comunitaria de Evaluación.", "Exposición y controversia", "Ficha C-2", nC2);

    hLine(page, MARGIN_LEFT, cX[1], currentY);
    vLine(page, cX[0], stage3TopY, currentY);

    const e3Lines = wrapText("Socialización", fontBold, 7.5, colW[0] - 6);
    let e3Y = stage3TopY - (stage3H / 2) + ((e3Lines.length * 9) / 2) - 4;
    e3Lines.forEach(l => {
      const wL = fontBold.widthOfTextAtSize(l, 7.5);
      page.drawText(l, { x: cX[0] + (colW[0] / 2) - (wL / 2), y: e3Y, size: 7.5, font: fontBold, color: COLOR_TEXT });
      e3Y -= 9;
    });

    // FILA PROMEDIO FINAL
    const totalH = 16;
    fillRect(page, cX[0], currentY, CONTENT_WIDTH, totalH, COLOR_TABLE_HEADER);
    hLine(page, MARGIN_LEFT, RIGHT_X, currentY - totalH);

    const txtProm = "CALIFICACION PROMEDIO FINAL";
    const wProm = fontBold.widthOfTextAtSize(txtProm, 7.5);
    page.drawText(txtProm, { x: cX[3] - wProm - 12, y: currentY - 11, size: 7.5, font: fontBold, color: COLOR_TEXT });

    const promFinalVal = formatNumero(promSocializacionC1C2);
    const wPF = fontBold.widthOfTextAtSize(promFinalVal, 8.5);
    page.drawText(promFinalVal, { x: cX[4] + (colW[4] / 2) - (wPF / 2), y: currentY - 11, size: 8.5, font: fontBold, color: COLOR_TEXT });

    vLine(page, cX[0], currentY, currentY - totalH);
    vLine(page, cX[4], currentY, currentY - totalH);
    vLine(page, cX[5], currentY, currentY - totalH);

    currentY -= totalH;
    cursorY = currentY - 15;

    // 5. LUGAR Y FECHA
    const ciudad = d.lugar_ciudad || "El Alto";
    const dia = d.dia || "21";
    const mes = d.mes || "septiembre";
    const ano = String(d.ano || "2026").slice(0, 4);

    const txtLugarLabel = "Lugar y fecha: ";
    const txtLugarValor = `${ciudad}, ${dia} de ${mes} de ${ano}`;

    const wLabelLF = font.widthOfTextAtSize(txtLugarLabel, 8.5);
    const wValLF = fontBold.widthOfTextAtSize(txtLugarValor, 8.5);
    const totalLFWidth = wLabelLF + wValLF;
    const startX_LF = CONTENT_CENTER_X - (totalLFWidth / 2);

    page.drawText(txtLugarLabel, { x: startX_LF, y: cursorY, size: 8.5, font, color: COLOR_TEXT });
    page.drawText(txtLugarValor, { x: startX_LF + wLabelLF, y: cursorY, size: 8.5, font: fontBold, color: COLOR_TEXT });

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
    const pdf417Y = 70;
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
    const blob = new Blob([pdfFinalBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, '_blank');
    return { success: true };

  } catch (error) {
    console.error("Error al generar Certificado de 4to Año:", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};