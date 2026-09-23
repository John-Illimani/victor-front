import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { PDF417 } from "pdf417-generator";
import { centralizador5toAnoService } from "../../../../services/fichas/5año/centralizador5toAnoService";
import { userService } from "../../../../services/userService";

const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_BORDER = rgb(0, 0, 0);
const COLOR_TABLE_HEADER = rgb(230 / 255, 230 / 255, 230 / 255);

const BORDER = 0.8;

function formatEnteroEstricto(val) {
  if (val === undefined || val === null || val === '') return '';
  const num = parseFloat(val);
  if (isNaN(num)) return '';
  return String(Math.round(num));
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

export const imprimirCertificado5toAno = async (estudianteId, blockchainData = {}) => {
  try {
    const response = await centralizador5toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para el Centralizador de 5to Año."
      };
    }

    const d = response.datos;

    const txHash = blockchainData?.tx_hash || blockchainData?.txHash || '';
    const hashLocal = blockchainData?.hash_local || blockchainData?.hash || '';

    let nombreEstudiante = d.estudiante_nombre || d.apellidos_nombres || "";
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

    const urlPlantilla = encodeURI('/pdf/5año/plantillaCertificado.pdf');
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

    const codReg = `506-${ciEstudiante}`;

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
    cursorY -= 14;

    // 4. ESTRUCTURA DE LA TABLA CENTRALIZADORA DE 5TO AÑO
    const colW = [75, 85, 182.65, 104.35, 45];
    let cX = [MARGIN_LEFT];
    for (let i = 0; i < colW.length; i++) cX.push(cX[i] + colW[i]);

    // FILA SUPERIOR: EVALUACIÓN DE LA PEC
    const secTopY = cursorY;
    const secH = 16;
    fillRect(page, MARGIN_LEFT, secTopY, CONTENT_WIDTH, secH, COLOR_TABLE_HEADER);
    hLine(page, MARGIN_LEFT, RIGHT_X, secTopY);
    hLine(page, MARGIN_LEFT, RIGHT_X, secTopY - secH);
    vLine(page, MARGIN_LEFT, secTopY, secTopY - secH);
    vLine(page, RIGHT_X, secTopY, secTopY - secH);

    const txtSecHeader = "EVALUACIÓN DE LA PEC";
    page.drawText(txtSecHeader, { x: CONTENT_CENTER_X - (fontBold.widthOfTextAtSize(txtSecHeader, 8.5) / 2), y: secTopY - 11, size: 8.5, font: fontBold, color: COLOR_TEXT });

    cursorY -= secH;

    // SEGUNDA FILA: CABECERAS DE COLUMNAS
    const headTopY = cursorY;
    const headH = 16;
    fillRect(page, MARGIN_LEFT, headTopY, CONTENT_WIDTH, headH, COLOR_TABLE_HEADER);
    hLine(page, MARGIN_LEFT, RIGHT_X, headTopY - headH);

    const headers = ["ETAPA", "ACTIVIDAD", "INDICADOR", "INSTRUMENTO", "PUNTAJE"];
    headers.forEach((hText, idx) => {
      const wH = fontBold.widthOfTextAtSize(hText, 7.5);
      page.drawText(hText, { x: cX[idx] + (colW[idx] / 2) - (wH / 2), y: headTopY - 11, size: 7.5, font: fontBold, color: COLOR_TEXT });
    });

    for (let c = 0; c < cX.length; c++) vLine(page, cX[c], headTopY, headTopY - headH);

    cursorY -= headH;

    const filasPec = [
      { etapa: "Planificación y Organización", actividad: "Elaboración de PDC", indicador: "PDC elaborado por cada integrante del ECTG. La elaboración es comunitaria, pero la valoración es individual, evitando copias y plagios de PDC entre los integrantes del ECTG", instrumento: "Ficha A-1", puntaje: formatEnteroEstricto(d.nota_a1) },
      { etapa: "Ejecución", actividad: "Asistencia regular", indicador: "Control de asistencia regular a la PEC. Se tomará en cuenta ausencias y atrasos.", instrumento: "Ficha B-1", puntaje: formatEnteroEstricto(d.nota_b1) },
      { etapa: "Ejecución", actividad: "Concreción Curricular", indicador: "Implementación individual de cada integrante del ECTG, de un mínimo de 9 PDCs y 1 Clase Comunitaria", instrumento: "Ficha Promedio Final B-4", puntaje: formatEnteroEstricto(d.nota_b4) },
      { etapa: "Ejecución", actividad: "Seguimiento", indicador: "- Apoyo y seguimiento por parte de la/el Docente Guía de la UE/CEA/CEE", instrumento: "Ficha B-5", puntaje: formatEnteroEstricto(d.nota_b5) },
      { etapa: "Ejecución", actividad: "Seguimiento", indicador: "- Apoyo y seguimiento por parte de/el Docente Acompañante", instrumento: "Ficha B-6", puntaje: formatEnteroEstricto(d.nota_b6) }
    ];

    let ejecYStart = 0;
    filasPec.forEach((f, idx) => {
      const indLines = wrapText(f.indicador, font, 7, colW[2] - 8);
      const actLines = wrapText(f.actividad, fontBold, 7.5, colW[1] - 8);
      const insLines = wrapText(f.instrumento, font, 7.5, colW[3] - 8);

      const rH = Math.max(22, indLines.length * 8 + 6, insLines.length * 8 + 6);
      const rowTopY = cursorY;

      if (idx === 1) ejecYStart = rowTopY;

      if (idx === 0 || idx === filasPec.length - 1) {
        hLine(page, MARGIN_LEFT, RIGHT_X, rowTopY - rH);
      } else {
        hLine(page, cX[1], RIGHT_X, rowTopY - rH);
      }

      if (idx === 0) {
        const etLines = wrapText(f.etapa, fontBold, 7.5, colW[0] - 6);
        let yEt = rowTopY - (rH / 2) + ((etLines.length - 1) * 4);
        etLines.forEach(l => {
          page.drawText(l, { x: cX[0] + (colW[0] / 2) - (fontBold.widthOfTextAtSize(l, 7.5) / 2), y: yEt, size: 7.5, font: fontBold, color: COLOR_TEXT });
          yEt -= 8.5;
        });
      }

      let yAct = rowTopY - (rH / 2) + ((actLines.length - 1) * 4);
      actLines.forEach(l => {
        page.drawText(l, { x: cX[1] + (colW[1] / 2) - (fontBold.widthOfTextAtSize(l, 7.5) / 2), y: yAct, size: 7.5, font: fontBold, color: COLOR_TEXT });
        yAct -= 8.5;
      });

      let yInd = rowTopY - 9;
      indLines.forEach(l => {
        page.drawText(l, { x: cX[2] + 4, y: yInd, size: 7, font, color: COLOR_TEXT });
        yInd -= 8;
      });

      let yIns = rowTopY - (rH / 2) + ((insLines.length - 1) * 4);
      insLines.forEach(l => {
        page.drawText(l, { x: cX[3] + (colW[3] / 2) - (font.widthOfTextAtSize(l, 7.5) / 2), y: yIns, size: 7.5, font, color: COLOR_TEXT });
        yIns -= 8.5;
      });

      page.drawText(f.puntaje, { x: cX[4] + (colW[4] / 2) - (fontBold.widthOfTextAtSize(f.puntaje, 8) / 2), y: rowTopY - (rH / 2) - 3, size: 8, font: fontBold, color: COLOR_TEXT });

      for (let c = 1; c < cX.length; c++) vLine(page, cX[c], rowTopY, rowTopY - rH);

      cursorY -= rH;
    });

    vLine(page, cX[0], headTopY - headH, cursorY);
    vLine(page, cX[1], headTopY - headH, cursorY);

    const txtEjec = "Ejecución";
    page.drawText(txtEjec, { x: cX[0] + (colW[0] / 2) - (fontBold.widthOfTextAtSize(txtEjec, 8) / 2), y: ejecYStart - ((ejecYStart - cursorY) / 2) - 3, size: 8, font: fontBold, color: COLOR_TEXT });

    // CALIFICACIÓN PROMEDIO FINAL 1
    const prom1H = 16;
    fillRect(page, cX[0], cursorY, CONTENT_WIDTH, prom1H, COLOR_TABLE_HEADER);
    hLine(page, MARGIN_LEFT, RIGHT_X, cursorY - prom1H);

    const txtProm1 = "CALIFICACIÓN PROMEDIO FINAL 1";
    const wProm1 = fontBold.widthOfTextAtSize(txtProm1, 7.5);
    page.drawText(txtProm1, { x: cX[3] - wProm1 - 12, y: cursorY - 11, size: 7.5, font: fontBold, color: COLOR_TEXT });

    const valProm1 = formatEnteroEstricto(d.promedio_final_1);
    const wValP1 = fontBold.widthOfTextAtSize(valProm1, 8.5);
    page.drawText(valProm1, { x: cX[4] + (colW[4] / 2) - (wValP1 / 2), y: cursorY - 11, size: 8.5, font: fontBold, color: COLOR_TEXT });

    vLine(page, cX[0], cursorY, cursorY - prom1H);
    vLine(page, cX[4], cursorY, cursorY - prom1H);
    vLine(page, cX[5], cursorY, cursorY - prom1H);

    cursorY -= prom1H;

    const filasSoc = [
      { actividad: "Elaboración del Trabajo de Grado", indicador: "Documento del Trabajo de Grado.", instrumento: "Ficha C-1", puntaje: formatEnteroEstricto(d.nota_c1) },
      { actividad: "Socialización Comunitaria.", indicador: "Socialización Comunitaria del Trabajo de Grado", instrumento: "Ficha C-2", puntaje: formatEnteroEstricto(d.nota_c2) }
    ];

    const socYStart = cursorY;
    filasSoc.forEach((f, idx) => {
      const indLines = wrapText(f.indicador, font, 7.5, colW[2] - 8);
      const actLines = wrapText(f.actividad, fontBold, 7.5, colW[1] - 8);

      const rH = Math.max(22, actLines.length * 8.5 + 8, indLines.length * 8.5 + 8);
      const rowTopY = cursorY;

      if (idx === filasSoc.length - 1) {
        hLine(page, MARGIN_LEFT, RIGHT_X, rowTopY - rH);
      } else {
        hLine(page, cX[1], RIGHT_X, rowTopY - rH);
      }

      let yAct = rowTopY - (rH / 2) + ((actLines.length - 1) * 4);
      actLines.forEach(l => {
        page.drawText(l, { x: cX[1] + 4, y: yAct, size: 7.5, font: fontBold, color: COLOR_TEXT });
        yAct -= 8.5;
      });

      let yInd = rowTopY - (rH / 2) + ((indLines.length - 1) * 4);
      indLines.forEach(l => {
        page.drawText(l, { x: cX[2] + 4, y: yInd, size: 7.5, font, color: COLOR_TEXT });
        yInd -= 8.5;
      });

      page.drawText(f.instrumento, { x: cX[3] + (colW[3] / 2) - (font.widthOfTextAtSize(f.instrumento, 7.5) / 2), y: rowTopY - (rH / 2) - 3, size: 7.5, font, color: COLOR_TEXT });
      page.drawText(f.puntaje, { x: cX[4] + (colW[4] / 2) - (fontBold.widthOfTextAtSize(f.puntaje, 8) / 2), y: rowTopY - (rH / 2) - 3, size: 8, font: fontBold, color: COLOR_TEXT });

      for (let c = 1; c < cX.length; c++) vLine(page, cX[c], rowTopY, rowTopY - rH);

      cursorY -= rH;
    });

    vLine(page, cX[0], socYStart, cursorY);
    const txtSoc = "Socialización";
    page.drawText(txtSoc, { x: cX[0] + (colW[0] / 2) - (fontBold.widthOfTextAtSize(txtSoc, 8) / 2), y: socYStart - ((socYStart - cursorY) / 2) - 3, size: 8, font: fontBold, color: COLOR_TEXT });

    // CALIFICACIÓN PROMEDIO FINAL 2
    const prom2H = 16;
    fillRect(page, cX[0], cursorY, CONTENT_WIDTH, prom2H, COLOR_TABLE_HEADER);
    hLine(page, MARGIN_LEFT, RIGHT_X, cursorY - prom2H);

    const txtProm2 = "CALIFICACIÓN PROMEDIO FINAL 2";
    const wProm2 = fontBold.widthOfTextAtSize(txtProm2, 7.5);
    page.drawText(txtProm2, { x: cX[3] - wProm2 - 12, y: cursorY - 11, size: 7.5, font: fontBold, color: COLOR_TEXT });

    const valProm2 = formatEnteroEstricto(d.promedio_final_2);
    const wValP2 = fontBold.widthOfTextAtSize(valProm2, 8.5);
    page.drawText(valProm2, { x: cX[4] + (colW[4] / 2) - (wValP2 / 2), y: cursorY - 11, size: 8.5, font: fontBold, color: COLOR_TEXT });

    vLine(page, cX[0], cursorY, cursorY - prom2H);
    vLine(page, cX[4], cursorY, cursorY - prom2H);
    vLine(page, cX[5], cursorY, cursorY - prom2H);

    cursorY -= prom2H + 15;

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

    // 7. PIE Y FIRMA
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
    console.error("Error al generar PDF del Certificado de 5to Año:", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};