import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const FichaB5_4toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "4_B5";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const dimensionesEvaluacion = [
    {
      dimension: 'SER',
      criterios: [
        { key: 'c1', label: 'Responsabilidad, compromiso y puntualidad en el desarrollo de la práctica educativa.' },
        { key: 'c2', label: 'Respeto en el trato con estudiantes, padres/ madres de familia, maestras, maestros y personal de la UE/CEA/CEE.' },
        { key: 'c3', label: 'Promueve la práctica de valores sociocomunitarios en la UE/CEA/CEE.' }
      ]
    },
    {
      dimension: 'SABER',
      criterios: [
        { key: 'c4', label: 'Conocimiento y manejo de elementos curriculares de la planificación.' },
        { key: 'c5', label: 'Conocimiento y dominio de elementos propios de su especialidad.' },
        { key: 'c6', label: 'Promueve el fortalecimiento del pensamiento crítico y reflexivo con las y los estudiantes.' }
      ]
    },
    {
      dimension: 'HACER',
      criterios: [
        { key: 'c7', label: 'Dominio de aula usando estrategias pertinentes.' },
        { key: 'c8', label: 'Manifiesta creatividad en el uso de recursos materiales y educativos.' },
        { key: 'c9', label: 'Utiliza instrumentos de evaluación durante la concreción curricular.' }
      ]
    },
    {
      dimension: 'DECIDIR',
      criterios: [
        { key: 'c10', label: 'Asume las sugerencias y observaciones a los PDC elaborados.' },
        { key: 'c11', label: 'Aplica acciones de manera oportuna para la solución de problemas en el aula.' },
        { key: 'c12', label: 'Demuestra iniciativa en la solución de problemas emergentes de la comunidad educativa.' }
      ]
    }
  ];

  const [formData, setFormData] = useState({
    apellidos_nombres: '',
    promedio_numeral: 0,
    promedio_literal: 'CERO CON 00/100',
    observaciones: '',
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

  const handleNotaChange = (key, value) => {
    let num = parseFloat(value);
    if (isNaN(num)) num = '';
    else if (num < 1) num = 1;
    else if (num > 100) num = 100;

    const newForm = { ...formData, [key]: num };
    
    const todasLasKeys = dimensionesEvaluacion.flatMap(d => d.criterios.map(c => c.key));
    const notasValidas = todasLasKeys.map(k => parseFloat(newForm[k])).filter(n => !isNaN(n));
    const prom = notasValidas.length > 0 ? parseFloat((notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length).toFixed(2)) : 0;

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
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-5: SEGUIMIENTO Y APOYO DE LA/EL DOCENTE GUÍA"}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2">
            <span className="font-extrabold text-amber-900 uppercase text-[11px] flex items-center gap-1.5">
              <GraduationCap size={15} /> Nombre del estudiante:
            </span>
            <input
              type="text"
              readOnly
              value={formData.apellidos_nombres}
              className="w-full border border-amber-200 p-2 rounded-xl bg-white font-extrabold text-slate-900"
            />
          </div>

          <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200 text-slate-700 text-[11px] leading-relaxed">
            La o el docente guía realiza seguimiento a cada integrante del ECTG antes de la finalización de la PEC, valorando la dimensión formativa, el dominio teórico-metodológico, la concreción y la capacidad de proponer mejoras.
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
              CRITERIOS DE EVALUACIÓN (VALORACIÓN DEL 1 A 100)
            </span>

            {dimensionesEvaluacion.map((dim) => (
              <div key={dim.dimension} className="space-y-2">
                {/* SUBTÍTULO POR DIMENSIÓN */}
                <div className="bg-rose-50/80 p-2 rounded-xl border border-rose-200">
                  <span className="font-black text-[#801B28] text-[11px] uppercase tracking-wider block">
                    DIMENSIÓN {dim.dimension}
                  </span>
                </div>

                {/* CRITERIOS DE LA DIMENSIÓN */}
                <div className="space-y-1.5 pl-1">
                  {dim.criterios.map((crit) => (
                    <div key={crit.key} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="sm:col-span-5 font-medium text-slate-800 text-[11px]">{crit.label}</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="1-100"
                        value={formData[crit.key] || ''}
                        onChange={(e) => handleNotaChange(crit.key, e.target.value)}
                        className="w-full border p-2 rounded-lg bg-white font-mono font-bold text-center text-slate-900 focus:border-[#801B28] outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">Promedio Final Numeral:</label>
                <div className="font-mono font-black text-2xl text-[#801B28]">{formData.promedio_numeral || '0.00'} / 100 PTS</div>
              </div>
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">Literal:</label>
                <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">{formData.promedio_literal}</div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-[10px] mb-1">Observaciones/Sugerencias:</label>
              <textarea
                rows="3"
                value={formData.observaciones}
                onChange={(e) => handleCampoChange('observaciones', e.target.value)}
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