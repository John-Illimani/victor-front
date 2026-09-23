import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { GraduationCap, MapPin, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaB53erAnoService } from '../../../../services/fichas/3año/fichaB53erAnoService';
import { especialidadService } from '../../../../services/especialidadService';

export const FichaB5_3erAno = ({ isOpen, onClose, fichaData, setFichaData, listaDocentes = [], estudianteSeleccionado }) => {
  const codigoFicha = "3_B5";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const criterios = [
    { key: 'c1', obsKey: 'obs_c1', label: 'Descripción del contexto educativo y características de la UE/CEA/CEE' },
    { key: 'c2', obsKey: 'obs_c2', label: 'Análisis de la información (Aspectos sociales, económicos, culturales, etc.)' },
    { key: 'c3', obsKey: 'obs_c3', label: 'Formulación adecuada del nudo problemático.' },
    { key: 'c4', obsKey: 'obs_c4', label: 'Preguntas problematizadoras, pertinentes al nudo.' },
    { key: 'c5', obsKey: 'obs_c5', label: 'Metodología del proceso IEPC-PEC.' },
    { key: 'c6', obsKey: 'obs_c6', label: 'Marco reflexivo teórico.' },
    { key: 'c7', obsKey: 'obs_c7', label: 'Alternativa de solución planteada' },
    { key: 'c8', obsKey: 'obs_c8', label: 'Conclusiones y recomendaciones' },
    { key: 'c9', obsKey: 'obs_c9', label: 'Claridad y coherencia en la redacción.' },
    { key: 'c10', obsKey: 'obs_c10', label: 'Uso de normas APA (6ta y/o 7ma edición).' }
  ];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [listaEspecialidades, setListaEspecialidades] = useState(ESPECIALIDADES_ESFM);
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
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    especialidad: ESPECIALIDADES_ESFM[0],
    c1: '', c2: '', c3: '', c4: '', c5: '',
    c6: '', c7: '', c8: '', c9: '', c10: '',
    obs_c1: '', obs_c2: '', obs_c3: '', obs_c4: '', obs_c5: '',
    obs_c6: '', obs_c7: '', obs_c8: '', obs_c9: '', obs_c10: '',
    puntaje_final: 0,
    promedio_literal: 'CERO',
    observaciones: '',
    docente_acompanante_id: '',
    docente_investigacion_id: '',
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
          const res = await fichaB53erAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
          const espEstudiante = estudianteSeleccionado.especialidad || listaEspecialidades[0] || ESPECIALIDADES_ESFM[0];

          if (res.existe && res.datos) {
            const d = res.datos;
            const pf = parseFloat(d.puntaje_final || d.promedio_numeral || 0);

            setFormData(prev => ({
              ...prev,
              ...d,
              apellidos_nombres: nombreCompleto,
              especialidad: d.especialidad || espEstudiante,
              c1: formatInputValue(d.c1), c2: formatInputValue(d.c2),
              c3: formatInputValue(d.c3), c4: formatInputValue(d.c4),
              c5: formatInputValue(d.c5), c6: formatInputValue(d.c6),
              c7: formatInputValue(d.c7), c8: formatInputValue(d.c8),
              c9: formatInputValue(d.c9), c10: formatInputValue(d.c10),
              obs_c1: d.obs_c1 || '', obs_c2: d.obs_c2 || '',
              obs_c3: d.obs_c3 || '', obs_c4: d.obs_c4 || '',
              obs_c5: d.obs_c5 || '', obs_c6: d.obs_c6 || '',
              obs_c7: d.obs_c7 || '', obs_c8: d.obs_c8 || '',
              obs_c9: d.obs_c9 || '', obs_c10: d.obs_c10 || '',
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

  const handleNotaChange = (key, value) => {
    if (value === '') {
      const updatedForm = { ...formData, [key]: '' };
      actualizarPromedios(updatedForm);
      return;
    }

    let val = parseFloat(value);
    if (isNaN(val)) val = '';
    else if (val < 1) val = 1;
    else if (val > 100) val = 100;

    const newForm = { ...formData, [key]: val };
    actualizarPromedios(newForm);
  };

  const actualizarPromedios = (newForm) => {
    const notas = criterios.map(c => parseFloat(newForm[c.key])).filter(n => !isNaN(n));
    let prom = notas.length > 0 ? parseFloat((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)) : 0;
    if (prom % 1 === 0) prom = Math.round(prom);

    newForm.puntaje_final = prom;
    newForm.promedio_numeral = prom;
    newForm.promedio_final = prom;
    newForm.promedio_literal = convertirNumeroALiteral(prom);

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
      const res = await fichaB53erAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "La Ficha B-5 se registró correctamente.", "success");
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
      const res = await fichaB53erAnoService.delete(estudianteSeleccionado.id);
      const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      const clearedData = {
        ...initialFormState,
        apellidos_nombres: nombreCompleto,
        especialidad: estudianteSeleccionado.especialidad || listaEspecialidades[0] || ESPECIALIDADES_ESFM[0]
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
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-5: PRESENTACIÓN DEL INFORME DEL DIAGNÓSTICO SOCIOPARTICIPATIVO"} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando evaluación de Ficha B-5...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <h4 className="font-extrabold text-[#801B28] uppercase text-sm">
                  FICHA B-5: EVALUACIÓN DE PRESENTACIÓN DEL INFORME DEL DIAGNÓSTICO SOCIOPARTICIPATIVO - 3ER AÑO
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

              {/* MATRIZ DE CRITERIOS CON VALORACIÓN CUALITATIVA (OBSERVACIÓN) Y NOTA */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
                  VALORACIÓN CUALITATIVA Y PUNTAJE DE INFORME DIAGNÓSTICO
                </span>

                <div className="space-y-3">
                  {criterios.map((crit, idx) => (
                    <div key={crit.key} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-800 text-[11px] block">
                        <strong className="text-[#801B28] mr-1">{idx + 1}.</strong> {crit.label}
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Valoración cualitativa (observación)..."
                          value={formData[crit.obsKey] || ''}
                          onChange={(e) => handleCampoChange(crit.obsKey, e.target.value)}
                          className="sm:col-span-3 border p-2 rounded-xl bg-white font-medium text-slate-800 text-xs focus:border-[#801B28] outline-none"
                        />
                        
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-[10px] font-bold text-slate-500">Puntaje:</span>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            placeholder="1-100"
                            value={formatInputValue(formData[crit.key])}
                            onChange={(e) => handleNotaChange(crit.key, e.target.value)}
                            className="w-24 border p-2 rounded-xl bg-white font-mono font-bold text-center text-slate-900 focus:border-[#801B28] outline-none text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Puntaje Final Promedio:</label>
                    <div className="font-mono font-black text-2xl text-[#801B28]">{formData.puntaje_final || '0'} / 100 PTS</div>
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Promedio Literal:</label>
                    <div className="font-extrabold text-xs text-slate-900 uppercase mt-2">{formData.promedio_literal || 'CERO'}</div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-1">Observaciones y/o Sugerencias Generales:</label>
                  <textarea
                    rows="3"
                    value={formData.observaciones}
                    onChange={(e) => handleCampoChange('observaciones', e.target.value)}
                    className="w-full border p-2.5 rounded-xl font-medium text-slate-800 text-xs focus:border-[#801B28] outline-none"
                    placeholder="Escriba observaciones generales..."
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
        titulo="¿Eliminar Ficha B-5?"
        mensaje="Esta acción borrará de forma permanente los registros de la Ficha B-5 de la base de datos."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};