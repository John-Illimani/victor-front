import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { PDF417 } from 'pdf417-generator';
import { centralizador4toAnoService } from '../../../services/fichas/4año/centralizador4toAnoService';
import { userService } from '../../../services/userService';

// PALETA DE COLORES INSTITUCIONALES Y TÉCNICOS
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);            // Dorado (#C9A751)
const COLOR_HEADER_BG = rgb(201 / 255, 167 / 255, 81 / 255);         // Dorado (#C9A751)
const COLOR_BORDER = rgb(0, 0, 0);

const BORDER = 0.8;

function formatNumero(val) {
  if (val === undefined || val === null || val === '') return '';
  const num = parseFloat(val);
  if (isNaN(num)) return '';
  
  if (Number.isInteger(num)) {
    return String(num);
  }
  
  const formatted = num.toFixed(2);
  return String(parseFloat(formatted));
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

// Genera un Canvas HTML para el código PDF417
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

export const imprimirCentralizador4toAno = async (estudianteId, blockchainData = {}) => {
  try {
    const response = await centralizador4toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha Centralizadora."
      };
    }

    const d = response.datos;

    const txHash = blockchainData?.tx_hash || blockchainData?.txHash || '';
    const hashLocal = blockchainData?.hash_local || blockchainData?.hash || '';

    // OBTENER Y MAPEAR EL NOMBRE DEL TUTOR DESDE LA API DE USUARIOS
    let tutorNombre = "";
    if (d.docente_tutor_id) {
      try {
        const usuariosRes = await userService.getUsers();
        const listaUsuarios = Array.isArray(usuariosRes) ? usuariosRes : (usuariosRes.datos || []);
        const tutorObj = listaUsuarios.find(u => String(u.id) === String(d.docente_tutor_id));
        if (tutorObj) {
          tutorNombre = `${tutorObj.nombre || ''} ${tutorObj.apellido || ''}`.trim().toUpperCase();
        }
      } catch (err) {
        console.warn("No se pudo obtener la lista de usuarios para el tutor:", err);
      }
    }

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

    pdfDoc.registerFontkit(fontkit);

    let page = pdfDoc.getPages()[0];
    page.setSize(612, 792); // Formato Carta
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

    const MARGIN_TOP = 141.73;          
    const MARGIN_LEFT = 85.04;          
    const MARGIN_RIGHT = 51.31;         
    const MARGIN_BOTTOM = 141.73;       
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT);
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // 1. TÍTULO PRINCIPAL
    const title = "FICHA CENTRALIZADORA DE EVALUACIÓN";
    const wT = fontBold.widthOfTextAtSize(title, 13);
    page.drawText(title, { x: CONTENT_CENTER_X - wT / 2, y: cursorY, size: 13, font: fontBold, color: COLOR_TITLE });
    cursorY -= 20;

    // 2. DATOS REFERENCIALES EN LÍNEAS SEPARADAS
    page.drawText("DATOS REFERENCIALES:", { x: MARGIN_LEFT, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    cursorY -= 15;

    // Docente Tutor/a
    const lblTutor = "Docente Tutor/a Acompañante: ";
    const wLblTutor = font.widthOfTextAtSize(lblTutor, 8.5);
    page.drawText(lblTutor, { x: MARGIN_LEFT, y: cursorY, size: 8.5, font, color: COLOR_TEXT });
    page.drawText(tutorNombre, { x: MARGIN_LEFT + wLblTutor, y: cursorY, size: 8.5, font: fontBold, color: COLOR_TEXT });
    drawDottedLine(page, MARGIN_LEFT + wLblTutor, RIGHT_X, cursorY - 2);
    cursorY -= 15;

    // Integrante del ECTG
    const integranteNombre = d.integrante_ectg || "";
    const lblInt = "Integrante del ECTG: ";
    const wLblInt = font.widthOfTextAtSize(lblInt, 8.5);
    page.drawText(lblInt, { x: MARGIN_LEFT, y: cursorY, size: 8.5, font, color: COLOR_TEXT });
    page.drawText(integranteNombre, { x: MARGIN_LEFT + wLblInt, y: cursorY, size: 8.5, font: fontBold, color: COLOR_TEXT });
    drawDottedLine(page, MARGIN_LEFT + wLblInt, RIGHT_X, cursorY - 2);
    cursorY -= 15;

    // Especialidad
    const especialidadNombre = d.especialidad || "";
    const lblEsp = "Especialidad: ";
    const wLblEsp = font.widthOfTextAtSize(lblEsp, 8.5);
    page.drawText(lblEsp, { x: MARGIN_LEFT, y: cursorY, size: 8.5, font, color: COLOR_TEXT });
    page.drawText(especialidadNombre, { x: MARGIN_LEFT + wLblEsp, y: cursorY, size: 8.5, font: fontBold, color: COLOR_TEXT });
    drawDottedLine(page, MARGIN_LEFT + wLblEsp, RIGHT_X, cursorY - 2);
    cursorY -= 20;

    // CÁLCULO DINÁMICO DE PROMEDIOS
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

    // 3. ESTRUCTURA DE LA TABLA CENTRALIZADORA
    const colW = [90, 105.65, 110, 115, 55];
    let cX = [MARGIN_LEFT];
    for (let i = 0; i < colW.length; i++) {
      cX.push(cX[i] + colW[i]);
    }

    const tableTop = cursorY;
    const tableHeaderH = 18;

    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, tableHeaderH, COLOR_HEADER_BG);
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop);
    hLine(page, MARGIN_LEFT, RIGHT_X, tableTop - tableHeaderH);

    const headers = [
      { text: "Etapa", x: cX[0] + 30 },
      { text: "Actividad", x: cX[1] + 32 },
      { text: "Indicador", x: cX[2] + 35 },
      { text: "Instrumento", x: cX[3] + 30 },
      { text: "Puntaje", x: cX[4] + 10 }
    ];

    headers.forEach(h => {
      page.drawText(h.text, { x: h.x, y: tableTop - 12, size: 8, font: fontBold, color: COLOR_WHITE });
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

    const e1Lines = wrapText("Planificación y organización", fontBold, 8, colW[0] - 6);
    let e1Y = stage1TopY - (stage1H / 2) + ((e1Lines.length * 10) / 2) - 4;
    e1Lines.forEach(l => {
      page.drawText(l, { x: cX[0] + 4, y: e1Y, size: 8, font: fontBold, color: COLOR_TEXT });
      e1Y -= 10;
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

    const e2Lines = wrapText("Ejecución", fontBold, 8, colW[0] - 6);
    let e2Y = stage2TopY - (stage2H / 2) + ((e2Lines.length * 10) / 2) - 4;
    e2Lines.forEach(l => {
      page.drawText(l, { x: cX[0] + 4, y: e2Y, size: 8, font: fontBold, color: COLOR_TEXT });
      e2Y -= 10;
    });

    // FILA PROMEDIO PARCIAL
    const subtotalH = 18;
    fillRect(page, cX[0], currentY, CONTENT_WIDTH, subtotalH, COLOR_HEADER_BG);
    hLine(page, MARGIN_LEFT, RIGHT_X, currentY - subtotalH);

    const txtSub = "CALIFICACION PROMEDIO FINAL";
    const wSub = fontBold.widthOfTextAtSize(txtSub, 7.5);
    page.drawText(txtSub, { x: cX[0] + (CONTENT_WIDTH - colW[4]) / 2 - wSub / 2, y: currentY - 12, size: 7.5, font: fontBold, color: COLOR_WHITE });

    const strPromParcial1 = formatNumero(promParcialEtapa12);
    const wPP1 = fontBold.widthOfTextAtSize(strPromParcial1, 8.5);
    page.drawText(strPromParcial1, { x: cX[4] + (colW[4] / 2) - (wPP1 / 2), y: currentY - 12, size: 8.5, font: fontBold, color: COLOR_WHITE });

    vLine(page, MARGIN_LEFT, currentY, currentY - subtotalH);
    vLine(page, RIGHT_X, currentY, currentY - subtotalH);

    currentY -= subtotalH;

    // ETAPA 3
    const stage3TopY = currentY;
    let stage3H = 0;
    stage3H += drawRowDynamic("Evaluación del Documento del Diseño Metodológico por la/el docente tutor/a acompañante.", "Evaluación del documento", "Ficha C-1", nC1);
    stage3H += drawRowDynamic("Socialización del Diseño Metodológico - Comisión Comunitaria de Evaluación.", "Exposición y controversia", "Ficha C-2", nC2);

    hLine(page, MARGIN_LEFT, cX[1], currentY);
    vLine(page, cX[0], stage3TopY, currentY);

    const e3Lines = wrapText("Socialización", fontBold, 8, colW[0] - 6);
    let e3Y = stage3TopY - (stage3H / 2) + ((e3Lines.length * 10) / 2) - 4;
    e3Lines.forEach(l => {
      page.drawText(l, { x: cX[0] + 4, y: e3Y, size: 8, font: fontBold, color: COLOR_TEXT });
      e3Y -= 10;
    });

    // FILA PROMEDIO FINAL
    const totalH = 18;
    fillRect(page, cX[0], currentY, CONTENT_WIDTH, totalH, COLOR_HEADER_BG);
    hLine(page, MARGIN_LEFT, RIGHT_X, currentY - totalH);

    const txtProm = "CALIFICACION PROMEDIO FINAL";
    const wProm = fontBold.widthOfTextAtSize(txtProm, 8);
    page.drawText(txtProm, { x: cX[0] + (CONTENT_WIDTH - colW[4]) / 2 - wProm / 2, y: currentY - 12, size: 8, font: fontBold, color: COLOR_WHITE });

    const promFinalVal = formatNumero(promSocializacionC1C2);
    const wPF = fontBold.widthOfTextAtSize(promFinalVal, 8.5);
    page.drawText(promFinalVal, { x: cX[4] + (colW[4] / 2) - (wPF / 2), y: currentY - 12, size: 8.5, font: fontBold, color: COLOR_WHITE });

    vLine(page, MARGIN_LEFT, currentY, currentY - totalH);
    vLine(page, RIGHT_X, currentY, currentY - totalH);

    currentY -= totalH;
    cursorY = currentY - 15;

    // PROMEDIO LITERAL
    const promLiteral = d.promedio_literal || "CERO CON 00/100";
    const lblLit = "Calificación Promedio Final en Letras: ";
    const wLblLit = font.widthOfTextAtSize(lblLit, 8.5);
    page.drawText(lblLit, { x: MARGIN_LEFT, y: cursorY, size: 8.5, font, color: COLOR_TEXT });
    page.drawText(promLiteral, { x: MARGIN_LEFT + wLblLit, y: cursorY, size: 8.5, font: fontBold, color: COLOR_TEXT });
    drawDottedLine(page, MARGIN_LEFT + wLblLit, RIGHT_X, cursorY - 2);

    cursorY -= 25;

    // 4. LUGAR Y FECHA
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
    drawDottedLine(page, startX_LF + wLabelLF, startX_LF + totalLFWidth, cursorY - 2);

    cursorY -= 45;

    if (cursorY < MARGIN_BOTTOM) {
      page = pdfDoc.addPage([612, 792]);
      cursorY = pageHeight - MARGIN_TOP - 20;
    }

    // 5. BLOQUE DE FIRMAS
    const sigColWidth = CONTENT_WIDTH / 2;
    const sigLineW = 160;

    const firmas = [
      { 
        label1: "Vo.Bo. Coordinación Académica IEPC-PEC", 
        label2: "o Coordinación de Unidad Académica", 
        xCenter: MARGIN_LEFT + sigColWidth * 0.5 
      },
      { 
        label1: "Docente Tutor(a) UE/CEA/CEE", 
        label2: "", 
        xCenter: MARGIN_LEFT + sigColWidth * 1.5 
      }
    ];

    firmas.forEach((f) => {
      const lineStartX = f.xCenter - sigLineW / 2;
      const lineEndX = f.xCenter + sigLineW / 2;

      drawDottedLine(page, lineStartX, lineEndX, cursorY);

      const wL1 = fontBold.widthOfTextAtSize(f.label1, 8);
      page.drawText(f.label1, {
        x: f.xCenter - wL1 / 2,
        y: cursorY - 11,
        size: 8,
        font: fontBold,
        color: COLOR_TEXT,
      });

      if (f.label2) {
        const wL2 = fontBold.widthOfTextAtSize(f.label2, 8);
        page.drawText(f.label2, {
          x: f.xCenter - wL2 / 2,
          y: cursorY - 20,
          size: 8,
          font: fontBold,
          color: COLOR_TEXT,
        });
      }
    });

    // -------------------------------------------------------------------------
    // 6. CÓDIGO PDF417 BLOCKCHAIN (POSICIÓN ELEVADA)
    // -------------------------------------------------------------------------
    const pdf417X = MARGIN_LEFT;
    const pdf417Y = 80;
    const pdf417Width = 200;
    const pdf417Height = 45;

    const txHashValido = txHash || hashLocal || estudianteId;
    const pdf417TextData = `ESTUDIANTE:${integranteNombre}|TX_HASH:${txHashValido}|HASH_LOCAL:${hashLocal || "NO_DISPONIBLE"}`;

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
    console.error("Error al generar PDF de la Ficha Centralizadora (4to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};