import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { MapPin, Calendar, UserCheck, Award, GraduationCap, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaF2_2doAnoService } from '../../../../services/fichas/2año/fichaF2_2doAnoService';
import { especialidadService } from '../../../../services/especialidadService';

export const FichaF2_2doAno = ({ isOpen, onClose, fichaData, setFichaData, listaDocentes = [], estudianteSeleccionado }) => {
  const codigoFicha = "2_F2";
  const config = CONFIGURACION_FICHAS[codigoFicha];
  const numDias = config?.diasPredeterminados || 10;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [especialidadesList, setEspecialidadesList] = useState(ESPECIALIDADES_ESFM);

  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  const initialDias = Array.from({ length: numDias }, (_, i) => ({ dia: `Día ${i + 1}`, detalle: '', valoracion: '' }));

  const initialFormState = {
    apellidos_nombres: '',
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    especialidad: ESPECIALIDADES_ESFM[0] || '',
    ano_formacion: '2do Año',
    distrito_educativo: '',
    ue_cea_cee: '',
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
    porcentaje_asistencia: '100',
    valoracion_100: 0,
    promedio_literal: 'CERO CON 00/100',
    dias: initialDias,
    docente_guia_id: '',
    director_ue_nombre: ''
  };

  const [formData, setFormData] = useState({
    ...initialFormState,
    ...fichaData
  });

  const formatFechaInput = (fechaStr) => {
    if (!fechaStr) return '';
    return String(fechaStr).includes('T') ? String(fechaStr).split('T')[0] : String(fechaStr).substring(0, 10);
  };

  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const res = await especialidadService.getEspecialidades();
        if (Array.isArray(res) && res.length > 0) {
          const nombres = res.map(e => e.nombre || e.nombre_especialidad || e.especialidad).filter(Boolean);
          if (nombres.length > 0) setEspecialidadesList(nombres);
        } else if (res?.datos && Array.isArray(res.datos)) {
          const nombres = res.datos.map(e => e.nombre || e.nombre_especialidad || e.especialidad).filter(Boolean);
          if (nombres.length > 0) setEspecialidadesList(nombres);
        }
      } catch (error) {
        console.warn("Respaldo local para especialidades activado.", error);
      }
    };

    if (isOpen) {
      fetchEspecialidades();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchFicha = async () => {
      if (isOpen && estudianteSeleccionado?.id) {
        setLoading(true);
        try {
          const res = await fichaF2_2doAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
          const espEstudiante = estudianteSeleccionado.especialidad || initialFormState.especialidad;

          if (res.existe && res.datos) {
            const d = res.datos;
            const val100 = parseFloat(d.valoracion_100 || 0);

            setFormData(prev => ({
              ...prev,
              ...d,
              apellidos_nombres: nombreCompleto,
              especialidad: d.especialidad || espEstudiante,
              fecha_inicio_pec: formatFechaInput(d.fecha_inicio_pec),
              fecha_conclusion_pec: formatFechaInput(d.fecha_conclusion_pec),
              valoracion_100: val100,
              promedio_literal: d.promedio_literal || convertirNumeroALiteral(val100),
              dias: Array.isArray(d.dias) && d.dias.length > 0 ? d.dias : initialDias,
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
          mostrarNotificacion("Error", error.message || "No se pudo consultar la Ficha F-2.", "error");
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
        ano_formacion: estudianteSeleccionado.ano_formacion || prev.ano_formacion,
        ...fichaData,
        fecha_inicio_pec: formatFechaInput(fichaData?.fecha_inicio_pec || prev.fecha_inicio_pec),
        fecha_conclusion_pec: formatFechaInput(fichaData?.fecha_conclusion_pec || prev.fecha_conclusion_pec)
      }));
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

  const handleDiaChange = (idx, field, value) => {
    const list = [...formData.dias];
    
    if (field === 'valoracion') {
      let val = parseFloat(value);
      if (isNaN(val)) val = '';
      else if (val < 0) val = 0;
      else if (val > 100) val = 100;
      list[idx][field] = val;
    } else {
      list[idx][field] = value;
    }

    const notas = list.map(d => parseFloat(d.valoracion)).filter(n => !isNaN(n));
    const prom = notas.length > 0 ? parseFloat((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)) : 0;

    const updated = {
      ...formData,
      dias: list,
      valoracion_100: prom,
      promedio_numeral: prom,
      promedio_final: prom,
      promedio_literal: convertirNumeroALiteral(prom)
    };

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
      const res = await fichaF2_2doAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "La Ficha F-2 fue registrada correctamente.", "success");
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
      const res = await fichaF2_2doAnoService.delete(estudianteSeleccionado.id);
      const clearedData = {
        ...initialFormState,
        apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
        especialidad: estudianteSeleccionado.especialidad || initialFormState.especialidad
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "Ficha F-2 eliminada con éxito.", "success");
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
              <span className="font-bold text-slate-600">Cargando información de la ficha...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <h4 className="font-extrabold text-[#801B28] uppercase text-sm">
                  {config?.titulo || "FICHA F-2: SEGUIMIENTO DE ACTIVIDADES DÍA A DÍA"}
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
                  <GraduationCap size={15} /> DATOS REFERENCIALES DEL ESTUDIANTE
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Nombres y Apellidos:</label>
                    <input type="text" readOnly value={formData.apellidos_nombres} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-extrabold text-slate-900" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">ESFM/UA:</label>
                    <input type="text" value={formData.esfm_ua} onChange={(e) => handleCampoChange('esfm_ua', e.target.value)} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                    <select value={formData.especialidad} onChange={(e) => handleCampoChange('especialidad', e.target.value)} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold text-slate-800 cursor-pointer">
                      {especialidadesList.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* TABLA DE ACTIVIDADES Y NOTAS DIARIAS */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                <span className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                  <Calendar size={15} className="text-[#801B28]" /> ACTIVIDADES REALIZADAS Y VALORACIÓN DIARIA (10 DÍAS)
                </span>

                <div className="space-y-2">
                  {formData.dias.map((d, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="font-mono font-black text-slate-800 w-14 text-center bg-slate-200/60 p-2 rounded-lg text-xs">
                        {d.dia}
                      </span>
                      <textarea
                        rows="2"
                        placeholder="Detalle de actividades realizadas en el día..."
                        value={d.detalle || ''}
                        onChange={(e) => handleDiaChange(idx, 'detalle', e.target.value)}
                        className="flex-1 border border-slate-200 p-2 rounded-lg bg-white text-slate-800 font-medium text-xs focus:border-[#801B28] outline-none"
                      />
                      <div className="w-24 text-center">
                        <label className="block text-[9px] font-extrabold text-slate-500 uppercase mb-0.5">Nota Día:</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="0-100"
                          value={d.valoracion !== undefined && d.valoracion !== null ? d.valoracion : ''}
                          onChange={(e) => handleDiaChange(idx, 'valoracion', e.target.value)}
                          className="w-full border border-slate-300 p-1.5 rounded-lg bg-white font-mono font-bold text-center text-[#801B28] text-xs focus:border-[#801B28] outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CONTROL DE FECHAS Y VALORACIÓN PROMEDIO */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <label className="block font-extrabold text-slate-700 text-[10px] uppercase mb-1">Fecha inicio PEC:</label>
                    <input type="date" value={formData.fecha_inicio_pec} onChange={(e) => handleCampoChange('fecha_inicio_pec', e.target.value)} className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold text-slate-800" />
                  </div>
                  <div>
                    <label className="block font-extrabold text-slate-700 text-[10px] uppercase mb-1">Fecha conclusión PEC:</label>
                    <input type="date" value={formData.fecha_conclusion_pec} onChange={(e) => handleCampoChange('fecha_conclusion_pec', e.target.value)} className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold text-slate-800" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Total días:</label>
                    <input type="text" value={formData.total_dias} onChange={(e) => handleCampoChange('total_dias', e.target.value)} className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold bg-white text-center" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Total Faltas:</label>
                    <input type="text" value={formData.total_faltas} onChange={(e) => handleCampoChange('total_faltas', e.target.value)} className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold bg-white text-center text-rose-600" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Total Atrasos:</label>
                    <input type="text" value={formData.total_atrasos} onChange={(e) => handleCampoChange('total_atrasos', e.target.value)} className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold bg-white text-center text-amber-600" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">% Asistencia:</label>
                    <input type="text" value={formData.porcentaje_asistencia} onChange={(e) => handleCampoChange('porcentaje_asistencia', e.target.value)} className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold bg-white text-center text-emerald-600" />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase flex items-center gap-1">
                      <Award size={14} className="text-[#801B28]" /> Valoración sobre 100 Puntos (Promedio Automático):
                    </label>
                    <div className="font-mono font-black text-2xl text-[#801B28] mt-1">
                      {formData.valoracion_100 || '0.00'} / 100 PTS
                    </div>
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Literal:</label>
                    <div className="font-extrabold text-xs text-slate-900 uppercase mt-2">
                      {formData.promedio_literal || 'CERO CON 00/100'}
                    </div>
                  </div>
                </div>
              </div>

              

              {/* LUGAR Y FECHA */}
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
        titulo="¿Eliminar Ficha F-2?"
        mensaje="Esta acción eliminará la Ficha F-2 de la base de datos de manera permanente."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};