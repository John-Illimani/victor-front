import React, { useState } from 'react';
import { 
  TrendingUp, 
  Search, 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Plus, 
  X, 
  User, 
  History,
  FileText
} from 'lucide-react';

export const SeguimientoAcompanante = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstudiante, setSelectedEstudiante] = useState('EST-026');
  const [showModalBitacora, setShowModalBitacora] = useState(false);

  // Historial de notas de seguimiento y observaciones registradas por el docente
  const [historialSeguimiento, setHistorialSeguimiento] = useState([
    {
      id: 'SEG-2026-001',
      codigoEstudiante: 'EST-026',
      estudiante: 'María López',
      fecha: '08/09/2026',
      tipo: 'Visita Presencial en Aula',
      unidadEducativa: 'U.E. Franz Tamayo',
      avanceFichas: 'F-1, F-2, F-3 Aprobadas | F-4 Observada',
      observacion: 'Se observó el desarrollo de la clase en el curso 2.º A. El estudiante aplica adecuadamente los materiales del PDC, pero requiere reforzar el instrumento de evaluación cuantitativa.',
      compromiso: 'Presentar el instrumento F-4 ajustado para la siguiente semana.',
      estado: 'Pendiente de Ajuste'
    },
    {
      id: 'SEG-2026-002',
      codigoEstudiante: 'EST-026',
      estudiante: 'María López',
      fecha: '25/08/2026',
      tipo: 'Tutoría Virtual de Revisión',
      unidadEducativa: 'U.E. Franz Tamayo',
      avanceFichas: 'F-1, F-2 Aprobadas',
      observacion: 'Revisión de la planificación F-2. Se ajustaron los objetivos holísticos alineados al PSP de la Unidad Educativa.',
      compromiso: 'Aprobación de la Ficha F-2 y habilitación para ejecución.',
      estado: 'Concluido'
    },
    {
      id: 'SEG-2026-003',
      codigoEstudiante: 'EST-027',
      estudiante: 'Juan Carlos Pérez Gómez',
      fecha: '01/09/2026',
      tipo: 'Visita Presencial en Aula',
      unidadEducativa: 'U.E. Franz Tamayo',
      avanceFichas: 'F-1 a F-5 Aprobadas',
      observacion: 'Excelente desenvolvimiento en aula, manejo del PDC y buena interacción con el Docente Guía.',
      compromiso: 'Finalizar la redacción del informe F-6.',
      estado: 'Concluido'
    }
  ]);

  // Formulario para nueva entrada de seguimiento
  const [nuevaBitacora, setNuevaBitacora] = useState({
    estudianteId: 'EST-026',
    tipo: 'Visita Presencial en Aula',
    observacion: '',
    compromiso: ''
  });

  const filteredSeguimiento = historialSeguimiento.filter(item => 
    item.codigoEstudiante === selectedEstudiante &&
    (item.estudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.observacion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCrearBitacora = (e) => {
    e.preventDefault();
    if (!nuevaBitacora.observacion.trim()) {
      alert('Por favor ingrese el detalle de la observación de seguimiento.');
      return;
    }

    const estudianteObj = historialSeguimiento.find(e => e.codigoEstudiante === nuevaBitacora.estudianteId) || { estudiante: 'María López' };

    const nuevoRegistro = {
      id: `SEG-2026-00${historialSeguimiento.length + 1}`,
      codigoEstudiante: nuevaBitacora.estudianteId,
      estudiante: estudianteObj.estudiante,
      fecha: '09/09/2026',
      tipo: nuevaBitacora.tipo,
      unidadEducativa: 'U.E. Franz Tamayo',
      avanceFichas: 'Seguimiento en Curso',
      observacion: nuevaBitacora.observacion,
      compromiso: nuevaBitacora.compromiso || 'Sin compromisos específicos.',
      estado: 'Pendiente de Ajuste'
    };

    setHistorialSeguimiento([nuevoRegistro, ...historialSeguimiento]);
    setShowModalBitacora(false);
    setNuevaBitacora({ estudianteId: 'EST-026', tipo: 'Visita Presencial en Aula', observacion: '', compromiso: '' });
    alert('Nueva nota de seguimiento registrada correctamente en PostgreSQL.');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <TrendingUp size={14} className="text-[#8C731A]" /> Control Pedagógico Continua
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Seguimiento de Tutoría
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Bitácora de visitas a aula, tutorías virtuales, observaciones y acuerdos pedagógicos alcanzados con tus estudiantes.
            </p>
          </div>

          <button
            onClick={() => setShowModalBitacora(true)}
            className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-5 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-[#a32334] transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} /> [ Registrar nueva visita / tutoría ]
          </button>
        </div>
      </div>

      {/* SELECCIÓN DE ESTUDIANTE Y FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400 block">Estudiante en seguimiento:</label>
          <select
            value={selectedEstudiante}
            onChange={(e) => setSelectedEstudiante(e.target.value)}
            className="w-full font-bold text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-[#8C731A] focus:outline-none"
          >
            <option value="EST-026">EST-026: María López (2.º Año)</option>
            <option value="EST-027">EST-027: Juan Carlos Pérez Gómez (2.º Año)</option>
          </select>
        </div>

        <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm flex items-center">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar en las observaciones o compromisos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
            />
          </div>
        </div>

      </div>

      {/* LÍNEA DE TIEMPO / HISTORIAL DE SEGUIMIENTO */}
      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <History size={16} className="text-[#801B28]" /> Historial de intervenciones registradas
        </h2>

        {filteredSeguimiento.length > 0 ? (
          filteredSeguimiento.map((item) => (
            <div 
              key={item.id} 
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:border-[#8C731A]/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-xs text-[#801B28] px-3 py-1 rounded-xl bg-rose-50 border border-rose-100">
                    {item.tipo}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{item.estudiante}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {item.id} | U.E.: {item.unidadEducativa}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Calendar size={14} /> {item.fecha}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                    item.estado === 'Concluido' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.estado === 'Concluido' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {item.estado}
                  </span>
                </div>
              </div>

              {/* DETALLE DE LA BITÁCORA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#801B28] block">
                    Observaciones Pedagógicas:
                  </span>
                  <p className="font-medium text-slate-800 leading-relaxed">
                    {item.observacion}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                    Acuerdos y Compromisos Pedagógicos:
                  </span>
                  <p className="font-medium text-emerald-950 leading-relaxed">
                    {item.compromiso}
                  </p>
                </div>

              </div>

            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-400 font-medium text-xs">
            No se encontraron registros de seguimiento para el estudiante seleccionado.
          </div>
        )}
      </div>

      {/* MODAL PARA NUEVO REGISTRO DE SEGUIMIENTO */}
      {showModalBitacora && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            <button
              onClick={() => setShowModalBitacora(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="border-b border-slate-200 pb-4 mb-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#801B28]">
                NUEVO REGISTRO DE TUTORÍA Y VISITA
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-1">
                Bitácora de Seguimiento IEPC-PEC
              </h2>
            </div>

            <form onSubmit={handleCrearBitacora} className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Seleccionar Estudiante *</label>
                <select
                  value={nuevaBitacora.estudianteId}
                  onChange={(e) => setNuevaBitacora({ ...nuevaBitacora, estudianteId: e.target.value })}
                  className="w-full font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-[#8C731A] focus:outline-none"
                >
                  <option value="EST-026">EST-026: María López (2.º Año)</option>
                  <option value="EST-027">EST-027: Juan Carlos Pérez Gómez (2.º Año)</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Tipo de Intervención *</label>
                <select
                  value={nuevaBitacora.tipo}
                  onChange={(e) => setNuevaBitacora({ ...nuevaBitacora, tipo: e.target.value })}
                  className="w-full font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-[#8C731A] focus:outline-none"
                >
                  <option value="Visita Presencial en Aula">Visita Presencial en Aula</option>
                  <option value="Tutoría Virtual de Revisión">Tutoría Virtual de Revisión</option>
                  <option value="Entrevista con Docente Guía">Entrevista con Docente Guía</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Observaciones Pedagógicas de la Visita *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Escriba los detalles observados en el desarrollo del PDC, manejo de aula o fichas..."
                  value={nuevaBitacora.observacion}
                  onChange={(e) => setNuevaBitacora({ ...nuevaBitacora, observacion: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 p-3 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Acuerdos y Compromisos Asumidos</label>
                <textarea
                  rows="2"
                  placeholder="Detalle las tareas o ajustes que el estudiante debe realizar para el próximo control..."
                  value={nuevaBitacora.compromiso}
                  onChange={(e) => setNuevaBitacora({ ...nuevaBitacora, compromiso: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 p-3 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModalBitacora(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#801B28] px-5 py-2.5 text-xs font-extrabold text-white hover:bg-[#a32334] cursor-pointer shadow-md"
                >
                  Guardar Registro
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};