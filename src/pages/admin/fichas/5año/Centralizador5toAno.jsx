import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { MapPin, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { centralizador5toAnoService } from '../../../../services/fichas/5año/centralizador5toAnoService';
import { especialidadService } from '../../../../services/especialidadService';

export const Centralizador5toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado, listaDocentes = [] }) => {
  const codigoFicha = "CENTRALIZADOR";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const etapasCentralizador = [
    {
      etapa: 'PLANIFICACIÓN Y ORGANIZACIÓN',
      filas: [
        { actividad: 'Elaboración de PDC', indicador: 'PDC elaborado por cada integrante del ECTG.', instrumento: 'Ficha A-1', key: 'nota_a1' }
      ]
    },
    {
      etapa: 'EJECUCIÓN',
      filas: [
        { actividad: 'Asistencia regular', indicador: 'Control de asistencia regular a la PEC.', instrumento: 'Ficha B-1', key: 'nota_b1' },
        { actividad: 'Concreción Curricular', indicador: 'Implementación individual de PDCs y Clase Comunitaria.', instrumento: 'Ficha Promedio Final B-4', key: 'nota_b4' },
        { actividad: 'Seguimiento', indicador: 'Apoyo y seguimiento por parte de/el Docente Guía.', instrumento: 'Ficha B-5', key: 'nota_b5' },
        { actividad: 'Seguimiento', indicador: 'Apoyo y seguimiento por parte de/el Docente Acompañante.', instrumento: 'Ficha B-6', key: 'nota_b6' }
      ]
    },
    {
      etapa: 'SOCIALIZACIÓN',
      filas: [
        { actividad: 'Elaboración del Trabajo de Grado', indicador: 'Documento del Trabajo de Grado.', instrumento: 'Ficha C-1', key: 'nota_c1' },
        { actividad: 'Socialización Comunitaria', indicador: 'Socialización Comunitaria del Trabajo de Grado.', instrumento: 'Ficha C-2', key: 'nota_c2' }
      ]
    }
  ];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [listaEspecialidades, setListaEspecialidades] = useState([]);
  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  const initialFormState = {
    docente_tutor_id: '',
    estudiante_nombre: '',
    especialidad: '',
    nota_a1: 0, nota_b1: 0, nota_b4: 0, nota_b5: 0, nota_b6: 0, nota_c1: 0, nota_c2: 0,
    promedio_final_1: 0,
    promedio_final_2: 0,
    promedio_numeral: 0,
    promedio_literal: 'CERO CON 00/100',
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

  // Cargar Especialidades desde la API
  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const data = await especialidadService.getEspecialidades();
        if (Array.isArray(data)) setListaEspecialidades(data);
        else if (data?.especialidades) setListaEspecialidades(data.especialidades);
      } catch (error) {
        console.error("Error al cargar especialidades:", error);
      }
    };

    if (isOpen) fetchEspecialidades();
  }, [isOpen]);

  useEffect(() => {
    const fetchCentralizador = async () => {
      if (isOpen && estudianteSeleccionado?.id) {
        setLoading(true);
        try {
          const res = await centralizador5toAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreEst = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();

          if (res.existe && res.datos) {
            const d = res.datos;
            const updatedState = {
              ...initialFormState,
              ...d,
              estudiante_nombre: nombreEst,
              especialidad: d.especialidad || estudianteSeleccionado.especialidad || '',
              docente_tutor_id: d.docente_tutor_id || '',
              lugar_ciudad: d.lugar_ciudad || 'El Alto',
              departamento: d.departamento || DEPARTAMENTOS_BOLIVIA[0],
              dia: d.dia || String(new Date().getDate()),
              mes: d.mes || MESES_ANIO[new Date().getMonth()],
              ano: String(d.ano || '2026').slice(0, 4)
            };

            recalcularPromedios(updatedState);
          } else {
            const defaultState = {
              ...initialFormState,
              estudiante_nombre: nombreEst,
              especialidad: estudianteSeleccionado.especialidad || ''
            };
            setFormData(defaultState);
            if (setFichaData) setFichaData(defaultState);
          }
        } catch (error) {
          mostrarNotificacion("Error", error.message || "No se pudo consultar el Centralizador.", "error");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCentralizador();
  }, [isOpen, estudianteSeleccionado]);

  const mostrarNotificacion = (titulo, mensaje, tipo = 'info') => {
    setModalNotif({ isOpen: true, titulo, mensaje, tipo });
  };

  // Helper para mostrar entero si no tiene decimales y conservar decimales si existen
  const formatearPromedio = (val) => {
    if (val === null || val === undefined || val === '') return 0;
    const num = parseFloat(val);
    if (isNaN(num)) return 0;
    return Number.isInteger(num) ? num : parseFloat(num.toFixed(2));
  };

  const recalcularPromedios = (baseForm) => {
    // Cálculo Promedio Final 1 (A-1, B-1, B-4, B-5, B-6)
    const notas1 = ['nota_a1', 'nota_b1', 'nota_b4', 'nota_b5', 'nota_b6']
      .map(k => parseFloat(baseForm[k]))
      .filter(n => !isNaN(n) && n > 0);
    const rawProm1 = notas1.length > 0 ? notas1.reduce((a, b) => a + b, 0) / notas1.length : 0;
    const prom1 = formatearPromedio(rawProm1);

    // Cálculo Promedio Final 2 (C-1, C-2)
    const notas2 = ['nota_c1', 'nota_c2']
      .map(k => parseFloat(baseForm[k]))
      .filter(n => !isNaN(n) && n > 0);
    const rawProm2 = notas2.length > 0 ? notas2.reduce((a, b) => a + b, 0) / notas2.length : 0;
    const prom2 = formatearPromedio(rawProm2);

    const promFinal = prom2 > 0 ? prom2 : prom1;

    const updated = {
      ...baseForm,
      promedio_final_1: prom1,
      promedio_final_2: prom2,
      promedio_numeral: promFinal,
      promedio_final: promFinal,
      promedio_literal: convertirNumeroALiteral(promFinal)
    };

    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  const handlePuntajeChange = (key, value) => {
    let num = parseFloat(value);
    if (isNaN(num)) num = '';
    else if (num < 0) num = 0;
    else if (num > 100) num = 100;

    const updated = { ...formData, [key]: num };
    recalcularPromedios(updated);
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
      const res = await centralizador5toAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "Centralizador guardado correctamente.", "success");
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
      const res = await centralizador5toAnoService.delete(estudianteSeleccionado.id);
      const nombreEst = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      const clearedData = {
        ...initialFormState,
        estudiante_nombre: nombreEst,
        especialidad: estudianteSeleccionado.especialidad || ''
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "El Centralizador fue eliminado con éxito.", "success");
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
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA CENTRALIZADORA DE EVALUACIÓN CUALITATIVA-CUANTITATIVA (5TO AÑO)"} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando Centralizador...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <span className="font-extrabold text-[#801B28] uppercase text-xs">
                  CENTRALIZADOR CONSOLIDADO DE 5TO AÑO
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

              {/* DATOS REFERENCIALES */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-[#801B28] uppercase text-[11px] block border-b pb-2">
                  DATOS REFERENCIALES
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Docente Tutor/a Acompañante:</label>
                    <select
                      value={formData.docente_tutor_id}
                      onChange={(e) => handleCampoChange('docente_tutor_id', e.target.value)}
                      className="w-full border p-2 rounded-xl bg-white font-bold text-slate-900 focus:border-[#801B28] outline-none"
                    >
                      <option value="">-- Seleccionar Docente Tutor/a --</option>
                      {listaDocentes.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nombre} {d.apellido}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Estudiante Evaluado/a:</label>
                    <input type="text" readOnly value={formData.estudiante_nombre} className="w-full border p-2 rounded-xl bg-slate-50 font-extrabold text-slate-900" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                    <select
                      value={formData.especialidad}
                      onChange={(e) => handleCampoChange('especialidad', e.target.value)}
                      className="w-full border p-2 rounded-xl bg-white font-bold text-slate-900 focus:border-[#801B28] outline-none"
                    >
                      <option value="">-- Seleccionar Especialidad --</option>
                      {listaEspecialidades.map((esp) => (
                        <option key={esp.id || esp.nombre} value={esp.nombre || esp.especialidad}>
                          {esp.nombre || esp.especialidad}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* MATRIZ DE EVALUACIÓN DE LA PEC */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
                <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
                  EVALUACIÓN DE LA PEC POR ETAPAS
                </span>

                {etapasCentralizador.map((etapaGroup) => (
                  <div key={etapaGroup.etapa} className="space-y-2">
                    <div className="bg-rose-50/80 p-2 rounded-xl border border-rose-200">
                      <span className="font-black text-[#801B28] text-[11px] uppercase tracking-wider block">
                        ETAPA: {etapaGroup.etapa}
                      </span>
                    </div>

                    <div className="space-y-1.5 pl-1">
                      {etapaGroup.filas.map((f) => (
                        <div key={f.key} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <div className="sm:col-span-4">
                            <span className="font-bold text-slate-800 text-[11px] block">{f.actividad}</span>
                            <span className="text-[10px] text-slate-500">{f.indicador} ({f.instrumento})</span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={formData[f.key] ?? ''}
                            onChange={(e) => handlePuntajeChange(f.key, e.target.value)}
                            className="sm:col-span-2 border p-2 rounded-lg bg-white font-mono font-bold text-center text-slate-900 focus:border-[#801B28] outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    {etapaGroup.etapa === 'EJECUCIÓN' && (
                      <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex justify-between items-center my-2">
                        <span className="font-black text-amber-900 text-[11px] uppercase">CALIFICACIÓN PROMEDIO FINAL 1 (Planificación + Ejecución)</span>
                        <span className="font-mono font-black text-lg text-[#801B28]">{formatearPromedio(formData.promedio_final_1)} PTS</span>
                      </div>
                    )}
                  </div>
                ))}

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex justify-between items-center my-2">
                  <span className="font-black text-amber-900 text-[11px] uppercase">CALIFICACIÓN PROMEDIO FINAL 2 (Ficha C-1 + Ficha C-2)</span>
                  <span className="font-mono font-black text-lg text-[#801B28]">{formatearPromedio(formData.promedio_final_2)} PTS</span>
                </div>

                {/* TARJETA DESTACADA: PROMEDIO CONSOLIDADO FINAL */}
                <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 shadow-sm">
                  <div>
                    <label className="block font-extrabold text-slate-700 text-[10px] uppercase tracking-wider mb-1">
                      PROMEDIO:
                    </label>
                    <div className="font-mono font-black text-2xl text-[#801B28]">
                      {formatearPromedio(formData.promedio_numeral)} / 100 PTS
                    </div>
                  </div>
                  <div>
                    <label className="block font-extrabold text-slate-700 text-[10px] uppercase tracking-wider mb-1">
                      LITERAL:
                    </label>
                    <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">
                      {formData.promedio_literal}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200 text-[10px] text-slate-700 space-y-1">
                  <p className="font-bold border-b border-blue-200 pb-1">DISPOSICIONES REGLAMENTARIAS:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Todos los instrumentos aplicados deben ser evaluados sobre 100 puntos.</li>
                    <li>La CALIFICACIÓN FINAL 1 es igual al promedio de las calificaciones obtenidas en la etapa de Planificación y Organización, y Ejecución.</li>
                    <li>La nota final alcanzada sobre 100 puntos, debe ser incorporada al SIFMWEB.</li>
                    <li>De la CALIFICACIÓN FINAL 1, el SIFMWEB pondera la calificación al 20% y lo replica en todas las UF semestralizadas del 1er Semestre.</li>
                    <li>La calificación FICHA C-1 (Documento del Trabajo de Grado) se registra en el SIFMWEB donde se pondera la calificación al 20% y se replica en todas las UF semestralizadas del 2do semestre.</li>
                    <li>La CALIFICACIÓN PROMEDIO FINAL 2 (Ficha C-1 y Ficha C-2) se registra en el SIFMWEB posterior a la socialización de trabajo de grado.</li>
                  </ul>
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
        titulo="¿Eliminar Centralizador?"
        mensaje="Esta acción borrará de forma permanente el registro del Centralizador de 5to Año."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};