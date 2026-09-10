import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Clock, 
  School, 
  UserCheck, 
  CalendarCheck,
  Eye,
  Filter
} from 'lucide-react';

export const ConsultasGuia = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFichaFilter, setSelectedFichaFilter] = useState('Todas');

  // Datos de consulta de fichas y registros asignados al Docente Guía
  const [consultasData, setConsultasData] = useState([
    {
      id: 'CONS-001',
      codigoEstudiante: 'EST-026',
      estudiante: 'María López',
      ci: '8492012',
      ano: '2.º Año',
      especialidad: 'Educación Primaria Comunitaria Vocacional',
      fichaCodigo: 'F-2',
      fichaNombre: 'Planificación de la Práctica Educativa (PDC)',
      fechaRegistro: '08/09/2026',
      estado: 'Completado',
      notaGuia: 90,
      detalle: 'Asistencia y PDC revisado conforme a la estructura del PSP.'
    },
    {
      id: 'CONS-002',
      codigoEstudiante: 'EST-026',
      estudiante: 'María López',
      ci: '8492012',
      ano: '2.º Año',
      especialidad: 'Educación Primaria Comunitaria Vocacional',
      fichaCodigo: 'F-4',
      fichaNombre: 'Seguimiento en Aula y Concreción Curricular',
      fechaRegistro: '05/09/2026',
      estado: 'Pendiente',
      notaGuia: null,
      detalle: 'Pendiente de confirmación de firmas de la Unidad Educativa.'
    },
    {
      id: 'CONS-003',
      codigoEstudiante: 'EST-027',
      estudiante: 'Juan Carlos Pérez Gómez',
      ci: '8492013',
      ano: '2.º Año',
      especialidad: 'Educación Primaria Comunitaria Vocacional',
      fichaCodigo: 'F-2',
      fichaNombre: 'Planificación de la Práctica Educativa (PDC)',
      fechaRegistro: '01/09/2026',
      estado: 'Completado',
      notaGuia: 95,
      detalle: 'PDC implementado exitosamente en el aula.'
    }
  ]);

  const filteredConsultas = consultasData.filter(item => {
    const matchFicha = selectedFichaFilter === 'Todas' ? true : item.fichaCodigo === selectedFichaFilter;
    const matchSearch = item.estudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.codigoEstudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.fichaNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.ci.includes(searchTerm);
    return matchFicha && matchSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO INSTITUCIONAL */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <School size={14} className="text-[#8C731A]" /> Módulo de Búsqueda y Lectura
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Consultas
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Consulta del historial de fichas, calificaciones asignadas y registros de asistencia de practicantes en la Unidad Educativa.
            </p>
          </div>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-slate-400">Filtrar por Ficha:</span>
          {['Todas', 'F-2', 'F-4', 'B-3'].map((ficha) => (
            <button
              key={ficha}
              onClick={() => setSelectedFichaFilter(ficha)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                selectedFichaFilter === ficha
                  ? 'bg-[#801B28] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {ficha}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por estudiante, C.I. o ficha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2 text-xs font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
          />
        </div>

      </div>

      {/* TABLA RESULTADOS DE CONSULTA */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Estudiante / C.I.</th>
                <th className="py-3.5 px-4">Ficha Asignada</th>
                <th className="py-3.5 px-4 font-mono text-center">Nota Docente Guía</th>
                <th className="py-3.5 px-4">Fecha Registro</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-center">Ver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredConsultas.length > 0 ? (
                filteredConsultas.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="block font-bold text-slate-900">{item.estudiante}</span>
                      <span className="font-mono text-[10px] text-[#801B28] font-bold">{item.codigoEstudiante} (C.I. {item.ci})</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-black text-[#801B28] mr-2 px-2 py-0.5 rounded bg-rose-50 border border-rose-100">
                        {item.fichaCodigo}
                      </span>
                      <span className="font-bold text-slate-800">{item.fichaNombre}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-center text-sm text-emerald-700">
                      {item.notaGuia ? `${item.notaGuia} pts` : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {item.fechaRegistro}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        item.estado === 'Completado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.estado === 'Completado' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {item.estado}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => alert(`Detalle de consulta para ${item.fichaCodigo} - ${item.estudiante}:\n\n${item.detalle}`)}
                        className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-[#801B28] hover:text-white transition-all cursor-pointer"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                    No se encontraron registros de consulta que coincidan con los filtros.
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