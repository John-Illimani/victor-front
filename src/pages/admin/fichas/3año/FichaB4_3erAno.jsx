import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin, UserCheck } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const FichaB4_3erAno = ({ isOpen, onClose, fichaData, setFichaData, listaDocentes = [], estudianteSeleccionado }) => {
  const codigoFicha = "3_B4";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const criteriosSer = [
    { key: 'ser_1', label: 'Responsabilidad, compromiso y puntualidad en el desarrollo de la práctica educativa.' },
    { key: 'ser_2', label: 'Respeto en el trato con estudiantes, padres/madres de familia, maestras, maestros y personal de la UE/CEA/CEE.' },
    { key: 'ser_3', label: 'Promueve la práctica de valores sociocomunitarios en la UE/CEA/CEE.' }
  ];

  const criteriosSaber = [
    { key: 'saber_1', label: 'Conocimiento y manejo de elementos curriculares de la planificación.' },
    { key: 'saber_2', label: 'Conocimiento y dominio de elementos propios de su especialidad.' },
    { key: 'saber_3', label: 'Promueve el fortalecimiento del pensamiento crítico y reflexivo con las y los estudiantes.' },
    { key: 'saber_4', label: 'Dominio de aula usando estrategias pertinentes.' }
  ];

  const criteriosHacer = [
    { key: 'hacer_1', label: 'Manifiesta creatividad en el uso de recursos materiales y educativos.' },
    { key: 'hacer_2', label: 'Utiliza instrumentos de evaluación durante la concreción curricular.' }
  ];

  const criteriosDecidir = [
    { key: 'decidir_1', label: 'Asume las sugerencias y observaciones a los PDC elaborados.' },
    { key: 'decidir_2', label: 'Aplica acciones de manera oportuna para la mejora de la PEC.' }
  ];

  const todosCriterios = [...criteriosSer, ...criteriosSaber, ...criteriosHacer, ...criteriosDecidir];

  const [formData, setFormData] = useState({
    apellidos_nombres: '',
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    ano: '2026',
    promedio_numeral: 0,
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
        ...fichaData
      }));
    }
  }, [estudianteSeleccionado, fichaData]);

  const handleNotaChange = (key, value) => {
    let val = parseFloat(value);
    if (isNaN(val)) val = '';
    else if (val < 1) val = 1;
    else if (val > 100) val = 100;

    const newForm = { ...formData, [key]: val };
    const notas = todosCriterios.map(c => parseFloat(newForm[c.key])).filter(n => !isNaN(n));
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
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-4: SEGUIMIENTO Y APOYO DEL DOCENTE TUTOR/ACOMPAÑANTE"}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          
          {/* DATOS REFERENCIALES */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
            <span className="font-extrabold text-amber-900 uppercase text-[11px] flex items-center gap-1.5">
              <GraduationCap size={15} /> NOMBRE DEL ESTUDIANTE
            </span>
            <input type="text" readOnly value={formData.apellidos_nombres} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-extrabold text-slate-900" />
          </div>

          {/* EVALUACIÓN SEPARADA POR SUBTÍTULOS DE DIMENSIONES */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
              EVALUACIÓN POR DIMENSIONES FORMATIVAS
            </span>

            {/* DIMENSIÓN: SER */}
            <div className="space-y-2">
              <span className="font-black text-[#801B28] text-[11px] uppercase tracking-wide block bg-rose-50/80 p-2 rounded-xl border border-rose-100">
                1. DIMENSIÓN: SER
              </span>
              {criteriosSer.map(crit => (
                <div key={crit.key} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="sm:col-span-4 font-medium text-slate-800">{crit.label}</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="1-100"
                    value={formData[crit.key] || ''}
                    onChange={(e) => handleNotaChange(crit.key, e.target.value)}
                    className="w-full border p-1.5 rounded-lg bg-white font-mono font-bold text-center text-slate-900 focus:border-[#801B28] outline-none"
                  />
                </div>
              ))}
            </div>

            {/* DIMENSIÓN: SABER */}
            <div className="space-y-2 pt-2">
              <span className="font-black text-[#801B28] text-[11px] uppercase tracking-wide block bg-rose-50/80 p-2 rounded-xl border border-rose-100">
                2. DIMENSIÓN: SABER
              </span>
              {criteriosSaber.map(crit => (
                <div key={crit.key} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="sm:col-span-4 font-medium text-slate-800">{crit.label}</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="1-100"
                    value={formData[crit.key] || ''}
                    onChange={(e) => handleNotaChange(crit.key, e.target.value)}
                    className="w-full border p-1.5 rounded-lg bg-white font-mono font-bold text-center text-slate-900 focus:border-[#801B28] outline-none"
                  />
                </div>
              ))}
            </div>

            {/* DIMENSIÓN: HACER */}
            <div className="space-y-2 pt-2">
              <span className="font-black text-[#801B28] text-[11px] uppercase tracking-wide block bg-rose-50/80 p-2 rounded-xl border border-rose-100">
                3. DIMENSIÓN: HACER
              </span>
              {criteriosHacer.map(crit => (
                <div key={crit.key} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="sm:col-span-4 font-medium text-slate-800">{crit.label}</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="1-100"
                    value={formData[crit.key] || ''}
                    onChange={(e) => handleNotaChange(crit.key, e.target.value)}
                    className="w-full border p-1.5 rounded-lg bg-white font-mono font-bold text-center text-slate-900 focus:border-[#801B28] outline-none"
                  />
                </div>
              ))}
            </div>

            {/* DIMENSIÓN: DECIDIR */}
            <div className="space-y-2 pt-2">
              <span className="font-black text-[#801B28] text-[11px] uppercase tracking-wide block bg-rose-50/80 p-2 rounded-xl border border-rose-100">
                4. DIMENSIÓN: DECIDIR
              </span>
              {criteriosDecidir.map(crit => (
                <div key={crit.key} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="sm:col-span-4 font-medium text-slate-800">{crit.label}</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="1-100"
                    value={formData[crit.key] || ''}
                    onChange={(e) => handleNotaChange(crit.key, e.target.value)}
                    className="w-full border p-1.5 rounded-lg bg-white font-mono font-bold text-center text-slate-900 focus:border-[#801B28] outline-none"
                  />
                </div>
              ))}
            </div>

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
              <label className="block font-bold text-slate-700 text-[10px] mb-1">Observaciones / Sugerencias:</label>
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