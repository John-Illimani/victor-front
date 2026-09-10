import React, { useState } from 'react';
import { ClipboardList, Sparkles, AlertTriangle, ShieldAlert } from 'lucide-react';

export const FichasAcompanante = () => {
  const [selectedEstudiante] = useState({
    nombre: 'María López',
    ci: '8492012',
    especialidad: 'Educación Primaria Comunitaria Vocacional',
    ano: '2.º Año'
  });

  const [selectedFicha, setSelectedFicha] = useState('F-5');
  const [criterios, setCriterios] = useState({ c1: '85', c2: '90', c3: '80' });
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isFinalizado, setIsFinalizado] = useState(false);

  const etapas = [
    { etapa: 'ETAPA PREPARATORIA', fichas: [{ codigo: 'F-1', nombre: 'Diagnóstico Sociocomunitario' }] },
    { etapa: 'ETAPA DE EJECUCIÓN', fichas: [
      { codigo: 'F-2', nombre: 'Planificación del PDC' },
      { codigo: 'F-3', nombre: 'Cuaderno de Campo' },
      { codigo: 'F-4', nombre: 'Registro de Experiencias' },
      { codigo: 'F-5', nombre: 'Valoración del Docente Acompañante' }
    ]},
    { etapa: 'ETAPA DE PRODUCCIÓN', fichas: [{ codigo: 'F-6', nombre: 'Informe Final de Práctica' }] }
  ];

  const c1 = parseFloat(criterios.c1) || 0;
  const c2 = parseFloat(criterios.c2) || 0;
  const c3 = parseFloat(criterios.c3) || 0;
  const promedio = ((c1 + c2 + c3) / 3).toFixed(1);

  const handleFinalizar = () => {
    if (c1 < 1 || c1 > 100 || c2 < 1 || c2 > 100 || c3 < 1 || c3 > 100) {
      setError('La nota debe encontrarse strictly entre 1 y 100 puntos.');
      return;
    }
    setError(null);
    setShowModal(true);
  };

  const confirmFinalizar = () => {
    setShowModal(false);
    setIsFinalizado(true);
    alert('Ficha evaluada y finalizada en PostgreSQL.');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* BANNER ENCABEZADO INSTITUCIONAL */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <ClipboardList size={14} className="text-[#8C731A]" /> Evaluación Pedagógica
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Fichas de Evaluación
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Valoración cuantitativa y cualitativa por etapas del proceso IEPC-PEC de los estudiantes asignados.
            </p>
          </div>
        </div>
      </div>

      {/* CUERPO PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ÁRBOL DE FICHAS POR ETAPAS */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <ClipboardList size={20} className="text-[#801B28]" /> FICHAS
          </h2>

          <div className="space-y-4 text-xs">
            {etapas.map((grupo, idx) => (
              <div key={idx} className="space-y-2">
                <span className="font-black text-[10px] uppercase tracking-wider text-slate-400 block">
                  {grupo.etapa}
                </span>
                <div className="space-y-1 pl-2 border-l-2 border-slate-100">
                  {grupo.fichas.map((f) => (
                    <button
                      key={f.codigo}
                      onClick={() => setSelectedFicha(f.codigo)}
                      className={`w-full text-left px-3 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-between ${
                        selectedFicha === f.codigo
                          ? 'bg-[#801B28] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>├── {f.codigo} {f.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FORMULARIO DE EVALUACIÓN DE FICHA */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] font-mono font-black text-[#801B28] px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-100">
              FICHA {selectedFicha}
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">VALORACIÓN DEL DOCENTE ACOMPAÑANTE</h2>
          </div>

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

          <div className="space-y-4 text-xs">
            <h3 className="font-black uppercase text-slate-400">CRITERIOS</h3>

            {[
              { key: 'c1', label: 'Criterio 1' },
              { key: 'c2', label: 'Criterio 2' },
              { key: 'c3', label: 'Criterio 3' }
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
              <label className="block font-extrabold text-slate-700 mb-1">Observaciones:</label>
              <textarea
                rows="3"
                disabled={isFinalizado}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
              />
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex justify-between items-center font-black">
              <span className="text-emerald-900">Promedio:</span>
              <span className="font-mono text-2xl text-emerald-800">{promedio} pts</span>
            </div>
          </div>

          {!isFinalizado && (
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => alert('Borrador guardado')} className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-200 cursor-pointer">
                [Guardar borrador]
              </button>
              <button onClick={handleFinalizar} className="rounded-xl bg-[#801B28] px-5 py-2.5 text-xs font-extrabold text-white hover:bg-[#a32334] cursor-pointer shadow-md">
                [Finalizar evaluación]
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center space-y-4 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
              <ShieldAlert size={26} />
            </div>
            <h3 className="text-base font-black text-slate-900">¿Está seguro de finalizar esta ficha?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Una vez finalizada, solamente podrá ser modificada mediante el procedimiento autorizado.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer">
                Cancelar
              </button>
              <button onClick={confirmFinalizar} className="rounded-xl bg-[#801B28] px-5 py-2.5 text-xs font-extrabold text-white hover:bg-[#a32334] cursor-pointer shadow-md">
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};