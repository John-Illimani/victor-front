import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const FichaB3_4toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "4_B3";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const criteriosClaseComunitaria = [
    {
      categoria: '1. PLANIFICACIÓN – CONCRECIÓN DEL PDC',
      items: [
        { key: 'c1', label: 'Existe coherencia y relación del objetivo con el proceso pedagógico y los criterios de evaluación.' },
        { key: 'c2', label: 'Los elementos curriculares del PDC se relacionan con el desarrollo de la clase.' }
      ]
    },
    {
      categoria: '2. DESARROLLO DE CONTENIDOS',
      items: [
        { key: 'c3', label: 'Recupera conocimientos y experiencias de las y los estudiantes.' },
        { key: 'c4', label: 'Dinamiza la participación activa y crítica.' },
        { key: 'c5', label: 'Vincula nuevos conocimientos con hechos de la realidad y la vida cotidiana.' },
        { key: 'c6', label: 'Muestra conocimiento profundo de los contenidos de su especialidad.' },
        { key: 'c7', label: 'Demuestra dominio de aula.' }
      ]
    },
    {
      categoria: '3. ESTRATEGIAS METODOLÓGICAS',
      items: [
        { key: 'c8', label: 'Promueve el trabajo en equipo y el diálogo.' },
        { key: 'c9', label: 'Fomenta actividades para aprender haciendo.' },
        { key: 'c10', label: 'Utiliza materiales educativos y herramientas tecnológicas pertinentes.' },
        { key: 'c11', label: 'Promueve el aprendizaje centrado en el estudiante como protagonista activo.' }
      ]
    },
    {
      categoria: '4. EVALUACIÓN',
      items: [
        { key: 'c12', label: 'Realiza la evaluación según el objetivo planificado en el PDC.' },
        { key: 'c13', label: 'Utiliza instrumento(s) de evaluación.' }
      ]
    }
  ];

  const todosCriteriosKeys = ['c1','c2','c3','c4','c5','c6','c7','c8','c9','c10','c11','c12','c13'];

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
    let val = parseFloat(value);
    if (isNaN(val)) val = '';
    else if (val < 1) val = 1;
    else if (val > 100) val = 100;

    const newForm = { ...formData, [key]: val };
    const notas = todosCriteriosKeys.map(k => parseFloat(newForm[k])).filter(n => !isNaN(n));
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
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-3: VALORACIÓN DE LA CLASE COMUNITARIA (4TO AÑO)"}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          
          <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200 text-slate-700 leading-relaxed text-[11px]">
            En esta clase participa un actor educativo como observador/a de la UE/CEA/CEE o ESFM/UA.
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
              VALORACIÓN DE LA CLASE COMUNITARIA (1 A 100 PTS)
            </span>

            {criteriosClaseComunitaria.map(cat => (
              <div key={cat.categoria} className="space-y-2">
                <span className="font-black text-[#801B28] text-[11px] uppercase tracking-wide block bg-rose-50/80 p-2 rounded-xl border border-rose-100">
                  {cat.categoria}
                </span>
                {cat.items.map(item => (
                  <div key={item.key} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="sm:col-span-4 font-medium text-slate-800 text-[11px]">{item.label}</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="1 - 100"
                      value={formData[item.key] || ''}
                      onChange={(e) => handleNotaChange(item.key, e.target.value)}
                      className="w-full border border-slate-300 p-2 rounded-lg bg-white font-mono font-bold text-center text-slate-900 focus:border-[#801B28] outline-none"
                    />
                  </div>
                ))}
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
              <label className="block font-bold text-slate-700 text-[10px] mb-1">Observaciones y/o sugerencias:</label>
              <textarea
                rows="3"
                value={formData.observaciones}
                onChange={(e) => handleCampoChange('observaciones', e.target.value)}
                className="w-full border p-2.5 rounded-xl font-medium text-slate-800 text-xs"
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