import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin, UserCheck } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const FichaF4_2doAno = ({ isOpen, onClose, fichaData, setFichaData, listaDocentes = [], estudianteSeleccionado }) => {
  const codigoFicha = "2_F4";
  const config = CONFIGURACION_FICHAS[codigoFicha];
  const criteriosPdc = config?.criteriosPdc || [];

  const [formData, setFormData] = useState({
    apellidos_nombres: '',
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    especialidad: ESPECIALIDADES_ESFM[0],
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    ano: '2026',
    pdcs: { 'PDC 1': {}, 'PDC 2': {} },
    promedio_total: 0,
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
        especialidad: estudianteSeleccionado.especialidad || prev.especialidad,
        ...fichaData
      }));
    }
  }, [estudianteSeleccionado, fichaData]);

  const handlePdcChange = (pdcKey, criterioKey, val) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = '';
    else if (num < 1) num = 1;
    else if (num > 100) num = 100;

    const nuevoPdcs = { ...(formData.pdcs || {}) };
    if (!nuevoPdcs[pdcKey]) nuevoPdcs[pdcKey] = {};
    nuevoPdcs[pdcKey][criterioKey] = num;

    const valores = Object.values(nuevoPdcs[pdcKey]).map(v => parseFloat(v)).filter(v => !isNaN(v));
    const promParcial = valores.length > 0 ? (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(2) : 0;
    nuevoPdcs[pdcKey].promedio_parcial = promParcial;

    const keysPdc = Object.keys(nuevoPdcs);
    const promsValidos = keysPdc.map(k => parseFloat(nuevoPdcs[k].promedio_parcial || 0)).filter(p => p > 0);
    const promTotal = promsValidos.length > 0 ? parseFloat((promsValidos.reduce((a, b) => a + b, 0) / promsValidos.length).toFixed(2)) : 0;

    const actualizados = {
      ...formData,
      pdcs: nuevoPdcs,
      promedio_total: promTotal,
      promedio_final: promTotal,
      promedio_literal: convertirNumeroALiteral(promTotal)
    };

    setFormData(actualizados);
    setFichaData(actualizados);
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

          {/* EVALUACIÓN MATRIZ DE PDCs */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block">
              SEGUIMIENTO A LA CONCRECIÓN CURRICULAR (PDC 1 Y PDC 2)
            </span>

            {['PDC 1', 'PDC 2'].map((pdcLabel) => (
              <div key={pdcLabel} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                  <span className="font-black text-[#801B28] uppercase text-xs">{pdcLabel}</span>
                  <span className="font-bold text-slate-600 text-[11px]">
                    Promedio Parcial: <strong className="text-slate-900 font-mono text-xs">{formData.pdcs?.[pdcLabel]?.promedio_parcial || '0.00'} Pts.</strong>
                  </span>
                </div>

                <div className="space-y-2">
                  {criteriosPdc.map((crit, cIdx) => (
                    <div key={cIdx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                      <span className="sm:col-span-3 font-medium text-slate-800 leading-snug">{crit.label}</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.pdcs?.[pdcLabel]?.[crit.key] !== undefined ? formData.pdcs[pdcLabel][crit.key] : ''}
                        onChange={(e) => handlePdcChange(pdcLabel, crit.key, e.target.value)}
                        className="w-full border border-slate-200 p-1.5 rounded-lg font-bold font-mono text-center text-slate-900 focus:border-[#801B28] outline-none"
                        placeholder="1-100"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">Promedio Total Concreción Curricular:</label>
                <div className="font-mono font-black text-2xl text-[#801B28]">{formData.promedio_total || '0.00'} / 100 PTS</div>
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
                placeholder="Observaciones del desarrollo curricular..."
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