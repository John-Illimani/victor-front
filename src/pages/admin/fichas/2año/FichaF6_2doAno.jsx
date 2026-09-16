import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { GraduationCap, UserCheck, MapPin, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaF6_2doAnoService } from '../../../../services/fichas/2año/fichaF6_2doAnoService';

export const FichaF6_2doAno = ({ isOpen, onClose, fichaData, setFichaData, listaDocentes = [], estudianteSeleccionado }) => {
  const codigoFicha = "2_F6";
  const config = CONFIGURACION_FICHAS[codigoFicha];
  const criterios = config?.criteriosQualitativos || [];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  // Función directa para formatear cualquier valor verificando si es entero o decimal
  const formatInputValue = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return num % 1 === 0 ? String(Math.round(num)) : String(num);
  };

  const initialFormState = {
    apellidos_nombres: '',
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    ano_formacion: '2do Año de Formación',
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    ano: '2026',
    f6_val_cualitativa_1: '', f6_criterio_1: '',
    f6_val_cualitativa_2: '', f6_criterio_2: '',
    f6_val_cualitativa_3: '', f6_criterio_3: '',
    f6_val_cualitativa_4: '', f6_criterio_4: '',
    f6_val_cualitativa_5: '', f6_criterio_5: '',
    promedio_numeral: '0',
    promedio_literal: 'CERO CON 00/100',
    observaciones: '',
    docente_acompanante_id: ''
  };

  const [formData, setFormData] = useState({
    ...initialFormState,
    ...fichaData
  });

  useEffect(() => {
    const fetchFicha = async () => {
      if (isOpen && estudianteSeleccionado?.id) {
        setLoading(true);
        try {
          const res = await fichaF6_2doAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();

          if (res.existe && res.datos) {
            const d = res.datos;
            const prom = parseFloat(d.promedio_numeral || 0);

            const notasMapeadas = {};
            criterios.forEach((c, idx) => {
              const cualiBD = d[`f6_val_cualitativa_${idx + 1}`] ?? d[`val_cualitativa_${c.key}`] ?? '';
              const valorBD = d[`f6_criterio_${idx + 1}`] ?? d[c.key];

              notasMapeadas[`f6_val_cualitativa_${idx + 1}`] = cualiBD;
              notasMapeadas[c.key] = valorBD !== undefined && valorBD !== null ? String(valorBD) : '';
              notasMapeadas[`f6_criterio_${idx + 1}`] = valorBD !== undefined && valorBD !== null ? String(valorBD) : '';
            });

            setFormData(prev => ({
              ...prev,
              ...d,
              ...notasMapeadas,
              apellidos_nombres: nombreCompleto,
              promedio_numeral: formatInputValue(prom),
              promedio_literal: d.promedio_literal || convertirNumeroALiteral(prom),
              observaciones: d.observaciones || '',
              docente_acompanante_id: d.docente_acompanante_id || '',
              lugar_ciudad: d.lugar_ciudad || 'El Alto',
              departamento: d.departamento || DEPARTAMENTOS_BOLIVIA[0],
              dia: d.dia || String(new Date().getDate()),
              mes: d.mes || MESES_ANIO[new Date().getMonth()],
              ano: String(d.ano || '2026').slice(0, 4)
            }));
            if (setFichaData) setFichaData(d);
          } else {
            const defaultState = {
              ...initialFormState,
              apellidos_nombres: nombreCompleto
            };
            setFormData(prev => ({ ...prev, ...defaultState }));
          }
        } catch (error) {
          mostrarNotificacion("Error", error.message || "No se pudo consultar la Ficha F-6.", "error");
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
        ...fichaData
      }));
    }
  }, [estudianteSeleccionado, fichaData]);

  const mostrarNotificacion = (titulo, mensaje, tipo = 'info') => {
    setModalNotif({ isOpen: true, titulo, mensaje, tipo });
  };

  const handleNotaChange = (key, value, idx) => {
    let rawVal = value;

    if (rawVal !== '') {
      const num = parseFloat(rawVal);
      if (!isNaN(num)) {
        if (num > 100) rawVal = '100';
        else if (num < 0) rawVal = '0';
      }
    }

    const newForm = {
      ...formData,
      [key]: rawVal,
      [`f6_criterio_${idx + 1}`]: rawVal
    };

    const notas = criterios.map((c, i) => {
      const valStr = newForm[c.key] ?? newForm[`f6_criterio_${i + 1}`];
      const v = parseFloat(valStr);
      return isNaN(v) ? null : v;
    }).filter(n => n !== null);

    const prom = notas.length > 0 ? parseFloat((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)) : 0;

    newForm.promedio_numeral = formatInputValue(prom);
    newForm.promedio_final = formatInputValue(prom);
    newForm.promedio_literal = convertirNumeroALiteral(prom);

    setFormData(newForm);
    if (setFichaData) setFichaData(newForm);
  };

  const handleCualiChange = (idx, val) => {
    const updated = { ...formData, [`f6_val_cualitativa_${idx + 1}`]: val };
    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  const handleCampoChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  const handleSave = async () => {
    if (!estudianteSeleccionado?.id) {
      mostrarNotificacion("Estudiante No Seleccionado", "Debe seleccionar un estudiante antes de guardar.", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fichaF6_2doAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "La Ficha F-6 fue registrada correctamente.", "success");
    } catch (error) {
      mostrarNotificacion("Error al Guardar", error.message || "No se pudieron guardar los datos.", "error");
    } finally {
      setSaving(false);
    }
  };

  const ejecutarEliminacion = async () => {
    if (!estudianteSeleccionado?.id) return;

    setDeleting(true);
    try {
      const res = await fichaF6_2doAnoService.delete(estudianteSeleccionado.id);
      const clearedData = {
        ...initialFormState,
        apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim()
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "Ficha F-6 eliminada con éxito.", "success");
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
        {saving ? "Guardando..." : "Guardar Ficha F-6"}
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
              <span className="font-bold text-slate-600">Cargando información de la ficha...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <h4 className="font-extrabold text-[#801B28] uppercase text-sm">
                  {config?.titulo || "FICHA F-6: VALORACIÓN DE PRODUCCIÓN DE CONOCIMIENTOS"}
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
                  <GraduationCap size={15} /> DATOS REFERENCIALES
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
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Año de Formación:</label>
                    <input type="text" value={formData.ano_formacion} onChange={(e) => handleCampoChange('ano_formacion', e.target.value)} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold text-slate-800" />
                  </div>
                </div>
              </div>

              {/* CRITERIOS DE EVALUACIÓN CON VALORACIÓN CUALITATIVA Y NOTA */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
                  CRITERIOS DE VALORACIÓN DE PRODUCCIÓN DE CONOCIMIENTOS F-6
                </span>
                
                <div className="space-y-3">
                  {criterios.map((crit, idx) => {
                    const cualiKey = `f6_val_cualitativa_${idx + 1}`;

                    return (
                      <div key={crit.key} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                        <span className="font-bold text-[#801B28] text-xs block">
                          Criterio {idx + 1}: {crit.label}
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                          <div className="sm:col-span-3">
                            <label className="block font-bold text-slate-600 text-[9px] uppercase mb-0.5">
                              Valoración Cualitativa:
                            </label>
                            <input
                              type="text"
                              value={formData[cualiKey] || ''}
                              onChange={(e) => handleCualiChange(idx, e.target.value)}
                              className="w-full border border-slate-300 p-1.5 rounded-lg bg-white font-medium text-slate-800 text-xs focus:border-[#801B28] outline-none"
                              placeholder="Describa la valoración cualitativa..."
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-600 text-[9px] uppercase mb-0.5 text-center">
                              Nota (0-100):
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              placeholder="0-100"
                              value={formatInputValue(formData[crit.key] ?? formData[`f6_criterio_${idx + 1}`] ?? '')}
                              onChange={(e) => handleNotaChange(crit.key, e.target.value, idx)}
                              className="w-full border border-slate-300 p-1.5 rounded-lg bg-white font-mono font-bold text-center text-slate-900 focus:border-[#801B28] outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* RESUMEN PROMEDIO FINAL */}
                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Promedio Final:</label>
                    <div className="font-mono font-black text-2xl text-[#801B28]">
                      {formatInputValue(formData.promedio_numeral) || '0'} / 100 PTS
                    </div>
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Literal:</label>
                    <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">{formData.promedio_literal}</div>
                  </div>
                </div>

                {/* OBSERVACIÓN GENERAL Y SUGERENCIAS */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <label className="block font-bold text-slate-700 text-[10px] uppercase mb-1">
                    Observaciones Generales y/o Sugerencias de la Producción:
                  </label>
                  <textarea
                    rows="3"
                    value={formData.observaciones}
                    onChange={(e) => handleCampoChange('observaciones', e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-xl font-medium text-slate-800 text-xs outline-none focus:border-[#801B28] bg-white"
                    placeholder="Escriba las observaciones o sugerencias generales finales..."
                  />
                </div>
              </div>

              {/* LUGAR Y FECHA DE EMISIÓN */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-[#801B28] uppercase text-[11px] flex items-center gap-1.5">
                  <MapPin size={14} /> LUGAR Y FECHA DE EMISIÓN
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
        titulo="¿Eliminar Ficha F-6?"
        mensaje="Esta acción eliminará la Ficha F-6 de la base de datos de manera permanente."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};