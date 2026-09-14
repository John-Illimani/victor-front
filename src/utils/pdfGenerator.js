import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CONFIGURACION_FICHAS } from "./camposFichas";

export const generarPdfFichaOficial = (estudiante, fichaInfo, datosFicha = {}) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const config = CONFIGURACION_FICHAS[fichaInfo.codigo] || {};
  let currentY = 14;

  // 1. ENCABEZADO MINISTERIAL Y AÑO DE FORMACIÓN
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  doc.text("PRESIDENCIA DEL ESTADO PLURINACIONAL DE BOLIVIA", pageWidth / 2, currentY, { align: "center" });
  currentY += 4;
  doc.text("MINISTERIO DE EDUCACIÓN", pageWidth / 2, currentY, { align: "center" });
  currentY += 5;

  // Banner Burdeos Oficial (#801B28)
  doc.setFillColor(128, 27, 40);
  doc.rect(14, currentY, pageWidth - 28, 6.5, "F");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`${(estudiante.ano_formacion || "1er Año").toUpperCase()} DE FORMACIÓN - GESTIÓN 2026`, pageWidth / 2, currentY + 4.5, { align: "center" });
  currentY += 10;

  // Título oficial
  doc.setFontSize(10.5);
  doc.setTextColor(128, 27, 40);
  const tituloText = (config.titulo || fichaInfo.nombre || "FICHA EVALUATIVA").toUpperCase();
  const splitTitulo = doc.splitTextToSize(tituloText, pageWidth - 30);
  doc.text(splitTitulo, pageWidth / 2, currentY, { align: "center" });
  currentY += splitTitulo.length * 4.5 + 4;

  // 2. RECUADRO DE DATOS REFERENCIALES
  doc.setLineWidth(0.3);
  doc.setDrawColor(180, 180, 180);
  doc.setFillColor(248, 249, 250);
  doc.rect(14, currentY, pageWidth - 28, 24, "FD");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("DATOS REFERENCIALES DEL ESTUDIANTE:", 18, currentY + 5);

  doc.setFont("helvetica", "normal");
  doc.text(`Nombres y Apellidos: ${estudiante.nombre || ""} ${estudiante.apellido || ""}`, 18, currentY + 9.5);
  doc.text(`Cédula de Identidad: ${estudiante.ci || ""}  |  Código: ${estudiante.username || ""}`, 18, currentY + 14);
  doc.text(`Especialidad: ${estudiante.especialidad || ""}`, 18, currentY + 18.5);

  doc.text(`ESFM/UA: ${estudiante.esfm_ua || "ESFM/UA - El Alto"}`, 115, currentY + 9.5);
  doc.text(`Docente Acompañante: ${estudiante.da_nombre ? `${estudiante.da_nombre} ${estudiante.da_apellido}` : "Sin Asignar"}`, 115, currentY + 14);
  doc.text(`Docente Guía: ${estudiante.dg_nombre ? `${estudiante.dg_nombre} ${estudiante.dg_apellido}` : "Sin Asignar"}`, 115, currentY + 18.5);

  currentY += 28;

  // 3. TABLA DINÁMICA DE CRITERIOS Y VALORACIONES POSTGRESQL
  let tableHead = [["ACTIVIDADES / INDICADORES DE EVALUACIÓN", "VALORACIÓN (1-100)"]];
  let tableBody = [];

  if (config.criterios) {
    tableBody = config.criterios.map(c => [
      c.label,
      datosFicha[c.key] !== undefined && datosFicha[c.key] !== null ? `${datosFicha[c.key]}` : "0"
    ]);
  } else {
    tableBody = [["Puntaje Asignado", datosFicha.promedio_numeral || datosFicha.puntaje_final || "0"]];
  }

  // --- SOLUCIÓN DEL ERROR: Usar la función autoTable importada directamente ---
  autoTable(doc, {
    startY: currentY,
    head: tableHead,
    body: tableBody,
    theme: "grid",
    headStyles: { fillColor: [128, 27, 40], textColor: [255, 255, 255], fontSize: 7.5, fontStyle: "bold", halign: "center" },
    bodyStyles: { fontSize: 7.5, textColor: [30, 30, 30] },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 35, halign: "center", fontStyle: "bold" }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 5;

  // 4. PROMEDIO NUMERAL, LITERAL Y OBSERVACIONES
  const promVal = datosFicha.promedio_numeral || datosFicha.puntaje_final || datosFicha.promedio_final || datosFicha.promedio_total || datosFicha.promedio_parcial || "0.00";
  const promLit = datosFicha.promedio_literal || datosFicha.puntaje_literal || "CERO CON 00/100";

  doc.setFillColor(240, 240, 240);
  doc.rect(14, currentY, pageWidth - 28, 11, "FD");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`PROMEDIO NUMERAL: ${promVal} / 100 PTS.`, 18, currentY + 4.5);
  doc.text(`PROMEDIO LITERAL: ${promLit.toUpperCase()}`, 18, currentY + 8.5);

  currentY += 15;

  doc.setFont("helvetica", "bold");
  doc.text("OBSERVACIONES Y/O SUGERENCIAS PEDAGÓGICAS:", 14, currentY);
  currentY += 3;

  doc.setFont("helvetica", "normal");
  doc.rect(14, currentY, pageWidth - 28, 16);
  const textObs = datosFicha.observaciones || datosFicha.recomendaciones || "Sin observaciones registradas.";
  const splitObs = doc.splitTextToSize(textObs, pageWidth - 32);
  doc.text(splitObs, 17, currentY + 4.5);

  currentY += 25;

  // 5. FIRMAS DE CONFORMIDAD
  if (currentY + 25 > doc.internal.pageSize.getHeight()) {
    doc.addPage();
    currentY = 35;
  }

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");

  const lineY = currentY + 10;
  const c1 = 25, c2 = 85, c3 = 145;

  doc.line(c1, lineY, c1 + 45, lineY);
  doc.text("Estudiante Practicante", c1 + 22.5, lineY + 3.5, { align: "center" });
  doc.text(`C.I. ${estudiante.ci || ""}`, c1 + 22.5, lineY + 6.5, { align: "center" });

  doc.line(c2, lineY, c2 + 45, lineY);
  doc.text(config.docenteRol || "Docente Acompañante", c2 + 22.5, lineY + 3.5, { align: "center" });
  doc.text("ESFM/UA - El Alto", c2 + 22.5, lineY + 6.5, { align: "center" });

  doc.line(c3, lineY, c3 + 45, lineY);
  doc.text("Docente Guía / Director", c3 + 22.5, lineY + 3.5, { align: "center" });
  doc.text("Unidad Educativa", c3 + 22.5, lineY + 6.5, { align: "center" });

  doc.save(`${fichaInfo.codigo}_${estudiante.ci}_2026.pdf`);
};