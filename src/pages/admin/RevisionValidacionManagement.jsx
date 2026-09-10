import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Blocks, 
  Eye, 
  X, 
  Sparkles, 
  FileCheck2, 
  FileSearch,
  MessageSquare,
  Lock,
  Award,
  RefreshCw,
  Send,
  Building2,
  User,
  GraduationCap
} from 'lucide-react';

export const RevisionValidacionManagement = () => {
  // Datos de prueba alineados con el proceso de evaluación y dictamen de la ESFMTHEA
  const [actasList, setActasList] = useState([
    {
      id: 1,
      codigo: 'ACT-2026-001',
      estudiante: 'Juan Carlos Pérez Tarqui',
      ciEstudiante: '8392019',
      especialidad: 'Física - Química',
      docenteTutor: 'Dra. Elena Quisbert Flores',
      uePráctica: 'U.E. Bolivia Mar',
      fase: 'PEC - 4to Año',
      gestion: '2026',
      fechaRegistro: '2026-08-15',
      estado: 'En Revisión',
      notaCuantitativa: 95,
      valoracionCualitativa: 'Demuestra dominio pedagógico, elaboración adecuada de materiales comunitarios y puntualidad en el diario de campo.',
      observacionesDocente: '',
      hashBlockchain: null,
      fechaValidacion: null
    },
    {
      id: 2,
      codigo: 'ACT-2026-002',
      estudiante: 'Maria Flores Quispe',
      ciEstudiante: '7482910',
      especialidad: 'Educación Primaria',
      docenteTutor: 'Mg. Carlos Mamani Condori',
      uePráctica: 'U.E. El Alto II',
      fase: 'PEC - 5to Año',
      gestion: '2026',
      fechaRegistro: '2026-08-20',
      estado: 'Validado',
      notaCuantitativa: 88,
      valoracionCualitativa: 'Aplica de forma óptima el modelo sociocomunitario productivo en aula.',
      observacionesDocente: 'Sin observaciones. Acta aprobada.',
      hashBlockchain: '0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
      fechaValidacion: '2026-08-21 14:30'
    },
    {
      id: 3,
      codigo: 'ACT-2026-003',
      estudiante: 'Sonia Aliaga Chuquimia',
      ciEstudiante: '9120394',
      especialidad: 'Educación Primaria',
      docenteTutor: 'Dra. Elena Quisbert Flores',
      uePráctica: 'U.E. Franz Tamayo',
      fase: 'PEC - 3er Año',
      gestion: '2026',
      fechaRegistro: '2026-08-22',
      estado: 'Observado',
      notaCuantitativa: 60,
      valoracionCualitativa: 'Desarrollo parcial de los objetivos holísticos formulados.',
      observacionesDocente: 'Falta adjuntar las firmas originales de la Directora de la Unidad Educativa y el diario de campo completo.',
      hashBlockchain: null,
      fechaValidacion: null
    }
  ]);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');

  // Estados para Modal de Verificación y Dictamen
  const [selectedActa, setSelectedActa] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMining, setIsMining] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    notaCuantitativa: '',
    valoracionCualitativa: '',
    observacionesDocente: ''
  });

  // Filtrado de Actas
  const filteredActas = actasList.filter(acta => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = acta.codigo.toLowerCase().includes(search) ||
                          acta.estudiante.toLowerCase().includes(search) ||
                          acta.ciEstudiante.includes(search) ||
                          acta.uePráctica.toLowerCase().includes(search);
    
    const matchesEstado = estadoFilter === 'todos' ? true : acta.estado === estadoFilter;
    return matchesSearch && matchesEstado;
  });

  // Abrir Modal de Auditoría y Dictamen
  const handleOpenReviewModal = (acta) => {
    setSelectedActa(acta);
    setReviewForm({
      notaCuantitativa: acta.notaCuantitativa || '',
      valoracionCualitativa: acta.valoracionCualitativa || '',
      observacionesDocente: acta.observacionesDocente || ''
    });
    setIsModalOpen(true);
  };

  // Función de Simulación de Minado Blockchain y Aprobación Final
  const handleApproveAndMine = () => {
    setIsMining(true);
    
    setTimeout(() => {
      // Generación simulada de Hash Criptográfico SHA-256
      const mockHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const fechaNow = new Date().toISOString().replace('T', ' ').substring(0, 16);

      setActasList(prev => prev.map(item => {
        if (item.id === selectedActa.id) {
          return {
            ...item,
            estado: 'Validado',
            notaCuantitativa: Number(reviewForm.notaCuantitativa),
            valoracionCualitativa: reviewForm.valoracionCualitativa,
            observacionesDocente: reviewForm.observacionesDocente || 'Acta validada y firmada digitalmente.',
            hashBlockchain: mockHash,
            fechaValidacion: fechaNow
          };
        }
        return item;
      }));

      setIsMining(false);
      setIsModalOpen(false);
    }, 1800);
  };

  // Función para Rechazar o Enviar Observaciones
  const handleObserveActa = () => {
    setActasList(prev => prev.map(item => {
      if (item.id === selectedActa.id) {
        return {
          ...item,
          estado: 'Observado',
          notaCuantitativa: Number(reviewForm.notaCuantitativa),
          valoracionCualitativa: reviewForm.valoracionCualitativa,
          observacionesDocente: reviewForm.observacionesDocente || 'Se requieren correcciones en la documentación adjunta.'
        };
      }
      return item;
    }));
    setIsModalOpen(false);
  };

  // Insignia de Estado
  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'Validado':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6B9E1E]/10 px-3 py-1 text-[11px] font-extrabold text-[#6B9E1E] border border-[#6B9E1E]/30">
            <CheckCircle2 size={13} /> Validado
          </span>
        );
      case 'Observado':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#801B28]/10 px-3 py-1 text-[11px] font-extrabold text-[#801B28] border border-[#801B28]/30">
            <AlertTriangle size={13} /> Observado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-extrabold text-amber-700 border border-amber-200">
            <Clock size={13} /> En Revisión
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER PRINCIPAL VIP */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        
        {/* Iluminación de Fondo */}
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#8C731A]/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-[#801B28]/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <ShieldCheck size={14} className="text-[#6B9E1E]" /> Auditoría y Sello de Inmutabilidad
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Revisión y Validaciones
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Dictamen cuali-cuantitativo de actas de práctica IEPC-PEC y minado de hashes criptográficos en la red Blockchain de la ESFMTHEA.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/15 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6B9E1E] text-white shadow-md">
              <Blocks size={20} />
            </div>
            <div>
              <span className="block text-[10px] uppercase font-extrabold text-[#F3EFCF]">Smart Contract Status</span>
              <span className="block text-xs font-mono font-bold text-white">Nodo Activo - SHA-256</span>
            </div>
          </div>
        </div>
      </div>

      {/* METRICAS Y RESUMEN DE ESTADOS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Pendientes de Revisión</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock size={18} />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 font-mono">
            {actasList.filter(a => a.estado === 'En Revisión').length}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Requieren dictamen docente</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Actas Validadas y Minadas</span>
            <div className="p-2 rounded-xl bg-[#6B9E1E]/10 text-[#6B9E1E]">
              <ShieldCheck size={18} />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 font-mono">
            {actasList.filter(a => a.estado === 'Validado').length}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Certificadas en la Blockchain</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Actas Observadas</span>
            <div className="p-2 rounded-xl bg-[#801B28]/10 text-[#801B28]">
              <AlertTriangle size={18} />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 font-mono">
            {actasList.filter(a => a.estado === 'Observado').length}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Devueltas para corrección</p>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        
        <div className="flex flex-1 items-center rounded-2xl bg-slate-50 px-4 py-3 border border-slate-200 focus-within:border-[#8C731A] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#8C731A]/20 transition-all">
          <Search size={18} className="text-slate-400 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder="Buscar por código de acta, C.I., estudiante o U.E...."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold outline-none text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 border border-slate-200">
          <Filter size={15} className="text-slate-400" />
          <select 
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="todos">Todos los Estados</option>
            <option value="En Revisión">Pendientes de Revisión</option>
            <option value="Validado">Validados (Minados)</option>
            <option value="Observado">Observados</option>
          </select>
        </div>

      </div>

      {/* TABLA DE AUDITORÍA Y DICTAMEN */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-black uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-4 px-5">Código / Estudiante</th>
                <th className="py-4 px-5">Unidad Educativa</th>
                <th className="py-4 px-5">Docente Tutor</th>
                <th className="py-4 px-5 text-center">Nota</th>
                <th className="py-4 px-5">Estado</th>
                <th className="py-4 px-5">Firma / Hash Criptográfico</th>
                <th className="py-4 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredActas.length > 0 ? (
                filteredActas.map((acta) => (
                  <tr key={acta.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <span className="block font-mono font-black text-[#8C731A]">{acta.codigo}</span>
                      <span className="block font-bold text-slate-900">{acta.estudiante}</span>
                      <span className="text-[10px] font-mono text-slate-400">C.I. {acta.ciEstudiante}</span>
                    </td>

                    <td className="py-4 px-5">
                      <span className="block font-bold text-slate-800">{acta.uePráctica}</span>
                      <span className="text-[10px] text-slate-400">{acta.especialidad}</span>
                    </td>

                    <td className="py-4 px-5 font-semibold text-slate-600">
                      {acta.docenteTutor}
                    </td>

                    <td className="py-4 px-5 text-center">
                      <span className="font-mono font-black text-xs text-slate-800 bg-slate-100 px-2.5 py-1 rounded-xl">
                        {acta.notaCuantitativa ? `${acta.notaCuantitativa} pts` : 'S/N'}
                      </span>
                    </td>

                    <td className="py-4 px-5">
                      {getEstadoBadge(acta.estado)}
                    </td>

                    <td className="py-4 px-5 max-w-xs">
                      {acta.hashBlockchain ? (
                        <div className="space-y-0.5">
                          <span className="block truncate font-mono text-[10px] font-extrabold text-[#6B9E1E] bg-[#6B9E1E]/10 px-2 py-0.5 rounded-md border border-[#6B9E1E]/20">
                            {acta.hashBlockchain}
                          </span>
                          <span className="block text-[9px] text-slate-400 font-mono">Verificado: {acta.fechaValidacion}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No firmado digitalmente</span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => handleOpenReviewModal(acta)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8C731A] text-white hover:bg-[#735E14] font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                      >
                        <FileSearch size={14} />
                        <span>Evaluar / Dictaminar</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-xs text-slate-400 font-medium">
                    No hay registros de actas para la búsqueda realizada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL AUDITORÍA, EVALUACIÓN Y FIRMA BLOCKCHAIN */}
      {isModalOpen && selectedActa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8C731A]/10 text-[#8C731A]">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Auditoría de Acta: <span className="font-mono text-[#8C731A]">{selectedActa.codigo}</span>
                  </h3>
                  <p className="text-xs text-slate-400">Verificación de datos, valoración cuali-cuantitativa y firma inmutable</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* DETALLES DEL DOCUMENTO */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6 text-xs">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Estudiante Practicante</span>
                <span className="block font-black text-slate-900">{selectedActa.estudiante}</span>
                <span className="text-[10px] font-mono text-slate-500">C.I. {selectedActa.ciEstudiante}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Unidad Educativa</span>
                <span className="block font-bold text-slate-800">{selectedActa.uePráctica}</span>
                <span className="text-[10px] text-slate-500">{selectedActa.fase}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Docente Tutor / Acompañante</span>
                <span className="block font-bold text-slate-800">{selectedActa.docenteTutor}</span>
                <span className="text-[10px] text-slate-500">Especialidad: {selectedActa.especialidad}</span>
              </div>
            </div>

            {/* FORMULARIO DE REVISIÓN Y OBSERVACIONES */}
            <div className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Nota Asignada (/100) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={reviewForm.notaCuantitativa}
                    onChange={(e) => setReviewForm({ ...reviewForm, notaCuantitativa: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-mono font-black text-[#8C731A] outline-none focus:border-[#8C731A] focus:bg-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Estado del Documento</label>
                  <div className="flex items-center gap-2 pt-1">
                    {getEstadoBadge(selectedActa.estado)}
                    {selectedActa.hashBlockchain && (
                      <span className="text-[11px] font-mono text-[#6B9E1E] font-bold">● Sello Criptográfico Válido</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Valoración Cualitativa *</label>
                <textarea
                  rows={2}
                  value={reviewForm.valoracionCualitativa}
                  onChange={(e) => setReviewForm({ ...reviewForm, valoracionCualitativa: e.target.value })}
                  placeholder="Apreciación del cumplimiento de los objetivos holísticos..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-800 outline-none focus:border-[#8C731A] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Observaciones o Instrucciones de Corrección</label>
                <textarea
                  rows={2}
                  value={reviewForm.observacionesDocente}
                  onChange={(e) => setReviewForm({ ...reviewForm, observacionesDocente: e.target.value })}
                  placeholder="Escriba aquí si el acta requiere ajustes o le faltan sellos antes de ser minada..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-800 outline-none focus:border-[#8C731A] focus:bg-white"
                />
              </div>

              {/* MUESTRA DE BLOQUE BLOCKCHAIN SI YA FUE VALIDADO */}
              {selectedActa.hashBlockchain && (
                <div className="rounded-2xl bg-slate-900 p-4 text-white space-y-1 font-mono text-xs">
                  <span className="block text-[10px] text-[#6B9E1E] uppercase font-bold">Firma Digital SHA-256 Registrada</span>
                  <p className="truncate text-slate-300 font-bold">{selectedActa.hashBlockchain}</p>
                </div>
              )}

            </div>

            {/* BOTONES DE ACCIÓN (Aprobar o Registrar Observación) */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleObserveActa}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#801B28]/10 text-[#801B28] px-5 py-3 text-xs font-bold hover:bg-[#801B28] hover:text-white transition-all cursor-pointer"
              >
                <AlertTriangle size={16} />
                <span>Registrar Observación / Devolver</span>
              </button>

              <button
                type="button"
                disabled={isMining}
                onClick={handleApproveAndMine}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6B9E1E] to-[#8BC34A] text-white px-6 py-3 text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-[#6B9E1E]/30 hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50"
              >
                {isMining ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Minando Bloque en Blockchain...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Aprobar y Sellar Criptográficamente</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};