import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const FichaB6_5toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado, listaDocentes = [] }) => {
  const codigoFicha = "5_B6";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const dimensionesTutor = [
    {
      dimension: 'SER',
      criterios: [
        { key: 'c1', label: 'Responsabilidad y puntualidad en el desarrollo de la práctica educativa.' },
        { key: 'c2', label: 'Demuestra respeto en el trato con la comunidad de la UE/ CEA/ CEE.' },
        { key: 'c3', label: 'Promueve la práctica de valores sociocomunitarios en la UE/CEA/CEE.' }
      ]
    },
    {
      dimension: 'SABER',
      criterios: [
        { key: 'c4', label: 'Demuestra conocimiento en el manejo de los elementos curriculares del PDC.' },
        { key: 'c5', label: 'Asume sugerencias y observaciones a los PDC elaborados.' },
        { key: 'c6', label: 'Demuestra dominio de los contenidos de la especialidad.' }
      ]
    },
    {
      dimension: 'HACER',
      criterios: [
        { key: 'c7', label: 'Dominio de aula usando estrategias pertinentes.' },
        { key: 'c8', label: 'Manifiesta creatividad en el uso de recursos materiales y educativos.' },
        { key: 'c9', label: 'Utiliza instrumentos de evaluación.' }
      ]
    },
    {
      dimension: 'DECIDIR',
      criterios: [
        { key: 'c10', label: 'Promueve la participación de los actores educativos durante la clase.' },
        { key: 'c11', label: 'Demuestra aportes desde la implementación de la propuesta educativa.' },
        { key: 'c12', label: 'Demuestra iniciativa en la solución de problemas emergentes de la comunidad educativa.' }
      ]
    }
  ];

  const [formData, setFormData] = useState({
    docente_tutor_id: '',
    apellidos_nombres: '',
    evaluaciones: {},
    fecha_1ra_val: '',
    fecha_2da_val: '',
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
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-6: APOYO Y SEGUIMIENTO DE LA/EL DOCENTE TUTOR/A ACOMPAÑANTE"}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          
          {/* DATOS GENERALES */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-[#801B28] uppercase text-[11px] block border-b pb-2">
              DATOS GENERALES
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Docente Tutor/a Acompañante ESFM/UA:</label>
                <select
                  value={formData.docente_tutor_id}
                  onChange={(e) => handleCampoChange('docente_tutor_id', e.target.value)}
                  className="w-full border p-2 rounded-xl bg-white font-bold text-slate-900 focus:border-[#801B28] outline-none"
                >
                  <option value="">-- Seleccionar Docente Tutor/a --</option>
                  {listaDocentes.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre} {d.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Estudiante Practicante:</label>
                <input type="text" readOnly value={formData.apellidos_nombres} className="w-full border p-2 rounded-xl bg-slate-50 font-extrabold text-slate-900" />
              </div>
            </div>
          </div>

          <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200 text-slate-700 text-[11px] leading-relaxed">
            La/el docente acompañante de ESFM/UA realiza seguimiento a la/el estudiante practicante, evaluando los criterios descritos por lo menos 2 veces durante el desarrollo de la PEC.
          </div>

          {/* MATRIZ DE CRITERIOS DE EVALUACIÓN */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
              CRITERIOS DE EVALUACIÓN
            </span>

            {dimensionesTutor.map((dim) => (
              <div key={dim.dimension} className="space-y-3">
                {/* ENCABEZADO DE DIMENSIÓN */}
                <div className="bg-rose-50/80 p-2 rounded-xl border border-rose-200">
                  <span className="font-black text-[#801B28] text-[11px] uppercase tracking-wider block">
                    DIMENSIÓN: {dim.dimension}
                  </span>
                </div>

                <div className="space-y-3 pl-1">
                  {dim.criterios.map((crit) => {
                    const v1 = parseFloat(formData.evaluaciones?.[crit.key]?.v1);
                    const v2 = parseFloat(formData.evaluaciones?.[crit.key]?.v2);
                    const arr = [v1, v2].filter(n => !isNaN(n));
                    const promParcial = arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : '-';

                    return (
                      <div key={crit.key} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                        {/* FILA DE VALORACIONES CON NOMBRES DE COLUMNAS APROPIADOS */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <span className="sm:col-span-6 font-bold text-slate-800 text-[11px] leading-snug">
                            {crit.label}
                          </span>

                          <div className="sm:col-span-2">
                            <label className="block text-[9px] font-extrabold text-slate-500 uppercase text-center mb-0.5">
                              (A) 1ra Valoración
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              placeholder="1-100"
                              value={formData.evaluaciones?.[crit.key]?.v1 || ''}
                              onChange={(e) => handleValoracionChange(crit.key, 'v1', e.target.value)}
                              className="w-full border p-1.5 rounded-lg text-center font-mono font-bold bg-white focus:border-[#801B28] outline-none"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[9px] font-extrabold text-slate-500 uppercase text-center mb-0.5">
                              (B) 2da Valoración
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              placeholder="1-100"
                              value={formData.evaluaciones?.[crit.key]?.v2 || ''}
                              onChange={(e) => handleValoracionChange(crit.key, 'v2', e.target.value)}
                              className="w-full border p-1.5 rounded-lg text-center font-mono font-bold bg-white focus:border-[#801B28] outline-none"
                            />
                          </div>

                          <div className="sm:col-span-2 text-center bg-rose-50/60 p-1.5 rounded-xl border border-rose-100">
                            <label className="block text-[9px] font-black text-[#801B28] uppercase">
                              Promedio Parcial (A+B)/2
                            </label>
                            <span className="font-mono font-black text-sm text-[#801B28]">
                              {promParcial}
                            </span>
                          </div>
                        </div>

                        {/* CAMPO AMPLIO DE OBSERVACIONES Y RECOMENDACIONES ABAJO DE LAS PONDERACIONES */}
                        <div>
                          <label className="block font-bold text-slate-600 text-[10px] mb-0.5">
                            Observaciones / Recomendaciones:
                          </label>
                          <textarea
                            rows="2"
                            placeholder="Escriba las observaciones y recomendaciones correspondientes..."
                            value={formData.evaluaciones?.[crit.key]?.obs || ''}
                            onChange={(e) => handleObsChange(crit.key, e.target.value)}
                            className="w-full border p-2 rounded-xl bg-white text-[10px] text-slate-800 focus:border-[#801B28] outline-none"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* FECHAS DE VALORACIÓN */}
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

            {/* PROMEDIO FINAL NUMERAL Y LITERAL */}
            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">PROMEDIO FINAL NUMERAL:</label>
                <div className="font-mono font-black text-2xl text-[#801B28]">{formData.promedio_numeral || '0.00'} / 100 PTS</div>
              </div>
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">LITERAL:</label>
                <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">{formData.promedio_literal}</div>
              </div>
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