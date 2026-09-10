import React, { useState } from 'react';
import { 
  FileBarChart2, 
  Printer, 
  FileSpreadsheet, 
  Sparkles, 
  Search, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Award,
  Filter,
  Download
} from 'lucide-react';

export const ReportesAcompanante = () => {
  const [selectedGestion, setSelectedGestion] = useState('2026');
  const [selectedAno, setSelectedAno] = useState('2.º Año');
  const [searchTerm, setSearchTerm] = useState('');

  // Datos consolidados de reporte por estudiante bajo tutoría
  const [reporteData, setReporteData] = useState([
    {
      id: 'EST-026',
      estudiante: 'María López',
      ci: '8492012',
      especialidad: 'Educación Primaria Comunitaria Vocacional',
      unidadEducativa: 'U.E. Franz Tamayo',
      fichasCompletadas: 4,
      fichasTotales: 6,
      promedioParcial: 88.8,
      estadoPractica: 'En Progreso',
      observaciones: 'Pendiente de ajuste en la Ficha F-4.'
    },
    {
      id: 'EST-027',
      estudiante: 'Juan Carlos Pérez Gómez',
      ci: '8492013',
      especialidad: 'Educación Primaria Comunitaria Vocacional',
      unidadEducativa: 'U.E. Franz Tamayo',
      fichasCompletadas: 6,
      fichasTotales: 6,
      promedioParcial: 91.6,
      estadoPractica: 'Concluido',
      observaciones: 'Proceso de práctica completado satisfactoriamente.'
    },
    {
      id: 'EST-028',
      estudiante: 'Sonia Aliaga Chuquimia',
      ci: '9120394',
      especialidad: 'Artes Plásticas y Visuales',
      unidadEducativa: 'U.E. Mariscal Sucre',
      fichasCompletadas: 3,
      fichasTotales: 6,
      promedioParcial: 82.5,
      estadoPractica: 'Con Observaciones',
      observaciones: 'Requiere completar la entrega de la Ficha F-4.'
    }
  ]);

  const filteredReporte = reporteData.filter(item =>
    item.estudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ci.includes(searchTerm)
  );

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <FileBarChart2 size={14} className="text-[#8C731A]" /> Módulo Consolidado
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Reportes
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Consolidado de calificaciones, avance de fichas y métricas generales de tutoría pedagógica.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => alert('Generando reporte consolidado en formato Excel (.xlsx)...')}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-emerald-700 transition-all cursor-pointer"
            >
              <FileSpreadsheet size={16} /> Exportar Excel
            </button>
            <button
              onClick={() => alert('Generando Informe Oficial de Tutoría IEPC-PEC en PDF...')}
              className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-4 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-[#a32334] transition-all cursor-pointer"
            >
              <Printer size={16} /> Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {/* METRICAS Y RESUMEN GENERAL DE TUTORÍA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Total Estudiantes Tutoriados</span>
          <span className="block text-2xl font-black text-slate-900 font-mono">25 Practicantes</span>
          <span className="text-[10px] text-[#8C731A] font-bold">Gestión Academic {selectedGestion}</span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Promedio General del Grupo</span>
          <span className="block text-2xl font-black text-emerald-700 font-mono">87.6 pts</span>
          <span className="text-[10px] text-emerald-600 font-bold">Rendimiento Satisfactorio</span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Progreso Global Fichas</span>
          <span className="block text-2xl font-black text-slate-900 font-mono">82% Completado</span>
          <span className="text-[10px] text-amber-600 font-bold">18 Actas Validadas</span>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-slate-400">Año de Formación:</span>
          {['2.º Año', '3.er Año', '4.º Año', '5.º Año'].map((ano) => (
            <button
              key={ano}
              onClick={() => setSelectedAno(ano)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                selectedAno === ano
                  ? 'bg-[#801B28] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {ano}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
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

      {/* TABLA REPORTE DE TUTORÍA */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Código / Estudiante</th>
                <th className="py-3.5 px-4">Especialidad & U.E.</th>
                <th className="py-3.5 px-4 font-mono text-center">Fichas Entregadas</th>
                <th className="py-3.5 px-4 font-mono text-center">Promedio Parcial</th>
                <th className="py-3.5 px-4">Estado Práctica</th>
                <th className="py-3.5 px-4">Observación / Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredReporte.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono">
                    <span className="block font-bold text-slate-900">{item.estudiante}</span>
                    <span className="text-[10px] text-[#801B28] font-bold">{item.id} (C.I. {item.ci})</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="block font-semibold text-slate-800">{item.especialidad}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{item.unidadEducativa}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-center">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                      {item.fichasCompletadas} / {item.fichasTotales}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-center text-sm text-emerald-700">
                    {item.promedioParcial} pts
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      item.estadoPractica === 'Concluido' ? 'bg-emerald-100 text-emerald-800' :
                      item.estadoPractica === 'Con Observaciones' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {item.estadoPractica === 'Concluido' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      {item.estadoPractica}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                    {item.observaciones}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};