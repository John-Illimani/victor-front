import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart2, 
  Printer, 
  FileSpreadsheet, 
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';

// LIBRERÍAS PARA DESCARGA DIRECTA DE PDF Y EXCEL
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- IMPORTANTE: Importación directa de autoTable
import * as XLSX from 'xlsx';

// SERVICIOS DE API
import { especialidadService } from '../../../services/especialidadService';
import { studentService } from '../../../services/studentService';
import { gestionService } from '../../../services/gestionService';

import { centralizador1erAnoService } from '../../../services/fichas/1año/centralizador1erAnoService';
import { centralizador2doAnoService } from '../../../services/fichas/2año/centralizador2doAnoService';
import { centralizador3erAnoService } from '../../../services/fichas/3año/centralizador3erAnoService';
import { centralizador4toAnoService } from '../../../services/fichas/4año/centralizador4toAnoService';
import { centralizador5toAnoService } from '../../../services/fichas/5año/centralizador5toAnoService';

export const ReporteBaseView = ({ tipo, titulo, descripcion }) => {
  // ESTADOS DE FILTROS REALES
  const [gestiones, setGestiones] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);

  const [gestionFilter, setGestionFilter] = useState('2026');
  const [especialidadFilter, setEspecialidadFilter] = useState(''); // "" = Todas las Especialidades
  const [anoFilter, setAnoFilter] = useState('1ro');

  // ESTADOS DE DATOS REALES Y CARGA
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const reportRef = useRef();

  // 1. CARGA DE OPCIONES DINÁMICAS (GESTIONES Y ESPECIALIDADES)
  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const [dataEspec, dataGest] = await Promise.all([
          especialidadService.getEspecialidades(),
          gestionService.getGestiones()
        ]);

        const listEspec = Array.isArray(dataEspec) ? dataEspec : dataEspec?.especialidades || [];
        setEspecialidades(listEspec);

        const listGest = Array.isArray(dataGest) ? dataGest : [];
        setGestiones(listGest);
        if (listGest.length > 0) {
          const gestActiva = listGest.find(g => g.estado === 'Activa' || g.estado === 'ACTIVA');
          setGestionFilter(gestActiva ? (gestActiva.anio || gestActiva.gestion) : (listGest[0].anio || listGest[0].gestion));
        }
      } catch (err) {
        console.error("Error al cargar catálogos iniciales:", err);
      }
    };

    fetchCatalogos();
  }, []);

  // 2. HELPER PARA CONSULTAR LA API DE CENTRALIZADOR SEGÚN EL AÑO DE FORMACIÓN
  const fetchCentralizadorByAno = async (ano, estudianteId) => {
    const anoNorm = String(ano || '').toLowerCase();

    try {
      if (anoNorm.includes('1') || anoNorm.includes('primer')) {
        const res = await centralizador1erAnoService.getByEstudiante(estudianteId);
        return res.datos || {};
      }
      if (anoNorm.includes('2') || anoNorm.includes('segundo')) {
        const res = await centralizador2doAnoService.getByEstudiante(estudianteId);
        return res.datos || {};
      }
      if (anoNorm.includes('3') || anoNorm.includes('tercer')) {
        const res = await centralizador3erAnoService.getByEstudiante(estudianteId);
        return res.datos || {};
      }
      if (anoNorm.includes('4') || anoNorm.includes('cuarto')) {
        const res = await centralizador4toAnoService.getByEstudiante(estudianteId);
        return res.datos || {};
      }
      if (anoNorm.includes('5') || anoNorm.includes('quinto')) {
        const res = await centralizador5toAnoService.getByEstudiante(estudianteId);
        return res.datos || {};
      }
    } catch (err) {
      console.warn(`Sin registro centralizador para estudiante ${estudianteId}:`, err);
    }
    return {};
  };

  // 3. CARGAR REPORTES CONECTADOS A LAS APIS REALES
  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true);
      setErrorMessage(null);
      setReportData([]);

      try {
        const responseEstud = await studentService.getStudents();
        const allStudents = Array.isArray(responseEstud) ? responseEstud : responseEstud?.estudiantes || [];

        const filteredStudents = allStudents.filter(est => {
          const estAno = String(est.ano_formacion || '').toLowerCase();
          const targetAno = String(anoFilter).toLowerCase();
          const matchAno = estAno.includes(targetAno.replace('año', '').trim());

          const estEspec = String(est.especialidad || '').toLowerCase().trim();
          const targetEspec = String(especialidadFilter).toLowerCase().trim();
          const matchEspec = !especialidadFilter || estEspec === targetEspec;

          return matchAno && matchEspec;
        });

        if (tipo === 'especialidad') {
          const rowsWithCentralizer = await Promise.all(
            filteredStudents.map(async (est) => {
              const centralData = await fetchCentralizadorByAno(anoFilter, est.id);
              return {
                id: est.id,
                codigoEstudiante: est.codigo_estudiante || est.ci || 'S/C',
                estudiante: `${est.nombre || ''} ${est.apellido || ''}`.trim(),
                ci: est.ci,
                especialidad: est.especialidad || 'General',
                nota: centralData.promedio_numeral || 0,
                docenteAcompanante: est.docente_acompanante || 'Sin Asignar'
              };
            })
          );
          setReportData(rowsWithCentralizer);
        }
        else if (tipo === 'etapa') {
          const rowsWithFichas = await Promise.all(
            filteredStudents.map(async (est) => {
              const c = await fetchCentralizadorByAno(anoFilter, est.id);
              return {
                id: est.id,
                estudiante: `${est.nombre || ''} ${est.apellido || ''}`.trim(),
                ci: est.ci,
                f1: c.nota_f1 || c.nota_a1 || 0,
                f2: c.nota_f2 || c.nota_a2 || c.nota_b1 || 0,
                f3: c.nota_f3 || c.nota_b2 || 0,
                f4: c.nota_f4 || c.nota_b3 || c.nota_b4 || 0,
                f5: c.nota_f5 || c.nota_b5 || 0,
                f6: c.nota_f6 || c.nota_c1 || 0,
                promedio: c.promedio_numeral || 0
              };
            })
          );
          setReportData(rowsWithFichas);
        }
        else if (tipo === 'gestion') {
          const rowsPersonal = filteredStudents.map(est => ({
            id: est.id,
            codigoEstudiante: est.codigo_estudiante || est.ci || 'S/C',
            estudiante: `${est.nombre || ''} ${est.apellido || ''}`.trim(),
            ci: est.ci,
            telefono: est.telefono || 'Sin registro',
            correo: est.correo || `${est.ci}@esfm.edu.bo`,
            anoFormacion: est.ano_formacion || anoFilter,
            estadoMatricula: est.estado || 'REGULAR'
          }));
          setReportData(rowsPersonal);
        }

      } catch (err) {
        console.error("Error al construir el reporte:", err);
        setErrorMessage("No se pudo obtener la información desde el servidor. Verifique la conexión.");
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, [tipo, gestionFilter, especialidadFilter, anoFilter]);

  // ETIQUETAS DINÁMICAS DE LAS FICHAS SEGÚN EL AÑO
  const getFichasHeaders = (ano) => {
    const anoNorm = String(ano).toLowerCase();
    if (anoNorm.includes('1') || anoNorm.includes('2')) {
      return ['F-1', 'F-2', 'F-3', 'F-4', 'F-5', 'F-6'];
    }
    if (anoNorm.includes('3')) {
      return ['A-1', 'B-1', 'B-2', 'B-3', 'B-4', 'B-5'];
    }
    if (anoNorm.includes('4')) {
      return ['A-1', 'A-2', 'B-1', 'B-4', 'C-1', 'C-2'];
    }
    return ['A-1', 'B-1', 'B-4', 'B-5', 'C-1', 'C-2'];
  };

  const fichasHeaders = getFichasHeaders(anoFilter);

  // 4. DESCARGA DIRECTA DE EXCEL (.xlsx)
  const handleExportExcel = () => {
    if (reportData.length === 0) return;

    let excelData = [];

    if (tipo === 'especialidad') {
      excelData = reportData.map(row => ({
        'Código Estudiante': row.codigoEstudiante,
        'Estudiante': row.estudiante,
        'C.I.': row.ci,
        'Especialidad': row.especialidad,
        'Nota Final': row.nota,
        'Docente Acompañante': row.docenteAcompanante
      }));
    } else if (tipo === 'etapa') {
      excelData = reportData.map(row => ({
        'Estudiante': row.estudiante,
        'C.I.': row.ci,
        [fichasHeaders[0]]: row.f1,
        [fichasHeaders[1]]: row.f2,
        [fichasHeaders[2]]: row.f3,
        [fichasHeaders[3]]: row.f4,
        [fichasHeaders[4]]: row.f5,
        [fichasHeaders[5]]: row.f6,
        'Promedio Final': row.promedio
      }));
    } else if (tipo === 'gestion') {
      excelData = reportData.map(row => ({
        'Código': row.codigoEstudiante,
        'Estudiante': row.estudiante,
        'C.I.': row.ci,
        'Teléfono': row.telefono,
        'Correo Institucional': row.correo,
        'Año Formación': row.anoFormacion,
        'Estado Matrícula': row.estadoMatricula
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');

    const fileName = `Reporte_${tipo}_${gestionFilter}_${anoFilter}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // 5. DESCARGA DIRECTA DE PDF CON MARCA DE AGUA (autoTable)
  const handleExportPDF = () => {
    if (reportData.length === 0) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const totalPagesExp = '{total_pages_count_string}';

    // ENCABEZADO INSTITUCIONAL
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(128, 27, 40); // #801B28
    doc.text('ESFM "THEA" - IEPC-PEC', 14, 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Escuela Superior de Formación de Maestros - ${titulo}`, 14, 20);

    doc.setFontSize(8);
    doc.text(`Fecha Emisión: ${new Date().toLocaleDateString('es-BO')}`, 195, 15, { align: 'right' });
    doc.text(`Gestión: ${gestionFilter}`, 195, 20, { align: 'right' });

    doc.setDrawColor(128, 27, 40);
    doc.setLineWidth(0.5);
    doc.line(14, 23, 198, 23);

    // FILTROS INFORMACIÓN
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 26, 184, 8, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    
    const especTexto = especialidadFilter ? especialidadFilter : 'Todas las Especialidades';
    doc.text(`Especialidad: ${especTexto}   |   Año: ${anoFilter}   |   Total Registros: ${reportData.length}`, 18, 31);

    // PREPARACIÓN DE COLUMNAS Y FILAS
    let columns = [];
    let rows = [];

    if (tipo === 'especialidad') {
      columns = ['Código', 'Estudiante', 'C.I.', 'Especialidad', 'Nota', 'Docente Acompañante'];
      rows = reportData.map(r => [
        r.codigoEstudiante,
        r.estudiante,
        r.ci,
        r.especialidad,
        `${r.nota} pts`,
        r.docenteAcompanante
      ]);
    } else if (tipo === 'etapa') {
      columns = ['Estudiante', 'C.I.', ...fichasHeaders, 'Promedio'];
      rows = reportData.map(r => [
        r.estudiante,
        r.ci,
        r.f1,
        r.f2,
        r.f3,
        r.f4,
        r.f5,
        r.f6,
        `${r.promedio} pts`
      ]);
    } else if (tipo === 'gestion') {
      columns = ['Código', 'Estudiante', 'C.I.', 'Teléfono', 'Correo Institucional', 'Año', 'Estado'];
      rows = reportData.map(r => [
        r.codigoEstudiante,
        r.estudiante,
        r.ci,
        r.telefono,
        r.correo,
        r.anoFormacion,
        r.estadoMatricula
      ]);
    }

    // GENERACIÓN DE TABLA USANDO EL MÉTODONATIVO autoTable(doc, ...)
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 38,
      theme: 'grid',
      headStyles: {
        fillColor: [128, 27, 40],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [30, 41, 59]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      didDrawPage: (data) => {
        // MARCA DE AGUA DIAGONAL
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.05 }));
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(128, 27, 40);
        doc.text(`ESFM THEA - IEPC-PEC ${gestionFilter}`, 105, 140, {
          align: 'center',
          angle: 35
        });
        doc.restoreGraphicsState();

        // PIE DE PÁGINA
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text('Documento Oficial generado por la Plataforma IEPC-PEC ESFM THEA', 14, pageHeight - 10);
        
        let str = `Página ${doc.internal.getNumberOfPages()}`;
        if (typeof doc.putTotalPages === 'function') {
          str = `${str} de ${totalPagesExp}`;
        }
        doc.text(str, 198, pageHeight - 10, { align: 'right' });
      }
    });

    // SECCIÓN DE FIRMAS AL FINAL
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 25 : 200;
    const pageHeight = doc.internal.pageSize.height;

    if (finalY < pageHeight - 40) {
      doc.setLineWidth(0.3);
      doc.setDrawColor(51, 65, 85);
      
      doc.line(30, finalY, 85, finalY);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('Docente Acompañante IEPC-PEC', 57.5, finalY + 4, { align: 'center' });

      doc.line(125, finalY, 180, finalY);
      doc.text('Dirección Académica ESFM THEA', 152.5, finalY + 4, { align: 'center' });
    }

    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }

    // DESCARGA DIRECTA
    doc.save(`Reporte_${tipo}_${gestionFilter}_${anoFilter}.pdf`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* BANNER ENCABEZADO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <BarChart2 size={14} className="text-[#8C731A]" /> Módulo de Reportes Oficiales
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              {titulo}
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {descripcion}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleExportExcel}
              disabled={loading || reportData.length === 0}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet size={16} /> Exportar Excel
            </button>
            <button
              onClick={handleExportPDF}
              disabled={loading || reportData.length === 0}
              className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-4 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-[#a32334] transition-all cursor-pointer disabled:opacity-50"
            >
              <Printer size={16} /> Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {/* FILTROS DE SELECCIÓN DINÁMICOS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Gestión:</label>
          <select
            value={gestionFilter}
            onChange={(e) => setGestionFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none bg-white cursor-pointer"
          >
            {gestiones.map((g) => (
              <option key={g.id || g.gestion || g.anio} value={g.anio || g.gestion}>
                Gestión {g.anio || g.gestion}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Especialidad:</label>
          <select
            value={especialidadFilter}
            onChange={(e) => setEspecialidadFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none bg-white cursor-pointer"
          >
            <option value="">Todas las Especialidades</option>
            {especialidades.map((esp) => (
              <option key={esp.id || esp.nombre} value={esp.nombre || esp.especialidad}>
                {esp.nombre || esp.especialidad}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Año de Formación:</label>
          <select
            value={anoFilter}
            onChange={(e) => setAnoFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none bg-white cursor-pointer"
          >
            <option value="1ro">1er año</option>
            <option value="2do">2do año</option>
            <option value="3ro">3er año</option>
            <option value="4to">4to año</option>
            <option value="5to">5to año</option>
          </select>
        </div>
      </div>

      {/* ESTADO DE ERROR */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={18} />
          {errorMessage}
        </div>
      )}

      {/* TABLA DE RESULTADOS O INDICADOR DE CARGA */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-bold text-xs">
            <Loader2 className="animate-spin inline-block mr-2 text-[#801B28]" size={22} />
            Consultando registros y centralizadores desde la base de datos...
          </div>
        ) : reportData.length > 0 ? (
          <div ref={reportRef} className="overflow-x-auto">
            
            {/* 1. VISTA DE TABLA: POR ESPECIALIDAD */}
            {tipo === 'especialidad' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Código estudiante</th>
                    <th className="py-3.5 px-4">Estudiante</th>
                    <th className="py-3.5 px-4">C.I.</th>
                    <th className="py-3.5 px-4">Especialidad</th>
                    <th className="py-3.5 px-4 font-mono text-center">Nota Final</th>
                    <th className="py-3.5 px-4">Docente Acompañante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {reportData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#801B28]">{row.codigoEstudiante}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{row.estudiante}</td>
                      <td className="py-3.5 px-4 font-mono">{row.ci}</td>
                      <td className="py-3.5 px-4">{row.especialidad}</td>
                      <td className="py-3.5 px-4 font-mono font-black text-emerald-700 text-center text-sm">{row.nota} pts</td>
                      <td className="py-3.5 px-4 font-medium">{row.docenteAcompanante}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 2. VISTA DE TABLA: POR ETAPA */}
            {tipo === 'etapa' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Estudiante</th>
                    <th className="py-3.5 px-4 font-mono">C.I.</th>
                    {fichasHeaders.map((fHeader) => (
                      <th key={fHeader} className="py-3.5 px-4 font-mono text-center">{fHeader}</th>
                    ))}
                    <th className="py-3.5 px-4 font-mono text-emerald-800 text-right">Promedio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {reportData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{row.estudiante}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{row.ci}</td>
                      <td className="py-3.5 px-4 font-mono text-center">{row.f1}</td>
                      <td className="py-3.5 px-4 font-mono text-center">{row.f2}</td>
                      <td className="py-3.5 px-4 font-mono text-center">{row.f3}</td>
                      <td className="py-3.5 px-4 font-mono text-center">{row.f4}</td>
                      <td className="py-3.5 px-4 font-mono text-center">{row.f5}</td>
                      <td className="py-3.5 px-4 font-mono text-center">{row.f6}</td>
                      <td className="py-3.5 px-4 font-mono font-black text-emerald-700 text-right">{row.promedio} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 3. VISTA DE TABLA: POR GESTIÓN */}
            {tipo === 'gestion' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Código</th>
                    <th className="py-3.5 px-4">Estudiante</th>
                    <th className="py-3.5 px-4">C.I.</th>
                    <th className="py-3.5 px-4">Teléfono</th>
                    <th className="py-3.5 px-4">Correo Institucional</th>
                    <th className="py-3.5 px-4">Año</th>
                    <th className="py-3.5 px-4">Estado Matrícula</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {reportData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#801B28]">{row.codigoEstudiante}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{row.estudiante}</td>
                      <td className="py-3.5 px-4 font-mono">{row.ci}</td>
                      <td className="py-3.5 px-4 font-mono">{row.telefono}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">{row.correo}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{row.anoFormacion}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {row.estadoMatricula}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 font-medium text-xs">
            No se encontraron registros de estudiantes para los filtros seleccionados ({gestionFilter} - {anoFilter}).
          </div>
        )}
      </div>
    </div>
  );
};