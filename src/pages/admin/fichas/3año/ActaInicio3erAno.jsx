import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { Plus, Trash2, GraduationCap, Users, UserCheck, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, ESPECIALIDADES_ESFM } from '../../../../utils/camposFichas';
import { actaInicio3erAnoService } from '../../../../services/fichas/3año/actaInicio3erAnoService';
import { especialidadService } from '../../../../services/especialidadService';

// Helper para garantizar que la fecha tenga el formato YYYY-MM-DD que exige <input type="date">
const formatFechaInput = (fecha) => {
  if (!fecha) return '';
  const str = String(fecha);
  return str.includes('T') ? str.split('T')[0] : str.slice(0, 10);
};

export const ActaInicio3erAno = ({ isOpen, onClose, fichaData, setFichaData, listaDocentes = [], estudianteSeleccionado }) => {
  const codigoFicha = "3_ACTA_INICIO";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const opcionesNivel = [
    'Educación Inicial en Familia Comunitaria',
    'Educación Primaria Comunitaria Vocacional',
    'Educación Secundaria Comunitaria Productiva'
  ];
  
  const [listaEspecialidades, setListaEspecialidades] = useState(ESPECIALIDADES_ESFM);

  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  const initialFormState = {
    apellidos_nombres: '',
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    especialidad: ESPECIALIDADES_ESFM[0],
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    distrito_educativo: '',
    subsistema: 'Educación Regular',
    nivel: opcionesNivel[2],
    ue_cea_cee: '',
    anos_escolaridad_asignado: '',
    fecha_inicio_pec: '',
    fecha_conclusion_pec: '',
    docente_guia_id: '',
    docente_acompanante_id: '',
    integrantes: [{ apellidos_nombres: '', ci: '' }]
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
          if (nombres.length > 0) {
            setListaEspecialidades(nombres);
          }
        }
      } catch (error) {
        console.warn("Usando lista estática de especialidades por defecto.");
      }
    };

    if (isOpen) {
      fetchEspecialidades();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchActa = async () => {
      if (isOpen && estudianteSeleccionado?.id) {
        setLoading(true);
        try {
          const res = await actaInicio3erAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
          const espEstudiante = estudianteSeleccionado.especialidad || listaEspecialidades[0] || ESPECIALIDADES_ESFM[0];

          if (res.existe && res.datos) {
            const d = res.datos;
            const integrantesCargados = Array.isArray(d.integrantes) && d.integrantes.length > 0 
              ? d.integrantes 
              : [{ apellidos_nombres: nombreCompleto, ci: estudianteSeleccionado.ci || '' }];

            const datosFormateados = {
              ...d,
              apellidos_nombres: nombreCompleto,
              especialidad: d.especialidad || espEstudiante,
              nivel: d.nivel || opcionesNivel[2],
              integrantes: integrantesCargados,
              departamento: d.departamento || DEPARTAMENTOS_BOLIVIA[0],
              fecha_inicio_pec: formatFechaInput(d.fecha_inicio_pec),
              fecha_conclusion_pec: formatFechaInput(d.fecha_conclusion_pec)
            };

            setFormData(prev => ({ ...prev, ...datosFormateados }));
            if (setFichaData) setFichaData(datosFormateados);
          } else {
            const defaultState = {
              ...initialFormState,
              apellidos_nombres: nombreCompleto,
              especialidad: espEstudiante,
              integrantes: [{ apellidos_nombres: nombreCompleto, ci: estudianteSeleccionado.ci || '' }]
            };
            setFormData(prev => ({ ...prev, ...defaultState }));
          }
        } catch (error) {
          mostrarNotificacion("Error", error.message || "No se pudo consultar el Acta de Inicio.", "error");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchActa();
  }, [isOpen, estudianteSeleccionado]);

  useEffect(() => {
    if (estudianteSeleccionado) {
      setFormData(prev => ({
        ...prev,
        apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
        especialidad: estudianteSeleccionado.especialidad || prev.especialidad,
        ...fichaData,
        fecha_inicio_pec: formatFechaInput(fichaData?.fecha_inicio_pec || prev.fecha_inicio_pec),
        fecha_conclusion_pec: formatFechaInput(fichaData?.fecha_conclusion_pec || prev.fecha_conclusion_pec)
      }));
    }
  }, [estudianteSeleccionado, fichaData]);

  const mostrarNotificacion = (titulo, mensaje, tipo = 'info') => {
    setModalNotif({ isOpen: true, titulo, mensaje, tipo });
  };

  const handleChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    if (setFichaData) setFichaData(updated);
  };

  const handleIntegranteChange = (idx, field, value) => {
    const list = [...formData.integrantes];
    list[idx][field] = value;
    handleChange('integrantes', list);
  };

  const addIntegrante = () => {
    if (formData.integrantes.length >= 3) {
      mostrarNotificacion("Límite Alcanzado", "El equipo comunitario admite un máximo de 3 integrantes.", "warning");
      return;
    }
    handleChange('integrantes', [...formData.integrantes, { apellidos_nombres: '', ci: '' }]);
  };

  const removeIntegrante = (idx) => {
    if (formData.integrantes.length <= 1) {
      mostrarNotificacion("Atención", "El equipo debe contar con al menos un integrante.", "warning");
      return;
    }
    handleChange('integrantes', formData.integrantes.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!estudianteSeleccionado?.id) {
      mostrarNotificacion("Estudiante No Seleccionado", "Debe seleccionar un estudiante antes de guardar.", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await actaInicio3erAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "El Acta de Inicio se guardó correctamente.", "success");
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
      const res = await actaInicio3erAnoService.delete(estudianteSeleccionado.id);
      const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      const clearedData = {
        ...initialFormState,
        apellidos_nombres: nombreCompleto,
        especialidad: estudianteSeleccionado.especialidad || listaEspecialidades[0] || ESPECIALIDADES_ESFM[0],
        integrantes: [{ apellidos_nombres: nombreCompleto, ci: estudianteSeleccionado.ci || '' }]
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "El Acta de Inicio fue eliminada.", "success");
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
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "ACTA DE INICIO PEC - 3ER AÑO"} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando datos del acta de inicio...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <h4 className="font-extrabold text-[#801B28] uppercase text-sm">
                  ACTA DE INICIO - IEPC PEC 3ER AÑO DE FORMACIÓN
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
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">ESFM/UA:</label>
                    <input type="text" value={formData.esfm_ua} onChange={(e) => handleChange('esfm_ua', e.target.value)} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Estudiante:</label>
                    <input type="text" readOnly value={formData.apellidos_nombres} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-extrabold text-slate-900 outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                    <select value={formData.especialidad} onChange={(e) => handleChange('especialidad', e.target.value)} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold">
                      {listaEspecialidades.map((esp, idx) => (
                        <option key={idx} value={esp}>{esp}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* INTEGRANTES DEL EQUIPO COMUNITARIO */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                    <Users size={15} /> INTEGRANTES DEL EQUIPO COMUNITARIO
                  </span>
                  <button type="button" onClick={addIntegrante} className="flex items-center gap-1 bg-[#801B28] text-white px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-rose-900 transition-colors cursor-pointer">
                    <Plus size={14} /> Añadir Integrante
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.integrantes.map((int, idx) => (
                    <div key={idx} className="flex flex-wrap sm:flex-nowrap gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="font-mono font-bold w-6 text-center text-slate-700">{idx + 1}</span>
                      <input type="text" placeholder="APELLIDOS Y NOMBRES" value={int.apellidos_nombres} onChange={(e) => handleIntegranteChange(idx, 'apellidos_nombres', e.target.value)} className="flex-1 border p-2 rounded-lg bg-white font-medium" />
                      <input type="text" placeholder="C.I." value={int.ci} onChange={(e) => handleIntegranteChange(idx, 'ci', e.target.value)} className="w-full sm:w-36 border p-2 rounded-lg bg-white font-mono" />
                      {formData.integrantes.length > 1 && (
                        <button type="button" onClick={() => removeIntegrante(idx)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* DATOS DE LA IEPC - PEC */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-[#801B28] uppercase text-[11px] block">DATOS DE LA IEPC - PEC</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Departamento:</label>
                    <select value={formData.departamento} onChange={(e) => handleChange('departamento', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold">
                      {DEPARTAMENTOS_BOLIVIA.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Distrito Educativo:</label>
                    <input type="text" value={formData.distrito_educativo} onChange={(e) => handleChange('distrito_educativo', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-medium" placeholder="Ej. El Alto 1" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Subsistema:</label>
                    <input type="text" value={formData.subsistema} onChange={(e) => handleChange('subsistema', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-medium" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Nivel:</label>
                    <select value={formData.nivel} onChange={(e) => handleChange('nivel', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold">
                      {opcionesNivel.map((n, idx) => (
                        <option key={idx} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Unidad Educativa / CEA / CEE:</label>
                    <input type="text" value={formData.ue_cea_cee} onChange={(e) => handleChange('ue_cea_cee', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-medium" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Año(s) de escolaridad asignado:</label>
                    <input type="text" value={formData.anos_escolaridad_asignado} onChange={(e) => handleChange('anos_escolaridad_asignado', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-medium" placeholder="Ej. 1ro A, 2do B" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Fecha de desarrollo de la PEC:</label>
                    <div className="flex gap-2 items-center">
                      <input type="date" value={formData.fecha_inicio_pec} onChange={(e) => handleChange('fecha_inicio_pec', e.target.value)} className="w-full border p-2 rounded-xl font-mono" />
                      <span className="font-bold text-slate-600">al</span>
                      <input type="date" value={formData.fecha_conclusion_pec} onChange={(e) => handleChange('fecha_conclusion_pec', e.target.value)} className="w-full border p-2 rounded-xl font-mono" />
                    </div>
                  </div>
                </div>
              </div>

              {/* DOCENTES */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                  <UserCheck size={15} /> ASIGNACIÓN DE DOCENTES
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Docente Acompañante ESFM/UA:</label>
                    <select value={formData.docente_acompanante_id} onChange={(e) => handleChange('docente_acompanante_id', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold text-slate-800">
                      <option value="">-- Seleccionar Docente Acompañante --</option>
                      {listaDocentes.map(d => <option key={d.id} value={d.id}>{d.nombre} {d.apellido}</option>)}
                    </select>
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
        titulo="¿Eliminar Acta de Inicio?"
        mensaje="Esta acción eliminará de forma permanente el registro del acta de inicio."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};