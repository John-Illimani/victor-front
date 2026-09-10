import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Sparkles, 
  AlertTriangle, 
  ShieldAlert, 
  CalendarCheck, 
  CheckCircle2, 
  Clock, 
  UserX,
  FileText
} from 'lucide-react';

export const FichasAsignadasGuia = () => {
  const [selectedEstudiante, setSelectedEstudiante] = useState({
    nombre: 'María López',
    ci: '8492012',
    especialidad: 'Educación Primaria Comunitaria Vocacional',
    ano: '2.º Año'
  });

  const [activeTab, setActiveTab] = useState('asistencia'); // 'asistencia' | 'seguimiento'
  const [selectedFicha, setSelectedFicha] = useState('F-2');

  // Estado del Registro de Asistencia (Ficha de Asistencia)
  const [asistencia, setAsistencia] = useState({
    asistencias: '18',
    inasistencias: '0',
    atrasos: '1',
    actividades: 'Acompañamiento en el desarrollo de la unidad temática de Ciencias Naturales y elaboración de materiales didácticos.',
    observacionesAsistencia: 'El practicante cumple puntualmente con el horario establecido.'
  });

  // Estado de la Ficha de Seguimiento (Valoración Criterios)
  const [criterios, setCriterios] = useState({ c1: '90', c2: '88' });
  const [observacionesSeguimiento, setObservacionesSeguimiento] = useState('');
  const [recomendaciones, setRecomendaciones] = useState('');
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isFinalizado, setIsFinalizado] = useState(false);

  const c1 = parseFloat(criterios.c1) || 0;
  const c2 = parseFloat(criterios.c2) || 0;
  const promedio = ((c1 + c2) / 2).toFixed(1);

  const handleFinalizar = () => {
    if (activeTab === 'seguimiento') {
      if (c1 < 1 || c1 > 100 || c2 < 1 || c2 > 100) {
        setError('La valoración en cada aspecto debe encontrarse estrictamente entre 1 y 100 puntos.');
        return;
      }
    }
    setError(null);
    setShowModal(true);
  };

  const confirmFinalizar = () => {
    setShowModal(false);
    setIsFinalizado(true);
    alert('Ficha evaluada y guardada exitosamente en PostgreSQL por el Docente Guía.');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO INSTITUCIONAL */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <ClipboardCheck size={14} className="text-[#8C731A]" /> Control y Valoración en Aula
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Fichas asignadas
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Registro oficial de asistencia, seguimiento pedagógico y desarrollo del PDC en el aula de la Unidad Educativa.
            </p>
          </div>
        </div>
      </div>

      {/* TABS DE SELECCIÓN DE FICHA A COMPLETAR */}
      <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab('asistencia')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'asistencia'
              ? 'bg-[#801B28] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Ficha de Asistencia (F-2)
        </button>
        <button
          onClick={() => setActiveTab('seguimiento')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'seguimiento'
              ? 'bg-[#801B28] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Ficha de Seguimiento (F-4)
        </button>
      </div>

      {/* FORMULARIO DE EVALUACIÓN */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-mono font-black text-[#801B28] px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-100">
              {activeTab === 'asistencia' ? 'FICHA DE ASISTENCIA' : 'FICHA DE SEGUIMIENTO'}
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">
              {activeTab === 'asistencia' ? 'REGISTRO DE ASISTENCIA Y CONTROL' : 'VALORACIÓN DE SEGUIMIENTO EN AULA'}
            </h2>
          </div>
          {isFinalizado && (
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center gap-1">
              <CheckCircle2 size={14} /> Registrado
            </span>
          )}
        </div>

        {/* DATOS DEL PRACTICANTE */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div><span className="text-slate-400 block font-bold">Estudiante:</span><span className="font-extrabold text-slate-800">{selectedEstudiante.nombre}</span></div>
          <div><span className="text-slate-400 block font-bold">C.I.:</span><span className="font-mono font-bold text-slate-800">{selectedEstudiante.ci}</span></div>
          <div><span className="text-slate-400 block font-bold">Especialidad:</span><span className="font-bold text-slate-800">{selectedEstudiante.especialidad}</span></div>
          <div><span className="text-slate-400 block font-bold">Año:</span><span className="font-bold text-slate-800">{selectedEstudiante.ano}</span></div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-2">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {/* OPCIÓN 1: FICHA DE ASISTENCIA */}
        {activeTab === 'asistencia' ? (
          <div className="space-y-4 text-xs">
            <h3 className="font-black uppercase text-slate-400">CONTROL DE ASISTENCIAS EN UNIDAD EDUCATIVA</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <label className="block font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-700" /> Asistencias (Días)
                </label>
                <input
                  type="number"
                  disabled={isFinalizado}
                  value={asistencia.asistencias}
                  onChange={(e) => setAsistencia({ ...asistencia, asistencias: e.target.value })}
                  className="w-full text-center rounded-xl border border-emerald-300 p-2 font-mono font-black text-slate-900 bg-white"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
                <label className="block font-extrabold text-rose-900 flex items-center gap-1.5">
                  <UserX size={16} className="text-rose-700" /> Inasistencias
                </label>
                <input
                  type="number"
                  disabled={isFinalizado}
                  value={asistencia.inasistencias}
                  onChange={(e) => setAsistencia({ ...asistencia, inasistencias: e.target.value })}
                  className="w-full text-center rounded-xl border border-rose-300 p-2 font-mono font-black text-slate-900 bg-white"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <label className="block font-extrabold text-amber-900 flex items-center gap-1.5">
                  <Clock size={16} className="text-amber-700" /> Atrasos
                </label>
                <input
                  type="number"
                  disabled={isFinalizado}
                  value={asistencia.atrasos}
                  onChange={(e) => setAsistencia({ ...asistencia, atrasos: e.target.value })}
                  className="w-full text-center rounded-xl border border-amber-300 p-2 font-mono font-black text-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 mb-1">Actividades Desarrolladas en Aula:</label>
              <textarea
                rows="3"
                disabled={isFinalizado}
                value={asistencia.actividades}
                onChange={(e) => setAsistencia({ ...asistencia, actividades: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 p-3 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 mb-1">Observaciones de Cumplimiento:</label>
              <textarea
                rows="2"
                disabled={isFinalizado}
                value={asistencia.observacionesAsistencia}
                onChange={(e) => setAsistencia({ ...asistencia, observacionesAsistencia: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 p-3 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
              />
            </div>
          </div>
        ) : (
          /* OPCIÓN 2: FICHA DE SEGUIMIENTO (VALORACIÓN CRITERIOS) */
          <div className="space-y-4 text-xs">
            <h3 className="font-black uppercase text-slate-400">VALORACIÓN PEDAGÓGICA (1 - 100 PTS)</h3>

            {[
              { key: 'c1', label: 'Aspecto 1: Concreción del PDC y manejo metodológico en aula' },
              { key: 'c2', label: 'Aspecto 2: Dominio de aula y articulación con los estudiantes' }
            ].map((c) => (
              <div key={c.key} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-700">{c.label}</span>
                <input
                  type="number"
                  disabled={isFinalizado}
                  min="1"
                  max="100"
                  value={criterios[c.key]}
                  onChange={(e) => setCriterios({ ...criterios, [c.key]: e.target.value })}
                  className="w-24 text-center rounded-xl border border-slate-200 px-3 py-1.5 font-mono font-black text-slate-900 focus:border-[#8C731A] focus:outline-none"
                />
              </div>
            ))}

            <div>
              <label className="block font-extrabold text-slate-700 mb-1">Observaciones del Docente Guía:</label>
              <textarea
                rows="2"
                disabled={isFinalizado}
                placeholder="Observaciones cualitativas sobre el desempeño..."
                value={observacionesSeguimiento}
                onChange={(e) => setObservacionesSeguimiento(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 mb-1">Recomendaciones para el Practicante:</label>
              <textarea
                rows="2"
                disabled={isFinalizado}
                placeholder="Sugerencias metodológicas..."
                value={recomendaciones}
                onChange={(e) => setRecomendaciones(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
              />
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex justify-between items-center font-black">
              <span className="text-emerald-900">Promedio Parcial de Seguimiento:</span>
              <span className="font-mono text-2xl text-emerald-800">{promedio} pts</span>
            </div>
          </div>
        )}

        {!isFinalizado && (
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => alert('Borrador guardado correctamente.')}
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-200 cursor-pointer"
            >
              [ Guardar borrador ]
            </button>
            <button
              onClick={handleFinalizar}
              className="rounded-xl bg-[#801B28] px-5 py-2.5 text-xs font-extrabold text-white hover:bg-[#a32334] cursor-pointer shadow-md"
            >
              [ Finalizar registro ]
            </button>
          </div>
        )}
      </div>

      {/* MODAL ADVERTENCIA DE FINALIZACIÓN */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center space-y-4 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
              <ShieldAlert size={26} />
            </div>
            <h3 className="text-base font-black text-slate-900">¿Desea registrar esta ficha oficialmente?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              La información será consolidada en el expediente del estudiante para la revisión del Docente Acompañante.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmFinalizar}
                className="rounded-xl bg-[#801B28] px-5 py-2.5 text-xs font-extrabold text-white hover:bg-[#a32334] cursor-pointer shadow-md"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};