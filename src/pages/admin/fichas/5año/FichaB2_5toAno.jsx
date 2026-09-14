import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const FichaB2_5toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "5_B2";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const pdcs = Array.from({ length: 9 }, (_, i) => i + 1);

  const [formData, setFormData] = useState({
    apellidos_nombres: '',
    pdc_data: {},
    promedio_numeral: 0,
    promedio_literal: 'CERO CON 00/100',
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

  const handlePdcValChange = (numPdc, field, val) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = '';
    else if (num < 1) num = 1;
    else if (num > 100) num = 100;

    const newPdcs = {
      ...(formData.pdc_data || {}),
      [numPdc]: {
        ...(formData.pdc_data?.[numPdc] || {}),
        [field]: num
      }
    };

    // Calcular promedio del PDC
    const target = newPdcs[numPdc];
    const valsPdc = [target.elementos_curriculares, target.propuesta_educativa, target.concrecion_curricular]
      .map(v => parseFloat(v))
      .filter(n => !isNaN(n));

    target.promedio_pdc = valsPdc.length > 0 ? parseFloat((valsPdc.reduce((a, b) => a + b, 0) / valsPdc.length).toFixed(2)) : 0;

    // Calcular promedio general de todos los PDCs evaluados
    const promediosTodos = pdcs
      .map(p => newPdcs[p]?.promedio_pdc)
      .filter(p => p !== undefined && p > 0);

    const promGeneral = promediosTodos.length > 0 
      ? parseFloat((promediosTodos.reduce((a, b) => a + b, 0) / promediosTodos.length).toFixed(2)) 
      : 0;

    const updated = {
      ...formData,
      pdc_data: newPdcs,
      promedio_numeral: promGeneral,
      promedio_final: promGeneral,
      promedio_literal: convertirNumeroALiteral(promGeneral)
    };

    setFormData(updated);
    setFichaData(updated);
  };

  const handlePdcTextChange = (numPdc, field, val) => {
    const newPdcs = {
      ...(formData.pdc_data || {}),
      [numPdc]: {
        ...(formData.pdc_data?.[numPdc] || {}),
        [field]: val
      }
    };
    const updated = { ...formData, pdc_data: newPdcs };
    setFormData(updated);
    setFichaData(updated);
  };

  const handleCampoChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    setFichaData(updated);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-2: CONCRECIÓN CURRICULAR - APLICACIÓN DEL PDC"}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          

          <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200 text-slate-700 text-[11px]">
            La/el docente guía de UE/CEA/CEE evalúa el desarrollo del PDC. En caso de que no contemple de forma explícita la propuesta educativa, el acápite no debe ser evaluado.
          </div>

          {/* MATRIZ PDC 1 AL PDC 9 */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
              EVALUACIÓN DE PDC DE CONCRECIÓN CURRICULAR (PDC 1 A PDC 9)
            </span>

            <div className="space-y-4">
              {pdcs.map((num) => (
                <div key={num} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center border-b pb-1">
                    <span className="font-black text-[#801B28] text-[12px] uppercase">
                      PDC {num}
                    </span>
                    <span className="font-mono font-bold text-slate-700 text-[11px]">
                      Promedio PDC {num}: <strong className="text-[#801B28]">{formData.pdc_data?.[num]?.promedio_pdc || '0.00'} Pts</strong>
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                      <span className="sm:col-span-4 font-bold text-slate-800 text-[10px]">
                        ELEMENTOS CURRICULARES: Planteamiento y relación del Objetivo con las Orientaciones Metodológicas y los Criterios de Evaluación.
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="1-100"
                        value={formData.pdc_data?.[num]?.elementos_curriculares || ''}
                        onChange={(e) => handlePdcValChange(num, 'elementos_curriculares', e.target.value)}
                        className="border p-1.5 rounded-lg text-center font-bold bg-white outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                      <span className="sm:col-span-4 font-bold text-slate-800 text-[10px]">
                        PROPUESTA EDUCATIVA: Orientación metodológica del desarrollo y fortalecimiento de capacidades específicas, coherentes con el área.
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="1-100"
                        value={formData.pdc_data?.[num]?.propuesta_educativa || ''}
                        onChange={(e) => handlePdcValChange(num, 'propuesta_educativa', e.target.value)}
                        className="border p-1.5 rounded-lg text-center font-bold bg-white outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                      <span className="sm:col-span-4 font-bold text-slate-800 text-[10px]">
                        CONCRECIÓN CURRICULAR: Dominio de la especialidad, estrategias participativas, manejo de aula y evaluación.
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="1-100"
                        value={formData.pdc_data?.[num]?.concrecion_curricular || ''}
                        onChange={(e) => handlePdcValChange(num, 'concrecion_curricular', e.target.value)}
                        className="border p-1.5 rounded-lg text-center font-bold bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t">
                    <input
                      type="text"
                      placeholder="Tiempo de implementación del PDC..."
                      value={formData.pdc_data?.[num]?.tiempo_implementacion || ''}
                      onChange={(e) => handlePdcTextChange(num, 'tiempo_implementacion', e.target.value)}
                      className="border p-1.5 rounded-lg text-[10px] bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Observaciones y/o sugerencias..."
                      value={formData.pdc_data?.[num]?.observaciones || ''}
                      onChange={(e) => handlePdcTextChange(num, 'observaciones', e.target.value)}
                      className="border p-1.5 rounded-lg text-[10px] bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">PROMEDIO FINAL PDC:</label>
                <div className="font-mono font-black text-2xl text-[#801B28]">{formData.promedio_numeral || '0.00'} / 100 PTS</div>
              </div>
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">LITERAL:</label>
                <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">{formData.promedio_literal}</div>
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