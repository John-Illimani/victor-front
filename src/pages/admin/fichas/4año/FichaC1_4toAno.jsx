import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { GraduationCap, MapPin, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, MODALIDADES_GRADUACION_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaC14toAnoService } from '../../../../services/fichas/4año/fichaC14toAnoService';

export const FichaC1_4toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "4_C1";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const criteriosC1 = [
    { key: 'c1', label: 'Se evidencia una elaboración participativa y corresponsable entre todos los integrantes del ECTG, recuperando los aspectos más relevantes y pertinentes del proceso de la IEPC-PEC.', max: 10 },
    { key: 'c2', label: 'Lectura adecuada, analítica, reflexiva, profunda y clara de la realidad del contexto y de la UE/CEA/CEE.', max: 10 },
    { key: 'c3', label: 'Planteamiento coherente de la problematización y de las preguntas problematizadoras para el diálogo con actores.', max: 10 },
    { key: 'c4', label: 'Las herramientas e instrumentos de investigación son adecuados para el diálogo con los actores y para el recojo de información relevante sobre el problema, necesidad o potencialidad identificada.', max: 10 },
    { key: 'c5', label: 'La organización, análisis e interpretación de la información recogida es coherente y sistemática.', max: 10 },
    { key: 'c6', label: 'Denota una pertinente selección y lectura de textos que permiten profundizar la comprensión del problema, necesidad o potencialidad identificada.', max: 10 },
    { key: 'c7', label: 'Plantea una propuesta clara, integral, transformadora y coherente en procura de responder al nudo problemático identificado.', max: 10 },
    { key: 'c8', label: 'El diagnóstico socioparticipativo fue socializado y enriquecido con los aportes de la comunidad educativa de la UE/CEA/CEE según el acta de socialización del documento en la comunidad educativa.', max: 10 },
    { key: 'c9', label: 'Propone un proceso de implementación de trabajo de grado coherente con la modalidad de graduación elegida.', max: 10 },
    { key: 'c10', label: 'Utiliza adecuadamente las normas APA 7ma edición en citas y referencias bibliográficas.', max: 10 }
  ];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  // Función helper para determinar si el valor es entero o decimal antes de asignarlo al input
  const formatInputValue = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const num = Number(val);
    if (isNaN(num)) return val;
    return Number.isInteger(num) ? String(Math.trunc(num)) : String(val);
  };

  const initialFormState = {
    integrante_ectg: '',
    modalidad_graduacion: MODALIDADES_GRADUACION_ESFM[0],
    titulo_diseno_metodologico: '',
    c1: '', c2: '', c3: '', c4: '', c5: '',
    c6: '', c7: '', c8: '', c9: '', c10: '',
    puntaje_final: 0,
    puntaje_literal: 'CERO CON 00/100',
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
          const res = await fichaC14toAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();

          if (res.existe && res.datos) {
            const d = res.datos;

            // Formatear notas individuales antes de actualizar el estado
            const criteriosFormateados = {};
            criteriosC1.forEach(crit => {
              criteriosFormateados[crit.key] = formatInputValue(d[crit.key]);
            });

            const updatedState = {
              ...initialFormState,
              ...d,
              ...criteriosFormateados,
              integrante_ectg: nombreCompleto,
              modalidad_graduacion: d.modalidad_graduacion || MODALIDADES_GRADUACION_ESFM[0],
              titulo_diseno_metodologico: d.titulo_diseno_metodologico || '',
              lugar_ciudad: d.lugar_ciudad || 'El Alto',
              departamento: d.departamento || DEPARTAMENTOS_BOLIVIA[0],
              dia: d.dia || String(new Date().getDate()),
              mes: d.mes || MESES_ANIO[new Date().getMonth()],
              ano: String(d.ano || '2026').slice(0, 4)
            };

            recalcularSumaTotal(updatedState);
          } else {
            setFormData(prev => ({
              ...prev,
              ...initialFormState,
              integrante_ectg: nombreCompleto
            }));
          }
        } catch (error) {
          mostrarNotificacion("Error", error.message || "No se pudo consultar la Ficha C-1.", "error");
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

  const recalcularSumaTotal = (formState) => {
    const notas = criteriosC1.map(c => parseFloat(formState[c.key])).filter(n => !isNaN(n));
    const total = notas.length > 0 ? parseFloat(notas.reduce((a, b) => a + b, 0).toFixed(2)) : 0;

    const updated = {
      ...formState,
      puntaje_final: total,
      puntaje_literal: convertirNumeroALiteral(total)
    };

    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  const handlePuntajeChange = (key, maxVal, valStr) => {
    if (valStr === '') {
      const updatedForm = { ...formData, [key]: '' };
      recalcularSumaTotal(updatedForm);
      return;
    }

    let num = parseFloat(valStr);
    if (isNaN(num)) num = '';
    else if (num < 0) num = 0;
    else if (num > maxVal) num = maxVal;

    const newForm = { ...formData, [key]: num };
    recalcularSumaTotal(newForm);
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
      const res = await fichaC14toAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "Ficha C-1 guardada correctamente.", "success");
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
      const res = await fichaC14toAnoService.delete(estudianteSeleccionado.id);
      const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      const clearedData = {
        ...initialFormState,
        integrante_ectg: nombreCompleto
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "La Ficha C-1 fue eliminada con éxito.", "success");
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
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA C-1: EVALUACIÓN DEL DOCUMENTO DE DISEÑO METODOLÓGICO POR LA/EL DOCENTE TUTOR/A ACOMPAÑANTE (4TO AÑO)"} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando Ficha C-1...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <span className="font-extrabold text-[#801B28] uppercase text-xs">
                  FICHA C-1 - EVALUACIÓN DEL DOCUMENTO DE DISEÑO METODOLÓGICO
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
              <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 text-amber-900 font-bold text-[11px]">
                La aprobación del documento es habilitante para la socialización ante la Comisión Comunitaria de Evaluación.
              </div>

              {/* DATOS REFERENCIALES */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-[#801B28] uppercase text-[11px] flex items-center gap-1.5 border-b pb-2">
                  <GraduationCap size={15} /> DATOS REFERENCIALES
                </span>
                <div className="space-y-2">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Integrante del ECTG:</label>
                    <input type="text" readOnly value={formData.integrante_ectg} className="w-full border p-2 rounded-xl bg-slate-50 font-bold text-slate-900" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Modalidad de Graduación:</label>
                    <select value={formData.modalidad_graduacion} onChange={(e) => handleCampoChange('modalidad_graduacion', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold">
                      {MODALIDADES_GRADUACION_ESFM.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Título del Diseño Metodológico:</label>
                    <input type="text" value={formData.titulo_diseno_metodologico} onChange={(e) => handleCampoChange('titulo_diseno_metodologico', e.target.value)} className="w-full border p-2 rounded-xl font-bold focus:border-[#801B28] outline-none" placeholder="Escriba el título completo..." />
                  </div>
                </div>
              </div>

              {/* CRITERIOS DE EVALUACIÓN (SUMA HASTA 100 PTS) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
                  CRITERIOS DE EVALUACIÓN (MÁXIMO 10 PTS POR CRITERIO)
                </span>

                <div className="space-y-2">
                  {criteriosC1.map((crit, idx) => (
                    <div key={crit.key} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="sm:col-span-4 font-medium text-slate-800 text-[11px]">
                        <strong className="text-[#801B28] mr-1">{idx + 1}.</strong> {crit.label}
                      </span>
                      <div className="text-center font-bold text-slate-500 text-[10px]">Puntaje Máx: 10</div>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="any"
                        placeholder="0-10"
                        value={formatInputValue(formData[crit.key])}
                        onChange={(e) => handlePuntajeChange(crit.key, crit.max, e.target.value)}
                        className="w-full border p-2 rounded-lg bg-white font-mono font-bold text-center text-slate-900 focus:border-[#801B28] outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Puntaje Final Numeral:</label>
                    <div className="font-mono font-black text-2xl text-[#801B28]">{formData.puntaje_final || '0.00'} / 100 PTS</div>
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Literal:</label>
                    <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">{formData.puntaje_literal}</div>
                  </div>
                </div>
              </div>

              {/* LUGAR Y FECHA */}
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
        titulo="¿Eliminar Ficha C-1?"
        mensaje="Esta acción borrará de forma permanente el registro de la Ficha C-1."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};