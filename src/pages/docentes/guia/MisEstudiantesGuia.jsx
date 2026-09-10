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
  Sparkles,
  School,
  ClipboardCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MisEstudiantesGuia = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);

  // Estudiantes asignados al aula del Docente Guía (U.E. Franz Tamayo)
  const [estudiantes, setEstudiantes] = useState([
    {
      id: 'EST-2026-001',
      codigoEstudiante: 'EST-026',
      nombre: 'María López',
      ci: '8492012',
      ano: '2.º Año',
      especialidad: 'Educación Primaria Comunitaria Vocacional',
      cursoAula: '3.er Año "A" de Primaria',
      estado: 'En Progreso',
      fichasGuia: [
        { codigo: 'F-2', nombre: 'Asistencia y PDC', estado: 'Aprobado' },
        { codigo: 'F-4', nombre: 'Seguimiento en Aula', estado: 'Observado' },
        { codigo: 'B-3', nombre: 'Concreción Curricular', estado: 'Sin Entregar' }
      ]
    },
    {
      id: 'EST-2026-002',
      codigoEstudiante: 'EST-027',
      nombre: 'Juan Carlos Pérez Gómez',
      ci: '8492013',
      ano: '2.º Año',
      especialidad: 'Educación Primaria Comunitaria Vocacional',
      cursoAula: '3.er Año "A" de Primaria',
      estado: 'Completado',
      fichasGuia: [
        { codigo: 'F-2', nombre: 'Asistencia y PDC', estado: 'Aprobado' },
        { codigo: 'F-4', nombre: 'Seguimiento en Aula', estado: 'Aprobado' },
        { codigo: 'B-3', nombre: 'Concreción Curricular', estado: 'Aprobado' }
      ]
    }
  ]);

  const filteredEstudiantes = estudiantes.filter(item =>
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigoEstudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ci.includes(searchTerm)
  );

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
              Mis estudiantes
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Nómina de practicantes asignados a tu aula para el seguimiento de asistencia y evaluación pedagógica.
            </p>
          </div>
        </div>
      </div>

      {/* VISTA 1: TABLA PRINCIPAL DE ESTUDIANTES DE AULA */}
      {!selectedEstudiante ? (
        <div className="space-y-4">
          
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm max-w-md">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar estudiante por nombre, C.I. o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Código</th>
                    <th className="py-3.5 px-4">Estudiante</th>
                    <th className="py-3.5 px-4">Especialidad</th>
                    <th className="py-3.5 px-4">Año</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredEstudiantes.map((item) => (
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
                      <td className="py-3.5 px-4 font-medium text-slate-800">{item.especialidad}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-800">{item.ano}</td>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (

        /* VISTA 2: EXPEDIENTE INDIVIDUAL EN AULA */
        <div className="space-y-6">
          
          <button
            onClick={() => setSelectedEstudiante(null)}
            className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft size={16} /> Volver a mis estudiantes
          </button>

          {/* DATOS PERSONALES DEL PRACTICANTE */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#801B28]">
              ESTUDIANTE
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Datos personales:</span>
                <span className="font-extrabold text-slate-900 text-sm block">{selectedEstudiante.nombre}</span>
                <span className="font-mono text-slate-500">C.I.: {selectedEstudiante.ci} | {selectedEstudiante.codigoEstudiante}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Formación Académica:</span>
                <span className="font-bold text-slate-900 block">{selectedEstudiante.especialidad}</span>
                <span className="text-[#8C731A] font-extrabold block">{selectedEstudiante.ano}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Asignación de Aula:</span>
                <span className="font-extrabold text-slate-900 text-sm block">{selectedEstudiante.cursoAula}</span>
                <span className="text-emerald-700 font-bold block">Práctica en Aula</span>
              </div>
            </div>
          </div>

          {/* FICHAS DEL DOCENTE GUÍA */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900">IEPC-PEC</h3>
              <p className="text-xs text-slate-400">Fichas en las que participa el Docente Guía</p>
            </div>

            <div className="space-y-3">
              {selectedEstudiante.fichasGuia.map((f) => (
                <div key={f.codigo} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-slate-900 px-2.5 py-1 rounded-xl bg-white border border-slate-200">
                      {f.codigo}
                    </span>
                    <span className="font-bold text-slate-800">{f.nombre}</span>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold ${
                    f.estado === 'Aprobado' ? 'bg-emerald-100 text-emerald-800' :
                    f.estado === 'Observado' ? 'bg-rose-100 text-rose-800' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {f.estado === 'Aprobado' && <CheckCircle2 size={12} />}
                    {f.estado === 'Observado' && <AlertTriangle size={12} />}
                    {f.estado === 'Sin Entregar' && <Clock size={12} />}
                    {f.estado}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => navigate('/docente-guia/fichas-asignadas')}
                className="rounded-2xl bg-[#801B28] px-5 py-2.5 text-xs font-extrabold text-white hover:bg-[#a32334] transition-all cursor-pointer shadow-md flex items-center gap-2"
              >
                <ClipboardCheck size={16} /> [ Completar ficha ]
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};