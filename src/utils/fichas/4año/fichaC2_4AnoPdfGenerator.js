import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fichaC24toAnoService } from '../../../services/fichas/4año/fichaC24toAnoService';
import { userService } from '../../../services/userService';

// PALETA DE COLORES INSTITUCIONALES Y TÉCNICOS
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);            // Dorado Institucional (#C9A751)
const COLOR_TABLE_HEADER = rgb(255 / 255, 215 / 255, 165 / 255);     // Naranja Claro Institucional
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

export const imprimirFichaC2_4toAno = async (estudianteId) => {
  try {
    const response = await fichaC24toAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para la Ficha C-2."
      };
    }

    const d = response.datos;
    const integrantes = Array.isArray(d.integrantes) ? d.integrantes : [];

    // Resolver nombre del docente tutor/acompañante si solo se tiene el ID
    let docenteNombre = d.docente_tutor_nombre || "";
    if (!docenteNombre && d.docente_tutor_id) {
      try {
        const usersData = await userService.getUsers();
        const usersList = Array.isArray(usersData) ? usersData : (usersData.usuarios || usersData.data || []);
        const tutorUser = usersList.find(u => u.id === d.docente_tutor_id);
        if (tutorUser) {
          docenteNombre = `${tutorUser.nombre || ""} ${tutorUser.apellido || ""}`.trim();
        }
      } catch (err) {
        console.error("Error al obtener el nombre del docente tutor:", err);
      }
    }

    const urlPlantilla = encodeURI('/pdf/4año/plantilla.pdf');
    let pdfDoc;
    let templatePdfDoc = null;

    try {
      const resFetch = await fetch(urlPlantilla);
      const contentType = resFetch.headers.get("content-type");

      if (resFetch.ok && contentType && contentType.includes("application/pdf")) {
        const pdfBytes = await resFetch.arrayBuffer();
        pdfDoc = await PDFDocument.load(pdfBytes);
        templatePdfDoc = await PDFDocument.load(pdfBytes);
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

    const addNewPage = async () => {
      if (templatePdfDoc && templatePdfDoc.getPageCount() > 0) {
        const [templatePage] = await pdfDoc.copyPages(templatePdfDoc, [0]);
        return pdfDoc.addPage(templatePage);
      } else {
        const p = pdfDoc.addPage([612, 792]);
        return p;
      }
    };

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

    // DIMENSIONES Y MÁRGENES ESTRICTOS (5 cm arriba y abajo)
    const MARGIN_TOP = 141.73;          // 5.0 cm exactos (141.73 pt)
    const MARGIN_LEFT = 85.04;          // 3.0 cm exactos (85.04 pt)
    const MARGIN_RIGHT = 51.31;         // 1.81 cm exactos (51.31 pt)
    const MARGIN_BOTTOM = 141.73;       // 5.0 cm límite inferior de seguridad (5.0 cm)
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt exactos
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // 1. TÍTULOS PRINCIPALES
    const title1 = "FICHA C-2";
    const title2 = "SOCIALIZACIÓN DEL DISEÑO METODOLÓGICO DE IMPLEMENTACIÓN DEL";
    const title3 = "TRABAJO DE GRADO";

    const wT1 = fontBold.widthOfTextAtSize(title1, 12);
    page.drawText(title1, { x: CONTENT_CENTER_X - wT1 / 2, y: cursorY, size: 12, font: fontBold, color: COLOR_TITLE });
    cursorY -= 14;

    const wT2 = fontBold.widthOfTextAtSize(title2, 10);
    page.drawText(title2, { x: CONTENT_CENTER_X - wT2 / 2, y: cursorY, size: 10, font: fontBold, color: COLOR_TITLE });
    cursorY -= 12;

    const wT3 = fontBold.widthOfTextAtSize(title3, 10);
    page.drawText(title3, { x: CONTENT_CENTER_X - wT3 / 2, y: cursorY, size: 10, font: fontBold, color: COLOR_TITLE });
    cursorY -= 14;

    // PÁRRAFO DESCRIPTIVO
    const desc = "La valoración es individual para cada integrante del equipo comunitario de trabajo de grado.";
    page.drawText(desc, { x: MARGIN_LEFT, y: cursorY, size: 8.5, font, color: COLOR_TEXT });
    cursorY -= 12;

    // 2. TABLA 1: DATOS GENERALES SUPERIORES
    const tableHeaderTop = cursorY;
    const labelColWidth = 150;
    const valColWidth = CONTENT_WIDTH - labelColWidth;

    hLine(page, MARGIN_LEFT, RIGHT_X, tableHeaderTop);

    const headerRows = [
      { label: "Integrante del ECTG", value: d.integrante_ectg || "" },
      { label: "Docente Tutor/Acompañante", value: docenteNombre },
      { label: "Modalidad de Graduación", value: d.modalidad_graduacion || "" },
      { label: "Título del Diseño Metodológico", value: d.titulo_diseno_metodologico || "" }
    ];

    headerRows.forEach((row) => {
      const rowHeight = row.label.includes("Título") ? 22 : 16;
      page.drawText(row.label, { x: MARGIN_LEFT + 6, y: cursorY - 11, size: 9, font: fontBold, color: COLOR_TEXT });

      if (row.value) {
        const valLines = wrapText(String(row.value), font, 8.5, valColWidth - 10);
        valLines.forEach((vl, idx) => {
          page.drawText(vl, { x: MARGIN_LEFT + labelColWidth + 6, y: cursorY - 11 - (idx * 9), size: 8.5, font, color: COLOR_TEXT });
        });
      }

      cursorY -= rowHeight;
      hLine(page, MARGIN_LEFT, RIGHT_X, cursorY);
    });

    vLine(page, MARGIN_LEFT, tableHeaderTop, cursorY);
    vLine(page, MARGIN_LEFT + labelColWidth, tableHeaderTop, cursorY);
    vLine(page, RIGHT_X, tableHeaderTop, cursorY);

    cursorY -= 6;

    // 3. TABLA 2: EVALUACIÓN MULTI-ESTUDIANTE
    const w1a = 125; 
    const wEst = (CONTENT_WIDTH - w1a) / 3;

    const cX = [
      MARGIN_LEFT,
      MARGIN_LEFT + w1a,
      MARGIN_LEFT + w1a + wEst,
      MARGIN_LEFT + w1a + (wEst * 2),
      RIGHT_X
    ];

    const evalTableTop = cursorY;

    let maxNombreLines = 1;
    const processedNombres = [];
    for (let i = 0; i < 3; i++) {
      const estData = integrantes[i] || {};
      const nombreEst = estData.nombre_apellido || estData.nombres || "";
      const lines = nombreEst ? wrapText(nombreEst, font, 7.5, wEst - 8) : ["..........................................."];
      processedNombres.push(lines);
      if (lines.length > maxNombreLines) maxNombreLines = lines.length;
    }
    const rowNombresH = Math.max(26, 12 + (maxNombreLines * 8.5) + 4);
    const rowTopH = 18;
    const rowCIH = 15;
    const rowPtsH = 15;
    const evalHeaderTotalH = rowTopH + rowNombresH + rowCIH + rowPtsH;

    // Rellenar fondo naranja claro en todo el encabezado de la tabla 2
    fillRect(page, MARGIN_LEFT, evalTableTop, CONTENT_WIDTH, evalHeaderTotalH, COLOR_TABLE_HEADER);

    // Líneas del encabezado de la tabla 2
    hLine(page, MARGIN_LEFT, RIGHT_X, evalTableTop);
    hLine(page, cX[1], RIGHT_X, evalTableTop - rowTopH);
    hLine(page, cX[1], RIGHT_X, evalTableTop - rowTopH - rowNombresH);
    hLine(page, cX[1], RIGHT_X, evalTableTop - rowTopH - rowNombresH - rowCIH);
    hLine(page, MARGIN_LEFT, RIGHT_X, evalTableTop - evalHeaderTotalH);

    vLine(page, cX[0], evalTableTop, evalTableTop - evalHeaderTotalH); // Borde izquierdo exterior
    vLine(page, cX[1], evalTableTop, evalTableTop - evalHeaderTotalH); // Línea divisoria de la columna de criterios
    vLine(page, cX[2], evalTableTop - rowTopH, evalTableTop - evalHeaderTotalH); // ¡Cambiado! Empieza debajo de "Integrantes del ECTG"
    vLine(page, cX[3], evalTableTop - rowTopH, evalTableTop - evalHeaderTotalH); // ¡Cambiado! Empieza debajo de "Integrantes del ECTG"
    vLine(page, cX[4], evalTableTop, evalTableTop - evalHeaderTotalH); // Borde derecho exterior

    // Texto Encabezado Superior Unificado: "Integrantes del ECTG"
    const wIntH = fontBold.widthOfTextAtSize("Integrantes del ECTG", 9.5);
    page.drawText("Integrantes del ECTG", { 
      x: cX[1] + ((CONTENT_WIDTH - w1a) / 2) - (wIntH / 2), 
      y: evalTableTop - 13, 
      size: 9.5, 
      font: fontBold, 
      color: COLOR_TEXT 
    });

    // Columna Izquierda (Column 0): Celda unificada para "Criterios de evaluación en la socialización"
    const critHeaderTitle = "Criterios de evaluación en la socialización";
    const wrappedCritHeader = wrapText(critHeaderTitle, fontBold, 8, w1a - 10);
    let critHeaderY = evalTableTop - (evalHeaderTotalH / 2) + (wrappedCritHeader.length * 4.5);
    wrappedCritHeader.forEach(line => {
      const wLine = fontBold.widthOfTextAtSize(line, 8);
      page.drawText(line, { 
        x: cX[0] + (w1a / 2) - (wLine / 2), 
        y: critHeaderY, 
        size: 8, 
        font: fontBold, 
        color: COLOR_TEXT 
      });
      critHeaderY -= 10;
    });

    // Fila Nombres
    let currentY = evalTableTop - rowTopH;
    for (let i = 0; i < 3; i++) {
      page.drawText("Nombres y Apellidos:", { x: cX[1 + i] + 4, y: currentY - 9, size: 7.5, font: fontBold, color: COLOR_TEXT });
      let nameY = currentY - 18;
      processedNombres[i].forEach(line => {
        page.drawText(line, { x: cX[1 + i] + 4, y: nameY, size: 7.5, font, color: COLOR_TEXT });
        nameY -= 8.5;
      });
    }
    currentY -= rowNombresH;

    // Fila C.I.
    for (let i = 0; i < 3; i++) {
      const estData = integrantes[i] || {};
      const ciEst = estData.ci ? `C.I.: ${estData.ci}` : "C.I.: ........................";
      page.drawText(ciEst, { x: cX[1 + i] + 4, y: currentY - 10, size: 7.5, font: fontBold, color: COLOR_TEXT });
    }
    currentY -= rowCIH;

    // Fila 1 a 100 Puntos
    for (let i = 0; i < 3; i++) {
      const wPts = fontBold.widthOfTextAtSize("1 a 100 Puntos", 7.5);
      page.drawText("1 a 100 Puntos", { x: cX[1 + i] + (wEst / 2) - (wPts / 2), y: currentY - 10, size: 7.5, font: fontBold, color: COLOR_TEXT });
    }
    currentY -= rowPtsH;

    // BLOQUES DE CRITERIOS DE EVALUACIÓN
    const bloquesCriterios = [
      {
        titulo: "Presentación de la necesidad, problema y/o potencialidad identificada.",
        items: [
          "Claridad en la exposición de ideas.",
          "La necesidad, problemática y/o potencialidad es relevante y pertinente al ámbito educativo.",
          "Argumenta con solidez sus ideas con base en el diálogo sostenido con los actores y la reflexión crítica en ECTG."
        ]
      },
      {
        titulo: "Sustentación de la propuesta educativa",
        items: [
          "Argumenta de manera adecuada los principales componentes de la propuesta educativa.",
          "La propuesta educativa es coherente con la necesidad, problema y/o potencialidad identificada.",
          "Argumenta la propuesta con base al diálogo con los actores y autores y la reflexión crítica en ECTG."
        ]
      },
      {
        titulo: "Controversia y argumentación",
        items: [
          "Sustenta con propiedad y coherencia los diferentes acápites del trabajo presentado.",
          "Muestra seguridad y solvencia en la presentación y sustento de la propuesta educativa."
        ]
      }
    ];

    for (let bIndex = 0; bIndex < bloquesCriterios.length; bIndex++) {
      const bloque = bloquesCriterios[bIndex];
      const wrappedTitle = wrapText(bloque.titulo, fontBold, 7.5, w1a - 8);
      let itemsLinesTotal = 0;
      const wrappedItems = bloque.items.map(it => {
        const wrapped = wrapText(`• ${it}`, font, 7, w1a - 8);
        itemsLinesTotal += wrapped.length;
        return wrapped;
      });

      const bloqueH = Math.max(52, (wrappedTitle.length * 9) + (itemsLinesTotal * 8.5) + 16);

      // Verificación de desborde de página antes de dibujar cada bloque
      if (currentY - bloqueH < MARGIN_BOTTOM) {
        page = await addNewPage();
        currentY = pageHeight - MARGIN_TOP;
        hLine(page, cX[0], RIGHT_X, currentY);
      }

      hLine(page, cX[0], RIGHT_X, currentY - bloqueH);

      let textDrawY = currentY - 8;
      
      wrappedTitle.forEach(line => {
        page.drawText(line, { x: cX[0] + 4, y: textDrawY, size: 7.5, font: fontBold, color: COLOR_TEXT });
        textDrawY -= 9;
      });

      textDrawY -= 3;

      bloque.items.forEach((it, itemIdx) => {
        wrappedItems[itemIdx].forEach(line => {
          page.drawText(line, { x: cX[0] + 6, y: textDrawY, size: 7, font, color: COLOR_TEXT });
          textDrawY -= 8.5;
        });
      });

      for (let i = 0; i < 3; i++) {
        const estData = integrantes[i] || {};
        const calif = estData.calificaciones || {};
        
        let notaVal = "";
        if (bIndex === 0) notaVal = calif.nota_necesidad_problema ?? calif.c1 ?? "";
        else if (bIndex === 1) notaVal = calif.nota_propuesta_educativa ?? calif.c2 ?? "";
        else if (bIndex === 2) notaVal = calif.nota_controversia_argumentacion ?? calif.c3 ?? "";

        if (notaVal !== "") {
          const notaRedondeada = Math.round(parseFloat(notaVal) || 0);
          const strNota = String(notaRedondeada);
          const wN = fontBold.widthOfTextAtSize(strNota, 8.5);
          page.drawText(strNota, { x: cX[1 + i] + (wEst / 2) - (wN / 2), y: currentY - (bloqueH / 2) - 3, size: 8.5, font: fontBold, color: COLOR_TEXT });
        }
      }

      vLine(page, cX[0], currentY, currentY - bloqueH);
      vLine(page, cX[1], currentY, currentY - bloqueH);
      vLine(page, cX[2], currentY, currentY - bloqueH);
      vLine(page, cX[3], currentY, currentY - bloqueH);
      vLine(page, cX[4], currentY, currentY - bloqueH);

      currentY -= bloqueH;
    }

    // 4. SECCIÓN INFERIOR: PROMEDIOS Y RESULTADOS
    const hNumRow = 16;
    const hLitRow = 16;
    const hResRow = 18;
    const totalSummaryH = hNumRow + hLitRow + hResRow;

    if (currentY - totalSummaryH < MARGIN_BOTTOM) {
      page = await addNewPage();
      currentY = pageHeight - MARGIN_TOP;
      hLine(page, cX[0], RIGHT_X, currentY);
    }

    // Fila Numeral
    hLine(page, cX[0], RIGHT_X, currentY - hNumRow);
    page.drawText("Promedio", { x: cX[0] + 6, y: currentY - 11, size: 8, font: fontBold, color: COLOR_TEXT });
    page.drawText("Numeral:", { x: cX[0] + 58, y: currentY - 11, size: 8, font: fontBold, color: COLOR_TEXT });

    for (let i = 0; i < 3; i++) {
      const estData = integrantes[i] || {};
      const promNum = estData.promedio_numeral !== undefined ? estData.promedio_numeral : "";
      if (promNum !== "") {
        const strNum = String(Math.round(parseFloat(promNum) || 0));
        const wNum = fontBold.widthOfTextAtSize(strNum, 8);
        page.drawText(strNum, { x: cX[1 + i] + (wEst / 2) - (wNum / 2), y: currentY - 11, size: 8, font: fontBold, color: COLOR_TEXT });
      }
    }
    vLine(page, cX[0], currentY, currentY - hNumRow);
    vLine(page, cX[1], currentY, currentY - hNumRow);
    vLine(page, cX[2], currentY, currentY - hNumRow);
    vLine(page, cX[3], currentY, currentY - hNumRow);
    vLine(page, cX[4], currentY, currentY - hNumRow);
    currentY -= hNumRow;

    // Fila Literal
    hLine(page, cX[0], RIGHT_X, currentY - hLitRow);
    page.drawText("Literal:", { x: cX[0] + 58, y: currentY - 11, size: 8, font: fontBold, color: COLOR_TEXT });

    for (let i = 0; i < 3; i++) {
      const estData = integrantes[i] || {};
      const promNum = estData.promedio_numeral !== undefined ? Math.round(parseFloat(estData.promedio_numeral) || 0) : 0;
      const promLit = estData.promedio_literal || numeroALetras(promNum);
      if (promLit) {
        const cleanLit = String(promLit).replace(/ CON 00\/100/g, '').toUpperCase();
        const wLit = fontBold.widthOfTextAtSize(cleanLit, 7);
        page.drawText(cleanLit, { x: cX[1 + i] + (wEst / 2) - (wLit / 2), y: currentY - 11, size: 7, font: fontBold, color: COLOR_TEXT });
      }
    }
    vLine(page, cX[0], currentY, currentY - hLitRow);
    vLine(page, cX[1], currentY, currentY - hLitRow);
    vLine(page, cX[2], currentY, currentY - hLitRow);
    vLine(page, cX[3], currentY, currentY - hLitRow);
    vLine(page, cX[4], currentY, currentY - hLitRow);
    currentY -= hLitRow;

    // Fila Resultado (Aprobado/Reprobado)
    hLine(page, cX[0], RIGHT_X, currentY - hResRow);
    page.drawText("Resultado (Aprobado/reprobado):", { x: cX[0] + 4, y: currentY - 12, size: 7.5, font: fontBold, color: COLOR_TEXT });

    for (let i = 0; i < 3; i++) {
      const estData = integrantes[i] || {};
      const resultadoEst = estData.resultado || "";
      if (resultadoEst) {
        const wRes = fontBold.widthOfTextAtSize(resultadoEst, 8);
        page.drawText(resultadoEst, { x: cX[1 + i] + (wEst / 2) - (wRes / 2), y: currentY - 12, size: 8, font: fontBold, color: COLOR_TEXT });
      }
    }
    vLine(page, cX[0], currentY, currentY - hResRow);
    vLine(page, cX[1], currentY, currentY - hResRow);
    vLine(page, cX[2], currentY, currentY - hResRow);
    vLine(page, cX[3], currentY, currentY - hResRow);
    vLine(page, cX[4], currentY, currentY - hResRow);
    currentY -= hResRow;

    // Verificación final antes de lugar, fecha y firmas
    if (currentY - 70 < MARGIN_BOTTOM) {
      page = await addNewPage();
      currentY = pageHeight - MARGIN_TOP;
    } else {
      currentY -= 15;
    }

    // 5. LUGAR Y FECHA
    const ciudad = d.lugar_ciudad || "El Alto";
    const dia = d.dia || String(new Date().getDate());
    const mes = d.mes || "septiembre";
    const ano = String(d.ano || "2026").slice(0, 4);

    const txtLugarLabel = "Lugar y fecha: ";
    const txtLugarValor = `${ciudad}, ${dia} de ${mes} de ${ano}`;

    const wLabelLF = font.widthOfTextAtSize(txtLugarLabel, 8.5);
    const wValLF = fontBold.widthOfTextAtSize(txtLugarValor, 8.5);
    const totalLFWidth = wLabelLF + wValLF;
    const startX_LF = CONTENT_CENTER_X - (totalLFWidth / 2);

    page.drawText(txtLugarLabel, { x: startX_LF, y: currentY, size: 8.5, font, color: COLOR_TEXT });
    page.drawText(txtLugarValor, { x: startX_LF + wLabelLF, y: currentY, size: 8.5, font: fontBold, color: COLOR_TEXT });
    drawDottedLine(page, startX_LF + wLabelLF, startX_LF + totalLFWidth, currentY - 2);

    currentY -= 40;

    // 6. BLOQUE DE FIRMAS INFERIORES
    const sigColWidth = CONTENT_WIDTH / 4;
    const sigLineW = 90;

    const firmas = [
      { label: "Firma Presidenta/e", xCenter: MARGIN_LEFT + sigColWidth * 0.5 },
      { label: "Firma Secretaria/o", xCenter: MARGIN_LEFT + sigColWidth * 1.5 },
      { label: "Firma Relator/a", xCenter: MARGIN_LEFT + sigColWidth * 2.5 },
      { label: "Firma Veedor/a", xCenter: MARGIN_LEFT + sigColWidth * 3.5 }
    ];

    firmas.forEach((f) => {
      const lineStartX = f.xCenter - sigLineW / 2;
      const lineEndX = f.xCenter + sigLineW / 2;

      drawDottedLine(page, lineStartX, lineEndX, currentY);

      const wL = fontBold.widthOfTextAtSize(f.label, 8);
      page.drawText(f.label, {
        x: f.xCenter - wL / 2,
        y: currentY - 11,
        size: 8,
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
    console.error("Error al generar PDF de la Ficha C-2 (4to Año):", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`
    };
  }
};