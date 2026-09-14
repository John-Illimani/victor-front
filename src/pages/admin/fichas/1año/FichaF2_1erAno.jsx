import React, { useState, useEffect } from 'react';
import { ModalBase } from './ModalBase';
import { MapPin, Calendar, UserCheck, Building } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM } from '../../../../utils/camposFichas';

export const FichaF2_1erAno = ({ isOpen, onClose, fichaData, setFichaData, listaDocentes = [], estudianteSeleccionado }) => {
  const codigoFicha = "1_F2";
  const config = CONFIGURACION_FICHAS[codigoFicha];
  const numDias = config?.diasPredeterminados || 5;

  const initialDias = Array.from({ length: numDias }, (_, i) => ({ dia: `Día ${i + 1}`, detalle: '' }));

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
    total_dias: String(numDias),
    total_faltas: '0',
    total_atrasos: '0',
    porcentaje_asistencia: '100',
    valoracion_100: '100',
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
        ...fichaData
      }));
    }
  }, [estudianteSeleccionado, fichaData]);

  const handleCampoChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    setFichaData(updated);
  };

  const handleDiaChange = (idx, value) => {
    const list = [...formData.dias];
    list[idx].detalle = value;
    handleCampoChange('dias', list);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          
         

          {/* TABLA DE BREVE INFORME DE ACTIVIDADES DE LA SEMANA */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
              <Calendar size={15} className="text-[#801B28]" /> BREVE INFORME DE ACTIVIDADES DE LA SEMANA
            </span>

            <div className="space-y-2">
              {formData.dias.map((d, idx) => (
                <div key={idx} className="flex gap-2 items-start bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="font-mono font-black text-slate-800 w-14 text-center pt-2 bg-slate-200/60 p-1.5 rounded-lg">
                    {d.dia}
                  </span>
                  <textarea
                    rows="2"
                    placeholder="Breve detalle de actividades realizadas por la/el estudiante..."
                    value={d.detalle}
                    onChange={(e) => handleDiaChange(idx, e.target.value)}
                    className="flex-1 border border-slate-200 p-2 rounded-lg bg-white text-slate-800 font-medium text-xs focus:border-[#801B28] outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* CUADRO DE CONTROL DE FECHAS, ASISTENCIA Y VALORACIÓN */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-slate-200 pb-3">
              <div>
                <label className="block font-extrabold text-slate-700 text-[10px] uppercase mb-1">Fecha de inicio de la PEC:</label>
                <input
                  type="date"
                  value={formData.fecha_inicio_pec}
                  onChange={(e) => handleCampoChange('fecha_inicio_pec', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block font-extrabold text-slate-700 text-[10px] uppercase mb-1">Fecha de conclusión de la PEC:</label>
                <input
                  type="date"
                  value={formData.fecha_conclusion_pec}
                  onChange={(e) => handleCampoChange('fecha_conclusion_pec', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Total días:</label>
                <input
                  type="text"
                  value={formData.total_dias}
                  onChange={(e) => handleCampoChange('total_dias', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold bg-white text-center"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Total Faltas:</label>
                <input
                  type="text"
                  value={formData.total_faltas}
                  onChange={(e) => handleCampoChange('total_faltas', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold bg-white text-center text-rose-600"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Total Atrasos:</label>
                <input
                  type="text"
                  value={formData.total_atrasos}
                  onChange={(e) => handleCampoChange('total_atrasos', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl font-mono font-bold bg-white text-center text-amber-600"
                />
              </div>
              <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-200 text-center">
                <label className="block font-black text-slate-700 text-[10px] uppercase">Porcentaje total de asistencia:</label>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <input
                    type="text"
                    value={formData.porcentaje_asistencia}
                    onChange={(e) => handleCampoChange('porcentaje_asistencia', e.target.value)}
                    className="w-16 border border-rose-300 p-1 rounded-lg font-mono font-black text-center text-lg text-[#801B28] bg-white"
                  />
                  <span className="font-extrabold text-[#801B28] text-sm">/ 100%</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <label className="block font-extrabold text-slate-800 text-[11px] uppercase mb-1">Valoración sobre 100 puntos:</label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.valoracion_100}
                onChange={(e) => handleCampoChange('valoracion_100', e.target.value)}
                className="w-full border border-slate-200 p-2.5 rounded-xl font-mono font-black text-lg text-[#801B28] bg-white focus:border-[#801B28] outline-none"
                placeholder="Puntaje de 1 a 100..."
              />
            </div>
          </div>

          {/* FIRMAS / DOCENTES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <label className="block font-extrabold text-slate-800 uppercase text-[10px] mb-1 flex items-center gap-1">
                <UserCheck size={14} className="text-[#801B28]" /> Docente Guía UE/CEA/CEE:
              </label>
              <select
                value={formData[config?.docenteCampo] || ''}
                onChange={(e) => handleCampoChange(config?.docenteCampo, e.target.value)}
                className="w-full border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800 bg-white cursor-pointer"
              >
                <option value="">-- Seleccionar Docente Guía --</option>
                {listaDocentes.map(d => <option key={d.id} value={d.id}>{d.nombre} {d.apellido}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-extrabold text-slate-800 uppercase text-[10px] mb-1 flex items-center gap-1">
                <Building size={14} className="text-[#801B28]" /> Director/a UE/CEA/CEE:
              </label>
              <input
                type="text"
                placeholder="Nombre completo del Director/a UE..."
                value={formData.director_ue_nombre}
                onChange={(e) => handleCampoChange('director_ue_nombre', e.target.value)}
                className="w-full border border-slate-200 p-2 rounded-xl font-bold text-slate-800 bg-white"
              />
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