import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin, UserCheck } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const FichaB1_3erAno = ({ isOpen, onClose, fichaData, setFichaData, listaDocentes = [], estudianteSeleccionado }) => {
  const codigoFicha = "3_B1";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const criteriosAntes = [
    { key: 'c1', etapa: 'Antes de la PEC', label: 'Presenta Planes de Desarrollo Curricular y otros documentos de apoyo requeridos para el desarrollo de la práctica.' },
    { key: 'c2', etapa: 'Antes de la PEC', label: 'Elabora la guía de concreción de cada PDC de manera clara, precisa y coherente con el proceso formativo.' }
  ];

  const criteriosDurante = [
    { key: 'c3', etapa: 'Durante la PEC', label: 'Demuestra responsabilidad y puntualidad en el desarrollo de la Práctica Educativa Comunitaria y del proceso investigativo en la UE/CEA/CEE.' },
    { key: 'c4', etapa: 'Durante la PEC', label: 'Manifiesta iniciativa, creatividad y dominio en la concreción curricular y en las actividades vinculadas al diagnóstico socioparticipativo.' },
    { key: 'c5', etapa: 'Durante la PEC', label: 'Aplica técnicas e instrumentos de investigación de manera pertinente para la identificación, análisis y priorización de necesidades, problemas y/o potencialidades.' }
  ];

  const todosCriterios = [...criteriosAntes, ...criteriosDurante];

  const [formData, setFormData] = useState({
    apellidos_nombres: '',
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    especialidad: ESPECIALIDADES_ESFM[0],
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    ano: '2026',
    puntaje_final: 0,
    promedio_literal: 'CERO CON 00/100',
    recomendaciones: '',
    docente_acompanante_id: '',
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
    const notas = todosCriterios.map(c => parseFloat(newForm[c.key])).filter(n => !isNaN(n));
    const prom = notas.length > 0 ? parseFloat((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)) : 0;

    newForm.puntaje_final = prom;
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
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-1: APOYO Y SEGUIMIENTO DEL DOCENTE ACOMPAÑANTE"}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          
          {/* DATOS REFERENCIALES */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
            <span className="font-extrabold text-amber-900 uppercase text-[11px] flex items-center gap-1.5">
              <GraduationCap size={15} /> DATOS REFERENCIALES DEL ESTUDIANTE
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

          {/* MATRIZ B-1 CON SUBTÍTULOS POR ETAPA */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b border-slate-100 pb-2">
              CRITERIOS DE EVALUACIÓN DOCENTE ACOMPAÑANTE ESFM/UA
            </span>

            {/* SECCIÓN 1: ANTES DE LA PEC */}
            <div className="space-y-2">
              <span className="font-black text-[#801B28] text-[11px] uppercase tracking-wide block bg-rose-50/80 p-2 rounded-xl border border-rose-100">
                ANTES DE LA PEC
              </span>
              {criteriosAntes.map(crit => (
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

            {/* SECCIÓN 2: DURANTE LA PEC */}
            <div className="space-y-2 pt-2">
              <span className="font-black text-[#801B28] text-[11px] uppercase tracking-wide block bg-rose-50/80 p-2 rounded-xl border border-rose-100">
                DURANTE LA PEC
              </span>
              {criteriosDurante.map(crit => (
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
                <label className="block font-black text-slate-700 text-[10px] uppercase">Puntaje Final (Número entero):</label>
                <div className="font-mono font-black text-2xl text-[#801B28]">{formData.puntaje_final || '0.00'} / 100 PTS</div>
              </div>
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">Literal:</label>
                <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">{formData.promedio_literal}</div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-[10px] mb-1">Recomendaciones y/o Sugerencias:</label>
              <textarea
                rows="3"
                value={formData.recomendaciones}
                onChange={(e) => handleCampoChange('recomendaciones', e.target.value)}
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