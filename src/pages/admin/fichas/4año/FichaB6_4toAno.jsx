import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { GraduationCap, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaB64toAnoService } from '../../../../services/fichas/4año/fichaB64toAnoService';

export const FichaB6_4toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "4_B6";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const dimensionesTutor = [
    {
      dimension: 'SER',
      criterios: [
        { key: 'c1', label: 'Responsabilidad, compromiso y puntualidad en el desarrollo de la práctica educativa.' },
        { key: 'c2', label: 'Respeto en el trato con estudiantes, padres/ madres de familia, maestras, maestros y personal de la UE/CEA/CEE.' },
        { key: 'c3', label: 'Demuestra un trabajo cohesionado en equipo.' }
      ]
    },
    {
      dimension: 'SABER',
      criterios: [
        { key: 'c4', label: 'Conocimiento y manejo de elementos curriculares de la planificación.' },
        { key: 'c5', label: 'Conocimiento y dominio de elementos propios de su especialidad.' },
        { key: 'c6', label: 'Promueve el fortalecimiento del pensamiento crítico y reflexivo con las y los estudiantes.' }
      ]
    },
    {
      dimension: 'HACER',
      criterios: [
        { key: 'c7', label: 'Dominio de aula usando estrategias pertinentes.' },
        { key: 'c8', label: 'Manifiesta creatividad en el uso de recursos materiales y educativos.' },
        { key: 'c9', label: 'Utiliza instrumentos de evaluación durante la concreción curricular.' }
      ]
    },
    {
      dimension: 'DECIDIR',
      criterios: [
        { key: 'c10', label: 'Asume las sugerencias y observaciones a los PDC elaborados.' },
        { key: 'c11', label: 'Aplica acciones de manera oportuna para la solución de problemas en el aula.' },
        { key: 'c12', label: 'Demuestra iniciativa en la solución de problemas emergentes de la comunidad educativa.' }
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
    evaluaciones: {},
    fecha_1ra_val: '',
    fecha_2da_val: '',
    promedio_numeral: 0,
    promedio_literal: 'CERO CON 00/100'
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
              apellidos_nombres: nombreCompleto,
              evaluaciones: d.evaluaciones || {},
              fecha_1ra_val: d.fecha_1ra_val ? String(d.fecha_1ra_val).split('T')[0] : '',
              fecha_2da_val: d.fecha_2da_val ? String(d.fecha_2da_val).split('T')[0] : ''
            };

            recalcularPromedioMatriz(updatedState.evaluaciones, updatedState);
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

  const recalcularPromedioMatriz = (evalsObj, baseForm = formData) => {
    const promediosCriterios = [];
    dimensionesTutor.forEach(dim => {
      dim.criterios.forEach(c => {
        const v1 = parseFloat(evalsObj[c.key]?.v1);
        const v2 = parseFloat(evalsObj[c.key]?.v2);
        const arr = [v1, v2].filter(n => !isNaN(n));
        if (arr.length > 0) {
          promediosCriterios.push(arr.reduce((a, b) => a + b, 0) / arr.length);
        }
      });
    });

    const promFinal = promediosCriterios.length > 0 
      ? parseFloat((promediosCriterios.reduce((a, b) => a + b, 0) / promediosCriterios.length).toFixed(2)) 
      : 0;

    const updated = {
      ...baseForm,
      evaluaciones: evalsObj,
      promedio_numeral: promFinal,
      promedio_literal: convertirNumeroALiteral(promFinal)
    };

    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  const handleValoracionChange = (critKey, valNum, value) => {
    let num = parseFloat(value);
    if (isNaN(num)) num = '';
    else if (num < 0) num = 0;
    else if (num > 100) num = 100;

    const newEvals = {
      ...(formData.evaluaciones || {}),
      [critKey]: {
        ...(formData.evaluaciones?.[critKey] || {}),
        [valNum]: num
      }
    };

    recalcularPromedioMatriz(newEvals);
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

              {/* MATRIZ DE SEGUIMIENTO */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
                <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
                  MATRIZ DE SEGUIMIENTO Y EVALUACIÓN
                </span>

                {dimensionesTutor.map((dim) => (
                  <div key={dim.dimension} className="space-y-2">
                    <div className="bg-rose-50/80 p-2 rounded-xl border border-rose-200">
                      <span className="font-black text-[#801B28] text-[11px] uppercase tracking-wider block">
                        DIMENSIÓN {dim.dimension}
                      </span>
                    </div>

                    <div className="space-y-1.5 pl-1">
                      {dim.criterios.map((crit) => {
                        const v1 = parseFloat(formData.evaluaciones?.[crit.key]?.v1);
                        const v2 = parseFloat(formData.evaluaciones?.[crit.key]?.v2);
                        const arr = [v1, v2].filter(n => !isNaN(n));
                        const promParcial = arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : '-';

                        return (
                          <div key={crit.key} className="grid grid-cols-1 sm:grid-cols-7 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <span className="sm:col-span-4 font-medium text-slate-800 text-[11px]">{crit.label}</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="(A) 1ra Val."
                              value={formData.evaluaciones?.[crit.key]?.v1 ?? ''}
                              onChange={(e) => handleValoracionChange(crit.key, 'v1', e.target.value)}
                              className="border p-1.5 rounded-lg text-center font-bold bg-white focus:border-[#801B28] outline-none"
                            />
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="(B) 2da Val."
                              value={formData.evaluaciones?.[crit.key]?.v2 ?? ''}
                              onChange={(e) => handleValoracionChange(crit.key, 'v2', e.target.value)}
                              className="border p-1.5 rounded-lg text-center font-bold bg-white focus:border-[#801B28] outline-none"
                            />
                            <div className="text-center font-mono font-black text-[#801B28]">{promParcial}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

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

                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Promedio Final (Número entero):</label>
                    <div className="font-mono font-black text-2xl text-[#801B28]">{formData.promedio_numeral || '0.00'} / 100 PTS</div>
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