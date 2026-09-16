import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { GraduationCap, MapPin, Save, Loader2, Trash, X, Plus, Trash2 } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaA13erAnoService } from '../../../../services/fichas/3año/fichaA13erAnoService';
import { especialidadService } from '../../../../services/especialidadService';

export const FichaA1_3erAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "3_A1";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [listaEspecialidades, setListaEspecialidades] = useState(ESPECIALIDADES_ESFM);
  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  const initialTecnicasDefault = [
    { tecnica: '', nota_diseno: '', nota_aplicacion: '', nota_analisis: '', promedio: 0 },
    { tecnica: '', nota_diseno: '', nota_aplicacion: '', nota_analisis: '', promedio: 0 },
    { tecnica: '', nota_diseno: '', nota_aplicacion: '', nota_analisis: '', promedio: 0 },
    { tecnica: '', nota_diseno: '', nota_aplicacion: '', nota_analisis: '', promedio: 0 }
  ];

  const initialFormState = {
    apellidos_nombres: '',
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    ano_formacion: '3er Año',
    especialidad: ESPECIALIDADES_ESFM[0],
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    ano: '2026',
    tecnicas_evaluacion: initialTecnicasDefault,
    puntaje_final: 0,
    promedio_literal: 'CERO CON 00/100',
    observaciones: ''
  };

  const [formData, setFormData] = useState({
    ...initialFormState,
    ...fichaData
  });

  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const data = await especialidadService.getEspecialidades();
        if (Array.isArray(data) && data.length > 0) {
          const nombres = data.map(item => typeof item === 'string' ? item : item.nombre).filter(Boolean);
          if (nombres.length > 0) setListaEspecialidades(nombres);
        }
      } catch (error) {
        console.warn("Usando especialidades por defecto.");
      }
    };

    if (isOpen) fetchEspecialidades();
  }, [isOpen]);

  useEffect(() => {
    const fetchFicha = async () => {
      if (isOpen && estudianteSeleccionado?.id) {
        setLoading(true);
        try {
          const res = await fichaA13erAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
          const espEstudiante = estudianteSeleccionado.especialidad || listaEspecialidades[0] || ESPECIALIDADES_ESFM[0];

          if (res.existe && res.datos) {
            const d = res.datos;
            const tecnicasCargadas = Array.isArray(d.tecnicas_evaluacion) && d.tecnicas_evaluacion.length > 0 
              ? d.tecnicas_evaluacion 
              : initialTecnicasDefault;

            const pf = parseFloat(d.puntaje_final || d.promedio_numeral || 0);

            setFormData(prev => ({
              ...prev,
              ...d,
              apellidos_nombres: nombreCompleto,
              especialidad: d.especialidad || espEstudiante,
              tecnicas_evaluacion: tecnicasCargadas,
              puntaje_final: pf,
              promedio_literal: d.promedio_literal || convertirNumeroALiteral(pf),
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
              apellidos_nombres: nombreCompleto,
              especialidad: espEstudiante
            };
            setFormData(prev => ({ ...prev, ...defaultState }));
          }
        } catch (error) {
          mostrarNotificacion("Error", error.message || "No se pudo consultar la Ficha A-1.", "error");
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

  const calcularPuntajeTotal = (tecnicas) => {
    let suma = 0;
    let contador = 0;

    tecnicas.forEach(t => {
      ['nota_diseno', 'nota_aplicacion', 'nota_analisis'].forEach(k => {
        const val = parseFloat(t[k]);
        if (!isNaN(val)) {
          suma += val;
          contador++;
        }
      });
    });

    return contador > 0 ? parseFloat((suma / contador).toFixed(2)) : 0;
  };

  const handleTecnicaChange = (idx, field, value) => {
    const list = [...formData.tecnicas_evaluacion];
    
    if (field.startsWith('nota_')) {
      let val = parseFloat(value);
      if (isNaN(val)) val = '';
      else if (val < 1) val = 1;
      else if (val > 100) val = 100;
      list[idx][field] = val;
    } else {
      list[idx][field] = value;
    }

    const n1 = parseFloat(list[idx].nota_diseno) || 0;
    const n2 = parseFloat(list[idx].nota_aplicacion) || 0;
    const n3 = parseFloat(list[idx].nota_analisis) || 0;
    const notasList = [list[idx].nota_diseno, list[idx].nota_aplicacion, list[idx].nota_analisis].filter(n => n !== '' && !isNaN(parseFloat(n)));
    list[idx].promedio = notasList.length > 0 ? parseFloat(((n1 + n2 + n3) / notasList.length).toFixed(2)) : 0;

    const pf = calcularPuntajeTotal(list);

    const updated = {
      ...formData,
      tecnicas_evaluacion: list,
      puntaje_final: pf,
      promedio_numeral: pf,
      promedio_literal: convertirNumeroALiteral(pf)
    };

    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  const addTecnicaRow = () => {
    const newTecnicas = [
      ...formData.tecnicas_evaluacion,
      { tecnica: '', nota_diseno: '', nota_aplicacion: '', nota_analisis: '', promedio: 0 }
    ];

    const updated = { ...formData, tecnicas_evaluacion: newTecnicas };
    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  const removeTecnicaRow = (idx) => {
    if (formData.tecnicas_evaluacion.length <= 1) {
      mostrarNotificacion("Atención", "Debe mantener al menos una fila en la tabla.", "warning");
      return;
    }

    const list = formData.tecnicas_evaluacion.filter((_, i) => i !== idx);
    const pf = calcularPuntajeTotal(list);

    const updated = {
      ...formData,
      tecnicas_evaluacion: list,
      puntaje_final: pf,
      promedio_numeral: pf,
      promedio_literal: convertirNumeroALiteral(pf)
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
      const res = await fichaA13erAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "La Ficha A-1 se registró correctamente.", "success");
    } catch (error) {
      mostrarNotificacion("Error al Guardar", error.message || "No se pudieron guardar las notas.", "error");
    } finally {
      setSaving(false);
    }
  };

  const ejecutarEliminacion = async () => {
    if (!estudianteSeleccionado?.id) return;

    setDeleting(true);
    try {
      const res = await fichaA13erAnoService.delete(estudianteSeleccionado.id);
      const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      const clearedData = {
        ...initialFormState,
        apellidos_nombres: nombreCompleto,
        especialidad: estudianteSeleccionado.especialidad || listaEspecialidades[0] || ESPECIALIDADES_ESFM[0]
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "La Ficha A-1 fue eliminada con éxito.", "success");
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
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA A-1: TÉCNICAS E INSTRUMENTOS DE INVESTIGACIÓN"} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando evaluación de Ficha A-1...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <h4 className="font-extrabold text-[#801B28] uppercase text-sm">
                  FICHA A-1: VALORACIÓN DE TÉCNICAS E INSTRUMENTOS DE INVESTIGACIÓN - 3ER AÑO
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
                  <GraduationCap size={15} /> DATOS REFERENCIALES DEL ESTUDIANTE
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Nombres y Apellidos:</label>
                    <input type="text" readOnly value={formData.apellidos_nombres} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-extrabold text-slate-900 outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">ESFM/UA:</label>
                    <input type="text" value={formData.esfm_ua} onChange={(e) => handleCampoChange('esfm_ua', e.target.value)} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Año de Formación:</label>
                    <input type="text" value={formData.ano_formacion} onChange={(e) => handleCampoChange('ano_formacion', e.target.value)} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                    <select value={formData.especialidad} onChange={(e) => handleCampoChange('especialidad', e.target.value)} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold">
                      {listaEspecialidades.map((esp, idx) => (
                        <option key={idx} value={esp}>{esp}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* TABLA DE EVALUACIÓN CON FORMATO EXACTO A LA IMAGEN */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-extrabold text-slate-800 uppercase text-[11px]">
                    MATRIZ DE VALORACIÓN
                  </span>
                  <button type="button" onClick={addTecnicaRow} className="flex items-center gap-1 bg-[#801B28] text-white px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-rose-900 transition-colors cursor-pointer">
                    <Plus size={14} /> Añadir Fila
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-400 text-center text-xs">
                    <thead>
                      <tr className="bg-[#9CA777] text-slate-900 font-extrabold uppercase border-b border-slate-400">
                        <th className="p-3 border border-slate-400 w-1/4">
                          TÉCNICAS E INSTRUMENTOS DE INVESTIGACIÓN
                        </th>
                        <th className="p-3 border border-slate-400 w-1/4">
                          DISEÑO Y VALIDACIÓN DE TÉCNICAS E INSTRUMENTOS DE INVESTIGACIÓN
                        </th>
                        <th className="p-3 border border-slate-400 w-1/4">
                          APLICACIÓN DE TÉCNICAS E INSTRUMENTOS DE INVESTIGACIÓN
                        </th>
                        <th className="p-3 border border-slate-400 w-1/4">
                          ORDEN, ANÁLISIS, REFLEXIÓN E INTERPRETACIÓN DE LA INFORMACIÓN
                        </th>
                        <th className="p-3 border border-slate-400 w-28">
                          PROMEDIO
                        </th>
                        <th className="p-3 border border-slate-400 w-12"></th>
                      </tr>
                      <tr className="bg-white text-slate-800 font-bold border-b border-slate-400">
                        <td className="p-2 border border-slate-400 font-extrabold">Puntaje</td>
                        <td className="p-2 border border-slate-400">1 a 100 puntos</td>
                        <td className="p-2 border border-slate-400">1 a 100 puntos</td>
                        <td className="p-2 border border-slate-400">1 a 100 puntos</td>
                        <td className="p-2 border border-slate-400"></td>
                        <td className="p-2 border border-slate-400"></td>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.tecnicas_evaluacion.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-1.5 border border-slate-400">
                            <input
                              type="text"
                              placeholder="Escriba la técnica/instrumento..."
                              value={item.tecnica || ''}
                              onChange={(e) => handleTecnicaChange(idx, 'tecnica', e.target.value)}
                              className="w-full border-none text-left p-1 rounded font-medium text-slate-900 outline-none bg-transparent"
                            />
                          </td>
                          <td className="p-1.5 border border-slate-400">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              placeholder="1-100"
                              value={item.nota_diseno ?? ''}
                              onChange={(e) => handleTecnicaChange(idx, 'nota_diseno', e.target.value)}
                              className="w-full border-none text-center p-1 rounded font-mono font-bold text-slate-900 outline-none bg-transparent"
                            />
                          </td>
                          <td className="p-1.5 border border-slate-400">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              placeholder="1-100"
                              value={item.nota_aplicacion ?? ''}
                              onChange={(e) => handleTecnicaChange(idx, 'nota_aplicacion', e.target.value)}
                              className="w-full border-none text-center p-1 rounded font-mono font-bold text-slate-900 outline-none bg-transparent"
                            />
                          </td>
                          <td className="p-1.5 border border-slate-400">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              placeholder="1-100"
                              value={item.nota_analisis ?? ''}
                              onChange={(e) => handleTecnicaChange(idx, 'nota_analisis', e.target.value)}
                              className="w-full border-none text-center p-1 rounded font-mono font-bold text-slate-900 outline-none bg-transparent"
                            />
                          </td>
                          <td className="p-2 border border-slate-400 font-mono font-black text-center text-[#801B28] bg-amber-50/20">
                            {item.promedio || '0.00'}
                          </td>
                          <td className="p-1.5 border border-slate-400 text-center">
                            {formData.tecnicas_evaluacion.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTecnicaRow(idx)}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Puntaje Final Promedio Total:</label>
                    <div className="font-mono font-black text-2xl text-[#801B28]">{formData.puntaje_final || '0.00'} / 100 PTS</div>
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Promedio Literal:</label>
                    <div className="font-extrabold text-xs text-slate-900 uppercase mt-2">{formData.promedio_literal || 'CERO CON 00/100'}</div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-1">Observaciones:</label>
                  <textarea
                    rows="3"
                    value={formData.observaciones}
                    onChange={(e) => handleCampoChange('observaciones', e.target.value)}
                    className="w-full border p-2.5 rounded-xl font-medium text-slate-800 text-xs outline-none focus:border-[#801B28]"
                    placeholder="Escriba aquí sus observaciones o recomendaciones..."
                  />
                </div>
              </div>

              {/* LUGAR Y FECHA */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-[#801B28] uppercase text-[11px] flex items-center gap-1.5">
                  <MapPin size={14} /> LUGAR Y FECHA DE EVALUACIÓN
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Ciudad / Localidad:</label>
                    <input type="text" value={formData.lugar_ciudad} onChange={(e) => handleCampoChange('lugar_ciudad', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-medium" />
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
        titulo="¿Eliminar Ficha A-1?"
        mensaje="Esta acción borrará de la base de datos las notas registradas en la Ficha A-1 de manera permanente."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};