import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  XCircle,
  FileText
} from 'lucide-react';

// SERVICIOS
import { studentService } from '../../services/studentService';
import { centralizador1erAnoService } from '../../services/fichas/1año/centralizador1erAnoService';
import { centralizador2doAnoService } from '../../services/fichas/2año/centralizador2doAnoService';
import { centralizador3erAnoService } from '../../services/fichas/3año/centralizador3erAnoService';
import { centralizador4toAnoService } from '../../services/fichas/4año/centralizador4toAnoService';
import { centralizador5toAnoService } from '../../services/fichas/5año/centralizador5toAnoService';

// CONFIGURACIÓN DE FICHAS Y COLUMNAS POR AÑO DE FORMACIÓN
const ESTRUCTURA_CALIFICACIONES_POR_ANO = {
  "1er Año": [
    { codigo: '1_F1', nombre: 'Ficha F-1: Elaboración y Validación de Instrumentos', key: 'nota_f1' },
    { codigo: '1_F2', nombre: 'Ficha F-2: Control de Asistencia PEC', key: 'nota_f2' },
    { codigo: '1_F3', nombre: 'Ficha F-3: Aplicación de Técnicas e Instrumentos', key: 'nota_f3' },
    { codigo: '1_F4', nombre: 'Ficha F-4: Seguimiento del Docente Guía y Director', key: 'nota_f4' },
    { codigo: '1_F5', nombre: 'Ficha F-5: Valoración de la Producción de Conocimientos', key: 'nota_f5' },
  ],
  "2do Año": [
    { codigo: '2_F1', nombre: 'Ficha F-1: Coordinación y Gestión Comunitaria', key: 'nota_f1' },
    { codigo: '2_F2', nombre: 'Ficha F-2: Asistencia PEC (2 semanas)', key: 'nota_f2' },
    { codigo: '2_F3', nombre: 'Ficha F-3: Aplicación de Técnicas e Instrumentos', key: 'nota_f3' },
    { codigo: '2_F4', nombre: 'Ficha F-4: Apoyo y Seguimiento Concreción Curricular', key: 'nota_f4' },
    { codigo: '2_F5', nombre: 'Ficha F-5: Valoración del Docente Acompañante ESFM', key: 'nota_f5' },
    { codigo: '2_F6', nombre: 'Ficha F-6: Valoración de la Producción IEPC-PEC', key: 'nota_f6' },
  ],
  "3er Año": [
    { codigo: '3_A1', nombre: 'Ficha A-1: Técnicas e Instrumentos de Investigación', key: 'nota_a1' },
    { codigo: '3_B1', nombre: 'Ficha B-1: Apoyo y Seguimiento Docente Acompañante', key: 'nota_b1' },
    { codigo: '3_B2', nombre: 'Ficha B-2: Asistencia PEC (4 semanas)', key: 'nota_b2' },
    { codigo: '3_B3', nombre: 'Ficha B-3: Apoyo Docente Guía Concreción Curricular', key: 'nota_b3' },
    { codigo: '3_B4', nombre: 'Ficha B-4: Seguimiento y Apoyo Docente Tutor', key: 'nota_b4' },
    { codigo: '3_B5', nombre: 'Ficha B-5: Presentación Informe Diagnóstico Socioparticipativo', key: 'nota_b5' },
  ],
  "4to Año": [
    { codigo: '4_A1', nombre: 'Ficha A-1: Técnicas e Instrumentos de Investigación', key: 'nota_a1' },
    { codigo: '4_A2', nombre: 'Ficha A-2: Elaboración de PDC (4 a 6 PDC)', key: 'nota_a2' },
    { codigo: '4_B1', nombre: 'Ficha B-1: Control de Asistencia PEC (6 semanas)', key: 'nota_b1' },
    { codigo: '4_B2', nombre: 'Ficha B-2: Concreción Curricular - Desarrollo del PDC', key: 'nota_b2' },
    { codigo: '4_B3', nombre: 'Ficha B-3: Valoración de la Clase Comunitaria', key: 'nota_b3' },
    { codigo: '4_B4', nombre: 'Ficha B-4: Centralizador Concreción Curricular', key: 'nota_b4' },
    { codigo: '4_B5', nombre: 'Ficha B-5: Seguimiento y Apoyo de la/el Docente Guía', key: 'nota_b5' },
    { codigo: '4_B6', nombre: 'Ficha B-6: Seguimiento y Apoyo Docente Tutor Acompañante', key: 'nota_b6' },
    { codigo: '4_B7', nombre: 'Ficha B-7: Diagnóstico Socioparticipativo UE/CEA/CEE', key: 'nota_b7' },
    { codigo: '4_C1', nombre: 'Ficha C-1: Evaluación Documento de Diseño Metodológico', key: 'nota_c1' },
    { codigo: '4_C2', nombre: 'Ficha C-2: Socialización del Diseño Metodológico', key: 'nota_c2' },
  ],
  "5to Año": [
    { codigo: '5_A1', nombre: 'Ficha A-1: Planificación y Elaboración de PDC', key: 'nota_a1' },
    { codigo: '5_B1', nombre: 'Ficha B-1: Control de Asistencia PEC (10 Semanas)', key: 'nota_b1' },
    { codigo: '5_B2', nombre: 'Ficha B-2: Concreción Curricular - Aplicación del PDC', key: 'nota_b2' },
    { codigo: '5_B3', nombre: 'Ficha B-3: Valoración de la Clase Comunitaria', key: 'nota_b3' },
    { codigo: '5_B4', nombre: 'Ficha B-4: Centralizador de Desarrollo de PDC', key: 'nota_b4' },
    { codigo: '5_B5', nombre: 'Ficha B-5: Centralizador Seguimiento y Apoyo Docente Guía', key: 'nota_b5' },
    { codigo: '5_B6', nombre: 'Ficha B-6: Apoyo y Seguimiento Docente Tutor Acompañante', key: 'nota_b6' },
    { codigo: '5_C1', nombre: 'Ficha C-1: Evaluación Documento Trabajo de Grado', key: 'nota_c1' },
    { codigo: '5_C2', nombre: 'Ficha C-2: Socialización Trabajo de Grado', key: 'nota_c2' },
  ]
};

