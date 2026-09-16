import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { GraduationCap, MapPin, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaB25toAnoService } from '../../../../services/fichas/5año/fichaB25toAnoService';

export const FichaB2_5toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "5_B2";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const pdcs = Array.from({ length: 9 }, (_, i) => i + 1);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  const initialFormState = {
    apellidos_nombres: '',
    pdc_data: {},
    promedio_numeral: 0,
    promedio_literal: 'CERO CON 00/100',
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    ano: '2026'
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
          const res = await fichaB25toAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();

          if (res.existe && res.datos) {
            const d = res.datos;
            const updatedState = {
              ...initialFormState,
              ...d,
              apellidos_nombres: nombreCompleto,
              pdc_data: d.pdc_data || {},
              lugar_ciudad: d.lugar_ciudad || 'El Alto',
              departamento: d.departamento || DEPARTAMENTOS_BOLIVIA[0],
              dia: d.dia || String(new Date().getDate()),
              mes: d.mes || MESES_ANIO[new Date().getMonth()],
              ano: String(d.ano || '2026').slice(0, 4)
            };

            recalcularPromediosGenerales(updatedState.pdc_data, updatedState);
          } else {
            const defaultState = {
              ...initialFormState,
              apellidos_nombres: nombreCompleto
            };
            setFormData(defaultState);
            if (setFichaData) setFichaData(defaultState);
          }
        } catch (error) {
          mostrarNotificacion("Error", error.message || "No se pudo consultar la Ficha B-2.", "error");
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

  const recalcularPromediosGenerales = (newPdcsObj, baseForm = formData) => {
    const promediosTodos = pdcs
      .map(p => newPdcsObj[p]?.promedio_pdc)
      .filter(p => p !== undefined && p > 0);

    const promGeneral = promediosTodos.length > 0 
      ? parseFloat((promediosTodos.reduce((a, b) => a + b, 0) / promediosTodos.length).toFixed(2)) 
      : 0;

    const updated = {
      ...baseForm,
      pdc_data: newPdcsObj,
      promedio_numeral: promGeneral,
      promedio_final: promGeneral,
      promedio_literal: convertirNumeroALiteral(promGeneral)
    };

    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  const handlePdcValChange = (numPdc, field, val) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = '';
    else if (num < 0) num = 0;
    else if (num > 100) num = 100;

    const newPdcs = {
      ...(formData.pdc_data || {}),
      [numPdc]: {
        ...(formData.pdc_data?.[numPdc] || {}),
        [field]: num
      }
    };

    const target = newPdcs[numPdc];
    const valsPdc = [target.elementos_curriculares, target.propuesta_educativa, target.concrecion_curricular]
      .map(v => parseFloat(v))
      .filter(n => !isNaN(n));

    target.promedio_pdc = valsPdc.length > 0 ? parseFloat((valsPdc.reduce((a, b) => a + b, 0) / valsPdc.length).toFixed(2)) : 0;

    recalcularPromediosGenerales(newPdcs);
  };

  const handlePdcTextChange = (numPdc, field, val) => {
    const newPdcs = {
      ...(formData.pdc_data || {}),
      [numPdc]: {
        ...(formData.pdc_data?.[numPdc] || {}),
        [field]: val
      }
    };
    const updated = { ...formData, pdc_data: newPdcs };
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
      const res = await fichaB25toAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "Ficha B-2 guardada correctamente.", "success");
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
      const res = await fichaB25toAnoService.delete(estudianteSeleccionado.id);
      const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      const clearedData = {
        ...initialFormState,
        apellidos_nombres: nombreCompleto
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "La Ficha B-2 fue eliminada con éxito.", "success");
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
        {saving ? "Guardando..." : "Guardar Ficha"}
      </button>
    </div>
  );

  return (
    <>
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-2: CONCRECIÓN CURRICULAR - APLICACIÓN DEL PDC (5TO AÑO)"} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando Ficha B-2...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <span className="font-extrabold text-[#801B28] uppercase text-xs">
                  FICHA B-2 - CONCRECIÓN CURRICULAR (PDC 1 A 9)
                </span>

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

              {/* AVISO */}
              <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200 text-slate-700 text-[11px]">
                La/el docente guía de UE/CEA/CEE evalúa el desarrollo del PDC. En caso de que no contemple de forma explícita la propuesta educativa, el acápite no debe ser evaluado.
              </div>

              {/* MATRIZ PDC 1 AL PDC 9 */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
                <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
                  EVALUACIÓN DE PDC DE CONCRECIÓN CURRICULAR (PDC 1 A PDC 9)
                </span>

                <div className="space-y-4">
                  {pdcs.map((num) => (
                    <div key={num} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center border-b pb-1">
                        <span className="font-black text-[#801B28] text-[12px] uppercase">
                          PDC {num}
                        </span>
                        <span className="font-mono font-bold text-slate-700 text-[11px]">
                          Promedio PDC {num}: <strong className="text-[#801B28]">{formData.pdc_data?.[num]?.promedio_pdc || '0.00'} Pts</strong>
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                          <span className="sm:col-span-4 font-bold text-slate-800 text-[10px]">
                            ELEMENTOS CURRICULARES: Planteamiento y relación del Objetivo con las Orientaciones Metodológicas y los Criterios de Evaluación.
                          </span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={formData.pdc_data?.[num]?.elementos_curriculares ?? ''}
                            onChange={(e) => handlePdcValChange(num, 'elementos_curriculares', e.target.value)}
                            className="border p-1.5 rounded-lg text-center font-bold bg-white outline-none focus:border-[#801B28]"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                          <span className="sm:col-span-4 font-bold text-slate-800 text-[10px]">
                            PROPUESTA EDUCATIVA: Orientación metodológica del desarrollo y fortalecimiento de capacidades específicas, coherentes con el área.
                          </span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={formData.pdc_data?.[num]?.propuesta_educativa ?? ''}
                            onChange={(e) => handlePdcValChange(num, 'propuesta_educativa', e.target.value)}
                            className="border p-1.5 rounded-lg text-center font-bold bg-white outline-none focus:border-[#801B28]"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                          <span className="sm:col-span-4 font-bold text-slate-800 text-[10px]">
                            CONCRECIÓN CURRICULAR: Dominio de la especialidad, estrategias participativas, manejo de aula y evaluación.
                          </span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={formData.pdc_data?.[num]?.concrecion_curricular ?? ''}
                            onChange={(e) => handlePdcValChange(num, 'concrecion_curricular', e.target.value)}
                            className="border p-1.5 rounded-lg text-center font-bold bg-white outline-none focus:border-[#801B28]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t">
                        <input
                          type="text"
                          placeholder="Tiempo de implementación del PDC..."
                          value={formData.pdc_data?.[num]?.tiempo_implementacion || ''}
                          onChange={(e) => handlePdcTextChange(num, 'tiempo_implementacion', e.target.value)}
                          className="border p-1.5 rounded-lg text-[10px] bg-white outline-none focus:border-[#801B28]"
                        />
                        <input
                          type="text"
                          placeholder="Observaciones y/o sugerencias..."
                          value={formData.pdc_data?.[num]?.observaciones || ''}
                          onChange={(e) => handlePdcTextChange(num, 'observaciones', e.target.value)}
                          className="border p-1.5 rounded-lg text-[10px] bg-white outline-none focus:border-[#801B28]"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">PROMEDIO FINAL PDC:</label>
                    <div className="font-mono font-black text-2xl text-[#801B28]">{formData.promedio_numeral || '0.00'} / 100 PTS</div>
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">LITERAL:</label>
                    <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">{formData.promedio_literal}</div>
                  </div>
                </div>
              </div>

              {/* LUGAR Y FECHA DE EMISIÓN */}
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
                      {MESES_ANIO.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
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
        titulo="¿Eliminar Ficha B-2?"
        mensaje="Esta acción borrará de forma permanente el registro de la Ficha B-2 de 5to Año."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};