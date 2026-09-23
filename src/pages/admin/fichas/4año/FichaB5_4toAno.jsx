import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { GraduationCap, MapPin, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaB54toAnoService } from '../../../../services/fichas/4año/fichaB54toAnoService';

export const FichaB5_4toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "4_B5";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const dimensionesEvaluacion = [
    {
      key: 'c1',
      dimension: 'SER',
      criterios: [
        'Responsabilidad, compromiso y puntualidad en el desarrollo de la práctica educativa.',
        'Respeto en el trato con estudiantes, padres/ madres de familia, maestras, maestros y personal de la UE/CEA/CEE.',
        'Promueve la práctica de valores sociocomunitarios en la UE/CEA/CEE.'
      ]
    },
    {
      key: 'c2',
      dimension: 'SABER',
      criterios: [
        'Conocimiento y manejo de elementos curriculares de la planificación.',
        'Conocimiento y dominio de elementos propios de su especialidad.',
        'Promueve el fortalecimiento del pensamiento crítico y reflexivo con las y los estudiantes.'
      ]
    },
    {
      key: 'c3',
      dimension: 'HACER',
      criterios: [
        'Dominio de aula usando estrategias pertinentes.',
        'Manifiesta creatividad en el uso de recursos materiales y educativos.',
        'Utiliza instrumentos de evaluación durante la concreción curricular.'
      ]
    },
    {
      key: 'c4',
      dimension: 'DECIDIR',
      criterios: [
        'Asume las sugerencias y observaciones a los PDC elaborados.',
        'Aplica acciones de manera oportuna para la solución de problemas en el aula.',
        'Demuestra iniciativa en la solución de problemas emergentes de la comunidad educativa.'
      ]
    }
  ];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  const formatInputValue = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const num = Number(val);
    if (isNaN(num)) return val;
    return Number.isInteger(num) ? String(Math.trunc(num)) : String(val);
  };

  const initialFormState = {
    apellidos_nombres: '',
    c1: '', c2: '', c3: '', c4: '',
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
          const res = await fichaB54toAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();

          if (res.existe && res.datos) {
            const d = res.datos;

            const updatedState = {
              ...initialFormState,
              ...d,
              c1: formatInputValue(d.c1),
              c2: formatInputValue(d.c2),
              c3: formatInputValue(d.c3),
              c4: formatInputValue(d.c4),
              apellidos_nombres: nombreCompleto,
              lugar_ciudad: d.lugar_ciudad || 'El Alto',
              departamento: d.departamento || DEPARTAMENTOS_BOLIVIA[0],
              dia: d.dia || String(new Date().getDate()),
              mes: d.mes || MESES_ANIO[new Date().getMonth()],
              ano: String(d.ano || '2026').slice(0, 4)
            };

            recalcularPromedioGeneral(updatedState);
          } else {
            setFormData(prev => ({
              ...prev,
              ...initialFormState,
              apellidos_nombres: nombreCompleto
            }));
          }
        } catch (error) {
          mostrarNotificacion("Error", error.message || "No se pudo consultar la Ficha B-5.", "error");
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

  const recalcularPromedioGeneral = (formState) => {
    const keys = ['c1', 'c2', 'c3', 'c4'];
    const notasValidas = keys.map(k => parseFloat(formState[k])).filter(n => !isNaN(n));
    const prom = notasValidas.length > 0 ? parseFloat((notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length).toFixed(2)) : 0;

    const updated = {
      ...formState,
      promedio_numeral: prom,
      promedio_literal: convertirNumeroALiteral(prom)
    };

    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  const handleNotaChange = (key, value) => {
    if (value === '') {
      const updatedForm = { ...formData, [key]: '' };
      recalcularPromedioGeneral(updatedForm);
      return;
    }

    let num = parseFloat(value);
    if (isNaN(num)) num = '';
    else if (num < 0) num = 0;
    else if (num > 100) num = 100;

    const newForm = { ...formData, [key]: num };
    recalcularPromedioGeneral(newForm);
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
      const res = await fichaB54toAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "Ficha B-5 guardada correctamente.", "success");
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
      const res = await fichaB54toAnoService.delete(estudianteSeleccionado.id);
      const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      const clearedData = {
        ...initialFormState,
        apellidos_nombres: nombreCompleto
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "La Ficha B-5 fue eliminada con éxito.", "success");
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
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-5: SEGUIMIENTO Y APOYO DE LA/EL DOCENTE GUÍA (4TO AÑO)"} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando Ficha B-5...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <span className="font-extrabold text-[#801B28] uppercase text-xs">
                  FICHA B-5 - SEGUIMIENTO Y APOYO DE LA/EL DOCENTE GUÍA
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
                  <GraduationCap size={15} /> Nombre del estudiante:
                </span>
                <input
                  type="text"
                  readOnly
                  value={formData.apellidos_nombres}
                  className="w-full border border-amber-200 p-2 rounded-xl bg-white font-extrabold text-slate-900"
                />
              </div>

              {/* AVISO */}
              <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200 text-slate-700 text-[11px] leading-relaxed">
                La o el docente guía realiza seguimiento a cada integrante del ECTG antes de la finalización de la PEC, valorando la dimensión formativa, el dominio teórico-metodológico, la concreción y la capacidad de proponer mejoras.
              </div>

              {/* CRITERIOS DE EVALUACIÓN CON 1 INPUT POR DIMENSIÓN */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4 overflow-x-auto">
                <table className="w-full border-collapse text-left border border-slate-300">
                  <thead>
                    <tr className="bg-amber-500 text-white font-bold text-center text-[10px]">
                      <th className="p-2.5 border border-amber-600 min-w-[220px] text-left uppercase" colSpan={2}>
                        Criterio de evaluación
                      </th>
                      <th className="p-2.5 border border-amber-600 w-[140px] text-center uppercase">
                        Valoración del 1 a 100
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {dimensionesEvaluacion.map((dim) => (
                      <React.Fragment key={dim.key}>
                        {dim.criterios.map((critText, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            {/* MINI COLUMNA VERTICAL CON NOMBRE DE LA DIMENSIÓN */}
                            {idx === 0 && (
                              <td
                                rowSpan={dim.criterios.length}
                                className="p-2 border font-black text-slate-800 uppercase text-[10px] bg-slate-100 text-center align-middle w-10"
                              >
                                <span className="[writing-mode:vertical-lr] rotate-180 inline-block">
                                  {dim.dimension}
                                </span>
                              </td>
                            )}

                            {/* TEXTO DEL CRITERIO */}
                            <td className="p-2 border font-medium text-slate-700 text-[11px] leading-snug">
                              {critText}
                            </td>

                            {/* INPUT ÚNICO DE VALORACIÓN POR CADA DIMENSIÓN */}
                            {idx === 0 && (
                              <td
                                rowSpan={dim.criterios.length}
                                className="p-2 border text-center align-middle bg-slate-50/50"
                              >
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  placeholder="0-100"
                                  value={formatInputValue(formData[dim.key])}
                                  onChange={(e) => handleNotaChange(dim.key, e.target.value)}
                                  className="w-20 border border-slate-300 p-2 rounded-xl text-center font-mono font-bold text-xs bg-white focus:border-[#801B28] focus:ring-1 focus:ring-[#801B28] outline-none shadow-sm"
                                />
                              </td>
                            )}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>

                {/* PUNTAJE FINAL GENERAL */}
                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Promedio Final Numeral:</label>
                    <div className="font-mono font-black text-2xl text-[#801B28]">{formData.promedio_numeral || '0.00'} / 100 PTS</div>
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Literal:</label>
                    <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">{formData.promedio_literal}</div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-1">Observaciones/Sugerencias:</label>
                  <textarea
                    rows="3"
                    value={formData.observaciones}
                    onChange={(e) => handleCampoChange('observaciones', e.target.value)}
                    className="w-full border p-2.5 rounded-xl font-medium text-slate-800 text-xs focus:border-[#801B28] outline-none"
                    placeholder="Escriba aquí las observaciones o sugerencias..."
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
        titulo="¿Eliminar Ficha B-5?"
        mensaje="Esta acción borrará de forma permanente el registro de la Ficha B-5."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};