import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Eye, 
  Lock, 
  Unlock, 
  X, 
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import { gestionService } from '../../services/gestionService';

export const GestionesManagement = () => {
  const [gestiones, setGestiones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedGestion, setSelectedGestion] = useState(null);

  // Feedback Modal
  const [feedbackModal, setFeedbackModal] = useState({ show: false, title: '', message: '', type: 'success' });

  // Formulario
  const [formData, setFormData] = useState({
    gestion: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    estado: 'Activa'
  });

  const showFeedback = (title, message, type = 'success') => {
    setFeedbackModal({ show: true, title, message, type });
  };

  const fetchGestiones = async () => {
    setLoading(true);
    try {
      const data = await gestionService.getGestiones();
      setGestiones(data);
    } catch (err) {
      showFeedback('Error', err.message || 'Error al conectar con la base de datos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGestiones();
  }, []);

  const handleCreateGestion = async (e) => {
    e.preventDefault();
    try {
      await gestionService.createGestion(formData);
      showFeedback('Éxito', `La gestión ${formData.gestion} ha sido creada correctamente.`, 'success');
      setShowCreateModal(false);
      setFormData({ gestion: '', descripcion: '', fechaInicio: '', fechaFin: '', estado: 'Activa' });
      
      // Notificación instantánea al Sidebar
      window.dispatchEvent(new Event("gestionChanged"));
      fetchGestiones();
    } catch (err) {
      showFeedback('Error al Crear', err.message || 'No se pudo guardar la gestión.', 'error');
    }
  };

  const toggleGestionStatus = async (g) => {
    const nuevoEstado = g.estado === 'Activa' ? 'Cerrada' : 'Activa';
    try {
      const res = await gestionService.toggleEstadoGestion(g.id, nuevoEstado);
      showFeedback('Estado Actualizado', res.message || `La gestión ${g.gestion} cambio a ${nuevoEstado}.`, 'success');
      
      // Notificación instantánea al Sidebar
      window.dispatchEvent(new Event("gestionChanged"));
      fetchGestiones();
    } catch (err) {
      showFeedback('Error', err.message || 'No se pudo cambiar el estado.', 'error');
    }
  };

  const handleOpenEdit = (g) => {
    setSelectedGestion(g);
    setFormData({
      gestion: g.gestion,
      descripcion: g.descripcion || '',
      fechaInicio: g.fechaInicio || '',
      fechaFin: g.fechaFin || '',
      estado: g.estado
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await gestionService.updateGestion(selectedGestion.id, formData);
      showFeedback('Actualizado', `Los datos de la gestión ${formData.gestion} fueron actualizados.`, 'success');
      setShowEditModal(false);
      
      // Notificación instantánea al Sidebar
      window.dispatchEvent(new Event("gestionChanged"));
      fetchGestiones();
    } catch (err) {
      showFeedback('Error', err.message || 'No se pudo guardar los cambios.', 'error');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <Calendar size={14} className="text-[#8C731A]" /> Gestión Académica
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Administración de Gestiones
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Apertura, cierre y administración de períodos académicos lectivos para la IEPC-PEC.
            </p>
          </div>

          <button
            onClick={() => {
              setFormData({ gestion: '', descripcion: '', fechaInicio: '', fechaFin: '', estado: 'Activa' });
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg hover:bg-[#a32334] transition-all cursor-pointer shrink-0"
          >
            <Plus size={18} />
            Crear Gestión
          </button>
        </div>
      </div>

      {/* TARJETAS DE GESTIONES */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-bold">
          <Loader2 className="animate-spin inline mr-2 text-[#801B28]" size={24} />
          Cargando gestiones académicas...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gestiones.map((g) => (
            <div 
              key={g.id} 
              className={`rounded-3xl border p-6 bg-white shadow-sm transition-all relative overflow-hidden flex flex-col justify-between ${
                g.estado === 'Activa' ? 'border-[#8C731A] ring-2 ring-[#8C731A]/20' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black font-mono text-slate-900 tracking-tight">
                  {g.gestion}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  g.estado === 'Activa' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {g.estado === 'Activa' ? <Unlock size={12} /> : <Lock size={12} />}
                  {g.estado}
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-2">{g.descripcion || 'Sin descripción disponible.'}</p>

              <div className="space-y-2 rounded-2xl bg-slate-50 p-3.5 border border-slate-100 text-xs mb-5">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Estudiantes matriculados:</span>
                  <span className="font-bold text-slate-800 font-mono">{g.totalEstudiantes}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Actas IEPC-PEC registradas:</span>
                  <span className="font-bold text-slate-800 font-mono">{g.totalActas}</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => { setSelectedGestion(g); setShowDetailModal(true); }}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#8C731A] transition-colors cursor-pointer"
                >
                  <Eye size={14} /> Consultar
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(g)}
                    className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                    title="Editar Gestión"
                  >
                    <Edit size={14} />
                  </button>

                  <button
                    onClick={() => toggleGestionStatus(g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      g.estado === 'Activa' 
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white' 
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                    }`}
                  >
                    {g.estado === 'Activa' ? 'Deshabilitar' : 'Habilitar'}
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL CREAR GESTIÓN */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-1">
              <Calendar className="text-[#801B28]" size={20} />
              Crear Nueva Gestión Académica
            </h2>
            <p className="text-xs text-slate-500 mb-5">Habilita un nuevo ciclo para la carga de actas e inscripción.</p>

            <form onSubmit={handleCreateGestion} className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Año de la Gestión *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 2027"
                  value={formData.gestion}
                  onChange={(e) => setFormData({ ...formData, gestion: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono font-bold focus:border-[#8C731A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Descripción / Nota Informativa</label>
                <input
                  type="text"
                  placeholder="Ej. Gestión Académica Oficial 2027"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#8C731A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#8C731A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#8C731A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Estado Inicial *</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-700 focus:border-[#8C731A] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Activa">Activa</option>
                  <option value="Cerrada">Cerrada</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#801B28] px-5 py-2 font-bold text-white hover:bg-[#a32334] shadow-md cursor-pointer"
                >
                  Guardar Gestión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR GESTIÓN */}
      {showEditModal && selectedGestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-1">
              <Edit className="text-blue-600" size={20} />
              Editar Gestión {selectedGestion.gestion}
            </h2>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs mt-4">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#8C731A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#8C731A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#8C731A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-700 focus:border-[#8C731A] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Activa">Activa</option>
                  <option value="Cerrada">Cerrada</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow-md cursor-pointer"
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONSULTAR GESTIÓN */}
      {showDetailModal && selectedGestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-black text-slate-900 mb-4 border-b border-slate-100 pb-3">
              Información de la Gestión {selectedGestion.gestion}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-bold">Estado del Período:</span>
                <span className="text-slate-900 font-extrabold text-sm">{selectedGestion.estado}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Descripción:</span>
                <span className="text-slate-800 font-medium">{selectedGestion.descripcion || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block font-bold">Estudiantes:</span>
                  <span className="text-slate-900 font-mono font-bold text-sm">{selectedGestion.totalEstudiantes}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">Actas Totales:</span>
                  <span className="text-slate-900 font-mono font-bold text-sm">{selectedGestion.totalActas}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FEEDBACK */}
      {feedbackModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
              feedbackModal.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {feedbackModal.type === 'success' ? <CheckCircle2 size={30} /> : <AlertCircle size={30} />}
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-1">{feedbackModal.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">{feedbackModal.message}</p>

            <button
              type="button"
              onClick={() => setFeedbackModal({ ...feedbackModal, show: false })}
              className={`w-full rounded-xl py-2.5 text-xs font-bold text-white shadow-md cursor-pointer ${
                feedbackModal.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};