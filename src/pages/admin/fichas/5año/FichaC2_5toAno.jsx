import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { MapPin, Plus, Trash2, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, MODALIDADES_GRADUACION_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaC25toAnoService } from '../../../../services/fichas/5año/fichaC25toAnoService';

export const FichaC2_5toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado, listaDocentes = [] }) => {
  const codigoFicha = "5_C2";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const criteriosSocializacion = [
    {
      categoria: 'Presentación del proceso de implementación de la propuesta educativa.',
      items: [
        { key: 'c1', label: 'Marco contextual y nudo problemático. Propuesta educativa elaborada por el ECTG, respondiendo al nudo problemático. Proceso de implementación de la propuesta educativa. Resultados alcanzados.' }
      ]
    },
    {
      categoria: 'Sustentación del Trabajo de Grado.',
      items: [
        { key: 'c2', label: '• Sustentación de la propuesta educativa y los resultados alcanzados.\n• Proceso de diálogo y reflexión realizado en el marco de la Sistematización.\n• Conocimientos construidos a partir de la sistematización realizada. Aspectos que mejoraron en la propuesta educativa inicial.' }
      ]
    },
    {
      categoria: 'Controversia y argumentación',
      items: [
        { key: 'c3', label: '• Responde con claridad y coherencia a las preguntas planteadas por la comisión de evaluación.' }
      ]
    }
  ];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  const initialFormState = {
    docente_tutor_id: '',
    estudiante_nombre: '',
    departamento_pec: DEPARTAMENTOS_BOLIVIA[0],
    distrito_educativo: '',
    ue_cea_cee: '',
    subsistema: '',
    curso_area: '',
    fecha_pec_inicio: '',
    fecha_pec_fin: '',
    modalidad_graduacion: MODALIDADES_GRADUACION_ESFM[0],
    titulo_trabajo_grado: '',
    integrantes: [
      {
        nombre_apellido: '',
        ci: '',
        calificaciones: {},
        promedio_numeral: 0,
        promedio_literal: 'CERO CON 00/100',
        resultado: 'Aprobado'
      }
    ],
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
          const res = await fichaC25toAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreEst = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();

          if (res.existe && res.datos) {
            const d = res.datos;
            const updatedIntegrantes = (d.integrantes && d.integrantes.length > 0)
              ? d.integrantes.map(integ => recalcularIntegrante(integ))
              : [{
                  nombre_apellido: nombreEst,
                  ci: estudianteSeleccionado.ci || '',
                  calificaciones: {},
                  promedio_numeral: 0,
                  promedio_literal: 'CERO CON 00/100',
                  resultado: 'Aprobado'
                }];

            const updatedState = {
              ...initialFormState,
              ...d,
              estudiante_nombre: nombreEst,
              docente_tutor_id: d.docente_tutor_id || '',
              departamento_pec: d.departamento_pec || DEPARTAMENTOS_BOLIVIA[0],
              distrito_educativo: d.distrito_educativo || '',
              ue_cea_cee: d.ue_cea_cee || '',
              subsistema: d.subsistema || '',
              curso_area: d.curso_area || '',
              fecha_pec_inicio: d.fecha_pec_inicio ? String(d.fecha_pec_inicio).slice(0, 10) : '',
              fecha_pec_fin: d.fecha_pec_fin ? String(d.fecha_pec_fin).slice(0, 10) : '',
              modalidad_graduacion: d.modalidad_graduacion || MODALIDADES_GRADUACION_ESFM[0],
              titulo_trabajo_grado: d.titulo_trabajo_grado || '',
              integrantes: updatedIntegrantes,
              lugar_ciudad: d.lugar_ciudad || 'El Alto',
              departamento: d.departamento || DEPARTAMENTOS_BOLIVIA[0],
              dia: d.dia || String(new Date().getDate()),
              mes: d.mes || MESES_ANIO[new Date().getMonth()],
              ano: String(d.ano || '2026').slice(0, 4)
            };

            recalcularPromedioGeneral(updatedIntegrantes, updatedState);
          } else {
            const defaultIntegrantes = [{
              nombre_apellido: nombreEst,
              ci: estudianteSeleccionado.ci || '',
              calificaciones: {},
              promedio_numeral: 0,
              promedio_literal: 'CERO CON 00/100',
              resultado: 'Aprobado'
            }];

            const defaultState = {
              ...initialFormState,
              estudiante_nombre: nombreEst,
              integrantes: defaultIntegrantes
            };
            
            recalcularPromedioGeneral(defaultIntegrantes, defaultState);
          }
        } catch (error) {
          mostrarNotificacion("Error", error.message || "No se pudo consultar la Ficha C-2.", "error");
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

  const recalcularIntegrante = (integranteObj) => {
    const keys = ['c1', 'c2', 'c3'];
    const notas = keys.map(k => parseFloat(integranteObj.calificaciones?.[k])).filter(n => !isNaN(n) && n > 0);
    const prom = notas.length > 0 ? parseFloat((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)) : 0;

    return {
      ...integranteObj,
      promedio_numeral: prom,
      promedio_literal: convertirNumeroALiteral(prom),
      resultado: prom >= 51 ? 'Aprobado' : 'Reprobado'
    };
  };

  const recalcularPromedioGeneral = (listIntegrantes, baseState = formData) => {
    const proms = listIntegrantes.map(i => parseFloat(i.promedio_numeral)).filter(p => !isNaN(p) && p > 0);
    const promGen = proms.length > 0 ? parseFloat((proms.reduce((a, b) => a + b, 0) / proms.length).toFixed(2)) : 0;

    const updated = {
      ...baseState,
      integrantes: listIntegrantes,
      promedio_numeral: promGen,
      promedio_final: promGen,
      promedio_literal: convertirNumeroALiteral(promGen)
    };

    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  const handleIntegranteNotaChange = (intIdx, critKey, val) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = '';
    else if (num < 0) num = 0;
    else if (num > 100) num = 100;

    const updatedIntegrantes = [...(formData.integrantes || [])];
    const itemTarget = { ...updatedIntegrantes[intIdx] };

    itemTarget.calificaciones = {
      ...(itemTarget.calificaciones || {}),
      [critKey]: num
    };

    updatedIntegrantes[intIdx] = recalcularIntegrante(itemTarget);
    recalcularPromedioGeneral(updatedIntegrantes);
  };

  const handleIntegranteInfoChange = (intIdx, field, val) => {
    const updatedIntegrantes = [...(formData.integrantes || [])];
    updatedIntegrantes[intIdx] = {
      ...updatedIntegrantes[intIdx],
      [field]: val
    };

    recalcularPromedioGeneral(updatedIntegrantes);
  };

  const addIntegranteCol = () => {
    if ((formData.integrantes || []).length >= 3) return;
    const newIntegrantes = [
      ...formData.integrantes,
      {
        nombre_apellido: '',
        ci: '',
        calificaciones: {},
        promedio_numeral: 0,
        promedio_literal: 'CERO CON 00/100',
        resultado: 'Aprobado'
      }
    ];
    recalcularPromedioGeneral(newIntegrantes);
  };

  const removeIntegranteCol = (idx) => {
    if (formData.integrantes.length <= 1) return;
    const newIntegrantes = formData.integrantes.filter((_, i) => i !== idx);
    recalcularPromedioGeneral(newIntegrantes);
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
      const res = await fichaC25toAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "Ficha C-2 guardada correctamente.", "success");
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
      const res = await fichaC25toAnoService.delete(estudianteSeleccionado.id);
      const nombreEst = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      const clearedIntegrantes = [{
        nombre_apellido: nombreEst,
        ci: estudianteSeleccionado.ci || '',
        calificaciones: {},
        promedio_numeral: 0,
        promedio_literal: 'CERO CON 00/100',
        resultado: 'Aprobado'
      }];

      const clearedData = {
        ...initialFormState,
        estudiante_nombre: nombreEst,
        integrantes: clearedIntegrantes
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "La Ficha C-2 fue eliminada con éxito.", "success");
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
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA C-2: ACTA DE SOCIALIZACIÓN DEL TRABAJO DE GRADO (5TO AÑO)"} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando Ficha C-2...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <span className="font-extrabold text-[#801B28] uppercase text-xs">
                  FICHA C-2 - ACTA DE SOCIALIZACIÓN TRABAJO DE GRADO
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

              {/* DATOS REFERENCIALES */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-[#801B28] uppercase text-[11px] block border-b pb-2">
                  DATOS REFERENCIALES
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Docente Tutor/a Acompañante:</label>
                    <select
                      value={formData.docente_tutor_id}
                      onChange={(e) => handleCampoChange('docente_tutor_id', e.target.value)}
                      className="w-full border p-2 rounded-xl bg-white font-bold text-slate-900 focus:border-[#801B28] outline-none"
                    >
                      <option value="">-- Seleccionar Docente Tutor/a --</option>
                      {listaDocentes.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nombre} {d.apellido}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Estudiante Evaluado/a:</label>
                    <input type="text" readOnly value={formData.estudiante_nombre} className="w-full border p-2 rounded-xl bg-slate-50 font-extrabold text-slate-900" />
                  </div>
                </div>

                {/* DATOS DE LA IEPC-PEC */}
                <div className="pt-2 border-t space-y-2">
                  <span className="font-extrabold text-slate-800 uppercase text-[10px] block">DATOS DE LA IEPC-PEC</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-600">Departamento:</label>
                      <select value={formData.departamento_pec} onChange={(e) => handleCampoChange('departamento_pec', e.target.value)} className="w-full border p-1.5 rounded-lg bg-white font-bold">
                        {DEPARTAMENTOS_BOLIVIA.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-600">Distrito Educativo:</label>
                      <input type="text" value={formData.distrito_educativo} onChange={(e) => handleCampoChange('distrito_educativo', e.target.value)} className="w-full border p-1.5 rounded-lg bg-white" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-600">UE/CEA/CEE:</label>
                      <input type="text" value={formData.ue_cea_cee} onChange={(e) => handleCampoChange('ue_cea_cee', e.target.value)} className="w-full border p-1.5 rounded-lg bg-white font-bold" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-600">Subsistema:</label>
                      <input type="text" value={formData.subsistema} onChange={(e) => handleCampoChange('subsistema', e.target.value)} className="w-full border p-1.5 rounded-lg bg-white" placeholder="Ej. Regular / Alternativa" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-600">Curso / Área:</label>
                      <input type="text" value={formData.curso_area} onChange={(e) => handleCampoChange('curso_area', e.target.value)} className="w-full border p-1.5 rounded-lg bg-white" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-600">Desarrollo de la PEC (Fechas):</label>
                      <div className="flex gap-1 items-center">
                        <input type="date" value={formData.fecha_pec_inicio} onChange={(e) => handleCampoChange('fecha_pec_inicio', e.target.value)} className="w-full border p-1 rounded-lg text-[10px]" />
                        <span>al</span>
                        <input type="date" value={formData.fecha_pec_fin} onChange={(e) => handleCampoChange('fecha_pec_fin', e.target.value)} className="w-full border p-1 rounded-lg text-[10px]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Modalidad de Graduación:</label>
                    <select
                      value={formData.modalidad_graduacion}
                      onChange={(e) => handleCampoChange('modalidad_graduacion', e.target.value)}
                      className="w-full border p-2 rounded-xl bg-white font-bold text-slate-900 focus:border-[#801B28] outline-none"
                    >
                      {MODALIDADES_GRADUACION_ESFM.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Título del Trabajo de Grado:</label>
                    <input
                      type="text"
                      value={formData.titulo_trabajo_grado}
                      onChange={(e) => handleCampoChange('titulo_trabajo_grado', e.target.value)}
                      className="w-full border p-2 rounded-xl font-bold focus:border-[#801B28] outline-none"
                      placeholder="Escriba el título del trabajo de grado..."
                    />
                  </div>
                </div>
              </div>

              {/* MATRIZ DE INTEGRANTES DE ECTG */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-extrabold text-slate-800 uppercase text-[11px]">
                    MATRIZ DE EVALUACIÓN DE SOCIALIZACIÓN DE TRABAJO DE GRADO
                  </span>
                  {formData.integrantes.length < 3 && (
                    <button
                      type="button"
                      onClick={addIntegranteCol}
                      className="px-3 py-1 bg-[#801B28] text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-sm hover:bg-[#a32334] transition-all cursor-pointer"
                    >
                      <Plus size={12} /> Agregar Integrante
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-200">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="p-2 border border-slate-200 text-left w-2/5 font-extrabold text-slate-800 uppercase text-[10px]">
                          CRITERIOS DE EVALUACIÓN EN LA SOCIALIZACIÓN
                        </th>
                        {formData.integrantes?.map((integ, idx) => (
                          <th key={idx} className="p-2 border border-slate-200 text-center min-w-[180px] bg-amber-50/50">
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="font-black text-[#801B28] text-[10px] uppercase">Integrante ECTG</span>
                                {formData.integrantes.length > 1 && (
                                  <button type="button" onClick={() => removeIntegranteCol(idx)} className="text-rose-600 hover:text-rose-800 p-0.5 cursor-pointer">
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                              <div>
                                <input
                                  type="text"
                                  placeholder="Nombre y Apellidos"
                                  value={integ.nombre_apellido}
                                  onChange={(e) => handleIntegranteInfoChange(idx, 'nombre_apellido', e.target.value)}
                                  className="w-full border p-1 rounded-lg text-[10px] font-bold bg-white text-slate-900 focus:border-[#801B28] outline-none"
                                />
                              </div>
                              <div>
                                <input
                                  type="text"
                                  placeholder="C.I."
                                  value={integ.ci}
                                  onChange={(e) => handleIntegranteInfoChange(idx, 'ci', e.target.value)}
                                  className="w-full border p-1 rounded-lg text-[10px] font-mono font-bold bg-white text-slate-900 focus:border-[#801B28] outline-none"
                                />
                              </div>
                              <span className="text-[9px] font-normal text-slate-500 block">Valoración de 0 a 100</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {criteriosSocializacion.map((cat) => (
                        <React.Fragment key={cat.categoria}>
                          <tr className="bg-slate-50">
                            <td colSpan={formData.integrantes.length + 1} className="p-2 border font-extrabold text-slate-900 uppercase text-[10px]">
                              {cat.categoria}
                            </td>
                          </tr>
                          {cat.items.map((item) => (
                            <tr key={item.key} className="hover:bg-slate-50/50">
                              <td className="p-2 border font-medium text-slate-700 text-[11px] whitespace-pre-line">
                                {item.label}
                              </td>
                              {formData.integrantes?.map((integ, idx) => (
                                <td key={idx} className="p-1.5 border text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="0-100"
                                    value={integ.calificaciones?.[item.key] ?? ''}
                                    onChange={(e) => handleIntegranteNotaChange(idx, item.key, e.target.value)}
                                    className="w-full border p-1.5 rounded-lg text-center font-mono font-bold bg-white text-slate-900 focus:border-[#801B28] outline-none"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}

                      {/* FILAS DE PROMEDIO INDIVIDUAL */}
                      <tr className="bg-rose-50/50 font-black border-t-2 border-slate-300">
                        <td className="p-2 border text-slate-900 uppercase text-[10px]">TOTAL INDIVIDUAL</td>
                        {formData.integrantes?.map((integ, idx) => (
                          <td key={idx} className="p-2 border text-center font-mono text-sm text-[#801B28]">
                            {integ.promedio_numeral || '0.00'} / 100 PTS
                          </td>
                        ))}
                      </tr>

                      {/* FILAS DE PROMEDIO LITERAL INDIVIDUAL */}
                      <tr className="bg-rose-50/30 font-bold">
                        <td className="p-2 border text-slate-900 uppercase text-[10px]">LITERAL INDIVIDUAL</td>
                        {formData.integrantes?.map((integ, idx) => (
                          <td key={idx} className="p-2 border text-center font-extrabold text-[10px] text-slate-900 uppercase">
                            {integ.promedio_literal}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* TARJETA DESTACADA: PROMEDIO GENERAL DEL ECTG */}
                <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 shadow-sm">
                  <div>
                    <label className="block font-extrabold text-slate-700 text-[10px] uppercase tracking-wider mb-1">
                      PROMEDIO:
                    </label>
                    <div className="font-mono font-black text-2xl text-[#801B28]">
                      {formData.promedio_numeral || '0.00'} / 100 PTS
                    </div>
                  </div>
                  <div>
                    <label className="block font-extrabold text-slate-700 text-[10px] uppercase tracking-wider mb-1">
                      LITERAL:
                    </label>
                    <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">
                      {formData.promedio_literal}
                    </div>
                  </div>
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
        titulo="¿Eliminar Ficha C-2?"
        mensaje="Esta acción borrará de forma permanente el registro de la Ficha C-2 de 5to Año."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};