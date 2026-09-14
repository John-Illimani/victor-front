import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const FichaB5_5toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado, listaDocentes = [] }) => {
  const codigoFicha = "5_B5";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const dimensionesDocenteGuia = [
    {
      dimension: 'SER',
      criterios: [
        { key: 'c1', label: 'Responsabilidad, compromiso y puntualidad en el desarrollo de práctica educativa.' },
        { key: 'c2', label: 'Respeto en el trato con estudiantes, padres/madres de familia, maestras, maestros y personal de la UE/CEA/CEE.' },
        { key: 'c3', label: 'Promueve la práctica de valores sociocomunitarios en la UE/CEA/CEE.' }
      ]
    },
    {
      dimension: 'SABER',
      criterios: [
        { key: 'c4', label: 'Conocimiento y manejo de elementos curriculares del MESCP.' },
        { key: 'c5', label: 'Conocimiento y dominio de elementos propios de su especialidad.' },
        { key: 'c6', label: 'Promueve el fortalecimiento del pensamiento crítico y reflexivo con las y los estudiantes.' }
      ]
    },
    {
      dimension: 'HACER',
      criterios: [
        { key: 'c7', label: 'Dominio de aula usando estrategias pertinentes.' },
        { key: 'c8', label: 'Manifiesta creatividad en el uso de recursos materiales y educativos en la implementación de la propuesta.' },
        { key: 'c9', label: 'Utiliza instrumentos de evaluación durante la concreción curricular.' }
      ]
    },
    {
      dimension: 'DECIDIR',
      criterios: [
        { key: 'c10', label: 'Asume sugerencias y observaciones a los PDC elaborados.' },
        { key: 'c11', label: 'Demuestra aportes desde la implementación de la propuesta educativa.' },
        { key: 'c12', label: 'Demuestra iniciativa en la solución de problemas emergentes de la comunidad educativa.' }
      ]
    }
  ];

  const [formData, setFormData] = useState({
    docente_guia_id: '',
    apellidos_nombres: '',
    evaluaciones: {},
    promedio_numeral: 0,
    promedio_literal: 'CERO CON 00/100',
    observaciones_sugerencias: '',
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

  const handleValoracionChange = (critKey, value) => {
    let num = parseFloat(value);
    if (isNaN(num)) num = '';
    else if (num < 1) num = 1;
    else if (num > 100) num = 100;

    const newEvals = {
      ...(formData.evaluaciones || {}),
      [critKey]: {
        ...(formData.evaluaciones?.[critKey] || {}),
        val: num
      }
    };

    const notasArr = [];
    dimensionesDocenteGuia.forEach(dim => {
      dim.criterios.forEach(c => {
        const v = parseFloat(newEvals[c.key]?.val);
        if (!isNaN(v)) notasArr.push(v);
      });
    });

    const promFinal = notasArr.length > 0 
      ? parseFloat((notasArr.reduce((a, b) => a + b, 0) / notasArr.length).toFixed(2)) 
      : 0;

    const updated = {
      ...formData,
      evaluaciones: newEvals,
      promedio_numeral: promFinal,
      promedio_final: promFinal,
      promedio_literal: convertirNumeroALiteral(promFinal)
    };

    setFormData(updated);
    setFichaData(updated);
  };

  const handleObsChange = (critKey, obsVal) => {
    const newEvals = {
      ...(formData.evaluaciones || {}),
      [critKey]: {
        ...(formData.evaluaciones?.[critKey] || {}),
        obs: obsVal
      }
    };
    const updated = { ...formData, evaluaciones: newEvals };
    setFormData(updated);
    setFichaData(updated);
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
          
          {/* DATOS GENERALES */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-[#801B28] uppercase text-[11px] block border-b pb-2">
              DATOS GENERALES
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Docente Guía de la UE/CEA/CEE:</label>
                <select
                  value={formData.docente_guia_id}
                  onChange={(e) => handleCampoChange('docente_guia_id', e.target.value)}
                  className="w-full border p-2 rounded-xl bg-white font-bold text-slate-900 focus:border-[#801B28] outline-none"
                >
                  <option value="">-- Seleccionar Docente Guía --</option>
                  {listaDocentes.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre} {d.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Estudiante Practicante (ECTG):</label>
                <input type="text" readOnly value={formData.apellidos_nombres} className="w-full border p-2 rounded-xl bg-slate-50 font-extrabold text-slate-900" />
              </div>
            </div>
          </div>

          <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200 text-slate-700 text-[11px] leading-relaxed">
            La/el docente guía realiza seguimiento a la/el estudiante integrante del ECTG, evaluando antes de la finalización de la PEC los siguientes criterios.
          </div>

          {/* CRITERIOS DE EVALUACIÓN */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
              CRITERIOS DE EVALUACIÓN
            </span>

            {dimensionesDocenteGuia.map((dim) => (
              <div key={dim.dimension} className="space-y-3">
                <div className="bg-rose-50/80 p-2 rounded-xl border border-rose-200">
                  <span className="font-black text-[#801B28] text-[11px] uppercase tracking-wider block">
                    DIMENSIÓN: {dim.dimension}
                  </span>
                </div>

                <div className="space-y-3 pl-1">
                  {dim.criterios.map((crit) => (
                    <div key={crit.key} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <span className="sm:col-span-8 font-bold text-slate-800 text-[11px] leading-snug">
                          {crit.label}
                        </span>

                        <div className="sm:col-span-4">
                          <label className="block text-[9px] font-extrabold text-slate-500 uppercase text-center mb-0.5">
                            Valoración del 1 a 100
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            placeholder="1-100"
                            value={formData.evaluaciones?.[crit.key]?.val || ''}
                            onChange={(e) => handleValoracionChange(crit.key, e.target.value)}
                            className="w-full border p-2 rounded-xl text-center font-mono font-bold bg-white focus:border-[#801B28] outline-none text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 text-[10px] mb-0.5">
                          Observación / Recomendación:
                        </label>
                        <textarea
                          rows="2"
                          placeholder="Observaciones o recomendaciones específicas..."
                          value={formData.evaluaciones?.[crit.key]?.obs || ''}
                          onChange={(e) => handleObsChange(crit.key, e.target.value)}
                          className="w-full border p-2 rounded-xl bg-white text-[10px] text-slate-800 focus:border-[#801B28] outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* PROMEDIO NUMERAL Y LITERAL */}
            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">PROMEDIO NUMERAL:</label>
                <div className="font-mono font-black text-2xl text-[#801B28]">{formData.promedio_numeral || '0.00'} / 100 PTS</div>
              </div>
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">LITERAL:</label>
                <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">{formData.promedio_literal}</div>
              </div>
            </div>

            {/* OBSERVACIONES / SUGERENCIAS GENERALES */}
            <div>
              <label className="block font-bold text-slate-700 text-[10px] mb-1 uppercase">Observaciones / Sugerencias:</label>
              <textarea
                rows="3"
                value={formData.observaciones_sugerencias}
                onChange={(e) => handleCampoChange('observaciones_sugerencias', e.target.value)}
                placeholder="Escriba observaciones o sugerencias generales respecto al desempeño del practicante..."
                className="w-full border p-2.5 rounded-xl font-medium text-slate-800 text-xs focus:border-[#801B28] outline-none"
              />
            </div>
          </div>

          {/* LUGAR Y FECHA DE EMISIÓN */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-[#801B28] uppercase text-[11px] flex items-center gap-1.5">
              <MapPin size={14} /> LUGAR Y FECHA DE EMISIÓN
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