import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { Plus, Trash2, MapPin, Users, GraduationCap, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM } from '../../../../utils/camposFichas';
import { actaInicio2doAnoService } from '../../../../services/fichas/2año/actaInicio2doAnoService';
import { especialidadService } from '../../../../services/especialidadService';

export const ActaInicio2doAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "2_ACTA_INICIO";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const OpcionesNivel = [
    'Inicial En Familia Comunitaria',
    'Primaria Comunitaria Vocacional',
    'Secundaria Comunitaria Productiva'
  ];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [especialidadesList, setEspecialidadesList] = useState(ESPECIALIDADES_ESFM);

  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  const initialFormState = {
    apellidos_nombres: '',
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    especialidad: ESPECIALIDADES_ESFM[0] || '',
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    paralelo: "A",
    gestion: '2026',
    distrito_educativo: '',
    ue_cea_cee: '',
    especialidad_iepc: ESPECIALIDADES_ESFM[0] || '',
    anos_escolaridad_paralelos: '',
    subsistema: 'Educación Regular',
    nivel: OpcionesNivel[1],
    fecha_inicio_pec: '',
    fecha_conclusion_pec: '',
    director_ue_nombre: '',
    integrantes: [{ apellidos_nombres: '', especialidad: '', ci: '' }]
  };

  const [formData, setFormData] = useState({
    ...initialFormState,
    ...fichaData
  });

  // Limpieza estricta de fecha ISO a YYYY-MM-DD para HTML input date
  const formatFechaInput = (fechaStr) => {
    if (!fechaStr) return '';
    return String(fechaStr).includes('T') ? String(fechaStr).split('T')[0] : String(fechaStr).substring(0, 10);
  };

  // Cargar lista dinámica de especialidades desde API
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

  // Cargar datos del acta desde la API y formatear las fechas recibidas
  useEffect(() => {
    const fetchActa = async () => {
      if (isOpen && estudianteSeleccionado?.id) {
        setLoading(true);
        try {
          const res = await actaInicio2doAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
          const espEstudiante = estudianteSeleccionado.especialidad || initialFormState.especialidad;

          if (res.existe && res.datos) {
            const d = res.datos;
            setFormData(prev => ({
              ...prev,
              ...d,
              apellidos_nombres: nombreCompleto,
              especialidad: d.especialidad || espEstudiante,
              especialidad_iepc: d.especialidad_iepc || espEstudiante,
              paralelo: d.paralelo || estudianteSeleccionado.paralelo || 'A',
              fecha_inicio_pec: formatFechaInput(d.fecha_inicio_pec),
              fecha_conclusion_pec: formatFechaInput(d.fecha_conclusion_pec),
              director_ue_nombre: d.director_ue_nombre || '',
              nivel: d.nivel || OpcionesNivel[1],
              lugar_ciudad: d.lugar_ciudad || 'El Alto',
              departamento: d.departamento || DEPARTAMENTOS_BOLIVIA[0],
              dia: d.dia || String(new Date().getDate()),
              mes: d.mes || MESES_ANIO[new Date().getMonth()],
              integrantes: Array.isArray(d.integrantes) && d.integrantes.length > 0 ? d.integrantes : initialFormState.integrantes
            }));
            if (setFichaData) setFichaData(d);
          } else {
            const defaultState = {
              ...initialFormState,
              apellidos_nombres: nombreCompleto,
              especialidad: espEstudiante,
              especialidad_iepc: espEstudiante,
              paralelo: estudianteSeleccionado.paralelo || initialFormState.paralelo
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
        especialidad_iepc: estudianteSeleccionado.especialidad || prev.especialidad_iepc,
        paralelo: estudianteSeleccionado.paralelo || prev.paralelo,
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
    handleChange('integrantes', [...formData.integrantes, { apellidos_nombres: '', especialidad: '', ci: '' }]);
  };

  const removeIntegrante = (idx) => {
    handleChange('integrantes', formData.integrantes.filter((_, i) => i !== idx));
  };

  // Guardar Acta
  const handleSave = async () => {
    if (!estudianteSeleccionado?.id) {
      mostrarNotificacion("Estudiante No Seleccionado", "Debe seleccionar un estudiante antes de guardar.", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await actaInicio2doAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "El Acta de Inicio fue registrada correctamente.", "success");
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
      const res = await actaInicio2doAnoService.delete(estudianteSeleccionado.id);
      const clearedData = {
        ...initialFormState,
        apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
        especialidad: estudianteSeleccionado.especialidad || initialFormState.especialidad,
        especialidad_iepc: estudianteSeleccionado.especialidad || initialFormState.especialidad_iepc,
        paralelo: estudianteSeleccionado.paralelo || initialFormState.paralelo
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "Acta de Inicio eliminada con éxito.", "success");
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
        {saving ? "Guardando..." : "Guardar Acta de Inicio"}
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
              <span className="font-bold text-slate-600">Cargando información del acta...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <h4 className="font-extrabold text-[#801B28] uppercase text-sm">
                  {config?.titulo || "ACTA DE INICIO PEC - 2DO AÑO"}
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
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-sm space-y-3">
                <span className="font-extrabold text-amber-900 uppercase text-[11px] flex items-center gap-1.5">
                  <GraduationCap size={15} /> DATOS REFERENCIALES DEL ESTUDIANTE
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Apellidos y Nombres:</label>
                    <input type="text" readOnly value={formData.apellidos_nombres} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-extrabold text-slate-900" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">ESFM/UA:</label>
                    <input type="text" value={formData.esfm_ua} onChange={(e) => handleChange('esfm_ua', e.target.value)} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold text-slate-800" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                    <select value={formData.especialidad} onChange={(e) => handleChange('especialidad', e.target.value)} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold text-slate-800 cursor-pointer">
                      {especialidadesList.map(esp => <option key={esp} value={esp}>{esp}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Paralelo:</label>
                    <input type="text" value={formData.paralelo} onChange={(e) => handleChange('paralelo', e.target.value)} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold text-slate-800" />
                  </div>
                </div>
              </div>

              {/* INTEGRANTES DEL EQUIPO COMUNITARIO */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                    <Users size={15} /> INTEGRANTES DEL EQUIPO COMUNITARIO IEPC-PEC:
                  </span>
                  <button type="button" onClick={addIntegrante} className="flex items-center gap-1 bg-[#801B28] text-white px-2.5 py-1 rounded-xl font-bold text-[10px] cursor-pointer hover:bg-rose-900 transition-colors">
                    <Plus size={14} /> Integrante
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.integrantes.map((int, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <span className="font-mono font-bold w-6 text-center text-xs">{idx + 1}</span>
                      <input
                        type="text"
                        placeholder="APELLIDOS Y NOMBRES"
                        value={int.apellidos_nombres}
                        onChange={(e) => handleIntegranteChange(idx, 'apellidos_nombres', e.target.value)}
                        className="flex-1 border p-1.5 rounded-lg bg-white font-medium text-xs outline-none focus:border-[#801B28]"
                      />
                      <select
                        value={int.especialidad}
                        onChange={(e) => handleIntegranteChange(idx, 'especialidad', e.target.value)}
                        className="flex-1 border p-1.5 rounded-lg bg-white font-bold text-xs text-slate-800 cursor-pointer outline-none focus:border-[#801B28]"
                      >
                        <option value="">SELECCIONAR ESPECIALIDAD</option>
                        {especialidadesList.map(esp => (
                          <option key={esp} value={esp}>{esp}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="C.I."
                        value={int.ci}
                        onChange={(e) => handleIntegranteChange(idx, 'ci', e.target.value)}
                        className="w-28 border p-1.5 rounded-lg bg-white font-mono text-xs outline-none focus:border-[#801B28]"
                      />
                      {formData.integrantes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIntegrante(idx)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 cursor-pointer transition-colors"
                          title="Eliminar integrante"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* DATOS DE LA IEPC-PEC */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-black text-[#801B28] uppercase text-[11px] block">DATOS DE LA IEPC-PEC</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Departamento:</label>
                    <select value={formData.departamento} onChange={(e) => handleChange('departamento', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold">
                      {DEPARTAMENTOS_BOLIVIA.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Distrito Educativo:</label>
                    <input type="text" value={formData.distrito_educativo} onChange={(e) => handleChange('distrito_educativo', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-medium" placeholder="Ej. Distrito 1 El Alto" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Unidad Educativa / CEA / CEE:</label>
                    <input type="text" value={formData.ue_cea_cee} onChange={(e) => handleChange('ue_cea_cee', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-medium" placeholder="Ej. Franz Tamayo" />
                  </div>
                  
                  {/* Especialidad Asignada con API y Selector */}
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad Asignada:</label>
                    <select value={formData.especialidad_iepc} onChange={(e) => handleChange('especialidad_iepc', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold text-slate-800 cursor-pointer">
                      {especialidadesList.map(esp => <option key={esp} value={esp}>{esp}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Años de Escolaridad y Paralelos:</label>
                    <input type="text" value={formData.anos_escolaridad_paralelos} onChange={(e) => handleChange('anos_escolaridad_paralelos', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-medium" placeholder="Ej. 1º A, 2º B" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 text-[10px] mb-1">Subsistema:</label>
                      <input type="text" value={formData.subsistema} onChange={(e) => handleChange('subsistema', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-medium" />
                    </div>
                    
                    {/* Nivel con Selector Estándar */}
                    <div>
                      <label className="block font-bold text-slate-700 text-[10px] mb-1">Nivel:</label>
                      <select value={formData.nivel} onChange={(e) => handleChange('nivel', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold text-slate-800 cursor-pointer">
                        {OpcionesNivel.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Fechas de Desarrollo PEC reconociendo input date HTML */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Fechas de Desarrollo PEC:</label>
                    <div className="flex gap-2 items-center">
                      <input type="date" value={formData.fecha_inicio_pec} onChange={(e) => handleChange('fecha_inicio_pec', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-mono" />
                      <span className="font-bold">al</span>
                      <input type="date" value={formData.fecha_conclusion_pec} onChange={(e) => handleChange('fecha_conclusion_pec', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-mono" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Director(a) de UE/CEA/CEE:</label>
                    <input type="text" value={formData.director_ue_nombre} onChange={(e) => handleChange('director_ue_nombre', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-medium" placeholder="Nombre completo del Director(a)" />
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
        titulo="¿Eliminar Acta de Inicio?"
        mensaje="Esta acción eliminará el registro del Acta de Inicio de la base de datos de manera permanente."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};