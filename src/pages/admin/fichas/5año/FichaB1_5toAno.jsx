import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO } from '../../../../utils/camposFichas';

export const FichaB1_5toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "5_B1";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const semanas = Array.from({ length: 10 }, (_, i) => i + 1);

  const [formData, setFormData] = useState({
    apellidos_nombres: '',
    semanas_data: {},
    fecha_inicio_pec: '',
    fecha_conclusion_pec: '',
    total_dias: 0,
    total_faltas: 0,
    total_atrasos: 0,
    porcentaje_asistencia: 100,
    valoracion_100: 100,
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    ano: '2026',
    ...fichaData
  });

  useEffect(() => {
    if (estudianteSeleccionado) {
      setFormData(prev => ({
        ...prev,
        apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
        ...fichaData
      }));
    }
  }, [estudianteSeleccionado, fichaData]);

  const handleSemanaChange = (numSemana, field, val) => {
    const newSemanas = {
      ...(formData.semanas_data || {}),
      [numSemana]: {
        ...(formData.semanas_data?.[numSemana] || {}),
        [field]: val
      }
    };

    let tDias = 0;
    let tFaltas = 0;
    let tAtrasos = 0;

    Object.values(newSemanas).forEach(s => {
      tDias += parseFloat(s.dias || 0);
      tFaltas += parseFloat(s.faltas || 0);
      tAtrasos += parseFloat(s.atrasos || 0);
    });

    const updated = {
      ...formData,
      semanas_data: newSemanas,
      total_dias: tDias,
      total_faltas: tFaltas,
      total_atrasos: tAtrasos
    };

    setFormData(updated);
    setFichaData(updated);
  };

  const handleCampoChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    setFichaData(updated);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-1: CONTROL DE ASISTENCIA DE LA PRÁCTICA EDUCATIVA COMUNITARIA (PEC)"}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          
         

          <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200 text-slate-700 text-[11px]">
            La presente ficha debe ser sellada de forma semanal por la/el docente guía de la UE/CEA/CEE, debiendo la o el estudiante practicante contar con el registro gradual de su ficha de acompañamiento.
          </div>

          {/* CONTROL POR CADA SEMANA (1 A 10) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
              REGISTRO DE ACTIVIDADES Y ASISTENCIA SEMANAL (10 SEMANAS)
            </span>

            <div className="space-y-3">
              {semanas.map((sem) => (
                <div key={sem} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-black text-[#801B28] text-[11px] uppercase block">
                    SEMANA {sem}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-600">Días de asistencia:</label>
                      <input
                        type="number"
                        placeholder="Días"
                        value={formData.semanas_data?.[sem]?.dias || ''}
                        onChange={(e) => handleSemanaChange(sem, 'dias', e.target.value)}
                        className="w-full border p-1.5 rounded-lg bg-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-600">Faltas (Cantidad de días):</label>
                      <input
                        type="number"
                        placeholder="Faltas"
                        value={formData.semanas_data?.[sem]?.faltas || ''}
                        onChange={(e) => handleSemanaChange(sem, 'faltas', e.target.value)}
                        className="w-full border p-1.5 rounded-lg bg-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-600">Atrasos (Minutos):</label>
                      <input
                        type="number"
                        placeholder="Minutos"
                        value={formData.semanas_data?.[sem]?.atrasos || ''}
                        onChange={(e) => handleSemanaChange(sem, 'atrasos', e.target.value)}
                        className="w-full border p-1.5 rounded-lg bg-white font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-600 mb-0.5">
                      Breve detalle de actividades realizadas por la/el estudiante practicante, en el marco la implementación de la propuesta educativa:
                    </label>
                    <textarea
                      rows="2"
                      value={formData.semanas_data?.[sem]?.detalle || ''}
                      onChange={(e) => handleSemanaChange(sem, 'detalle', e.target.value)}
                      className="w-full border p-2 rounded-xl text-[10px] bg-white"
                      placeholder="Describa las actividades..."
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* RESUMEN FINAL Y VALORACIÓN */}
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
              <span className="font-extrabold text-amber-900 uppercase text-[11px] block border-b border-amber-200 pb-1">
                RESUMEN GENERAL Y TOTALES
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-1">Fecha de inicio de la PEC:</label>
                  <input type="date" value={formData.fecha_inicio_pec} onChange={(e) => handleCampoChange('fecha_inicio_pec', e.target.value)} className="w-full border p-2 rounded-xl bg-white" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-1">Fecha de conclusión de la PEC:</label>
                  <input type="date" value={formData.fecha_conclusion_pec} onChange={(e) => handleCampoChange('fecha_conclusion_pec', e.target.value)} className="w-full border p-2 rounded-xl bg-white" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-[10px]">Total días: {formData.total_dias}</label>
                  <label className="block font-bold text-slate-700 text-[10px]">Total Faltas: {formData.total_faltas}</label>
                  <label className="block font-bold text-slate-700 text-[10px]">Total Atrasos: {formData.total_atrasos}</label>
                </div>
                
                {/* CAMPO EDITABLE DE PORCENTAJE DE ASISTENCIA */}
                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-1">Porcentaje total de asistencia (%):</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Ej. 100"
                      value={formData.porcentaje_asistencia}
                      onChange={(e) => handleCampoChange('porcentaje_asistencia', e.target.value)}
                      className="w-full border p-2 rounded-xl font-mono font-bold bg-white text-slate-900 focus:border-[#801B28] outline-none"
                    />
                    <span className="font-mono font-bold text-slate-700 text-xs">/ 100%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Valoración sobre 100 puntos:</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.valoracion_100}
                  onChange={(e) => handleCampoChange('valoracion_100', e.target.value)}
                  className="w-full border p-2 rounded-xl font-mono font-bold bg-white text-slate-900 focus:border-[#801B28] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-[#801B28] uppercase text-[11px] flex items-center gap-1.5">
              <MapPin size={14} /> LUGAR Y FECHA
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
      </div>
    </ModalBase>
  );
};