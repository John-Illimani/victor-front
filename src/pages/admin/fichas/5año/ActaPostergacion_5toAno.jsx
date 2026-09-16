import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { MapPin, Plus, Trash2, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, MODALIDADES_GRADUACION_ESFM } from '../../../../utils/camposFichas';
import { actaPostergacion5toAnoService } from '../../../../services/fichas/5año/actaPostergacion5toAnoService';
import { especialidadService } from '../../../../services/especialidadService';

export const ActaPostergacion_5toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado, listaDocentes = [] }) => {
  const codigoFicha = "5_ACTA_POSTERGACION";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const MODALIDADES_INGRESO_LISTA = ["ADMISION GENERAL", "MODALIDAD B", "DEPORTISTAS DESTACADOS", "DISCAPACIDAD"];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [listaEspecialidades, setListaEspecialidades] = useState([]);
  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  const initialFormState = {
    docente_tutor_id: '',
    modalidad_graduacion: MODALIDADES_GRADUACION_ESFM[0],
    titulo_trabajo_grado: '',
    estudiantes_ectg: [
      { nombres: '', especialidad: '', modalidad_ingreso: 'ADMISION GENERAL' }
    ],
    lugar_ciudad: 'El Alto',
    ambientes: 'Instalaciones de la ESFM/UA',
    dia_post: String(new Date().getDate()),
    mes_post: MESES_ANIO[new Date().getMonth()],
    ano_post: '2026',
    titulo_trabajo_titulado: '',
    motivos_postergacion: '',
    estudiantes_posterga: '',
    nueva_fecha_dia: '',
    nueva_fecha_mes: MESES_ANIO[new Date().getMonth()],
    nueva_fecha_ano: '2026',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    ano: '2026'
  };

  const [formData, setFormData] = useState({
    ...initialFormState,
    ...fichaData
  });

  // Cargar lista de especialidades desde la API
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
    const fetchActa = async () => {
      if (isOpen && estudianteSeleccionado?.id) {
        setLoading(true);
        try {
          const res = await actaPostergacion5toAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreEst = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();

          if (res.existe && res.datos) {
            const d = res.datos;
            const updatedState = {
              ...initialFormState,
              ...d,
              docente_tutor_id: d.docente_tutor_id || '',
              modalidad_graduacion: d.modalidad_graduacion || MODALIDADES_GRADUACION_ESFM[0],
              titulo_trabajo_grado: d.titulo_trabajo_grado || '',
              estudiantes_ectg: (d.estudiantes_ectg && d.estudiantes_ectg.length > 0)
                ? d.estudiantes_ectg
                : [{ nombres: nombreEst, especialidad: estudianteSeleccionado.especialidad || '', modalidad_ingreso: estudianteSeleccionado.modalidad_ingreso || 'ADMISION GENERAL' }],
              ambientes: d.ambientes || 'Instalaciones de la ESFM/UA',
              dia_post: d.dia_post || String(new Date().getDate()),
              mes_post: d.mes_post || MESES_ANIO[new Date().getMonth()],
              ano_post: String(d.ano_post || '2026').slice(0, 4),
              titulo_trabajo_titulado: d.titulo_trabajo_titulado || d.titulo_trabajo_grado || '',
              motivos_postergacion: d.motivos_postergacion || '',
              estudiantes_posterga: d.estudiantes_posterga || nombreEst,
              nueva_fecha_dia: d.nueva_fecha_dia || '',
              nueva_fecha_mes: d.nueva_fecha_mes || MESES_ANIO[new Date().getMonth()],
              nueva_fecha_ano: String(d.nueva_fecha_ano || '2026').slice(0, 4),
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
              estudiantes_posterga: nombreEst,
              estudiantes_ectg: [
                {
                  nombres: nombreEst,
                  especialidad: estudianteSeleccionado.especialidad || '',
                  modalidad_ingreso: estudianteSeleccionado.modalidad_ingreso || 'ADMISION GENERAL'
                }
              ]
            };
            setFormData(defaultState);
            if (setFichaData) setFichaData(defaultState);
          }
        } catch (error) {
          mostrarNotificacion("Error", error.message || "No se pudo consultar el Acta de Postergación.", "error");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchActa();
  }, [isOpen, estudianteSeleccionado]);

  const mostrarNotificacion = (titulo, mensaje, tipo = 'info') => {
    setModalNotif({ isOpen: true, titulo, mensaje, tipo });
  };

  const handleEstudianteChange = (index, field, val) => {
    const updated = [...(formData.estudiantes_ectg || [])];
    updated[index][field] = val;
    const newForm = { ...formData, estudiantes_ectg: updated };
    setFormData(newForm);
    if (setFichaData) setFichaData(newForm);
  };

  const addEstudiante = () => {
    if ((formData.estudiantes_ectg || []).length >= 3) return;
    const updated = [
      ...formData.estudiantes_ectg,
      { nombres: '', especialidad: '', modalidad_ingreso: 'ADMISION GENERAL' }
    ];
    const newForm = { ...formData, estudiantes_ectg: updated };
    setFormData(newForm);
    if (setFichaData) setFichaData(newForm);
  };

  const removeEstudiante = (index) => {
    if (formData.estudiantes_ectg.length <= 1) return;
    const updated = formData.estudiantes_ectg.filter((_, i) => i !== index);
    const newForm = { ...formData, estudiantes_ectg: updated };
    setFormData(newForm);
    if (setFichaData) setFichaData(newForm);
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
      const res = await actaPostergacion5toAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "Acta de Postergación guardada correctamente.", "success");
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
      const res = await actaPostergacion5toAnoService.delete(estudianteSeleccionado.id);
      const nombreEst = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      const clearedData = {
        ...initialFormState,
        estudiantes_posterga: nombreEst,
        estudiantes_ectg: [{ nombres: nombreEst, especialidad: estudianteSeleccionado.especialidad || '', modalidad_ingreso: estudianteSeleccionado.modalidad_ingreso || 'ADMISION GENERAL' }]
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "El Acta de Postergación fue eliminada con éxito.", "success");
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
        {saving ? "Guardando..." : "Guardar Acta"}
      </button>
    </div>
  );

  return (
    <>
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "ACTA DE POSTERGACIÓN DE LA SOCIALIZACIÓN DEL TRABAJO DE GRADO (5TO AÑO)"} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando Acta de Postergación...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <span className="font-extrabold text-[#801B28] uppercase text-xs">
                  ACTA DE POSTERGACIÓN - SOCIALIZACIÓN DE TRABAJO DE GRADO
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

              {/* DATOS REFERENCIALES GENERALES */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-[#801B28] uppercase text-[11px] block border-b pb-2">
                  DATOS REFERENCIALES GENERALES
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
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Modalidad de Graduación:</label>
                    <select
                      value={formData.modalidad_graduacion}
                      onChange={(e) => handleCampoChange('modalidad_graduacion', e.target.value)}
                      className="w-full border p-2 rounded-xl bg-white font-bold text-slate-900 focus:border-[#801B28] outline-none"
                    >
                      {MODALIDADES_GRADUACION_ESFM.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Título del Trabajo de Grado:</label>
                    <input
                      type="text"
                      value={formData.titulo_trabajo_grado}
                      onChange={(e) => handleCampoChange('titulo_trabajo_grado', e.target.value)}
                      className="w-full border p-2 rounded-xl font-bold focus:border-[#801B28] outline-none"
                      placeholder="Escriba el título completo del trabajo de grado..."
                    />
                  </div>
                </div>
              </div>

              {/* TABLA DE MIEMBROS DEL ECTG */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-extrabold text-slate-800 uppercase text-[11px]">
                    MIEMBROS DEL EQUIPO COMUNITARIO DE TRABAJO DE GRADO (ECTG)
                  </span>
                  {formData.estudiantes_ectg.length < 3 && (
                    <button
                      type="button"
                      onClick={addEstudiante}
                      className="px-3 py-1 bg-[#801B28] text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-sm hover:bg-[#a32334] transition-all cursor-pointer"
                    >
                      <Plus size={12} /> Agregar Estudiante
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-200 text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-extrabold">
                        <th className="p-2 border border-slate-200 w-10 text-center">Nº</th>
                        <th className="p-2 border border-slate-200">NOMBRES Y APELLIDOS</th>
                        <th className="p-2 border border-slate-200 w-1/3">ESPECIALIDAD</th>
                        <th className="p-2 border border-slate-200 w-1/4">MODALIDAD DE INGRESO</th>
                        <th className="p-2 border border-slate-200 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {formData.estudiantes_ectg?.map((est, index) => (
                        <tr key={index} className="hover:bg-slate-50/80">
                          <td className="p-2 border font-bold text-center text-slate-600">{index + 1}</td>
                          <td className="p-1.5 border">
                            <input
                              type="text"
                              placeholder="Nombres y Apellidos"
                              value={est.nombres}
                              onChange={(e) => handleEstudianteChange(index, 'nombres', e.target.value)}
                              className="w-full border p-1.5 rounded-lg font-bold bg-white focus:border-[#801B28] outline-none"
                            />
                          </td>
                          <td className="p-1.5 border">
                            <select
                              value={est.especialidad}
                              onChange={(e) => handleEstudianteChange(index, 'especialidad', e.target.value)}
                              className="w-full border p-1.5 rounded-lg bg-white font-bold text-[10px] focus:border-[#801B28] outline-none"
                            >
                              <option value="">-- Especialidad --</option>
                              {listaEspecialidades.map((esp) => (
                                <option key={esp.id || esp.nombre} value={esp.nombre || esp.especialidad}>
                                  {esp.nombre || esp.especialidad}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-1.5 border">
                            <select
                              value={est.modalidad_ingreso}
                              onChange={(e) => handleEstudianteChange(index, 'modalidad_ingreso', e.target.value)}
                              className="w-full border p-1.5 rounded-lg bg-white font-bold text-[10px] focus:border-[#801B28] outline-none"
                            >
                              {MODALIDADES_INGRESO_LISTA.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </td>
                          <td className="p-1 border text-center">
                            {formData.estudiantes_ectg.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeEstudiante(index)}
                                className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* REDACCIÓN DEL ACTA */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
                <span className="font-extrabold text-[#801B28] uppercase text-[11px] block border-b pb-2">
                  DATOS DE PRESENTACIÓN Y DESARROLLO
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">En la ciudad de:</label>
                    <input type="text" value={formData.lugar_ciudad} onChange={(e) => handleCampoChange('lugar_ciudad', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">En ambientes de la ESFM/UA:</label>
                    <input type="text" value={formData.ambientes} onChange={(e) => handleCampoChange('ambientes', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold" />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">A los (Días):</label>
                    <input type="text" value={formData.dia_post} onChange={(e) => handleCampoChange('dia_post', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold font-mono" />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Del mes de:</label>
                    <select value={formData.mes_post} onChange={(e) => handleCampoChange('mes_post', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold uppercase">
                      {MESES_ANIO.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Trabajo Final de Grado, titulado:</label>
                    <input
                      type="text"
                      value={formData.titulo_trabajo_titulado || formData.titulo_trabajo_grado}
                      onChange={(e) => handleCampoChange('titulo_trabajo_titulado', e.target.value)}
                      className="w-full border p-2.5 rounded-xl font-bold text-slate-900 bg-white border-slate-300 focus:border-[#801B28] outline-none"
                      placeholder="Escriba el título completo del trabajo final de grado..."
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Motivos descritos por los que se procedió a postergar:</label>
                    <textarea
                      rows="3"
                      value={formData.motivos_postergacion}
                      onChange={(e) => handleCampoChange('motivos_postergacion', e.target.value)}
                      className="w-full border p-2.5 rounded-xl font-medium text-slate-800 text-xs focus:border-[#801B28] outline-none"
                      placeholder="Describa las razones expresadas por la comisión..."
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Estudiante(s) a quien(es) se les resuelve postergar:</label>
                    <input
                      type="text"
                      value={formData.estudiantes_posterga}
                      onChange={(e) => handleCampoChange('estudiantes_posterga', e.target.value)}
                      className="w-full border p-2 rounded-xl font-bold bg-white"
                      placeholder="Nombres y Apellidos de los estudiantes postergados..."
                    />
                  </div>

                  {/* REPROGRAMACIÓN */}
                  <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200 space-y-2">
                    <span className="font-extrabold text-amber-900 uppercase text-[10px] block">
                      NUEVA FECHA PROGRAMADA DE SOCIALIZACIÓN DEL TRABAJO FINAL DE GRADO
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 text-[10px] mb-1">Para el día:</label>
                        <input type="text" value={formData.nueva_fecha_dia} onChange={(e) => handleCampoChange('nueva_fecha_dia', e.target.value)} className="w-full border p-2 rounded-xl font-mono font-bold bg-white" placeholder="Ej. 25" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 text-[10px] mb-1">Del mes de:</label>
                        <select value={formData.nueva_fecha_mes} onChange={(e) => handleCampoChange('nueva_fecha_mes', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold uppercase">
                          {MESES_ANIO.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 text-[10px] mb-1">Del año en curso:</label>
                        <input type="text" value={formData.nueva_fecha_ano} onChange={(e) => handleCampoChange('nueva_fecha_ano', e.target.value)} className="w-full border p-2 rounded-xl font-mono font-bold bg-white" />
                      </div>
                    </div>
                  </div>
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
        titulo="¿Eliminar Acta de Postergación?"
        mensaje="Esta acción borrará de forma permanente el registro del Acta de Postergación de 5to Año."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};