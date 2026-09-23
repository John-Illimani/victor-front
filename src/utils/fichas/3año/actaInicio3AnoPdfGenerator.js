import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { actaInicio3erAnoService } from "../../../services/fichas/3año/actaInicio3erAnoService";
import { userService } from "../../../services/userService";

// Paleta de Colores Institucionales
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255);            // Dorado (#C9A751)
const COLOR_TABLE_HEADER = rgb(155 / 255, 168 / 255, 102 / 255);    // Verde Oliva (#9BA866)
const COLOR_BORDER = rgb(0, 0, 0);

const BORDER = 0.8;

// Helper para limpiar fechas e imprimir estrictamente YYYY-MM-DD
function formatFechaLimpia(fecha) {
  if (!fecha) return "";
  const str = String(fecha).trim();
  if (str.includes("T")) return str.split("T")[0];
  return str.slice(0, 10);
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

function hLine(page, x1, x2, y) {
  page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: BORDER, color: COLOR_BORDER });
}

function vLine(page, x, y1, y2) {
  page.drawLine({ start: { x, y: y1 }, end: { x, y: y2 }, thickness: BORDER, color: COLOR_BORDER });
}

function fillRect(page, x, yTop, w, h, color) {
  page.drawRectangle({ x, y: yTop - h, width: w, height: h, color });
}

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

  drawDotted(page, valueX, lineEnd, y - 1.5);
  return lineEnd;
}

