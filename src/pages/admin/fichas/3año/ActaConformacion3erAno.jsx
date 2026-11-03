import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { Plus, Trash2, MapPin, Users, Save, Loader2, Trash, X, UserCheck } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM } from '../../../../utils/camposFichas';
import { actaConformacion3erAnoService } from '../../../../services/fichas/3año/actaConformacion3erAnoService';
import { especialidadService } from '../../../../services/especialidadService';
import { studentService } from '../../../../services/studentService';

export const ActaConformacion3erAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "3_ACTA_EQUIPO";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Lista general de estudiantes para autocompletado y búsqueda global
  const [todosEstudiantes, setTodosEstudiantes] = useState([]);
  const [activeSearchIndex, setActiveSearchIndex] = useState(null);

  // Lista de especialidades desde la base de datos
  const [listaEspecialidades, setListaEspecialidades] = useState(ESPECIALIDADES_ESFM);

  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  const initialFormState = {
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    hora: '09:00',
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    gestion: '2026',
    ano_formacion: '3er Año de Formación',
    especialidad: ESPECIALIDADES_ESFM[0],
    integrantes: [{ apellidos_nombres: '', ci: '', celular: '' }]
  };

  const [formData, setFormData] = useState({
    ...initialFormState,
    ...fichaData
  });

  // Función para asegurar que el estudiante logueado esté siempre en la primera posición (fila 1)
  const ordenarIntegrantesConEstudiantePrincipal = (integrantesList, estPrincipal) => {
    if (!estPrincipal) return integrantesList;
    const ciPrincipal = String(estPrincipal.ci || '').trim();
    const nombreCompletoPrincipal = `${estPrincipal.apellido || ''} ${estPrincipal.nombre || ''}`.trim().toLowerCase();

    const principalObj = {
      apellidos_nombres: `${estPrincipal.apellido || ''} ${estPrincipal.nombre || ''}`.trim(),
      ci: estPrincipal.ci || '',
      celular: estPrincipal.telefono || estPrincipal.celular || ''
    };

    if (!Array.isArray(integrantesList) || integrantesList.length === 0) {
      return [principalObj];
    }

    // Buscar si el estudiante principal ya tiene datos personalizados (como celular) en la lista existente
    let celularEncontrado = principalObj.celular;
    const listaLimpia = [];
    const cisVistos = new Set();

    integrantesList.forEach(item => {
      const itemCi = String(item.ci || '').trim();
      const itemNombre = String(item.apellidos_nombres || '').trim();
      
      const esPrincipal = (ciPrincipal && itemCi === ciPrincipal) || 
                          (itemNombre.toLowerCase() === nombreCompletoPrincipal);

      if (esPrincipal) {
        if (item.celular) celularEncontrado = item.celular;
      } else {
        if (itemCi && !cisVistos.has(itemCi)) {
          cisVistos.add(itemCi);
          listaLimpia.push(item);
        } else if (!itemCi && itemNombre) {
          listaLimpia.push(item);
        }
      }
    });

    principalObj.celular = celularEncontrado;
    return [principalObj, ...listaLimpia];
  };

  // Cargar catálogo de especialidades y lista de estudiantes desde la API
  useEffect(() => {
    const fetchCatalogos = async () => {
      if (isOpen) {
        try {
          const [dataEspec, dataEstud] = await Promise.all([
            especialidadService.getEspecialidades(),
            studentService.getStudents()
          ]);

          if (Array.isArray(dataEspec) && dataEspec.length > 0) {
            const nombres = dataEspec.map(item => typeof item === 'string' ? item : item.nombre).filter(Boolean);
            if (nombres.length > 0) {
              setListaEspecialidades(nombres);
            }
          }

          setTodosEstudiantes(Array.isArray(dataEstud) ? dataEstud : dataEstud?.estudiantes || []);
        } catch (error) {
          console.warn("No se pudieron cargar los catálogos del servidor, usando lista por defecto.", error);
        }
      }
    };

    fetchCatalogos();
  }, [isOpen]);

  // Cargar datos del acta verificando si ya existe de forma directa o cruzada por integrantes
  useEffect(() => {
    const fetchActaYGestionarDatos = async () => {
      if (isOpen && estudianteSeleccionado?.id) {
        setLoading(true);
        try {
          let datosEncontrados = null;
          const espEstudiante = estudianteSeleccionado.especialidad || listaEspecialidades[0] || ESPECIALIDADES_ESFM[0];
          const gestionEstudiante = String(estudianteSeleccionado.gestion || estudianteSeleccionado.ano_gestion || '2026').slice(0, 4);

          // Intento A: Búsqueda directa
          const res = await actaConformacion3erAnoService.getByEstudiante(estudianteSeleccionado.id);
          if (res.existe && res.datos) {
            datosEncontrados = res.datos;
          } else {
            // Intento B: Búsqueda cruzada en actas de compañeros de equipo
            try {
              const listaEsts = Array.isArray(todosEstudiantes) && todosEstudiantes.length > 0 
                ? todosEstudiantes 
                : (await studentService.getStudents())?.estudiantes || [];
              
              for (const est of listaEsts) {
                if (String(est.id) === String(estudianteSeleccionado.id)) continue;
                const resAlt = await actaConformacion3erAnoService.getByEstudiante(est.id);
                if (resAlt.existe && resAlt.datos && Array.isArray(resAlt.datos.integrantes)) {
                  const pertenece = resAlt.datos.integrantes.some(int => 
                    String(int.ci || '').trim() === String(estudianteSeleccionado.ci || '').trim()
                  );
                  if (pertenece) {
                    datosEncontrados = resAlt.datos;
                    break;
                  }
                }
              }
            } catch (errAlt) {
              console.warn("Búsqueda cruzada opcional no disponible en 3er Año:", errAlt);
            }
          }

          if (datosEncontrados) {
            const d = datosEncontrados;
            const integrantesOrdenados = ordenarIntegrantesConEstudiantePrincipal(
              d.integrantes || [], 
              estudianteSeleccionado
            );

            setFormData(prev => ({
              ...prev,
              ...d,
              integrantes: integrantesOrdenados,
              especialidad: d.especialidad || prev.especialidad || espEstudiante,
              lugar_ciudad: d.lugar_ciudad || 'El Alto',
              departamento: d.departamento || DEPARTAMENTOS_BOLIVIA[0],
              dia: d.dia || String(new Date().getDate()),
              mes: d.mes || MESES_ANIO[new Date().getMonth()],
              gestion: String(d.gestion || gestionEstudiante).slice(0, 4)
            }));
            if (setFichaData) setFichaData({ ...d, integrantes: integrantesOrdenados });
          } else {
            const defaultIntegrantes = ordenarIntegrantesConEstudiantePrincipal([], estudianteSeleccionado);
            const defaultState = {
              ...initialFormState,
              especialidad: formData.especialidad || espEstudiante,
              gestion: gestionEstudiante,
              integrantes: defaultIntegrantes
            };
            setFormData(prev => ({ ...prev, ...defaultState }));
          }
        } catch (error) {
          mostrarNotificacion("Error", error.message || "No se pudo consultar el Acta de Conformación.", "error");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchActaYGestionarDatos();
  }, [isOpen, estudianteSeleccionado, todosEstudiantes]);

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

  const handleSelectEstudianteAuto = (idx, est) => {
    const nuevoCi = String(est.ci || '').trim();
    const nuevoNombre = `${est.apellido || ''} ${est.nombre || ''}`.trim();

    const yaExiste = formData.integrantes.some((int, i) => i !== idx && String(int.ci || '').trim() === nuevoCi);
    if (yaExiste) {
      mostrarNotificacion("Integrante Duplicado", "Este estudiante ya se encuentra registrado en el equipo comunitario.", "error");
      return;
    }

    const list = [...formData.integrantes];
    list[idx] = {
      apellidos_nombres: nuevoNombre,
      ci: nuevoCi,
      celular: est.telefono || est.celular || ''
    };

    const listaOrdenada = ordenarIntegrantesConEstudiantePrincipal(list, estudianteSeleccionado);
    handleChange('integrantes', listaOrdenada);
    setActiveSearchIndex(null);
  };

  const addIntegrante = () => {
    if (formData.integrantes.length >= 3) {
      mostrarNotificacion("Límite Alcanzado", "El equipo comunitario puede tener un máximo de 3 integrantes.", "warning");
      return;
    }
    handleChange('integrantes', [...formData.integrantes, { apellidos_nombres: '', ci: '', celular: '' }]);
  };

  const removeIntegrante = (idx) => {
    if (idx === 0) {
      mostrarNotificacion("Acción no permitida", "El estudiante titular del acta no puede ser eliminado de los integrantes.", "error");
      return;
    }
    if (formData.integrantes.length <= 1) {
      mostrarNotificacion("Atención", "El equipo comunitario debe contar con al menos un integrante.", "warning");
      return;
    }
    handleChange('integrantes', formData.integrantes.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!estudianteSeleccionado?.id) {
      mostrarNotificacion("Estudiante No Seleccionado", "Debe seleccionar un estudiante antes de guardar.", "error");
      return;
    }

    const integrantesLimpios = ordenarIntegrantesConEstudiantePrincipal(formData.integrantes, estudianteSeleccionado);
    const payloadFinal = { ...formData, integrantes: integrantesLimpios };

    setSaving(true);
    try {
      const res = await actaConformacion3erAnoService.saveOrUpdate(estudianteSeleccionado.id, payloadFinal);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "El Acta de Conformación se registró correctamente.", "success");
    } catch (error) {
      mostrarNotificacion("Error al Guardar", error.message || "No se pudieron guardar los datos del acta.", "error");
    } finally {
      setSaving(false);
    }
  };

  const ejecutarEliminacion = async () => {
    if (!estudianteSeleccionado?.id) return;

    setDeleting(true);
    try {
      const res = await actaConformacion3erAnoService.delete(estudianteSeleccionado.id);
      const clearedIntegrantes = ordenarIntegrantesConEstudiantePrincipal([], estudianteSeleccionado);
      const clearedData = {
        ...initialFormState,
        especialidad: formData.especialidad || estudianteSeleccionado.especialidad || listaEspecialidades[0] || ESPECIALIDADES_ESFM[0],
        integrantes: clearedIntegrantes
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "El acta fue eliminada con éxito.", "success");
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
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "ACTA DE CONFORMACIÓN Y COMPROMISO - 3ER AÑO"} footer={footerButtons}>
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
                  ACTA DE CONFORMACIÓN Y COMPROMISO DEL EQUIPO COMUNITARIO - PEC 3ER AÑO
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

              {/* DATOS LUGAR Y ENCABEZADO */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                  <MapPin size={15} /> DATOS DE REUNIÓN Y UBICACIÓN
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Ciudad / Localidad:</label>
                    <input type="text" value={formData.lugar_ciudad} onChange={(e) => handleChange('lugar_ciudad', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-medium" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Departamento:</label>
                    <select value={formData.departamento} onChange={(e) => handleChange('departamento', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold text-slate-800">
                      {DEPARTAMENTOS_BOLIVIA.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Predios ESFM/UA:</label>
                    <input type="text" value={formData.esfm_ua} onChange={(e) => handleChange('esfm_ua', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-medium" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Hora:</label>
                    <input type="time" value={formData.hora} onChange={(e) => handleChange('hora', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Día:</label>
                    <input type="number" min="1" max="31" value={formData.dia} onChange={(e) => handleChange('dia', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Mes:</label>
                    <select value={formData.mes} onChange={(e) => handleChange('mes', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold uppercase">
                      {MESES_ANIO.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Gestión:</label>
                    <input type="number" value={formData.gestion} onChange={(e) => handleChange('gestion', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                    <select value={formData.especialidad} onChange={(e) => handleChange('especialidad', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold cursor-pointer">
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
                    <Users size={15} /> INTEGRANTES DEL EQUIPO COMUNITARIO ({formData.integrantes?.length || 0}/3)
                  </span>
                  <button type="button" onClick={addIntegrante} className="flex items-center gap-1 bg-[#801B28] text-white px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-rose-900 transition-colors cursor-pointer">
                    <Plus size={14} /> Añadir Integrante
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.integrantes.map((int, idx) => {
                    const searchTerm = (int.apellidos_nombres || '').toLowerCase().trim();
                    const filteredStudents = todosEstudiantes.filter(est => {
                      if (!searchTerm || searchTerm.length < 2) return false;
                      const fullName = `${est.nombre || ''} ${est.apellido || ''}`.toLowerCase();
                      const ci = String(est.ci || '').toLowerCase();
                      return fullName.includes(searchTerm) || ci.includes(searchTerm);
                    });

                    return (
                      <div key={idx} className="relative flex flex-wrap sm:flex-nowrap gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="font-mono font-bold w-6 text-center text-slate-700">{idx + 1}</span>

                        {/* INPUT APELLIDOS Y NOMBRES CON AUTOCOMPLETADO */}
                        <div className="relative flex-1 w-full">
                          <input
                            type="text"
                            placeholder="APELLIDOS Y NOMBRES"
                            value={int.apellidos_nombres}
                            onChange={(e) => {
                              handleIntegranteChange(idx, 'apellidos_nombres', e.target.value);
                              setActiveSearchIndex(idx);
                            }}
                            onFocus={() => setActiveSearchIndex(idx)}
                            className="w-full border p-2 rounded-lg bg-white font-medium outline-none focus:border-[#801B28]"
                          />

                          {/* MENÚ DESPLEGABLE CON COINCIDENCIAS */}
                          {activeSearchIndex === idx && filteredStudents.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto divide-y divide-slate-100">
                              {filteredStudents.map((est) => (
                                <div
                                  key={est.id}
                                  onClick={() => handleSelectEstudianteAuto(idx, est)}
                                  className="p-2 hover:bg-amber-50/80 cursor-pointer transition-colors flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                      <UserCheck size={14} className="text-emerald-700" />
                                      {est.apellido} {est.nombre}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono">
                                      C.I.: {est.ci} | Cel: {est.telefono || est.celular || 'S/N'}
                                    </div>
                                  </div>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-100 text-slate-700">
                                    {est.ano_formacion || 'S/A'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* INPUT C.I. */}
                        <input
                          type="text"
                          placeholder="C.I."
                          value={int.ci}
                          onChange={(e) => handleIntegranteChange(idx, 'ci', e.target.value)}
                          className="w-full sm:w-32 border p-2 rounded-lg bg-white font-mono outline-none focus:border-[#801B28]"
                        />

                        {/* INPUT NRO. CELULAR */}
                        <input
                          type="text"
                          placeholder="NRO. CELULAR"
                          value={int.celular}
                          onChange={(e) => handleIntegranteChange(idx, 'celular', e.target.value)}
                          className="w-full sm:w-36 border p-2 rounded-lg bg-white font-mono outline-none focus:border-[#801B28]"
                        />

                        {formData.integrantes.length > 1 && idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => removeIntegrante(idx)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Eliminar integrante"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    );
                  })}
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
        titulo="¿Eliminar Acta de Conformación?"
        mensaje="Esta acción eliminará el registro del acta de la base de datos de manera permanente."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};