import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { GraduationCap, MapPin, Plus, Trash2, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, MODALIDADES_GRADUACION_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaC24toAnoService } from '../../../../services/fichas/4año/fichaC24toAnoService';

export const FichaC2_4toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado, listaDocentes = [] }) => {
  const codigoFicha = "4_C2";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const categoriasSocializacion = [
    {
      key: 'nota_necesidad_problema',
      titulo: '1. PRESENTACIÓN DE LA NECESIDAD, PROBLEMA Y/O POTENCIALIDAD IDENTIFICADA',
      texto: 'Claridad en la exposición de ideas.\nLa necesidad, problemática y/o potencialidad es relevante y pertinente al ámbito educativo.\nArgumenta con solidez sus ideas con base en el diálogo sostenido con los actores y la reflexión crítica en ECTG.'
    },
    {
      key: 'nota_propuesta_educativa',
      titulo: '2. SUSTENTACIÓN DE LA PROPUESTA EDUCATIVA',
      texto: 'Argumenta de manera adecuada los principales componentes de la propuesta educativa.\nLa propuesta educativa es coherente con la necesidad, problema y/o potencialidad identificada.\nArgumenta la propuesta con base al diálogo con los actores y autores y la reflexión crítica en ECTG.'
    },
    {
      key: 'nota_controversia_argumentacion',
      titulo: '3. CONTROVERSIA Y ARGUMENTACIÓN',
      texto: 'Sustenta con propiedad y coherencia los diferentes acápites del trabajo presentado.\nMuestra seguridad y solvencia en la presentación y sustento de la propuesta educativa.'
    }
  ];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  const initialFormState = {
    integrante_ectg: '',
    docente_tutor_id: '',
    modalidad_graduacion: MODALIDADES_GRADUACION_ESFM[0],
    titulo_diseno_metodologico: '',
    integrantes: [],
    puntaje_final: 0,
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
          const res = await fichaC24toAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();

          const primerIntegranteDefault = [{
            nombre_apellido: nombreCompleto,
            ci: estudianteSeleccionado.ci || '',
            calificaciones: {},
            promedio_numeral: 0,
            promedio_literal: 'CERO CON 00/100',
            resultado: 'Aprobado'
          }];

          if (res.existe && res.datos) {
            const d = res.datos;
            const updatedIntegrantes = Array.isArray(d.integrantes) && d.integrantes.length > 0 
              ? d.integrantes 
              : primerIntegranteDefault;

            const integrantesRecalculados = updatedIntegrantes.map(integ => recalcularIntegrante(integ));
            const { pFinal, pLiteral } = calcularPuntajeFinalGeneral(integrantesRecalculados);

            const updatedState = {
              ...initialFormState,
              ...d,
              integrante_ectg: nombreCompleto,
              docente_tutor_id: d.docente_tutor_id || '',
              modalidad_graduacion: d.modalidad_graduacion || MODALIDADES_GRADUACION_ESFM[0],
              titulo_diseno_metodologico: d.titulo_diseno_metodologico || '',
              integrantes: integrantesRecalculados,
              puntaje_final: pFinal,
              promedio_literal: pLiteral,
              lugar_ciudad: d.lugar_ciudad || 'El Alto',
              departamento: d.departamento || DEPARTAMENTOS_BOLIVIA[0],
              dia: d.dia || String(new Date().getDate()),
              mes: d.mes || MESES_ANIO[new Date().getMonth()],
              ano: String(d.ano || '2026').slice(0, 4)
            };

            setFormData(updatedState);
            if (setFichaData) setFichaData(updatedState);
          } else {
            const integrantesDefaultRecalc = primerIntegranteDefault.map(integ => recalcularIntegrante(integ));
            const { pFinal, pLiteral } = calcularPuntajeFinalGeneral(integrantesDefaultRecalc);

            const defaultState = {
              ...initialFormState,
              integrante_ectg: nombreCompleto,
              integrantes: integrantesDefaultRecalc,
              puntaje_final: pFinal,
              promedio_literal: pLiteral
            };
            setFormData(defaultState);
            if (setFichaData) setFichaData(defaultState);
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
    const keys = ['nota_necesidad_problema', 'nota_propuesta_educativa', 'nota_controversia_argumentacion'];
    const notas = keys.map(k => parseFloat(integranteObj.calificaciones?.[k])).filter(n => !isNaN(n));
    const prom = notas.length > 0 ? parseFloat((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)) : 0;

    return {
      ...integranteObj,
      promedio_numeral: prom,
      promedio_literal: convertirNumeroALiteral(prom),
      resultado: prom >= 51 ? 'Aprobado' : 'Reprobado'
    };
  };

  const calcularPuntajeFinalGeneral = (listaIntegrantes = []) => {
    const promedios = listaIntegrantes.map(i => parseFloat(i.promedio_numeral)).filter(n => !isNaN(n));
    const pFinal = promedios.length > 0 
      ? parseFloat((promedios.reduce((a, b) => a + b, 0) / promedios.length).toFixed(2)) 
      : 0;

    return {
      pFinal,
      pLiteral: convertirNumeroALiteral(pFinal)
    };
  };

  const handleIntegranteNotaChange = (intIdx, catKey, val) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = '';
    else if (num < 0) num = 0;
    else if (num > 100) num = 100;

    const updatedIntegrantes = [...(formData.integrantes || [])];
    const itemTarget = { ...updatedIntegrantes[intIdx] };

    itemTarget.calificaciones = {
      ...(itemTarget.calificaciones || {}),
      [catKey]: num
    };

    updatedIntegrantes[intIdx] = recalcularIntegrante(itemTarget);
    const { pFinal, pLiteral } = calcularPuntajeFinalGeneral(updatedIntegrantes);

    const updated = {
      ...formData,
      integrantes: updatedIntegrantes,
      puntaje_final: pFinal,
      promedio_literal: pLiteral
    };
    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  const handleIntegranteInfoChange = (intIdx, field, val) => {
    const updatedIntegrantes = [...(formData.integrantes || [])];
    updatedIntegrantes[intIdx] = {
      ...updatedIntegrantes[intIdx],
      [field]: val
    };

    const updated = { ...formData, integrantes: updatedIntegrantes };
    setFormData(updated);
    if (setFichaData) setFichaData(updated);
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

    const { pFinal, pLiteral } = calcularPuntajeFinalGeneral(newIntegrantes);
    const updated = {
      ...formData,
      integrantes: newIntegrantes,
      puntaje_final: pFinal,
      promedio_literal: pLiteral
    };
    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  const removeIntegranteCol = (idx) => {
    if (formData.integrantes.length <= 1) return;
    const newIntegrantes = formData.integrantes.filter((_, i) => i !== idx);
    const { pFinal, pLiteral } = calcularPuntajeFinalGeneral(newIntegrantes);

    const updated = {
      ...formData,
      integrantes: newIntegrantes,
      puntaje_final: pFinal,
      promedio_literal: pLiteral
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
      const res = await fichaC24toAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
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
      const res = await fichaC24toAnoService.delete(estudianteSeleccionado.id);
      const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      const clearedData = {
        ...initialFormState,
        integrante_ectg: nombreCompleto,
        integrantes: [{
          nombre_apellido: nombreCompleto,
          ci: estudianteSeleccionado.ci || '',
          calificaciones: {},
          promedio_numeral: 0,
          promedio_literal: 'CERO CON 00/100',
          resultado: 'Aprobado'
        }],
        puntaje_final: 0,
        promedio_literal: 'CERO CON 00/100'
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
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA C-2: SOCIALIZACIÓN DEL DISEÑO METODOLÓGICO DE IMPLEMENTACIÓN DEL TRABAJO DE GRADO (4TO AÑO)"} footer={footerButtons}>
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
                  FICHA C-2 - SOCIALIZACIÓN DEL DISEÑO METODOLÓGICO
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
              <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200 text-slate-700 text-[11px] leading-relaxed">
                La valoración es individual para cada integrante del equipo comunitario de trabajo de grado.
              </div>

              {/* DATOS REFERENCIALES OFICIALES */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-[#801B28] uppercase text-[11px] flex items-center gap-1.5 border-b pb-2">
                  <GraduationCap size={15} /> DATOS REFERENCIALES
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Integrante del ECTG:</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.integrante_ectg}
                      className="w-full border p-2 rounded-xl bg-slate-50 font-extrabold text-slate-900"
                    />
                  </div>

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
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Modalidad de Graduación:</label>
                    <select
                      value={formData.modalidad_graduacion}
                      onChange={(e) => handleCampoChange('modalidad_graduacion', e.target.value)}
                      className="w-full border p-2 rounded-xl bg-white font-bold text-slate-900 focus:border-[#801B28] outline-none"
                    >
                      {MODALIDADES_GRADUACION_ESFM.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Título del Diseño Metodológico:</label>
                    <input
                      type="text"
                      value={formData.titulo_diseno_metodologico}
                      onChange={(e) => handleCampoChange('titulo_diseno_metodologico', e.target.value)}
                      className="w-full border p-2 rounded-xl font-bold focus:border-[#801B28] outline-none"
                      placeholder="Escriba el título completo..."
                    />
                  </div>
                </div>
              </div>

              {/* MATRIZ DE INTEGRANTES DE ECTG CON 3 INPUTS GLOBALES */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-extrabold text-slate-800 uppercase text-[11px]">
                    MATRIZ DE EVALUACIÓN DE SOCIALIZACIÓN (3 CRITERIOS GLOBALES - 1 A 100 PTS)
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
                          Criterios globales de evaluación en la socialización
                        </th>
                        {formData.integrantes?.map((integ, idx) => (
                          <th key={idx} className="p-2 border border-slate-200 text-center min-w-[180px] bg-amber-50/50">
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="font-black text-[#801B28] text-[10px] uppercase">Integrante {idx + 1}</span>
                                {formData.integrantes.length > 1 && (
                                  <button type="button" onClick={() => removeIntegranteCol(idx)} className="text-rose-600 hover:text-rose-800 p-0.5 cursor-pointer">
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                              <div>
                                <input
                                  type="text"
                                  placeholder="Nombres y Apellidos"
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
                              <span className="text-[9px] font-normal text-slate-500 block">(0 a 100 Puntos)</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {categoriasSocializacion.map((cat) => (
                        <tr key={cat.key} className="hover:bg-slate-50/50">
                          <td className="p-2.5 border">
                            <span className="font-black text-[#801B28] text-[10px] uppercase block mb-1">
                              {cat.titulo}
                            </span>
                            <p className="text-[10px] font-medium text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100">
                              {cat.texto}
                            </p>
                          </td>
                          {formData.integrantes?.map((integ, idx) => (
                            <td key={idx} className="p-2 border text-center align-top">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="0-100"
                                value={integ.calificaciones?.[cat.key] ?? ''}
                                onChange={(e) => handleIntegranteNotaChange(idx, cat.key, e.target.value)}
                                className="w-full border p-2 rounded-xl text-center font-mono font-bold bg-white focus:border-[#801B28] outline-none mt-2"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}

                      {/* PROMEDIO NUMERAL */}
                      <tr className="bg-rose-50/50 font-black border-t-2 border-slate-300">
                        <td className="p-2 border text-slate-900 uppercase text-[10px]">Promedio Numeral</td>
                        {formData.integrantes?.map((integ, idx) => (
                          <td key={idx} className="p-2 border text-center font-mono text-sm text-[#801B28]">
                            {integ.promedio_numeral || '0.00'} / 100 PTS
                          </td>
                        ))}
                      </tr>

                      {/* PROMEDIO LITERAL */}
                      <tr className="bg-rose-50/30 font-bold">
                        <td className="p-2 border text-slate-900 uppercase text-[10px]">Literal</td>
                        {formData.integrantes?.map((integ, idx) => (
                          <td key={idx} className="p-2 border text-center font-extrabold text-[10px] text-slate-900 uppercase">
                            {integ.promedio_literal}
                          </td>
                        ))}
                      </tr>

                      {/* RESULTADO */}
                      <tr className="bg-slate-50 font-extrabold">
                        <td className="p-2 border text-slate-900 uppercase text-[10px]">Resultado (Aprobado/reprobado)</td>
                        {formData.integrantes?.map((integ, idx) => (
                          <td key={idx} className={`p-2 border text-center text-xs uppercase font-black ${integ.resultado === 'Aprobado' ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {integ.resultado}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* BANNER DE PUNTAJE FINAL GENERAL */}
                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Puntaje Final Numeral:</label>
                    <div className="font-mono font-black text-2xl text-[#801B28]">
                      {formData.puntaje_final || '0.00'} / 100 PTS
                    </div>
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Literal:</label>
                    <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">
                      {formData.promedio_literal}
                    </div>
                  </div>
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
        titulo="¿Eliminar Ficha C-2?"
        mensaje="Esta acción borrará de forma permanente el registro de la Ficha C-2."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};