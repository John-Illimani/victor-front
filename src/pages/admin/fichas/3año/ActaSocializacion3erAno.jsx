import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { MapPin, UserCheck } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM } from '../../../../utils/camposFichas';

export const ActaSocializacion3erAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "3_ACTA_SOCIALIZACION";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const [formData, setFormData] = useState({
    lugar_ciudad: 'El Alto',
    distrito: 'Distrito 1',
    hora: '10:00',
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    gestion: '2026',
    especialidad: ESPECIALIDADES_ESFM[0],
    ue_cea_cee: '',
    observacion_1: '',
    observacion_2: '',
    observacion_3: '',
    observacion_4: '',
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

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "ACTA DE SOCIALIZACIÓN DEL DIAGNÓSTICO"}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          <h4 className="font-extrabold text-[#801B28] uppercase text-center text-sm border-b pb-2">
            ACTA DE SOCIALIZACIÓN DEL DIAGNÓSTICO DEL EQUIPO COMUNITARIO
          </h4>

          {/* DATOS LUGAR Y ENCABEZADO */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
              <MapPin size={15} /> ENCABEZADO Y UBICACIÓN DE LA SOCIALIZACIÓN
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Ciudad / Localidad:</label>
                <input type="text" value={formData.lugar_ciudad} onChange={(e) => handleChange('lugar_ciudad', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-medium" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Distrito:</label>
                <input type="text" value={formData.distrito} onChange={(e) => handleChange('distrito', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-medium" />
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
                <select value={formData.especialidad} onChange={(e) => handleChange('especialidad', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold">
                  {ESPECIALIDADES_ESFM.map(esp => <option key={esp} value={esp}>{esp}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">UE / CEA / CEE:</label>
                <input type="text" value={formData.ue_cea_cee} onChange={(e) => handleChange('ue_cea_cee', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-medium" />
              </div>
            </div>
          </div>

          {/* OBSERVACIONES Y SUGERENCIAS */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block">
              OBSERVACIONES Y/O SUGERENCIAS DE LOS ASISTENTES TRAS SOCIALIZACIÓN
            </span>
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex gap-2 items-center">
                <span className="font-bold text-slate-600">{num}.</span>
                <input
                  type="text"
                  placeholder={`Sugerencia o hallazgo ${num}...`}
                  value={formData[`observacion_${num}`]}
                  onChange={(e) => handleChange(`observacion_${num}`, e.target.value)}
                  className="w-full border p-2 rounded-xl bg-white text-slate-800 font-medium"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModalBase>
  );
};