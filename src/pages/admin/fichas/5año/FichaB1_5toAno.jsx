import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { GraduationCap, MapPin, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaB15toAnoService } from '../../../../services/fichas/5año/fichaB15toAnoService';

export const FichaB1_5toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "5_B1";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const semanas = Array.from({ length: 10 }, (_, i) => i + 1);

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
    apellidos_nombres: '',
    semanas_data: {},
    fecha_inicio_pec: '',
    fecha_conclusion_pec: '',
    total_dias: 0,
    total_faltas: 0,
    total_atrasos: 0,
    porcentaje_asistencia: '',
    valoracion_100: '',
    promedio_numeral: 100,
    promedio_literal: 'CIEN CON 00/100',
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
          const res = await fichaB15toAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();

          if (res.existe && res.datos) {
            const d = res.datos;
            const updatedState = {
              ...initialFormState,
              ...d,
              apellidos_nombres: nombreCompleto,
              semanas_data: d.semanas_data || {},
              fecha_inicio_pec: d.fecha_inicio_pec ? String(d.fecha_inicio_pec).slice(0, 10) : '',
              fecha_conclusion_pec: d.fecha_conclusion_pec ? String(d.fecha_conclusion_pec).slice(0, 10) : '',
              valoracion_100: d.valoracion_100 ?? 100,
              promedio_numeral: d.valoracion_100 ?? 100,
              promedio_literal: convertirNumeroALiteral(d.valoracion_100 ?? 100),
              lugar_ciudad: d.lugar_ciudad || 'El Alto',
              departamento: d.departamento || DEPARTAMENTOS_BOLIVIA[0],
              dia: d.dia || String(new Date().getDate()),
              mes: d.mes || MESES_ANIO[new Date().getMonth()],
              ano: String(d.ano || '2026').slice(0, 4)
            };

            setFormData(updatedState);
            if (setFichaData) setFichaData(updatedState);
          } else {
            const defaultState = {
              ...initialFormState,
              apellidos_nombres: nombreCompleto
            };
            setFormData(defaultState);
            if (setFichaData) setFichaData(defaultState);
          }
        } catch (error) {
          mostrarNotificacion("Error", error.message || "No se pudo consultar la Ficha B-1.", "error");
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

  const handleSemanaChange = (numSemana, field, val) => {
    const newSemanas = {
      ...(formData.semanas_data || {}),
      [numSemana]: {
        ...(formData.semanas_data?.[numSemana] || {}),
        [field]: val
      }
    };

    let tDias = 0;
    let tFaltas = 0;
    let tAtrasos = 0;

    Object.values(newSemanas).forEach(s => {
      tDias += parseFloat(s.dias || 0);
      tFaltas += parseFloat(s.faltas || 0);
      tAtrasos += parseFloat(s.atrasos || 0);
    });

    const updated = {
      ...formData,
      semanas_data: newSemanas,
      total_dias: tDias,
      total_faltas: tFaltas,
      total_atrasos: tAtrasos
    };

    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  const handleCampoChange = (key, value) => {
    let updated = { ...formData, [key]: value };

    if (key === 'valoracion_100') {
      let num = parseFloat(value);
      if (isNaN(num)) num = '';
      else if (num < 0) num = 0;
      else if (num > 100) num = 100;

      updated.valoracion_100 = num;
      updated.promedio_numeral = num || 0;
      updated.promedio_literal = convertirNumeroALiteral(num || 0);
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
      const res = await fichaB15toAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "Ficha B-1 guardada correctamente.", "success");
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
      const res = await fichaB15toAnoService.delete(estudianteSeleccionado.id);
      const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      const clearedData = {
        ...initialFormState,
        apellidos_nombres: nombreCompleto
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "La Ficha B-1 fue eliminada con éxito.", "success");
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
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-1: CONTROL DE ASISTENCIA DE LA PRÁCTICA EDUCATIVA COMUNITARIA (PEC)"} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando Ficha B-1...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <span className="font-extrabold text-[#801B28] uppercase text-xs">
                  FICHA B-1 - CONTROL DE ASISTENCIA PEC
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
              <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200 text-slate-700 text-[11px]">
                La presente ficha debe ser sellada de forma semanal por la/el docente guía de la UE/CEA/CEE, debiendo la o el estudiante practicante contar con el registro gradual de su ficha de acompañamiento.
              </div>

              {/* CONTROL POR CADA SEMANA (1 A 10) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
                <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
                  REGISTRO DE ACTIVIDADES Y ASISTENCIA SEMANAL (10 SEMANAS)
                </span>

                <div className="space-y-3">
                  {semanas.map((sem) => (
                    <div key={sem} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                      <span className="font-black text-[#801B28] text-[11px] uppercase block">
                        SEMANA {sem}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-600">Días de asistencia:</label>
                          <input
                            type="number"
                            placeholder="Días"
                            max="100"
                            min="0"
                            step="any"
                            value={formatInputValue(formData.semanas_data?.[sem]?.dias)}
                            onChange={(e) => handleSemanaChange(sem, 'dias', e.target.value)}
                            className="w-full border p-1.5 rounded-lg bg-white font-mono font-bold outline-none focus:border-[#801B28]"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-600">Faltas (Cantidad de días):</label>
                          <input
                            type="number"
                            placeholder="Faltas"
                            max="100"
                            min="0"
                            step="any"
                            value={formatInputValue(formData.semanas_data?.[sem]?.faltas)}
                            onChange={(e) => handleSemanaChange(sem, 'faltas', e.target.value)}
                            className="w-full border p-1.5 rounded-lg bg-white font-mono font-bold outline-none focus:border-[#801B28]"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-600">Atrasos (Minutos):</label>
                          <input
                            type="number"
                            placeholder="Minutos"
                            max="100"
                            min="0"
                            step="any"
                            value={formatInputValue(formData.semanas_data?.[sem]?.atrasos)}
                            onChange={(e) => handleSemanaChange(sem, 'atrasos', e.target.value)}
                            className="w-full border p-1.5 rounded-lg bg-white font-mono font-bold outline-none focus:border-[#801B28]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-600 mb-0.5">
                          Breve detalle de actividades realizadas por la/el estudiante practicante, en el marco la implementación de la propuesta educativa:
                        </label>
                        <textarea
                          rows="2"
                          value={formData.semanas_data?.[sem]?.detalle || ''}
                          onChange={(e) => handleSemanaChange(sem, 'detalle', e.target.value)}
                          className="w-full border p-2 rounded-xl text-[10px] bg-white outline-none focus:border-[#801B28]"
                          placeholder="Describa las actividades..."
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* RESUMEN FINAL Y VALORACIÓN */}
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
                  <span className="font-extrabold text-amber-900 uppercase text-[11px] block border-b border-amber-200 pb-1">
                    RESUMEN GENERAL Y TOTALES
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 text-[10px] mb-1">Fecha de inicio de la PEC:</label>
                      <input type="date" value={formData.fecha_inicio_pec} onChange={(e) => handleCampoChange('fecha_inicio_pec', e.target.value)} className="w-full border p-2 rounded-xl bg-white outline-none focus:border-[#801B28]" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 text-[10px] mb-1">Fecha de conclusión de la PEC:</label>
                      <input type="date" value={formData.fecha_conclusion_pec} onChange={(e) => handleCampoChange('fecha_conclusion_pec', e.target.value)} className="w-full border p-2 rounded-xl bg-white outline-none focus:border-[#801B28]" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 text-[10px]">Total días: {formatInputValue(formData.total_dias)}</label>
                      <label className="block font-bold text-slate-700 text-[10px]">Total Faltas: {formatInputValue(formData.total_faltas)}</label>
                      <label className="block font-bold text-slate-700 text-[10px]">Total Atrasos: {formatInputValue(formData.total_atrasos)}</label>
                    </div>
                    
                    {/* CAMPO EDITABLE DE PORCENTAJE DE ASISTENCIA */}
                    <div>
                      <label className="block font-bold text-slate-700 text-[10px] mb-1">Porcentaje total de asistencia (%):</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          placeholder="Ej. 100"
                          value={formatInputValue(formData.porcentaje_asistencia)}
                          onChange={(e) => handleCampoChange('porcentaje_asistencia', e.target.value)}
                          className="w-full border p-2 rounded-xl font-mono font-bold bg-white text-slate-900 focus:border-[#801B28] outline-none"
                        />
                        <span className="font-mono font-bold text-slate-700 text-xs">/ 100%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Valoración sobre 100 puntos:</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={formatInputValue(formData.valoracion_100)}
                      onChange={(e) => handleCampoChange('valoracion_100', e.target.value)}
                      className="w-full border p-2 rounded-xl font-mono font-bold bg-white text-slate-900 focus:border-[#801B28] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* LUGAR Y FECHA DE EMISIÓN */}
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
        titulo="¿Eliminar Ficha B-1?"
        mensaje="Esta acción borrará de forma permanente el registro de la Ficha B-1 de 5to Año."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};