import React, { useState, useEffect } from 'react';
import { ModalBase } from './ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { GraduationCap, MapPin, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaF3Service } from '../../../../services/fichas/1año/fichaF3Service';
import { especialidadService } from '../../../../services/especialidadService';

export const FichaF3_1erAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "1_F3";
  const config = CONFIGURACION_FICHAS[codigoFicha];
  const criterios = config?.criterios || [];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [especialidadesList, setEspecialidadesList] = useState(ESPECIALIDADES_ESFM);

  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  const initialFormState = {
    apellidos_nombres: '',
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    especialidad: ESPECIALIDADES_ESFM[0] || '',
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    ano: '2026',
    promedio_numeral: '0',
    promedio_literal: 'CERO CON 00/100',
    observaciones: ''
  };

  const [formData, setFormData] = useState({
    ...initialFormState,
    ...fichaData
  });

  // Carga de especialidades desde la API
  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const res = await especialidadService.getEspecialidades();
        if (Array.isArray(res) && res.length > 0) {
          const nombres = res.map(e => e.nombre || e.nombre_especialidad || e.especialidad).filter(Boolean);
          if (nombres.length > 0) {
            setEspecialidadesList(nombres);
          }
        } else if (res?.datos && Array.isArray(res.datos)) {
          const nombres = res.datos.map(e => e.nombre || e.nombre_especialidad || e.especialidad).filter(Boolean);
          if (nombres.length > 0) {
            setEspecialidadesList(nombres);
          }
        }
      } catch (error) {
        console.warn("No se pudo cargar especialidades de la API, usando respaldo local.", error);
      }
    };

    if (isOpen) {
      fetchEspecialidades();
    }
  }, [isOpen]);

  // Función para formatear el promedio numeral: elimina .00 si es entero
  const formatPromedio = (valor) => {
    if (valor === null || valor === undefined || valor === '') return '0';
    return String(parseFloat(valor));
  };

  // Cargar Ficha F-3 desde la API
  useEffect(() => {
    const fetchFicha = async () => {
      if (isOpen && estudianteSeleccionado?.id) {
        setLoading(true);
        try {
          const res = await fichaF3Service.getByEstudiante(estudianteSeleccionado.id);
          if (res.existe && res.datos) {
            const d = res.datos;
            const prom = parseFloat(d.promedio_numeral || 0);

            setFormData(prev => ({
              ...prev,
              ...d,
              promedio_numeral: formatPromedio(prom),
              promedio_literal: d.promedio_literal || convertirNumeroALiteral(prom),
              lugar_ciudad: d.lugar_ciudad || 'El Alto',
              departamento: d.departamento || DEPARTAMENTOS_BOLIVIA[0],
              dia: d.dia || String(new Date().getDate()),
              mes: d.mes || MESES_ANIO[new Date().getMonth()],
              ano: String(d.ano || '2026').slice(0, 4),
              apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
              especialidad: d.especialidad || estudianteSeleccionado.especialidad || prev.especialidad
            }));
            if (setFichaData) setFichaData(d);
          } else {
            const defaultState = {
              ...initialFormState,
              apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
              especialidad: estudianteSeleccionado.especialidad || initialFormState.especialidad
            };
            setFormData(prev => ({ ...prev, ...defaultState }));
          }
        } catch (error) {
          mostrarNotificacion("Error", error.message || "No se pudo conectar con el servidor.", "error");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchFicha();
  }, [isOpen, estudianteSeleccionado]);

  useEffect(() => {
    if (estudianteSeleccionado) {
      setFormData(prev => ({
        ...prev,
        apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
        especialidad: estudianteSeleccionado.especialidad || prev.especialidad,
        ...fichaData
      }));
    }
  }, [estudianteSeleccionado, fichaData]);

  const mostrarNotificacion = (titulo, mensaje, tipo = 'info') => {
    setModalNotif({ isOpen: true, titulo, mensaje, tipo });
  };

  const handleNotaChange = (key, value) => {
    if (value === '') {
      const newForm = { ...formData, [key]: '' };
      recalcularPromedio(newForm);
      return;
    }

    let val = parseFloat(value);
    if (isNaN(val)) return;
    
    // Clampear nota entre 0 y 100
    val = Math.min(100, Math.max(0, val));

    const newForm = { ...formData, [key]: val };
    recalcularPromedio(newForm);
  };

  const recalcularPromedio = (newForm) => {
    const notas = criterios.map(c => parseFloat(newForm[c.key])).filter(n => !isNaN(n));
    const promRaw = notas.length > 0 ? (notas.reduce((a, b) => a + b, 0) / notas.length) : 0;
    const prom = parseFloat(promRaw.toFixed(2));

    newForm.promedio_numeral = formatPromedio(prom);
    newForm.promedio_final = formatPromedio(prom);
    newForm.promedio_literal = convertirNumeroALiteral(prom);

    setFormData(newForm);
    if (setFichaData) setFichaData(newForm);
  };

  const handleCampoChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  // Guardar Ficha F3
  const handleSave = async () => {
    if (!estudianteSeleccionado?.id) {
      mostrarNotificacion("Estudiante No Seleccionado", "Debe seleccionar un estudiante antes de guardar.", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fichaF3Service.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "La Ficha F-3 fue registrada correctamente.", "success");
    } catch (error) {
      mostrarNotificacion("Error al Guardar", error.message || "No se pudieron guardar los datos.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Eliminar y Resetear
  const ejecutarEliminacion = async () => {
    if (!estudianteSeleccionado?.id) return;

    setDeleting(true);
    try {
      const res = await fichaF3Service.delete(estudianteSeleccionado.id);
      const clearedData = {
        ...initialFormState,
        apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
        especialidad: estudianteSeleccionado.especialidad || initialFormState.especialidad
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "Ficha eliminada con éxito.", "success");
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
        {saving ? "Guardando..." : "Guardar Ficha F-3"}
      </button>
    </div>
  );

  return (
    <>
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando información...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <h4 className="font-extrabold text-[#801B28] uppercase text-sm">
                  {config?.titulo || "FICHA F-3: VALORACIÓN DE INSTRUMENTOS DE INVESTIGACIÓN"}
                </h4>

                <button
                  type="button"
                  onClick={() => setModalConfirmDelete(true)}
                  disabled={deleting || saving}
                  className="px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash size={14} />}
                  {deleting ? "Eliminando..." : "Eliminar"}
                </button>
              </div>

              {/* DATOS REFERENCIALES */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
                <span className="font-extrabold text-amber-900 uppercase text-[11px] flex items-center gap-1.5">
                  <GraduationCap size={15} /> DATOS REFERENCIALES DEL ESTUDIANTE:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Nombres y Apellidos:</label>
                    <input type="text" readOnly value={formData.apellidos_nombres} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-extrabold text-slate-900" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">ESFM/UA:</label>
                    <input type="text" value={formData.esfm_ua} onChange={(e) => handleCampoChange('esfm_ua', e.target.value)} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                    <select value={formData.especialidad} onChange={(e) => handleCampoChange('especialidad', e.target.value)} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold">
                      {especialidadesList.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* CRITERIOS Extraídos de CONFIGURACION_FICHAS */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-800 uppercase text-[11px] block">CRITERIOS DE EVALUACIÓN OFICIALES</span>
                <div className="space-y-2">
                  {criterios.map(crit => (
                    <div key={crit.key} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border">
                      <span className="sm:col-span-3 font-medium text-slate-800">{crit.label}</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
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
                    <div className="font-mono font-black text-2xl text-[#801B28]">{formData.promedio_numeral || '0'} / 100 PTS</div>
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Literal:</label>
                    <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">{formData.promedio_literal}</div>
                  </div>
                </div>

                {config?.tieneObservaciones && (
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Observaciones y/o sugerencias:</label>
                    <textarea
                      rows="3"
                      value={formData.observaciones}
                      onChange={(e) => handleCampoChange('observaciones', e.target.value)}
                      className="w-full border p-2.5 rounded-xl font-medium text-slate-800 text-xs"
                      placeholder="Observaciones de la aplicación de técnicas..."
                    />
                  </div>
                )}
              </div>

              {/* LUGAR Y FECHA */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-[#801B28] uppercase text-[11px] flex items-center gap-1.5">
                  <MapPin size={14} /> LUGAR Y FECHA
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Ciudad / Localidad:</label>
                    <input type="text" value={formData.lugar_ciudad} onChange={(e) => handleCampoChange('lugar_ciudad', e.target.value)} className="w-full border p-2 rounded-xl" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Departamento:</label>
                    <select value={formData.departamento} onChange={(e) => handleCampoChange('departamento', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold">
                      {DEPARTAMENTOS_BOLIVIA.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Día:</label>
                    <input type="text" value={formData.dia} onChange={(e) => handleCampoChange('dia', e.target.value)} className="w-full border p-2 rounded-xl font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Mes:</label>
                    <select value={formData.mes} onChange={(e) => handleCampoChange('mes', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold uppercase">
                      {MESES_ANIO.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Año:</label>
                    <input type="text" value={formData.ano} onChange={(e) => handleCampoChange('ano', e.target.value)} className="w-full border p-2 rounded-xl font-mono font-bold" />
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
        titulo="¿Eliminar Ficha F-3?"
        mensaje="Esta acción eliminará el registro de la Ficha F-3 de la base de datos de manera permanente."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};