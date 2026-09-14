import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { MapPin, Calendar, UserCheck, Building, Award, GraduationCap } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const FichaF2_2doAno = ({ isOpen, onClose, fichaData, setFichaData, listaDocentes = [], estudianteSeleccionado }) => {
  const codigoFicha = "2_F2";
  const config = CONFIGURACION_FICHAS[codigoFicha];
  const numDias = config?.diasPredeterminados || 10;

  const initialDias = Array.from({ length: numDias }, (_, i) => ({ dia: `Día ${i + 1}`, detalle: '', valoracion: '' }));

  const [formData, setFormData] = useState({
    apellidos_nombres: '',
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    especialidad: ESPECIALIDADES_ESFM[0],
    ano_formacion: '2do Año',
    distrito_educativo: '',
    ue_cea_cee: '',
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    ano: '2026',
    fecha_inicio_pec: '',
    fecha_conclusion_pec: '',
    total_dias: String(numDias),
    total_faltas: '0',
    total_atrasos: '0',
    porcentaje_asistencia: '100',
    valoracion_100: 0,
    promedio_literal: 'CERO CON 00/100',
    dias: initialDias,
    docente_guia_id: '',
    director_ue_nombre: '',
    ...fichaData
  });

  useEffect(() => {
    if (estudianteSeleccionado) {
      setFormData(prev => ({
        ...prev,
        apellidos_nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
        especialidad: estudianteSeleccionado.especialidad || prev.especialidad,
        ano_formacion: estudianteSeleccionado.ano_formacion || prev.ano_formacion,
        ...fichaData
      }));
    }
  }, [estudianteSeleccionado, fichaData]);

  const handleCampoChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    setFichaData(updated);
  };

  const handleDiaChange = (idx, field, value) => {
    const list = [...formData.dias];
    
    if (field === 'valoracion') {
      let val = parseFloat(value);
      if (isNaN(val)) val = '';
      else if (val < 1) val = 1;
      else if (val > 100) val = 100;
      list[idx][field] = val;
    } else {
      list[idx][field] = value;
    }

    const notas = list.map(d => parseFloat(d.valoracion)).filter(n => !isNaN(n));
    const prom = notas.length > 0 ? parseFloat((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)) : 0;

    const updated = {
      ...formData,
      dias: list,
      valoracion_100: prom,
      promedio_numeral: prom,
      promedio_final: prom,
      promedio_literal: convertirNumeroALiteral(prom)
    };

    setFormData(updated);
    setFichaData(updated);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          
          {/* DATOS REFERENCIALES COMPLETOS */}
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

          {/* TABLA DE ACTIVIDADES Y NOTAS DIARIAS */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
              <Calendar size={15} className="text-[#801B28]" /> ACTIVIDADES REALIZADAS Y VALORACIÓN DIARIA (10 DÍAS)
            </span>

            <div className="space-y-2">
              {formData.dias.map((d, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="font-mono font-black text-slate-800 w-14 text-center bg-slate-200/60 p-2 rounded-lg">
                    {d.dia}
                  </span>
                  <textarea
                    rows="2"
                    placeholder="Detalle de actividades realizadas en el día..."
                    value={d.detalle}
                    onChange={(e) => handleDiaChange(idx, 'detalle', e.target.value)}
                    className="flex-1 border border-slate-200 p-2 rounded-lg bg-white text-slate-800 font-medium text-xs focus:border-[#801B28] outline-none"
                  />
                  <div className="w-24 text-center">
                    <label className="block text-[9px] font-extrabold text-slate-500 uppercase mb-0.5">Nota Día:</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="1-100"
                      value={d.valoracion !== undefined ? d.valoracion : ''}
                      onChange={(e) => handleDiaChange(idx, 'valoracion', e.target.value)}
                      className="w-full border border-slate-300 p-1.5 rounded-lg bg-white font-mono font-bold text-center text-[#801B28] text-xs focus:border-[#801B28] outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CONTROL DE FECHAS Y VALORACIÓN PROMEDIO */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-slate-200 pb-3">
              <div>
                <label className="block font-extrabold text-slate-700 text-[10px] uppercase mb-1">Fecha inicio PEC:</label>
                <input type="date" value={formData.fecha_inicio_pec} onChange={(e) => handleCampoChange('fecha_inicio_pec', e.target.value)} className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold text-slate-800" />
              </div>
              <div>
                <label className="block font-extrabold text-slate-700 text-[10px] uppercase mb-1">Fecha conclusión PEC:</label>
                <input type="date" value={formData.fecha_conclusion_pec} onChange={(e) => handleCampoChange('fecha_conclusion_pec', e.target.value)} className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold text-slate-800" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Total días:</label>
                <input type="text" value={formData.total_dias} onChange={(e) => handleCampoChange('total_dias', e.target.value)} className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold bg-white text-center" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Total Faltas:</label>
                <input type="text" value={formData.total_faltas} onChange={(e) => handleCampoChange('total_faltas', e.target.value)} className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold bg-white text-center text-rose-600" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Total Atrasos:</label>
                <input type="text" value={formData.total_atrasos} onChange={(e) => handleCampoChange('total_atrasos', e.target.value)} className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold bg-white text-center text-amber-600" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">% Asistencia:</label>
                <input type="text" value={formData.porcentaje_asistencia} onChange={(e) => handleCampoChange('porcentaje_asistencia', e.target.value)} className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold bg-white text-center text-emerald-600" />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase flex items-center gap-1">
                  <Award size={14} className="text-[#801B28]" /> Valoración sobre 100 Puntos (Promedio Automático):
                </label>
                <div className="font-mono font-black text-2xl text-[#801B28] mt-1">
                  {formData.valoracion_100 || '0.00'} / 100 PTS
                </div>
              </div>
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">Literal:</label>
                <div className="font-extrabold text-xs text-slate-900 uppercase mt-2">
                  {formData.promedio_literal || 'CERO CON 00/100'}
                </div>
              </div>
            </div>
          </div>

          

          {/* LUGAR Y FECHA */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
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