export const imprimirActaInicio3erAno = async (estudianteId) => {
  try {
    const response = await actaInicio3erAnoService.getByEstudiante(estudianteId);

    if (!response || !response.datos) {
      return {
        success: false,
        message: "No existen datos registrados para el Acta de Inicio de 3er Año."
      };
    }

    const d = response.datos;

    // RESOLVER NOMBRES DE DOCENTES DESDE userService.getUsers()
    let nombreDocenteGuia = d.docente_guia_nombre || "";
    let nombreDocenteAcompanante = d.docente_acompanante_nombre || "";

    if ((!nombreDocenteGuia && d.docente_guia_id) || (!nombreDocenteAcompanante && d.docente_acompanante_id)) {
      try {
        const usuariosRes = await userService.getUsers();
        const listaUsuarios = Array.isArray(usuariosRes) ? usuariosRes : (usuariosRes?.datos || []);

        if (!nombreDocenteGuia && d.docente_guia_id) {
          const docGuia = listaUsuarios.find(u => u.id === d.docente_guia_id);
          if (docGuia) {
            nombreDocenteGuia = `${docGuia.nombre || ''} ${docGuia.apellido || ''}`.trim();
          }
        }

        if (!nombreDocenteAcompanante && d.docente_acompanante_id) {
          const docAcomp = listaUsuarios.find(u => u.id === d.docente_acompanante_id);
          if (docAcomp) {
            nombreDocenteAcompanante = `${docAcomp.nombre || ''} ${docAcomp.apellido || ''}`.trim();
          }
        }
      } catch (errUsers) {
        console.warn("No se pudo obtener la lista de usuarios para resolver los docentes:", errUsers.message);
      }
    }

    const urlPlantilla = encodeURI("/pdf/3año/plantilla.pdf");
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

    // MÁRGENES ESTRICTOS (5 cm Arriba, 3 cm Izq, 1.81 cm Der)
    const MARGIN_TOP = (5 / 2.54) * 72; 
    const MARGIN_LEFT = 85.04;          
    const MARGIN_RIGHT = 51.31;         
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT);
    const RIGHT_X = MARGIN_LEFT + CONTENT_WIDTH;

    let cursorY = pageHeight - MARGIN_TOP;

    // TÍTULO PRINCIPAL
    const titleLines = [
      "ACTA DE INICIO",
      "INVESTIGACIÓN EDUCATIVA PRODUCCIÓN DE",
      "CONOCIMIENTOS PRÁCTICA EDUCATIVA COMUNITARIA"
    ];

    titleLines.forEach((line) => {
      const w = fontBold.widthOfTextAtSize(line, 13);
      page.drawText(line, {
        x: MARGIN_LEFT + CONTENT_WIDTH / 2 - w / 2,
        y: cursorY,
        size: 13,
        font: fontBold,
        color: COLOR_TITLE,
      });
      cursorY -= 16;
    });

    cursorY -= 8;

    page.drawText("DATOS REFERENCIALES:", { x: MARGIN_LEFT, y: cursorY, size: 9.5, font: fontBold, color: COLOR_TEXT });
    cursorY -= 16;

    campoPunteado(page, { label: "ESFM/UA: ", value: d.esfm_ua || "ESFM Simón Bolívar / UA El Alto", x: MARGIN_LEFT, y: cursorY, endX: RIGHT_X, font, fontBold, size: 9 });
    cursorY -= 16;

    campoPunteado(page, { label: "Apellido(s) y Nombre(s) del(a) estudiante: ", value: d.apellidos_nombres || "", x: MARGIN_LEFT, y: cursorY, endX: RIGHT_X, font, fontBold, size: 9 });
    cursorY -= 16;

    campoPunteado(page, { label: "Especialidad: ", value: d.especialidad || "", x: MARGIN_LEFT, y: cursorY, endX: RIGHT_X, font, fontBold, size: 9 });
    cursorY -= 18;

    page.drawText("Integrantes del equipo comunitario:", { x: MARGIN_LEFT, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    cursorY -= 14;

    // TABLA DE INTEGRANTES
    const tableTop = cursorY;
    const colWidths = [45, 330.65, 100];
    const colX = [MARGIN_LEFT];
    for (let i = 0; i < colWidths.length; i++) colX.push(colX[i] + colWidths[i]);

    const headerH = 22;
    fillRect(page, MARGIN_LEFT, tableTop, CONTENT_WIDTH, headerH, COLOR_TABLE_HEADER);

    const headers = [
      { text: "N°", col: 0 },
      { text: "APELLIDOS Y NOMBRES", col: 1 },
      { text: "C.I.", col: 2 }
    ];

    headers.forEach(({ text, col }) => {
      const wHeader = fontBold.widthOfTextAtSize(text, 9);
      page.drawText(text, {
        x: colX[col] + colWidths[col] / 2 - wHeader / 2,
        y: tableTop - 14,
        size: 9,
        font: fontBold,
        color: COLOR_TEXT,
      });
    });

    let currentTableY = tableTop - headerH;
    const hLines = [tableTop, currentTableY];

    const rawIntegrantes = Array.isArray(d.integrantes) ? d.integrantes : [];
    const integrantes = [0, 1, 2].map((idx) => rawIntegrantes[idx] || {});

    integrantes.forEach((item, index) => {
      const rowTop = currentTableY;
      const rowH = 22;

      const numStr = `${index + 1}.`;
      const nw = font.widthOfTextAtSize(numStr, 9);
      page.drawText(numStr, { x: colX[0] + colWidths[0] / 2 - nw / 2, y: rowTop - 14, size: 9, font, color: COLOR_TEXT });

      const nomStr = String(item.apellidos_nombres || "").toUpperCase();
      if (nomStr) page.drawText(nomStr, { x: colX[1] + 8, y: rowTop - 14, size: 9, font: fontBold, color: COLOR_TEXT });

      const ciStr = String(item.ci || "").toUpperCase();
      if (ciStr) {
        const ciW = font.widthOfTextAtSize(ciStr, 9);
        page.drawText(ciStr, { x: colX[2] + colWidths[2] / 2 - ciW / 2, y: rowTop - 14, size: 9, font, color: COLOR_TEXT });
      }

      currentTableY -= rowH;
      hLines.push(currentTableY);
    });

    hLines.forEach((lineY) => hLine(page, MARGIN_LEFT, RIGHT_X, lineY));
    colX.forEach((lineX) => vLine(page, lineX, tableTop, currentTableY));

    cursorY = currentTableY - 20;

    page.drawText("DATOS DE LA IEPC – PEC:", { x: MARGIN_LEFT, y: cursorY, size: 9.5, font: fontBold, color: COLOR_TEXT });
    cursorY -= 16;

    const depEnd = campoPunteado(page, { label: "Departamento: ", value: d.departamento || "La Paz", x: MARGIN_LEFT, y: cursorY, minLine: 120, font, fontBold, size: 9 });
    campoPunteado(page, { label: "Distrito Educativo: ", value: d.distrito_educativo || "", x: depEnd + 15, y: cursorY, endX: RIGHT_X, font, fontBold, size: 9 });
    cursorY -= 16;

    const subEnd = campoPunteado(page, { label: "Subsistema: ", value: d.subsistema || "Educación Regular", x: MARGIN_LEFT, y: cursorY, minLine: 120, font, fontBold, size: 9 });
    campoPunteado(page, { label: "Nivel: ", value: d.nivel || "", x: subEnd + 15, y: cursorY, endX: RIGHT_X, font, fontBold, size: 9 });
    cursorY -= 16;

    campoPunteado(page, { label: "UE/CEA/CEE: ", value: d.ue_cea_cee || "", x: MARGIN_LEFT, y: cursorY, endX: RIGHT_X, font, fontBold, size: 9 });
    cursorY -= 16;

    campoPunteado(page, { label: "Año(s) de escolaridad asignado: ", value: d.anos_escolaridad_asignado || "", x: MARGIN_LEFT, y: cursorY, endX: RIGHT_X, font, fontBold, size: 9 });
    cursorY -= 16;

    // FECHAS CON FORMATO LIMPIO YYYY-MM-DD
    const lblFechaPec = "Fecha de desarrollo de la PEC: del ";
    page.drawText(lblFechaPec, { x: MARGIN_LEFT, y: cursorY, size: 9, font, color: COLOR_TEXT });
    let fCursorX = MARGIN_LEFT + font.widthOfTextAtSize(lblFechaPec, 9);

    const fInicioVal = formatFechaLimpia(d.fecha_inicio_pec);
    if (fInicioVal) {
      page.drawText(fInicioVal, { x: fCursorX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    }
    const fIniW = fInicioVal ? fontBold.widthOfTextAtSize(fInicioVal, 9) : 0;
    const lineIniEnd = fCursorX + Math.max(fIniW + 4, 80);
    drawDotted(page, fCursorX, lineIniEnd, cursorY - 1.5);

    fCursorX = lineIniEnd + 8;
    const lblAl = "al ";
    page.drawText(lblAl, { x: fCursorX, y: cursorY, size: 9, font, color: COLOR_TEXT });
    fCursorX += font.widthOfTextAtSize(lblAl, 9);

    const fConcVal = formatFechaLimpia(d.fecha_conclusion_pec);
    if (fConcVal) {
      page.drawText(fConcVal, { x: fCursorX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    }
    drawDotted(page, fCursorX, RIGHT_X, cursorY - 1.5);
    cursorY -= 16;

    // IMPRESIÓN DE NOMBRES DE DOCENTES (OBTENIDOS DE USER SERVICE)
    campoPunteado(page, {
      label: "Apellido(s) y Nombre del Docente Guía de UE/CEA/CEE: ",
      value: nombreDocenteGuia,
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9
    });
    cursorY -= 16;

    campoPunteado(page, {
      label: "Apellido(s) y Nombre del Docente Acompañante: ",
      value: nombreDocenteAcompanante,
      x: MARGIN_LEFT,
      y: cursorY,
      endX: RIGHT_X,
      font,
      fontBold,
      size: 9
    });

    cursorY -= 65;

    // FIRMAS
    const colSigWidth = CONTENT_WIDTH / 2;
    const lineW = 180;

    const firmas = [
      {
        titulo: "Coordinación\nAcadémica IEPC-PEC/Coordinador de la Unidad Académica",
        xCenter: MARGIN_LEFT + colSigWidth * 0.5
      },
      {
        titulo: "Director(a)\nUE/CEA/CEE",
        xCenter: MARGIN_LEFT + colSigWidth * 1.5
      }
    ];

    firmas.forEach((f) => {
      const lineStartX = f.xCenter - lineW / 2;
      const lineEndX = f.xCenter + lineW / 2;

      drawDotted(page, lineStartX, lineEndX, cursorY);

      const lines = f.titulo.split("\n");
      let fy = cursorY - 12;

      lines.forEach((l) => {
        const lw = fontBold.widthOfTextAtSize(l, 8);
        page.drawText(l, {
          x: f.xCenter - lw / 2,
          y: fy,
          size: 8,
          font: fontBold,
          color: COLOR_TEXT,
        });
        fy -= 9.5;
      });
    });

    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");

    return { success: true };

  } catch (error) {
    console.error("Error al generar PDF del Acta de Inicio (3er Año):", error);
    return { success: false, message: `Error al procesar el documento PDF: ${error.message}` };
  }
};