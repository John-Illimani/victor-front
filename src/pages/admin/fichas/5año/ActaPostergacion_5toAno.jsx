import React, { useState, useEffect } from 'react';
import { ModalBase } from '../1año/ModalBase';
import { GraduationCap, MapPin, Plus, Trash2 } from 'lucide-react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, MODALIDADES_GRADUACION_ESFM } from '../../../../utils/camposFichas';

export const ActaPostergacion_5toAno = ({ isOpen, onClose, fichaData, setFichaData, estudianteSeleccionado, listaDocentes = [] }) => {
  const codigoFicha = "5_ACTA_POSTERGACION";
  const config = CONFIGURACION_FICHAS[codigoFicha];

  const MODALIDADES_INGRESO_LISTA = ["ADMISION GENERAL", "MODALIDAD B", "DEPORTISTAS DESTACADOS", "DISCAPACIDAD"];

  const [formData, setFormData] = useState({
    docente_tutor_id: '',
    modalidad_graduacion: MODALIDADES_GRADUACION_ESFM[0],
    titulo_trabajo_grado: '',
    estudiantes_ectg: [
      { nombres: '', especialidad: '', modalidad_ingreso: 'ADMISION GENERAL' }
    ],
    lugar_ciudad: 'El Alto',
    ambientes: 'Instalaciones de la ESFM/UA',
    dia_post: String(new Date().getDate()),
    mes_post: MESES_ANIO[new Date().getMonth()],
    ano_post: '2026',
    titulo_trabajo_titulado: '',
    motivos_postergacion: '',
    estudiantes_posterga: '',
    nueva_fecha_dia: '',
    nueva_fecha_mes: MESES_ANIO[new Date().getMonth()],
    nueva_fecha_ano: '2026',
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
        estudiantes_posterga: prev.estudiantes_posterga || nombreEst,
        estudiantes_ectg: prev.estudiantes_ectg.length > 0 && prev.estudiantes_ectg[0].nombres
          ? prev.estudiantes_ectg
          : [
              {
                nombres: nombreEst,
                especialidad: estudianteSeleccionado.especialidad || '',
                modalidad_ingreso: estudianteSeleccionado.modalidad_ingreso || 'ADMISION GENERAL'
              }
            ],
        ...fichaData
      }));
    }
  }, [estudianteSeleccionado, fichaData]);

  const handleEstudianteChange = (index, field, val) => {
    const updated = [...(formData.estudiantes_ectg || [])];
    updated[index][field] = val;
    const newForm = { ...formData, estudiantes_ectg: updated };
    setFormData(newForm);
    setFichaData(newForm);
  };

  const addEstudiante = () => {
    if ((formData.estudiantes_ectg || []).length >= 3) return;
    setFormData(prev => ({
      ...prev,
      estudiantes_ectg: [
        ...prev.estudiantes_ectg,
        { nombres: '', especialidad: '', modalidad_ingreso: 'ADMISION GENERAL' }
      ]
    }));
  };

  const removeEstudiante = (index) => {
    if (formData.estudiantes_ectg.length <= 1) return;
    const updated = formData.estudiantes_ectg.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, estudiantes_ectg: updated }));
  };

  const handleCampoChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    setFichaData(updated);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} titulo={config?.titulo || "ACTA DE POSTERGACIÓN DE LA SOCIALIZACIÓN DEL TRABAJO DE GRADO"}>
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          
          {/* DATOS REFERENCIALES GENERALES */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-[#801B28] uppercase text-[11px] block border-b pb-2">
              DATOS REFERENCIALES GENERALES
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
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Modalidad de Graduación:</label>
                <select
                  value={formData.modalidad_graduacion}
                  onChange={(e) => handleCampoChange('modalidad_graduacion', e.target.value)}
                  className="w-full border p-2 rounded-xl bg-white font-bold text-slate-900 focus:border-[#801B28] outline-none"
                >
                  {MODALIDADES_GRADUACION_ESFM.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Título del Trabajo de Grado:</label>
                <input
                  type="text"
                  value={formData.titulo_trabajo_grado}
                  onChange={(e) => handleCampoChange('titulo_trabajo_grado', e.target.value)}
                  className="w-full border p-2 rounded-xl font-bold"
                  placeholder="Escriba el título completo del trabajo de grado..."
                />
              </div>
            </div>
          </div>

          {/* TABLA DE MIEMBROS DEL ECTG */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-extrabold text-slate-800 uppercase text-[11px]">
                MIEMBROS DEL EQUIPO COMUNITARIO DE TRABAJO DE GRADO (ECTG)
              </span>
              {formData.estudiantes_ectg.length < 3 && (
                <button
                  onClick={addEstudiante}
                  className="px-3 py-1 bg-[#801B28] text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-sm hover:bg-[#a32334] transition-all"
                >
                  <Plus size={12} /> Agregar Estudiante
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-200 text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-extrabold">
                    <th className="p-2 border border-slate-200 w-10 text-center">Nº</th>
                    <th className="p-2 border border-slate-200">NOMBRES Y APELLIDOS</th>
                    <th className="p-2 border border-slate-200 w-1/3">ESPECIALIDAD</th>
                    <th className="p-2 border border-slate-200 w-1/4">MODALIDAD DE INGRESO</th>
                    <th className="p-2 border border-slate-200 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {formData.estudiantes_ectg?.map((est, index) => (
                    <tr key={index} className="hover:bg-slate-50/80">
                      <td className="p-2 border font-bold text-center text-slate-600">{index + 1}</td>
                      <td className="p-1.5 border">
                        <input
                          type="text"
                          placeholder="Nombres y Apellidos"
                          value={est.nombres}
                          onChange={(e) => handleEstudianteChange(index, 'nombres', e.target.value)}
                          className="w-full border p-1.5 rounded-lg font-bold bg-white focus:border-[#801B28] outline-none"
                        />
                      </td>
                      <td className="p-1.5 border">
                        <input
                          type="text"
                          placeholder="Especialidad"
                          value={est.especialidad}
                          onChange={(e) => handleEstudianteChange(index, 'especialidad', e.target.value)}
                          className="w-full border p-1.5 rounded-lg bg-white focus:border-[#801B28] outline-none"
                        />
                      </td>
                      <td className="p-1.5 border">
                        <select
                          value={est.modalidad_ingreso}
                          onChange={(e) => handleEstudianteChange(index, 'modalidad_ingreso', e.target.value)}
                          className="w-full border p-1.5 rounded-lg bg-white font-bold focus:border-[#801B28] outline-none"
                        >
                          {MODALIDADES_INGRESO_LISTA.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </td>
                      <td className="p-1 border text-center">
                        {formData.estudiantes_ectg.length > 1 && (
                          <button
                            onClick={() => removeEstudiante(index)}
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

          {/* REDACCIÓN DEL ACTA */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-extrabold text-[#801B28] uppercase text-[11px] block border-b pb-2">
              DATOS DE PRESENTACIÓN Y DESARROLLO
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 text-[10px] mb-1">En la ciudad de:</label>
                <input type="text" value={formData.lugar_ciudad} onChange={(e) => handleCampoChange('lugar_ciudad', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 text-[10px] mb-1">En ambientes de la ESFM/UA:</label>
                <input type="text" value={formData.ambientes} onChange={(e) => handleCampoChange('ambientes', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold" />
              </div>
              <div className="sm:col-span-1">
                <label className="block font-bold text-slate-700 text-[10px] mb-1">A los (Días):</label>
                <input type="text" value={formData.dia_post} onChange={(e) => handleCampoChange('dia_post', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold font-mono" />
              </div>
              <div className="sm:col-span-1">
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Del mes de:</label>
                <select value={formData.mes_post} onChange={(e) => handleCampoChange('mes_post', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold uppercase">
                  {MESES_ANIO.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Trabajo Final de Grado, titulado:</label>
                <input
                  type="text"
                  value={formData.titulo_trabajo_titulado || formData.titulo_trabajo_grado}
                  onChange={(e) => handleCampoChange('titulo_trabajo_titulado', e.target.value)}
                  className="w-full border p-2.5 rounded-xl font-bold text-slate-900 bg-white border-slate-300 focus:border-[#801B28] outline-none"
                  placeholder="Escriba el título completo del trabajo final de grado..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Motivos descritos por los que se procedió a postergar:</label>
                <textarea
                  rows="3"
                  value={formData.motivos_postergacion}
                  onChange={(e) => handleCampoChange('motivos_postergacion', e.target.value)}
                  className="w-full border p-2.5 rounded-xl font-medium text-slate-800 text-xs focus:border-[#801B28] outline-none"
                  placeholder="Describa las razones expresadas por la comisión..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Estudiante(s) a quien(es) se les resuelve postergar:</label>
                <input
                  type="text"
                  value={formData.estudiantes_posterga}
                  onChange={(e) => handleCampoChange('estudiantes_posterga', e.target.value)}
                  className="w-full border p-2 rounded-xl font-bold bg-white"
                  placeholder="Nombres y Apellidos de los estudiantes postergados..."
                />
              </div>

              {/* REPROGRAMACIÓN */}
              <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200 space-y-2">
                <span className="font-extrabold text-amber-900 uppercase text-[10px] block">
                  NUEVA FECHA PROGRAMADA DE SOCIALIZACIÓN DEL TRABAJO FINAL DE GRADO
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Para el día:</label>
                    <input type="text" value={formData.nueva_fecha_dia} onChange={(e) => handleCampoChange('nueva_fecha_dia', e.target.value)} className="w-full border p-2 rounded-xl font-mono font-bold bg-white" placeholder="Ej. 25" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Del mes de:</label>
                    <select value={formData.nueva_fecha_mes} onChange={(e) => handleCampoChange('nueva_fecha_mes', e.target.value)} className="w-full border p-2 rounded-xl bg-white font-bold uppercase">
                      {MESES_ANIO.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 text-[10px] mb-1">Del año en curso:</label>
                    <input type="text" value={formData.nueva_fecha_ano} onChange={(e) => handleCampoChange('nueva_fecha_ano', e.target.value)} className="w-full border p-2 rounded-xl font-mono font-bold bg-white" />
                  </div>
                </div>
              </div>
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