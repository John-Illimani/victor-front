import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { MapPin, UserCheck, Save, Loader2, Trash, X, GraduationCap } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaB23erAnoService } from '../../../../services/fichas/3año/fichaB23erAnoService';
import { especialidadService } from '../../../../services/especialidadService';

// Helper para garantizar el formato YYYY-MM-DD que requiere <input type="date" />
const formatDateForInput = (val) => {
  if (!val) return '';
  const str = String(val).trim();
  return str.length >= 10 ? str.slice(0, 10) : str;
};

// Helper para formatear promedios y notas (enteros sin decimales, decimales tal cual)
const formatInputValue = (val) => {
  if (val === null || val === undefined || val === '') return '';
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  return num % 1 === 0 ? String(Math.round(num)) : String(num);
};

export const FichaB2_3erAno = ({ isOpen, onClose, fichaData, setFichaData, listaDocentes = [], estudianteSeleccionado }) => {
  const codigoFicha = "3_B2";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const semanasIniciales = [
    { semana: 'Semana 1', asistencia: '', inasistencia: '', atrasos: '', valoracion: '' },
    { semana: 'Semana 2', asistencia: '', inasistencia: '', atrasos: '', valoracion: '' },
    { semana: 'Semana 3', asistencia: '', inasistencia: '', atrasos: '', valoracion: '' },
    { semana: 'Semana 4', asistencia: '', inasistencia: '', atrasos: '', valoracion: '' },
  ];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [listaEspecialidades, setListaEspecialidades] = useState(ESPECIALIDADES_ESFM);
  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

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
    semanas: semanasIniciales,
    promedio_numeral: 0,
    promedio_literal: 'CERO CON 00/100',
    docente_guia_id: '',
    director_ue_nombre: ''
  };

  const [formData, setFormData] = useState({
    ...initialFormState,
    ...fichaData,
    fecha_inicio_pec: formatDateForInput(fichaData?.fecha_inicio_pec),
    fecha_conclusion_pec: formatDateForInput(fichaData?.fecha_conclusion_pec)
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
          const res = await fichaB23erAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
          const espEstudiante = estudianteSeleccionado.especialidad || listaEspecialidades[0] || ESPECIALIDADES_ESFM[0];

          if (res.existe && res.datos) {
            const d = res.datos;
            const semanasCargadas = Array.isArray(d.semanas) && d.semanas.length === 4 ? d.semanas : semanasIniciales;
            const promRaw = parseFloat(d.promedio_numeral || 0);
            const prom = promRaw % 1 === 0 ? Math.round(promRaw) : promRaw;

            setFormData(prev => ({
              ...prev,
              ...d,
              apellidos_nombres: nombreCompleto,
              especialidad: d.especialidad || espEstudiante,
              semanas: semanasCargadas,
              promedio_numeral: prom,
              promedio_literal: d.promedio_literal || convertirNumeroALiteral(prom),
              fecha_inicio_pec: formatDateForInput(d.fecha_inicio_pec),
              fecha_conclusion_pec: formatDateForInput(d.fecha_conclusion_pec),
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
          mostrarNotificacion("Error", error.message || "No se pudo consultar la Ficha B-2.", "error");
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
        ...fichaData,
        fecha_inicio_pec: formatDateForInput(fichaData?.fecha_inicio_pec || prev.fecha_inicio_pec),
        fecha_conclusion_pec: formatDateForInput(fichaData?.fecha_conclusion_pec || prev.fecha_conclusion_pec)
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

  const handleSemanaChange = (idx, field, value) => {
    const list = [...formData.semanas];
    
    if (field === 'valoracion') {
      if (value === '') {
        list[idx][field] = '';
      } else {
        let val = parseFloat(value);
        if (isNaN(val)) val = '';
        else if (val < 1) val = 1;
        else if (val > 100) val = 100;
        list[idx][field] = value.endsWith('.') ? value : val;
      }
    } else {
      list[idx][field] = value;
    }

    const notas = list.map(s => parseFloat(s.valoracion)).filter(n => !isNaN(n));
    let prom = notas.length > 0 ? parseFloat((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)) : 0;
    if (prom % 1 === 0) prom = Math.round(prom);

    const updated = {
      ...formData,
      semanas: list,
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
      const res = await fichaB23erAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "La Ficha B-2 se registró correctamente.", "success");
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
      const res = await fichaB23erAnoService.delete(estudianteSeleccionado.id);
      const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      const clearedData = {
        ...initialFormState,
        apellidos_nombres: nombreCompleto,
        especialidad: estudianteSeleccionado.especialidad || listaEspecialidades[0] || ESPECIALIDADES_ESFM[0]
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "La Ficha B-2 fue eliminada con éxito.", "success");
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
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-2: ASISTENCIA - PRÁCTICA EDUCATIVA COMUNITARIA (4 SEMANAS)"} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando datos de Ficha B-2...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <h4 className="font-extrabold text-[#801B28] uppercase text-sm">
                  FICHA B-2: CONTROL DE ASISTENCIA Y VALORACIÓN - PEC 3ER AÑO
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

              {/* DURACIÓN PEC Y FECHAS */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-[#801B28] uppercase text-[11px]">DURACIÓN DE LA IEPC-PEC EN LA UE/CEA/CEE: 4 SEMANAS</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Fecha de Inicio de IEPC-PEC:</label>
                    <input
                      type="date"
                      value={formatDateForInput(formData.fecha_inicio_pec)}
                      onChange={(e) => handleCampoChange('fecha_inicio_pec', e.target.value)}
                      className="w-full border p-2 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Fecha de Conclusión de IEPC-PEC:</label>
                    <input
                      type="date"
                      value={formatDateForInput(formData.fecha_conclusion_pec)}
                      onChange={(e) => handleCampoChange('fecha_conclusion_pec', e.target.value)}
                      className="w-full border p-2 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* TABLA DE REGISTRO POR SEMANAS */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-800 uppercase text-[11px]">REGISTRO DE ASISTENCIA</span>
                
                <div className="space-y-2">
                  {formData.semanas.map((s, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800">{s.semana}</span>
                      <input type="number" placeholder="N° Asist." value={s.asistencia ?? ''} onChange={(e) => handleSemanaChange(idx, 'asistencia', e.target.value)} className="border p-1.5 rounded-lg text-center bg-white font-mono outline-none" />
                      <input type="number" placeholder="N° Inasist." value={s.inasistencia ?? ''} onChange={(e) => handleSemanaChange(idx, 'inasistencia', e.target.value)} className="border p-1.5 rounded-lg text-center bg-white font-mono text-rose-600 outline-none" />
                      <input type="number" placeholder="N° Atrasos" value={s.atrasos ?? ''} onChange={(e) => handleSemanaChange(idx, 'atrasos', e.target.value)} className="border p-1.5 rounded-lg text-center bg-white font-mono text-amber-600 outline-none" />
                      <input type="text" inputMode="decimal" placeholder="Nota 1-100" value={formatInputValue(s.valoracion)} onChange={(e) => handleSemanaChange(idx, 'valoracion', e.target.value)} className="border p-1.5 rounded-lg text-center bg-white font-mono font-bold text-[#801B28] outline-none focus:border-[#801B28]" />
                    </div>
                  ))}
                </div>

                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Promedio Final:</label>
                    <div className="font-mono font-black text-2xl text-[#801B28]">{formatInputValue(formData.promedio_numeral) || '0'} / 100 PTS</div>
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Literal:</label>
                    <div className="font-extrabold text-xs text-slate-900 uppercase mt-2">{formData.promedio_literal || 'CERO CON 00/100'}</div>
                  </div>
                </div>
              </div>

              {/* OBSERVACIONES REGLAMENTARIAS */}
              <div className="bg-rose-50/40 p-3 rounded-2xl border border-rose-100 space-y-1 text-[10px] text-slate-600">
                <span className="font-bold text-rose-900 uppercase block">Observaciones Normativas:</span>
                <p>• La inasistencia a la PEC es motivo y/o causa para la retención en el año de formación.</p>
                <p>• Tres atrasos continuos o discontinuos se registrarán como una inasistencia.</p>
                <p>• Se otorgará licencia solo en casos excepcionales con respaldo documental.</p>
              </div>

              {/* LUGAR Y FECHA */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-[#801B28] uppercase text-[11px] flex items-center gap-1.5">
                  <MapPin size={14} /> LUGAR Y FECHA DE EMISIÓN
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
        titulo="¿Eliminar Ficha B-2?"
        mensaje="Esta acción eliminará permanentemente el registro de asistencia de la base de datos."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};