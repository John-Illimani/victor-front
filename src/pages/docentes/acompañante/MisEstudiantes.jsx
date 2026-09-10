import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  ArrowLeft, 
  FileText, 
  History, 
  FileCheck2, 
  Award,
  Sparkles,
  School
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const MisEstudiantes = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAno, setFilterAno] = useState('Todos');
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);

  // Nómina de estudiantes asignados al Docente Acompañante
  const [estudiantes, setEstudiantes] = useState([
    {
      id: 'EST-2026-001',
      codigoEstudiante: 'EST-026',
      nombre: 'María López',
      ci: '8492012',
      ano: '2.º Año',
      especialidad: 'Educación Primaria Comunitaria Vocacional',
      unidadEducativa: 'U.E. Franz Tamayo',
      progreso: 67,
      estado: 'En Progreso',
      fichas: [
        { codigo: 'F-1', estado: 'Aprobado' },
        { codigo: 'F-2', estado: 'Aprobado' },
        { codigo: 'F-3', estado: 'Aprobado' },
        { codigo: 'F-4', estado: 'Observado' },
        { codigo: 'F-5', estado: 'Sin Entregar' },
        { codigo: 'F-6', estado: 'Sin Entregar' }
      ]
    },
    {
      id: 'EST-2026-002',
      codigoEstudiante: 'EST-027',
      nombre: 'Juan Carlos Pérez Gómez',
      ci: '8492013',
      ano: '2.º Año',
      especialidad: 'Educación Primaria Comunitaria Vocacional',
      unidadEducativa: 'U.E. Franz Tamayo',
      progreso: 100,
      estado: 'Completado',
      fichas: [
        { codigo: 'F-1', estado: 'Aprobado' },
        { codigo: 'F-2', estado: 'Aprobado' },
        { codigo: 'F-3', estado: 'Aprobado' },
        { codigo: 'F-4', estado: 'Aprobado' },
        { codigo: 'F-5', estado: 'Aprobado' },
        { codigo: 'F-6', estado: 'Aprobado' }
      ]
    },
    {
      id: 'EST-2026-003',
      codigoEstudiante: 'EST-028',
      nombre: 'Sonia Aliaga Chuquimia',
      ci: '9120394',
      ano: '3.er Año',
      especialidad: 'Artes Plásticas y Visuales',
      unidadEducativa: 'U.E. Mariscal Sucre',
      progreso: 50,
      estado: 'En Progreso',
      fichas: [
        { codigo: 'F-1', estado: 'Aprobado' },
        { codigo: 'F-2', estado: 'Aprobado' },
        { codigo: 'F-3', estado: 'Aprobado' },
        { codigo: 'F-4', estado: 'Sin Entregar' },
        { codigo: 'F-5', estado: 'Sin Entregar' },
        { codigo: 'F-6', estado: 'Sin Entregar' }
      ]
    }
  ]);

  // Filtro de estudiantes
  const filteredEstudiantes = estudiantes.filter(item => {
    const matchAno = filterAno === 'Todos' ? true : item.ano === filterAno;
    const matchSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.codigoEstudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.ci.includes(searchTerm);
    return matchAno && matchSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <Users size={14} className="text-[#8C731A]" /> Gestión de Tutoría
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Mis estudiantes
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Nómina de estudiantes asignados para la Práctica Educativa Comunitaria (IEPC-PEC).
            </p>
          </div>
        </div>
      </div>

      {/* VISTA 1: NÓMINA GENERAL DE ESTUDIANTES */}
      {!selectedEstudiante ? (
        <div className="space-y-4">
          
          {/* BARRA DE FILTROS Y BÚSQUEDA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-slate-400">Año de Formación:</span>
              {['Todos', '2.º Año', '3.er Año', '4.º Año'].map((ano) => (
                <button
                  key={ano}
                  onClick={() => setFilterAno(ano)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    filterAno === ano
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
                placeholder="Buscar por estudiante, C.I. o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2 text-xs font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
              />
            </div>
          </div>

          {/* TABLA PRINCIPAL DE ESTUDIANTES */}
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Código</th>
                    <th className="py-3.5 px-4">Estudiante</th>
                    <th className="py-3.5 px-4">Año</th>
                    <th className="py-3.5 px-4">Especialidad</th>
                    <th className="py-3.5 px-4">Progreso IEPC-PEC</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredEstudiantes.length > 0 ? (
                    filteredEstudiantes.map((item) => (
                      <tr 
                        key={item.id} 
                        onClick={() => setSelectedEstudiante(item)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-[#801B28]">
                          {item.codigoEstudiante}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="block font-bold text-slate-900">{item.nombre}</span>
                          <span className="font-mono text-[10px] text-slate-400">C.I. {item.ci}</span>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-800">{item.ano}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">{item.especialidad}</td>
                        <td className="py-3.5 px-4 w-48">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                              <div 
                                className={`h-full ${item.progreso === 100 ? 'bg-emerald-600' : 'bg-[#801B28]'}`} 
                                style={{ width: `${item.progreso}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-[10px] text-slate-700">{item.progreso}%</span>
                          </div>
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
                          <button className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-[#801B28] hover:text-white transition-all">
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                        No se encontraron estudiantes asignados que coincidan con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (

        /* VISTA 2: EXPEDIENTE DETALLADO DEL ESTUDIANTE SELECCIONADO */
        <div className="space-y-6">
          
          <button
            onClick={() => setSelectedEstudiante(null)}
            className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft size={16} /> Volver a la nómina de estudiantes
          </button>

          {/* DATOS DEL ESTUDIANTE */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#801B28]">
              DATOS DEL ESTUDIANTE
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Información personal:</span>
                <span className="font-extrabold text-slate-900 text-sm block">{selectedEstudiante.nombre}</span>
                <span className="font-mono text-slate-500">Código: {selectedEstudiante.codigoEstudiante} | C.I. {selectedEstudiante.ci}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Especialidad & Nivel:</span>
                <span className="font-bold text-slate-900 block">{selectedEstudiante.especialidad}</span>
                <span className="text-[#8C731A] font-extrabold block">{selectedEstudiante.ano}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Unidad Educativa PEC:</span>
                <span className="font-extrabold text-slate-900 text-sm block">{selectedEstudiante.unidadEducativa}</span>
                <span className="text-emerald-700 font-bold block">Practicante Asignado</span>
              </div>
            </div>
          </div>

          {/* PROGRESO IEPC-PEC DEL ESTUDIANTE */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">PROGRESO IEPC-PEC</h3>
                <p className="text-xs text-slate-400">Estado cuantitativo de las fichas correspondientes a la gestión</p>
              </div>

              <span className="font-mono font-black text-sm text-[#801B28] px-3 py-1 rounded-full bg-rose-50 border border-rose-100">
                {selectedEstudiante.progreso}% Avanzado
              </span>
            </div>

            {/* FICHAS F-1 A F-6 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {selectedEstudiante.fichas.map((f) => (
                <div 
                  key={f.codigo} 
                  className={`p-3.5 rounded-2xl border text-center space-y-1 ${
                    f.estado === 'Aprobado' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                    f.estado === 'Observado' ? 'bg-rose-50 border-rose-200 text-rose-900' :
                    'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="font-mono font-black text-xs block">{f.codigo}</span>
                  <span className="text-[11px] font-extrabold flex items-center justify-center gap-1">
                    {f.estado === 'Aprobado' && <CheckCircle2 size={12} className="text-emerald-700" />}
                    {f.estado === 'Observado' && <AlertTriangle size={12} className="text-rose-700" />}
                    {f.estado === 'Sin Entregar' && '—'}
                    {f.estado !== 'Sin Entregar' && f.estado}
                  </span>
                </div>
              ))}
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={() => navigate('/docente-acompanante/iepc-pec/actas')}
                className="rounded-2xl bg-slate-100 px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-200 transition-all cursor-pointer flex items-center gap-2"
              >
                <FileCheck2 size={15} /> [ Ver actas ]
              </button>

              <button
                onClick={() => navigate('/docente-acompanante/iepc-pec/fichas')}
                className="rounded-2xl bg-[#801B28] px-5 py-2.5 text-xs font-extrabold text-white hover:bg-[#a32334] transition-all cursor-pointer shadow-md flex items-center gap-2"
              >
                <FileText size={15} /> [ Completar ficha ]
              </button>

              <button
                onClick={() => navigate('/docente-acompanante/seguimiento')}
                className="rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-2"
              >
                <History size={15} /> [ Ver historial ]
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};