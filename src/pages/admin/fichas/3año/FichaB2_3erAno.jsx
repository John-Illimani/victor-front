import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { MapPin, Calendar, UserCheck, Award, GraduationCap } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const FichaB2_3erAno = ({ isOpen, onClose, fichaData, setFichaData, listaDocentes = [], estudianteSeleccionado }) => {
  const codigoFicha = "3_B2";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const semanasIniciales = [
    { semana: 'Semana 1', asistencia: '', inasistencia: '', atrasos: '', valoracion: '' },
    { semana: 'Semana 2', asistencia: '', inasistencia: '', atrasos: '', valoracion: '' },
    { semana: 'Semana 3', asistencia: '', inasistencia: '', atrasos: '', valoracion: '' },
    { semana: 'Semana 4', asistencia: '', inasistencia: '', atrasos: '', valoracion: '' },
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
    fecha_inicio_pec: '',
    fecha_conclusion_pec: '',
    semanas: semanasIniciales,
    promedio_numeral: 0,
    promedio_literal: 'CERO CON 00/100',
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
        ...fichaData
      }));
    }
  }, [estudianteSeleccionado, fichaData]);

  const handleCampoChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    setFichaData(updated);
  };

  const handleSemanaChange = (idx, field, value) => {
    const list = [...formData.semanas];
    list[idx][field] = value;

    const notas = list.map(s => parseFloat(s.valoracion)).filter(n => !isNaN(n));
    const prom = notas.length > 0 ? parseFloat((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)) : 0;

    const updated = {
      ...formData,
      semanas: list,
      promedio_numeral: prom,
      promedio_final: prom,
      promedio_literal: convertirNumeroALiteral(prom)
    };

    setFormData(updated);
    setFichaData(updated);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-2: ASISTENCIA - PRÁCTICA EDUCATIVA COMUNITARIA (4 SEMANAS)"}>
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
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                <select value={formData.especialidad} onChange={(e) => handleCampoChange('especialidad', e.target.value)} className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold">
                  {ESPECIALIDADES_ESFM.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* DURAClÓN PEC Y FECHAS */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-[#801B28] uppercase text-[11px]">DURACIÓN DE LA IEPC-PEC EN LA UE/CEA/CEE: 4 SEMANAS</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Fecha de Inicio de IEPC-PEC:</label>
                <input type="date" value={formData.fecha_inicio_pec} onChange={(e) => handleCampoChange('fecha_inicio_pec', e.target.value)} className="w-full border p-2 rounded-xl font-mono" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Fecha de Conclusión de IEPC-PEC:</label>
                <input type="date" value={formData.fecha_conclusion_pec} onChange={(e) => handleCampoChange('fecha_conclusion_pec', e.target.value)} className="w-full border p-2 rounded-xl font-mono" />
              </div>
            </div>
          </div>

          {/* TABLA DE REGISTRO POR SEMANAS */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-slate-800 uppercase text-[11px]">REGISTRO DE ASISTENCIA</span>
            
            <div className="space-y-2">
              {formData.semanas.map((s, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center bg-slate-50 p-2 rounded-xl border">
                  <span className="font-bold text-slate-800">{s.semana}</span>
                  <input type="number" placeholder="N° Asist." value={s.asistencia} onChange={(e) => handleSemanaChange(idx, 'asistencia', e.target.value)} className="border p-1.5 rounded-lg text-center bg-white font-mono" />
                  <input type="number" placeholder="N° Inasist." value={s.inasistencia} onChange={(e) => handleSemanaChange(idx, 'inasistencia', e.target.value)} className="border p-1.5 rounded-lg text-center bg-white font-mono text-rose-600" />
                  <input type="number" placeholder="N° Atrasos" value={s.atrasos} onChange={(e) => handleSemanaChange(idx, 'atrasos', e.target.value)} className="border p-1.5 rounded-lg text-center bg-white font-mono text-amber-600" />
                  <input type="number" placeholder="Nota 1-100" value={s.valoracion} onChange={(e) => handleSemanaChange(idx, 'valoracion', e.target.value)} className="border p-1.5 rounded-lg text-center bg-white font-mono font-bold text-[#801B28]" />
                </div>
              ))}
            </div>

            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">Promedio Final:</label>
                <div className="font-mono font-black text-2xl text-[#801B28]">{formData.promedio_numeral || '0.00'} / 100 PTS</div>
              </div>
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">Literal:</label>
                <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">{formData.promedio_literal}</div>
              </div>
            </div>
          </div>

          {/* OBSERVACIONES REGLAMENTARIAS */}
          <div className="bg-rose-50/40 p-3 rounded-2xl border border-rose-100 space-y-1 text-[10px] text-slate-600">
            <span className="font-bold text-rose-900 uppercase block">Observaciones Normativas:</span>
            <p>• La inasistencia a la PEC es motivo y/o causa para la retención en el año de formación.</p>
            <p>• Tres atrasos continuos o discontinuos se registrarán como una inasistencia.</p>
            <p>• Se otorgará licencia solo en casos excepcionales con respaldo documental.</p>
          </div>

          

          {/* LUGAR Y FECHA */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
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