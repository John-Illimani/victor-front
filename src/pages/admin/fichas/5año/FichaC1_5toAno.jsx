import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { MapPin, Plus, Trash2, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaC15toAnoService } from '../../../../services/fichas/5año/fichaC15toAnoService';
import { especialidadService } from '../../../../services/especialidadService';

export const FichaC1_5toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado, listaDocentes = [] }) => {
  const codigoFicha = "5_C1";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const criteriosEvaluacion = [
    { key: 'c1', label: 'Presentación del Marco contextual y nudo problemático. Coherencia, pertinencia, relevancia.' },
    { key: 'c2', label: 'Presentación de la Propuesta Educativa, coherente con una modalidad de graduación.' },
    { key: 'c3', label: 'Presenta instrumentos y procesos de investigación en la implementación de la propuesta educativa.' },
    { key: 'c4', label: 'Presenta la sistematización de la experiencia educativa, de acuerdo a orientaciones y estructura sugerida.' },
    { key: 'c5', label: 'Producción de conocimientos y aportes específicos a la reflexión de la práctica educativa en la especialidad.' },
    { key: 'c6', label: 'Cumple con formalidades de rigor académico. Redacción, sintaxis, formato, normas APA en citas y referencias bibliográficas.' }
  ];

  const MODALIDADES_INGRESO_LISTA = ["ADMISION GENERAL", "MODALIDAD B", "DEPORTISTAS DESTACADOS", "DISCAPACIDAD"];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [listaEspecialidades, setListaEspecialidades] = useState([]);
  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  const initialFormState = {
    docente_tutor_id: '',
    estudiante_nombre: '',
    integrantes_ectg: [
      { nombres: '', especialidad: '', modalidad_ingreso: 'ADMISION GENERAL' }
    ],
    departamento_pec: DEPARTAMENTOS_BOLIVIA[0],
    distrito_educativo: '',
    ue_cea_cee: '',
    subsistema: '',
    curso_area: '',
    fecha_pec_inicio: '',
    fecha_pec_fin: '',
    notas_criterios: {},
    promedio_numeral: 0,
    promedio_literal: 'CERO CON 00/100',
    sugerencias_recomendaciones: '',
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

  // Cargar lista de especialidades desde la API
  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const data = await especialidadService.getEspecialidades();
        if (Array.isArray(data)) {
          setListaEspecialidades(data);
        } else if (data?.especialidades) {
          setListaEspecialidades(data.especialidades);
        }
      } catch (error) {
        console.error("Error al cargar especialidades:", error);
      }
    };

    if (isOpen) {
      fetchEspecialidades();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchFicha = async () => {
      if (isOpen && estudianteSeleccionado?.id) {
        setLoading(true);
        try {
          const res = await fichaC15toAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreEst = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();

          if (res.existe && res.datos) {
            const d = res.datos;
            const updatedState = {
              ...initialFormState,
              ...d,
              estudiante_nombre: nombreEst,
              docente_tutor_id: d.docente_tutor_id || '',
              integrantes_ectg: (d.integrantes_ectg && d.integrantes_ectg.length > 0) 
                ? d.integrantes_ectg 
                : [{ nombres: nombreEst, especialidad: estudianteSeleccionado.especialidad || '', modalidad_ingreso: estudianteSeleccionado.modalidad_ingreso || 'ADMISION GENERAL' }],
              departamento_pec: d.departamento_pec || DEPARTAMENTOS_BOLIVIA[0],
              distrito_educativo: d.distrito_educativo || '',
              ue_cea_cee: d.ue_cea_cee || '',
              subsistema: d.subsistema || '',
              curso_area: d.curso_area || '',
              fecha_pec_inicio: d.fecha_pec_inicio ? String(d.fecha_pec_inicio).slice(0, 10) : '',
              fecha_pec_fin: d.fecha_pec_fin ? String(d.fecha_pec_fin).slice(0, 10) : '',
              notas_criterios: d.notas_criterios || {},
              sugerencias_recomendaciones: d.sugerencias_recomendaciones || '',
              lugar_ciudad: d.lugar_ciudad || 'El Alto',
              departamento: d.departamento || DEPARTAMENTOS_BOLIVIA[0],
              dia: d.dia || String(new Date().getDate()),
              mes: d.mes || MESES_ANIO[new Date().getMonth()],
              ano: String(d.ano || '2026').slice(0, 4)
            };

            recalcularPromedio(updatedState.notas_criterios, updatedState);
          } else {
            const defaultState = {
              ...initialFormState,
              estudiante_nombre: nombreEst,
              integrantes_ectg: [
                {
                  nombres: nombreEst,
                  especialidad: estudianteSeleccionado.especialidad || '',
                  modalidad_ingreso: estudianteSeleccionado.modalidad_ingreso || 'ADMISION GENERAL'
                }
              ]
            };
            setFormData(defaultState);
            if (setFichaData) setFichaData(defaultState);
          }
        } catch (error) {
          mostrarNotificacion("Error", error.message || "No se pudo consultar la Ficha C-1.", "error");
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

  const recalcularPromedio = (notasObj, baseForm = formData) => {
    const notasArr = criteriosEvaluacion.map(c => parseFloat(notasObj[c.key])).filter(n => !isNaN(n) && n > 0);
    const prom = notasArr.length > 0 ? parseFloat((notasArr.reduce((a, b) => a + b, 0) / notasArr.length).toFixed(2)) : 0;

    const updated = {
      ...baseForm,
      notas_criterios: notasObj,
      promedio_numeral: prom,
      promedio_final: prom,
      promedio_literal: convertirNumeroALiteral(prom)
    };

    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  const handleNotaChange = (critKey, val) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = '';
    else if (num < 0) num = 0;
    else if (num > 100) num = 100;

    const newNotas = { ...(formData.notas_criterios || {}), [critKey]: num };
    recalcularPromedio(newNotas);
  };

  const handleIntegranteChange = (index, field, val) => {
    const updated = [...(formData.integrantes_ectg || [])];
    updated[index][field] = val;
    const newForm = { ...formData, integrantes_ectg: updated };
    setFormData(newForm);
    if (setFichaData) setFichaData(newForm);
  };

  const addIntegrante = () => {
    if ((formData.integrantes_ectg || []).length >= 3) return;
    const updated = [
      ...formData.integrantes_ectg,
      { nombres: '', especialidad: '', modalidad_ingreso: 'ADMISION GENERAL' }
    ];
    const newForm = { ...formData, integrantes_ectg: updated };
    setFormData(newForm);
    if (setFichaData) setFichaData(newForm);
  };

  const removeIntegrante = (index) => {
    if (formData.integrantes_ectg.length <= 1) return;
    const updated = formData.integrantes_ectg.filter((_, i) => i !== index);
    const newForm = { ...formData, integrantes_ectg: updated };
    setFormData(newForm);
    if (setFichaData) setFichaData(newForm);
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
      const res = await fichaC15toAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "Ficha C-1 guardada correctamente.", "success");
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
      const res = await fichaC15toAnoService.delete(estudianteSeleccionado.id);
      const nombreEst = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      const clearedData = {
        ...initialFormState,
        estudiante_nombre: nombreEst,
        integrantes_ectg: [{ nombres: nombreEst, especialidad: estudianteSeleccionado.especialidad || '', modalidad_ingreso: estudianteSeleccionado.modalidad_ingreso || 'ADMISION GENERAL' }]
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "La Ficha C-1 fue eliminada con éxito.", "success");
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
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA C-1: EVALUACIÓN DEL DOCUMENTO DE TRABAJO DE GRADO (5TO AÑO)"} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando Ficha C-1...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <span className="font-extrabold text-[#801B28] uppercase text-xs">
                  FICHA C-1 - EVALUACIÓN TRABAJO DE GRADO
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

              {/* I. DATOS REFERENCIALES */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-[#801B28] uppercase text-[11px] block border-b pb-2">
                  I. DATOS REFERENCIALES
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

                {/* INTEGRANTES DEL ECTG */}
                <div className="pt-2 border-t space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-800 text-[10px] uppercase">Integrantes del ECTG</span>
                    {formData.integrantes_ectg.length < 3 && (
                      <button type="button" onClick={addIntegrante} className="px-2.5 py-1 bg-[#801B28] text-white font-bold rounded-lg text-[9px] flex items-center gap-1 hover:bg-rose-900 transition-colors cursor-pointer">
                        <Plus size={11} /> Agregar Integrante
                      </button>
                    )}
                  </div>

                  {/* ENCABEZADOS DE COLUMNA */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 px-2 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-600 uppercase">
                    <span className="sm:col-span-1 text-center">Nº</span>
                    <span className="sm:col-span-5">Nombres y Apellidos</span>
                    <span className="sm:col-span-3">Especialidad</span>
                    <span className="sm:col-span-2">Modalidad de Ingreso</span>
                    <span className="sm:col-span-1 text-center">Acción</span>
                  </div>

                  <div className="space-y-2">
                    {formData.integrantes_ectg?.map((est, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <span className="sm:col-span-1 font-bold text-center text-slate-600">Nº {idx + 1}</span>
                        <input
                          type="text"
                          placeholder="Nombres y Apellidos"
                          value={est.nombres}
                          onChange={(e) => handleIntegranteChange(idx, 'nombres', e.target.value)}
                          className="sm:col-span-5 border p-1.5 rounded-lg bg-white font-bold text-[10px] focus:border-[#801B28] outline-none"
                        />
                        
                        {/* SELECT DE ESPECIALIDAD VINCULADO A LA API */}
                        <select
                          value={est.especialidad}
                          onChange={(e) => handleIntegranteChange(idx, 'especialidad', e.target.value)}
                          className="sm:col-span-3 border p-1.5 rounded-lg bg-white font-bold text-[9px] focus:border-[#801B28] outline-none"
                        >
                          <option value="">-- Especialidad --</option>
                          {listaEspecialidades.map((esp) => (
                            <option key={esp.id || esp.nombre} value={esp.nombre || esp.especialidad}>
                              {esp.nombre || esp.especialidad}
                            </option>
                          ))}
                        </select>

                        <select
                          value={est.modalidad_ingreso}
                          onChange={(e) => handleIntegranteChange(idx, 'modalidad_ingreso', e.target.value)}
                          className="sm:col-span-2 border p-1.5 rounded-lg bg-white font-bold text-[9px] focus:border-[#801B28] outline-none"
                        >
                          {MODALIDADES_INGRESO_LISTA.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>

                        <div className="sm:col-span-1 text-center">
                          {formData.integrantes_ectg.length > 1 && (
                            <button type="button" onClick={() => removeIntegrante(idx)} className="text-rose-600 p-1 hover:bg-rose-50 rounded-lg cursor-pointer">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
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
              </div>

              {/* II. EVALUACIÓN DEL DOCUMENTO DE TRABAJO DE GRADO */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
                <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
                  II. EVALUACIÓN DEL DOCUMENTO DE TRABAJO DE GRADO
                </span>

                <div className="space-y-2">
                  {criteriosEvaluacion.map((crit) => (
                    <div key={crit.key} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="sm:col-span-4 font-medium text-slate-800 text-[11px]">{crit.label}</span>
                      <span className="text-center font-bold text-slate-500 text-[10px]">Máx. 100 Pts</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        value={formData.notas_criterios?.[crit.key] ?? ''}
                        onChange={(e) => handleNotaChange(crit.key, e.target.value)}
                        className="border p-2 rounded-lg text-center font-mono font-bold bg-white text-slate-900 focus:border-[#801B28] outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">PROMEDIO:</label>
                    <div className="font-mono font-black text-2xl text-[#801B28]">{formData.promedio_numeral || '0.00'} / 100 PTS</div>
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">LITERAL:</label>
                    <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">{formData.promedio_literal}</div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-1 uppercase">Sugerencias y recomendaciones:</label>
                  <textarea
                    rows="3"
                    value={formData.sugerencias_recomendaciones}
                    onChange={(e) => handleCampoChange('sugerencias_recomendaciones', e.target.value)}
                    placeholder="Escriba aquí las sugerencias y recomendaciones académicas..."
                    className="w-full border p-2.5 rounded-xl font-medium text-slate-800 text-xs focus:border-[#801B28] outline-none"
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
        titulo="¿Eliminar Ficha C-1?"
        mensaje="Esta acción borrará de forma permanente el registro de la Ficha C-1 de 5to Año."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};