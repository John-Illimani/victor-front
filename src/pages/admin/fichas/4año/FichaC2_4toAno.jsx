import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin, Plus, Trash2 } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, MODALIDADES_GRADUACION_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const FichaC2_4toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado, listaDocentes = [] }) => {
  const codigoFicha = "4_C2";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const criteriosSocializacion = [
    {
      categoria: 'Presentación de la necesidad, problema y/o potencialidad identificada.',
      items: [
        { key: 'c1', label: 'Claridad en la exposición de ideas.' },
        { key: 'c2', label: 'La necesidad, problemática y/o potencialidad es relevante y pertinente al ámbito educativo.' },
        { key: 'c3', label: 'Argumenta con solidez sus ideas con base en el diálogo sostenido con los actores y la reflexión crítica en ECTG.' }
      ]
    },
    {
      categoria: 'Sustentación de la propuesta educativa',
      items: [
        { key: 'c4', label: 'Argumenta de manera adecuada los principales componentes de la propuesta educativa.' },
        { key: 'c5', label: 'La propuesta educativa es coherente con la necesidad, problema y/o potencialidad identificada.' },
        { key: 'c6', label: 'Argumenta la propuesta con base al diálogo con los actores y autores y la reflexión crítica en ECTG.' }
      ]
    },
    {
      categoria: 'Controversia y argumentación',
      items: [
        { key: 'c7', label: 'Sustenta con propiedad y coherencia los diferentes acápites del trabajo presentado.' },
        { key: 'c8', label: 'Muestra seguridad y solvencia en la presentación y sustento de la propuesta educativa.' }
      ]
    }
  ];

  const [formData, setFormData] = useState({
    integrante_ectg: '',
    docente_tutor_id: '',
    modalidad_graduacion: MODALIDADES_GRADUACION_ESFM[0],
    titulo_diseno_metodologico: '',
    integrantes: [
      {
        nombre_apellido: '',
        ci: '',
        calificaciones: {},
        promedio_numeral: 0,
        promedio_literal: 'CERO CON 00/100',
        resultado: 'Aprobado'
      }
    ],
    lugar_ciudad: 'El Alto',
    departamento: DEPARTAMENTOS_BOLIVIA[0],
    dia: String(new Date().getDate()),
    mes: MESES_ANIO[new Date().getMonth()],
    ano: '2026',
    ...fichaData
  });

  useEffect(() => {
    if (estudianteSeleccionado) {
      const nombreCompleto = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      setFormData(prev => ({
        ...prev,
        integrante_ectg: nombreCompleto,
        integrantes: prev.integrantes.length > 0 && prev.integrantes[0].nombre_apellido
          ? prev.integrantes
          : [{
              nombre_apellido: nombreCompleto,
              ci: estudianteSeleccionado.ci || '',
              calificaciones: {},
              promedio_numeral: 0,
              promedio_literal: 'CERO CON 00/100',
              resultado: 'Aprobado'
            }],
        ...fichaData
      }));
    }
  }, [estudianteSeleccionado, fichaData]);

  const recalcularIntegrante = (integranteObj) => {
    const keys = ['c1','c2','c3','c4','c5','c6','c7','c8'];
    const notas = keys.map(k => parseFloat(integranteObj.calificaciones?.[k])).filter(n => !isNaN(n));
    const prom = notas.length > 0 ? parseFloat((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)) : 0;

    return {
      ...integranteObj,
      promedio_numeral: prom,
      promedio_literal: convertirNumeroALiteral(prom),
      resultado: prom >= 51 ? 'Aprobado' : 'Reprobado'
    };
  };

  const handleIntegranteNotaChange = (intIdx, critKey, val) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = '';
    else if (num < 1) num = 1;
    else if (num > 100) num = 100;

    const updatedIntegrantes = [...(formData.integrantes || [])];
    const itemTarget = updatedIntegrantes[intIdx];

    itemTarget.calificaciones = {
      ...(itemTarget.calificaciones || {}),
      [critKey]: num
    };

    updatedIntegrantes[intIdx] = recalcularIntegrante(itemTarget);

    const updated = { ...formData, integrantes: updatedIntegrantes };
    setFormData(updated);
    setFichaData(updated);
  };

  const handleIntegranteInfoChange = (intIdx, field, val) => {
    const updatedIntegrantes = [...(formData.integrantes || [])];
    updatedIntegrantes[intIdx][field] = val;

    const updated = { ...formData, integrantes: updatedIntegrantes };
    setFormData(updated);
    setFichaData(updated);
  };

  const addIntegranteCol = () => {
    if ((formData.integrantes || []).length >= 3) return;
    const newIntegrantes = [
      ...formData.integrantes,
      {
        nombre_apellido: '',
        ci: '',
        calificaciones: {},
        promedio_numeral: 0,
        promedio_literal: 'CERO CON 00/100',
        resultado: 'Aprobado'
      }
    ];
    const updated = { ...formData, integrantes: newIntegrantes };
    setFormData(updated);
    setFichaData(updated);
  };

  const removeIntegranteCol = (idx) => {
    if (formData.integrantes.length <= 1) return;
    const newIntegrantes = formData.integrantes.filter((_, i) => i !== idx);
    const updated = { ...formData, integrantes: newIntegrantes };
    setFormData(updated);
    setFichaData(updated);
  };

  const handleCampoChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    setFichaData(updated);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA C-2: SOCIALIZACIÓN DEL DISEÑO METODOLÓGICO DE IMPLEMENTACIÓN DEL TRABAJO DE GRADO"}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          
          <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200 text-slate-700 text-[11px] leading-relaxed">
            La valoración es individual para cada integrante del equipo comunitario de trabajo de grado.
          </div>

          {/* DATOS REFERENCIALES OFICIALES */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-[#801B28] uppercase text-[11px] block border-b pb-2">
              DATOS REFERENCIALES
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Integrante del ECTG:</label>
                <input
                  type="text"
                  value={formData.integrante_ectg}
                  onChange={(e) => handleCampoChange('integrante_ectg', e.target.value)}
                  className="w-full border p-2 rounded-xl bg-slate-50 font-extrabold text-slate-900"
                  placeholder="Nombre y Apellidos del estudiante"
                />
              </div>

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
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Modalidad de Graduación:</label>
                <select
                  value={formData.modalidad_graduacion}
                  onChange={(e) => handleCampoChange('modalidad_graduacion', e.target.value)}
                  className="w-full border p-2 rounded-xl bg-white font-bold text-slate-900 focus:border-[#801B28] outline-none"
                >
                  {MODALIDADES_GRADUACION_ESFM.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Título del Diseño Metodológico:</label>
                <input
                  type="text"
                  value={formData.titulo_diseno_metodologico}
                  onChange={(e) => handleCampoChange('titulo_diseno_metodologico', e.target.value)}
                  className="w-full border p-2 rounded-xl font-bold"
                  placeholder="Escriba el título completo..."
                />
              </div>
            </div>
          </div>

          {/* MATRIZ DE INTEGRANTES DE ECTG */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-extrabold text-slate-800 uppercase text-[11px]">
                MATRIZ DE EVALUACIÓN DE SOCIALIZACIÓN
              </span>
              {formData.integrantes.length < 3 && (
                <button
                  onClick={addIntegranteCol}
                  className="px-3 py-1 bg-[#801B28] text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-sm hover:bg-[#a32334] transition-all"
                >
                  <Plus size={12} /> Agregar Integrante
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-2 border border-slate-200 text-left w-2/5 font-extrabold text-slate-800 uppercase text-[10px]">
                      Criterios de evaluación en la socialización
                    </th>
                    {formData.integrantes?.map((integ, idx) => (
                      <th key={idx} className="p-2 border border-slate-200 text-center min-w-[180px] bg-amber-50/50">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="font-black text-[#801B28] text-[10px] uppercase">Integrantes del ECTG</span>
                            {formData.integrantes.length > 1 && (
                              <button onClick={() => removeIntegranteCol(idx)} className="text-rose-600 hover:text-rose-800 p-0.5">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Nombres y Apellidos"
                              value={integ.nombre_apellido}
                              onChange={(e) => handleIntegranteInfoChange(idx, 'nombre_apellido', e.target.value)}
                              className="w-full border p-1 rounded-lg text-[10px] font-bold bg-white text-slate-900 focus:border-[#801B28] outline-none"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="C.I."
                              value={integ.ci}
                              onChange={(e) => handleIntegranteInfoChange(idx, 'ci', e.target.value)}
                              className="w-full border p-1 rounded-lg text-[10px] font-mono font-bold bg-white text-slate-900 focus:border-[#801B28] outline-none"
                            />
                          </div>
                          <span className="text-[9px] font-normal text-slate-500 block">(1 a 100 Puntos)</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {criteriosSocializacion.map((cat) => (
                    <React.Fragment key={cat.categoria}>
                      <tr className="bg-slate-50">
                        <td colSpan={formData.integrantes.length + 1} className="p-2 border font-extrabold text-slate-900 uppercase text-[10px]">
                          {cat.categoria}
                        </td>
                      </tr>
                      {cat.items.map((item) => (
                        <tr key={item.key} className="hover:bg-slate-50/50">
                          <td className="p-2 border font-medium text-slate-700 text-[11px]">
                            {item.label}
                          </td>
                          {formData.integrantes?.map((integ, idx) => (
                            <td key={idx} className="p-1.5 border text-center">
                              <input
                                type="number"
                                min="1"
                                max="100"
                                placeholder="1-100"
                                value={integ.calificaciones?.[item.key] || ''}
                                onChange={(e) => handleIntegranteNotaChange(idx, item.key, e.target.value)}
                                className="w-full border p-1.5 rounded-lg text-center font-mono font-bold bg-white focus:border-[#801B28] outline-none"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}

                  {/* FILAS DE PROMEDIO NUMERAL */}
                  <tr className="bg-rose-50/50 font-black border-t-2 border-slate-300">
                    <td className="p-2 border text-slate-900 uppercase text-[10px]">Promedio Numeral</td>
                    {formData.integrantes?.map((integ, idx) => (
                      <td key={idx} className="p-2 border text-center font-mono text-sm text-[#801B28]">
                        {integ.promedio_numeral || '0.00'} / 100 PTS
                      </td>
                    ))}
                  </tr>

                  {/* FILAS DE PROMEDIO LITERAL */}
                  <tr className="bg-rose-50/30 font-bold">
                    <td className="p-2 border text-slate-900 uppercase text-[10px]">Literal</td>
                    {formData.integrantes?.map((integ, idx) => (
                      <td key={idx} className="p-2 border text-center font-extrabold text-[10px] text-slate-900 uppercase">
                        {integ.promedio_literal}
                      </td>
                    ))}
                  </tr>

                  {/* FILAS DE RESULTADO */}
                  <tr className="bg-slate-50 font-extrabold">
                    <td className="p-2 border text-slate-900 uppercase text-[10px]">Resultado (Aprobado/reprobado)</td>
                    {formData.integrantes?.map((integ, idx) => (
                      <td key={idx} className={`p-2 border text-center text-xs uppercase font-black ${integ.resultado === 'Aprobado' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {integ.resultado}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
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