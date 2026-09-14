import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, MODALIDADES_GRADUACION_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const FichaC1_4toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "4_C1";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const criteriosC1 = [
    { key: 'c1', label: 'Se evidencia una elaboración participativa y corresponsable entre todos los integrantes del ECTG, recuperando los aspectos más relevantes y pertinentes del proceso de la IEPC-PEC.', max: 10 },
    { key: 'c2', label: 'Lectura adecuada, analítica, reflexiva, profunda y clara de la realidad del contexto y de la UE/CEA/CEE.', max: 10 },
    { key: 'c3', label: 'Planteamiento coherente de la problematización y de las preguntas problematizadoras para el diálogo con actores.', max: 10 },
    { key: 'c4', label: 'Las herramientas e instrumentos de investigación son adecuados para el diálogo con los actores y para el recojo de información relevante sobre el problema, necesidad o potencialidad identificada.', max: 10 },
    { key: 'c5', label: 'La organización, análisis e interpretación de la información recogida es coherente y sistemática.', max: 10 },
    { key: 'c6', label: 'Denota una pertinente selección y lectura de textos que permiten profundizar la comprensión del problema, necesidad o potencialidad identificada.', max: 10 },
    { key: 'c7', label: 'Plantea una propuesta clara, integral, transformadora y coherente en procura de responder al nudo problemático identificado.', max: 10 },
    { key: 'c8', label: 'El diagnóstico socioparticipativo fue socializado y enriquecido con los aportes de la comunidad educativa de la UE/CEA/CEE según el acta de socialización del documento en la comunidad educativa.', max: 10 },
    { key: 'c9', label: 'Propone un proceso de implementación de trabajo de grado coherente con la modalidad de graduación elegida.', max: 10 },
    { key: 'c10', label: 'Utiliza adecuadamente las normas APA 7ma edición en citas y referencias bibliográficas.', max: 10 }
  ];

  const [formData, setFormData] = useState({
    integrante_ectg: '',
    modalidad_graduacion: MODALIDADES_GRADUACION_ESFM[0],
    titulo_diseno_metodologico: '',
    puntaje_final: 0,
    puntaje_literal: 'CERO CON 00/100',
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
        ...fichaData
      }));
    }
  }, [estudianteSeleccionado, fichaData]);

  const handlePuntajeChange = (key, maxVal, valStr) => {
    let num = parseFloat(valStr);
    if (isNaN(num)) num = '';
    else if (num < 0) num = 0;
    else if (num > maxVal) num = maxVal;

    const newForm = { ...formData, [key]: num };
    const notas = criteriosC1.map(c => parseFloat(newForm[c.key])).filter(n => !isNaN(n));
    const total = notas.length > 0 ? parseFloat(notas.reduce((a, b) => a + b, 0).toFixed(2)) : 0;

    newForm.puntaje_final = total;
    newForm.promedio_final = total;
    newForm.puntaje_literal = convertirNumeroALiteral(total);

    setFormData(newForm);
    setFichaData(newForm);
  };

  const handleCampoChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    setFichaData(updated);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA C-1: EVALUACIÓN DEL DOCUMENTO DE DISEÑO METODOLÓGICO POR LA/EL DOCENTE TUTOR/A ACOMPAÑANTE"}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          
          <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 text-amber-900 font-bold text-[11px]">
            La aprobación del documento es habilitante para la socialización ante la Comisión Comunitaria de Evaluación.
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-[#801B28] uppercase text-[11px] block border-b pb-2">
              DATOS REFERENCIALES
            </span>
            <div className="space-y-2">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Integrante del ECTG:</label>
                <input type="text" readOnly value={formData.integrante_ectg} className="w-full border p-2 rounded-xl bg-slate-50 font-bold text-slate-900" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Modalidad de Graduación:</label>
                <select value={formData.modalidad_graduacion} onChange={(e) => handleCampoChange('modalidad_graduacion', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold">
                  {MODALIDADES_GRADUACION_ESFM.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Título del Diseño Metodológico:</label>
                <input type="text" value={formData.titulo_diseno_metodologico} onChange={(e) => handleCampoChange('titulo_diseno_metodologico', e.target.value)} className="w-full border p-2 rounded-xl font-bold" placeholder="Escriba el título completo..." />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
              CRITERIOS DE EVALUACIÓN (MÁXIMO 10 PTS POR CRITERIO)
            </span>

            <div className="space-y-2">
              {criteriosC1.map((crit, idx) => (
                <div key={crit.key} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="sm:col-span-4 font-medium text-slate-800 text-[11px]">
                    <strong className="text-[#801B28] mr-1">{idx + 1}.</strong> {crit.label}
                  </span>
                  <div className="text-center font-bold text-slate-500 text-[10px]">Puntaje Máx: 10</div>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    placeholder="0-10"
                    value={formData[crit.key] || ''}
                    onChange={(e) => handlePuntajeChange(crit.key, crit.max, e.target.value)}
                    className="w-full border p-2 rounded-lg bg-white font-mono font-bold text-center text-slate-900 focus:border-[#801B28] outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">Puntaje Final Numeral:</label>
                <div className="font-mono font-black text-2xl text-[#801B28]">{formData.puntaje_final || '0.00'} / 100 PTS</div>
              </div>
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">Literal:</label>
                <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">{formData.puntaje_literal}</div>
              </div>
            </div>
          </div>

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