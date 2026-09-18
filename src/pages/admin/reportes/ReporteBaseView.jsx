import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart2, 
  Printer, 
  FileSpreadsheet, 
  Sparkles,
  Loader2,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { especialidadService } from '../../../services/especialidadService';
import { studentService } from '../../../services/studentService';
import { gestionService } from '../../../services/gestionService';

import { centralizador1erAnoService } from '../../../services/fichas/1año/centralizador1erAnoService';
import { centralizador2doAnoService } from '../../../services/fichas/2año/centralizador2doAnoService';
import { centralizador3erAnoService } from '../../../services/fichas/3año/centralizador3erAnoService';
import { centralizador4toAnoService } from '../../../services/fichas/4año/centralizador4toAnoService';
import { centralizador5toAnoService } from '../../../services/fichas/5año/centralizador5toAnoService';

// MAPEO DE FICHAS Y CAMPOS DEL CENTRALIZADOR SEGÚN EL AÑO DE FORMACIÓN
const CONFIG_FICHAS_POR_ANO = {
  '1ro': [
    { key: 'f1', label: 'F-1', field: ['nota_f1', 'f1'] },
    { key: 'f2', label: 'F-2', field: ['nota_f2', 'f2'] },
    { key: 'f3', label: 'F-3', field: ['nota_f3', 'f3'] },
    { key: 'f4', label: 'F-4', field: ['nota_f4', 'f4'] },
    { key: 'f5', label: 'F-5', field: ['nota_f5', 'f5'] }
  ],
  '2do': [
    { key: 'f1', label: 'F-1', field: ['nota_f1', 'f1'] },
    { key: 'f2', label: 'F-2', field: ['nota_f2', 'f2'] },
    { key: 'f3', label: 'F-3', field: ['nota_f3', 'f3'] },
    { key: 'f4', label: 'F-4', field: ['nota_f4', 'f4'] },
    { key: 'f5', label: 'F-5', field: ['nota_f5', 'f5'] },
    { key: 'f6', label: 'F-6', field: ['nota_f6', 'f6'] }
  ],
  '3ro': [
    { key: 'f1', label: 'A-1', field: ['nota_a1', 'a1'] },
    { key: 'f2', label: 'B-1', field: ['nota_b1', 'b1'] },
    { key: 'f3', label: 'B-2', field: ['nota_b2', 'b2'] },
    { key: 'f4', label: 'B-3', field: ['nota_b3', 'b3'] },
    { key: 'f5', label: 'B-4', field: ['nota_b4', 'b4'] },
    { key: 'f6', label: 'B-5', field: ['nota_b5', 'b5'] }
  ],
  '4to': [
    { key: 'f1', label: 'A-1', field: ['nota_a1', 'a1'] },
    { key: 'f2', label: 'A-2', field: ['nota_a2', 'a2'] },
    { key: 'f3', label: 'B-1', field: ['nota_b1', 'b1'] },
    { key: 'f4', label: 'B-2', field: ['nota_b2', 'b2'] },
    { key: 'f5', label: 'B-3', field: ['nota_b3', 'b3'] },
    { key: 'f6', label: 'B-4', field: ['nota_b4', 'b4'] },
    { key: 'f7', label: 'B-5', field: ['nota_b5', 'b5'] },
    { key: 'f8', label: 'B-6', field: ['nota_b6', 'b6'] },
    { key: 'f9', label: 'B-7', field: ['nota_b7', 'b7'] },
    { key: 'f10', label: 'C-1', field: ['nota_c1', 'c1'] },
    { key: 'f11', label: 'C-2', field: ['nota_c2', 'c2'] }
  ],
  '5to': [
    { key: 'f1', label: 'A-1', field: ['nota_a1', 'a1'] },
    { key: 'f2', label: 'B-1', field: ['nota_b1', 'b1'] },
    { key: 'f3', label: 'B-2', field: ['nota_b2', 'b2'] },
    { key: 'f4', label: 'B-3', field: ['nota_b3', 'b3'] },
    { key: 'f5', label: 'B-4', field: ['nota_b4', 'b4'] },
    { key: 'f6', label: 'B-5', field: ['nota_b5', 'b5'] },
    { key: 'f7', label: 'B-6', field: ['nota_b6', 'b6'] },
    { key: 'f8', label: 'C-1', field: ['nota_c1', 'c1'] },
    { key: 'f9', label: 'C-2', field: ['nota_c2', 'c2'] }
  ]
};

