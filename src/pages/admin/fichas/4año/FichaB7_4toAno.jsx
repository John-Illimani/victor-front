import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const FichaB7_4toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "4_B7";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const aspectosDiagnostico = [
    { key: 'a1', desc: 'Características económicas, socioculturales y políticas del contexto.' },
    { key: 'a2', desc: 'Descripción de la UE/CEA/CEE (ubicación, dependencia, subsistema, datos estadísticos, personal, etc.).' },
    { key: 'a3', desc: 'Características del proceso educativo observadas en la concreción curricular y la participación estudiantil.' },
    { key: 'a4', desc: 'Características de la gestión institucional: dirección, organización, POA y relación con la comunidad.' },
    { key: 'a5', desc: 'Organización y procesamiento de la información recabada.' },
    { key: 'a6', desc: 'Identificación y priorización reflexiva de problemas, necesidades y potencialidades.' },
    { key: 'a7', desc: 'Formulación pertinente del nudo problemático y preguntas problematizadoras.' }
  ];

  const [formData, setFormData] = useState({
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    especialidad: ESPECIALIDADES_ESFM[0],
    integrantes_ectg: '',
    ue_cea_cee: '',
    fecha_evaluacion: new Date().toISOString().split('T')[0],
    evaluaciones: {}, // { a1: { cualitativa: '', nota: 90 }, ... }
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
        integrantes_ectg: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
        especialidad: estudianteSeleccionado.especialidad || prev.especialidad,
        ...fichaData
      }));
    }
  }, [estudianteSeleccionado, fichaData]);

  const handleAspectoChange = (aspKey, field, value) => {
    const updatedEvals = {
      ...(formData.evaluaciones || {}),
      [aspKey]: {
        ...(formData.evaluaciones?.[aspKey] || {}),
        [field]: field === 'nota' ? (parseFloat(value) || '') : value
      }
    };

    const notasValidas = aspectosDiagnostico.map(a => parseFloat(updatedEvals[a.key]?.nota)).filter(n => !isNaN(n));
    const prom = notasValidas.length > 0 ? parseFloat((notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length).toFixed(2)) : 0;

    const newForm = {
      ...formData,
      evaluaciones: updatedEvals,
      promedio_numeral: prom,
      promedio_final: prom,
      promedio_literal: convertirNumeroALiteral(prom)
    };

    setFormData(newForm);
    setFichaData(newForm);
  };

  const handleCampoChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    setFichaData(updated);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-7: DIAGNÓSTICO SOCIOPARTICIPATIVO DE LA UE/CEA/CEE"}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          
          <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200 text-slate-700 text-[11px] leading-relaxed">
            El ECTG presenta un informe sobre los principales resultados del diagnóstico socioparticipativo, elaborado con apoyo de instrumentos de investigación y revisión documental. Se socializa a la comunidad educativa en la última semana de la PEC.
          </div>

          {/* DATOS REFERENCIALES GENERALES */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-[#801B28] uppercase text-[11px] block border-b pb-2">
              DATOS REFERENCIALES DEL INFORME
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">ESFM/UA:</label>
                <input type="text" value={formData.esfm_ua} onChange={(e) => handleCampoChange('esfm_ua', e.target.value)} className="w-full border p-2 rounded-xl font-bold" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                <select value={formData.especialidad} onChange={(e) => handleCampoChange('especialidad', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold">
                  {ESPECIALIDADES_ESFM.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Integrantes del ECTG:</label>
                <input type="text" value={formData.integrantes_ectg} onChange={(e) => handleCampoChange('integrantes_ectg', e.target.value)} className="w-full border p-2 rounded-xl font-bold" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">UE/CEA/CEE:</label>
                <input type="text" value={formData.ue_cea_cee} onChange={(e) => handleCampoChange('ue_cea_cee', e.target.value)} className="w-full border p-2 rounded-xl font-bold" placeholder="Nombre de la Unidad Educativa" />
              </div>
            </div>
          </div>

          {/* ASPECTOS DE EVALUACIÓN CUALI/CUANTI */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
              VALORACIÓN DEL INFORME DE DIAGNÓSTICO
            </span>

            <div className="space-y-3">
              {aspectosDiagnostico.map(asp => (
                <div key={asp.key} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 text-[11px] block">{asp.desc}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Valoración cualitativa del informe..."
                      value={formData.evaluaciones?.[asp.key]?.cualitativa || ''}
                      onChange={(e) => handleAspectoChange(asp.key, 'cualitativa', e.target.value)}
                      className="sm:col-span-3 border p-2 rounded-xl text-slate-800 bg-white"
                    />
                    <input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="1-100 Pts"
                      value={formData.evaluaciones?.[asp.key]?.nota || ''}
                      onChange={(e) => handleAspectoChange(asp.key, 'nota', e.target.value)}
                      className="border p-2 rounded-xl font-mono font-bold text-center bg-white focus:border-[#801B28] outline-none"
                    />
                  </div>
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