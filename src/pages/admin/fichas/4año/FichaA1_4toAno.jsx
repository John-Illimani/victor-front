import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../../../utils/camposFichas';

export const FichaA1_4toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "4_A1";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const [formData, setFormData] = useState({
    apellidos_nombres: '',
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    especialidad: ESPECIALIDADES_ESFM[0],
    ano_formacion: '4to Año',
    tecnicas_instrumentos_txt: '',
    c1_diseno_validacion: '',
    c2_aplicacion_tecnicas: '',
    c3_orden_analisis: '',
    promedio_numeral: 0,
    promedio_literal: 'CERO CON 00/100',
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
        especialidad: estudianteSeleccionado.especialidad || prev.especialidad,
        ...fichaData
      }));
    }
  }, [estudianteSeleccionado, fichaData]);

  const handleNotaChange = (field, value) => {
    let val = parseFloat(value);
    if (isNaN(val)) val = '';
    else if (val < 1) val = 1;
    else if (val > 100) val = 100;

    const newForm = { ...formData, [field]: val };

    const c1 = parseFloat(newForm.c1_diseno_validacion);
    const c2 = parseFloat(newForm.c2_aplicacion_tecnicas);
    const c3 = parseFloat(newForm.c3_orden_analisis);

    const notasValidas = [c1, c2, c3].filter(n => !isNaN(n));
    const promFinal = notasValidas.length > 0 ? parseFloat((notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length).toFixed(2)) : 0;

    newForm.promedio_numeral = promFinal;
    newForm.promedio_final = promFinal;
    newForm.promedio_literal = convertirNumeroALiteral(promFinal);

    setFormData(newForm);
    setFichaData(newForm);
  };

  const handleCampoChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    setFichaData(updated);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "FICHA A-1: TÉCNICAS E INSTRUMENTOS DE INVESTIGACIÓN"}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          
          {/* ENCABEZADO Y RESPONSABLE */}
          <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 text-amber-950 text-[11px] leading-relaxed">
            El Equipo Comunitario de Trabajo de Grado diseña y aplica técnicas e instrumentos de investigación. Posteriormente procesa e interpreta la información.
            <strong className="block mt-1 text-[#801B28]">Responsable de evaluar: Docente de investigación de la ESFM/UA.</strong>
          </div>

          {/* DATOS REFERENCIALES */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-[#801B28] uppercase text-[11px] flex items-center gap-1.5 border-b pb-2">
              <GraduationCap size={15} /> DATOS REFERENCIALES
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Docente en formación:</label>
                <input type="text" readOnly value={formData.apellidos_nombres} className="w-full border border-slate-200 p-2 rounded-xl bg-slate-50 font-extrabold text-slate-900" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">ESFM/UA:</label>
                <input type="text" value={formData.esfm_ua} onChange={(e) => handleCampoChange('esfm_ua', e.target.value)} className="w-full border border-slate-200 p-2 rounded-xl font-bold" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Año de formación:</label>
                <input type="text" readOnly value={formData.ano_formacion} className="w-full border border-slate-200 p-2 rounded-xl bg-slate-50 font-bold" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                <select value={formData.especialidad} onChange={(e) => handleCampoChange('especialidad', e.target.value)} className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold">
                  {ESPECIALIDADES_ESFM.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* TABLA OFICIAL DE EVALUACIÓN */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
              VALORACIÓN DE TÉCNICAS E INSTRUMENTOS
            </span>

            {/* DETALLE DE INSTRUMENTOS UTILIZADOS */}
            <div>
              <label className="block font-bold text-slate-700 text-[10px] mb-1">Técnicas e Instrumentos de Investigación aplicados:</label>
              <textarea
                rows="2"
                placeholder="Escriba las técnicas e instrumentos aplicados..."
                value={formData.tecnicas_instrumentos_txt}
                onChange={(e) => handleCampoChange('tecnicas_instrumentos_txt', e.target.value)}
                className="w-full border p-2.5 rounded-xl font-medium text-slate-800 text-xs focus:border-[#801B28] outline-none"
              />
            </div>

            {/* CRITERIOS DE CALIFICACIÓN (1 A 100 PUNTOS) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-[10px] font-bold text-slate-800 h-10 leading-snug">
                  Diseño y validación de técnicas e instrumentos (Se evalúa antes de la PEC)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="1 a 100"
                  value={formData.c1_diseno_validacion || ''}
                  onChange={(e) => handleNotaChange('c1_diseno_validacion', e.target.value)}
                  className="w-full border p-2 rounded-lg bg-white font-mono font-bold text-center text-slate-900 focus:border-[#801B28] outline-none"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-[10px] font-bold text-slate-800 h-10 leading-snug">
                  Aplicación de técnicas e instrumentos de investigación (Se evalúa durante la PEC)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="1 a 100"
                  value={formData.c2_aplicacion_tecnicas || ''}
                  onChange={(e) => handleNotaChange('c2_aplicacion_tecnicas', e.target.value)}
                  className="w-full border p-2 rounded-lg bg-white font-mono font-bold text-center text-slate-900 focus:border-[#801B28] outline-none"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-[10px] font-bold text-slate-800 h-10 leading-snug">
                  Orden, análisis, reflexión e interpretación de la información (Durante la PEC)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="1 a 100"
                  value={formData.c3_orden_analisis || ''}
                  onChange={(e) => handleNotaChange('c3_orden_analisis', e.target.value)}
                  className="w-full border p-2 rounded-lg bg-white font-mono font-bold text-center text-slate-900 focus:border-[#801B28] outline-none"
                />
              </div>
            </div>

            {/* RESUMEN FINAL */}
            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">Promedio Final (Número entero):</label>
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
                className="w-full border p-2.5 rounded-xl font-medium text-slate-800 text-xs focus:border-[#801B28] outline-none"
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