// HELPER ROBUSTO DE NORMALIZACIÓN DE AÑO
const normalizarAnoStr = (cadena) => {
  if (!cadena) return '1er Año';
  const c = cadena.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (c.includes("5") || c.includes("quinto")) return "5to Año";
  if (c.includes("4") || c.includes("cuarto")) return "4to Año";
  if (c.includes("3") || c.includes("tercer") || c.includes("tercero")) return "3er Año";
  if (c.includes("2") || c.includes("segundo")) return "2do Año";
  if (c.includes("1") || c.includes("primer") || c.includes("primero")) return "1er Año";
  return "1er Año";
};

// HELPER PARA FORMATEAR Y REDONDEAR NOTAS A ENTEROS
const formatNota = (valor) => {
  const num = parseFloat(valor || 0);
  if (isNaN(num) || num === 0) return '—';
  return `${Math.round(num)} pts`;
};

export const MisCalificacionesEstudiante = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const [estudianteLogueado, setEstudianteLogueado] = useState(null);
  const [anoDetectado, setAnoDetectado] = useState('1er Año');
  const [datosCentralizador, setDatosCentralizador] = useState({});

  useEffect(() => {
    const cargarCalificacionesCentralizadas = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const savedUserStr = localStorage.getItem("user");
        if (!savedUserStr) {
          setErrorMessage("No se encontró una sesión activa de estudiante.");
          setLoading(false);
          return;
        }

        let student = JSON.parse(savedUserStr);
        let studentId = student.id || student.estudiante_id;

        // 1. OBTENER INFORMACIÓN FRESCA DESDE LA API DE ESTUDIANTES
        try {
          const estudiantesList = await studentService.getStudents();
          if (Array.isArray(estudiantesList)) {
            const studentApi = estudiantesList.find(u => 
              String(u.id) === String(studentId) || 
              String(u.ci) === String(student.ci) || 
              String(u.correo) === String(student.correo)
            );
            if (studentApi) {
              student = { ...student, ...studentApi };
              studentId = studentApi.id || studentId;
            }
          }
        } catch (e) {
          console.warn("No se pudo refrescar el perfil desde la API de estudiantes, usando sesión local:", e);
        }

        setEstudianteLogueado(student);

        // 2. EXTRAER Y NORMALIZAR EL AÑO DE FORMACIÓN DE LA API
        const anoCrudo = student.ano_formacion || student.ano || student.curso || student.nivel || "";
        const anoEst = normalizarAnoStr(anoCrudo);
        setAnoDetectado(anoEst);

        if (!studentId) {
          setErrorMessage("Identificador del estudiante no válido.");
          setLoading(false);
          return;
        }

        // 3. CONSULTAR API DE CENTRALIZADOR SEGÚN EL AÑO DETECTADO
        let response = {};
        if (anoEst === "1er Año") {
          response = await centralizador1erAnoService.getByEstudiante(studentId);
        } else if (anoEst === "2do Año") {
          response = await centralizador2doAnoService.getByEstudiante(studentId);
        } else if (anoEst === "3er Año") {
          response = await centralizador3erAnoService.getByEstudiante(studentId);
        } else if (anoEst === "4to Año") {
          response = await centralizador4toAnoService.getByEstudiante(studentId);
        } else if (anoEst === "5to Año") {
          response = await centralizador5toAnoService.getByEstudiante(studentId);
        }

        setDatosCentralizador(response?.datos || response || {});

      } catch (err) {
        console.error("Error al cargar calificaciones del centralizador:", err);
        setErrorMessage("Error de conexión al obtener tus calificaciones.");
      } finally {
        setLoading(false);
      }
    };

    cargarCalificacionesCentralizadas();
  }, []);

  const fichasDelAno = ESTRUCTURA_CALIFICACIONES_POR_ANO[anoDetectado] || [];

  // Mapear desglose de notas por ficha con redondeo
  const calificacionesData = fichasDelAno.map(item => {
    const notaRaw = parseFloat(datosCentralizador[item.key] || 0);
    const notaRedondeada = Math.round(notaRaw);
    return {
      fichaCodigo: item.codigo,
      fichaNombre: item.nombre,
      nota: notaRedondeada,
      estado: notaRedondeada >= 51 ? 'Aprobado' : (notaRedondeada > 0 ? 'Reprobado' : 'Pendiente')
    };
  });

  // Nota final acumulada del centralizador redondeada
  const notaFinalRaw = parseFloat(
    datosCentralizador.promedio_numeral || 
    datosCentralizador.promedio_final_2 || 
    datosCentralizador.promedio_final_1 || 
    datosCentralizador.promedio_final || 
    datosCentralizador.puntaje_final || 
    0
  );

  const notaFinalCentralizador = Math.round(notaFinalRaw);
  const esAprobadoFinal = notaFinalCentralizador >= 51;

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO INSTITUCIONAL */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <Award size={14} className="text-[#8C731A]" /> Historial Académico IEPC-PEC
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Mis Calificaciones
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Resumen cuantitativo de evaluaciones acumuladas y registrados en el Centralizador Oficial ({anoDetectado}).
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 p-5 backdrop-blur-md border border-white/15 text-center shrink-0">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-[#F3EFCF]">
              Promedio Final Centralizador
            </span>
            <span className="block font-mono text-3xl font-black text-white tracking-wider mt-1">
              {formatNota(notaFinalCentralizador)}
            </span>
            <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-extrabold border ${
              esAprobadoFinal 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}>
              {esAprobadoFinal ? 'Aprobado' : 'Reprobado / En curso'}
            </span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={18} />
          {errorMessage}
        </div>
      )}

      {/* TARJETA DE DATOS DEL ESTUDIANTE LOGUEADO */}
      {estudianteLogueado && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-[#801B28]">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-base">
                {estudianteLogueado.nombre} {estudianteLogueado.apellido}
              </h2>
              <span className="text-xs font-mono text-slate-500 font-bold block">
                C.I.: {estudianteLogueado.ci || 'S/N'} | Usuario: {estudianteLogueado.username}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-black uppercase">
              {anoDetectado}
            </span>
          </div>
        </div>
      )}

      {/* TABLA DE CALIFICACIONES DESGLOSADAS POR FICHA */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-900">DESGLOSE DE NOTAS POR FICHA DE EVALUACIÓN</h2>
          <p className="text-xs text-slate-400">Escala oficial de calificación de 1 a 100 puntos</p>
        </div>

        {loading ? (
          <div className="py-12 text-center font-bold text-slate-500 text-xs">
            <Loader2 className="animate-spin inline mr-2 text-[#801B28]" size={18} />
            Cargando calificaciones del centralizador...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Ficha Pedagógica</th>
                  <th className="py-3.5 px-4 font-mono text-center">Calificación Obt.</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {calificacionesData.map((item) => (
                  <tr key={item.fichaCodigo} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-black text-[#801B28] px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-100 shrink-0">
                          {item.fichaCodigo}
                        </span>
                        <div>
                          <span className="block font-bold text-slate-900">{item.fichaNombre}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-center text-sm text-emerald-700">
                      {formatNota(item.nota)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.estado === 'Aprobado' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 size={12} /> Aprobado
                        </span>
                      ) : item.estado === 'Reprobado' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">
                          <XCircle size={12} /> Reprobado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600">
                          Sin Evaluar
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};