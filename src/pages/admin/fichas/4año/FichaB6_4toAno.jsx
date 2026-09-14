import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap } from 'lucide-react';
import { CONFIGURACION_FICHAS, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const FichaB6_4toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "4_B6";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const dimensionesTutor = [
    {
      dimension: 'SER',
      criterios: [
        { key: 'c1', label: 'Responsabilidad, compromiso y puntualidad en el desarrollo de la práctica educativa.' },
        { key: 'c2', label: 'Respeto en el trato con estudiantes, padres/ madres de familia, maestras, maestros y personal de la UE/CEA/CEE.' },
        { key: 'c3', label: 'Demuestra un trabajo cohesionado en equipo.' }
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
    evaluaciones: {}, // { c1: { v1: 90, v2: 95 }, ... }
    fecha_1ra_val: '',
    fecha_2da_val: '',
    promedio_numeral: 0,
    promedio_literal: 'CERO CON 00/100',
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

  const handleValoracionChange = (critKey, valNum, value) => {
    let num = parseFloat(value);
    if (isNaN(num)) num = '';
    else if (num < 1) num = 1;
    else if (num > 100) num = 100;

    const newEvals = {
      ...(formData.evaluaciones || {}),
      [critKey]: {
        ...(formData.evaluaciones?.[critKey] || {}),
        [valNum]: num
      }
    };

    const promediosCriterios = [];
    dimensionesTutor.forEach(dim => {
      dim.criterios.forEach(c => {
        const v1 = parseFloat(newEvals[c.key]?.v1);
        const v2 = parseFloat(newEvals[c.key]?.v2);
        const arr = [v1, v2].filter(n => !isNaN(n));
        if (arr.length > 0) {
          promediosCriterios.push(arr.reduce((a, b) => a + b, 0) / arr.length);
        }
      });
    });

    const promFinal = promediosCriterios.length > 0 
      ? parseFloat((promediosCriterios.reduce((a, b) => a + b, 0) / promediosCriterios.length).toFixed(2)) 
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

  const handleCampoChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    setFichaData(updated);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-6: SEGUIMIENTO Y APOYO DE LA/EL DOCENTE TUTOR/A ACOMPAÑANTE"}>
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
            La o el docente tutor/a acompañante debe realizar mínimamente dos seguimientos durante el desarrollo de la PEC. La ficha permite valorar avances, registrar observaciones y comprobar la respuesta del estudiante a las orientaciones recibidas.
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
              MATRIZ DE SEGUIMIENTO Y EVALUACIÓN
            </span>

            {dimensionesTutor.map((dim) => (
              <div key={dim.dimension} className="space-y-2">
                {/* SUBTÍTULO POR DIMENSIÓN */}
                <div className="bg-rose-50/80 p-2 rounded-xl border border-rose-200">
                  <span className="font-black text-[#801B28] text-[11px] uppercase tracking-wider block">
                    DIMENSIÓN {dim.dimension}
                  </span>
                </div>

                {/* CRITERIOS DE LA DIMENSIÓN */}
                <div className="space-y-1.5 pl-1">
                  {dim.criterios.map((crit) => {
                    const v1 = parseFloat(formData.evaluaciones?.[crit.key]?.v1);
                    const v2 = parseFloat(formData.evaluaciones?.[crit.key]?.v2);
                    const arr = [v1, v2].filter(n => !isNaN(n));
                    const promParcial = arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : '-';

                    return (
                      <div key={crit.key} className="grid grid-cols-1 sm:grid-cols-7 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="sm:col-span-4 font-medium text-slate-800 text-[11px]">{crit.label}</span>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="(A) 1ra Val."
                          value={formData.evaluaciones?.[crit.key]?.v1 || ''}
                          onChange={(e) => handleValoracionChange(crit.key, 'v1', e.target.value)}
                          className="border p-1.5 rounded-lg text-center font-bold bg-white focus:border-[#801B28] outline-none"
                        />
                        <input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="(B) 2da Val."
                          value={formData.evaluaciones?.[crit.key]?.v2 || ''}
                          onChange={(e) => handleValoracionChange(crit.key, 'v2', e.target.value)}
                          className="border p-1.5 rounded-lg text-center font-bold bg-white focus:border-[#801B28] outline-none"
                        />
                        <div className="text-center font-mono font-black text-[#801B28]">{promParcial}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Fecha de la 1ra Valoración:</label>
                <input type="date" value={formData.fecha_1ra_val} onChange={(e) => handleCampoChange('fecha_1ra_val', e.target.value)} className="w-full border p-2 rounded-xl bg-white" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Fecha de la 2da Valoración:</label>
                <input type="date" value={formData.fecha_2da_val} onChange={(e) => handleCampoChange('fecha_2da_val', e.target.value)} className="w-full border p-2 rounded-xl bg-white" />
              </div>
            </div>

            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">Promedio Final (Número entero):</label>
                <div className="font-mono font-black text-2xl text-[#801B28]">{formData.promedio_numeral || '0.00'} / 100 PTS</div>
              </div>
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">Literal:</label>
                <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">{formData.promedio_literal}</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </ModalBase>
  );
};