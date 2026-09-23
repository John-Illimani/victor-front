import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { actaInicio2doAnoService } from "../../../services/fichas/2año/actaInicio2doAnoService";
import { studentService } from "../../../services/studentService";

// =============================================================================
// COLORES INSTITUCIONALES OFICIALES
// =============================================================================
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_TITLE = rgb(201 / 255, 167 / 255, 81 / 255); // Dorado oficial (#C9A751)
const COLOR_TABLE_HEADER = rgb(178 / 255, 34 / 255, 34 / 255); // Rojo Guindo Oficial / Marrón (#B22222)
const COLOR_BORDER = rgb(0, 0, 0);

// Helper para limpiar fechas ISO a formato limpio (DD-MM-AA)
function formatFecha(val) {
  if (!val) return "....................";
  const str = String(val).trim();
  if (str.includes("T")) {
    const fechaPart = str.split("T")[0];
    const partes = fechaPart.split("-");
    if (partes.length === 3) {
      return `${partes[2]}-${partes[1]}-${partes[0].slice(-2)}`;
    }
  }
  return str;
}

export const imprimirActaInicio2doAno = async (estudianteId) => {
  try {
    // 1. Obtenemos simultáneamente los datos de la ficha y los datos generales del estudiante (igual que StudentsManagement)
    const [responseFicha, studentsList] = await Promise.all([
      actaInicio2doAnoService.getByEstudiante(estudianteId),
      studentService.getStudents().catch(() => [])
    ]);

    if (!responseFicha || !responseFicha.existe || !responseFicha.datos) {
      return {
        success: false,
        message:
          "No existen datos registrados para el Acta de Inicio de 2do Año de este estudiante. Primero guarda el formulario.",
      };
    }

    const d = responseFicha.datos;

    // Buscamos al estudiante en la lista general para extraer la misma info de docente que StudentsManagement
    const estudianteGeneral = studentsList.find((s) => String(s.id) === String(estudianteId)) || {};

    // =========================================================================
    // CARGA Y VALIDACIÓN DE PLANTILLA PDF
    // =========================================================================
    const urlPlantilla = "/pdf/2año/plantilla.pdf";
    const resFetch = await fetch(urlPlantilla);

    if (!resFetch.ok) {
      return {
        success: false,
        message: `No se encontró la plantilla en la ruta: ${urlPlantilla} (HTTP Status: ${resFetch.status}).`,
      };
    }

    const contentType = resFetch.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      return {
        success: false,
        message: `El archivo en '${urlPlantilla}' no es un PDF válido. Verifica que exista en 'public/pdf/2ano/plantilla.pdf'.`,
      };
    }

    const pdfBytes = await resFetch.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPages()[0];

    // =========================================================================
    // CONFIGURACIÓN DE PÁGINA Y MÁRGENES (3 cm Izq, 1.81 cm Der)
    // =========================================================================
    page.setSize(612, 792);
    const pageWidth = 612;

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const MARGIN_LEFT = 85.04;  // 3 cm exactos
    const MARGIN_RIGHT = 51.31; // 1.81 cm exactos
    const CONTENT_WIDTH = pageWidth - (MARGIN_LEFT + MARGIN_RIGHT); // 475.65 pt
    const CONTENT_CENTER_X = MARGIN_LEFT + CONTENT_WIDTH / 2;       // 322.865 pt

    // =========================================================================
    // 1. TÍTULO Y SUBTÍTULO PRINCIPAL (ARIAL BOLD 13 PT)
    // =========================================================================
    let cursorY = 675;

    const t1 = "ACTA DE INICIO";
    const t1W = fontBold.widthOfTextAtSize(t1, 13);
    page.drawText(t1, {
      x: CONTENT_CENTER_X - t1W / 2,
      y: cursorY,
      size: 13,
      font: fontBold,
      color: COLOR_TITLE,
    });

    cursorY -= 18;

    const subTituloLineas = [
      "INVESTIGACIÓN EDUCATIVA Y PRODUCCIÓN",
      "DE CONOCIMIENTOS PRÁCTICA EDUCATIVA",
      "COMUNITARIA"
    ];

    subTituloLineas.forEach((linea) => {
      const lineW = fontBold.widthOfTextAtSize(linea, 13);
      page.drawText(linea, {
        x: CONTENT_CENTER_X - lineW / 2,
        y: cursorY,
        size: 13,
        font: fontBold,
        color: COLOR_TITLE,
      });
      cursorY -= 15;
    });

    cursorY -= 10;

    // =========================================================================
    // 2. DATOS REFERENCIALES DEL ESTUDIANTE (9 PT)
    // =========================================================================
    const refTitle = "DATOS REFERENCIALES DEL ESTUDIANTE:";
    page.drawText(refTitle, {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 9,
      font: fontBold,
      color: COLOR_TITLE,
    });
    cursorY -= 16;

    // Apellidos y nombres
    const lblNom = "Apellidos y Nombres del Estudiante: ";
    page.drawText(lblNom, { x: MARGIN_LEFT + 15, y: cursorY, size: 9, font, color: COLOR_TEXT });
    const lblNomW = font.widthOfTextAtSize(lblNom, 9);
    const valNomX = MARGIN_LEFT + 15 + lblNomW;
    const valNom = (d.apellidos_nombres || `${estudianteGeneral.nombre || ""} ${estudianteGeneral.apellido || ""}`).toUpperCase();
    if (valNom.trim()) {
      page.drawText(valNom, { x: valNomX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    }
    const valNomW = fontBold.widthOfTextAtSize(valNom, 9);
    page.drawLine({
      start: { x: valNomX, y: cursorY - 2 },
      end: { x: valNomX + Math.max(valNomW, 200), y: cursorY - 2 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });

    cursorY -= 14;

    // ESFM/UA
    const lblEsfm = "ESFM/UA: ";
    page.drawText(lblEsfm, { x: MARGIN_LEFT + 15, y: cursorY, size: 9, font, color: COLOR_TEXT });
    const lblEsfmW = font.widthOfTextAtSize(lblEsfm, 9);
    const valEsfmX = MARGIN_LEFT + 15 + lblEsfmW;
    const valEsfm = (d.esfm_ua || estudianteGeneral.esfm_ua || "ESFM Simón Bolívar / UA El Alto").toUpperCase();
    page.drawText(valEsfm, { x: valEsfmX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    const valEsfmW = fontBold.widthOfTextAtSize(valEsfm, 9);
    page.drawLine({
      start: { x: valEsfmX, y: cursorY - 2 },
      end: { x: valEsfmX + Math.max(valEsfmW, 200), y: cursorY - 2 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });

    cursorY -= 14;

    // Especialidad y Paralelo
    const lblEsp = "Especialidad: ";
    page.drawText(lblEsp, { x: MARGIN_LEFT + 15, y: cursorY, size: 9, font, color: COLOR_TEXT });
    const lblEspW = font.widthOfTextAtSize(lblEsp, 9);
    const valEspX = MARGIN_LEFT + 15 + lblEspW;
    const valEsp = (d.especialidad || estudianteGeneral.especialidad || "").toUpperCase();
    if (valEsp) {
      page.drawText(valEsp, { x: valEspX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    }
    const valEspW = fontBold.widthOfTextAtSize(valEsp, 9);
    page.drawLine({
      start: { x: valEspX, y: cursorY - 2 },
      end: { x: MARGIN_LEFT + 340, y: cursorY - 2 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });

    const lblPar = "Paralelo: ";
    page.drawText(lblPar, { x: MARGIN_LEFT + 350, y: cursorY, size: 9, font, color: COLOR_TEXT });
    const lblParW = font.widthOfTextAtSize(lblPar, 9);
    const valParX = MARGIN_LEFT + 350 + lblParW;
    const valPar = (d.paralelo || "").toUpperCase();
    if (valPar) {
      page.drawText(valPar, { x: valParX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    }
    const valParW = fontBold.widthOfTextAtSize(valPar, 9);
    page.drawLine({
      start: { x: valParX, y: cursorY - 2 },
      end: { x: MARGIN_LEFT + CONTENT_WIDTH, y: cursorY - 2 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });

    cursorY -= 16;

    // Integrantes del Equipo Comunitario IEPC-PEC
    const lblEq = "Integrantes del Equipo Comunitario IEPC-PEC:";
    page.drawText(lblEq, { x: MARGIN_LEFT + 15, y: cursorY, size: 9, font, color: COLOR_TEXT });

    cursorY -= 14;

    // =========================================================================
    // 3. TABLA DE INTEGRANTES (ENCABEZADOS 12 PT BOLD, FILAS 9 PT)
    // =========================================================================
    const tableTop = cursorY;
    const colWidths = [30, 205, 150, 90.65]; // Total 475.65 pt
    const colX = [
      MARGIN_LEFT,
      MARGIN_LEFT + colWidths[0],
      MARGIN_LEFT + colWidths[0] + colWidths[1],
      MARGIN_LEFT + colWidths[0] + colWidths[1] + colWidths[2],
      MARGIN_LEFT + CONTENT_WIDTH,
    ];

    const headerHeight = 26;
    page.drawRectangle({
      x: MARGIN_LEFT,
      y: tableTop - headerHeight,
      width: CONTENT_WIDTH,
      height: headerHeight,
      color: COLOR_TABLE_HEADER,
    });

    const headers = [
      { text: "Nº", x: colX[0] + colWidths[0] / 2 },
      { text: "APELLIDOS Y NOMBRES", x: colX[1] + colWidths[1] / 2 },
      { text: "ESPECIALIDAD", x: colX[2] + colWidths[2] / 2 },
      { text: "C.I.", x: colX[3] + colWidths[3] / 2 },
    ];

    headers.forEach((h) => {
      const textW = fontBold.widthOfTextAtSize(h.text, 12);
      page.drawText(h.text, {
        x: h.x - textW / 2,
        y: tableTop - 17,
        size: 12,
        font: fontBold,
        color: rgb(1, 1, 1),
      });
    });

    let rowY = tableTop - headerHeight;
    const rowHeight = 22;

    const integrantesList = Array.isArray(d.integrantes) && d.integrantes.length > 0 
      ? d.integrantes 
      : [{}, {}, {}];

    const displayIntegrantes = integrantesList.slice(0, 3);
    while (displayIntegrantes.length < 3) {
      displayIntegrantes.push({});
    }

    displayIntegrantes.forEach((integ, idx) => {
      const nextRowY = rowY - rowHeight;

      const numStr = String(idx + 1);
      const numW = fontBold.widthOfTextAtSize(numStr, 9);
      page.drawText(numStr, {
        x: colX[0] + colWidths[0] / 2 - numW / 2,
        y: rowY - 15,
        size: 9,
        font: fontBold,
        color: COLOR_TEXT,
      });

      if (integ.apellidos_nombres) {
        page.drawText(String(integ.apellidos_nombres).toUpperCase(), {
          x: colX[1] + 6,
          y: rowY - 15,
          size: 9,
          font,
          color: COLOR_TEXT,
        });
      }

      if (integ.especialidad) {
        page.drawText(String(integ.especialidad).toUpperCase(), {
          x: colX[2] + 6,
          y: rowY - 15,
          size: 9,
          font,
          color: COLOR_TEXT,
        });
      }

      if (integ.ci) {
        page.drawText(String(integ.ci).toUpperCase(), {
          x: colX[3] + 6,
          y: rowY - 15,
          size: 9,
          font,
          color: COLOR_TEXT,
        });
      }

      page.drawLine({
        start: { x: MARGIN_LEFT, y: nextRowY },
        end: { x: colX[4], y: nextRowY },
        thickness: 0.8,
        color: COLOR_BORDER,
      });

      rowY = nextRowY;
    });

    colX.forEach((xPos) => {
      page.drawLine({
        start: { x: xPos, y: tableTop },
        end: { x: xPos, y: rowY },
        thickness: 0.8,
        color: COLOR_BORDER,
      });
    });

    page.drawLine({
      start: { x: MARGIN_LEFT, y: tableTop },
      end: { x: colX[4], y: tableTop },
      thickness: 0.8,
      color: COLOR_BORDER,
    });

    cursorY = rowY - 18;

    // =========================================================================
    // 4. DATOS DE LA IEPC-PEC (9 PT)
    // =========================================================================
    const iepcTitle = "DATOS DE LA IEPC-PEC";
    page.drawText(iepcTitle, {
      x: MARGIN_LEFT,
      y: cursorY,
      size: 9,
      font: fontBold,
      color: COLOR_TITLE,
    });
    cursorY -= 15;

    const drawLineField = (label, value, endX = MARGIN_LEFT + CONTENT_WIDTH) => {
      page.drawText(label, { x: MARGIN_LEFT, y: cursorY, size: 9, font, color: COLOR_TEXT });
      const labelW = font.widthOfTextAtSize(label, 9);
      const valX = MARGIN_LEFT + labelW;
      
      const valText = (value && String(value).trim() !== "" ? value : "").toUpperCase();
      if (valText) {
        page.drawText(valText, { x: valX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
      }
      
      page.drawLine({
        start: { x: valX, y: cursorY - 2 },
        end: { x: endX, y: cursorY - 2 },
        thickness: 0.8,
        dashArray: [1.5, 1.5],
        color: COLOR_TEXT,
      });
      cursorY -= 14;
    };

    // Departamento
    drawLineField("Departamento: ", d.departamento || "La Paz");

    // Distrito Educativo y UE/CEA/CEE
    page.drawText("Distrito Educativo: ", { x: MARGIN_LEFT, y: cursorY, size: 9, font, color: COLOR_TEXT });
    const lblDistW = font.widthOfTextAtSize("Distrito Educativo: ", 9);
    const valDistX = MARGIN_LEFT + lblDistW;
    const valDist = (d.distrito_educativo || "").toUpperCase();
    if (valDist) {
      page.drawText(valDist, { x: valDistX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    }
    page.drawLine({
      start: { x: valDistX, y: cursorY - 2 },
      end: { x: MARGIN_LEFT + 200, y: cursorY - 2 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });

    page.drawText("UE/CEA/CEE: ", { x: MARGIN_LEFT + 210, y: cursorY, size: 9, font, color: COLOR_TEXT });
    const lblUeW = font.widthOfTextAtSize("UE/CEA/CEE: ", 9);
    const valUeX = MARGIN_LEFT + 210 + lblUeW;
    const valUe = (d.ue_cea_cee || "").toUpperCase();
    if (valUe) {
      page.drawText(valUe, { x: valUeX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    }
    page.drawLine({
      start: { x: valUeX, y: cursorY - 2 },
      end: { x: MARGIN_LEFT + CONTENT_WIDTH, y: cursorY - 2 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });
    cursorY -= 14;

    // Especialidad IEPC
    drawLineField("Especialidad: ", d.especialidad_iepc || d.especialidad || estudianteGeneral.especialidad);

    // Año/s de escolaridad; Paralelo/s asignados
    drawLineField("Año/s de escolaridad; Paralelo/s asignados: ", d.anos_escolaridad_paralelos);

    // Subsistema y Nivel
    page.drawText("Subsistema: ", { x: MARGIN_LEFT, y: cursorY, size: 9, font, color: COLOR_TEXT });
    const lblSubW = font.widthOfTextAtSize("Subsistema: ", 9);
    const valSubX = MARGIN_LEFT + lblSubW;
    const valSub = (d.subsistema || "Educación Regular").toUpperCase();
    page.drawText(valSub, { x: valSubX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    page.drawLine({
      start: { x: valSubX, y: cursorY - 2 },
      end: { x: MARGIN_LEFT + 260, y: cursorY - 2 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });

    page.drawText("Nivel: ", { x: MARGIN_LEFT + 270, y: cursorY, size: 9, font, color: COLOR_TEXT });
    const lblNivW = font.widthOfTextAtSize("Nivel: ", 9);
    const valNivX = MARGIN_LEFT + 270 + lblNivW;
    const valNiv = (d.nivel || "").toUpperCase();
    if (valNiv) {
      page.drawText(valNiv, { x: valNivX, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    }
    page.drawLine({
      start: { x: valNivX, y: cursorY - 2 },
      end: { x: MARGIN_LEFT + CONTENT_WIDTH, y: cursorY - 2 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });
    cursorY -= 14;

    // Fecha de desarrollo de la IEPC PEC
    page.drawText("Fecha de desarrollo de la IEPC PEC: del ", { x: MARGIN_LEFT, y: cursorY, size: 9, font, color: COLOR_TEXT });
    const lblF1W = font.widthOfTextAtSize("Fecha de desarrollo de la IEPC PEC: del ", 9);
    const valF1X = MARGIN_LEFT + lblF1W;
    const valF1 = formatFecha(d.fecha_inicio_pec);
    page.drawText(valF1, { x: valF1X, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    const valF1W = fontBold.widthOfTextAtSize(valF1, 9);
    page.drawLine({
      start: { x: valF1X, y: cursorY - 2 },
      end: { x: valF1X + Math.max(valF1W, 120), y: cursorY - 2 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });

    const lblAlX = valF1X + Math.max(valF1W, 120) + 10;
    page.drawText("al ", { x: lblAlX, y: cursorY, size: 9, font, color: COLOR_TEXT });
    const valF2X = lblAlX + font.widthOfTextAtSize("al ", 9);
    const valF2 = formatFecha(d.fecha_conclusion_pec);
    page.drawText(valF2, { x: valF2X, y: cursorY, size: 9, font: fontBold, color: COLOR_TEXT });
    page.drawLine({
      start: { x: valF2X, y: cursorY - 2 },
      end: { x: MARGIN_LEFT + CONTENT_WIDTH, y: cursorY - 2 },
      thickness: 0.8,
      dashArray: [1.5, 1.5],
      color: COLOR_TEXT,
    });
    cursorY -= 14;

    // Director(a) de UE/CEA/CEE
    drawLineField("Director(a) de UE/CEA/CEE: ", d.director_ue_nombre);

    // =========================================================================
    // OBTENCIÓN IDÉNTICA A StudentsManagement (da_nombre y da_apellido)
    // =========================================================================
    const docenteAcompananteStr =
      d.docente_acompanante_nombre ||
      (estudianteGeneral.da_nombre ? `${estudianteGeneral.da_nombre} ${estudianteGeneral.da_apellido || ""}`.trim() : "") ||
      (d.da_nombre ? `${d.da_nombre} ${d.da_apellido || ""}`.trim() : "");

    drawLineField("Docente Acompañante ESFM/UA: ", docenteAcompananteStr);

    cursorY -= 35;

    // =========================================================================
    // 5. SECCIÓN DE FIRMAS Y VO.BO. (9 PT)
    // =========================================================================
    const sigWidth = 180;
    const sig1X = MARGIN_LEFT + 15;
    const sig2X = MARGIN_LEFT + CONTENT_WIDTH - sigWidth - 15;

    // Firma 1: Vo.Bo. Coordinador(a)
    page.drawLine({
      start: { x: sig1X, y: cursorY },
      end: { x: sig1X + sigWidth, y: cursorY },
      thickness: 0.8,
      dashArray: [2, 2],
      color: COLOR_BORDER,
    });

    const vobo1Line1 = "Vo.Bo. Coordinador(a) Académico(a) IEPC-PEC";
    const vobo1Line2 = "o Coordinador(a) de UA";

    const vobo1W1 = font.widthOfTextAtSize(vobo1Line1, 8.5);
    const vobo1W2 = font.widthOfTextAtSize(vobo1Line2, 8.5);

    page.drawText(vobo1Line1, {
      x: sig1X + sigWidth / 2 - vobo1W1 / 2,
      y: cursorY - 12,
      size: 8.5,
      font,
      color: COLOR_TEXT,
    });

    page.drawText(vobo1Line2, {
      x: sig1X + sigWidth / 2 - vobo1W2 / 2,
      y: cursorY - 22,
      size: 8.5,
      font,
      color: COLOR_TEXT,
    });

    // Firma 2: Vo.Bo. Director(a) UE/CEA/CEE
    page.drawLine({
      start: { x: sig2X, y: cursorY },
      end: { x: sig2X + sigWidth, y: cursorY },
      thickness: 0.8,
      dashArray: [2, 2],
      color: COLOR_BORDER,
    });

    const vobo2Line = "Vo.Bo. Director(a) UE/CEA/CEE";
    const vobo2W = font.widthOfTextAtSize(vobo2Line, 8.5);

    page.drawText(vobo2Line, {
      x: sig2X + sigWidth / 2 - vobo2W / 2,
      y: cursorY - 12,
      size: 8.5,
      font,
      color: COLOR_TEXT,
    });

    // =========================================================================
    // 6. RENDERIZAR Y MOSTRAR EN NAVEGADOR
    // =========================================================================
    const pdfFinalBytes = await pdfDoc.save();
    const blob = new Blob([pdfFinalBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, "_blank");
    return { success: true };
  } catch (error) {
    console.error("Error al generar PDF de Acta de Inicio 2do Año:", error);
    return {
      success: false,
      message: `Error al procesar el documento PDF: ${error.message}`,
    };
  }
};