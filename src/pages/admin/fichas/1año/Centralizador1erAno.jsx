import React, { useState, useEffect } from 'react';
import { ModalBase } from './ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { GraduationCap, MapPin, Award, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { centralizador1erAnoService } from '../../../../services/fichas/1año/centralizador1erAnoService';
import { especialidadService } from '../../../../services/especialidadService';

export const Centralizador1erAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "CENTRALIZADOR";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const camposNotas = [
    { key: 'nota_f1', label: CONFIGURACION_FICHAS['1_F1']?.titulo || 'Diagnóstico Socioeducativo de la UE/CEA', ficha: 'F-1', etapa: 'Etapa Preparatoria' },
    { key: 'nota_f2', label: CONFIGURACION_FICHAS['1_F2']?.titulo || 'Informe Semanal de Actividades', ficha: 'F-2', etapa: 'Etapa de Ejecución' },
    { key: 'nota_f3', label: CONFIGURACION_FICHAS['1_F3']?.titulo || 'Valoración de Instrumentos de Investigación', ficha: 'F-3', etapa: 'Etapa de Ejecución' },
    { key: 'nota_f4', label: CONFIGURACION_FICHAS['1_F4']?.titulo || 'Evaluación por Dimensiones', ficha: 'F-4', etapa: 'Etapa de Ejecución' },
    { key: 'nota_f5', label: CONFIGURACION_FICHAS['1_F5']?.titulo || 'Evaluación de Producción y Sistematización', ficha: 'F-5', etapa: 'Etapa de Producción' }
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
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    ano: '2026',
    nota_f1: '0',
    nota_f2: '0',
    nota_f3: '0',
    nota_f4: '0',
    nota_f5: '0',
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
    const keys = ['nota_f1', 'nota_f2', 'nota_f3', 'nota_f4', 'nota_f5'];
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
          const res = await centralizador1erAnoService.getByEstudiante(estudianteSeleccionado.id);
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
              nota_f1: formatInputValue(d.nota_f1),
              nota_f2: formatInputValue(d.nota_f2),
              nota_f3: formatInputValue(d.nota_f3),
              nota_f4: formatInputValue(d.nota_f4),
              nota_f5: formatInputValue(d.nota_f5),
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
      const res = await centralizador1erAnoService.updateFecha(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "El centralizador de calificaciones se guardó correctamente.", "success");
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
      const res = await centralizador1erAnoService.deleteCentralizador(estudianteSeleccionado.id);
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
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "CENTRALIZADOR DE CALIFICACIONES"} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando centralizador de calificaciones...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 pb-2">
                <h4 className="font-extrabold text-[#801B28] uppercase text-sm flex items-center gap-2">
                  <Award size={18} /> {config?.titulo || "CENTRALIZADOR DE CALIFICACIONES"}
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

              {/* DATOS REFERENCIALES DEL ESTUDIANTE */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
                <span className="font-extrabold text-amber-900 uppercase text-[11px] flex items-center gap-1.5">
                  <GraduationCap size={15} /> DATOS REFERENCIALES DEL ESTUDIANTE:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Apellidos y nombres:</label>
                    <input
                      type="text"
                      value={formData.apellidos_nombres}
                      onChange={(e) => handleCampoChange('apellidos_nombres', e.target.value)}
                      className="w-full border border-amber-200 p-2 rounded-xl bg-white font-extrabold text-slate-900 outline-none focus:border-[#801B28]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">ESFM/UA:</label>
                    <input
                      type="text"
                      value={formData.esfm_ua}
                      onChange={(e) => handleCampoChange('esfm_ua', e.target.value)}
                      className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold text-slate-800 outline-none focus:border-[#801B28]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                    <select
                      value={formData.especialidad}
                      onChange={(e) => handleCampoChange('especialidad', e.target.value)}
                      className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold text-slate-800 outline-none focus:border-[#801B28]"
                    >
                      {listaEspecialidades.map((e, idx) => (
                        <option key={idx} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* TABLA DEL CENTRALIZADOR */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#801B28] text-white uppercase text-[10px] font-black tracking-wider">
                      <th className="p-2.5 border-b border-rose-900 w-1/4">ETAPA</th>
                      <th className="p-2.5 border-b border-rose-900">ACTIVIDADES / DOCUMENTOS DE EVALUACIÓN</th>
                      <th className="p-2.5 border-b border-rose-900 text-center w-20">FICHA</th>
                      <th className="p-2.5 border-b border-rose-900 text-center w-32">CALIFICACIÓN OBTENIDA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    {camposNotas.map((c) => (
                      <tr key={c.key} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2.5 font-bold bg-rose-50/40 text-slate-700 align-middle border-r border-slate-200 text-[10px]">
                          {c.etapa}
                        </td>
                        <td className="p-2.5 leading-snug">{c.label}</td>
                        <td className="p-2.5 text-center font-bold font-mono text-slate-700 border-x border-slate-200">{c.ficha}</td>
                        <td className="p-1.5 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={formData[c.key] ?? ''}
                            onChange={(e) => handleCampoChange(c.key, e.target.value)}
                            className="w-full border border-slate-300 p-1.5 rounded-lg font-mono font-bold text-center text-slate-900 bg-white focus:border-[#801B28] outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* CUADRO RESUMEN PROMEDIO CONSOLIDADO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <label className="block font-extrabold text-slate-500 uppercase text-[10px]">PROMEDIO TOTAL CONSOLIDADO:</label>
                  <div className="font-mono font-black text-2xl text-[#801B28] mt-1">
                    {formatInputValue(formData.promedio_numeral)} / 100 PTS
                  </div>
                </div>
                <div>
                  <label className="block font-extrabold text-slate-500 uppercase text-[10px]">PROMEDIO LITERAL:</label>
                  <div className="font-extrabold text-xs text-slate-800 uppercase mt-2">
                    {formData.promedio_literal || 'CERO CON 00/100'}
                  </div>
                </div>
              </div>

              {/* LUGAR Y FECHA DE EMISIÓN */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-[#801B28] uppercase text-[11px] flex items-center gap-1.5">
                  <MapPin size={14} /> LUGAR Y FECHA DE EMISIÓN DE LA CENTRALIZACIÓN
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

      {/* NOTIFICACIÓN */}
      <ConfirmModal
        isOpen={modalNotif.isOpen}
        onClose={() => setModalNotif({ ...modalNotif, isOpen: false })}
        titulo={modalNotif.titulo}
        mensaje={modalNotif.mensaje}
        tipo={modalNotif.tipo}
      />

      {/* CONFIRMAR ELIMINACIÓN */}
      <ConfirmModal
        isOpen={modalConfirmDelete}
        onClose={() => setModalConfirmDelete(false)}
        onConfirm={ejecutarEliminacion}
        titulo="¿Eliminar Centralizador de Calificaciones?"
        mensaje="Esta acción borrará de forma permanente el registro guardado de este centralizador."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};