import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin, Calendar } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const FichaB1_4toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "4_B1";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const semanasDefecto = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Semana 5', 'Semana 6'];

  const [formData, setFormData] = useState({
    apellidos_nombres: '',
    fecha_inicio: '',
    fecha_conclusion: '',
    semanas: {
      'Semana 1': { asistencia: '', inasistencia: '', atrasos: '', nota: 100 },
      'Semana 2': { asistencia: '', inasistencia: '', atrasos: '', nota: 100 },
      'Semana 3': { asistencia: '', inasistencia: '', atrasos: '', nota: 100 },
      'Semana 4': { asistencia: '', inasistencia: '', atrasos: '', nota: 100 },
      'Semana 5': { asistencia: '', inasistencia: '', atrasos: '', nota: 100 },
      'Semana 6': { asistencia: '', inasistencia: '', atrasos: '', nota: 100 }
    },
    promedio_numeral: 100,
    promedio_literal: 'CIEN CON 00/100',
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

  const handleSemanaChange = (semLabel, field, val) => {
    const semObj = { ...(formData.semanas || {}) };
    if (!semObj[semLabel]) semObj[semLabel] = {};
    semObj[semLabel][field] = val;

    if (field === 'nota') {
      let num = parseFloat(val);
      if (isNaN(num)) num = 0;
      semObj[semLabel].nota = num;
    }

    const notas = semanasDefecto.map(s => parseFloat(semObj[s]?.nota) || 0);
    const prom = parseFloat((notas.reduce((a, b) => a + b, 0) / 6).toFixed(2));

    const updated = {
      ...formData,
      semanas: semObj,
      promedio_numeral: prom,
      promedio_final: prom,
      promedio_literal: convertirNumeroALiteral(prom)
    };

    setFormData(updated);
    setFichaData(updated);
  };

  const handleCampoChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    setFichaData(updated);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA B-1: CONTROL DE ASISTENCIA PEC (6 SEMANAS - 4TO AÑO)"}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          
          <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed">
            Duración de la IEPC-PEC en la UE/CEA/CEE: <strong>6 Semanas</strong>. Tres retrasos se registran como inasistencia.
          </div>

          {/* DATOS REFERENCIALES SOLO NOMBRE */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
            <span className="font-extrabold text-amber-900 uppercase text-[11px] flex items-center gap-1.5">
              <GraduationCap size={15} /> NOMBRE DEL ESTUDIANTE
            </span>
            <input
              type="text"
              readOnly
              value={formData.apellidos_nombres}
              className="w-full border border-amber-200 p-2 rounded-xl bg-white font-extrabold text-slate-900"
            />
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-[#801B28] uppercase text-[11px] flex items-center gap-1.5">
              <Calendar size={15} /> FECHAS PEC
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Fecha de Inicio:</label>
                <input type="date" value={formData.fecha_inicio} onChange={(e) => handleCampoChange('fecha_inicio', e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Fecha de Conclusión:</label>
                <input type="date" value={formData.fecha_conclusion} onChange={(e) => handleCampoChange('fecha_conclusion', e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>
            </div>
          </div>

          {/* TABLA DE ASISTENCIA SEMANAL */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
              REGISTRO DE ASISTENCIA SEMANAL (6 SEMANAS)
            </span>

            {semanasDefecto.map((sem) => (
              <div key={sem} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="font-black text-[#801B28] uppercase text-[11px]">{sem}</span>
                <input type="number" placeholder="N° Asistencias" value={formData.semanas?.[sem]?.asistencia || ''} onChange={(e) => handleSemanaChange(sem, 'asistencia', e.target.value)} className="border p-1.5 rounded-lg text-center bg-white" />
                <input type="number" placeholder="N° Inasistencias" value={formData.semanas?.[sem]?.inasistencia || ''} onChange={(e) => handleSemanaChange(sem, 'inasistencia', e.target.value)} className="border p-1.5 rounded-lg text-center bg-white" />
                <input type="number" placeholder="N° Atrasos" value={formData.semanas?.[sem]?.atrasos || ''} onChange={(e) => handleSemanaChange(sem, 'atrasos', e.target.value)} className="border p-1.5 rounded-lg text-center bg-white" />
                <input type="number" min="1" max="100" placeholder="Valoración (1-100)" value={formData.semanas?.[sem]?.nota || ''} onChange={(e) => handleSemanaChange(sem, 'nota', e.target.value)} className="border p-1.5 rounded-lg text-center font-mono font-bold bg-white focus:border-[#801B28]" />
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