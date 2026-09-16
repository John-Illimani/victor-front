import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { GraduationCap, MapPin, Plus, Trash2, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, MODALIDADES_GRADUACION_ESFM } from '../../../../utils/camposFichas';
import { actaFinalEvaluacion4toAnoService } from '../../../../services/fichas/4año/actaFinalEvaluacion4toAnoService';

export const ActaFinalEvolucion_4toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "4_ACTA_FINAL";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  const initialFormState = {
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    lugar_ciudad: 'El Alto',
    hora_acta: '08:00',
    dia_acta: String(new Date().getDate()),
    mes_acta: MESES_ANIO[new Date().getMonth()],
    ano_acta: '2026',
    titulo_diseno: '',
    modalidad_graduacion: MODALIDADES_GRADUACION_ESFM[0],
    integrantes: [],
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
          const res = await actaFinalEvaluacion4toAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();

          const primerIntegranteDefault = [{
            ci: estudianteSeleccionado.ci || '',
            nombres: nombreCompleto,
            nota_diseno: '',
            nota_socializacion: '',
            promedio: 0,
            resultado: 'Aprobado'
          }];

          if (res.existe && res.datos) {
            const d = res.datos;
            const updatedIntegrantes = Array.isArray(d.integrantes) && d.integrantes.length > 0 
              ? d.integrantes 
              : primerIntegranteDefault;

            const updatedState = {
              ...initialFormState,
              ...d,
              esfm_ua: d.esfm_ua || 'ESFM Simón Bolívar / UA El Alto',
              lugar_ciudad: d.lugar_ciudad || 'El Alto',
              hora_acta: d.hora_acta || '08:00',
              dia_acta: d.dia_acta || String(new Date().getDate()),
              mes_acta: d.mes_acta || MESES_ANIO[new Date().getMonth()],
              ano_acta: String(d.ano_acta || '2026').slice(0, 4),
              titulo_diseno: d.titulo_diseno || '',
              modalidad_graduacion: d.modalidad_graduacion || MODALIDADES_GRADUACION_ESFM[0],
              integrantes: updatedIntegrantes.map(integ => recalcularIntegranteRow(integ)),
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
              integrantes: primerIntegranteDefault
            };
            setFormData(defaultState);
            if (setFichaData) setFichaData(defaultState);
          }
        } catch (error) {
          mostrarNotificacion("Error", error.message || "No se pudo consultar el Acta Final.", "error");
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

  const recalcularIntegranteRow = (integ) => {
    const nd = parseFloat(integ.nota_diseno);
    const ns = parseFloat(integ.nota_socializacion);
    const validas = [nd, ns].filter(n => !isNaN(n));

    const prom = validas.length > 0 
      ? parseFloat((validas.reduce((a, b) => a + b, 0) / validas.length).toFixed(2)) 
      : 0;

    return {
      ...integ,
      promedio: prom,
      resultado: prom >= 51 ? 'Aprobado' : 'Reprobado'
    };
  };

  const handleIntegranteChange = (index, field, val) => {
    let finalVal = val;

    if (field === 'nota_diseno' || field === 'nota_socializacion') {
      let num = parseFloat(val);
      if (isNaN(num)) finalVal = '';
      else if (num < 0) finalVal = 0;
      else if (num > 100) finalVal = 100;
      else finalVal = num;
    }

    const updatedIntegrantes = [...(formData.integrantes || [])];
    const target = { ...updatedIntegrantes[index], [field]: finalVal };

    updatedIntegrantes[index] = recalcularIntegranteRow(target);

    const newForm = { ...formData, integrantes: updatedIntegrantes };
    setFormData(newForm);
    if (setFichaData) setFichaData(newForm);
  };

  const addIntegrante = () => {
    const updatedIntegrantes = [
      ...(formData.integrantes || []),
      { ci: '', nombres: '', nota_diseno: '', nota_socializacion: '', promedio: 0, resultado: 'Aprobado' }
    ];
    const newForm = { ...formData, integrantes: updatedIntegrantes };
    setFormData(newForm);
    if (setFichaData) setFichaData(newForm);
  };

  const removeIntegrante = (index) => {
    if (formData.integrantes.length <= 1) return;
    const updatedIntegrantes = formData.integrantes.filter((_, i) => i !== index);
    const newForm = { ...formData, integrantes: updatedIntegrantes };
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
      const res = await actaFinalEvaluacion4toAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "Acta Final guardada correctamente.", "success");
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
      const res = await actaFinalEvaluacion4toAnoService.delete(estudianteSeleccionado.id);
      const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      const clearedData = {
        ...initialFormState,
        integrantes: [{
          ci: estudianteSeleccionado.ci || '',
          nombres: nombreCompleto,
          nota_diseno: '',
          nota_socializacion: '',
          promedio: 0,
          resultado: 'Aprobado'
        }]
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "El Acta Final fue eliminada con éxito.", "success");
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
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "ACTA FINAL DEL PROCESO DE EVALUACIÓN DEL DISEÑO METODOLÓGICO DE IMPLEMENTACIÓN DEL TRABAJO DE GRADO (4TO AÑO)"} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando Acta Final...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <span className="font-extrabold text-[#801B28] uppercase text-xs">
                  ACTA FINAL DE EVALUACIÓN - 4TO AÑO
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

              {/* DATOS DE LA SESIÓN DE EVALUACIÓN */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-[#801B28] uppercase text-[11px] flex items-center gap-1.5 border-b pb-2">
                  <GraduationCap size={15} /> DATOS DE LA SESIÓN DE EVALUACIÓN
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">ESFM/UA:</label>
                    <input type="text" value={formData.esfm_ua} onChange={(e) => handleCampoChange('esfm_ua', e.target.value)} className="w-full border p-2 rounded-xl font-bold" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Ciudad:</label>
                    <input type="text" value={formData.lugar_ciudad} onChange={(e) => handleCampoChange('lugar_ciudad', e.target.value)} className="w-full border p-2 rounded-xl font-bold" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Hora de inicio:</label>
                    <input type="text" value={formData.hora_acta} onChange={(e) => handleCampoChange('hora_acta', e.target.value)} className="w-full border p-2 rounded-xl font-bold font-mono" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Día de la sesión:</label>
                    <input type="text" value={formData.dia_acta} onChange={(e) => handleCampoChange('dia_acta', e.target.value)} className="w-full border p-2 rounded-xl font-mono font-bold" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Mes de la sesión:</label>
                    <select value={formData.mes_acta} onChange={(e) => handleCampoChange('mes_acta', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold uppercase">
                      {MESES_ANIO.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Año de la sesión:</label>
                    <input type="text" value={formData.ano_acta} onChange={(e) => handleCampoChange('ano_acta', e.target.value)} className="w-full border p-2 rounded-xl font-mono font-bold" />
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Título del Diseño Metodológico:</label>
                    <input type="text" value={formData.titulo_diseno} onChange={(e) => handleCampoChange('titulo_diseno', e.target.value)} className="w-full border p-2 rounded-xl font-bold focus:border-[#801B28] outline-none" placeholder="Escriba el título completo..." />
                  </div>
                  <div className="sm:col-span-6">
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Modalidad de Graduación:</label>
                    <select value={formData.modalidad_graduacion} onChange={(e) => handleCampoChange('modalidad_graduacion', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold focus:border-[#801B28] outline-none">
                      {MODALIDADES_GRADUACION_ESFM.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* TABLA DE EVALUACIÓN OFICIAL DE INTEGRANTES */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-extrabold text-slate-800 uppercase text-[11px]">
                    PUNTAJE FINAL DE EVALUACIÓN
                  </span>
                  <button
                    type="button"
                    onClick={addIntegrante}
                    className="px-3 py-1 bg-[#801B28] text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-sm hover:bg-[#a32334] transition-all cursor-pointer"
                  >
                    <Plus size={12} /> Agregar Estudiante
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-200 text-center text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-extrabold">
                        <th className="p-2 border border-slate-200 w-10">No.</th>
                        <th className="p-2 border border-slate-200 w-28">C.I.</th>
                        <th className="p-2 border border-slate-200 text-left">NOMBRES Y APELLIDOS</th>
                        <th className="p-2 border border-slate-200 w-28 bg-amber-50">Documento Diseño</th>
                        <th className="p-2 border border-slate-200 w-28 bg-amber-50">Socialización Comunitaria</th>
                        <th className="p-2 border border-slate-200 w-24 bg-rose-50">Promedio</th>
                        <th className="p-2 border border-slate-200 w-28">Resultado (Aprobado/Reprobado)</th>
                        <th className="p-2 border border-slate-200 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {formData.integrantes?.map((integ, index) => (
                        <tr key={index} className="hover:bg-slate-50/80">
                          <td className="p-2 border font-bold text-slate-600">{index + 1}</td>
                          <td className="p-1.5 border">
                            <input
                              type="text"
                              placeholder="C.I."
                              value={integ.ci}
                              onChange={(e) => handleIntegranteChange(index, 'ci', e.target.value)}
                              className="w-full border p-1.5 rounded-lg text-center font-mono font-bold bg-white focus:border-[#801B28] outline-none"
                            />
                          </td>
                          <td className="p-1.5 border text-left">
                            <input
                              type="text"
                              placeholder="Nombres y Apellidos"
                              value={integ.nombres}
                              onChange={(e) => handleIntegranteChange(index, 'nombres', e.target.value)}
                              className="w-full border p-1.5 rounded-lg font-bold bg-white focus:border-[#801B28] outline-none"
                            />
                          </td>
                          <td className="p-1.5 border bg-amber-50/30">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="0-100"
                              value={integ.nota_diseno ?? ''}
                              onChange={(e) => handleIntegranteChange(index, 'nota_diseno', e.target.value)}
                              className="w-full border p-1.5 rounded-lg text-center font-mono font-bold bg-white focus:border-[#801B28] outline-none"
                            />
                          </td>
                          <td className="p-1.5 border bg-amber-50/30">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="0-100"
                              value={integ.nota_socializacion ?? ''}
                              onChange={(e) => handleIntegranteChange(index, 'nota_socializacion', e.target.value)}
                              className="w-full border p-1.5 rounded-lg text-center font-mono font-bold bg-white focus:border-[#801B28] outline-none"
                            />
                          </td>
                          <td className="p-2 border font-mono font-black text-sm text-[#801B28] bg-rose-50/30">
                            {integ.promedio || '0.00'}
                          </td>
                          <td className={`p-2 border font-black uppercase text-xs ${integ.resultado === 'Aprobado' ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {integ.resultado}
                          </td>
                          <td className="p-1 border text-center">
                            {formData.integrantes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeIntegrante(index)}
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
        titulo="¿Eliminar Acta Final?"
        mensaje="Esta acción borrará de forma permanente el registro del Acta Final de Evaluación."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};