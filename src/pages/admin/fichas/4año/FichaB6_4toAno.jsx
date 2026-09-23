import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { GraduationCap, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaB64toAnoService } from '../../../../services/fichas/4año/fichaB64toAnoService';

// FUNCIÓN DE FORMATO: Muestra números enteros sin decimales (.00) y mantiene decimales solo si existen.
const formatearPromedio = (val) => {
  if (val === null || val === undefined || val === '' || isNaN(val)) return '-';
  const num = Number(val);
  if (Number.isInteger(num)) {
    return String(Math.trunc(num));
  }
  return String(parseFloat(num.toFixed(2)));
};

export const FichaB6_4toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "4_B6";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const dimensionesTutor = [
    {
      keyA: 'ser_a',
      keyB: 'ser_b',
      dimension: 'SER',
      criterios: [
        'Responsabilidad, compromiso y puntualidad en el desarrollo de la práctica educativa.',
        'Respeto en el trato con estudiantes, padres/ madres de familia, maestras, maestros y personal de la UE/CEA/CEE.',
        'Demuestra un trabajo cohesionado en equipo.'
      ]
    },
    {
      keyA: 'saber_a',
      keyB: 'saber_b',
      dimension: 'SABER',
      criterios: [
        'Conocimiento y manejo de elementos curriculares de la planificación.',
        'Conocimiento y dominio de elementos propios de su especialidad.',
        'Promueve el fortalecimiento del pensamiento crítico y reflexivo con las y los estudiantes.'
      ]
    },
    {
      keyA: 'hacer_a',
      keyB: 'hacer_b',
      dimension: 'HACER',
      criterios: [
        'Dominio de aula usando estrategias pertinentes.',
        'Manifiesta creatividad en el uso de recursos materiales y educativos.',
        'Utiliza instrumentos de evaluación durante la concreción curricular.'
      ]
    },
    {
      keyA: 'decidir_a',
      keyB: 'decidir_b',
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
    ser_a: '', ser_b: '',
    saber_a: '', saber_b: '',
    hacer_a: '', hacer_b: '',
    decidir_a: '', decidir_b: '',
    fecha_1ra_val: '',
    fecha_2da_val: '',
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
          const res = await fichaB64toAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();

          if (res.existe && res.datos) {
            const d = res.datos;
            const updatedState = {
              ...initialFormState,
              ...d,
              ser_a: formatInputValue(d.ser_a),
              ser_b: formatInputValue(d.ser_b),
              saber_a: formatInputValue(d.saber_a),
              saber_b: formatInputValue(d.saber_b),
              hacer_a: formatInputValue(d.hacer_a),
              hacer_b: formatInputValue(d.hacer_b),
              decidir_a: formatInputValue(d.decidir_a),
              decidir_b: formatInputValue(d.decidir_b),
              apellidos_nombres: nombreCompleto,
              fecha_1ra_val: d.fecha_1ra_val ? String(d.fecha_1ra_val).split('T')[0] : '',
              fecha_2da_val: d.fecha_2da_val ? String(d.fecha_2da_val).split('T')[0] : '',
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
          mostrarNotificacion("Error", error.message || "No se pudo consultar la Ficha B-6.", "error");
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
    const promediosParciales = [];

    dimensionesTutor.forEach(dim => {
      const vA = parseFloat(formState[dim.keyA]);
      const vB = parseFloat(formState[dim.keyB]);
      const arr = [vA, vB].filter(n => !isNaN(n));
      if (arr.length > 0) {
        promediosParciales.push(arr.reduce((a, b) => a + b, 0) / arr.length);
      }
    });

    const promFinalRaw = promediosParciales.length > 0
      ? promediosParciales.reduce((a, b) => a + b, 0) / promediosParciales.length
      : 0;

    const promFinal = Number.isInteger(promFinalRaw)
      ? Math.trunc(promFinalRaw)
      : parseFloat(promFinalRaw.toFixed(2));

    const updated = {
      ...formState,
      promedio_numeral: promFinal,
      promedio_literal: convertirNumeroALiteral(promFinal)
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
      const res = await fichaB64toAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "Ficha B-6 guardada correctamente.", "success");
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
      const res = await fichaB64toAnoService.delete(estudianteSeleccionado.id);
      const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      const clearedData = {
        ...initialFormState,
        apellidos_nombres: nombreCompleto
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "La Ficha B-6 fue eliminada con éxito.", "success");
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
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-6: SEGUIMIENTO Y APOYO DE LA/EL DOCENTE TUTOR/A ACOMPAÑANTE (4TO AÑO)"} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando Ficha B-6...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <span className="font-extrabold text-[#801B28] uppercase text-xs">
                  FICHA B-6 - SEGUIMIENTO Y APOYO DE LA/EL DOCENTE TUTOR/A ACOMPAÑANTE
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
                La o el docente tutor/a acompañante debe realizar mínimamente dos seguimientos durante el desarrollo de la PEC. La ficha permite valorar avances, registrar observaciones y comprobar la respuesta del estudiante a las orientaciones recibidas.
              </div>

              {/* MATRIZ DE SEGUIMIENTO (TABLA CON 2 INPUTS POR DIMENSIÓN) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4 overflow-x-auto">
                <table className="w-full border-collapse text-left border border-slate-300">
                  <thead>
                    <tr className="bg-amber-500 text-white font-bold text-center text-[10px]">
                      <th className="p-2 border border-amber-600 min-w-[200px] text-left uppercase" colSpan={2}>
                        Criterio de evaluación
                      </th>
                      <th className="p-2 border border-amber-600 w-[100px] text-center uppercase">
                        (A) 1ra Valoración De 1 a 100
                      </th>
                      <th className="p-2 border border-amber-600 w-[100px] text-center uppercase">
                        (B) 2da Valoración De 1 a 100
                      </th>
                      <th className="p-2 border border-amber-600 w-[100px] text-center uppercase">
                        (A+B)/2 Promedio parcial
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {dimensionesTutor.map((dim) => {
                      const vA = parseFloat(formData[dim.keyA]);
                      const vB = parseFloat(formData[dim.keyB]);
                      const arr = [vA, vB].filter(n => !isNaN(n));
                      const valProm = arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length) : null;
                      const promParcial = valProm !== null ? formatearPromedio(valProm) : '-';

                      return (
                        <React.Fragment key={dim.dimension}>
                          {dim.criterios.map((critText, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              {/* MINI COLUMNA VERTICAL DE LA DIMENSIÓN */}
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

                              {/* CRITERIO */}
                              <td className="p-2 border font-medium text-slate-700 text-[11px] leading-snug">
                                {critText}
                              </td>

                              {/* INPUT (A) 1RA VALORACIÓN */}
                              {idx === 0 && (
                                <td rowSpan={dim.criterios.length} className="p-2 border text-center align-middle bg-slate-50/50">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="0-100"
                                    value={formatInputValue(formData[dim.keyA])}
                                    onChange={(e) => handleNotaChange(dim.keyA, e.target.value)}
                                    className="w-16 border border-slate-300 p-1.5 rounded-lg text-center font-mono font-bold text-xs bg-white focus:border-[#801B28] outline-none shadow-sm"
                                  />
                                </td>
                              )}

                              {/* INPUT (B) 2DA VALORACIÓN */}
                              {idx === 0 && (
                                <td rowSpan={dim.criterios.length} className="p-2 border text-center align-middle bg-slate-50/50">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="0-100"
                                    value={formatInputValue(formData[dim.keyB])}
                                    onChange={(e) => handleNotaChange(dim.keyB, e.target.value)}
                                    className="w-16 border border-slate-300 p-1.5 rounded-lg text-center font-mono font-bold text-xs bg-white focus:border-[#801B28] outline-none shadow-sm"
                                  />
                                </td>
                              )}

                              {/* PROMEDIO PARCIAL */}
                              {idx === 0 && (
                                <td rowSpan={dim.criterios.length} className="p-2 border text-center align-middle font-mono font-extrabold text-sm text-[#801B28] bg-rose-50/30">
                                  {promParcial}
                                </td>
                              )}
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>

                {/* FECHAS DE VALORACIÓN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Fecha de la 1ra Valoración:</label>
                    <input type="date" value={formData.fecha_1ra_val} onChange={(e) => handleCampoChange('fecha_1ra_val', e.target.value)} className="w-full border p-2 rounded-xl bg-white" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Fecha de la 2da Valoración:</label>
                    <input type="date" value={formData.fecha_2da_val} onChange={(e) => handleCampoChange('fecha_2da_val', e.target.value)} className="w-full border p-2 rounded-xl bg-white" />
                  </div>
                </div>

                {/* PROMEDIO GENERAL */}
                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Promedio Final (Número entero):</label>
                    <div className="font-mono font-black text-2xl text-[#801B28]">{formatearPromedio(formData.promedio_numeral)} / 100 PTS</div>
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Literal:</label>
                    <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">{formData.promedio_literal}</div>
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
        titulo="¿Eliminar Ficha B-6?"
        mensaje="Esta acción borrará de forma permanente el registro de la Ficha B-6."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};