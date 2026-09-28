import React, { useState, useEffect } from 'react';
import { ModalBase } from './ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { Plus, Trash2, MapPin, Users, Save, Loader2, Trash, X, UserCheck } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO } from '../../../../utils/camposFichas';
import { actaConformacionService } from '../../../../services/fichas/1año/actaConformacionService';
import { especialidadService } from '../../../../services/especialidadService';
import { studentService } from '../../../../services/studentService';

export const ActaConformacion1erAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "1_ACTA_EQUIPO";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Lista general de estudiantes para autocompletado
  const [todosEstudiantes, setTodosEstudiantes] = useState([]);
  const [activeSearchIndex, setActiveSearchIndex] = useState(null);

  // Estado para la lista dinámica de especialidades traídas de la API
  const [especialidadesApi, setEspecialidadesApi] = useState([]);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(false);

  // Estados de Modales Notificadores
  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  // Valores iniciales por defecto
  const initialFormState = {
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    esfm_predios: 'ESFM Simón Bolívar / UA El Alto',
    hora: '09:00',
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    gestion: '2026',
    ano_formacion: '1er Año',
    especialidad: '',
    integrantes: [
      {
        apellidos_nombres: estudianteSeleccionado ? `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim() : '',
        ci: estudianteSeleccionado?.ci || ''
      }
    ]
  };

  const [formData, setFormData] = useState({
    ...initialFormState,
    ...fichaData
  });

  // 1. Cargar catálogo de especialidades y lista completa de estudiantes
  useEffect(() => {
    const fetchCatalogos = async () => {
      if (isOpen) {
        setLoadingEspecialidades(true);
        try {
          const [dataEspec, dataEstud] = await Promise.all([
            especialidadService.getEspecialidades(),
            studentService.getStudents()
          ]);

          setEspecialidadesApi(dataEspec);
          setTodosEstudiantes(Array.isArray(dataEstud) ? dataEstud : dataEstud?.estudiantes || []);

          if (!formData.especialidad && dataEspec.length > 0) {
            setFormData(prev => ({ 
              ...prev, 
              especialidad: prev.especialidad || estudianteSeleccionado?.especialidad || dataEspec[0].nombre 
            }));
          }
        } catch (error) {
          console.error("Error al cargar catálogos iniciales:", error);
        } finally {
          setLoadingEspecialidades(false);
        }
      }
    };

    fetchCatalogos();
  }, [isOpen]);

  // 2. Cargar datos del acta desde la API respetando los valores propios de la ficha
  useEffect(() => {
    const fetchActa = async () => {
      if (isOpen && estudianteSeleccionado?.id) {
        setLoading(true);
        try {
          const res = await actaConformacionService.getByEstudiante(estudianteSeleccionado.id);
          if (res.existe && res.datos) {
            setFormData(prev => ({
              ...prev,
              ...res.datos,
              gestion: String(res.datos.gestion || '2026').slice(0, 4),
              especialidad: res.datos.especialidad || prev.especialidad || estudianteSeleccionado.especialidad || ''
            }));
            if (setFichaData) setFichaData(res.datos);
          } else {
            const defaultState = {
              ...initialFormState,
              especialidad: formData.especialidad || estudianteSeleccionado.especialidad || '',
              integrantes: [
                {
                  apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
                  ci: estudianteSeleccionado.ci || ''
                }
              ]
            };
            setFormData(prev => ({ ...prev, ...defaultState }));
          }
        } catch (error) {
          mostrarNotificacion("Error de Servidor", error.message || "No se pudo conectar con el servidor backend.", "error");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchActa();
  }, [isOpen, estudianteSeleccionado]);

  const mostrarNotificacion = (titulo, mensaje, tipo = 'info') => {
    setModalNotif({ isOpen: true, titulo, mensaje, tipo });
  };

  const handleChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  const handleGestionChange = (e) => {
    const valor = e.target.value.replace(/\D/g, '').slice(0, 4);
    handleChange('gestion', valor);
  };

  const handleIntegranteChange = (idx, field, value) => {
    const list = [...formData.integrantes];
    list[idx][field] = value;
    handleChange('integrantes', list);
  };

  // Seleccionar estudiante de la lista desplegable de autocompletado (solo nombres y C.I.)
  const handleSelectEstudianteAuto = (idx, est) => {
    const list = [...formData.integrantes];
    list[idx] = {
      apellidos_nombres: `${est.apellido || ''} ${est.nombre || ''}`.trim(),
      ci: est.ci || ''
    };
    handleChange('integrantes', list);
    setActiveSearchIndex(null);
  };

  const addIntegrante = () => {
    handleChange('integrantes', [...formData.integrantes, { apellidos_nombres: '', ci: '' }]);
  };

  const removeIntegrante = (idx) => {
    handleChange('integrantes', formData.integrantes.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!estudianteSeleccionado?.id) {
      mostrarNotificacion("Estudiante No Seleccionado", "Debe seleccionar un estudiante antes de guardar el acta.", "error");
      return;
    }

    if (!formData.gestion || formData.gestion.length !== 4) {
      mostrarNotificacion("Gestión Inválida", "Por favor ingrese un año de gestión válido de 4 dígitos (Ej. 2026).", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await actaConformacionService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "El Acta de Conformación fue guardada exitosamente.", "success");
    } catch (error) {
      mostrarNotificacion("Error al Guardar", error.message || "No se pudieron guardar los datos en el servidor.", "error");
    } finally {
      setSaving(false);
    }
  };

  const ejecutarEliminacion = async () => {
    if (!estudianteSeleccionado?.id) return;

    setDeleting(true);
    try {
      const res = await actaConformacionService.delete(estudianteSeleccionado.id);
      
      const clearedData = {
        ...initialFormState,
        especialidad: formData.especialidad || estudianteSeleccionado?.especialidad || (especialidadesApi[0]?.nombre || ''),
        integrantes: [
          {
            apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
            ci: estudianteSeleccionado.ci || ''
          }
        ]
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);

      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "El acta fue eliminada de la base de datos.", "success");
    } catch (error) {
      setModalConfirmDelete(false);
      mostrarNotificacion("Error al Eliminar", error.message || "No se pudo eliminar el registro.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const footerButtons = (
    <div className="flex justify-end gap-2 w-full">
      <button
        type="button"
        onClick={onClose}
        disabled={saving || deleting}
        className="px-4 py-2 bg-slate-200 text-slate-700 font-extrabold rounded-xl hover:bg-slate-300 transition-colors text-xs cursor-pointer disabled:opacity-50 flex items-center gap-1"
      >
        <X size={14} /> Cerrar Ventana
      </button>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || deleting}
        className="px-5 py-2 bg-[#801B28] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-rose-900 transition-all shadow-md cursor-pointer disabled:opacity-50"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {saving ? "Guardando..." : "Guardar Acta"}
      </button>
    </div>
  );

  return (
    <>
      <ModalBase 
        isOpen={isOpen} 
        onClose={onClose} 
        titulo={config?.titulo || "ACTA DE CONFORMACIÓN DE EQUIPO"}
        footer={footerButtons}
      >
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando información del servidor...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <h4 className="font-extrabold text-[#801B28] uppercase text-sm">
                  {config?.titulo || "ACTA DE CONFORMACIÓN DE EQUIPO COMUNITARIO"}
                </h4>

                <button
                  type="button"
                  onClick={() => setModalConfirmDelete(true)}
                  disabled={deleting || saving}
                  className="px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                  title="Eliminar este registro"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash size={14} />}
                  {deleting ? "Eliminando..." : "Eliminar"}
                </button>
              </div>

              {/* DATOS DE REUNIÓN Y LUGAR */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                  <MapPin size={15} /> DATOS DE LUGAR Y FECHA
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Ciudad / Localidad:</label>
                    <input
                      type="text"
                      value={formData.lugar_ciudad}
                      onChange={(e) => handleChange('lugar_ciudad', e.target.value)}
                      className="w-full border border-slate-200 p-2 rounded-xl bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Departamento:</label>
                    <select
                      value={formData.departamento}
                      onChange={(e) => handleChange('departamento', e.target.value)}
                      className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold text-slate-800"
                    >
                      {DEPARTAMENTOS_BOLIVIA.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Predios de la ESFM/UA:</label>
                    <input
                      type="text"
                      value={formData.esfm_predios}
                      onChange={(e) => handleChange('esfm_predios', e.target.value)}
                      className="w-full border border-slate-200 p-2 rounded-xl bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Hora:</label>
                    <input
                      type="time"
                      value={formData.hora}
                      onChange={(e) => handleChange('hora', e.target.value)}
                      className="w-full border border-slate-200 p-2 rounded-xl bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Día:</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.dia}
                      onChange={(e) => handleChange('dia', e.target.value)}
                      className="w-full border border-slate-200 p-2 rounded-xl bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Mes:</label>
                    <select
                      value={formData.mes}
                      onChange={(e) => handleChange('mes', e.target.value)}
                      className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold text-slate-800 uppercase"
                    >
                      {MESES_ANIO.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Gestión (Año):</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="AAAA"
                      value={formData.gestion}
                      onChange={handleGestionChange}
                      className="w-full border border-slate-200 p-2 rounded-xl bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                    <select
                      value={formData.especialidad}
                      onChange={(e) => handleChange('especialidad', e.target.value)}
                      disabled={loadingEspecialidades}
                      className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold text-slate-800 disabled:opacity-50 cursor-pointer"
                    >
                      {loadingEspecialidades ? (
                        <option value="">Cargando especialidades...</option>
                      ) : (
                        especialidadesApi.map(esp => (
                          <option key={esp.id || esp.codigo} value={esp.nombre}>
                            {esp.nombre}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* INTEGRANTES DEL EQUIPO COMUNITARIO (NOMBRES + C.I.) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                    <Users size={15} /> INTEGRANTES DEL EQUIPO COMUNITARIO
                  </span>
                  <button
                    type="button"
                    onClick={addIntegrante}
                    className="flex items-center gap-1 bg-[#801B28] text-white px-2.5 py-1 rounded-xl font-bold text-[10px] cursor-pointer"
                  >
                    <Plus size={14} /> Agregar Integrante
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.integrantes?.map((int, idx) => {
                    const searchTerm = (int.apellidos_nombres || '').toLowerCase().trim();
                    const filteredStudents = todosEstudiantes.filter(est => {
                      if (!searchTerm || searchTerm.length < 2) return false;
                      const fullName = `${est.nombre || ''} ${est.apellido || ''}`.toLowerCase();
                      const ci = String(est.ci || '').toLowerCase();
                      return fullName.includes(searchTerm) || ci.includes(searchTerm);
                    });

                    return (
                      <div key={idx} className="relative flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <span className="font-mono font-bold w-6 text-center text-slate-500">{idx + 1}</span>

                        {/* INPUT NOMBRE Y APELLIDOS CON AUTOCOMPLETADO */}
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="APELLIDOS Y NOMBRES"
                            value={int.apellidos_nombres || ''}
                            onChange={(e) => {
                              handleIntegranteChange(idx, 'apellidos_nombres', e.target.value);
                              setActiveSearchIndex(idx);
                            }}
                            onFocus={() => setActiveSearchIndex(idx)}
                            className="w-full border border-slate-300 p-1.5 rounded-lg bg-white font-medium focus:border-[#8C731A] focus:outline-none"
                          />

                          {/* MENÚ DESPLEGABLE AUTOCOMPLETADO */}
                          {activeSearchIndex === idx && filteredStudents.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto divide-y divide-slate-100">
                              {filteredStudents.map((est) => (
                                <div
                                  key={est.id}
                                  onClick={() => handleSelectEstudianteAuto(idx, est)}
                                  className="p-2 hover:bg-amber-50/80 cursor-pointer transition-colors flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                      <UserCheck size={14} className="text-emerald-700" />
                                      {est.apellido} {est.nombre}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono">
                                      C.I.: {est.ci}
                                    </div>
                                  </div>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-100 text-slate-700">
                                    {est.ano_formacion || 'S/A'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* INPUT C.I. */}
                        <input
                          type="text"
                          placeholder="C.I."
                          value={int.ci || ''}
                          onChange={(e) => handleIntegranteChange(idx, 'ci', e.target.value)}
                          className="w-28 border border-slate-300 p-1.5 rounded-lg bg-white font-mono"
                        />

                        {formData.integrantes.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeIntegrante(idx)} 
                            className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer shrink-0"
                            title="Remover Integrante"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      </ModalBase>

      <ConfirmModal
        isOpen={modalNotif.isOpen}
        onClose={() => setModalNotif({ ...modalNotif, isOpen: false })}
        titulo={modalNotif.titulo}
        mensaje={modalNotif.mensaje}
        tipo={modalNotif.tipo}
      />

      <ConfirmModal
        isOpen={modalConfirmDelete}
        onClose={() => setModalConfirmDelete(false)}
        onConfirm={ejecutarEliminacion}
        titulo="¿Eliminar Registro?"
        mensaje="Esta acción eliminará el Acta de Conformación de la base de datos de manera permanente."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};