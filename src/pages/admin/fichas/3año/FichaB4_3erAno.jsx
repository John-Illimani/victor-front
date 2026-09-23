import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { ConfirmModal } from '../../../../components/modals/ConfirmModal';
import { GraduationCap, MapPin, Save, Loader2, Trash, X } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, convertirNumeroALiteral } from '../../../../utils/camposFichas';
import { fichaB43erAnoService } from '../../../../services/fichas/3año/fichaB43erAnoService';

const formatInputValue = (val) => {
  if (val === null || val === undefined || val === '') return '';
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  return num % 1 === 0 ? String(Math.round(num)) : String(num);
};

export const FichaB4_3erAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "3_B4";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const dimensionesConfig = [
    {
      key: 'ser',
      titulo: '1. DIMENSIÓN: SER',
      criterios: [
        'Responsabilidad, compromiso y puntualidad en el desarrollo de la práctica educativa.',
        'Respeto en el trato con estudiantes, padres/madres de familia, maestras, maestros y personal de la UE/CEA/CEE.',
        'Promueve la práctica de valores sociocomunitarios en la UE/CEA/CEE.'
      ]
    },
    {
      key: 'saber',
      titulo: '2. DIMENSIÓN: SABER',
      criterios: [
        'Conocimiento y manejo de elementos curriculares de la planificación.',
        'Conocimiento y dominio de elementos propios de su especialidad.',
        'Promueve el fortalecimiento del pensamiento crítico y reflexivo con las y los estudiantes.',
        'Dominio de aula usando estrategias pertinentes.'
      ]
    },
    {
      key: 'hacer',
      titulo: '3. DIMENSIÓN: HACER',
      criterios: [
        'Manifiesta creatividad en el uso de recursos materiales y educativos.',
        'Utiliza instrumentos de evaluación durante la concreción curricular.'
      ]
    },
    {
      key: 'decidir',
      titulo: '4. DIMENSIÓN: DECIDIR',
      criterios: [
        'Asume las sugerencias y observaciones a los PDC elaborados.',
        'Aplica acciones de manera oportuna para la mejora de la PEC.'
      ]
    }
  ];

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [modalNotif, setModalNotif] = useState({ isOpen: false, titulo: '', mensaje: '', tipo: 'info' });
  const [modalConfirmDelete, setModalConfirmDelete] = useState(false);

  const initialFormState = {
    apellidos_nombres: '',
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    ano: '2026',
    ser: '',
    saber: '',
    hacer: '',
    decidir: '',
    promedio_numeral: 0,
    promedio_literal: 'CERO',
    observaciones: '',
    docente_guia_id: ''
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
          const res = await fichaB43erAnoService.getByEstudiante(estudianteSeleccionado.id);
          const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();

          if (res.existe && res.datos) {
            const d = res.datos;
            const promRaw = parseFloat(d.promedio_numeral || 0);
            const prom = promRaw % 1 === 0 ? Math.round(promRaw) : promRaw;

            setFormData(prev => ({
              ...prev,
              ...d,
              apellidos_nombres: nombreCompleto,
              ser: formatInputValue(d.ser),
              saber: formatInputValue(d.saber),
              hacer: formatInputValue(d.hacer),
              decidir: formatInputValue(d.decidir),
              promedio_numeral: prom,
              promedio_literal: d.promedio_literal || convertirNumeroALiteral(prom),
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
              apellidos_nombres: nombreCompleto
            };
            setFormData(prev => ({ ...prev, ...defaultState }));
          }
        } catch (error) {
          mostrarNotificacion("Error", error.message || "No se pudo consultar la Ficha B-4.", "error");
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

  const handleNotaChange = (key, value) => {
    let valorGuardar = value;

    if (value === '') {
      valorGuardar = '';
    } else {
      let val = parseFloat(value);
      if (isNaN(val)) valorGuardar = '';
      else if (val < 1) valorGuardar = 1;
      else if (val > 100) valorGuardar = 100;
      else valorGuardar = value.endsWith('.') ? value : val;
    }

    const newForm = { ...formData, [key]: valorGuardar };
    
    // Calcular promedio general entre los 4 campos (SER, SABER, HACER, DECIDIR)
    const campos = ['ser', 'saber', 'hacer', 'decidir'];
    const notas = campos.map(c => parseFloat(newForm[c])).filter(n => !isNaN(n));
    
    let prom = notas.length > 0 ? parseFloat((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)) : 0;
    if (prom % 1 === 0) prom = Math.round(prom);

    newForm.promedio_numeral = prom;
    newForm.promedio_final = prom;
    newForm.promedio_literal = convertirNumeroALiteral(prom);

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
      const res = await fichaB43erAnoService.saveOrUpdate(estudianteSeleccionado.id, formData);
      mostrarNotificacion("¡Guardado Exitoso!", res.message || "La Ficha B-4 se registró correctamente.", "success");
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
      const res = await fichaB43erAnoService.delete(estudianteSeleccionado.id);
      const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      const clearedData = {
        ...initialFormState,
        apellidos_nombres: nombreCompleto
      };

      setFormData(clearedData);
      if (setFichaData) setFichaData(clearedData);
      setModalConfirmDelete(false);
      mostrarNotificacion("Registro Eliminado", res.message || "La Ficha B-4 fue eliminada con éxito.", "success");
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
      <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-4: SEGUIMIENTO Y APOYO DEL DOCENTE TUTOR/ACOMPAÑANTE"} footer={footerButtons}>
        <div className="space-y-4 text-xs font-sans">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#801B28]" />
              <span className="font-bold text-slate-600">Cargando evaluación de Ficha B-4...</span>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
              
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                <h4 className="font-extrabold text-[#801B28] uppercase text-sm">
                  FICHA B-4: SEGUIMIENTO Y APOYO DEL DOCENTE TUTOR / ACOMPAÑANTE - 3ER AÑO
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
                  <GraduationCap size={15} /> NOMBRE DEL ESTUDIANTE
                </span>
                <input type="text" readOnly value={formData.apellidos_nombres} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-extrabold text-slate-900 outline-none" />
              </div>

              {/* EVALUACIÓN POR DIMENSIONES (4 CAMPOS ÚNICOS) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
                <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
                  EVALUACIÓN DE DIMENSIONES FORMATIVAS
                </span>

                {dimensionesConfig.map(dim => (
                  <div key={dim.key} className="space-y-2">
                    <span className="font-black text-[#801B28] text-[11px] uppercase tracking-wide block bg-rose-50/80 p-2 rounded-xl border border-rose-100">
                      {dim.titulo}
                    </span>
                    
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                      <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium pl-1 text-[11px]">
                        {dim.criterios.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>

                      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200">
                        <span className="font-extrabold text-slate-800 text-xs">Puntaje Dimensión (1 a 100):</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="1-100"
                          value={formatInputValue(formData[dim.key])}
                          onChange={(e) => handleNotaChange(dim.key, e.target.value)}
                          className="w-28 border p-2 rounded-lg bg-white font-mono font-bold text-center text-slate-900 text-sm focus:border-[#801B28] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Promedio Final Numeral:</label>
                    <div className="font-mono font-black text-2xl text-[#801B28]">
                      {formatInputValue(formData.promedio_numeral) || '0'} / 100 PTS
                    </div>
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 text-[10px] uppercase">Literal:</label>
                    <div className="font-extrabold text-xs text-slate-900 uppercase mt-2">{formData.promedio_literal || 'CERO'}</div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-1">Observaciones / Sugerencias:</label>
                  <textarea
                    rows="3"
                    value={formData.observaciones}
                    onChange={(e) => handleCampoChange('observaciones', e.target.value)}
                    className="w-full border p-2.5 rounded-xl font-medium text-slate-800 text-xs focus:border-[#801B28] outline-none"
                    placeholder="Escriba aquí sus observaciones..."
                  />
                </div>
              </div>

              {/* LUGAR Y FECHA */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-[#801B28] uppercase text-[11px] flex items-center gap-1.5">
                  <MapPin size={14} /> LUGAR Y FECHA DE EVALUACIÓN
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
        titulo="¿Eliminar Ficha B-4?"
        mensaje="Esta acción eliminará de forma permanente el registro de la Ficha B-4 de la base de datos."
        tipo="danger"
        cargando={deleting}
      />
    </>
  );
};