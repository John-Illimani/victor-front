import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const FichaA2_4toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "4_A2";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const criteriosPdc = [
    { key: 'c1', label: 'Claridad en el planteamiento del objetivo respecto a los resultados o logros a alcanzar con las y los estudiantes.' },
    { key: 'c2', label: 'Planteamiento coherente de los procesos pedagógicos según contenido(s) a desarrollar.' },
    { key: 'c3', label: 'Recursos y materiales educativos pertinentes.' },
    { key: 'c4', label: 'Planteamiento de estrategias e instrumentos de evaluación coherentes.' },
    { key: 'c5', label: 'Articulación adecuada entre los elementos curriculares del PDC.' }
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
    promedio_numeral: 0,
    promedio_literal: 'CERO CON 00/100',
    observaciones: '',
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

  const handleNotaChange = (key, value) => {
    let val = parseFloat(value);
    if (isNaN(val)) val = '';
    else if (val < 1) val = 1;
    else if (val > 100) val = 100;

    const newForm = { ...formData, [key]: val };
    const notas = criteriosPdc.map(c => parseFloat(newForm[c.key])).filter(n => !isNaN(n));
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
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA A-2: ELABORACIÓN DE PLANES DE DESARROLLO CURRICULAR - PDC"}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          
          <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
            Cada integrante del ECTG elabora y presenta los PDC establecidos (EIFC, EPCV y Especial desarrollan 4 PDC; ESCP desarrollan 6 PDC incluyendo clase comunitaria).
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
              CRITERIOS DE VALORACIÓN (1 A 100 PUNTOS)
            </span>

            {criteriosPdc.map((crit, idx) => (
              <div key={crit.key} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="sm:col-span-4 font-medium text-slate-800 text-[11px]">
                  <strong className="text-[#801B28] mr-1">{idx + 1}.</strong> {crit.label}
                </span>
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