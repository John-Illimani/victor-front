import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { GraduationCap, MapPin, Plus, Trash2, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaB24toAnoService } from '../../../../services/fichas/4año/fichaB24toAnoService';

export const FichaB2_4toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "4_B2";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const criteriosEvaluacion = [
    {
      categoria: 'PLANIFICACIÓN – CONCRECIÓN DEL PDC',
      items: [
        'Existe coherencia y relación del objetivo con el proceso pedagógico y los criterios de evaluación.',
        'Los elementos curriculares del PDC se relacionan con el desarrollo de la clase.'
      ]
    },
    {
      categoria: 'DESARROLLO DE CONTENIDOS',
      items: [
        'Recupera conocimientos y experiencias de las y los estudiantes.',
        'Dinamiza la participación activa y crítica.',
        'Vincula nuevos conocimientos con hechos de la realidad y la vida cotidiana.',
        'Muestra conocimiento profundo de los contenidos de su especialidad.',
        '-Demuestra dominio de aula.'
      ]
    },
    {
      categoria: 'ESTRATEGIAS METODOLÓGICAS',
      items: [
        'Promueve el trabajo en equipo y el diálogo.',
        'Fomenta actividades para aprender haciendo.',
        'Utiliza materiales educativos y herramientas tecnológicas pertinentes.',
        'Promueve el aprendizaje centrado en el estudiante como protagonista activo.'
      ]
    },
    {
      categoria: 'EVALUACIÓN',
      items: [
        'Realiza la evaluación según el objetivo planificado en el PDC.',
        '-Utiliza instrumento(s) de evaluación.'
      ]
    }
  ];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  const initialFormState = {
    apellidos_nombres: '',
    columnas_pdc: ['PDC 1', 'PDC 2', 'PDC 3', 'PDC 4', 'PDC 5'],
    calificaciones: {},
    promedios_pdc: {},
    promedio_numeral: 0,
    promedio_literal: 'CERO CON 00/100',
    observaciones: '',
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
          const res = await fichaB24toAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();

          if (res.existe && res.datos) {
            const d = res.datos;
            const updatedState = {
              ...initialFormState,
              ...d,
              apellidos_nombres: nombreCompleto,
              columnas_pdc: d.columnas_pdc || initialFormState.columnas_pdc,
              calificaciones: d.calificaciones || {},
              promedios_pdc: d.promedios_pdc || {},
              lugar_ciudad: d.lugar_ciudad || 'El Alto',
              departamento: d.departamento || DEPARTAMENTOS_BOLIVIA[0],
              dia: d.dia || String(new Date().getDate()),
              mes: d.mes || MESES_ANIO[new Date().getMonth()],
              ano: String(d.ano || '2026').slice(0, 4)
            };

            const calculos = recalcularNotas(updatedState.columnas_pdc, updatedState.calificaciones);
            setFormData({ ...updatedState, ...calculos });
            if (setFichaData) setFichaData({ ...updatedState, ...calculos });
          } else {
            setFormData(prev => ({
              ...prev,
              ...initialFormState,
              apellidos_nombres: nombreCompleto
            }));
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

  const recalcularNotas = (cols, califs) => {
    const proms = {};
    const valoresPdc = [];

    cols.forEach(pdc => {
      const notasDelPdc = [];
      criteriosEvaluacion.forEach((cat, cIdx) => {
        cat.items.forEach((_, iIdx) => {
          const key = `cat_${cIdx}_item_${iIdx}`;
          const val = parseFloat(califs[pdc]?.[key]);
          if (!isNaN(val)) {
            notasDelPdc.push(val);
          }
        });
      });

      if (notasDelPdc.length > 0) {
        const promPdc = parseFloat((notasDelPdc.reduce((a, b) => a + b, 0) / notasDelPdc.length).toFixed(2));
        proms[pdc] = promPdc;
        valoresPdc.push(promPdc);
      } else {
        proms[pdc] = 0;
      }
    });

    const promGeneral = valoresPdc.length > 0 
      ? parseFloat((valoresPdc.reduce((a, b) => a + b, 0) / valoresPdc.length).toFixed(2)) 
      : 0;

    return {
      promedios_pdc: proms,
      promedio_numeral: promGeneral,
      promedio_final: promGeneral,
      promedio_literal: convertirNumeroALiteral(promGeneral)
    };
  };

  const handleNotaItemChange = (pdc, catIdx, itemIdx, value) => {
    let num = parseFloat(value);
    if (isNaN(num)) num = '';
    else if (num < 0) num = 0;
    else if (num > 100) num = 100;

    const itemKey = `cat_${catIdx}_item_${itemIdx}`;
    const newCalifs = {
      ...(formData.calificaciones || {}),
      [pdc]: {
        ...(formData.calificaciones?.[pdc] || {}),
        [itemKey]: num
      }
    };

    const calculos = recalcularNotas(formData.columnas_pdc, newCalifs);

    const updated = {
      ...formData,
      calificaciones: newCalifs,
      ...calculos
    };

    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  const addPdcColumna = () => {
    const nextNum = formData.columnas_pdc.length + 1;
    const newCols = [...formData.columnas_pdc, `PDC ${nextNum}`];
    const calculos = recalcularNotas(newCols, formData.calificaciones || {});

    const updated = {
      ...formData,
      columnas_pdc: newCols,
      ...calculos
    };
    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  const removePdcColumna = (index) => {
    if (formData.columnas_pdc.length <= 1) return;
    const newCols = formData.columnas_pdc.filter((_, i) => i !== index);
    const calculos = recalcularNotas(newCols, formData.calificaciones || {});

    const updated = {
      ...formData,
      columnas_pdc: newCols,
      ...calculos
    };
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
      const res = await fichaB24toAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
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
      const res = await fichaB24toAnoService.delete(estudianteSeleccionado.id);
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
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-2: CONCRECIÓN CURRICULAR - DESARROLLO DEL PDC"} footer={footerButtons}>
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
                  FICHA B-2 - CONCRECIÓN CURRICULAR (EVALUACIÓN POR PDC)
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

              {/* DATOS REFERENCIALES SOLO NOMBRE */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2">
                <span className="font-extrabold text-amber-900 uppercase text-[11px] flex items-center gap-1.5">
                  <GraduationCap size={15} /> Estudiante:
                </span>
                <input
                  type="text"
                  readOnly
                  value={formData.apellidos_nombres}
                  className="w-full border border-amber-200 p-2 rounded-xl bg-white font-extrabold text-slate-900"
                />
              </div>

              {/* MATRIZ COMPLETA DE CUALIFICACIÓN CON AGREGADO DE COLUMNAS */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-extrabold text-slate-800 uppercase text-[11px]">
                    MATRIZ DE VALORACIÓN POR PDC
                  </span>
                  <button
                    type="button"
                    onClick={addPdcColumna}
                    className="px-3 py-1.5 bg-[#801B28] text-white font-bold rounded-xl text-[10px] flex items-center gap-1 shadow-sm hover:bg-[#a32334] transition-all cursor-pointer"
                  >
                    <Plus size={13} /> Agregar Columna PDC
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left border border-slate-200">
                    <thead>
                      <tr className="bg-amber-500 text-white font-bold text-center">
                        <th className="p-3 border border-amber-600 w-2/5 text-left uppercase text-[10px]">
                          Criterios de Evaluación
                        </th>
                        {formData.columnas_pdc?.map((pdc, cIdx) => (
                          <th key={pdc} className="p-2 border border-amber-600 min-w-[90px] text-center">
                            <div className="flex flex-col items-center justify-between gap-1">
                              <span className="font-black text-xs">{pdc}</span>
                              <span className="text-[9px] font-normal opacity-90">(De 0 a 100)</span>
                              {formData.columnas_pdc.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removePdcColumna(cIdx)}
                                  className="text-rose-100 hover:text-white p-0.5 cursor-pointer"
                                  title="Eliminar esta columna"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {criteriosEvaluacion.map((cat, catIdx) => (
                        <React.Fragment key={cat.categoria}>
                          {/* TITULO DE CATEGORIA */}
                          <tr className="bg-slate-100">
                            <td colSpan={formData.columnas_pdc.length + 1} className="p-2 font-black text-slate-800 uppercase text-[10px] border">
                              {cat.categoria}
                            </td>
                          </tr>
                          {/* FILAS DE CRITERIOS */}
                          {cat.items.map((itemText, itemIdx) => (
                            <tr key={itemIdx} className="hover:bg-slate-50/80">
                              <td className="p-2 border font-medium text-slate-700 leading-snug">
                                {itemText}
                              </td>
                              {formData.columnas_pdc?.map((pdc) => (
                                <td key={pdc} className="p-1.5 border text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="0-100"
                                    value={formData.calificaciones?.[pdc]?.[`cat_${catIdx}_item_${itemIdx}`] ?? ''}
                                    onChange={(e) => handleNotaItemChange(pdc, catIdx, itemIdx, e.target.value)}
                                    className="w-full border p-1.5  text-center font-mono font-bold  border-none"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}

                      {/* FILA DE PROMEDIO INDIVIDUAL POR PDC */}
                      <tr className="bg-amber-50/80 font-black border-t-2 border-slate-300">
                        <td className="p-2 border text-slate-900 uppercase">
                          Promedio (Número entero) De cada PDC
                        </td>
                        {formData.columnas_pdc?.map((pdc) => (
                          <td key={pdc} className="p-2 border text-center font-mono text-sm text-[#801B28]">
                            {formData.promedios_pdc?.[pdc] || '0.00'}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* PUNTAJE FINAL GENERAL */}
                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Puntaje Final Numeral:</label>
                    <div className="font-mono font-black text-2xl text-[#801B28]">{formData.promedio_numeral || '0.00'} / 100 PTS</div>
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
                    value={formData.observaciones}
                    onChange={(e) => handleCampoChange('observaciones', e.target.value)}
                    className="w-full border p-2.5 rounded-xl font-medium text-slate-800 text-xs focus:border-[#801B28] outline-none"
                    placeholder="Escriba aquí sus observaciones o sugerencias..."
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
        titulo="¿Eliminar Ficha B-2?"
        mensaje="Esta acción borrará de forma permanente el registro de la Ficha B-2."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};