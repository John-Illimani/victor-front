import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { GraduationCap, MapPin, UserCheck, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaB33erAnoService } from '../../../../services/fichas/3año/fichaB33erAnoService';
import { especialidadService } from '../../../../services/especialidadService';

export const FichaB3_3erAno = ({ isOpen, onClose, fichaData, setFichaData, listaDocentes = [], estudianteSeleccionado }) => {
  const codigoFicha = "3_B3";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const pdcsDefecto = ['PDC 1', 'PDC 2', 'PDC 3', 'PDC (Clase comunitaria)'];

  const criteriosEvaluacion = [
    { key: 'c1', label: 'Demuestra coherencia entre objetivo de aprendizaje, contenidos, momentos del proceso formativo, criterios de evaluación, recursos/materiales y productos.' },
    { key: 'c2', label: 'Articula el PDC con los problemas emergentes del contexto.' },
    { key: 'c3', label: 'Utiliza recursos/materiales, promoviendo la participación y el desarrollo de capacidades, habilidades y/o potencialidades en las y los estudiantes.' },
    { key: 'c4', label: 'Demuestra compromiso a través de la aplicación de estrategias metodológicas para desarrollar procesos creativos, propositivos y reflexivos.' },
    { key: 'c5', label: 'Demuestra respeto, responsabilidad, puntualidad, trato cordial y acompañamiento a los miembros de la UE/CEA/CEE.' }
  ];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [listaEspecialidades, setListaEspecialidades] = useState(ESPECIALIDADES_ESFM);
  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  const initialPdcsState = {
    'PDC 1': { c1: '', c2: '', c3: '', c4: '', c5: '', promedio_parcial: 0 },
    'PDC 2': { c1: '', c2: '', c3: '', c4: '', c5: '', promedio_parcial: 0 },
    'PDC 3': { c1: '', c2: '', c3: '', c4: '', c5: '', promedio_parcial: 0 },
    'PDC (Clase comunitaria)': { c1: '', c2: '', c3: '', c4: '', c5: '', promedio_parcial: 0 },
  };

  const initialFormState = {
    apellidos_nombres: '',
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    especialidad: ESPECIALIDADES_ESFM[0],
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    ano: '2026',
    pdcs: initialPdcsState,
    promedio_total: 0,
    promedio_literal: 'CERO CON 00/100',
    observaciones: '',
    docente_guia_id: ''
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
          const res = await fichaB33erAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
          const espEstudiante = estudianteSeleccionado.especialidad || listaEspecialidades[0] || ESPECIALIDADES_ESFM[0];

          if (res.existe && res.datos) {
            const d = res.datos;
            const pdcsCargados = d.pdcs && Object.keys(d.pdcs).length > 0 ? d.pdcs : initialPdcsState;
            const prom = parseFloat(d.promedio_total || d.promedio_numeral || 0);

            setFormData(prev => ({
              ...prev,
              ...d,
              apellidos_nombres: nombreCompleto,
              especialidad: d.especialidad || espEstudiante,
              pdcs: pdcsCargados,
              promedio_total: prom,
              promedio_literal: d.promedio_literal || convertirNumeroALiteral(prom),
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
          mostrarNotificacion("Error", error.message || "No se pudo consultar la Ficha B-3.", "error");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFicha();
  }, [isOpen, estudianteSeleccionado]);

  useEffect(() => {
    if (estudianteSeleccionado) {
      setFormData(prev => ({
        ...prev,
        apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
        especialidad: estudianteSeleccionado.especialidad || prev.especialidad,
        ...fichaData
      }));
    }
  }, [estudianteSeleccionado, fichaData]);

  const mostrarNotificacion = (titulo, mensaje, tipo = 'info') => {
    setModalNotif({ isOpen: true, titulo, mensaje, tipo });
  };

  const handlePdcCriterionChange = (pdcKey, critKey, val) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = '';
    else if (num < 1) num = 1;
    else if (num > 100) num = 100;

    const pdcsObj = { ...(formData.pdcs || {}) };
    if (!pdcsObj[pdcKey]) pdcsObj[pdcKey] = {};
    pdcsObj[pdcKey][critKey] = num;

    const vals = ['c1', 'c2', 'c3', 'c4', 'c5'].map(k => parseFloat(pdcsObj[pdcKey][k])).filter(v => !isNaN(v));
    const promParcial = vals.length > 0 ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) : 0;
    pdcsObj[pdcKey].promedio_parcial = promParcial;

    const promsPdcs = Object.keys(pdcsObj).map(k => parseFloat(pdcsObj[k].promedio_parcial)).filter(p => p > 0);
    const promTotal = promsPdcs.length > 0 ? parseFloat((promsPdcs.reduce((a, b) => a + b, 0) / promsPdcs.length).toFixed(2)) : 0;

    const updated = {
      ...formData,
      pdcs: pdcsObj,
      promedio_total: promTotal,
      promedio_numeral: promTotal,
      promedio_final: promTotal,
      promedio_literal: convertirNumeroALiteral(promTotal)
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
      const res = await fichaB33erAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "La Ficha B-3 se registró correctamente.", "success");
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
      const res = await fichaB33erAnoService.delete(estudianteSeleccionado.id);
      const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      const clearedData = {
        ...initialFormState,
        apellidos_nombres: nombreCompleto,
        especialidad: estudianteSeleccionado.especialidad || listaEspecialidades[0] || ESPECIALIDADES_ESFM[0]
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "La Ficha B-3 fue eliminada con éxito.", "success");
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
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-3: APOYO Y SEGUIMIENTO DEL DOCENTE GUÍA EN CONCRECIÓN CURRICULAR"} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando evaluación de Ficha B-3...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <h4 className="font-extrabold text-[#801B28] uppercase text-sm">
                  FICHA B-3: SEGUIMIENTO DEL DOCENTE GUÍA EN CONCRECIÓN CURRICULAR (PDCs) - 3ER AÑO
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
                  <GraduationCap size={15} /> DATOS REFERENCIALES
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Nombres y Apellidos:</label>
                    <input type="text" readOnly value={formData.apellidos_nombres} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-extrabold text-slate-900 outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">ESFM/UA:</label>
                    <input type="text" value={formData.esfm_ua} onChange={(e) => handleCampoChange('esfm_ua', e.target.value)} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                    <select value={formData.especialidad} onChange={(e) => handleCampoChange('especialidad', e.target.value)} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold">
                      {listaEspecialidades.map((e, idx) => <option key={idx} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* MATRIZ DE EVALUACIÓN DE PDCs */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
                <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
                  CRITERIOS DE EVALUACIÓN EN LA CONCRECIÓN CURRICULAR (PDCs)
                </span>

                {pdcsDefecto.map((pdcLabel) => (
                  <div key={pdcLabel} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="font-black text-[#801B28] uppercase text-[12px] bg-rose-100/60 px-3 py-1 rounded-lg">
                        {pdcLabel}
                      </span>
                      <span className="font-mono font-bold text-slate-700 text-[11px]">
                        Promedio Parcial: <strong className="text-[#801B28] text-sm">{formData.pdcs?.[pdcLabel]?.promedio_parcial || '0.00'} Pts.</strong>
                      </span>
                    </div>

                    <div className="space-y-2">
                      {criteriosEvaluacion.map((crit, idx) => (
                        <div key={crit.key} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200">
                          <span className="sm:col-span-4 font-medium text-slate-800 text-[11px] leading-snug">
                            <strong className="text-[#801B28] mr-1">{idx + 1}.</strong> {crit.label}
                          </span>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            placeholder="1 - 100"
                            value={formData.pdcs?.[pdcLabel]?.[crit.key] ?? ''}
                            onChange={(e) => handlePdcCriterionChange(pdcLabel, crit.key, e.target.value)}
                            className="w-full border border-slate-300 p-2 rounded-lg bg-slate-50 font-mono font-bold text-center text-slate-900 focus:border-[#801B28] outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Promedio Total General:</label>
                    <div className="font-mono font-black text-2xl text-[#801B28]">{formData.promedio_total || '0.00'} / 100 PTS</div>
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Promedio Literal:</label>
                    <div className="font-extrabold text-xs text-slate-900 uppercase mt-2">{formData.promedio_literal || 'CERO CON 00/100'}</div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-1">Observaciones y/o Sugerencias de la Concreción Curricular:</label>
                  <textarea
                    rows="3"
                    value={formData.observaciones}
                    onChange={(e) => handleCampoChange('observaciones', e.target.value)}
                    className="w-full border p-2.5 rounded-xl font-medium text-slate-800 text-xs focus:border-[#801B28] outline-none"
                    placeholder="Escriba aquí sus observaciones..."
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
        titulo="¿Eliminar Ficha B-3?"
        mensaje="Esta acción eliminará de la base de datos de forma permanente la evaluación de la Ficha B-3."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};