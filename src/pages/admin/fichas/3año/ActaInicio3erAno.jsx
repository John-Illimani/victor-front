import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { Plus, Trash2, MapPin, Users, GraduationCap, UserCheck } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, ESPECIALIDADES_ESFM } from '../../../../utils/camposFichas';

export const ActaInicio3erAno = ({ isOpen, onClose, fichaData, setFichaData, listaDocentes = [], estudianteSeleccionado }) => {
  const codigoFicha = "3_ACTA_INICIO";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const [formData, setFormData] = useState({
    apellidos_nombres: '',
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    especialidad: ESPECIALIDADES_ESFM[0],
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    distrito_educativo: '',
    subsistema: 'Educación Regular',
    nivel: 'Secundaria Comunitaria Productiva',
    ue_cea_cee: '',
    anos_escolaridad_asignado: '',
    fecha_inicio_pec: '',
    fecha_conclusion_pec: '',
    docente_guia_id: '',
    docente_acompanante_id: '',
    integrantes: [{ apellidos_nombres: '', ci: '' }],
    ...fichaData
  });

  useEffect(() => {
    if (estudianteSeleccionado) {
      setFormData(prev => ({
        ...prev,
        apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
        especialidad: estudianteSeleccionado.especialidad || prev.especialidad,
        ...fichaData
      }));
    }
  }, [estudianteSeleccionado, fichaData]);

  const handleChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    setFichaData(updated);
  };

  const handleIntegranteChange = (idx, field, value) => {
    const list = [...formData.integrantes];
    list[idx][field] = value;
    handleChange('integrantes', list);
  };

  const addIntegrante = () => {
    handleChange('integrantes', [...formData.integrantes, { apellidos_nombres: '', ci: '' }]);
  };

  const removeIntegrante = (idx) => {
    handleChange('integrantes', formData.integrantes.filter((_, i) => i !== idx));
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "ACTA DE INICIO PEC - 3ER AÑO"}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          <h4 className="font-extrabold text-[#801B28] uppercase text-center text-sm border-b pb-2">
            ACTA DE INICIO INVESTIGACIÓN EDUCATIVA PRODUCCIÓN DE CONOCIMIENTOS PRÁCTICA EDUCATIVA COMUNITARIA
          </h4>

          {/* DATOS REFERENCIALES */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
            <span className="font-extrabold text-amber-900 uppercase text-[11px] flex items-center gap-1.5">
              <GraduationCap size={15} /> DATOS REFERENCIALES
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">ESFM/UA:</label>
                <input type="text" value={formData.esfm_ua} onChange={(e) => handleChange('esfm_ua', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Estudiante:</label>
                <input type="text" readOnly value={formData.apellidos_nombres} className="w-full border p-2 rounded-xl bg-white font-extrabold text-slate-900" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                <select value={formData.especialidad} onChange={(e) => handleChange('especialidad', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold">
                  {ESPECIALIDADES_ESFM.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* INTEGRANTES DEL EQUIPO COMUNITARIO */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                <Users size={15} /> INTEGRANTES DEL EQUIPO COMUNITARIO
              </span>
              <button type="button" onClick={addIntegrante} className="flex items-center gap-1 bg-[#801B28] text-white px-2.5 py-1 rounded-xl font-bold text-[10px]">
                <Plus size={14} /> Integrante
              </button>
            </div>

            <div className="space-y-2">
              {formData.integrantes.map((int, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <span className="font-mono font-bold w-6 text-center">{idx + 1}</span>
                  <input type="text" placeholder="APELLIDOS Y NOMBRES" value={int.apellidos_nombres} onChange={(e) => handleIntegranteChange(idx, 'apellidos_nombres', e.target.value)} className="flex-1 border p-1.5 rounded-lg bg-white font-medium" />
                  <input type="text" placeholder="C.I." value={int.ci} onChange={(e) => handleIntegranteChange(idx, 'ci', e.target.value)} className="w-32 border p-1.5 rounded-lg bg-white font-mono" />
                  {formData.integrantes.length > 1 && (
                    <button type="button" onClick={() => removeIntegrante(idx)} className="p-1.5 text-rose-600">
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
                <input type="text" value={formData.nivel} onChange={(e) => handleChange('nivel', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-medium" />
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
                  <span className="font-bold">al</span>
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
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Docente Guía de UE/CEA/CEE:</label>
                <select value={formData.docente_guia_id} onChange={(e) => handleChange('docente_guia_id', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold text-slate-800">
                  <option value="">-- Seleccionar Docente Guía --</option>
                  {listaDocentes.map(d => <option key={d.id} value={d.id}>{d.nombre} {d.apellido}</option>)}
                </select>
              </div>
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
      </div>
    </ModalBase>
  );
};