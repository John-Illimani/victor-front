import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const Centralizador4toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado, listaDocentes = [] }) => {
  const codigoFicha = "CENTRALIZADOR";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const etapasCentralizador = [
    {
      etapa: 'PLANIFICACIÓN Y ORGANIZACIÓN',
      filas: [
        { actividad: 'Técnicas e instrumentos de investigación.', indicador: 'Desempeño en el proceso de la PEC.', instrumento: 'Ficha A-1', key: 'nota_a1' },
        { actividad: 'Elaboración de planes de desarrollo curricular (PDC).', indicador: 'PDC elaborados por cada integrante.', instrumento: 'Ficha A-2', key: 'nota_a2' }
      ]
    },
    {
      etapa: 'EJECUCIÓN',
      filas: [
        { actividad: 'Control de asistencia de la práctica educativa comunitaria (PEC).', indicador: 'Control de asistencia, faltas y atrasos.', instrumento: 'Ficha B-1', key: 'nota_b1' },
        { actividad: 'Concreción curricular', indicador: 'Desarrollo de PDC y de la clase comunitaria.', instrumento: 'Ficha B-4 (Promedio B-2, B-3)', key: 'nota_b4' },
        { actividad: 'Seguimiento y apoyo', indicador: 'Del docente guía.', instrumento: 'Fichas B-5', key: 'nota_b5' },
        { actividad: 'Seguimiento y apoyo', indicador: 'Del docente tutor.', instrumento: 'Fichas B-6', key: 'nota_b6' },
        { actividad: 'Socialización del Diagnóstico socioparticipativo de la UE/CEA/CEE.', indicador: 'Presentación de resultados del diagnóstico', instrumento: 'Ficha B-7', key: 'nota_b7' }
      ]
    },
    {
      etapa: 'SOCIALIZACIÓN',
      filas: [
        { actividad: 'Evaluación del Documento del Diseño Metodológico por la/el docente tutor/a acompañante.', indicador: 'Evaluación del documento', instrumento: 'Ficha C-1', key: 'nota_c1' },
        { actividad: 'Socialización del Diseño Metodológico - Comisión Comunitaria de Evaluación.', indicador: 'Exposición y controversia', instrumento: 'Ficha C-2', key: 'nota_c2' }
      ]
    }
  ];

  const [formData, setFormData] = useState({
    docente_tutor_id: '',
    integrante_ectg: '',
    especialidad: ESPECIALIDADES_ESFM[0],
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
        integrante_ectg: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
        especialidad: estudianteSeleccionado.especialidad || prev.especialidad,
        ...fichaData
      }));
    }
  }, [estudianteSeleccionado, fichaData]);

  const handlePuntajeChange = (key, value) => {
    let num = parseFloat(value);
    if (isNaN(num)) num = '';
    else if (num < 1) num = 1;
    else if (num > 100) num = 100;

    const newForm = { ...formData, [key]: num };
    
    const todasLasKeys = etapasCentralizador.flatMap(e => e.filas.map(f => f.key));
    const notas = todasLasKeys.map(k => parseFloat(newForm[k])).filter(n => !isNaN(n));
    const prom = notas.length > 0 ? parseFloat((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)) : 0;

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
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA CENTRALIZADORA DE EVALUACIÓN (4TO AÑO)"}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          
          {/* DATOS REFERENCIALES */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-[#801B28] uppercase text-[11px] block border-b pb-2">
              DATOS REFERENCIALES
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Docente Tutor/a Acompañante:</label>
                <select
                  value={formData.docente_tutor_id}
                  onChange={(e) => handleCampoChange('docente_tutor_id', e.target.value)}
                  className="w-full border p-2 rounded-xl bg-white font-bold text-slate-900 focus:border-[#801B28] outline-none"
                >
                  <option value="">-- Seleccionar Docente Tutor/a --</option>
                  {listaDocentes.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre} {d.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Integrante del ECTG:</label>
                <input type="text" readOnly value={formData.integrante_ectg} className="w-full border p-2 rounded-xl bg-slate-50 font-extrabold text-slate-900" />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                <select value={formData.especialidad} onChange={(e) => handleCampoChange('especialidad', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold">
                  {ESPECIALIDADES_ESFM.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* MATRIZ DE EVALUACIÓN CENTRALIZADORA POR ETAPAS */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
              CENTRALIZADOR GENERAL DE ACTIVIDADES Y EVALUACIONES
            </span>

            {etapasCentralizador.map((etapaGroup) => (
              <div key={etapaGroup.etapa} className="space-y-2">
                {/* SUBTÍTULO POR ETAPA */}
                <div className="bg-rose-50/80 p-2 rounded-xl border border-rose-200">
                  <span className="font-black text-[#801B28] text-[11px] uppercase tracking-wider block">
                    ETAPA: {etapaGroup.etapa}
                  </span>
                </div>

                {/* FILAS DE ACTIVIDADES */}
                <div className="space-y-1.5 pl-1">
                  {etapaGroup.filas.map((f) => (
                    <div key={f.key} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="sm:col-span-4">
                        <span className="font-bold text-slate-800 text-[11px] block">{f.actividad}</span>
                        <span className="text-[10px] text-slate-500">{f.indicador} ({f.instrumento})</span>
                      </div>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="Puntaje"
                        value={formData[f.key] || ''}
                        onChange={(e) => handlePuntajeChange(f.key, e.target.value)}
                        className="sm:col-span-2 border p-2 rounded-lg bg-white font-mono font-bold text-center text-slate-900 focus:border-[#801B28] outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">Calificación Promedio Final:</label>
                <div className="font-mono font-black text-2xl text-[#801B28]">{formData.promedio_numeral || '0.00'} / 100 PTS</div>
              </div>
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">Literal:</label>
                <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">{formData.promedio_literal}</div>
              </div>
            </div>
          </div>

          {/* LUGAR Y FECHA DE EMISIÓN */}
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