import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { GraduationCap, MapPin, Award, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { centralizador3erAnoService } from '../../../../services/fichas/3año/centralizador3erAnoService';
import { especialidadService } from '../../../../services/especialidadService';

export const Centralizador3erAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "CENTRALIZADOR";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const camposNotas = [
    { key: 'nota_a1', label: 'Técnicas e instrumentos de investigación', ficha: 'A-1', etapa: 'Etapa preparatoria' },
    { key: 'nota_b1', label: 'Apoyo – seguimiento del Docente Acompañante de la ESFM/UA', ficha: 'B-1', etapa: 'Etapa de ejecución' },
    { key: 'nota_b2', label: 'Asistencia práctica educativa comunitaria.', ficha: 'B-2', etapa: 'Etapa de ejecución' },
    { key: 'nota_b3', label: 'Apoyo - Seguimiento del docente guía de la UE/CEA/CEE, en la concreción curricular.', ficha: 'B-3', etapa: 'Etapa de ejecución' },
    { key: 'nota_b4', label: 'Seguimiento y apoyo del docente tutor/acompañante', ficha: 'B-4', etapa: 'Etapa de ejecución' },
    { key: 'nota_b5', label: 'Presentación del informe diagnóstico socioparticipativo', ficha: 'B-5', etapa: 'Etapa de producción' }
  ];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [listaEspecialidades, setListaEspecialidades] = useState(ESPECIALIDADES_ESFM);
  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  const formatInputValue = (val) => {
    if (val === null || val === undefined || val === '') return '0';
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return num % 1 === 0 ? String(Math.round(num)) : String(num);
  };

  const initialFormState = {
    apellidos_nombres: '',
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    especialidad: ESPECIALIDADES_ESFM[0],
    observaciones: '',
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    ano: '2026',
    nota_a1: '0',
    nota_b1: '0',
    nota_b2: '0',
    nota_b3: '0',
    nota_b4: '0',
    nota_b5: '0',
    promedio_numeral: '0',
    promedio_literal: 'CERO CON 00/100'
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

  const calcularPromedioAutomatico = (stateObj) => {
    const keys = ['nota_a1', 'nota_b1', 'nota_b2', 'nota_b3', 'nota_b4', 'nota_b5'];
    const notas = keys.map(k => parseFloat(stateObj[k])).filter(n => !isNaN(n));
    const prom = notas.length > 0 ? parseFloat((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)) : 0;
    
    return {
      promedio_numeral: formatInputValue(prom),
      promedio_literal: convertirNumeroALiteral(prom)
    };
  };

  useEffect(() => {
    const fetchCentralizador = async () => {
      if (isOpen && estudianteSeleccionado?.id) {
        setLoading(true);
        try {
          const res = await centralizador3erAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
          const espEstudiante = estudianteSeleccionado.especialidad || listaEspecialidades[0] || ESPECIALIDADES_ESFM[0];

          if (res.existe && res.datos) {
            const d = res.datos;
            const updatedState = {
              ...initialFormState,
              ...d,
              apellidos_nombres: nombreCompleto,
              esfm_ua: d.esfm_ua || 'ESFM Simón Bolívar / UA El Alto',
              especialidad: d.especialidad || espEstudiante,
              nota_a1: formatInputValue(d.nota_a1),
              nota_b1: formatInputValue(d.nota_b1),
              nota_b2: formatInputValue(d.nota_b2),
              nota_b3: formatInputValue(d.nota_b3),
              nota_b4: formatInputValue(d.nota_b4),
              nota_b5: formatInputValue(d.nota_b5),
              observaciones: d.observaciones || '',
              lugar_ciudad: d.lugar_ciudad || 'El Alto',
              departamento: d.departamento || DEPARTAMENTOS_BOLIVIA[0],
              dia: d.dia || String(new Date().getDate()),
              mes: d.mes || MESES_ANIO[new Date().getMonth()],
              ano: String(d.ano || '2026').slice(0, 4)
            };

            const calcProm = calcularPromedioAutomatico(updatedState);
            updatedState.promedio_numeral = calcProm.promedio_numeral;
            updatedState.promedio_literal = calcProm.promedio_literal;

            setFormData(updatedState);
            if (setFichaData) setFichaData(updatedState);
          } else {
            const defaultState = {
              ...initialFormState,
              apellidos_nombres: nombreCompleto,
              especialidad: espEstudiante
            };
            setFormData(prev => ({ ...prev, ...defaultState }));
          }
        } catch (error) {
          mostrarNotificacion("Error", error.message || "No se pudo consultar el centralizador.", "error");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCentralizador();
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

  const handleCampoChange = (key, value) => {
    const updated = { ...formData, [key]: value };

    // Si se modifica alguna nota manualmente, se recalcula el promedio automáticamente
    if (key.startsWith('nota_')) {
      const calcProm = calcularPromedioAutomatico(updated);
      updated.promedio_numeral = calcProm.promedio_numeral;
      updated.promedio_literal = calcProm.promedio_literal;
    }

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
      const res = await centralizador3erAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "El centralizador de evaluación se guardó correctamente.", "success");
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
      const res = await centralizador3erAnoService.delete(estudianteSeleccionado.id);
      const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      const clearedData = {
        ...initialFormState,
        apellidos_nombres: nombreCompleto,
        especialidad: estudianteSeleccionado.especialidad || listaEspecialidades[0] || ESPECIALIDADES_ESFM[0]
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "El centralizador fue eliminado con éxito.", "success");
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
        {saving ? "Guardando..." : "Guardar Centralizador"}
      </button>
    </div>
  );

  return (
    <>
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "CENTRALIZADOR DE LA EVALUACIÓN"} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando centralizador de evaluación...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <h4 className="font-extrabold text-[#801B28] uppercase text-sm flex items-center gap-2">
                  <Award size={18} /> CENTRALIZADOR DE LA EVALUACIÓN
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
                  <GraduationCap size={15} /> DATOS REFERENCIALES:
                </span>
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="flex items-center gap-2">
                    <label className="font-bold text-slate-700 text-[11px] whitespace-nowrap">ESFM/UA:</label>
                    <input
                      type="text"
                      value={formData.esfm_ua}
                      onChange={(e) => handleCampoChange('esfm_ua', e.target.value)}
                      className="w-full border-b border-dashed border-amber-400 bg-transparent px-2 py-1 font-bold text-slate-800 outline-none focus:border-[#801B28]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="font-bold text-slate-700 text-[11px] whitespace-nowrap">Apellido(s) y Nombre(s) del(a) estudiante:</label>
                    <input
                      type="text"
                      value={formData.apellidos_nombres}
                      onChange={(e) => handleCampoChange('apellidos_nombres', e.target.value)}
                      className="w-full border-b border-dashed border-amber-400 bg-transparent px-2 py-1 font-extrabold text-slate-900 outline-none focus:border-[#801B28]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="font-bold text-slate-700 text-[11px] whitespace-nowrap">Especialidad:</label>
                    <select
                      value={formData.especialidad}
                      onChange={(e) => handleCampoChange('especialidad', e.target.value)}
                      className="w-full border-b border-dashed border-amber-400 bg-white px-2 py-1 font-bold text-slate-800 outline-none focus:border-[#801B28]"
                    >
                      {listaEspecialidades.map((e, idx) => (
                        <option key={idx} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* TABLA DEL CENTRALIZADOR SEGÚN DISEÑO */}
              <div className="bg-white rounded-2xl border border-slate-300 overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#9CA777] text-slate-900 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-400 text-center">
                      <th className="p-2.5 border-r border-slate-400 w-1/4">Etapa</th>
                      <th className="p-2.5 border-r border-slate-400">Actividades</th>
                      <th className="p-2.5 border-r border-slate-400 w-20">Ficha</th>
                      <th className="p-2.5 w-32">Puntaje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 font-medium text-slate-800 border-b border-slate-300">
                    {camposNotas.map((c, idx) => (
                      <tr key={c.key} className="hover:bg-slate-50 transition-colors">
                        {idx === 0 && (
                          <td rowSpan={1} className="p-2.5 font-extrabold text-slate-900 align-middle border-r border-slate-300 text-[11px]">
                            {c.etapa}
                          </td>
                        )}
                        {idx === 1 && (
                          <td rowSpan={4} className="p-2.5 font-extrabold text-slate-900 align-middle border-r border-slate-300 text-[11px]">
                            {c.etapa}
                          </td>
                        )}
                        {idx === 5 && (
                          <td rowSpan={1} className="p-2.5 font-extrabold text-slate-900 align-middle border-r border-slate-300 text-[11px]">
                            {c.etapa}
                          </td>
                        )}
                        <td className="p-2.5 leading-snug border-r border-slate-300">{c.label}</td>
                        <td className="p-2.5 text-center font-extrabold font-mono text-slate-800 border-r border-slate-300">{c.ficha}</td>
                        <td className="p-1.5 text-center">
                          <input
                            type="number"
                            readOnly
                            min="0"
                            max="100"
                            step="0.1"
                            value={formData[c.key] ?? ''}
                            onChange={(e) => handleCampoChange(c.key, e.target.value)}
                            className="w-full border border-slate-300 p-1.5 rounded font-mono font-bold text-center text-slate-900 bg-white focus:border-[#801B28] outline-none"
                          />
                        </td>
                      </tr>
                    ))}

                    {/* FILA DE PROMEDIO NÚMERO ENTERO (SOLO LECTURA) */}
                    <tr className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-400">
                      <td colSpan={3} className="p-3 text-left border-r border-slate-300 text-[11px] uppercase">
                        Promedio (Número entero)
                      </td>
                      <td className="p-3 text-center font-mono font-black text-sm text-[#801B28] bg-rose-50/50">
                        {formatInputValue(formData.promedio_numeral)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SECCIÓN PROMEDIO LITERAL (SOLO LECTURA) */}
              <div className="bg-white p-3 rounded-2xl border border-slate-300 flex items-center gap-3">
                <span className="font-extrabold text-slate-800 text-[11px] uppercase whitespace-nowrap">Literal:</span>
                <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wide border-b border-dashed border-slate-400 w-full py-0.5">
                  {formData.promedio_literal || 'CERO CON 00/100'}
                </span>
              </div>

              {/* OBSERVACIONES Y/O SUGERENCIAS */}
              <div className="bg-white rounded-2xl border border-slate-300 overflow-hidden">
                <div className="bg-[#9CA777] text-slate-900 font-extrabold text-center py-2 text-[11px] uppercase border-b border-slate-400">
                  OBSERVACIONES Y/O SUGERENCIAS:
                </div>
                <div className="p-3">
                  <textarea
                    rows="3"
                    value={formData.observaciones}
                    onChange={(e) => handleCampoChange('observaciones', e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-xl font-medium text-slate-800 text-xs outline-none focus:border-[#801B28]"
                    placeholder="Escriba aquí sus observaciones o sugerencias..."
                  />
                </div>
              </div>

              {/* LUGAR Y FECHA */}
              <div className="bg-white p-4 rounded-2xl border border-slate-300 space-y-3">
                <span className="font-extrabold text-[#801B28] uppercase text-[11px] flex items-center gap-1.5">
                  <MapPin size={14} /> LUGAR Y FECHA DE EMISIÓN
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Ciudad / Localidad:</label>
                    <input type="text" value={formData.lugar_ciudad} onChange={(e) => handleCampoChange('lugar_ciudad', e.target.value)} className="w-full border p-2 rounded-xl bg-white text-slate-800 font-bold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Departamento:</label>
                    <select value={formData.departamento} onChange={(e) => handleCampoChange('departamento', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold">
                      {DEPARTAMENTOS_BOLIVIA.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Día:</label>
                    <input type="text" value={formData.dia} onChange={(e) => handleCampoChange('dia', e.target.value)} className="w-full border p-2 rounded-xl font-mono font-bold bg-white text-slate-800" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Mes:</label>
                    <select value={formData.mes} onChange={(e) => handleCampoChange('mes', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold uppercase">
                      {MESES_ANIO.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Año:</label>
                    <input type="text" value={formData.ano} onChange={(e) => handleCampoChange('ano', e.target.value)} className="w-full border p-2 rounded-xl font-mono font-bold bg-white text-slate-800" />
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
        titulo="¿Eliminar Centralizador de Evaluación?"
        mensaje="Esta acción borrará de forma permanente el registro del centralizador."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};