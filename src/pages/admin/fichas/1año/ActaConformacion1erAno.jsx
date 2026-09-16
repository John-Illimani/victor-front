import React, { useState, useEffect } from 'react';
import { ModalBase } from './ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { Plus, Trash2, MapPin, Users, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO } from '../../../../utils/camposFichas';
import { actaConformacionService } from '../../../../services/fichas/1año/actaConformacionService';
import { especialidadService } from '../../../../services/especialidadService';

export const ActaConformacion1erAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "1_ACTA_EQUIPO";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Estado para la lista dinámica de especialidades traídas de la API
  const [especialidadesApi, setEspecialidadesApi] = useState([]);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(false);

  // Estados de Modales Notificadores
  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  // Valores iniciales por defecto para limpiar o resetear el formulario
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
        especialidad: estudianteSeleccionado?.especialidad || '',
        ci: estudianteSeleccionado?.ci || '',
        nro_celular: estudianteSeleccionado?.telefono || ''
      }
    ]
  };

  const [formData, setFormData] = useState({
    ...initialFormState,
    ...fichaData
  });

  // 1. Cargar la lista de especialidades desde la API al abrir el modal
  useEffect(() => {
    const fetchEspecialidades = async () => {
      if (isOpen) {
        setLoadingEspecialidades(true);
        try {
          const data = await especialidadService.getEspecialidades();
          setEspecialidadesApi(data);

          if (!formData.especialidad && data.length > 0) {
            const inicial = estudianteSeleccionado?.especialidad || data[0].nombre;
            setFormData(prev => ({ ...prev, especialidad: inicial }));
          }
        } catch (error) {
          console.error("Error al cargar especialidades de la API:", error);
        } finally {
          setLoadingEspecialidades(false);
        }
      }
    };

    fetchEspecialidades();
  }, [isOpen]);

  // 2. Cargar datos del acta desde la API cuando abre el modal
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
              especialidad: res.datos.especialidad || estudianteSeleccionado.especialidad || prev.especialidad
            }));
            if (setFichaData) setFichaData(res.datos);
          } else {
            const defaultState = {
              ...initialFormState,
              especialidad: estudianteSeleccionado.especialidad || prev.especialidad,
              integrantes: [
                {
                  apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
                  especialidad: estudianteSeleccionado.especialidad || '',
                  ci: estudianteSeleccionado.ci || '',
                  nro_celular: estudianteSeleccionado.telefono || ''
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

  // Validación para restringir la gestión a máximo 4 dígitos
  const handleGestionChange = (e) => {
    const valor = e.target.value.replace(/\D/g, '').slice(0, 4);
    handleChange('gestion', valor);
  };

  const handleIntegranteChange = (idx, field, value) => {
    const list = [...formData.integrantes];
    list[idx][field] = value;
    handleChange('integrantes', list);
  };

  const addIntegrante = () => {
    handleChange('integrantes', [...formData.integrantes, { apellidos_nombres: '', especialidad: '', ci: '', nro_celular: '' }]);
  };

  const removeIntegrante = (idx) => {
    handleChange('integrantes', formData.integrantes.filter((_, i) => i !== idx));
  };

  // Guardar o Actualizar
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

  // Confirmar Eliminación
  const ejecutarEliminacion = async () => {
    if (!estudianteSeleccionado?.id) return;

    setDeleting(true);
    try {
      const res = await actaConformacionService.delete(estudianteSeleccionado.id);
      
      // Limpiar formulario localmente
      const clearedData = {
        ...initialFormState,
        especialidad: estudianteSeleccionado?.especialidad || (especialidadesApi[0]?.nombre || ''),
        integrantes: [
          {
            apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
            especialidad: estudianteSeleccionado.especialidad || '',
            ci: estudianteSeleccionado.ci || '',
            nro_celular: estudianteSeleccionado.telefono || ''
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

  // Renderizado del pie del modal con botones de Guardar y Cerrar
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
              
              {/* CABECERA SUPERIOR SOLO CON TÍTULO Y BOTÓN DE ELIMINAR */}
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
                      className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold text-slate-800 disabled:opacity-50"
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

              {/* INTEGRANTES DEL EQUIPO COMUNITARIO */}
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
                  {formData.integrantes?.map((int, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <span className="font-mono font-bold w-6 text-center">{idx + 1}</span>
                      <input
                        type="text"
                        placeholder="APELLIDOS Y NOMBRES"
                        value={int.apellidos_nombres || ''}
                        onChange={(e) => handleIntegranteChange(idx, 'apellidos_nombres', e.target.value)}
                        className="flex-1 border p-1.5 rounded-lg bg-white font-medium"
                      />
                      
                      <input
                        type="text"
                        placeholder="C.I."
                        value={int.ci || ''}
                        onChange={(e) => handleIntegranteChange(idx, 'ci', e.target.value)}
                        className="w-24 border p-1.5 rounded-lg bg-white font-mono"
                      />
                     
                      {formData.integrantes.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeIntegrante(idx)} 
                          className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </ModalBase>

      {/* MODAL DE NOTIFICACIÓN DE SISTEMA */}
      <ConfirmModal
        isOpen={modalNotif.isOpen}
        onClose={() => setModalNotif({ ...modalNotif, isOpen: false })}
        titulo={modalNotif.titulo}
        mensaje={modalNotif.mensaje}
        tipo={modalNotif.tipo}
      />

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
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