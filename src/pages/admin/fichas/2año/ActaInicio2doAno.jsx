import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { Plus, Trash2, MapPin, Users, GraduationCap, UserCheck } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM } from '../../../../utils/camposFichas';

export const ActaInicio2doAno = ({ isOpen, onClose, fichaData, setFichaData, listaDocentes = [], estudianteSeleccionado }) => {
  const codigoFicha = "2_ACTA_INICIO";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const [formData, setFormData] = useState({
    apellidos_nombres: '',
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    especialidad: ESPECIALIDADES_ESFM[0],
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    paralelo: "ej A",
    gestion: '2026',
    distrito_educativo: '',
    ue_cea_cee: '',
    especialidad_iepc: '',
    anos_escolaridad_paralelos: '',
    subsistema: 'Educación Regular',
    nivel: 'Primaria Comunitaria Vocacional',
    fecha_inicio_pec: '',
    fecha_conclusion_pec: '',
    docente_acompanante_id: '',
    docente_guia_id: '',
    integrantes: [{ apellidos_nombres: '', especialidad: '', ci: '' }],
    ...fichaData
  });

  useEffect(() => {
    if (estudianteSeleccionado) {
      setFormData(prev => ({
        ...prev,
        apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
        especialidad: estudianteSeleccionado.especialidad || prev.especialidad,
        especialidad_iepc: estudianteSeleccionado.especialidad || prev.especialidad,
        paralelo: estudianteSeleccionado.paralelo || prev.paralelo,
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
    handleChange('integrantes', [...formData.integrantes, { apellidos_nombres: '', especialidad: '', ci: '' }]);
  };

  const removeIntegrante = (idx) => {
    handleChange('integrantes', formData.integrantes.filter((_, i) => i !== idx));
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          <h4 className="font-extrabold text-[#801B28] uppercase text-center text-sm border-b pb-2">
            {config?.titulo}
          </h4>

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
                  {ESPECIALIDADES_ESFM.map(esp => <option key={esp} value={esp}>{esp}</option>)}
                </select>
              </div>

               <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Paralelo:</label>
             <input type="text" value={formData.paralelo} onChange={(e) => handleChange('esfm_ua', e.target.value)} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold text-slate-800" />

              </div>

            </div>
          </div>

          {/* INTEGRANTES DEL EQUIPO COMUNITARIO */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                <Users size={15} /> INTEGRANTES DEL EQUIPO COMUNITARIO IEPC-PEC:
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
                  <input type="text" placeholder="ESPECIALIDAD" value={int.especialidad} onChange={(e) => handleIntegranteChange(idx, 'especialidad', e.target.value)} className="w-40 border p-1.5 rounded-lg bg-white" />
                  <input type="text" placeholder="C.I." value={int.ci} onChange={(e) => handleIntegranteChange(idx, 'ci', e.target.value)} className="w-28 border p-1.5 rounded-lg bg-white font-mono" />
                  {formData.integrantes.length > 1 && (
                    <button type="button" onClick={() => removeIntegrante(idx)} className="p-1.5 text-rose-600">
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
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad Asignada:</label>
                <input type="text" value={formData.especialidad_iepc} onChange={(e) => handleChange('especialidad_iepc', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-medium" />
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
                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-1">Nivel:</label>
                  <input type="text" value={formData.nivel} onChange={(e) => handleChange('nivel', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-medium" />
                </div>
              </div>
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
                  <input type="text"   className="w-full border p-2 rounded-xl bg-white font-medium" />
                </div>
            </div>
          </div>

          

          {/* LUGAR Y FECHA */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-[#801B28] uppercase text-[11px] flex items-center gap-1.5">
              <MapPin size={14} /> LUGAR Y FECHA DE EMISIÓN
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Ciudad / Localidad:</label>
                <input type="text" value={formData.lugar_ciudad} onChange={(e) => handleChange('lugar_ciudad', e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Departamento:</label>
                <select value={formData.departamento} onChange={(e) => handleChange('departamento', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold">
                  {DEPARTAMENTOS_BOLIVIA.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Día:</label>
                <input type="text" value={formData.dia} onChange={(e) => handleChange('dia', e.target.value)} className="w-full border p-2 rounded-xl font-mono font-bold" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Mes:</label>
                <select value={formData.mes} onChange={(e) => handleChange('mes', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold uppercase">
                  {MESES_ANIO.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>
    </ModalBase>
  );
};