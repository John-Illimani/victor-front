import React, { useState } from 'react';
import { 
  BarChart2, 
  Printer, 
  FileSpreadsheet, 
  Sparkles,
  Award,
  Calendar,
  Layers,
  GraduationCap
} from 'lucide-react';

export const ReporteBaseView = ({ tipo, titulo, descripcion }) => {
  const [gestionFilter, setGestionFilter] = useState('2026');
  const [especialidadFilter, setEspecialidadFilter] = useState('Educación Primaria Comunitaria Vocacional');
  const [anoFilter, setAnoFilter] = useState('2do año');

  // Datos de ejemplo
  const reportEspecialidadData = [
    {
      codigoEstudiante: 'EST-2026-001',
      estudiante: 'Juan Carlos Pérez Gómez',
      ci: '8492012',
      especialidad: 'Educación Primaria Comunitaria Vocacional',
      nota: 92,
      docenteAcompanante: 'Dra. Elena Quisbert Flores'
    },
    {
      codigoEstudiante: 'EST-2026-005',
      estudiante: 'Pedro Luis Mamani Calle',
      ci: '8392019',
      especialidad: 'Educación Primaria Comunitaria Vocacional',
      nota: 88,
      docenteAcompanante: 'Dra. Elena Quisbert Flores'
    }
  ];

  const reportEtapaData = [
    {
      estudiante: 'Juan Carlos Pérez Gómez',
      f1: 90, f2: 95, f3: 92, f4: 88, f5: 94, f6: 91, promedio: 91.6
    },
    {
      estudiante: 'Sonia Aliaga Chuquimia',
      f1: 85, f2: 88, f3: 90, f4: 82, f5: 86, f6: 89, promedio: 86.6
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* BANNER ENCABEZADO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <BarChart2 size={14} className="text-[#8C731A]" /> Módulo de Reportes
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
              onClick={() => alert('Generando Excel (.xlsx)...')}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-emerald-700 transition-all cursor-pointer"
            >
              <FileSpreadsheet size={16} /> Exportar Excel
            </button>
            <button
              onClick={() => alert('Generando PDF...')}
              className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-4 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-[#a32334] transition-all cursor-pointer"
            >
              <Printer size={16} /> Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Gestión:</label>
          <select
            value={gestionFilter}
            onChange={(e) => setGestionFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none bg-white cursor-pointer"
          >
            <option value="2025">Gestión 2025</option>
            <option value="2026">Gestión 2026</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Especialidad:</label>
          <select
            value={especialidadFilter}
            onChange={(e) => setEspecialidadFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none bg-white cursor-pointer"
          >
            <option value="Artes Plásticas y Visuales">Artes Plásticas y Visuales</option>
            <option value="Ciencias Naturales Biología-Geografía">Ciencias Naturales Biología-Geografía</option>
            <option value="Educación Inicial en Familia Comunitaria">Educación Inicial en Familia Comunitaria</option>
            <option value="Educación Musical">Educación Musical</option>
            <option value="Educación Primaria Comunitaria Vocacional">Educación Primaria Comunitaria Vocacional</option>
            <option value="Comunicación y Lenguajes – Lengua Extranjera Inglés">Comunicación y Lenguajes – Lengua Extranjera Inglés</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Año de Formación:</label>
          <select
            value={anoFilter}
            onChange={(e) => setAnoFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none bg-white cursor-pointer"
          >
            <option value="1er año">1er año</option>
            <option value="2do año">2do año</option>
            <option value="3er año">3er año</option>
            <option value="4to año">4to año</option>
            <option value="5to año">5to año</option>
          </select>
        </div>
      </div>

      {/* TABLAS SEGÚN REPORTE */}
      {tipo === 'especialidad' && (
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Código estudiante</th>
                  <th className="py-3.5 px-4">Estudiante</th>
                  <th className="py-3.5 px-4">C.I.</th>
                  <th className="py-3.5 px-4">Especialidad</th>
                  <th className="py-3.5 px-4 font-mono">Nota</th>
                  <th className="py-3.5 px-4">Docente acompañante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {reportEspecialidadData.map((row) => (
                  <tr key={row.codigoEstudiante} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#801B28]">{row.codigoEstudiante}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.estudiante}</td>
                    <td className="py-3.5 px-4 font-mono">{row.ci}</td>
                    <td className="py-3.5 px-4">{row.especialidad}</td>
                    <td className="py-3.5 px-4 font-mono font-black text-emerald-700 text-sm">{row.nota} pts</td>
                    <td className="py-3.5 px-4 font-medium">{row.docenteAcompanante}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tipo === 'etapa' && (
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Estudiante</th>
                  <th className="py-3.5 px-4 font-mono">F-1</th>
                  <th className="py-3.5 px-4 font-mono">F-2</th>
                  <th className="py-3.5 px-4 font-mono">F-3</th>
                  <th className="py-3.5 px-4 font-mono">F-4</th>
                  <th className="py-3.5 px-4 font-mono">F-5</th>
                  <th className="py-3.5 px-4 font-mono">F-6</th>
                  <th className="py-3.5 px-4 font-mono text-emerald-800">Promedio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {reportEtapaData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.estudiante}</td>
                    <td className="py-3.5 px-4 font-mono">{row.f1}</td>
                    <td className="py-3.5 px-4 font-mono">{row.f2}</td>
                    <td className="py-3.5 px-4 font-mono">{row.f3}</td>
                    <td className="py-3.5 px-4 font-mono">{row.f4}</td>
                    <td className="py-3.5 px-4 font-mono">{row.f5}</td>
                    <td className="py-3.5 px-4 font-mono">{row.f6}</td>
                    <td className="py-3.5 px-4 font-mono font-black text-emerald-700">{row.promedio} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(tipo === 'gestion' || tipo === 'estudiante') && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 font-medium">
          <p className="text-xs">Consolidando datos para el reporte por {tipo} ({gestionFilter})...</p>
        </div>
      )}
    </div>
  );
};