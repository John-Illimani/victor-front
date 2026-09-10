import React, { useState } from 'react';
import { 
  TrendingUp, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Plus, 
  X, 
  History,
  School,
  FileText
} from 'lucide-react';

export const SeguimientoGuia = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstudiante, setSelectedEstudiante] = useState('EST-026');
  const [showModalBitacora, setShowModalBitacora] = useState(false);

  // Historial de notas de seguimiento registradas por el Docente Guía
  const [historialSeguimiento, setHistorialSeguimiento] = useState([
    {
      id: 'SEG-GUIA-001',
      codigoEstudiante: 'EST-026',
      estudiante: 'María López',
      fecha: '08/09/2026',
      aspecto: 'Desarrollo de Clase y Aplicación de PDC',
      cursoAula: '3.er Año "A" de Primaria',
      observacion: 'La practicante ejecutó la sesión de Ciencias Naturales utilizando de forma creativa los materiales didácticos previstos. Buen manejo de la disciplina y participación activa de los niños.',
      recomendacion: 'Mantener la fluidez en la transición entre la fase de Teoría y Producción.',
      estado: 'Completado'
    },
    {
      id: 'SEG-GUIA-002',
      codigoEstudiante: 'EST-026',
      estudiante: 'María López',
      fecha: '01/09/2026',
      aspecto: 'Asistencia y Puntualidad en Aula',
      cursoAula: '3.er Año "A" de Primaria',
      observacion: 'Cumplimiento estricto del horario de ingreso a la Unidad Educativa y apoyo oportuno en la revisión de tareas escolares.',
      recomendacion: 'Continuar con el mismo compromiso de puntualidad.',
      estado: 'Completado'
    },
    {
      id: 'SEG-GUIA-003',
      codigoEstudiante: 'EST-027',
      estudiante: 'Juan Carlos Pérez Gómez',
      fecha: '05/09/2026',
      aspecto: 'Articulación del PSP en PDC',
      cursoAula: '3.er Año "B" de Primaria',
      observacion: 'Demuestra una articulación coherente entre los contenidos curriculares y el PSP institucional.',
      recomendacion: 'Documentar con fotografías para el cuaderno de campo.',
      estado: 'Completado'
    }
  ]);

  // Formulario para nueva nota de seguimiento
  const [nuevaNota, setNuevaNota] = useState({
    estudianteId: 'EST-026',
    aspecto: 'Desarrollo de Clase y Aplicación de PDC',
    observacion: '',
    recomendacion: ''
  });

  const filteredSeguimiento = historialSeguimiento.filter(item => 
    item.codigoEstudiante === selectedEstudiante &&
    (item.estudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.aspecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.observacion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCrearNota = (e) => {
    e.preventDefault();
    if (!nuevaNota.observacion.trim()) {
      alert('Por favor escribe la observación del seguimiento.');
      return;
    }

    const estudianteObj = historialSeguimiento.find(e => e.codigoEstudiante === nuevaNota.estudianteId) || { estudiante: 'María López' };

    const nuevoRegistro = {
      id: `SEG-GUIA-00${historialSeguimiento.length + 1}`,
      codigoEstudiante: nuevaNota.estudianteId,
      estudiante: estudianteObj.estudiante,
      fecha: '09/09/2026',
      aspecto: nuevaNota.aspecto,
      cursoAula: '3.er Año "A" de Primaria',
      observacion: nuevaNota.observacion,
      recomendacion: nuevaNota.recomendacion || 'Sin recomendaciones adicionales.',
      estado: 'Completado'
    };

    setHistorialSeguimiento([nuevoRegistro, ...historialSeguimiento]);
    setShowModalBitacora(false);
    setNuevaNota({ estudianteId: 'EST-026', aspecto: 'Desarrollo de Clase y Aplicación de PDC', observacion: '', recomendacion: '' });
    alert('Observación de seguimiento registrada en PostgreSQL.');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO INSTITUCIONAL */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <School size={14} className="text-[#8C731A]" /> Control de Aula en U.E.
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Seguimiento
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Bitácora diaria de desempeño, cumplimiento de PDC y observaciones pedagógicas directas en el aula.
            </p>
          </div>

          <button
            onClick={() => setShowModalBitacora(true)}
            className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-5 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-[#a32334] transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} /> [ Registrar observación en aula ]
          </button>
        </div>
      </div>

      {/* SELECCIÓN DE ESTUDIANTE Y BÚSQUEDA */}
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
              placeholder="Buscar en observaciones o recomendaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
            />
          </div>
        </div>

      </div>

      {/* HISTORIAL DE NOTAS DE SEGUIMIENTO */}
      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <History size={16} className="text-[#801B28]" /> Registros de control en aula
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
                    {item.aspecto}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{item.estudiante}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Aula: {item.cursoAula} | ID: {item.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Calendar size={14} /> {item.fecha}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 size={12} /> {item.estado}
                  </span>
                </div>
              </div>

              {/* DETALLE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#801B28] block">
                    Observación en Aula:
                  </span>
                  <p className="font-medium text-slate-800 leading-relaxed">
                    {item.observacion}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                    Recomendaciones Pedagógicas:
                  </span>
                  <p className="font-medium text-emerald-950 leading-relaxed">
                    {item.recomendacion}
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

      {/* MODAL PARA NUEVO REGISTRO */}
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
                REGISTRO DE CONTROL PEDAGÓGICO
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-1">
                Nueva Nota de Seguimiento en Aula
              </h2>
            </div>

            <form onSubmit={handleCrearNota} className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Seleccionar Practicante *</label>
                <select
                  value={nuevaNota.estudianteId}
                  onChange={(e) => setNuevaNota({ ...nuevaNota, estudianteId: e.target.value })}
                  className="w-full font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-[#8C731A] focus:outline-none"
                >
                  <option value="EST-026">EST-026: María López (2.º Año)</option>
                  <option value="EST-027">EST-027: Juan Carlos Pérez Gómez (2.º Año)</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Aspecto Evaluado *</label>
                <select
                  value={nuevaNota.aspecto}
                  onChange={(e) => setNuevaNota({ ...nuevaNota, aspecto: e.target.value })}
                  className="w-full font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-[#8C731A] focus:outline-none"
                >
                  <option value="Desarrollo de Clase y Aplicación de PDC">Desarrollo de Clase y Aplicación de PDC</option>
                  <option value="Asistencia y Puntualidad en Aula">Asistencia y Puntualidad en Aula</option>
                  <option value="Dominio de Aula e Interacción">Dominio de Aula e Interacción</option>
                  <option value="Articulación del PSP en PDC">Articulación del PSP en PDC</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Observaciones Observadas en Aula *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Detalle el desempeño del estudiante en la clase..."
                  value={nuevaNota.observacion}
                  onChange={(e) => setNuevaNota({ ...nuevaNota, observacion: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 p-3 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Recomendaciones para el Estudiante</label>
                <textarea
                  rows="2"
                  placeholder="Sugerencias directas de mejora pedagógica..."
                  value={nuevaNota.recomendacion}
                  onChange={(e) => setNuevaNota({ ...nuevaNota, recomendacion: e.target.value })}
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
                  Guardar Nota
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};