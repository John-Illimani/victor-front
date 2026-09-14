import React, { useState, useEffect } from 'react';
import { CONFIGURACION_FICHAS, DEPARTAMENTOS_BOLIVIA, MESES_ANIO, ESPECIALIDADES_ESFM, convertirNumeroALiteral } from '../../utils/camposFichas';
import { Plus, Trash2, MapPin, GraduationCap, UserCheck, Users, Megaphone, Calendar } from 'lucide-react';

export const FormularioFichaDinamico = ({ codigoFicha, fichaData, setFichaData, listaDocentes = [], estudianteSeleccionado = null, anoFormacion = '1er Año' }) => {
  const config = CONFIGURACION_FICHAS[codigoFicha];

  // Sincronización automática de datos referenciales del estudiante
  const inicializarDatos = (actuales) => {
    const fecha = new Date();
    const updates = { ...actuales };

    if (estudianteSeleccionado) {
      updates.apellidos_nombres = `${estudianteSeleccionado.apellido || ''} ${estudianteSeleccionado.nombre || ''}`.trim();
      updates.esfm_ua = estudianteSeleccionado.esfm_ua || 'ESFM Simón Bolívar / UA El Alto';
      updates.especialidad = estudianteSeleccionado.especialidad || ESPECIALIDADES_ESFM[0];
      updates.ano_formacion = estudianteSeleccionado.ano_formacion || anoFormacion || '2do Año de Formación';
      updates.ci = estudianteSeleccionado.ci || '';
    }

    if (!updates.lugar_ciudad) updates.lugar_ciudad = "La Paz";
    if (!updates.departamento) updates.departamento = DEPARTAMENTOS_BOLIVIA[0];
    if (!updates.mes) updates.mes = MESES_ANIO[fecha.getMonth()];
    if (!updates.dia) updates.dia = String(fecha.getDate());
    if (!updates.gestion) updates.gestion = "2026";
    if (!updates.hora) updates.hora = "09:00";
    if (!updates.esfm_predios) updates.esfm_predios = "ESFM Simón Bolívar / UA El Alto";

    return updates;
  };

  const [datosForm, setDatosForm] = useState(() => inicializarDatos(fichaData));

  useEffect(() => {
    const init = inicializarDatos(fichaData);
    setDatosForm(init);
  }, [estudianteSeleccionado, codigoFicha]);

  const actualizarCampo = (key, val) => {
    const nuevo = { ...datosForm, [key]: val };
    setDatosForm(nuevo);
    setFichaData(nuevo);
  };

  // Manejador para fichas con criterios por etapas (Ej. Ficha 2_F5)
  const handleEtapasChange = (key, val) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = '';
    else if (num < 1) num = 1;
    else if (num > 100) num = 100;

    const nuevos = { ...datosForm, [key]: num };

    const todasLasClaves = config.criteriosEtapas.flatMap(e => e.criterios.map(c => c.key));
    const notas = todasLasClaves.map(k => parseFloat(nuevos[k])).filter(n => !isNaN(n));
    
    const suma = notas.reduce((a, b) => a + b, 0);
    const prom = notas.length > 0 ? parseFloat((suma / notas.length).toFixed(2)) : 0;

    nuevos.puntaje_final = prom;
    nuevos.promedio_final = prom;
    nuevos.promedio_numeral = prom;
    nuevos.promedio_literal = convertirNumeroALiteral(prom);

    setDatosForm(nuevos);
    setFichaData(nuevos);
  };

  // Bloque: Datos Referenciales Estándar
  const renderDatosReferencialesGen = () => {
    if (!config?.requiereDatosEstudiante) return null;
    return (
      <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-sm space-y-3 text-xs">
        <span className="font-extrabold text-amber-900 uppercase text-[11px] flex items-center gap-1.5">
          <GraduationCap size={15} /> DATOS REFERENCIALES DEL ESTUDIANTE:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 text-[10px] mb-1">Nombres y Apellidos:</label>
            <input
              type="text"
              readOnly
              value={datosForm.apellidos_nombres || ''}
              className="w-full border border-amber-200 p-2 rounded-xl bg-white font-extrabold text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 text-[10px] mb-1">ESFM/UA:</label>
            <input
              type="text"
              value={datosForm.esfm_ua || ''}
              onChange={(e) => actualizarCampo('esfm_ua', e.target.value)}
              className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold text-slate-800"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
            <select
              value={datosForm.especialidad || ESPECIALIDADES_ESFM[0]}
              onChange={(e) => actualizarCampo('especialidad', e.target.value)}
              className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold text-slate-800 cursor-pointer"
            >
              {ESPECIALIDADES_ESFM.map(esp => <option key={esp} value={esp}>{esp}</option>)}
            </select>
          </div>
        </div>
      </div>
    );
  };

  // Bloque: Datos Referenciales para 2do Año (F-5, F-6 y Centralizador)
  const renderDatosReferenciales2do = () => {
    if (!config?.requiereDatosEstudiante2do) return null;
    return (
      <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-sm space-y-3 text-xs">
        <span className="font-extrabold text-amber-900 uppercase text-[11px] flex items-center gap-1.5">
          <GraduationCap size={15} /> DATOS REFERENCIALES:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 text-[10px] mb-1">Nombres y Apellidos:</label>
            <input
              type="text"
              readOnly
              value={datosForm.apellidos_nombres || ''}
              className="w-full border border-amber-200 p-2 rounded-xl bg-white font-extrabold text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 text-[10px] mb-1">ESFM/UA:</label>
            <input
              type="text"
              value={datosForm.esfm_ua || ''}
              onChange={(e) => actualizarCampo('esfm_ua', e.target.value)}
              className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold text-slate-800"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 text-[10px] mb-1">Año de Formación:</label>
            <input
              type="text"
              value={datosForm.ano_formacion || '2do Año de Formación'}
              onChange={(e) => actualizarCampo('ano_formacion', e.target.value)}
              className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold text-slate-800"
            />
          </div>
        </div>
      </div>
    );
  };

  // Bloque: Lugar y Fecha
  const renderLugarFecha = () => {
    if (!config?.tieneLugarFecha) return null;
    return (
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
        <span className="font-extrabold text-[#801B28] uppercase text-[11px] flex items-center gap-1.5">
          <MapPin size={14} /> LUGAR Y FECHA
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block font-bold text-slate-700 text-[10px] mb-1">Ciudad / Localidad:</label>
            <input
              type="text"
              value={datosForm.lugar_ciudad || ''}
              onChange={(e) => actualizarCampo('lugar_ciudad', e.target.value)}
              className="w-full border border-slate-200 p-2 rounded-xl bg-white font-medium"
              placeholder="Ej. El Alto"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 text-[10px] mb-1">Departamento:</label>
            <select
              value={datosForm.departamento || DEPARTAMENTOS_BOLIVIA[0]}
              onChange={(e) => actualizarCampo('departamento', e.target.value)}
              className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold text-slate-800 cursor-pointer"
            >
              {DEPARTAMENTOS_BOLIVIA.map(dep => <option key={dep} value={dep}>{dep}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 text-[10px] mb-1">Día:</label>
            <input
              type="text"
              value={datosForm.dia || ''}
              onChange={(e) => actualizarCampo('dia', e.target.value)}
              className="w-full border border-slate-200 p-2 rounded-xl bg-white font-mono font-bold"
              placeholder="12"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 text-[10px] mb-1">Mes:</label>
            <select
              value={datosForm.mes || MESES_ANIO[0]}
              onChange={(e) => actualizarCampo('mes', e.target.value)}
              className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold text-slate-800 cursor-pointer uppercase"
            >
              {MESES_ANIO.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>
    );
  };

  // 1. CUADRO CENTRALIZADOR GENERAL
  if (codigoFicha === 'CENTRALIZADOR' || (config && config.esCentralizador)) {
    const getCamposCentralizador = (ano) => {
      const a = (ano || '').toUpperCase();
      
      // Centralizador 1er Año
      if (a.includes('1') || a.includes('PRIMER')) return [
        { key: 'nota_f1', label: 'Ficha F-1: Elaboración y Validación de Instrumentos', ficha: 'F-1', etapa: 'Etapa Preparatoria' },
        { key: 'nota_f2', label: 'Ficha F-2: Control de Asistencia PEC', ficha: 'F-2', etapa: 'Etapa de Ejecución' },
        { key: 'nota_f3', label: 'Ficha F-3: Aplicación de Técnicas e Instrumentos', ficha: 'F-3', etapa: 'Etapa de Ejecución' },
        { key: 'nota_f4', label: 'Ficha F-4: Seguimiento Docente Guía y Director', ficha: 'F-4', etapa: 'Etapa de Ejecución' },
        { key: 'nota_f5', label: 'Ficha F-5: Valoración de Producción de Conocimientos', ficha: 'F-5', etapa: 'Etapa de Producción' }
      ];
      
      // Centralizador 2do Año
      if (a.includes('2') || a.includes('SEGUNDO')) return [
        { key: 'nota_f1', label: 'Plan de acción e instrumentos de diagnóstico debidamente validados', ficha: 'F-1', etapa: 'ETAPA PREPARATORIA (ANTES DE LA PEC)' },
        { key: 'nota_f2', label: 'Asistencia a la Práctica Educativa Comunitaria (PEC). F-2 100%', ficha: 'F-2', etapa: 'ETAPA DE EJECUCIÓN (DURANTE)' },
        { key: 'nota_f3', label: 'Instrumentos de investigación educativa aplicados en cada espacio geográfico', ficha: 'F-3', etapa: 'ETAPA DE EJECUCIÓN (DURANTE)' },
        { key: 'nota_f4', label: 'Apoyo y seguimiento del Docente Guía de UE/CEA/CEE en la Concreción Curricular', ficha: 'F-4', etapa: 'ETAPA DE EJECUCIÓN (DURANTE)' },
        { key: 'nota_f5', label: 'Valoración de la/el Docente Acompañante de la ESFM/UA', ficha: 'F-5', etapa: 'ETAPA DE EJECUCIÓN (DURANTE)' },
        { key: 'nota_f6', label: 'Valoración del documento Diagnóstico Socioeducativo', ficha: 'F-6', etapa: 'ETAPA DE PRODUCCIÓN (DESPUÉS)' }
      ];

      // Centralizador 3er Año
      if (a.includes('3') || a.includes('TERCER')) return [
        { key: 'nota_a1', label: 'Ficha A-1: Técnicas e Instrumentos de Investigación', ficha: 'A-1' },
        { key: 'nota_b1', label: 'Ficha B-1: Apoyo y Seguimiento Docente Acompañante', ficha: 'B-1' },
        { key: 'nota_b2', label: 'Ficha B-2: Asistencia PEC', ficha: 'B-2' },
        { key: 'nota_b3', label: 'Ficha B-3: Apoyo Docente Guía Concreción Curricular', ficha: 'B-3' },
        { key: 'nota_b4', label: 'Ficha B-4: Seguimiento y Apoyo Docente Tutor', ficha: 'B-4' },
        { key: 'nota_b5', label: 'Ficha B-5: Presentación Informe Diagnóstico Socioparticipativo', ficha: 'B-5' }
      ];

      // Centralizador 4to Año
      return [
        { key: 'nota_a1', label: 'Ficha A-1: Técnicas e Instrumentos de Investigación', ficha: 'A-1' },
        { key: 'nota_a2', label: 'Ficha A-2: Elaboración de Planes de Desarrollo Curricular (PDC)', ficha: 'A-2' },
        { key: 'nota_b1', label: 'Ficha B-1: Control de Asistencia PEC', ficha: 'B-1' },
        { key: 'nota_b4', label: 'Ficha B-4: Cuadro Centralizador Concreción Curricular', ficha: 'B-4' },
        { key: 'nota_b5', label: 'Ficha B-5: Seguimiento Docente Guía', ficha: 'B-5' },
        { key: 'nota_b6', label: 'Ficha B-6: Seguimiento Docente Tutor Acompañante', ficha: 'B-6' },
        { key: 'nota_b7', label: 'Ficha B-7: Diagnóstico Socioparticipativo UE', ficha: 'B-7' },
        { key: 'nota_c1', label: 'Ficha C-1: Evaluación Documento Diseño Metodológico', ficha: 'C-1' },
        { key: 'nota_c2', label: 'Ficha C-2: Socialización Diseño Metodológico', ficha: 'C-2' }
      ];
    };

    const listaCampos = getCamposCentralizador(anoFormacion);

    const handleNotaCentralizadorChange = (key, val) => {
      let num = parseFloat(val);
      if (isNaN(num)) num = '';
      else if (num < 0) num = 0;
      else if (num > 100) num = 100;

      const nuevosDatos = { ...datosForm, [key]: num };
      const notasValidas = listaCampos.map(c => parseFloat(nuevosDatos[c.key])).filter(n => !isNaN(n));
      const suma = notasValidas.reduce((acc, curr) => acc + curr, 0);
      const promedio = notasValidas.length > 0 ? parseFloat((suma / notasValidas.length).toFixed(2)) : 0;

      nuevosDatos.promedio_final = promedio;
      nuevosDatos.promedio_numeral = promedio;
      nuevosDatos.puntaje_final = promedio;
      nuevosDatos.promedio_literal = convertirNumeroALiteral(promedio);

      setDatosForm(nuevosDatos);
      setFichaData(nuevosDatos);
    };

    return (
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 shadow-inner space-y-4">
          <div className="border-b border-slate-200 pb-2 text-center">
            <h4 className="font-extrabold text-[#801B28] uppercase text-sm">
              CENTRALIZADOR DE EVALUACIÓN IEPC-PEC 2º AÑO DE FORMACIÓN ({anoFormacion.toUpperCase()})
            </h4>
            <p className="text-[11px] font-semibold text-slate-600 mt-1">
              Responsable de llenar docente acompañante de la ESFM/UA.
            </p>
          </div>
          
          {renderDatosReferenciales2do()}
          {renderLugarFecha()}

          {/* Tabla Estructurada para Centralizador de 2do Año */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#801B28] text-white uppercase text-[10px] font-black tracking-wider">
                  <th className="p-2.5 border-b border-rose-900 w-1/4">ETAPA</th>
                  <th className="p-2.5 border-b border-rose-900">ACTIVIDADES</th>
                  <th className="p-2.5 border-b border-rose-900 text-center w-20">FICHA</th>
                  <th className="p-2.5 border-b border-rose-900 text-center w-32">CALIFICACIÓN OBTENIDA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {listaCampos.map((campo, idx) => (
                  <tr key={campo.key} className="hover:bg-slate-50/80 transition-colors">
                    {/* Renderizado de Etapas para 2do Año */}
                    {idx === 0 && (
                      <td rowSpan={1} className="p-2.5 font-bold bg-rose-50/40 text-slate-700 align-middle border-r border-slate-200 text-[10px]">
                        {campo.etapa}
                      </td>
                    )}
                    {idx === 1 && (
                      <td rowSpan={4} className="p-2.5 font-bold bg-rose-50/40 text-slate-700 align-middle border-r border-slate-200 text-[10px]">
                        {campo.etapa}
                      </td>
                    )}
                    {idx === 5 && (
                      <td rowSpan={1} className="p-2.5 font-bold bg-rose-50/40 text-slate-700 align-middle border-r border-slate-200 text-[10px]">
                        {campo.etapa}
                      </td>
                    )}
                    <td className="p-2.5 leading-snug">{campo.label}</td>
                    <td className="p-2.5 text-center font-bold font-mono text-slate-700 border-x border-slate-200">{campo.ficha}</td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={datosForm[campo.key] !== undefined ? datosForm[campo.key] : ''}
                        onChange={(e) => handleNotaCentralizadorChange(campo.key, e.target.value)}
                        className="w-full border border-slate-200 p-1.5 rounded-lg font-mono font-bold text-center text-slate-900 bg-white focus:border-[#801B28] outline-none"
                        placeholder="0.00"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <label className="block font-extrabold text-slate-500 uppercase text-[10px]">PROMEDIO TOTAL:</label>
              <div className="font-mono font-black text-2xl text-[#801B28] mt-1">
                {datosForm.promedio_final || datosForm.promedio_numeral || '0.00'} / 100 PTS
              </div>
            </div>
            <div>
              <label className="block font-extrabold text-slate-500 uppercase text-[10px]">LITERAL:</label>
              <div className="font-extrabold text-xs text-slate-800 uppercase mt-2">
                {datosForm.promedio_literal || 'CERO CON 00/100'}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
            <label className="block font-bold text-slate-700 text-[10px]">Observaciones y/o sugerencias:</label>
            <textarea
              rows="3"
              value={datosForm.observaciones || ''}
              onChange={(e) => actualizarCampo('observaciones', e.target.value)}
              className="w-full border p-2 rounded-xl font-medium text-slate-800 text-xs outline-none focus:border-[#801B28]"
              placeholder="Escriba aquí las observaciones..."
            />
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center gap-1">
              <UserCheck size={14} className="text-[#801B28]" /> AUTORIDADES Y DOCENTES EVALUADORES
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Docente Acompañante ESFM / Tutor:</label>
                <select
                  value={datosForm.docente_acompanante_id || ''}
                  onChange={(e) => actualizarCampo('docente_acompanante_id', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold text-slate-800 cursor-pointer text-xs"
                >
                  <option value="">-- Seleccionar Docente Acompañante --</option>
                  {listaDocentes.map(d => <option key={d.id} value={d.id}>{d.nombre} {d.apellido}</option>)}
                </select>
              </div>

              {/* <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Docente Guía UE/CEA/CEE:</label>
                <select
                  value={datosForm.docente_guia_id || ''}
                  onChange={(e) => actualizarCampo('docente_guia_id', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold text-slate-800 cursor-pointer text-xs"
                >
                  <option value="">-- Seleccionar Docente Guía --</option>
                  {listaDocentes.map(d => <option key={d.id} value={d.id}>{d.nombre} {d.apellido}</option>)}
                </select>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. VISTA: ACTA DE INICIO (Aplica a 2do y 3er Año)
  if (config?.esActaInicioOficial) {
    const listaIntegrantes = datosForm.integrantes || [{ apellidos_nombres: '', especialidad: '', ci: '' }];

    const handleIntegranteChange = (idx, field, val) => {
      const copy = [...listaIntegrantes];
      copy[idx][field] = val;
      actualizarCampo('integrantes', copy);
    };

    const agregarIntegrante = () => {
      actualizarCampo('integrantes', [...listaIntegrantes, { apellidos_nombres: '', especialidad: '', ci: '' }]);
    };

    const eliminarIntegrante = (idx) => {
      actualizarCampo('integrantes', listaIntegrantes.filter((_, i) => i !== idx));
    };

    return (
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 shadow-inner space-y-4">
          <h4 className="font-extrabold text-[#801B28] uppercase text-center text-sm border-b pb-2">
            ACTA DE INICIO - INVESTIGACIÓN EDUCATIVA Y PRODUCCIÓN DE CONOCIMIENTOS PRÁCTICA EDUCATIVA COMUNITARIA
          </h4>

          {/* DATOS REFERENCIALES ESPECÍFICOS PARA ACTA DE INICIO */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-sm space-y-3">
            <span className="font-extrabold text-amber-900 uppercase text-[11px] flex items-center gap-1.5">
              <GraduationCap size={15} /> DATOS REFERENCIALES DEL ESTUDIANTE:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Apellidos y Nombres:</label>
                <input
                  type="text"
                  readOnly
                  value={datosForm.apellidos_nombres || ''}
                  className="w-full border border-amber-200 p-2 rounded-xl bg-white font-extrabold text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">ESFM/UA:</label>
                <input
                  type="text"
                  value={datosForm.esfm_ua || ''}
                  onChange={(e) => actualizarCampo('esfm_ua', e.target.value)}
                  className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                <input
                  type="text"
                  value={datosForm.especialidad || ESPECIALIDADES_ESFM[0]}
                  onChange={(e) => actualizarCampo('especialidad', e.target.value)}
                  className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold text-slate-800"
                />
              </div>
              {/* <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Paralelo:</label>
                <input
                  type="text"
                  value={datosForm.paralelo || ''}
                  onChange={(e) => actualizarCampo('paralelo', e.target.value)}
                  className="w-full border border-amber-200 p-2 rounded-xl bg-white font-bold text-slate-800"
                  placeholder="Ej. A"
                />
              </div> */}
            </div>
          </div>

          {/* INTEGRANTES DEL EQUIPO COMUNITARIO */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                <Users size={15} /> Integrantes del Equipo Comunitario IEPC-PEC:
              </span>
              <button
                type="button"
                onClick={agregarIntegrante}
                className="flex items-center gap-1 bg-[#801B28] text-white px-2.5 py-1 rounded-xl font-bold text-[10px]"
              >
                <Plus size={14} /> Integrante
              </button>
            </div>

            <div className="space-y-2">
              {listaIntegrantes.map((int, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <span className="font-mono font-bold w-6 text-center">{idx + 1}</span>
                  <input
                    type="text"
                    placeholder="APELLIDOS Y NOMBRES"
                    value={int.apellidos_nombres || ''}
                    onChange={(e) => handleIntegranteChange(idx, 'apellidos_nombres', e.target.value)}
                    className="flex-1 border p-1.5 rounded-lg bg-white font-medium"
                  />
                  {config.integrantesCampos.includes('especialidad') && (
                    <input
                      type="text"
                      placeholder="ESPECIALIDAD"
                      value={int.especialidad || ''}
                      onChange={(e) => handleIntegranteChange(idx, 'especialidad', e.target.value)}
                      className="w-40 border p-1.5 rounded-lg bg-white"
                    />
                  )}
                  {config.integrantesCampos.includes('ci') && (
                    <input
                      type="text"
                      placeholder="C.I."
                      value={int.ci || ''}
                      onChange={(e) => handleIntegranteChange(idx, 'ci', e.target.value)}
                      className="w-24 border p-1.5 rounded-lg bg-white font-mono"
                    />
                  )}
                  {config.integrantesCampos.includes('nro_celular') && (
                    <input
                      type="text"
                      placeholder="NRO CELULAR"
                      value={int.nro_celular || ''}
                      onChange={(e) => handleIntegranteChange(idx, 'nro_celular', e.target.value)}
                      className="w-32 border p-1.5 rounded-lg bg-white font-mono"
                    />
                  )}
                  {listaIntegrantes.length > 1 && (
                    <button type="button" onClick={() => eliminarIntegrante(idx)} className="p-1.5 text-rose-600">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* DATOS DE LA IEPC-PEC */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-black text-[#801B28] uppercase text-[11px] block">DATOS DE LA IEPC-PEC</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Departamento:</label>
                <select
                  value={datosForm.departamento || DEPARTAMENTOS_BOLIVIA[0]}
                  onChange={(e) => actualizarCampo('departamento', e.target.value)}
                  className="w-full border p-2 rounded-xl bg-white font-bold"
                >
                  {DEPARTAMENTOS_BOLIVIA.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Distrito Educativo:</label>
                <input
                  type="text"
                  value={datosForm.distrito_educativo || ''}
                  onChange={(e) => actualizarCampo('distrito_educativo', e.target.value)}
                  className="w-full border p-2 rounded-xl bg-white font-medium"
                  placeholder="Ej. Distrito 1 El Alto"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">UE/CEA/CEE:</label>
                <input
                  type="text"
                  value={datosForm.ue_cea_cee || ''}
                  onChange={(e) => actualizarCampo('ue_cea_cee', e.target.value)}
                  className="w-full border p-2 rounded-xl bg-white font-medium"
                  placeholder="Ej. Unidad Educativa Franz Tamayo"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                <input
                  type="text"
                  value={datosForm.especialidad_iepc || datosForm.especialidad || ''}
                  onChange={(e) => actualizarCampo('especialidad_iepc', e.target.value)}
                  className="w-full border p-2 rounded-xl bg-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Año/s de escolaridad; Paralelo/s asignados:</label>
                <input
                  type="text"
                  value={datosForm.anos_escolaridad_paralelos || ''}
                  onChange={(e) => actualizarCampo('anos_escolaridad_paralelos', e.target.value)}
                  className="w-full border p-2 rounded-xl bg-white font-medium"
                  placeholder="Ej. 1º A, 2º B"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-1">Subsistema:</label>
                  <input
                    type="text"
                    value={datosForm.subsistema || 'Educación Regular'}
                    onChange={(e) => actualizarCampo('subsistema', e.target.value)}
                    className="w-full border p-2 rounded-xl bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-1">Nivel:</label>
                  <input
                    type="text"
                    value={datosForm.nivel || 'Primaria Comunitaria Vocacional'}
                    onChange={(e) => actualizarCampo('nivel', e.target.value)}
                    className="w-full border p-2 rounded-xl bg-white font-medium"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Fecha desarrollo PEC (del ... al ...):</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="del 01/04/2026"
                    value={datosForm.fecha_inicio_pec || ''}
                    onChange={(e) => actualizarCampo('fecha_inicio_pec', e.target.value)}
                    className="w-full border p-2 rounded-xl bg-white font-mono"
                  />
                  <span className="font-bold">al</span>
                  <input
                    type="text"
                    placeholder="15/04/2026"
                    value={datosForm.fecha_conclusion_pec || ''}
                    onChange={(e) => actualizarCampo('fecha_conclusion_pec', e.target.value)}
                    className="w-full border p-2 rounded-xl bg-white font-mono"
                  />
                </div>
              </div>

            

              <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-1">Docente Acompañante ESFM/UA:</label>
                  <select
                    value={datosForm.docente_acompanante_id || ''}
                    onChange={(e) => actualizarCampo('docente_acompanante_id', e.target.value)}
                    className="w-full border p-2 rounded-xl bg-white font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="">-- Seleccionar Docente Acompañante --</option>
                    {listaDocentes.map(d => <option key={d.id} value={d.id}>{d.nombre} {d.apellido}</option>)}
                  </select>
                </div>
                 <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Docente Guía UE/CEA/CEE:</label>
                <select
                  value={datosForm.docente_guia_id || ''}
                  onChange={(e) => actualizarCampo('docente_guia_id', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold text-slate-800 cursor-pointer text-xs"
                >
                  <option value="">-- Seleccionar Docente Guía --</option>
                  {listaDocentes.map(d => <option key={d.id} value={d.id}>{d.nombre} {d.apellido}</option>)}
                </select>
              </div>
              </div>


            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. VISTA: ACTA DE CONFORMACIÓN DE EQUIPO (Aplica a todos los años)
  if (config?.esActaEquipoOficial) {
    const listaIntegrantes = datosForm.integrantes || [{ apellidos_nombres: '', especialidad: '', ci: '', nro_celular: '' }];

    const handleIntegranteChange = (idx, field, val) => {
      const copy = [...listaIntegrantes];
      copy[idx][field] = val;
      actualizarCampo('integrantes', copy);
    };

    const agregarIntegrante = () => {
      actualizarCampo('integrantes', [...listaIntegrantes, { apellidos_nombres: '', especialidad: '', ci: '', nro_celular: '' }]);
    };

    const eliminarIntegrante = (idx) => {
      actualizarCampo('integrantes', listaIntegrantes.filter((_, i) => i !== idx));
    };

    return (
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 shadow-inner space-y-4">
          <h4 className="font-extrabold text-[#801B28] uppercase text-center text-sm border-b pb-2">
            {config.titulo}
          </h4>

          {/* DATOS DE ENCABEZADO */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
              <MapPin size={15} /> DATOS DE REUNIÓN Y ENCABEZADO DEL ACTA
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Ciudad / Localidad:</label>
                <input
                  type="text"
                  value={datosForm.lugar_ciudad || ''}
                  onChange={(e) => actualizarCampo('lugar_ciudad', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-medium focus:border-[#801B28] outline-none"
                  placeholder="Ej. El Alto"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Departamento:</label>
                <select
                  value={datosForm.departamento || DEPARTAMENTOS_BOLIVIA[0]}
                  onChange={(e) => actualizarCampo('departamento', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold text-slate-800 cursor-pointer focus:border-[#801B28] outline-none"
                >
                  {DEPARTAMENTOS_BOLIVIA.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Predios de la ESFM/UA:</label>
                <input
                  type="text"
                  value={datosForm.esfm_predios || ''}
                  onChange={(e) => actualizarCampo('esfm_predios', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-medium focus:border-[#801B28] outline-none"
                  placeholder="Ej. ESFM Simón Bolívar"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Hora de reunión:</label>
                <input
                  type="time"
                  value={datosForm.hora || ''}
                  onChange={(e) => actualizarCampo('hora', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-mono font-bold focus:border-[#801B28] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Día:</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={datosForm.dia || ''}
                  onChange={(e) => actualizarCampo('dia', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-mono font-bold focus:border-[#801B28] outline-none"
                  placeholder="12"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Mes:</label>
                <select
                  value={datosForm.mes || MESES_ANIO[0]}
                  onChange={(e) => actualizarCampo('mes', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold text-slate-800 cursor-pointer uppercase focus:border-[#801B28] outline-none"
                >
                  {MESES_ANIO.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Gestión:</label>
                <input
                  type="number"
                  value={datosForm.gestion || '2026'}
                  onChange={(e) => actualizarCampo('gestion', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-mono font-bold focus:border-[#801B28] outline-none"
                  placeholder="2026"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Año de Formación:</label>
                <input
                  type="text"
                  value={datosForm.ano_formacion || anoFormacion}
                  onChange={(e) => actualizarCampo('ano_formacion', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold text-slate-800 focus:border-[#801B28] outline-none"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-4">
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
                <select
                  value={datosForm.especialidad || ESPECIALIDADES_ESFM[0]}
                  onChange={(e) => actualizarCampo('especialidad', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold text-slate-800 cursor-pointer focus:border-[#801B28] outline-none"
                >
                  {ESPECIALIDADES_ESFM.map(esp => <option key={esp} value={esp}>{esp}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* INTEGRANTES DEL EQUIPO COMUNITARIO */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                <Users size={15} /> INTEGRANTES DEL EQUIPO COMUNITARIO:
              </span>
              <button
                type="button"
                onClick={agregarIntegrante}
                className="flex items-center gap-1 bg-[#801B28] text-white px-2.5 py-1 rounded-xl font-bold text-[10px]"
              >
                <Plus size={14} /> Integrante
              </button>
            </div>

            <div className="space-y-2">
              {listaIntegrantes.map((int, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <span className="font-mono font-bold w-6 text-center">{idx + 1}</span>
                  <input
                    type="text"
                    placeholder="APELLIDOS Y NOMBRES"
                    value={int.apellidos_nombres || ''}
                    onChange={(e) => handleIntegranteChange(idx, 'apellidos_nombres', e.target.value)}
                    className="flex-1 border p-1.5 rounded-lg bg-white font-medium"
                  />
                  {config.integrantesCampos.includes('especialidad') && (
                    <input
                      type="text"
                      placeholder="ESPECIALIDAD"
                      value={int.especialidad || ''}
                      onChange={(e) => handleIntegranteChange(idx, 'especialidad', e.target.value)}
                      className="w-40 border p-1.5 rounded-lg bg-white"
                    />
                  )}
                  {config.integrantesCampos.includes('ci') && (
                    <input
                      type="text"
                      placeholder="C.I."
                      value={int.ci || ''}
                      onChange={(e) => handleIntegranteChange(idx, 'ci', e.target.value)}
                      className="w-24 border p-1.5 rounded-lg bg-white font-mono"
                    />
                  )}
                  {config.integrantesCampos.includes('nro_celular') && (
                    <input
                      type="text"
                      placeholder="NRO CELULAR"
                      value={int.nro_celular || ''}
                      onChange={(e) => handleIntegranteChange(idx, 'nro_celular', e.target.value)}
                      className="w-32 border p-1.5 rounded-lg bg-white font-mono"
                    />
                  )}
                  {listaIntegrantes.length > 1 && (
                    <button type="button" onClick={() => eliminarIntegrante(idx)} className="p-1.5 text-rose-600">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. VISTA: ACTA DE SOCIALIZACIÓN DEL DIAGNÓSTICO (3ER AÑO)
  if (config?.esActaSocializacionOficial) {
    const listaObservaciones = datosForm.observaciones_lista || ['', '', '', ''];

    const handleObsChange = (idx, val) => {
      const copy = [...listaObservaciones];
      copy[idx] = val;
      actualizarCampo('observaciones_lista', copy);
    };

    return (
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 shadow-inner space-y-4">
          <h4 className="font-extrabold text-[#801B28] uppercase text-center text-sm border-b pb-2">
            ACTA DE SOCIALIZACIÓN DEL DIAGNÓSTICO DEL EQUIPO COMUNITARIO
          </h4>

          {/* DATOS DE ENCABEZADO */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
              <Megaphone size={15} /> SOCIALIZACIÓN DEL DIAGNÓSTICO
            </span>

           <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
  <span className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
    <Megaphone size={15} /> DATOS DE REUNIÓN Y ENCABEZADO DE SOCIALIZACIÓN
  </span>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
    <div>
      <label className="block font-bold text-slate-700 text-[10px] mb-1">Ciudad / Localidad:</label>
      <input
        type="text"
        value={datosForm.lugar_ciudad || ''}
        onChange={(e) => actualizarCampo('lugar_ciudad', e.target.value)}
        className="w-full border border-slate-200 p-2 rounded-xl bg-white font-medium focus:border-[#801B28] outline-none"
        placeholder="Ej. El Alto"
      />
    </div>

    <div>
      <label className="block font-bold text-slate-700 text-[10px] mb-1">Distrito Educativo:</label>
      <input
        type="text"
        value={datosForm.distrito_educativo || ''}
        onChange={(e) => actualizarCampo('distrito_educativo', e.target.value)}
        className="w-full border border-slate-200 p-2 rounded-xl bg-white font-medium focus:border-[#801B28] outline-none"
        placeholder="Ej. Distrito 1"
      />
    </div>

    <div>
      <label className="block font-bold text-slate-700 text-[10px] mb-1">Hora de reunión:</label>
      <input
        type="time"
        value={datosForm.hora || ''}
        onChange={(e) => actualizarCampo('hora', e.target.value)}
        className="w-full border border-slate-200 p-2 rounded-xl bg-white font-mono font-bold focus:border-[#801B28] outline-none"
      />
    </div>

    <div>
      <label className="block font-bold text-slate-700 text-[10px] mb-1">Día:</label>
      <input
        type="number"
        min="1"
        max="31"
        value={datosForm.dia || ''}
        onChange={(e) => actualizarCampo('dia', e.target.value)}
        className="w-full border border-slate-200 p-2 rounded-xl bg-white font-mono font-bold focus:border-[#801B28] outline-none"
        placeholder="12"
      />
    </div>

    <div>
      <label className="block font-bold text-slate-700 text-[10px] mb-1">Mes:</label>
      <select
        value={datosForm.mes || MESES_ANIO[0]}
        onChange={(e) => actualizarCampo('mes', e.target.value)}
        className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold text-slate-800 cursor-pointer uppercase focus:border-[#801B28] outline-none"
      >
        {MESES_ANIO.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
    </div>

    <div>
      <label className="block font-bold text-slate-700 text-[10px] mb-1">Gestión:</label>
      <input
        type="number"
        value={datosForm.gestion || '2026'}
        onChange={(e) => actualizarCampo('gestion', e.target.value)}
        className="w-full border border-slate-200 p-2 rounded-xl bg-white font-mono font-bold focus:border-[#801B28] outline-none"
        placeholder="2026"
      />
    </div>

    <div className="sm:col-span-2 md:col-span-2">
      <label className="block font-bold text-slate-700 text-[10px] mb-1">Especialidad:</label>
      <select
        value={datosForm.especialidad || ESPECIALIDADES_ESFM[0]}
        onChange={(e) => actualizarCampo('especialidad', e.target.value)}
        className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold text-slate-800 cursor-pointer focus:border-[#801B28] outline-none"
      >
        {ESPECIALIDADES_ESFM.map(esp => <option key={esp} value={esp}>{esp}</option>)}
      </select>
    </div>

    <div className="sm:col-span-2 md:col-span-4">
      <label className="block font-bold text-slate-700 text-[10px] mb-1">Unidad Educativa / CEA / CEE:</label>
      <input
        type="text"
        value={datosForm.ue_cea_cee || ''}
        onChange={(e) => actualizarCampo('ue_cea_cee', e.target.value)}
        className="w-full border border-slate-200 p-2 rounded-xl bg-white font-medium focus:border-[#801B28] outline-none"
        placeholder="Ej. Unidad Educativa Franz Tamayo"
      />
    </div>
  </div>
</div>

          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block">
              Observaciones y/o sugerencias de los asistentes:
            </span>
            <div className="space-y-2">
              {[0, 1, 2, 3].map((idx) => (
                <div key={idx} className="flex gap-2 items-start bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <span className="font-mono font-bold w-6 text-center text-slate-500 mt-1">{idx + 1}.</span>
                  <textarea
                    rows="2"
                    placeholder={`Observación o sugerencia ${idx + 1}...`}
                    value={listaObservaciones[idx] || ''}
                    onChange={(e) => handleObsChange(idx, e.target.value)}
                    className="flex-1 border p-1.5 rounded-lg bg-white font-medium"
                  />
                </div>
              ))}
            </div>
          </div>


 <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-1">Docente Acompañante ESFM/UA:</label>
                  <select
                    value={datosForm.docente_acompanante_id || ''}
                    onChange={(e) => actualizarCampo('docente_acompanante_id', e.target.value)}
                    className="w-full border p-2 rounded-xl bg-white font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="">-- Seleccionar Docente Acompañante --</option>
                    {listaDocentes.map(d => <option key={d.id} value={d.id}>{d.nombre} {d.apellido}</option>)}
                  </select>
                </div>
                 <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Docente Guía UE/CEA/CEE:</label>
                <select
                  value={datosForm.docente_guia_id || ''}
                  onChange={(e) => actualizarCampo('docente_guia_id', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold text-slate-800 cursor-pointer text-xs"
                >
                  <option value="">-- Seleccionar Docente Guía --</option>
                  {listaDocentes.map(d => <option key={d.id} value={d.id}>{d.nombre} {d.apellido}</option>)}
                </select>
              </div>
              </div>



        </div>
      </div>
    );
  }

  // 5. VISTA: FICHA DE ASISTENCIA POR SEMANAS (3ER Y 4TO AÑO)
  if (config?.esAsistenciaSemanas) {
    const totalSemanas = config.semanasPredeterminados || 4;
    const listaSemanas = datosForm.semanas || Array.from({ length: totalSemanas }, (_, i) => ({ semana: `Semana ${i + 1}`, asistencias: '', inasistencias: '', atrasos: '', valoracion: '' }));

    const handleSemanaChange = (idx, field, val) => {
      const copy = [...listaSemanas];
      copy[idx][field] = val;

      if (field === 'valoracion') {
        const valores = copy.map(s => parseFloat(s.valoracion)).filter(n => !isNaN(n));
        const suma = valores.reduce((a, b) => a + b, 0);
        const prom = valores.length > 0 ? parseFloat((suma / valores.length).toFixed(2)) : 0;
        actualizarCampo('promedio_numeral', prom);
        actualizarCampo('promedio_final', prom);
        actualizarCampo('promedio_literal', convertirNumeroALiteral(prom));
      }

      actualizarCampo('semanas', copy);
    };

    return (
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 shadow-inner space-y-4">
          <h4 className="font-extrabold text-[#801B28] uppercase border-b pb-2">
            {config.titulo}
          </h4>

          {renderDatosReferencialesGen()}

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
              <Calendar size={15} /> REGISTRO DE ASISTENCIA
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Fecha inicio de la PEC:</label>
                <input
                  type="text"
                  value={datosForm.fecha_inicio_pec || ''}
                  onChange={(e) => actualizarCampo('fecha_inicio_pec', e.target.value)}
                  className="w-full border p-2 rounded-xl bg-white font-mono"
                  placeholder="dd/mm/aaaa"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Fecha conclusión de la PEC:</label>
                <input
                  type="text"
                  value={datosForm.fecha_conclusion_pec || ''}
                  onChange={(e) => actualizarCampo('fecha_conclusion_pec', e.target.value)}
                  className="w-full border p-2 rounded-xl bg-white font-mono"
                  placeholder="dd/mm/aaaa"
                />
              </div>
            </div>

            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left text-xs bg-slate-50">
                <thead className="bg-slate-200 text-slate-700 font-extrabold uppercase">
                  <tr>
                    <th className="p-2 text-center">Semana</th>
                    <th className="p-2 text-center">Nº Asistencia</th>
                    <th className="p-2 text-center">Nº Inasistencia</th>
                    <th className="p-2 text-center">Nº Atrasos</th>
                    <th className="p-2 text-center">Valoración (1-100)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {listaSemanas.map((s, idx) => (
                    <tr key={idx} className="bg-white">
                      <td className="p-2 text-center font-bold">{s.semana}</td>
                      <td className="p-2 text-center"><input type="number" value={s.asistencias} onChange={(e) => handleSemanaChange(idx, 'asistencias', e.target.value)} className="w-16 border rounded text-center" /></td>
                      <td className="p-2 text-center"><input type="number" value={s.inasistencias} onChange={(e) => handleSemanaChange(idx, 'inasistencias', e.target.value)} className="w-16 border rounded text-center" /></td>
                      <td className="p-2 text-center"><input type="number" value={s.atrasos} onChange={(e) => handleSemanaChange(idx, 'atrasos', e.target.value)} className="w-16 border rounded text-center" /></td>
                      <td className="p-2 text-center"><input type="number" value={s.valoracion} onChange={(e) => handleSemanaChange(idx, 'valoracion', e.target.value)} className="w-20 border rounded text-center font-bold text-[#801B28]" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">Promedio Final (Número entero):</label>
                <div className="font-mono font-black text-2xl text-[#801B28]">
                  {datosForm.promedio_final || datosForm.promedio_numeral || '0.00'} / 100 PTS
                </div>
              </div>
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">Literal:</label>
                <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">
                  {datosForm.promedio_literal || 'CERO CON 00/100'}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="block font-bold text-slate-700 text-[10px] mb-1">Observaciones y/o sugerencias:</label>
              <textarea
                rows="3"
                value={datosForm.observaciones || ''}
                onChange={(e) => actualizarCampo('observaciones', e.target.value)}
                className="w-full border p-2.5 rounded-xl font-medium text-slate-800 text-xs"
                placeholder="Escriba aquí las observaciones..."
              />
            </div>
          </div>

          {renderLugarFecha()}
        </div>
      </div>
    );
  }

  // 6. VISTA: FICHA F-2 (ASISTENCIA PEC CON 10 DÍAS - 1ER Y 2DO AÑO)
  if (config?.esAsistenciaDinamica) {
    const listaDias = datosForm.dias || Array.from({ length: config.diasPredeterminados || 10 }, (_, i) => ({ dia: `Día ${i + 1}`, detalle: '', valoracion: '' }));

    const handleDiaDetailChange = (idx, field, val) => {
      const copy = [...listaDias];
      copy[idx][field] = val;
      actualizarCampo('dias', copy);
    };

    return (
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 shadow-inner space-y-4">
          <h4 className="font-extrabold text-[#801B28] uppercase border-b pb-2">
            {config.titulo}
          </h4>

          {renderDatosReferencialesGen()}

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block">
              DETALLE DE LAS ACTIVIDADES REALIZADAS EN LA PEC
            </span>

            <div className="space-y-1.5">
              {listaDias.map((d, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <span className="font-mono font-bold text-slate-700 w-16 text-center">{d.dia}</span>
                  <input
                    type="text"
                    placeholder="Detalle de las actividades realizadas en la PEC..."
                    value={d.detalle || ''}
                    onChange={(e) => handleDiaDetailChange(idx, 'detalle', e.target.value)}
                    className="flex-1 border p-1.5 rounded-lg bg-white text-slate-800 font-medium"
                  />
                  <input
                    type="number"
                    placeholder="Valoración (1-100)"
                    value={d.valoracion || ''}
                    onChange={(e) => handleDiaDetailChange(idx, 'valoracion', e.target.value)}
                    className="w-32 border p-1.5 rounded-lg bg-white font-mono font-bold text-center text-[#801B28]"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Fecha inicio de la PEC:</label>
                <input
                  type="text"
                  value={datosForm.fecha_inicio_pec || ''}
                  onChange={(e) => actualizarCampo('fecha_inicio_pec', e.target.value)}
                  className="w-full border p-2 rounded-xl bg-white font-mono"
                  placeholder="dd/mm/aaaa"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Fecha conclusión de la PEC:</label>
                <input
                  type="text"
                  value={datosForm.fecha_conclusion_pec || ''}
                  onChange={(e) => actualizarCampo('fecha_conclusion_pec', e.target.value)}
                  className="w-full border p-2 rounded-xl bg-white font-mono"
                  placeholder="dd/mm/aaaa"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-1">Total asistencias:</label>
                  <input
                    type="number"
                    value={datosForm.total_asistencias || ''}
                    onChange={(e) => actualizarCampo('total_asistencias', e.target.value)}
                    className="w-full border p-2 rounded-xl bg-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-1">Total faltas:</label>
                  <input
                    type="number"
                    value={datosForm.total_faltas || ''}
                    onChange={(e) => actualizarCampo('total_faltas', e.target.value)}
                    className="w-full border p-2 rounded-xl bg-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 text-[10px] mb-1">Total atrasos:</label>
                  <input
                    type="number"
                    value={datosForm.total_atrasos || ''}
                    onChange={(e) => actualizarCampo('total_atrasos', e.target.value)}
                    className="w-full border p-2 rounded-xl bg-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center bg-white p-3 rounded-xl border">
                <div>
                  <label className="block font-extrabold text-[#801B28] text-[11px] uppercase">PORCENTAJE DE ASISTENCIA:</label>
                  <input
                    type="text"
                    value={datosForm.porcentaje_asistencia || ''}
                    onChange={(e) => actualizarCampo('porcentaje_asistencia', e.target.value)}
                    className="w-full border border-[#801B28] p-2 rounded-xl font-mono font-black text-[#801B28] text-lg bg-rose-50/30"
                    placeholder="100%"
                  />
                </div>
                <div>
                  <label className="block font-extrabold text-slate-600 text-[10px] uppercase">LITERAL PORCENTAJE:</label>
                  <input
                    type="text"
                    value={datosForm.porcentaje_literal || ''}
                    onChange={(e) => actualizarCampo('porcentaje_literal', e.target.value)}
                    className="w-full border p-2 rounded-xl font-bold uppercase text-slate-800 text-xs"
                    placeholder="CIEN POR CIENTO"
                  />
                </div>
              </div>
            </div>
          </div>


          <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Docente Guía UE/CEA/CEE:</label>
                <select
                  value={datosForm.docente_guia_id || ''}
                  onChange={(e) => actualizarCampo('docente_guia_id', e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl bg-white font-bold text-slate-800 cursor-pointer text-xs"
                >
                  <option value="">-- Seleccionar Docente Guía --</option>
                  {listaDocentes.map(d => <option key={d.id} value={d.id}>{d.nombre} {d.apellido}</option>)}
                </select>
              </div>


          {renderLugarFecha()}
        </div>
      </div>
    );
  }

  // 7. VISTA: FICHA DE MATRIZ PDC (F-4 2do Año, B-3 3er Año)
  if (config?.esMatrizPdc) {
    const handlePdcChange = (pdcKey, criterioKey, val) => {
      let num = parseFloat(val);
      if (isNaN(num)) num = '';
      else if (num < 1) num = 1;
      else if (num > 100) num = 100;

      const nuevoPdcs = { ...(datosForm.pdcs || {}) };
      if (!nuevoPdcs[pdcKey]) nuevoPdcs[pdcKey] = {};
      nuevoPdcs[pdcKey][criterioKey] = num;

      const valores = Object.values(nuevoPdcs[pdcKey]).map(v => parseFloat(v)).filter(v => !isNaN(v));
      const promParcial = valores.length > 0 ? (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(2) : 0;
      nuevoPdcs[pdcKey].promedio_parcial = promParcial;

      const keysPdc = Object.keys(nuevoPdcs);
      const promsValidos = keysPdc.map(k => parseFloat(nuevoPdcs[k].promedio_parcial || 0)).filter(p => p > 0);
      const promTotal = promsValidos.length > 0 ? (promsValidos.reduce((a, b) => a + b, 0) / promsValidos.length).toFixed(2) : 0;

      const actualizados = {
        ...datosForm,
        pdcs: nuevoPdcs,
        promedio_total: promTotal,
        promedio_literal: convertirNumeroALiteral(promTotal)
      };

      setDatosForm(actualizados);
      setFichaData(actualizados);
    };

    const columnasPdc = anoFormacion.includes('3') || anoFormacion.includes('TERCER') 
      ? ['PDC 1', 'PDC 2', 'PDC 3', 'Clase Comunitaria'] 
      : ['PDC 1', 'PDC 2'];

    return (
      <div className="space-y-4 text-xs font-sans">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 shadow-inner space-y-4">
          <h4 className="font-extrabold text-[#801B28] uppercase border-b pb-2">
            {config.titulo}
          </h4>

          {renderDatosReferencialesGen()}

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 overflow-x-auto">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block">
              CRITERIOS DE EVALUACIÓN DE CONCRECIÓN CURRICULAR
            </span>

            {columnasPdc.map((pdcLabel) => (
              <div key={pdcLabel} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                  <span className="font-black text-[#801B28] uppercase text-xs tracking-wider">{pdcLabel}</span>
                  <span className="font-bold text-slate-600 text-[11px]">
                    Promedio Parcial: <strong className="text-slate-900 font-mono text-xs">{datosForm.pdcs?.[pdcLabel]?.promedio_parcial || '0.00'} Pts.</strong>
                  </span>
                </div>

                <div className="space-y-2">
                  {config.criteriosPdc.map((crit, cIdx) => (
                    <div key={cIdx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                      <span className="sm:col-span-3 font-medium text-slate-800 leading-snug">
                        {crit.label}
                      </span>
                      <div>
                        <label className="block sm:hidden text-[9px] font-bold text-slate-500 mb-1">Calificación (1-100):</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={datosForm.pdcs?.[pdcLabel]?.[crit.key] !== undefined ? datosForm.pdcs[pdcLabel][crit.key] : ''}
                          onChange={(e) => handlePdcChange(pdcLabel, crit.key, e.target.value)}
                          className="w-full border border-slate-200 p-1.5 rounded-lg font-bold font-mono text-center text-slate-900 focus:border-[#801B28] outline-none"
                          placeholder="1-100"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-white p-3 rounded-2xl border border-slate-200 flex justify-between items-center mt-3">
              <span className="font-black text-slate-800 uppercase text-xs">PROMEDIO TOTAL (Número entero):</span>
              <span className="font-mono font-black text-xl text-[#801B28]">{datosForm.promedio_total || '0'} PTS</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-[10px] mb-1">Observaciones y/o sugerencias de la concreción curricular:</label>
              <textarea
                rows="3"
                value={datosForm.observaciones || ''}
                onChange={(e) => actualizarCampo('observaciones', e.target.value)}
                className="w-full border p-2.5 rounded-xl font-medium text-slate-800 text-xs"
                placeholder="Escriba aquí las observaciones..."
              />
            </div>
          </div>

          {renderLugarFecha()}
        </div>
      </div>
    );
  }

  // 8. VISTA ESTÁNDAR (F-1, F-3, F-6 Y DEMÁS FICHAS TRADICIONALES)
  const handleCampoEstandarChange = (key, val) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = '';
    else if (num < 1) num = 1;
    else if (num > 100) num = 100;

    const nuevos = { ...datosForm, [key]: num };

    if (config?.criterios || config?.criteriosQualitativos) {
      const lista = config.criterios || config.criteriosQualitativos;
      const numeros = lista.map(c => parseFloat(nuevos[c.key])).filter(n => !isNaN(n));
      const suma = numeros.reduce((a, b) => a + b, 0);
      const prom = numeros.length > 0 ? parseFloat((suma / numeros.length).toFixed(2)) : 0;

      nuevos.promedio_numeral = prom;
      nuevos.promedio_final = prom;
      nuevos.promedio_literal = convertirNumeroALiteral(prom);
    }

    setDatosForm(nuevos);
    setFichaData(nuevos);
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 shadow-inner space-y-4">
        <h4 className="font-extrabold text-[#801B28] uppercase border-b pb-2 flex justify-between items-center">
          <span>{config?.titulo || codigoFicha}</span>
          <span className="text-[10px] text-slate-400 font-bold">VALORACIÓN: 1 A 100 PTS</span>
        </h4>

        {config?.requiereDatosEstudiante2do ? renderDatosReferenciales2do() : renderDatosReferencialesGen()}
        {renderLugarFecha()}

        {(config?.criterios || config?.criteriosQualitativos) && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block">
              CRITERIOS DE EVALUACIÓN E INDICADORES
            </span>

            <div className="space-y-2">
              {(config.criterios || config.criteriosQualitativos).map((crit) => (
                <div key={crit.key} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border">
                  <span className="sm:col-span-3 font-medium text-slate-800">{crit.label}</span>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Calificación (1 a 100):</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={datosForm[crit.key] !== undefined ? datosForm[crit.key] : ''}
                      onChange={(e) => handleCampoEstandarChange(crit.key, e.target.value)}
                      className="w-full border p-1.5 rounded-lg bg-white font-mono font-bold text-center text-slate-900 focus:border-[#801B28]"
                      placeholder="1-100"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">Promedio Final (Número entero):</label>
                <div className="font-mono font-black text-2xl text-[#801B28]">
                  {datosForm.promedio_final || datosForm.promedio_numeral || datosForm.puntaje_final || '0.00'} / 100 PTS
                </div>
              </div>
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">Literal:</label>
                <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">
                  {datosForm.promedio_literal || 'CERO CON 00/100'}
                </div>
              </div>
            </div>

            {config.tieneObservaciones && (
              <div className="pt-2">
                <label className="block font-bold text-slate-700 text-[10px] mb-1">Observaciones y/o sugerencias:</label>
                <textarea
                  rows="3"
                  value={datosForm.observaciones || ''}
                  onChange={(e) => actualizarCampo('observaciones', e.target.value)}
                  className="w-full border p-2.5 rounded-xl font-medium text-slate-800 text-xs"
                  placeholder="Escriba aquí las observaciones..."
                />
              </div>
            )}
          </div>
        )}

        {/* Renderizado para fichas estructuradas por Etapas (Ficha F-5 2do Año) */}
        {config?.criteriosEtapas && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="font-extrabold text-slate-800 uppercase text-[11px] block border-b pb-2">
              CRITERIOS DE EVALUACIÓN POR ETAPAS
            </span>

            {config.criteriosEtapas.map((etapaObj, idx) => (
              <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <h5 className="font-black text-[#801B28] uppercase text-[11px] border-b border-slate-200 pb-1">
                  {etapaObj.etapa}
                </h5>

                <div className="space-y-2">
                  {etapaObj.criterios.map((crit) => (
                    <div key={crit.key} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                      <span className="sm:col-span-3 font-medium text-slate-800 leading-snug">
                        {crit.label}
                      </span>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 mb-0.5 sm:hidden">
                          Calificación (1 a 100):
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={datosForm[crit.key] !== undefined ? datosForm[crit.key] : ''}
                          onChange={(e) => handleEtapasChange(crit.key, e.target.value)}
                          className="w-full border border-slate-200 p-1.5 rounded-lg font-mono font-bold text-center text-slate-900 focus:border-[#801B28] outline-none"
                          placeholder="1-100"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">
                  Puntaje Final:
                </label>
                <div className="font-mono font-black text-2xl text-[#801B28]">
                  {datosForm.puntaje_final || datosForm.promedio_final || '0.00'} / 100 PTS
                </div>
              </div>
              <div>
                <label className="block font-black text-slate-700 text-[10px] uppercase">
                  Literal:
                </label>
                <div className="font-extrabold text-xs text-slate-900 uppercase mt-1">
                  {datosForm.promedio_literal || 'CERO CON 00/100'}
                </div>
              </div>
            </div>
          </div>
        )}

      

        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
          <span className="font-extrabold text-slate-800 uppercase text-[11px] block">
            Observaciones y/o sugerencias de los asistentes:
          </span>
          <div className="space-y-2">
            <textarea
              rows="2"
              placeholder={`Observación o sugerencia`}
              value={datosForm.observaciones || ''}
              onChange={(e) => actualizarCampo('observaciones', e.target.value)}
              className="w-full border p-1.5 rounded-lg bg-white font-medium outline-none focus:border-[#801B28]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};