import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { GraduationCap, MapPin, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaB74toAnoService } from '../../../../services/fichas/4año/fichaB74toAnoService';
import { especialidadService } from '../../../../services/especialidadService';

export const FichaB7_4toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "4_B7";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const aspectosDiagnostico = [
    { key: 'a1', desc: 'Características económicas, socioculturales y políticas del contexto.' },
    { key: 'a2', desc: 'Descripción de la UE/CEA/CEE (ubicación, dependencia, subsistema, datos estadísticos, personal, etc.).' },
    { key: 'a3', desc: 'Características del proceso educativo observadas en la concreción curricular y la participación estudiantil.' },
    { key: 'a4', desc: 'Características de la gestión institucional: dirección, organización, POA y relación con la comunidad.' },
    { key: 'a5', desc: 'Organización y procesamiento de la información recabada.' },
    { key: 'a6', desc: 'Identificación y priorización reflexiva de problemas, necesidades y potencialidades.' },
    { key: 'a7', desc: 'Formulación pertinente del nudo problemático y preguntas problematizadoras.' }
  ];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [listaEspecialidades, setListaEspecialidades] = useState(ESPECIALIDADES_ESFM);
  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  const initialFormState = {
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    especialidad: ESPECIALIDADES_ESFM[0],
    integrantes_ectg: '',
    ue_cea_cee: '',
    fecha_evaluacion: new Date().toISOString().split('T')[0],
    evaluaciones: {},
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
          const res = await fichaB74toAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
          const espEstudiante = estudianteSeleccionado.especialidad || listaEspecialidades[0] || ESPECIALIDADES_ESFM[0];

          if (res.existe && res.datos) {
            const d = res.datos;
            const updatedState = {
              ...initialFormState,
              ...d,
              integrantes_ectg: d.integrantes_ectg || nombreCompleto,
              especialidad: d.especialidad || espEstudiante,
              evaluaciones: d.evaluaciones || {},
              fecha_evaluacion: d.fecha_evaluacion ? String(d.fecha_evaluacion).split('T')[0] : new Date().toISOString().split('T')[0],
              lugar_ciudad: d.lugar_ciudad || 'El Alto',
              departamento: d.departamento || DEPARTAMENTOS_BOLIVIA[0],
              dia: d.dia || String(new Date().getDate()),
              mes: d.mes || MESES_ANIO[new Date().getMonth()],
              ano: String(d.ano || '2026').slice(0, 4)
            };

            recalcularPromedioDiagnostico(updatedState.evaluaciones, updatedState);
          } else {
            setFormData(prev => ({
              ...prev,
              ...initialFormState,
              integrantes_ectg: nombreCompleto,
              especialidad: espEstudiante
            }));
          }
        } catch (error) {
          mostrarNotificacion("Error", error.message || "No se pudo consultar la Ficha B-7.", "error");
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

  const recalcularPromedioDiagnostico = (evalsObj, baseForm = formData) => {
    const notasValidas = aspectosDiagnostico.map(a => parseFloat(evalsObj[a.key]?.nota)).filter(n => !isNaN(n));
    const prom = notasValidas.length > 0 ? parseFloat((notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length).toFixed(2)) : 0;

    const updated = {
      ...baseForm,
      evaluaciones: evalsObj,
      promedio_numeral: prom,
      promedio_literal: convertirNumeroALiteral(prom)
    };

    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  const handleAspectoChange = (aspKey, field, value) => {
    let val = value;
    if (field === 'nota') {
      let num = parseFloat(value);
      if (isNaN(num)) val = '';
      else if (num < 0) val = 0;
      else if (num > 100) val = 100;
      else val = num;
    }

    const updatedEvals = {
      ...(formData.evaluaciones || {}),
      [aspKey]: {
        ...(formData.evaluaciones?.[aspKey] || {}),
        [field]: val
      }
    };

    recalcularPromedioDiagnostico(updatedEvals);
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
      const res = await fichaB74toAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "Ficha B-7 guardada correctamente.", "success");
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
      const res = await fichaB74toAnoService.delete(estudianteSeleccionado.id);
      const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      const clearedData = {
        ...initialFormState,
        integrantes_ectg: nombreCompleto,
        especialidad: estudianteSeleccionado.especialidad || listaEspecialidades[0] || ESPECIALIDADES_ESFM[0]
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "La Ficha B-7 fue eliminada con éxito.", "success");
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
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-7: DIAGNÓSTICO SOCIOPARTICIPATIVO DE LA UE/CEA/CEE (4TO AÑO)"} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando Ficha B-7...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <span className="font-extrabold text-[#801B28] uppercase text-xs">
                  FICHA B-7 - DIAGNÓSTICO SOCIOPARTICIPATIVO DE LA UE/CEA/CEE
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
              <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200 text-slate-700 text-[11px] leading-relaxed">
                El ECTG presenta un informe sobre los principales resultados del diagnóstico socioparticipativo, elaborado con apoyo de instrumentos de investigación y revisión documental. Se socializa a la comunidad educativa en la última semana de la PEC.
              </div>

              {/* DATOS REFERENCIALES GENERALES */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-[#801B28] uppercase text-[11px] flex items-center gap-1.5 border-b pb-2">
                  <GraduationCap size={15} /> DATOS REFERENCIALES DEL INFORME
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">ESFM/UA:</label>
                    <input type="text" value={formData.esfm_ua} onChange={(e) => handleCampoChange('esfm_ua', e.target.value)} className="w-full border p-2 rounded-xl font-bold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                    <select value={formData.especialidad} onChange={(e) => handleCampoChange('especialidad', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold">
                      {listaEspecialidades.map((e, idx) => <option key={idx} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Integrantes del ECTG:</label>
                    <input type="text" value={formData.integrantes_ectg} onChange={(e) => handleCampoChange('integrantes_ectg', e.target.value)} className="w-full border p-2 rounded-xl font-bold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">UE/CEA/CEE:</label>
                    <input type="text" value={formData.ue_cea_cee} onChange={(e) => handleCampoChange('ue_cea_cee', e.target.value)} className="w-full border p-2 rounded-xl font-bold" placeholder="Nombre de la Unidad Educativa" />
                  </div>
                </div>
              </div>

              {/* ASPECTOS DE EVALUACIÓN CUALI/CUANTI */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
                  VALORACIÓN DEL INFORME DE DIAGNÓSTICO
                </span>

                <div className="space-y-3">
                  {aspectosDiagnostico.map(asp => (
                    <div key={asp.key} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-800 text-[11px] block">{asp.desc}</span>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input
                          type="text"
                          placeholder="Valoración cualitativa del informe..."
                          value={formData.evaluaciones?.[asp.key]?.cualitativa || ''}
                          onChange={(e) => handleAspectoChange(asp.key, 'cualitativa', e.target.value)}
                          className="sm:col-span-3 border p-2 rounded-xl text-slate-800 bg-white focus:border-[#801B28] outline-none"
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0-100 Pts"
                          value={formData.evaluaciones?.[asp.key]?.nota ?? ''}
                          onChange={(e) => handleAspectoChange(asp.key, 'nota', e.target.value)}
                          className="border p-2 rounded-xl font-mono font-bold text-center bg-white focus:border-[#801B28] outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

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
        titulo="¿Eliminar Ficha B-7?"
        mensaje="Esta acción borrará de forma permanente el registro de la Ficha B-7."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};