export const ReporteBaseView = ({ tipo, titulo, descripcion }) => {
  const [gestiones, setGestiones] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);

  const [gestionFilter, setGestionFilter] = useState('2026');
  const [especialidadFilter, setEspecialidadFilter] = useState('');
  const [anoFilter, setAnoFilter] = useState('1ro');

  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const reportRef = useRef();

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
                nota: centralData.promedio_numeral || centralData.promedio_final || 0,
                docenteAcompanante: est.da_nombre ? `${est.da_nombre} ${est.da_apellido || ''}` : 'Sin Asignar'
              };
            })
          );
          setReportData(rowsWithCentralizer);
        }
        else if (tipo === 'etapa') {
          const fichasConfig = CONFIG_FICHAS_POR_ANO[anoFilter] || CONFIG_FICHAS_POR_ANO['1ro'];

          const rowsWithFichas = await Promise.all(
            filteredStudents.map(async (est) => {
              const c = await fetchCentralizadorByAno(anoFilter, est.id);
              
              const notasFichas = {};
              fichasConfig.forEach(ficha => {
                let val = 0;
                for (const fName of ficha.field) {
                  if (c[fName] !== undefined && c[fName] !== null) {
                    val = c[fName];
                    break;
                  }
                }
                notasFichas[ficha.key] = val;
              });

              return {
                id: est.id,
                estudiante: `${est.nombre || ''} ${est.apellido || ''}`.trim(),
                ci: est.ci,
                especialidad: est.especialidad || 'General',
                ...notasFichas,
                promedio: c.promedio_numeral || c.promedio_final || 0
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
            especialidad: est.especialidad || 'General',
            telefono: est.telefono || 'Sin registro',
            correo: est.correo || `${est.ci}@esfm.edu.bo`,
            anoFormacion: est.ano_formacion || anoFilter,
            estadoMatricula: est.estado || 'REGULAR'
          }));
          setReportData(rowsPersonal);
        }

      } catch (err) {
        console.error("Error al construir el reporte:", err);
        setErrorMessage("No se pudo obtener la información desde el servidor.");
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, [tipo, gestionFilter, especialidadFilter, anoFilter]);

  const currentFichasConfig = CONFIG_FICHAS_POR_ANO[anoFilter] || CONFIG_FICHAS_POR_ANO['1ro'];

  // AGRUPAR POR ESPECIALIDAD CUANDO SE SELECCIONA "TODAS"
  const groupedByEspecialidad = reportData.reduce((acc, current) => {
    const esp = current.especialidad || 'General';
    if (!acc[esp]) acc[esp] = [];
    acc[esp].push(current);
    return acc;
  }, {});

  // EXPORTAR A EXCEL (.xlsx)
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
      excelData = reportData.map(row => {
        const item = {
          'Especialidad': row.especialidad,
          'Estudiante': row.estudiante,
          'C.I.': row.ci
        };
        currentFichasConfig.forEach(f => {
          item[f.label] = row[f.key] || 0;
        });
        item['Promedio Final'] = row.promedio;
        return item;
      });
    } else if (tipo === 'gestion') {
      excelData = reportData.map(row => ({
        'Código': row.codigoEstudiante,
        'Estudiante': row.estudiante,
        'C.I.': row.ci,
        'Especialidad': row.especialidad,
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

  // EXPORTAR A PDF CON SECCIONES SEPARADAS POR ESPECIALIDAD
  const handleExportPDF = () => {
    if (reportData.length === 0) return;

    const doc = new jsPDF({
      orientation: anoFilter === '4to' || anoFilter === '5to' ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const totalPagesExp = '{total_pages_count_string}';

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(128, 27, 40);
    doc.text('ESFM "THEA" - IEPC-PEC', 14, 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Escuela Superior de Formación de Maestros - ${titulo}`, 14, 20);

    doc.setFontSize(8);
    doc.text(`Fecha Emisión: ${new Date().toLocaleDateString('es-BO')}`, doc.internal.pageSize.width - 14, 15, { align: 'right' });
    doc.text(`Gestión: ${gestionFilter}`, doc.internal.pageSize.width - 14, 20, { align: 'right' });

    doc.setDrawColor(128, 27, 40);
    doc.setLineWidth(0.5);
    doc.line(14, 23, doc.internal.pageSize.width - 14, 23);

    let startY = 28;

    Object.keys(groupedByEspecialidad).forEach((espec, index) => {
      const listEst = groupedByEspecialidad[espec];

      if (index > 0 && startY > doc.internal.pageSize.height - 40) {
        doc.addPage();
        startY = 20;
      }

      doc.setFillColor(241, 245, 249);
      doc.rect(14, startY, doc.internal.pageSize.width - 28, 7, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`ESPECIALIDAD: ${espec.toUpperCase()} (${listEst.length} Estudiantes)`, 18, startY + 5);

      startY += 10;

      let columns = [];
      let rows = [];

      if (tipo === 'especialidad') {
        columns = ['Código', 'Estudiante', 'C.I.', 'Nota', 'Docente Acompañante'];
        rows = listEst.map(r => [r.codigoEstudiante, r.estudiante, r.ci, `${r.nota} pts`, r.docenteAcompanante]);
      } else if (tipo === 'etapa') {
        columns = ['Estudiante', 'C.I.', ...currentFichasConfig.map(f => f.label), 'Promedio'];
        rows = listEst.map(r => [
          r.estudiante,
          r.ci,
          ...currentFichasConfig.map(f => r[f.key] || 0),
          `${r.promedio} pts`
        ]);
      } else if (tipo === 'gestion') {
        columns = ['Código', 'Estudiante', 'C.I.', 'Teléfono', 'Correo', 'Estado'];
        rows = listEst.map(r => [r.codigoEstudiante, r.estudiante, r.ci, r.telefono, r.correo, r.estadoMatricula]);
      }

      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: startY,
        theme: 'grid',
        headStyles: {
          fillColor: [128, 27, 40],
          textColor: [255, 255, 255],
          fontSize: 7,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [30, 41, 59]
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        }
      });

      startY = doc.lastAutoTable.finalY + 10;
    });

    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }

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

      {/* FILTROS DINÁMICOS */}
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
            <option value="1ro">1er año (5 Fichas: F1 a F5)</option>
            <option value="2do">2do año (6 Fichas: F1 a F6)</option>
            <option value="3ro">3er año (6 Fichas: A1, B1 a B5)</option>
            <option value="4to">4to año (11 Fichas: A, B, C)</option>
            <option value="5to">5to año (9 Fichas: A, B, C)</option>
          </select>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={18} />
          {errorMessage}
        </div>
      )}

      {/* RENDERIZADO DE TABLAS POR ESPECIALIDAD */}
      <div className="space-y-6">
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 font-bold text-xs">
            <Loader2 className="animate-spin inline-block mr-2 text-[#801B28]" size={22} />
            Cargando expedientes de estudiantes...
          </div>
        ) : reportData.length > 0 ? (
          Object.keys(groupedByEspecialidad).map((especialidadNombre) => (
            <div key={especialidadNombre} className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              
              {/* ENCABEZADO DE ESPECIALIDAD */}
              <div className="bg-slate-100/80 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap size={18} className="text-[#801B28]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {especialidadNombre}
                  </h3>
                </div>
                <span className="text-[11px] font-extrabold bg-white px-3 py-1 rounded-full text-slate-600 border border-slate-200">
                  {groupedByEspecialidad[especialidadNombre].length} Estudiantes
                </span>
              </div>

              <div className="overflow-x-auto">
                {/* 1. VISTA ETAPAS / FICHAS DINÁMICAS */}
                {tipo === 'etapa' && (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Estudiante</th>
                        <th className="py-3.5 px-4 font-mono">C.I.</th>
                        {currentFichasConfig.map((fHeader) => (
                          <th key={fHeader.key} className="py-3.5 px-4 font-mono text-center">
                            {fHeader.label}
                          </th>
                        ))}
                        <th className="py-3.5 px-4 font-mono text-emerald-800 text-right">Promedio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {groupedByEspecialidad[especialidadNombre].map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{row.estudiante}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-500">{row.ci}</td>
                          {currentFichasConfig.map((fHeader) => (
                            <td key={fHeader.key} className="py-3.5 px-4 font-mono text-center">
                              {row[fHeader.key] || 0}
                            </td>
                          ))}
                          <td className="py-3.5 px-4 font-mono font-black text-emerald-700 text-right">
                            {row.promedio} pts
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* 2. VISTA ESPECIALIDAD */}
                {tipo === 'especialidad' && (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Código</th>
                        <th className="py-3.5 px-4">Estudiante</th>
                        <th className="py-3.5 px-4">C.I.</th>
                        <th className="py-3.5 px-4 font-mono text-center">Nota Final</th>
                        <th className="py-3.5 px-4">Docente Acompañante</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {groupedByEspecialidad[especialidadNombre].map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#801B28]">{row.codigoEstudiante}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">{row.estudiante}</td>
                          <td className="py-3.5 px-4 font-mono">{row.ci}</td>
                          <td className="py-3.5 px-4 font-mono font-black text-emerald-700 text-center text-sm">{row.nota} pts</td>
                          <td className="py-3.5 px-4 font-medium">{row.docenteAcompanante}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* 3. VISTA GESTIÓN */}
                {tipo === 'gestion' && (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Código</th>
                        <th className="py-3.5 px-4">Estudiante</th>
                        <th className="py-3.5 px-4">C.I.</th>
                        <th className="py-3.5 px-4">Teléfono</th>
                        <th className="py-3.5 px-4">Correo Institucional</th>
                        <th className="py-3.5 px-4">Estado Matrícula</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {groupedByEspecialidad[especialidadNombre].map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#801B28]">{row.codigoEstudiante}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">{row.estudiante}</td>
                          <td className="py-3.5 px-4 font-mono">{row.ci}</td>
                          <td className="py-3.5 px-4 font-mono">{row.telefono}</td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono">{row.correo}</td>
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
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 font-medium text-xs">
            No se encontraron registros de estudiantes para los filtros seleccionados ({gestionFilter} - {anoFilter}).
          </div>
        )}
      </div>
    </div>
  );
};