import React, { useState, useEffect } from 'react';
import { 
  FileBarChart2, 
  Printer, 
  FileSpreadsheet, 
  Sparkles, 
  Search, 
  Users, 
  Filter,
  Loader2,
  AlertCircle,
  School
} from 'lucide-react';

// LIBRERÍAS DE GENERACIÓN DIRECTA DE ARCHIVOS
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// SERVICIOS DE API
import { teacherService } from '../../../services/teacherService';
import { userService } from '../../../services/userService';

// HELPER DE NORMALIZACIÓN DE AÑO DE FORMACIÓN
const normalizarAnoStr = (cadena) => {
  if (!cadena) return '';
  const c = cadena.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (c.includes("1") || c.includes("primer")) return "1er Año";
  if (c.includes("2") || c.includes("segundo")) return "2do Año";
  if (c.includes("3") || c.includes("tercer")) return "3er Año";
  if (c.includes("4") || c.includes("cuarto")) return "4to Año";
  if (c.includes("5") || c.includes("quinto")) return "5to Año";
  return cadena;
};

export const ReportesGuia = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const [todosLosEstudiantes, setTodosLosEstudiantes] = useState([]);
  const [selectedAno, setSelectedAno] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEstudiantesAsignados = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const savedUserStr = localStorage.getItem("user");
        let currentUserData = savedUserStr ? JSON.parse(savedUserStr) : null;

        if (!currentUserData) {
          setErrorMessage("No se encontró la sesión del usuario autenticado.");
          setLoading(false);
          return;
        }

        try {
          const allUsers = await userService.getUsers();
          const list = Array.isArray(allUsers) ? allUsers : allUsers?.usuarios || [];
          const found = list.find(u => u.id === currentUserData.id || u.username === currentUserData.username);
          if (found) {
            currentUserData = found;
            localStorage.setItem("user", JSON.stringify(found));
          }
        } catch (e) {
          console.warn("Usando sesión guardada en localStorage.");
        }

        const docenteId = currentUserData.id || currentUserData.docente_id;
        if (docenteId) {
          const assigned = await teacherService.getAssignedStudents(docenteId);
          const listaEst = Array.isArray(assigned) ? assigned : assigned?.estudiantes || [];
          setTodosLosEstudiantes(listaEst);
        }

      } catch (err) {
        console.error("Error al obtener la nómina para reportes del docente guía:", err);
        setErrorMessage("Error de conexión al obtener la lista de estudiantes asignados.");
      } finally {
        setLoading(false);
      }
    };

    fetchEstudiantesAsignados();
  }, []);

  // FILTRADO DE ESTUDIANTES POR AÑO Y BÚSQUEDA
  const estudiantesDelAno = todosLosEstudiantes.filter(est => {
    if (selectedAno === 'TODOS') return true;
    const anoEst = normalizarAnoStr(est.ano_formacion);
    return anoEst === selectedAno;
  });

  const estudiantesFiltrados = estudiantesDelAno.filter(est => {
    const nombreCompleto = `${est.nombre || ''} ${est.apellido || ''}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return nombreCompleto.includes(search) || (est.ci && est.ci.includes(search));
  });

  // GENERACIÓN DE ARCHIVO EXCEL (.xlsx)
  const handleExportExcel = () => {
    if (estudiantesFiltrados.length === 0) {
      alert("No hay registros para exportar.");
      return;
    }

    const excelData = estudiantesFiltrados.map((est, index) => ({
      'N°': index + 1,
      'Estudiante Practicante': `${est.nombre || ''} ${est.apellido || ''}`.trim(),
      'C.I.': est.ci || 'S/N',
      'Año de Formación': normalizarAnoStr(est.ano_formacion),
      'Especialidad': est.especialidad || 'General',
      'Estado': est.estado || 'ACTIVO'
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    const tagAno = selectedAno === 'TODOS' ? 'Todos_los_Anos' : selectedAno.replace(' ', '_');
    XLSX.utils.book_append_sheet(workbook, worksheet, `Reporte_Guia_${tagAno}`);

    XLSX.writeFile(workbook, `Reporte_Practicantes_Guia_${tagAno}.xlsx`);
  };

  // GENERACIÓN DE DOCUMENTO PDF
  const handleExportPDF = () => {
    if (estudiantesFiltrados.length === 0) {
      alert("No hay registros para exportar.");
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const labelAno = selectedAno === 'TODOS' ? 'Todos los Años de Formación' : selectedAno;

    // TÍTULO OFICIAL
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(128, 27, 40);
    doc.text('REPORTE OFICIAL DE PRACTICANTES EN AULA - IEPC-PEC', 14, 14);

    // FECHA ALINEADA A LA DERECHA
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-BO')}`, 198, 14, { align: 'right' });

    // SUBTÍTULO DOCENTE GUÍA
    doc.setFontSize(8.5);
    doc.text(`Docente Guía (Maestro Titular U.E.) — Nómina de Practicantes (${labelAno})`, 14, 19);

    // LÍNEA DIVISORIA ENCABEZADO
    doc.setDrawColor(128, 27, 40);
    doc.setLineWidth(0.5);
    doc.line(14, 22, 198, 22);

    // BANDA INFORMATIVA DE FILTROS
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 25, 184, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`Filtro Seleccionado: ${labelAno}   |   Total Practicantes Asignados: ${estudiantesFiltrados.length}`, 18, 29.5);

    // TABLA DE DATOS
    const columns = ['N°', 'Estudiante Practicante', 'C.I.', 'Año de Formación', 'Especialidad'];
    const rows = estudiantesFiltrados.map((e, index) => [
      index + 1,
      `${e.nombre || ''} ${e.apellido || ''}`.trim(),
      e.ci || 'S/N',
      normalizarAnoStr(e.ano_formacion),
      e.especialidad || 'General'
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 35,
      theme: 'grid',
      headStyles: {
        fillColor: [128, 27, 40],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [30, 41, 59]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });

    // PIE DE PÁGINA Y SECCIÓN DE FIRMA
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 25 : 200;
    const pageHeight = doc.internal.pageSize.height;

    if (finalY < pageHeight - 35) {
      doc.setLineWidth(0.3);
      doc.setDrawColor(51, 65, 85);
      
      doc.line(70, finalY, 140, finalY);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Firma Docente Guía (Maestro Titular)', 105, finalY + 4, { align: 'center' });
    }

    const fileNameTag = selectedAno === 'TODOS' ? 'Todos_los_Anos' : selectedAno.replace(' ', '_');
    doc.save(`Reporte_Practicantes_Guia_${fileNameTag}.pdf`);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO INSTITUCIONAL */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <School size={14} className="text-[#8C731A]" /> Docente Guía (Maestro Titular U.E.)
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Reportes de Aula
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Consolidado y reporte de estudiantes practicantes asignados a tu aula para el seguimiento y evaluación.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleExportExcel}
              disabled={loading || estudiantesFiltrados.length === 0}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet size={16} /> Exportar Excel
            </button>
            <button
              onClick={handleExportPDF}
              disabled={loading || estudiantesFiltrados.length === 0}
              className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-4 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-[#a32334] transition-all cursor-pointer disabled:opacity-50"
            >
              <Printer size={16} /> Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={18} />
          {errorMessage}
        </div>
      )}

      {/* METRICA: TOTAL ESTUDIANTES PRACTICANTES */}
      <div className="max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
        <div className="flex items-center justify-between">
          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
            Total Practicantes ({selectedAno === 'TODOS' ? 'Todos los Años' : selectedAno})
          </span>
          <Users size={18} className="text-[#801B28]" />
        </div>
        <span className="block text-3xl font-black text-slate-900 font-mono">
          {estudiantesFiltrados.length} Practicantes
        </span>
        <span className="text-[10px] text-[#8C731A] font-bold block pt-1">
          Nómina asignada a tu aula
        </span>
      </div>

      {/* CONTROLES DE FILTRADO CON OPCIÓN 'TODOS' */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        
        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Filter size={14} className="text-[#801B28]" /> Filtrar por Año de Formación
          </label>
          <select
            value={selectedAno}
            onChange={(e) => setSelectedAno(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none bg-white cursor-pointer"
          >
            <option value="TODOS">Todos los Años</option>
            <option value="1er Año">1er Año</option>
            <option value="2do Año">2do Año</option>
            <option value="3er Año">3er Año</option>
            <option value="4to Año">4to Año</option>
            <option value="5to Año">5to Año</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Search size={14} className="text-[#801B28]" /> Buscar Practicante
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar por estudiante o C.I...."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2 text-xs font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
            />
          </div>
        </div>

      </div>

      {/* TABLA DE NÓMINA */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Estudiante Practicante</th>
                <th className="py-3.5 px-4">C.I.</th>
                <th className="py-3.5 px-4">Año de Formación</th>
                <th className="py-3.5 px-4">Especialidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500 font-bold">
                    <Loader2 className="animate-spin inline mr-2 text-[#801B28]" size={20} />
                    Cargando reporte de practicantes...
                  </td>
                </tr>
              ) : estudiantesFiltrados.length > 0 ? (
                estudiantesFiltrados.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{index + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.nombre} {item.apellido}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#801B28] font-bold">
                      {item.ci || 'S/C'}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-800">
                      {normalizarAnoStr(item.ano_formacion)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.especialidad || 'General'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">
                    No se encontraron practicantes asignados para el filtro seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};