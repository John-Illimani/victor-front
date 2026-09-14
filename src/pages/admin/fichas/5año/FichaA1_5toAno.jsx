import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const FichaA1_5toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "5_A1";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const criterios = [
    { key: 'c1', label: 'Planteamiento de elementos curriculares (Objetivo, Orientaciones Metodológicas y Criterios de Evaluación).' },
    { key: 'c2', label: 'Articulación de la Propuesta Educativa del ECTG al desarrollo curricular establecido en el Currículo Base del SEP.' },
    { key: 'c3', label: 'Socialización oral de un PDC. Uso adecuado de estrategias metodológicas y recursos educativos.' }
  ];

  const [formData, setFormData] = useState({
    apellidos_nombres: '',
    observacion_c1: '',
    observacion_c2: '',
    observacion_c3: '',
    nota_c1: '',
    nota_c2: '',
    nota_c3: '',
    promedio_numeral: 0,
    promedio_literal: 'CERO CON 00/100',
    observaciones_generales: '',
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

  const handleNotaChange = (key, val) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = '';
    else if (num < 1) num = 1;
    else if (num > 100) num = 100;

    const newForm = { ...formData, [key]: num };
    const notas = ['nota_c1', 'nota_c2', 'nota_c3'].map(k => parseFloat(newForm[k])).filter(n => !isNaN(n));
    const prom = notas.length > 0 ? parseFloat((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)) : 0;

    newForm.promedio_numeral = prom;
    newForm.promedio_final = prom;
    newForm.promedio_literal = convertirNumeroALiteral(prom);

    setFormData(newForm);
    setFichaData(newForm);
  };

  const handleCampoChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    setFichaData(updated);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA A-1: PLANIFICACIÓN Y ELABORACIÓN DE PDC"}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          
         

          <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200 text-slate-700 text-[11px] leading-relaxed space-y-1">
            <p className="font-bold">Cada integrante del ECTG elabora y presenta la cantidad de:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>6 PDC incluido la clase comunitaria en el nivel inicial y primaria, todos articulados a la propuesta educativa.</li>
              <li>En el nivel secundario 10 PDC incluido la clase comunitaria de los cuales 5 PDC como mínimo articulados a la propuesta educativa.</li>
              <li>El docente de la UF de Didáctica y PEC II, es el responsable de apoyar en la elaboración de PDCs, así también considerar su evaluación.</li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
              CRITERIOS Y OBSERVACIONES DE EVALUACIÓN
            </span>

            <div className="space-y-3">
              {criterios.map((c) => (
                <div key={c.key} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="sm:col-span-3">
                    <span className="font-bold text-slate-800 text-[11px] block">{c.label}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <textarea
                      rows="2"
                      placeholder="Observaciones / Sugerencias del Docente..."
                      value={formData[`observacion_${c.key}`] || ''}
                      onChange={(e) => handleCampoChange(`observacion_${c.key}`, e.target.value)}
                      className="w-full border p-2 rounded-xl bg-white text-[10px]"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="1-100 Pts"
                      value={formData[`nota_${c.key}`] || ''}
                      onChange={(e) => handleNotaChange(`nota_${c.key}`, e.target.value)}
                      className="w-full border p-2 rounded-xl text-center font-mono font-bold bg-white text-slate-900 focus:border-[#801B28] outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">PROMEDIO:</label>
                <div className="font-mono font-black text-2xl text-[#801B28]">{formData.promedio_numeral || '0.00'} / 100 PTS</div>
              </div>
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">LITERAL:</label>
                <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">{formData.promedio_literal}</div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-[10px] mb-1 uppercase">OBSERVACIONES:</label>
              <textarea
                rows="3"
                value={formData.observaciones_generales}
                onChange={(e) => handleCampoChange('observaciones_generales', e.target.value)}
                className="w-full border p-2.5 rounded-xl font-medium text-slate-800 text-xs focus:border-[#801B28] outline-none"
              />
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