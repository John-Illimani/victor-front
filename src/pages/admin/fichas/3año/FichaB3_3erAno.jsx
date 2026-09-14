import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin, UserCheck } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const FichaB3_3erAno = ({ isOpen, onClose, fichaData, setFichaData, listaDocentes = [], estudianteSeleccionado }) => {
  const codigoFicha = "3_B3";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const pdcsDefecto = ['PDC 1', 'PDC 2', 'PDC 3', 'PDC (Clase comunitaria)'];

  const criteriosEvaluacion = [
    { key: 'c1', label: 'Demuestra coherencia entre objetivo de aprendizaje, contenidos, momentos del proceso formativo, criterios de evaluación, recursos/materiales y productos.' },
    { key: 'c2', label: 'Articula el PDC con los problemas emergentes del contexto.' },
    { key: 'c3', label: 'Utiliza recursos/materiales, promoviendo la participación y el desarrollo de capacidades, habilidades y/o potencialidades en las y los estudiantes.' },
    { key: 'c4', label: 'Demuestra compromiso a través de la aplicación de estrategias metodológicas para desarrollar procesos creativos, propositivos y reflexivos.' },
    { key: 'c5', label: 'Demuestra respeto, responsabilidad, puntualidad, trato cordial y acompañamiento a los miembros de la UE/CEA/CEE.' }
  ];

  const [formData, setFormData] = useState({
    apellidos_nombres: '',
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    especialidad: ESPECIALIDADES_ESFM[0],
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    ano: '2026',
    pdcs: {
      'PDC 1': { c1: '', c2: '', c3: '', c4: '', c5: '', promedio_parcial: 0 },
      'PDC 2': { c1: '', c2: '', c3: '', c4: '', c5: '', promedio_parcial: 0 },
      'PDC 3': { c1: '', c2: '', c3: '', c4: '', c5: '', promedio_parcial: 0 },
      'PDC (Clase comunitaria)': { c1: '', c2: '', c3: '', c4: '', c5: '', promedio_parcial: 0 },
    },
    promedio_total: 0,
    promedio_literal: 'CERO CON 00/100',
    observaciones: '',
    docente_guia_id: '',
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

  const handlePdcCriterionChange = (pdcKey, critKey, val) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = '';
    else if (num < 1) num = 1;
    else if (num > 100) num = 100;

    const pdcsObj = { ...(formData.pdcs || {}) };
    if (!pdcsObj[pdcKey]) pdcsObj[pdcKey] = {};
    pdcsObj[pdcKey][critKey] = num;

    const vals = ['c1', 'c2', 'c3', 'c4', 'c5'].map(k => parseFloat(pdcsObj[pdcKey][k])).filter(v => !isNaN(v));
    const promParcial = vals.length > 0 ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) : 0;
    pdcsObj[pdcKey].promedio_parcial = promParcial;

    const promsPdcs = Object.keys(pdcsObj).map(k => parseFloat(pdcsObj[k].promedio_parcial)).filter(p => p > 0);
    const promTotal = promsPdcs.length > 0 ? parseFloat((promsPdcs.reduce((a, b) => a + b, 0) / promsPdcs.length).toFixed(2)) : 0;

    const updated = {
      ...formData,
      pdcs: pdcsObj,
      promedio_total: promTotal,
      promedio_numeral: promTotal,
      promedio_final: promTotal,
      promedio_literal: convertirNumeroALiteral(promTotal)
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
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-3: APOYO Y SEGUIMIENTO DEL DOCENTE GUÍA EN CONCRECIÓN CURRICULAR"}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          
          {/* DATOS REFERENCIALES */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
            <span className="font-extrabold text-amber-900 uppercase text-[11px] flex items-center gap-1.5">
              <GraduationCap size={15} /> DATOS REFERENCIALES
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Nombres y Apellidos:</label>
                <input type="text" readOnly value={formData.apellidos_nombres} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-extrabold text-slate-900" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">ESFM/UA:</label>
                <input type="text" value={formData.esfm_ua} onChange={(e) => handleCampoChange('esfm_ua', e.target.value)} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                <select value={formData.especialidad} onChange={(e) => handleCampoChange('especialidad', e.target.value)} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold">
                  {ESPECIALIDADES_ESFM.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* MATRIZ DE EVALUACIÓN DE PDCs */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
              CRITERIOS DE EVALUACIÓN EN LA CONCRECIÓN CURRICULAR (PDCs)
            </span>

            {pdcsDefecto.map((pdcLabel) => (
              <div key={pdcLabel} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-black text-[#801B28] uppercase text-[12px] bg-rose-100/60 px-3 py-1 rounded-lg">
                    {pdcLabel}
                  </span>
                  <span className="font-mono font-bold text-slate-700 text-[11px]">
                    Promedio Parcial: <strong className="text-[#801B28] text-sm">{formData.pdcs?.[pdcLabel]?.promedio_parcial || '0.00'} Pts.</strong>
                  </span>
                </div>

                <div className="space-y-2">
                  {criteriosEvaluacion.map((crit, idx) => (
                    <div key={crit.key} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="sm:col-span-4 font-medium text-slate-800 text-[11px] leading-snug">
                        <strong className="text-[#801B28] mr-1">{idx + 1}.</strong> {crit.label}
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="1 - 100"
                        value={formData.pdcs?.[pdcLabel]?.[crit.key] || ''}
                        onChange={(e) => handlePdcCriterionChange(pdcLabel, crit.key, e.target.value)}
                        className="w-full border border-slate-300 p-2 rounded-lg bg-slate-50 font-mono font-bold text-center text-slate-900 focus:border-[#801B28] outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">Promedio Total (Número entero):</label>
                <div className="font-mono font-black text-2xl text-[#801B28]">{formData.promedio_total || '0.00'} / 100 PTS</div>
              </div>
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">Literal:</label>
                <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">{formData.promedio_literal}</div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-[10px] mb-1">Observaciones y/o Sugerencias de la Concreción Curricular:</label>
              <textarea
                rows="3"
                value={formData.observaciones}
                onChange={(e) => handleCampoChange('observaciones', e.target.value)}
                className="w-full border p-2.5 rounded-xl font-medium text-slate-800 text-xs focus:border-[#801B28] outline-none"
              />
            </div>
          </div>

          {/* LUGAR Y FECHA */}
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