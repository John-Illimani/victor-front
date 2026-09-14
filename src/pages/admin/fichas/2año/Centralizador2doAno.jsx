import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin, UserCheck, Award } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const Centralizador2doAno = ({ isOpen, onClose, fichaData, setFichaData, listaDocentes = [], estudianteSeleccionado }) => {
  const codigoFicha = "CENTRALIZADOR";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const camposNotas = [
    { key: 'nota_f1', label: 'Plan de acción e instrumentos de diagnóstico debidamente validados', ficha: 'F-1', etapa: 'ETAPA PREPARATORIA (ANTES DE LA PEC)' },
    { key: 'nota_f2', label: 'Asistencia a la Práctica Educativa Comunitaria (PEC). F-2 100%', ficha: 'F-2', etapa: 'ETAPA DE EJECUCIÓN (DURANTE LA PEC)' },
    { key: 'nota_f3', label: 'Instrumentos de investigación educativa aplicados en cada espacio geográfico', ficha: 'F-3', etapa: 'ETAPA DE EJECUCIÓN (DURANTE LA PEC)' },
    { key: 'nota_f4', label: 'Apoyo y seguimiento del Docente Guía de UE/CEA/CEE en la Concreción Curricular', ficha: 'F-4', etapa: 'ETAPA DE EJECUCIÓN (DURANTE LA PEC)' },
    { key: 'nota_f5', label: 'Valoración de la/el Docente Acompañante de la ESFM/UA', ficha: 'F-5', etapa: 'ETAPA DE EJECUCIÓN (DURANTE LA PEC)' },
    { key: 'nota_f6', label: 'Valoración del documento Diagnóstico Socioeducativo', ficha: 'F-6', etapa: 'ETAPA DE PRODUCCIÓN (DESPUÉS DE LA PEC)' }
  ];

  const [formData, setFormData] = useState({
    apellidos_nombres: '',
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    ano_formacion: '2do Año de Formación',
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    nota_f1: '', nota_f2: '', nota_f3: '', nota_f4: '', nota_f5: '', nota_f6: '',
    promedio_numeral: 0,
    promedio_literal: 'CERO CON 00/100',
    observaciones: '',
    docente_acompanante_id: '',
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

  const handleNotaCentralizadorChange = (key, value) => {
    let num = parseFloat(value);
    if (isNaN(num)) num = '';
    else if (num < 0) num = 0;
    else if (num > 100) num = 100;

    const newForm = { ...formData, [key]: num };
    const notas = camposNotas.map(c => parseFloat(newForm[c.key])).filter(n => !isNaN(n));
    const prom = notas.length > 0 ? parseFloat((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)) : 0;

    newForm.promedio_numeral = prom;
    newForm.promedio_final = prom;
    newForm.puntaje_final = prom;
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
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          
          <div className="border-b border-slate-200 pb-2 text-center">
            <h4 className="font-extrabold text-[#801B28] uppercase text-sm flex justify-center items-center gap-2">
              <Award size={18} /> CENTRALIZADOR DE EVALUACIÓN IEPC-PEC 2º AÑO DE FORMACIÓN
            </h4>
            <p className="text-[11px] font-semibold text-slate-600 mt-1">
              Responsable de llenado: Docente Acompañante de la ESFM/UA
            </p>
          </div>

          {/* DATOS REFERENCIALES */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
            <span className="font-extrabold text-amber-900 uppercase text-[11px] flex items-center gap-1.5">
              <GraduationCap size={15} /> DATOS REFERENCIALES
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Nombres y Apellidos:</label>
                <input type="text" readOnly value={formData.apellidos_nombres} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-extrabold text-slate-900" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">ESFM/UA:</label>
                <input type="text" value={formData.esfm_ua} onChange={(e) => handleCampoChange('esfm_ua', e.target.value)} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold text-slate-800" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Año de Formación:</label>
                <input type="text" readOnly value={formData.ano_formacion} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold text-slate-800" />
              </div>
            </div>
          </div>

          {/* TABLA CENTRALIZADORA DE 2DO AÑO */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#801B28] text-white uppercase text-[10px] font-black tracking-wider">
                  <th className="p-2.5 border-b border-rose-900 w-1/4">ETAPA</th>
                  <th className="p-2.5 border-b border-rose-900">ACTIVIDADES</th>
                  <th className="p-2.5 border-b border-rose-900 text-center w-20">FICHA</th>
                  <th className="p-2.5 border-b border-rose-900 text-center w-32">CALIFICACIÓN OBTENIDA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {camposNotas.map((c, idx) => (
                  <tr key={c.key} className="hover:bg-slate-50/80 transition-colors">
                    {idx === 0 && (
                      <td rowSpan={1} className="p-2.5 font-bold bg-rose-50/40 text-slate-700 align-middle border-r border-slate-200 text-[10px]">
                        {c.etapa}
                      </td>
                    )}
                    {idx === 1 && (
                      <td rowSpan={4} className="p-2.5 font-bold bg-rose-50/40 text-slate-700 align-middle border-r border-slate-200 text-[10px]">
                        {c.etapa}
                      </td>
                    )}
                    {idx === 5 && (
                      <td rowSpan={1} className="p-2.5 font-bold bg-rose-50/40 text-slate-700 align-middle border-r border-slate-200 text-[10px]">
                        {c.etapa}
                      </td>
                    )}
                    <td className="p-2.5 leading-snug">{c.label}</td>
                    <td className="p-2.5 text-center font-bold font-mono text-slate-700 border-x border-slate-200">{c.ficha}</td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="0.00"
                        value={formData[c.key] !== undefined ? formData[c.key] : ''}
                        onChange={(e) => handleNotaCentralizadorChange(c.key, e.target.value)}
                        className="w-full border border-slate-200 p-1.5 rounded-lg font-mono font-bold text-center text-slate-900 bg-white focus:border-[#801B28] outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CUADRO RESUMEN PROMEDIO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <label className="block font-extrabold text-slate-500 uppercase text-[10px]">PROMEDIO TOTAL CONSOLIDADO:</label>
              <div className="font-mono font-black text-2xl text-[#801B28] mt-1">
                {formData.promedio_numeral || '0.00'} / 100 PTS
              </div>
            </div>
            <div>
              <label className="block font-extrabold text-slate-500 uppercase text-[10px]">PROMEDIO LITERAL:</label>
              <div className="font-extrabold text-xs text-slate-800 uppercase mt-2">
                {formData.promedio_literal || 'CERO CON 00/100'}
              </div>
            </div>
          </div>

          {/* OBSERVACIONES */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
            <label className="block font-bold text-slate-700 text-[10px]">Observaciones y/o sugerencias:</label>
            <textarea
              rows="3"
              value={formData.observaciones}
              onChange={(e) => handleCampoChange('observaciones', e.target.value)}
              className="w-full border p-2 rounded-xl font-medium text-slate-800 text-xs outline-none focus:border-[#801B28]"
              placeholder="Escriba aquí las observaciones finales..."
            />
          </div>

         

          {/* LUGAR Y FECHA */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-[#801B28] uppercase text-[11px] flex items-center gap-1.5">
              <MapPin size={14} /> LUGAR Y FECHA
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
            </div>
          </div>

        </div>
      </div>
    </ModalBase>
  );
};