import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin, Plus, Trash2 } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, MODALIDADES_GRADUACION_ESFM } from '../../../../utils/camposFichas';

export const ActaFinalEvolucion_4toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado }) => {
  const codigoFicha = "4_ACTA_FINAL";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const [formData, setFormData] = useState({
    esfm_ua: 'ESFM Simón Bolívar / UA El Alto',
    lugar_ciudad: 'El Alto',
    hora_acta: '08:00',
    dia_acta: String(new Date().getDate()),
    mes_acta: MESES_ANIO[new Date().getMonth()],
    ano_acta: '2026',
    titulo_diseno: '',
    modalidad_graduacion: MODALIDADES_GRADUACION_ESFM[0],
    integrantes: [
      { ci: '', nombres: '', nota_diseno: '', nota_socializacion: '', promedio: 0, resultado: 'Aprobado' }
    ],
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
        integrantes: prev.integrantes.length > 0 && prev.integrantes[0].nombres
          ? prev.integrantes
          : [
              {
                ci: estudianteSeleccionado.ci || '',
                nombres: `${estudianteSeleccionado.nombre || ''} ${estudianteSeleccionado.apellido || ''}`.trim(),
                nota_diseno: '',
                nota_socializacion: '',
                promedio: 0,
                resultado: 'Aprobado'
              }
            ],
        ...fichaData
      }));
    }
  }, [estudianteSeleccionado, fichaData]);

  const handleIntegranteChange = (index, field, val) => {
    const updated = [...(formData.integrantes || [])];
    updated[index][field] = val;

    const nd = parseFloat(updated[index].nota_diseno) || 0;
    const ns = parseFloat(updated[index].nota_socializacion) || 0;
    const prom = parseFloat(((nd + ns) / 2).toFixed(2));

    updated[index].promedio = prom;
    updated[index].resultado = prom >= 51 ? 'Aprobado' : 'Reprobado';

    const newForm = { ...formData, integrantes: updated };
    setFormData(newForm);
    setFichaData(newForm);
  };

  const addIntegrante = () => {
    setFormData(prev => ({
      ...prev,
      integrantes: [
        ...prev.integrantes,
        { ci: '', nombres: '', nota_diseno: '', nota_socializacion: '', promedio: 0, resultado: 'Aprobado' }
      ]
    }));
  };

  const removeIntegrante = (index) => {
    if (formData.integrantes.length <= 1) return;
    const updated = formData.integrantes.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, integrantes: updated }));
  };

  const handleCampoChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    setFichaData(updated);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "ACTA FINAL DEL PROCESO DE EVALUACIÓN DEL DISEÑO METODOLÓGICO DE IMPLEMENTACIÓN DEL TRABAJO DE GRADO"}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          
          {/* DATOS DE LA SESIÓN DE EVALUACIÓN */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-[#801B28] uppercase text-[11px] block border-b pb-2">
              DATOS DE LA SESIÓN DE EVALUACIÓN
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 text-[10px] mb-1">ESFM/UA:</label>
                <input type="text" value={formData.esfm_ua} onChange={(e) => handleCampoChange('esfm_ua', e.target.value)} className="w-full border p-2 rounded-xl font-bold" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Ciudad:</label>
                <input type="text" value={formData.lugar_ciudad} onChange={(e) => handleCampoChange('lugar_ciudad', e.target.value)} className="w-full border p-2 rounded-xl font-bold" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Hora de inicio:</label>
                <input type="text" value={formData.hora_acta} onChange={(e) => handleCampoChange('hora_acta', e.target.value)} className="w-full border p-2 rounded-xl font-bold font-mono" />
              </div>

              {/* DÍA, MES Y AÑO DE LA SESIÓN DE EVALUACIÓN */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Día de la sesión:</label>
                <input type="text" value={formData.dia_acta} onChange={(e) => handleCampoChange('dia_acta', e.target.value)} className="w-full border p-2 rounded-xl font-mono font-bold" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Mes de la sesión:</label>
                <select value={formData.mes_acta} onChange={(e) => handleCampoChange('mes_acta', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold uppercase">
                  {MESES_ANIO.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Año de la sesión:</label>
                <input type="text" value={formData.ano_acta} onChange={(e) => handleCampoChange('ano_acta', e.target.value)} className="w-full border p-2 rounded-xl font-mono font-bold" />
              </div>

              <div className="sm:col-span-6">
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Título del Diseño Metodológico:</label>
                <input type="text" value={formData.titulo_diseno} onChange={(e) => handleCampoChange('titulo_diseno', e.target.value)} className="w-full border p-2 rounded-xl font-bold" placeholder="Escriba el título completo..." />
              </div>
              <div className="sm:col-span-6">
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Modalidad de Graduación:</label>
                <select value={formData.modalidad_graduacion} onChange={(e) => handleCampoChange('modalidad_graduacion', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold">
                  {MODALIDADES_GRADUACION_ESFM.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* TABLA DE EVALUACIÓN OFICIAL DE INTEGRANTES */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-extrabold text-slate-800 uppercase text-[11px]">
                PUNTAJE FINAL DE EVALUACIÓN
              </span>
              <button
                onClick={addIntegrante}
                className="px-3 py-1 bg-[#801B28] text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-sm hover:bg-[#a32334] transition-all"
              >
                <Plus size={12} /> Agregar Estudiante
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-200 text-center text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-extrabold">
                    <th className="p-2 border border-slate-200 w-10">No.</th>
                    <th className="p-2 border border-slate-200 w-28">C.I.</th>
                    <th className="p-2 border border-slate-200 text-left">NOMBRES Y APELLIDOS</th>
                    <th className="p-2 border border-slate-200 w-28 bg-amber-50">Documento Diseño</th>
                    <th className="p-2 border border-slate-200 w-28 bg-amber-50">Socialización Comunitaria</th>
                    <th className="p-2 border border-slate-200 w-24 bg-rose-50">Promedio</th>
                    <th className="p-2 border border-slate-200 w-28">Resultado (Aprobado/Reprobado)</th>
                    <th className="p-2 border border-slate-200 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {formData.integrantes?.map((integ, index) => (
                    <tr key={index} className="hover:bg-slate-50/80">
                      <td className="p-2 border font-bold text-slate-600">{index + 1}</td>
                      <td className="p-1.5 border">
                        <input
                          type="text"
                          placeholder="C.I."
                          value={integ.ci}
                          onChange={(e) => handleIntegranteChange(index, 'ci', e.target.value)}
                          className="w-full border p-1.5 rounded-lg text-center font-mono font-bold bg-white focus:border-[#801B28] outline-none"
                        />
                      </td>
                      <td className="p-1.5 border text-left">
                        <input
                          type="text"
                          placeholder="Nombres y Apellidos"
                          value={integ.nombres}
                          onChange={(e) => handleIntegranteChange(index, 'nombres', e.target.value)}
                          className="w-full border p-1.5 rounded-lg font-bold bg-white focus:border-[#801B28] outline-none"
                        />
                      </td>
                      <td className="p-1.5 border bg-amber-50/30">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="1-100"
                          value={integ.nota_diseno}
                          onChange={(e) => handleIntegranteChange(index, 'nota_diseno', e.target.value)}
                          className="w-full border p-1.5 rounded-lg text-center font-mono font-bold bg-white focus:border-[#801B28] outline-none"
                        />
                      </td>
                      <td className="p-1.5 border bg-amber-50/30">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="1-100"
                          value={integ.nota_socializacion}
                          onChange={(e) => handleIntegranteChange(index, 'nota_socializacion', e.target.value)}
                          className="w-full border p-1.5 rounded-lg text-center font-mono font-bold bg-white focus:border-[#801B28] outline-none"
                        />
                      </td>
                      <td className="p-2 border font-mono font-black text-sm text-[#801B28] bg-rose-50/30">
                        {integ.promedio || '0.00'}
                      </td>
                      <td className={`p-2 border font-black uppercase text-xs ${integ.resultado === 'Aprobado' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {integ.resultado}
                      </td>
                      <td className="p-1 border text-center">
                        {formData.integrantes.length > 1 && (
                          <button
                            onClick={() => removeIntegrante(index)}
                            className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
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