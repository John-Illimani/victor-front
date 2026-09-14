import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const Centralizador5toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado, listaDocentes = [] }) => {
  const codigoFicha = "CENTRALIZADOR";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const etapasCentralizador = [
    {
      etapa: 'PLANIFICACIÓN Y ORGANIZACIÓN',
      filas: [
        { actividad: 'Elaboración de PDC', indicador: 'PDC elaborado por cada integrante del ECTG. La elaboración es comunitaria, pero la valoración es individual, evitando copias y plagios de PDC entre los integrantes del ECTG', instrumento: 'Ficha A-1', key: 'nota_a1' }
      ]
    },
    {
      etapa: 'EJECUCIÓN',
      filas: [
        { actividad: 'Asistencia regular', indicador: 'Control de asistencia regular a la PEC. Se tomará en cuenta ausencias y atrasos.', instrumento: 'Ficha B-1', key: 'nota_b1' },
        { actividad: 'Concreción Curricular', indicador: 'Implementación individual de cada integrante del ECTG, de un mínimo de 9 PDCs y 1 Clase Comunitaria', instrumento: 'Ficha Promedio Final B-4', key: 'nota_b4' },
        { actividad: 'Seguimiento', indicador: 'Apoyo y seguimiento por parte de la/el Docente Guía de la UE/CEA/CEE', instrumento: 'Ficha B-5', key: 'nota_b5' },
        { actividad: 'Seguimiento', indicador: 'Apoyo y seguimiento por parte de/el Docente Acompañante', instrumento: 'Ficha B-6', key: 'nota_b6' }
      ]
    },
    {
      etapa: 'SOCIALIZACIÓN',
      filas: [
        { actividad: 'Elaboración del Trabajo de Grado', indicador: 'Documento del Trabajo de Grado.', instrumento: 'Ficha C-1', key: 'nota_c1' },
        { actividad: 'Socialización Comunitaria.', indicador: 'Socialización Comunitaria del Trabajo de Grado', instrumento: 'Ficha C-2', key: 'nota_c2' }
      ]
    }
  ];

  const [formData, setFormData] = useState({
    docente_tutor_id: '',
    estudiante_nombre: '',
    especialidad: ESPECIALIDADES_ESFM[0],
    promedio_final_1: 0,
    promedio_final_2: 0,
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
        estudiante_nombre: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
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

    // Cálculo Promedio Final 1 (A-1, B-1, B-4, B-5, B-6)
    const notas1 = ['nota_a1', 'nota_b1', 'nota_b4', 'nota_b5', 'nota_b6']
      .map(k => parseFloat(newForm[k]))
      .filter(n => !isNaN(n));
    const prom1 = notas1.length > 0 ? parseFloat((notas1.reduce((a, b) => a + b, 0) / notas1.length).toFixed(2)) : 0;

    // Cálculo Promedio Final 2 (C-1, C-2)
    const notas2 = ['nota_c1', 'nota_c2']
      .map(k => parseFloat(newForm[k]))
      .filter(n => !isNaN(n));
    const prom2 = notas2.length > 0 ? parseFloat((notas2.reduce((a, b) => a + b, 0) / notas2.length).toFixed(2)) : 0;

    newForm.promedio_final_1 = prom1;
    newForm.promedio_final_2 = prom2;
    newForm.promedio_numeral = prom2 > 0 ? prom2 : prom1;
    newForm.promedio_literal = convertirNumeroALiteral(newForm.promedio_numeral);

    setFormData(newForm);
    setFichaData(newForm);
  };

  const handleCampoChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    setFichaData(updated);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA CENTRALIZADORA DE EVALUACIÓN CUALITATIVA-CUANTITATIVA (5TO AÑO)"}>
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
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Estudiante Evaluado/a:</label>
                <input type="text" readOnly value={formData.estudiante_nombre} className="w-full border p-2 rounded-xl bg-slate-50 font-extrabold text-slate-900" />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                <select value={formData.especialidad} onChange={(e) => handleCampoChange('especialidad', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold">
                  {ESPECIALIDADES_ESFM.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* MATRIZ DE EVALUACIÓN DE LA PEC */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
              EVALUACIÓN DE LA PEC POR ETAPAS
            </span>

            {etapasCentralizador.map((etapaGroup) => (
              <div key={etapaGroup.etapa} className="space-y-2">
                <div className="bg-rose-50/80 p-2 rounded-xl border border-rose-200">
                  <span className="font-black text-[#801B28] text-[11px] uppercase tracking-wider block">
                    ETAPA: {etapaGroup.etapa}
                  </span>
                </div>

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

                {etapaGroup.etapa === 'EJECUCIÓN' && (
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex justify-between items-center my-2">
                    <span className="font-black text-amber-900 text-[11px] uppercase">CALIFICACIÓN PROMEDIO FINAL 1 (Planificación + Ejecución)</span>
                    <span className="font-mono font-black text-lg text-[#801B28]">{formData.promedio_final_1 || '0.00'} PTS</span>
                  </div>
                )}
              </div>
            ))}

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex justify-between items-center my-2">
              <span className="font-black text-amber-900 text-[11px] uppercase">CALIFICACIÓN PROMEDIO FINAL 2 (Ficha C-1 + Ficha C-2)</span>
              <span className="font-mono font-black text-lg text-[#801B28]">{formData.promedio_final_2 || '0.00'} PTS</span>
            </div>

            <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200 text-[10px] text-slate-700 space-y-1">
              <p className="font-bold border-b border-blue-200 pb-1">DISPOSICIONES REGLAMENTARIAS:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Todos los instrumentos aplicados deben ser evaluados sobre 100 puntos.</li>
                <li>La CALIFICACIÓN FINAL 1 es igual al promedio de las calificaciones obtenidas en la etapa de Planificación y Organización, y Ejecución.</li>
                <li>La nota final alcanzada sobre 100 puntos, debe ser incorporado al SIFMWEB.</li>
                <li>De la CALIFICACIÓN FINAL 1, el SIFMWEB pondera la calificación al 20% y lo replica en todas las UF semestralizadas del 1er Semestre.</li>
                <li>La calificación FICHA C-1 (Documento del Trabajo de Grado) se registra en el SIFMWEB donde se pondera la calificación al 20% y se replica en todas las UF semestralizadas del 2do semestre.</li>
                <li>La CALIFICACIÓN PROMEDIO FINAL 2 (Ficha C-1 y Ficha C-2) se registra en el SIFMWEB posterior a la socialización de trabajo de grado.</li>
              </ul>
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