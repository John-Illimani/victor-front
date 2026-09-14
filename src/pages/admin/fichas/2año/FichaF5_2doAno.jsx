import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, UserCheck } from 'lucide-react';
import { CONFIGURACION_FICHAS, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const FichaF5_2doAno = ({ isOpen, onClose, fichaData, setFichaData, listaDocentes = [], estudianteSeleccionado }) => {
  const codigoFicha = "2_F5";
  const config = CONFIGURACION_FICHAS[codigoFicha];
  const etapas = config?.criteriosEtapas || [];

  const [formData, setFormData] = useState({
    apellidos_nombres: '',
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    ano_formacion: '2do Año de Formación',
    puntaje_final: 0,
    promedio_literal: 'CERO CON 00/100',
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

  const handleEtapaChange = (key, val) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = '';
    else if (num < 1) num = 1;
    else if (num > 100) num = 100;

    const nuevos = { ...formData, [key]: num };
    const todasLasClaves = etapas.flatMap(e => e.criterios.map(c => c.key));
    const notas = todasLasClaves.map(k => parseFloat(nuevos[k])).filter(n => !isNaN(n));
    
    const prom = notas.length > 0 ? parseFloat((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)) : 0;

    nuevos.puntaje_final = prom;
    nuevos.promedio_final = prom;
    nuevos.promedio_numeral = prom;
    nuevos.promedio_literal = convertirNumeroALiteral(prom);

    setFormData(nuevos);
    setFichaData(nuevos);
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
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Año de Formación:</label>
                <input type="text" value={formData.ano_formacion} onChange={(e) => handleCampoChange('ano_formacion', e.target.value)} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold text-slate-800" />
              </div>
            </div>
          </div>

          {/* CRITERIOS DE EVALUACIÓN POR ETAPAS */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
              CRITERIOS DE EVALUACIÓN POR ETAPAS (ANTES Y DURANTE LA PEC)
            </span>

            {etapas.map((etapaObj, idx) => (
              <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <h5 className="font-black text-[#801B28] uppercase text-[11px] border-b border-slate-200 pb-1">
                  {etapaObj.etapa}
                </h5>

                <div className="space-y-2">
                  {etapaObj.criterios.map((crit) => (
                    <div key={crit.key} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                      <span className="sm:col-span-3 font-medium text-slate-800 leading-snug">{crit.label}</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData[crit.key] !== undefined ? formData[crit.key] : ''}
                        onChange={(e) => handleEtapaChange(crit.key, e.target.value)}
                        className="w-full border border-slate-200 p-1.5 rounded-lg font-mono font-bold text-center text-slate-900 focus:border-[#801B28] outline-none"
                        placeholder="1-100"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">Puntaje Final:</label>
                <div className="font-mono font-black text-2xl text-[#801B28]">{formData.puntaje_final || '0.00'} / 100 PTS</div>
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