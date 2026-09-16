import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { GraduationCap, MapPin, Plus, Trash2, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaA14toAnoService } from '../../../../services/fichas/4año/fichaA14toAnoService';
import { especialidadService } from '../../../../services/especialidadService';

export const FichaA1_4toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "4_A1";
  const config = CONFIGURACION_FICHAS[codigoFicha];

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
    ano_formacion: '4to Año',
    tecnicas_evaluacion: [
      { id: Date.now(), tecnica: '', c1: '', c2: '', c3: '' }
    ],
    c1_diseno_validacion: '',
    c2_aplicacion_tecnicas: '',
    c3_orden_analisis: '',
    promedio_numeral: 0,
    promedio_literal: 'CERO CON 00/100',
    observaciones: '',
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

  // Cargar Especialidades de la API
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

  // Cargar datos del estudiante
  useEffect(() => {
    const fetchFicha = async () => {
      if (isOpen && estudianteSeleccionado?.id) {
        setLoading(true);
        try {
          const res = await fichaA14toAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
          const espEstudiante = estudianteSeleccionado.especialidad || listaEspecialidades[0] || ESPECIALIDADES_ESFM[0];

          if (res.existe && res.datos) {
            const d = res.datos;
            const updatedState = {
              ...initialFormState,
              ...d,
              apellidos_nombres: nombreCompleto,
              especialidad: d.especialidad || espEstudiante,
              tecnicas_evaluacion: (d.tecnicas_evaluacion && d.tecnicas_evaluacion.length > 0)
                ? d.tecnicas_evaluacion
                : [{ id: Date.now(), tecnica: '', c1: '', c2: '', c3: '' }],
              c1_diseno_validacion: d.c1_diseno_validacion || '',
              c2_aplicacion_tecnicas: d.c2_aplicacion_tecnicas || '',
              c3_orden_analisis: d.c3_orden_analisis || '',
              lugar_ciudad: d.lugar_ciudad || 'El Alto',
              departamento: d.departamento || DEPARTAMENTOS_BOLIVIA[0],
              dia: d.dia || String(new Date().getDate()),
              mes: d.mes || MESES_ANIO[new Date().getMonth()],
              ano: String(d.ano || '2026').slice(0, 4)
            };

            recalcularPromedioGeneral(updatedState);
          } else {
            setFormData(prev => ({
              ...prev,
              ...initialFormState,
              apellidos_nombres: nombreCompleto,
              especialidad: espEstudiante
            }));
          }
        } catch (error) {
          mostrarNotificacion("Error", error.message || "No se pudo consultar la Ficha A-1.", "error");
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

  // Recalcular promedio de criterios globales y/o listas dinámicas
  const recalcularPromedioGeneral = (formState) => {
    let notasValidas = [];

    if (formState.tecnicas_evaluacion && formState.tecnicas_evaluacion.length > 0) {
      formState.tecnicas_evaluacion.forEach(item => {
        const c1 = parseFloat(item.c1);
        const c2 = parseFloat(item.c2);
        const c3 = parseFloat(item.c3);
        if (!isNaN(c1)) notasValidas.push(c1);
        if (!isNaN(c2)) notasValidas.push(c2);
        if (!isNaN(c3)) notasValidas.push(c3);
      });
    }

    const c1Global = parseFloat(formState.c1_diseno_validacion);
    const c2Global = parseFloat(formState.c2_aplicacion_tecnicas);
    const c3Global = parseFloat(formState.c3_orden_analisis);

    if (!isNaN(c1Global)) notasValidas.push(c1Global);
    if (!isNaN(c2Global)) notasValidas.push(c2Global);
    if (!isNaN(c3Global)) notasValidas.push(c3Global);

    const promFinal = notasValidas.length > 0
      ? parseFloat((notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length).toFixed(2))
      : 0;

    const updated = {
      ...formState,
      promedio_numeral: promFinal,
      promedio_literal: convertirNumeroALiteral(promFinal)
    };

    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  // Agregar nueva técnica (+)
  const agregarTecnica = () => {
    const nuevaTecnica = {
      id: Date.now(),
      tecnica: '',
      c1: '',
      c2: '',
      c3: ''
    };
    const updatedTecnicas = [...formData.tecnicas_evaluacion, nuevaTecnica];
    const newForm = { ...formData, tecnicas_evaluacion: updatedTecnicas };
    recalcularPromedioGeneral(newForm);
  };

  // Eliminar técnica
  const eliminarTecnica = (id) => {
    if (formData.tecnicas_evaluacion.length <= 1) return;
    const updatedTecnicas = formData.tecnicas_evaluacion.filter(item => item.id !== id);
    const newForm = { ...formData, tecnicas_evaluacion: updatedTecnicas };
    recalcularPromedioGeneral(newForm);
  };

  // Cambio en fila de técnica
  const handleTecnicaChange = (id, field, value) => {
    let val = value;
    if (field !== 'tecnica') {
      let num = parseFloat(value);
      if (isNaN(num)) val = '';
      else if (num < 0) val = 0;
      else if (num > 100) val = 100;
      else val = num;
    }

    const updatedTecnicas = formData.tecnicas_evaluacion.map(item =>
      item.id === id ? { ...item, [field]: val } : item
    );

    const newForm = { ...formData, tecnicas_evaluacion: updatedTecnicas };
    recalcularPromedioGeneral(newForm);
  };

  // Cambio en los criterios globales
  const handleNotaGlobalChange = (field, value) => {
    let num = parseFloat(value);
    if (isNaN(num)) num = '';
    else if (num < 0) num = 0;
    else if (num > 100) num = 100;

    const newForm = { ...formData, [field]: num };
    recalcularPromedioGeneral(newForm);
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
      const res = await fichaA14toAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "Ficha A-1 registrada correctamente.", "success");
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
      const res = await fichaA14toAnoService.delete(estudianteSeleccionado.id);
      const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      const clearedData = {
        ...initialFormState,
        apellidos_nombres: nombreCompleto,
        especialidad: estudianteSeleccionado.especialidad || listaEspecialidades[0] || ESPECIALIDADES_ESFM[0]
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "La ficha fue eliminada con éxito.", "success");
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
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA A-1: TÉCNICAS E INSTRUMENTOS DE INVESTIGACIÓN (4TO AÑO)"} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando Ficha A-1...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <span className="font-extrabold text-[#801B28] uppercase text-xs">
                  FICHA A-1 - EVALUACIÓN DE TÉCNICAS E INSTRUMENTOS
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

              {/* ENCABEZADO Y RESPONSABLE */}
              <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 text-amber-950 text-[11px] leading-relaxed">
                El Equipo Comunitario de Trabajo de Grado diseña y aplica técnicas e instrumentos de investigación. Posteriormente procesa e interpreta la información.
                <strong className="block mt-1 text-[#801B28]">Responsable de evaluar: Docente de investigación de la ESFM/UA.</strong>
              </div>

              {/* DATOS REFERENCIALES */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-[#801B28] uppercase text-[11px] flex items-center gap-1.5 border-b pb-2">
                  <GraduationCap size={15} /> DATOS REFERENCIALES
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Docente en formación:</label>
                    <input type="text" readOnly value={formData.apellidos_nombres} className="w-full border border-slate-200 p-2 rounded-xl bg-slate-50 font-extrabold text-slate-900" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">ESFM/UA:</label>
                    <input type="text" value={formData.esfm_ua} onChange={(e) => handleCampoChange('esfm_ua', e.target.value)} className="w-full border border-slate-200 p-2 rounded-xl font-bold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Año de formación:</label>
                    <input type="text" readOnly value={formData.ano_formacion} className="w-full border border-slate-200 p-2 rounded-xl bg-slate-50 font-bold" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                    <select value={formData.especialidad} onChange={(e) => handleCampoChange('especialidad', e.target.value)} className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold">
                      {listaEspecialidades.map((e, idx) => <option key={idx} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECCIÓN DINÁMICA DE TÉCNICAS E INSTRUMENTOS CON BOTÓN (+) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-extrabold text-slate-800 uppercase text-[11px]">
                    TÉCNICAS E INSTRUMENTOS APLICADOS
                  </span>
                  <button
                    type="button"
                    onClick={agregarTecnica}
                    className="px-3 py-1.5 bg-[#801B28] text-white font-bold rounded-xl text-xs flex items-center gap-1 hover:bg-rose-900 transition-all cursor-pointer shadow-sm"
                  >
                    <Plus size={14} /> Añadir Técnica
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.tecnicas_evaluacion.map((item, index) => (
                    <div key={item.id || index} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#801B28] text-xs">#{index + 1}</span>
                        <input
                          type="text"
                          placeholder="Nombre de la técnica e instrumento (Ej: Entrevista a profundidad)..."
                          value={item.tecnica}
                          onChange={(e) => handleTecnicaChange(item.id, 'tecnica', e.target.value)}
                          className="w-full border border-slate-300 p-2 rounded-xl font-bold text-slate-800 bg-white focus:border-[#801B28] outline-none"
                        />
                        {formData.tecnicas_evaluacion.length > 1 && (
                          <button
                            type="button"
                            onClick={() => eliminarTecnica(item.id)}
                            className="p-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-600 mb-1">Diseño y validación de técnicas e instrumentos (Antes de la PEC)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={item.c1}
                            onChange={(e) => handleTecnicaChange(item.id, 'c1', e.target.value)}
                            className="w-full border p-1.5 rounded-lg text-center font-mono font-bold bg-white focus:border-[#801B28] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-600 mb-1">Aplicación de técnicas e instrumentos de investigación (Durante la PEC)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={item.c2}
                            onChange={(e) => handleTecnicaChange(item.id, 'c2', e.target.value)}
                            className="w-full border p-1.5 rounded-lg text-center font-mono font-bold bg-white focus:border-[#801B28] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-600 mb-1">Orden, análisis, reflexión e interpretación de información (Durante la PEC)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={item.c3}
                            onChange={(e) => handleTecnicaChange(item.id, 'c3', e.target.value)}
                            className="w-full border p-1.5 rounded-lg text-center font-mono font-bold bg-white focus:border-[#801B28] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* VALORACIÓN GLOBAL DE CRITERIOS */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                

                

                {/* RESUMEN FINAL DE PROMEDIO */}
                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Promedio Final (Número entero):</label>
                    <div className="font-mono font-black text-2xl text-[#801B28]">{formData.promedio_numeral || '0.00'} / 100 PTS</div>
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Literal:</label>
                    <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">{formData.promedio_literal}</div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-1">Observaciones y/o sugerencias:</label>
                  <textarea
                    rows="3"
                    value={formData.observaciones}
                    onChange={(e) => handleCampoChange('observaciones', e.target.value)}
                    className="w-full border p-2.5 rounded-xl font-medium text-slate-800 text-xs focus:border-[#801B28] outline-none"
                    placeholder="Escriba aquí sus observaciones o sugerencias..."
                  />
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
        titulo="¿Eliminar Ficha A-1?"
        mensaje="Esta acción borrará de forma permanente el registro de la Ficha A-1."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};