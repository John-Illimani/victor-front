import React, { useState, useEffect } from 'react';
import { ModalBase } from './ModalBase';
import { Plus, Trash2, MapPin, Users } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM } from '../../../../utils/camposFichas';

export const ActaConformacion1erAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "1_ACTA_EQUIPO";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const [formData, setFormData] = useState({
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    esfm_predios: 'ESFM Simón Bolívar / UA El Alto',
    hora: '09:00',
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    gestion: '2026',
    ano_formacion: '1er Año',
    especialidad: ESPECIALIDADES_ESFM[0],
    integrantes: [{ apellidos_nombres: '', especialidad: '', ci: '', nro_celular: '' }],
    ...fichaData
  });

  useEffect(() => {
    if (estudianteSeleccionado) {
      setFormData(prev => ({
        ...prev,
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
    handleChange('integrantes', [...formData.integrantes, { apellidos_nombres: '', especialidad: '', ci: '', nro_celular: '' }]);
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

          {/* DATOS DE REUNIÓN Y LUGAR */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
              <MapPin size={15} /> DATOS DE LUGAR Y FECHA
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Ciudad / Localidad:</label>
                <input
                  type="text"
                  value={formData.lugar_ciudad}
                  onChange={(e) => handleChange('lugar_ciudad', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Departamento:</label>
                <select
                  value={formData.departamento}
                  onChange={(e) => handleChange('departamento', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold text-slate-800"
                >
                  {DEPARTAMENTOS_BOLIVIA.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Predios de la ESFM/UA:</label>
                <input
                  type="text"
                  value={formData.esfm_predios}
                  onChange={(e) => handleChange('esfm_predios', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Hora:</label>
                <input
                  type="time"
                  value={formData.hora}
                  onChange={(e) => handleChange('hora', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Día:</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dia}
                  onChange={(e) => handleChange('dia', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Mes:</label>
                <select
                  value={formData.mes}
                  onChange={(e) => handleChange('mes', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold text-slate-800 uppercase"
                >
                  {MESES_ANIO.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Gestión:</label>
                <input
                  type="number"
                  value={formData.gestion}
                  onChange={(e) => handleChange('gestion', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                <select
                  value={formData.especialidad}
                  onChange={(e) => handleChange('especialidad', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold text-slate-800"
                >
                  {ESPECIALIDADES_ESFM.map(esp => <option key={esp} value={esp}>{esp}</option>)}
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
              <button
                type="button"
                onClick={addIntegrante}
                className="flex items-center gap-1 bg-[#801B28] text-white px-2.5 py-1 rounded-xl font-bold text-[10px]"
              >
                <Plus size={14} /> Agregar Integrante
              </button>
            </div>

            <div className="space-y-2">
              {formData.integrantes.map((int, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <span className="font-mono font-bold w-6 text-center">{idx + 1}</span>
                  <input
                    type="text"
                    placeholder="APELLIDOS Y NOMBRES"
                    value={int.apellidos_nombres}
                    onChange={(e) => handleIntegranteChange(idx, 'apellidos_nombres', e.target.value)}
                    className="flex-1 border p-1.5 rounded-lg bg-white font-medium"
                  />
                  
                  <input
                    type="text"
                    placeholder="C.I."
                    value={int.ci}
                    onChange={(e) => handleIntegranteChange(idx, 'ci', e.target.value)}
                    className="w-24 border p-1.5 rounded-lg bg-white font-mono"
                  />
                 
                  {formData.integrantes.length > 1 && (
                    <button type="button" onClick={() => removeIntegrante(idx)} className="p-1.5 text-rose-600">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ModalBase>
  );
};