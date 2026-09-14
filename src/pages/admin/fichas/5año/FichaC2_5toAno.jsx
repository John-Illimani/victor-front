import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin, Plus, Trash2 } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, MODALIDADES_GRADUACION_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const FichaC2_5toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado, listaDocentes = [] }) => {
  const codigoFicha = "5_C2";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const criteriosSocializacion = [
    {
      categoria: 'Presentación del proceso de implementación de la propuesta educativa.',
      items: [
        { key: 'c1', label: 'Marco contextual y nudo problemático. Propuesta educativa elaborada por el ECTG, respondiendo al nudo problemático. Proceso de implementación de la propuesta educativa. Resultados alcanzados.' }
      ]
    },
    {
      categoria: 'Sustentación del Trabajo de Grado.',
      items: [
        { key: 'c2', label: '• Sustentación de la propuesta educativa y los resultados alcanzados.\n• Proceso de diálogo y reflexión realizado en el marco de la Sistematización.\n• Conocimientos construidos a partir de la sistematización realizada. Aspectos que mejoraron en la propuesta educativa inicial.' }
      ]
    },
    {
      categoria: 'Controversia y argumentación',
      items: [
        { key: 'c3', label: '• Responde con claridad y coherencia a las preguntas planteadas por la comisión de evaluación.' }
      ]
    }
  ];

  const [formData, setFormData] = useState({
    docente_tutor_id: '',
    estudiante_nombre: '',
    departamento_pec: DEPARTAMENTOS_BOLIVIA[0],
    distrito_educativo: '',
    ue_cea_cee: '',
    subsistema: '',
    curso_area: '',
    fecha_pec_inicio: '',
    fecha_pec_fin: '',
    modalidad_graduacion: MODALIDADES_GRADUACION_ESFM[0],
    titulo_trabajo_grado: '',
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
      const nombreEst = `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim();
      setFormData(prev => ({
        ...prev,
        estudiante_nombre: nombreEst,
        integrantes: prev.integrantes.length > 0 && prev.integrantes[0].nombre_apellido
          ? prev.integrantes
          : [{
              nombre_apellido: nombreEst,
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
    const keys = ['c1','c2','c3'];
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
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA C-2: ACTA DE SOCIALIZACIÓN DEL TRABAJO DE GRADO POR LA COMISIÓN COMUNITARIA DE EVALUACIÓN"}>
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
            </div>

            {/* DATOS DE LA IEPC-PEC */}
            <div className="pt-2 border-t space-y-2">
              <span className="font-extrabold text-slate-800 uppercase text-[10px] block">DATOS DE LA IEPC-PEC</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-600">Departamento:</label>
                  <select value={formData.departamento_pec} onChange={(e) => handleCampoChange('departamento_pec', e.target.value)} className="w-full border p-1.5 rounded-lg bg-white font-bold">
                    {DEPARTAMENTOS_BOLIVIA.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-600">Distrito Educativo:</label>
                  <input type="text" value={formData.distrito_educativo} onChange={(e) => handleCampoChange('distrito_educativo', e.target.value)} className="w-full border p-1.5 rounded-lg bg-white" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-600">UE/CEA/CEE:</label>
                  <input type="text" value={formData.ue_cea_cee} onChange={(e) => handleCampoChange('ue_cea_cee', e.target.value)} className="w-full border p-1.5 rounded-lg bg-white font-bold" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-600">Subsistema:</label>
                  <input type="text" value={formData.subsistema} onChange={(e) => handleCampoChange('subsistema', e.target.value)} className="w-full border p-1.5 rounded-lg bg-white" placeholder="Ej. Regular / Alternativa" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-600">Curso / Área:</label>
                  <input type="text" value={formData.curso_area} onChange={(e) => handleCampoChange('curso_area', e.target.value)} className="w-full border p-1.5 rounded-lg bg-white" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-600">Desarrollo de la PEC (Fechas):</label>
                  <div className="flex gap-1 items-center">
                    <input type="date" value={formData.fecha_pec_inicio} onChange={(e) => handleCampoChange('fecha_pec_inicio', e.target.value)} className="w-full border p-1 rounded-lg text-[10px]" />
                    <span>al</span>
                    <input type="date" value={formData.fecha_pec_fin} onChange={(e) => handleCampoChange('fecha_pec_fin', e.target.value)} className="w-full border p-1 rounded-lg text-[10px]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Título del Trabajo de Grado:</label>
                <input
                  type="text"
                  value={formData.titulo_trabajo_grado}
                  onChange={(e) => handleCampoChange('titulo_trabajo_grado', e.target.value)}
                  className="w-full border p-2 rounded-xl font-bold"
                  placeholder="Escriba el título del trabajo de grado..."
                />
              </div>
            </div>
          </div>

          {/* MATRIZ DE INTEGRANTES DE ECTG */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-extrabold text-slate-800 uppercase text-[11px]">
                MATRIZ DE EVALUACIÓN DE SOCIALIZACIÓN DE TRABAJO DE GRADO
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
                      CRITERIOS DE EVALUACIÓN EN LA SOCIALIZACIÓN
                    </th>
                    {formData.integrantes?.map((integ, idx) => (
                      <th key={idx} className="p-2 border border-slate-200 text-center min-w-[180px] bg-amber-50/50">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="font-black text-[#801B28] text-[10px] uppercase">Integrante ECTG</span>
                            {formData.integrantes.length > 1 && (
                              <button onClick={() => removeIntegranteCol(idx)} className="text-rose-600 hover:text-rose-800 p-0.5">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Nombre y Apellidos"
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
                          <span className="text-[9px] font-normal text-slate-500 block">Valoración de 1 a 100</span>
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
                          <td className="p-2 border font-medium text-slate-700 text-[11px] whitespace-pre-line">
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

                  {/* FILAS DE PROMEDIO TOTAL */}
                  <tr className="bg-rose-50/50 font-black border-t-2 border-slate-300">
                    <td className="p-2 border text-slate-900 uppercase text-[10px]">TOTAL</td>
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
                </tbody>
              </table>
            </div>
          </div>

          {/* LUGAR Y FECHA DE EMISIÓN */}
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