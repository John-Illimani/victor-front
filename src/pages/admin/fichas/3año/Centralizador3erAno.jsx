import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin, UserCheck, Award } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const Centralizador3erAno = ({ isOpen, onClose, fichaData, setFichaData, listaDocentes = [], estudianteSeleccionado }) => {
  const codigoFicha = "CENTRALIZADOR";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const camposNotas = [
    { key: 'nota_a1', label: 'Técnicas e instrumentos de investigación', ficha: 'A-1', etapa: 'Etapa preparatoria' },
    { key: 'nota_b1', label: 'Apoyo - seguimiento del Docente Acompañante de la ESFM/UA', ficha: 'B-1', etapa: 'Etapa de ejecución' },
    { key: 'nota_b2', label: 'Asistencia práctica educativa comunitaria.', ficha: 'B-2', etapa: 'Etapa de ejecución' },
    { key: 'nota_b3', label: 'Apoyo - Seguimiento del docente guía de la UE/CEA/CEE, en la concreción curricular.', ficha: 'B-3', etapa: 'Etapa de ejecución' },
    { key: 'nota_b4', label: 'Seguimiento y apoyo del docente tutor/acompañante', ficha: 'B-4', etapa: 'Etapa de ejecución' },
    { key: 'nota_b5', label: 'Presentación del informe diagnóstico socioparticipativo', ficha: 'B-5', etapa: 'Etapa de producción' }
  ];

  const [formData, setFormData] = useState({
    apellidos_nombres: '',
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    especialidad: ESPECIALIDADES_ESFM[0],
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    nota_a1: '', nota_b1: '', nota_b2: '', nota_b3: '', nota_b4: '', nota_b5: '',
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
        especialidad: estudianteSeleccionado.especialidad || prev.especialidad,
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
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "CENTRALIZADOR DE EVALUACIÓN 3º AÑO DE FORMACIÓN"}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          
          <div className="border-b border-slate-200 pb-2 text-center">
            <h4 className="font-extrabold text-[#801B28] uppercase text-sm flex justify-center items-center gap-2">
              <Award size={18} /> CENTRALIZADOR DE EVALUACIÓN IEPC-PEC 3º AÑO DE FORMACIÓN
            </h4>
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

          {/* TABLA CENTRALIZADORA OFICIAL 3ER AÑO */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#801B28] text-white uppercase text-[10px] font-black tracking-wider">
                  <th className="p-2.5 border-b border-rose-900 w-1/4">ETAPA</th>
                  <th className="p-2.5 border-b border-rose-900">ACTIVIDADES</th>
                  <th className="p-2.5 border-b border-rose-900 text-center w-20">FICHA</th>
                  <th className="p-2.5 border-b border-rose-900 text-center w-32">PUNTAJE</th>
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
                        placeholder="0"
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

          {/* RESUMEN PROMEDIO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <label className="block font-extrabold text-slate-500 uppercase text-[10px]">PROMEDIO (NÚMERO ENTERO):</label>
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

          {/* OBSERVACIONES Y SUGERENCIAS */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
            <label className="block font-bold text-slate-700 text-[10px]">OBSERVACIONES Y/O SUGERENCIAS:</label>
            <textarea
              rows="3"
              value={formData.observaciones}
              onChange={(e) => handleCampoChange('observaciones', e.target.value)}
              className="w-full border p-2 rounded-xl font-medium text-slate-800 text-xs outline-none focus:border-[#801B28]"
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