import React, { useState, useEffect } from 'react';
import { ModalBase } from './ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { MapPin, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaF1Service } from '../../../../services/fichas/1año/fichaF1Service';
import { especialidadService } from '../../../../services/especialidadService';

export const FichaF1_1erAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "1_F1";
  const config = CONFIGURACION_FICHAS[codigoFicha];
  
  // Criterios estandarizados directamente a las columnas f1_criterio_1 al 4
  const criterios = [
    { key: 'f1_criterio_1', label: config?.criterios?.[0]?.label || '1. Presentación oportuna del Plan de Acción e instrumentos' },
    { key: 'f1_criterio_2', label: config?.criterios?.[1]?.label || '2. Coherencia en la estructura del Plan de Acción' },
    { key: 'f1_criterio_3', label: config?.criterios?.[2]?.label || '3. Pertinencia y calidad de los instrumentos elaborados' },
    { key: 'f1_criterio_4', label: config?.criterios?.[3]?.label || '4. Validación y ajuste de instrumentos en función al contexto' }
  ];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Especialidades de API
  const [especialidadesApi, setEspecialidadesApi] = useState([]);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(false);

  // Modales Notificadores
  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  // Estado Inicial
  const initialFormState = {
    apellidos_nombres: estudianteSeleccionado ? `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim() : '',
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    especialidad: estudianteSeleccionado?.especialidad || '',
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    ano: '2026',
    f1_criterio_1: 0,
    f1_criterio_2: 0,
    f1_criterio_3: 0,
    f1_criterio_4: 0,
    promedio_numeral: 0,
    promedio_literal: 'CERO CON 00/100',
    observaciones: '',
    docente_investigacion_id: ''
  };

  const [formData, setFormData] = useState({
    ...initialFormState,
    ...fichaData
  });

  // 1. Cargar Especialidades de API
  useEffect(() => {
    const fetchEspecialidades = async () => {
      if (isOpen) {
        setLoadingEspecialidades(true);
        try {
          const data = await especialidadService.getEspecialidades();
          setEspecialidadesApi(data);
          if (!formData.especialidad && data.length > 0) {
            setFormData(prev => ({ ...prev, especialidad: estudianteSeleccionado?.especialidad || data[0].nombre }));
          }
        } catch (error) {
          console.error("Error al cargar especialidades:", error);
        } finally {
          setLoadingEspecialidades(false);
        }
      }
    };
    fetchEspecialidades();
  }, [isOpen]);

  // 2. Cargar Ficha F-1 desde la API
  useEffect(() => {
    const fetchFicha = async () => {
      if (isOpen && estudianteSeleccionado?.id) {
        setLoading(true);
        try {
          const res = await fichaF1Service.getByEstudiante(estudianteSeleccionado.id);
          if (res.existe && res.datos) {
            setFormData(prev => ({
              ...prev,
              ...res.datos,
              ano: String(res.datos.ano || '2026').slice(0, 4),
              especialidad: res.datos.especialidad || estudianteSeleccionado.especialidad || prev.especialidad,
              // Convertimos a Number para eliminar ceros decimales innecesarios (ej. "10.00" -> 10)
              f1_criterio_1: Number(res.datos.f1_criterio_1 ?? res.datos.plan_accion_criterio1 ?? 0),
              f1_criterio_2: Number(res.datos.f1_criterio_2 ?? res.datos.plan_accion_criterio2 ?? 0),
              f1_criterio_3: Number(res.datos.f1_criterio_3 ?? res.datos.instrumentos_criterio1 ?? 0),
              f1_criterio_4: Number(res.datos.f1_criterio_4 ?? res.datos.instrumentos_criterio2 ?? 0),
              promedio_numeral: Number(res.datos.promedio_numeral ?? 0)
            }));
            if (setFichaData) setFichaData(res.datos);
          } else {
            const defaultState = {
              ...initialFormState,
              apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
              especialidad: estudianteSeleccionado.especialidad || prev.especialidad
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
    fetchFicha();
  }, [isOpen, estudianteSeleccionado]);

  const mostrarNotificacion = (titulo, mensaje, tipo = 'info') => {
    setModalNotif({ isOpen: true, titulo, mensaje, tipo });
  };

  const handleNotaChange = (key, value) => {
    let val = value === '' ? '' : parseFloat(value);
    if (val !== '' && isNaN(val)) val = 0;
    else if (val < 0) val = 0;
    else if (val > 100) val = 100;

    const newForm = { ...formData, [key]: val };
    const notas = criterios.map(c => parseFloat(newForm[c.key])).filter(n => !isNaN(n));
    const prom = notas.length > 0 ? parseFloat((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)) : 0;

    newForm.promedio_numeral = prom;
    newForm.promedio_literal = convertirNumeroALiteral(prom);

    setFormData(newForm);
    if (setFichaData) setFichaData(newForm);
  };

  const handleCampoChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  // Restricción a 4 dígitos en Año
  const handleAnoChange = (e) => {
    const valor = e.target.value.replace(/\D/g, '').slice(0, 4);
    handleCampoChange('ano', valor);
  };

  // Guardar Ficha F1
  const handleSave = async () => {
    if (!estudianteSeleccionado?.id) {
      mostrarNotificacion("Estudiante No Seleccionado", "Debe seleccionar un estudiante antes de guardar la ficha.", "error");
      return;
    }

    if (!formData.ano || formData.ano.length !== 4) {
      mostrarNotificacion("Año Inválido", "Por favor ingrese un año válido de 4 dígitos (Ej. 2026).", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fichaF1Service.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "La Ficha F-1 fue registrada exitosamente.", "success");
    } catch (error) {
      mostrarNotificacion("Error al Guardar", error.message || "No se pudieron guardar los datos.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Eliminar Ficha F1 y Resetear Formulario
  const ejecutarEliminacion = async () => {
    if (!estudianteSeleccionado?.id) return;

    setDeleting(true);
    try {
      const res = await fichaF1Service.delete(estudianteSeleccionado.id);

      const clearedData = {
        ...initialFormState,
        apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
        especialidad: estudianteSeleccionado?.especialidad || (especialidadesApi[0]?.nombre || '')
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);

      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "La Ficha F-1 fue eliminada correctamente.", "success");
    } catch (error) {
      setModalConfirmDelete(false);
      mostrarNotificacion("Error al Eliminar", error.message || "No se pudo eliminar el registro.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // Pie del Modal con Guardar y Cerrar
  const footerButtons = (
    <div className="flex justify-end gap-2 w-full">
      <button
        type="button"
        onClick={onClose}
        disabled={saving || deleting}
        className="px-4 py-2 bg-slate-200 text-slate-700 font-extrabold rounded-xl hover:bg-slate-300 transition-colors text-xs cursor-pointer flex items-center gap-1 disabled:opacity-50"
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
        {saving ? "Guardando..." : "Guardar Ficha F-1"}
      </button>
    </div>
  );

  return (
    <>
      <ModalBase 
        isOpen={isOpen} 
        onClose={onClose} 
        titulo={config?.titulo || "FICHA F-1: EVALUACIÓN DE INSTRUMENTOS"}
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
              
              {/* CABECERA SUPERIOR */}
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <h4 className="font-extrabold text-[#801B28] uppercase text-sm">
                  {config?.titulo || "FICHA F-1: ELABORACIÓN Y VALIDACIÓN DE INSTRUMENTOS"}
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

              {/* CRITERIOS DE EVALUACIÓN */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-800 uppercase text-[11px] block">
                  CRITERIOS DE EVALUACIÓN OFICIALES
                </span>
                <div className="space-y-2">
                  {criterios.map(crit => (
                    <div key={crit.key} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border">
                      <span className="sm:col-span-3 font-medium text-slate-800">{crit.label}</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        placeholder="0-100"
                        value={formData[crit.key] ?? ''}
                        onChange={(e) => handleNotaChange(crit.key, e.target.value)}
                        className="w-full border p-1.5 rounded-lg bg-white font-mono font-bold text-center text-slate-900 focus:border-[#801B28]"
                      />
                    </div>
                  ))}
                </div>

                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Promedio Final:</label>
                    <div className="font-mono font-black text-2xl text-[#801B28]">
                      {Number(formData.promedio_numeral || 0)} / 100 PTS
                    </div>
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Literal:</label>
                    <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">{formData.promedio_literal}</div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-1">Observaciones y/o sugerencias:</label>
                  <textarea
                    rows="3"
                    value={formData.observaciones || ''}
                    onChange={(e) => handleCampoChange('observaciones', e.target.value)}
                    className="w-full border p-2.5 rounded-xl font-medium text-slate-800 text-xs"
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </div>

              {/* LUGAR Y FECHA */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-[#801B28] uppercase text-[11px] flex items-center gap-1.5">
                  <MapPin size={14} /> LUGAR Y FECHA
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Ciudad / Localidad:</label>
                    <input type="text" value={formData.lugar_ciudad || ''} onChange={(e) => handleCampoChange('lugar_ciudad', e.target.value)} className="w-full border p-2 rounded-xl" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Departamento:</label>
                    <select value={formData.departamento || DEPARTAMENTOS_BOLIVIA[0]} onChange={(e) => handleCampoChange('departamento', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold">
                      {DEPARTAMENTOS_BOLIVIA.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Día:</label>
                    <input type="text" value={formData.dia || ''} onChange={(e) => handleCampoChange('dia', e.target.value)} className="w-full border p-2 rounded-xl font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Mes:</label>
                    <select value={formData.mes || MESES_ANIO[0]} onChange={(e) => handleCampoChange('mes', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold uppercase">
                      {MESES_ANIO.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Año:</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="AAAA"
                      value={formData.ano || ''} 
                      onChange={handleAnoChange} 
                      className="w-full border p-2 rounded-xl font-mono font-bold" 
                    />
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </ModalBase>

      {/* MODAL NOTIFICACIÓN */}
      <ConfirmModal
        isOpen={modalNotif.isOpen}
        onClose={() => setModalNotif({ ...modalNotif, isOpen: false })}
        titulo={modalNotif.titulo}
        mensaje={modalNotif.mensaje}
        tipo={modalNotif.tipo}
      />

      {/* MODAL CONFIRMACIÓN ELIMINAR */}
      <ConfirmModal
        isOpen={modalConfirmDelete}
        onClose={() => setModalConfirmDelete(false)}
        onConfirm={ejecutarEliminacion}
        titulo="¿Eliminar Ficha F-1?"
        mensaje="Esta acción eliminará el registro de la Ficha F-1 de la base de datos de manera permanente."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};