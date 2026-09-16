import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { GraduationCap, MapPin, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaB55toAnoService } from '../../../../services/fichas/5año/fichaB55toAnoService';

export const FichaB5_5toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado, listaDocentes = [] }) => {
  const codigoFicha = "5_B5";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const dimensionesList = [
    {
      key: 'ser',
      nombre: 'SER',
      criterios: [
        'Responsabilidad, compromiso y puntualidad en el desarrollo de práctica educativa.',
        'Respeto en el trato con estudiantes, padres/madres de familia, maestras, maestros y personal de la UE/CEA/CEE.',
        'Promueve la práctica de valores sociocomunitarios en la UE/CEA/CEE.'
      ]
    },
    {
      key: 'saber',
      nombre: 'SABER',
      criterios: [
        'Conocimiento y manejo de elementos curriculares del MESCP.',
        'Conocimiento y dominio de elementos propios de su especialidad.',
        'Promueve el fortalecimiento del pensamiento crítico y reflexivo con las y los estudiantes.'
      ]
    },
    {
      key: 'hacer',
      nombre: 'HACER',
      criterios: [
        'Dominio de aula usando estrategias pertinentes.',
        'Manifiesta creatividad en el uso de recursos materiales y educativos en la implementación de la propuesta.',
        'Utiliza instrumentos de evaluación durante la concreción curricular.'
      ]
    },
    {
      key: 'decidir',
      nombre: 'DECIDIR',
      criterios: [
        'Asume sugerencias y observaciones a los PDC elaborados.',
        'Demuestra aportes desde la implementación de la propuesta educativa.',
        'Demuestra iniciativa en la solución de problemas emergentes de la comunidad educativa.'
      ]
    }
  ];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  // Función helper para formatear valores en enteros o decimales según corresponda
  const formatInputValue = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const num = Number(val);
    if (isNaN(num)) return val;
    return Number.isInteger(num) ? String(Math.trunc(num)) : String(val);
  };

  const initialFormState = {
    docente_guia_id: '',
    apellidos_nombres: '',
    nota_ser: '',
    nota_saber: '',
    nota_hacer: '',
    nota_decidir: '',
    obs_ser: '',
    obs_saber: '',
    obs_hacer: '',
    obs_decidir: '',
    promedio_numeral: 0,
    promedio_literal: 'CERO CON 00/100',
    observaciones_sugerencias: '',
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
          const res = await fichaB55toAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();

          if (res.existe && res.datos) {
            const d = res.datos;
            const updatedState = {
              ...initialFormState,
              ...d,
              apellidos_nombres: nombreCompleto,
              docente_guia_id: d.docente_guia_id || '',
              nota_ser: d.nota_ser ?? '',
              nota_saber: d.nota_saber ?? '',
              nota_hacer: d.nota_hacer ?? '',
              nota_decidir: d.nota_decidir ?? '',
              obs_ser: d.obs_ser || '',
              obs_saber: d.obs_saber || '',
              obs_hacer: d.obs_hacer || '',
              obs_decidir: d.obs_decidir || '',
              observaciones_sugerencias: d.observaciones_sugerencias || '',
              lugar_ciudad: d.lugar_ciudad || 'El Alto',
              departamento: d.departamento || DEPARTAMENTOS_BOLIVIA[0],
              dia: d.dia || String(new Date().getDate()),
              mes: d.mes || MESES_ANIO[new Date().getMonth()],
              ano: String(d.ano || '2026').slice(0, 4)
            };

            recalcularPromedio(updatedState);
          } else {
            const defaultState = {
              ...initialFormState,
              apellidos_nombres: nombreCompleto
            };
            setFormData(defaultState);
            if (setFichaData) setFichaData(defaultState);
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

  const recalcularPromedio = (baseForm) => {
    const keys = ['nota_ser', 'nota_saber', 'nota_hacer', 'nota_decidir'];
    const notas = keys.map(k => parseFloat(baseForm[k])).filter(n => !isNaN(n) && n > 0);
    const prom = notas.length > 0 ? parseFloat((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)) : 0;

    const updated = {
      ...baseForm,
      promedio_numeral: prom,
      promedio_final: prom,
      promedio_literal: convertirNumeroALiteral(prom)
    };

    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  const handleNotaDimensionChange = (key, val) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = '';
    else if (num < 0) num = 0;
    else if (num > 100) num = 100;

    const updated = { ...formData, [key]: num };
    recalcularPromedio(updated);
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
      const res = await fichaB55toAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
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
      const res = await fichaB55toAnoService.delete(estudianteSeleccionado.id);
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
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-5: SEGUIMIENTO Y APOYO DE LA/EL DOCENTE GUÍA (5TO AÑO)"} footer={footerButtons}>
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
                  FICHA B-5 - SEGUIMIENTO DOCENTE GUÍA
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

              

              <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200 text-slate-700 text-[11px] leading-relaxed">
                La/el docente guía realiza seguimiento a la/el estudiante integrante del ECTG, evaluando antes de la finalización de la PEC según las 4 dimensiones (SER, SABER, HACER y DECIDIR).
              </div>

              {/* MATRIZ DE EVALUACIÓN POR DIMENSIÓN (2 INPUTS POR ÁREA) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
                <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
                  CRITERIOS DE EVALUACIÓN (SER, SABER, HACER, DECIDIR)
                </span>

                {dimensionesList.map((dim) => (
                  <div key={dim.key} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="bg-rose-50/80 p-2 rounded-xl border border-rose-200">
                      <span className="font-black text-[#801B28] text-[11px] uppercase tracking-wider block">
                        DIMENSIÓN: {dim.nombre}
                      </span>
                    </div>

                    {/* Criterios descriptivos agrupados */}
                    <ul className="list-disc pl-5 space-y-1 text-slate-700 text-[11px] font-medium">
                      {dim.criterios.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>

                    {/* 2 Inputs por Dimensión */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start pt-2 border-t border-slate-200">
                      <div className="sm:col-span-8">
                        <label className="block font-bold text-slate-700 text-[10px] mb-1">
                          Observación / Recomendación ({dim.nombre}):
                        </label>
                        <textarea
                          rows="2"
                          placeholder="Observaciones o recomendaciones específicas..."
                          value={formData[`obs_${dim.key}`] || ''}
                          onChange={(e) => handleCampoChange(`obs_${dim.key}`, e.target.value)}
                          className="w-full border border-slate-300 p-2.5 rounded-xl bg-white text-[11px] text-slate-800 focus:border-[#801B28] outline-none shadow-sm"
                        />
                      </div>

                      <div className="sm:col-span-4 flex flex-col items-end">
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                          VALORACIÓN DEL 1 A 100
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0-100"
                          value={formatInputValue(formData[`nota_${dim.key}`])}
                          onChange={(e) => handleNotaDimensionChange(`nota_${dim.key}`, e.target.value)}
                          className="w-full border-2 border-slate-300 p-2 rounded-xl text-center font-mono font-black text-sm bg-white focus:border-[#801B28] outline-none text-slate-900 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* PROMEDIO NUMERAL Y LITERAL */}
                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">PROMEDIO NUMERAL:</label>
                    <div className="font-mono font-black text-2xl text-[#801B28]">
                      {formatInputValue(formData.promedio_numeral) || '0'} / 100 PTS
                    </div>
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">LITERAL:</label>
                    <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">{formData.promedio_literal}</div>
                  </div>
                </div>

                {/* OBSERVACIONES / SUGERENCIAS GENERALES */}
                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-1 uppercase">Observaciones / Sugerencias Generales:</label>
                  <textarea
                    rows="3"
                    value={formData.observaciones_sugerencias}
                    onChange={(e) => handleCampoChange('observaciones_sugerencias', e.target.value)}
                    placeholder="Escriba observaciones o sugerencias generales respecto al desempeño del practicante..."
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
        titulo="¿Eliminar Ficha B-5?"
        mensaje="Esta acción borrará de forma permanente el registro de la Ficha B-5 de 5to Año."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};