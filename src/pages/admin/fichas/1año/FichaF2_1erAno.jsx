import React, { useState, useEffect } from 'react';
import { ModalBase } from './ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { MapPin, Calendar, UserCheck, Building, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM } from '../../../../utils/camposFichas';
import { fichaF2Service } from '../../../../services/fichas/1año/fichaF2Service';

export const FichaF2_1erAno = ({ isOpen, onClose, fichaData, setFichaData, listaDocentes = [], estudianteSeleccionado }) => {
  const codigoFicha = "1_F2";
  const config = CONFIGURACION_FICHAS[codigoFicha];
  const numDias = config?.diasPredeterminados || 5;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  const initialDias = Array.from({ length: numDias }, (_, i) => ({ dia: `Día ${i + 1}`, detalle: '' }));

  const initialFormState = {
    apellidos_nombres: '',
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    especialidad: ESPECIALIDADES_ESFM[0],
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    ano: '2026',
    fecha_inicio_pec: '',
    fecha_conclusion_pec: '',
    total_dias: String(numDias),
    total_faltas: '0',
    total_atrasos: '0',
    porcentaje_asistencia: '',
    valoracion_100: '',
    dias: initialDias,
    docente_guia_id: '',
    director_ue_nombre: ''
  };

  const [formData, setFormData] = useState({
    ...initialFormState,
    ...fichaData
  });

  // Función para limpiar la fecha estricta a YYYY-MM-DD
  const formatFechaInput = (fechaStr) => {
    if (!fechaStr) return '';
    return String(fechaStr).includes('T') ? String(fechaStr).split('T')[0] : String(fechaStr).substring(0, 10);
  };

  // Función para formatear porcentaje: elimina ".00" pero mantiene ".5" o ".25"
  const formatPorcentaje = (valor) => {
    if (valor === null || valor === undefined || valor === '') return '100';
    return String(parseFloat(valor));
  };

  // Cargar Ficha F-2 desde la API
  useEffect(() => {
    const fetchFicha = async () => {
      if (isOpen && estudianteSeleccionado?.id) {
        setLoading(true);
        try {
          const res = await fichaF2Service.getByEstudiante(estudianteSeleccionado.id);
          if (res.existe && res.datos) {
            const d = res.datos;
            const loadedDias = [
              { dia: 'Día 1', detalle: d.actividades_dia1 || '' },
              { dia: 'Día 2', detalle: d.actividades_dia2 || '' },
              { dia: 'Día 3', detalle: d.actividades_dia3 || '' },
              { dia: 'Día 4', detalle: d.actividades_dia4 || '' },
              { dia: 'Día 5', detalle: d.actividades_dia5 || '' }
            ];

            setFormData(prev => ({
              ...prev,
              ...d,
              fecha_inicio_pec: formatFechaInput(d.fecha_inicio_pec || d.fecha_inicio),
              fecha_conclusion_pec: formatFechaInput(d.fecha_conclusion_pec || d.fecha_conclusion),
              total_dias: String(d.total_dias ?? numDias),
              total_faltas: String(d.total_faltas ?? '0'),
              total_atrasos: String(d.total_atrasos ?? '0'),
              porcentaje_asistencia: formatPorcentaje(d.porcentaje_asistencia),
              valoracion_100: String(Number(d.valoracion_100 ?? 100)),
              dias: loadedDias,
              lugar_ciudad: d.lugar_ciudad || 'El Alto',
              departamento: d.departamento || DEPARTAMENTOS_BOLIVIA[0],
              dia: d.dia || String(new Date().getDate()),
              mes: d.mes || MESES_ANIO[new Date().getMonth()],
              ano: String(d.ano || '2026').slice(0, 4),
              apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
              especialidad: d.especialidad || estudianteSeleccionado.especialidad || prev.especialidad
            }));
            if (setFichaData) setFichaData(d);
          } else {
            const defaultState = {
              ...initialFormState,
              apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
              especialidad: estudianteSeleccionado.especialidad || initialFormState.especialidad
            };
            setFormData(prev => ({ ...prev, ...defaultState }));
          }
        } catch (error) {
          mostrarNotificacion("Error", error.message || "No se pudo conectar con el servidor.", "error");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchFicha();
  }, [isOpen, estudianteSeleccionado]);

  // Actualizar estado si cambian las dependencias (respetando los formatos limpios al final)
  useEffect(() => {
    if (estudianteSeleccionado) {
      setFormData(prev => {
        const mergedData = { ...prev, ...fichaData };
        return {
          ...mergedData,
          apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
          especialidad: estudianteSeleccionado.especialidad || mergedData.especialidad,
          fecha_inicio_pec: formatFechaInput(mergedData.fecha_inicio_pec || mergedData.fecha_inicio),
          fecha_conclusion_pec: formatFechaInput(mergedData.fecha_conclusion_pec || mergedData.fecha_conclusion),
          porcentaje_asistencia: formatPorcentaje(mergedData.porcentaje_asistencia)
        };
      });
    }
  }, [estudianteSeleccionado, fichaData]);

  const mostrarNotificacion = (titulo, mensaje, tipo = 'info') => {
    setModalNotif({ isOpen: true, titulo, mensaje, tipo });
  };

  const handleCampoChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  // Handler para restringir el porcentaje de asistencia entre 0 y 100
  const handlePorcentajeChange = (value) => {
    if (value === '') {
      handleCampoChange('porcentaje_asistencia', '');
      return;
    }
    const num = parseFloat(value);
    if (isNaN(num)) return;

    const clamped = Math.min(100, Math.max(0, num));
    handleCampoChange('porcentaje_asistencia', String(clamped));
  };

  // Handler para restringir estrictamente la nota entre 0 y 100
  const handleNotaChange = (value) => {
    if (value === '') {
      handleCampoChange('valoracion_100', '');
      return;
    }
    const num = parseInt(value, 10);
    if (isNaN(num)) return;
    
    // Clampear nota entre 0 y 100
    const clamped = Math.min(100, Math.max(0, num));
    handleCampoChange('valoracion_100', String(clamped));
  };

  const handleDiaChange = (idx, value) => {
    const list = [...formData.dias];
    list[idx].detalle = value;
    handleCampoChange('dias', list);
  };

  // Guardar Ficha F2
  const handleSave = async () => {
    if (!estudianteSeleccionado?.id) {
      mostrarNotificacion("Estudiante No Seleccionado", "Debe seleccionar un estudiante antes de guardar.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        actividades_dia1: formData.dias[0]?.detalle || '',
        actividades_dia2: formData.dias[1]?.detalle || '',
        actividades_dia3: formData.dias[2]?.detalle || '',
        actividades_dia4: formData.dias[3]?.detalle || '',
        actividades_dia5: formData.dias[4]?.detalle || '',
      };

      const res = await fichaF2Service.saveOrUpdate(estudianteSeleccionado.id, payload);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "La Ficha F-2 fue registrada correctamente.", "success");
    } catch (error) {
      mostrarNotificacion("Error al Guardar", error.message || "No se pudieron guardar los datos.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Eliminar y Resetear
  const ejecutarEliminacion = async () => {
    if (!estudianteSeleccionado?.id) return;

    setDeleting(true);
    try {
      const res = await fichaF2Service.delete(estudianteSeleccionado.id);
      const clearedData = {
        ...initialFormState,
        apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
        especialidad: estudianteSeleccionado.especialidad || initialFormState.especialidad
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "Ficha eliminada con éxito.", "success");
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
        {saving ? "Guardando..." : "Guardar Ficha F-2"}
      </button>
    </div>
  );

  return (
    <>
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando información...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <h4 className="font-extrabold text-[#801B28] uppercase text-sm">
                  {config?.titulo || "FICHA F-2: INFORME DE LA SEMANA"}
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

              {/* TABLA DE BREVE INFORME DE ACTIVIDADES DE LA SEMANA */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                <span className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                  <Calendar size={15} className="text-[#801B28]" /> BREVE INFORME DE ACTIVIDADES DE LA SEMANA
                </span>

                <div className="space-y-2">
                  {formData.dias.map((d, idx) => (
                    <div key={idx} className="flex gap-2 items-start bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="font-mono font-black text-slate-800 w-14 text-center pt-2 bg-slate-200/60 p-1.5 rounded-lg">
                        {d.dia}
                      </span>
                      <textarea
                        rows="2"
                        placeholder="Breve detalle de actividades realizadas por la/el estudiante..."
                        value={d.detalle}
                        onChange={(e) => handleDiaChange(idx, e.target.value)}
                        className="flex-1 border border-slate-200 p-2 rounded-lg bg-white text-slate-800 font-medium text-xs focus:border-[#801B28] outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* CUADRO DE CONTROL DE FECHAS, ASISTENCIA Y VALORACIÓN */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <label className="block font-extrabold text-slate-700 text-[10px] uppercase mb-1">Fecha de inicio de la PEC:</label>
                    <input
                      type="date"
                      value={formData.fecha_inicio_pec}
                      onChange={(e) => handleCampoChange('fecha_inicio_pec', e.target.value)}
                      className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-extrabold text-slate-700 text-[10px] uppercase mb-1">Fecha de conclusión de la PEC:</label>
                    <input
                      type="date"
                      value={formData.fecha_conclusion_pec}
                      onChange={(e) => handleCampoChange('fecha_conclusion_pec', e.target.value)}
                      className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Total días:</label>
                    <input
                      type="text"
                      value={formData.total_dias}
                      onChange={(e) => handleCampoChange('total_dias', e.target.value)}
                      className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold bg-white text-center"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Total Faltas:</label>
                    <input
                      type="text"
                      value={formData.total_faltas}
                      onChange={(e) => handleCampoChange('total_faltas', e.target.value)}
                      className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold bg-white text-center text-rose-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Total Atrasos:</label>
                    <input
                      type="text"
                      value={formData.total_atrasos}
                      onChange={(e) => handleCampoChange('total_atrasos', e.target.value)}
                      className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold bg-white text-center text-amber-600"
                    />
                  </div>
                  <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-200 text-center">
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Porcentaje total de asistencia:</label>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.porcentaje_asistencia}
                        onChange={(e) => handlePorcentajeChange(e.target.value)}
                        className="w-16 border border-rose-300 p-1 rounded-lg font-mono font-black text-center text-lg text-[#801B28] bg-white"
                      />
                      <span className="font-extrabold text-[#801B28] text-sm">/ 100%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <label className="block font-extrabold text-slate-800 text-[11px] uppercase mb-1">Valoración sobre 100 puntos:</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.valoracion_100}
                    onChange={(e) => handleNotaChange(e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-xl font-mono font-black text-lg text-[#801B28] bg-white focus:border-[#801B28] outline-none"
                    placeholder="Puntaje de 0 a 100..."
                  />
                </div>
              </div>

              {/* LUGAR Y FECHA DE EMISIÓN */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
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

      {/* MODAL NOTIFICACIÓN */}
      <ConfirmModal
        isOpen={modalNotif.isOpen}
        onClose={() => setModalNotif({ ...modalNotif, isOpen: false })}
        titulo={modalNotif.titulo}
        mensaje={modalNotif.mensaje}
        tipo={modalNotif.tipo}
      />

      {/* MODAL CONFIRMACIÓN ELIMINAR */}
      <ConfirmModal
        isOpen={modalConfirmDelete}
        onClose={() => setModalConfirmDelete(false)}
        onConfirm={ejecutarEliminacion}
        titulo="¿Eliminar Ficha F-2?"
        mensaje="Esta acción eliminará el registro de la Ficha F-2 de la base de datos de manera permanente."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};