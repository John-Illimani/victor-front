import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  XCircle,
  Clock, 
  Sparkles, 
  Calendar, 
  FileCheck2, 
  Loader2,
  UserCheck,
  UserX,
  School,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { studentService } from '../../services/studentService';
import { centralizador1erAnoService } from '../../services/fichas/1año/centralizador1erAnoService';
import { centralizador2doAnoService } from '../../services/fichas/2año/centralizador2doAnoService';
import { centralizador3erAnoService } from '../../services/fichas/3año/centralizador3erAnoService';
import { centralizador4toAnoService } from '../../services/fichas/4año/centralizador4toAnoService';
import { centralizador5toAnoService } from '../../services/fichas/5año/centralizador5toAnoService';

const normalizarAnoStr = (cadena) => {
  if (!cadena) return '1er Año';
  const c = cadena.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (c.includes("1") || c.includes("primer")) return "1er Año";
  if (c.includes("2") || c.includes("segundo")) return "2do Año";
  if (c.includes("3") || c.includes("tercer")) return "3er Año";
  if (c.includes("4") || c.includes("cuarto")) return "4to Año";
  if (c.includes("5") || c.includes("quinto")) return "5to Año";
  return "1er Año";
};

const formatNota = (valor) => {
  const num = parseFloat(valor || 0);
  if (isNaN(num) || num === 0) return '0.0';
  return Number.isInteger(num) ? `${num}.0` : `${num.toFixed(1)}`;
};

export const EstudianteDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const [resumenAcademico, setResumenAcademico] = useState({
    promedioGeneral: 0,
    especialidad: 'Sin Asignar',
    docenteAcompanante: null,
    docenteGuia: null,
    unidadEducativa: 'Sin Asignar'
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Llamada directa al nuevo método del servicio
        const profileData = await studentService.getMyStudentProfile();
        setCurrentUser(profileData);

        const studentId = profileData.id;
        const anoEst = normalizarAnoStr(profileData.ano_formacion);

        // Cargar nota del centralizador según el año de formación
        let centralRes = {};
        if (studentId) {
          if (anoEst === "1er Año") centralRes = await centralizador1erAnoService.getByEstudiante(studentId);
          else if (anoEst === "2do Año") centralRes = await centralizador2doAnoService.getByEstudiante(studentId);
          else if (anoEst === "3er Año") centralRes = await centralizador3erAnoService.getByEstudiante(studentId);
          else if (anoEst === "4to Año") centralRes = await centralizador4toAnoService.getByEstudiante(studentId);
          else if (anoEst === "5to Año") centralRes = await centralizador5toAnoService.getByEstudiante(studentId);
        }

        const datosCentral = centralRes?.datos || {};
        const notaFinal = parseFloat(
          datosCentral.promedio_numeral || datosCentral.promedio_final || datosCentral.puntaje_final || 0
        );

        // Construir nombres de los docentes a partir del JOIN
        const nombreDA = profileData.da_nombre 
          ? `${profileData.da_nombre} ${profileData.da_apellido || ''}`.trim() 
          : null;

        const nombreDG = profileData.dg_nombre 
          ? `${profileData.dg_nombre} ${profileData.dg_apellido || ''}`.trim() 
          : null;

        setResumenAcademico({
          promedioGeneral: notaFinal,
          especialidad: profileData.especialidad || 'Educación Primaria Comunitaria Vocacional',
          docenteAcompanante: nombreDA,
          docenteGuia: nombreDG,
          unidadEducativa: profileData.unidad_educativa_nombre || profileData.esfm_ua || 'ESFM/UA - El Alto'
        });

      } catch (err) {
        console.error("Error al cargar datos del estudiante:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const formatDate = (date) => {
    const str = date.toLocaleDateString('es-BO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const anoEstudiante = normalizarAnoStr(currentUser?.ano_formacion);
  const esAprobado = resumenAcademico.promedioGeneral >= 51;

  return (
    <div className="space-y-6 font-sans">
      {/* BANNER ENCABEZADO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <GraduationCap size={14} className="text-[#8C731A]" /> Estudiante Practicante ESFM/UA
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Bienvenida(o), {currentUser ? `${currentUser.nombre || ''} ${currentUser.apellido || ''}`.trim() : 'Estudiante'}
              <Sparkles size={28} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium">
              <span>Cód: <strong className="text-white font-mono">{currentUser?.ci || 'S/C'}</strong></span>
              <span>•</span>
              <span>Especialidad: <strong className="text-white">{resumenAcademico.especialidad}</strong></span>
              <span>•</span>
              <span>Año: <strong className="text-[#F3EFCF]">{anoEstudiante}</strong></span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="flex w-full sm:w-auto items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/15 shadow-inner">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#8C731A] text-white shadow-lg">
                <Clock size={24} />
              </div>
              <div>
                <span className="block font-mono text-xl font-black text-white tracking-wider">{formatTime(time)}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#F3EFCF]">Hora Oficial</span>
              </div>
            </div>

            <div className="flex w-full sm:w-auto items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/15 shadow-inner">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#801B28] text-white shadow-lg">
                <Calendar size={22} />
              </div>
              <div>
                <span className="block text-xs font-bold text-white">{formatDate(time)}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Gestión 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE DATOS DE DOCENTES Y CALIFICACIÓN */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#801B28]">INFORMACIÓN INSTITUCIONAL</span>
            <h2 className="text-xl font-black text-slate-900 mt-1">RESUMEN ACADÉMICO IEPC-PEC</h2>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/estudiante/mis-actas" className="rounded-2xl bg-slate-100 px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1.5">
              <FileCheck2 size={15} /> [ Ver mis actas ]
            </Link>
            <Link to="/estudiante/mis-calificaciones" className="rounded-2xl bg-[#801B28] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-[#a32334] transition-all flex items-center gap-1.5 shadow-md">
              <Award size={15} /> [ Ver mis calificaciones ]
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center font-bold text-slate-500 text-xs">
            <Loader2 className="animate-spin inline mr-2 text-[#801B28]" size={18} />
            Cargando expediente académico y asignaciones de tutoría...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* PROMEDIO */}
            <div className={`p-5 rounded-3xl border space-y-2 relative overflow-hidden ${esAprobado ? 'bg-emerald-50/60 border-emerald-200' : 'bg-amber-50/60 border-amber-200'}`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Promedio Acumulado</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1 ${esAprobado ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {esAprobado ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                  {esAprobado ? 'APROBADO' : 'EN EVALUACIÓN'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-slate-900">{formatNota(resumenAcademico.promedioGeneral)}</span>
                <span className="text-xs font-bold text-slate-500">/ 100 pts</span>
              </div>
            </div>

            {/* DOCENTE ACOMPAÑANTE */}
            <div className="p-5 rounded-3xl border border-slate-200 bg-slate-50/60 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Docente Acompañante ESFM</span>
              {resumenAcademico.docenteAcompanante ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
                    <UserCheck size={16} className="text-emerald-600 shrink-0" />
                    <span className="truncate">{resumenAcademico.docenteAcompanante}</span>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-extrabold">Asignado</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-rose-700 font-extrabold text-xs">
                    <UserX size={16} className="text-rose-500 shrink-0" />
                    <span>Sin Asignar</span>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[9px] font-extrabold">Pendiente ESFM</span>
                </div>
              )}
            </div>

            {/* DOCENTE GUÍA */}
            <div className="p-5 rounded-3xl border border-slate-200 bg-slate-50/60 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Docente Guía Titular U.E.</span>
              {resumenAcademico.docenteGuia ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
                    <School size={16} className="text-emerald-600 shrink-0" />
                    <span className="truncate">{resumenAcademico.docenteGuia}</span>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-extrabold">Asignado</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-rose-700 font-extrabold text-xs">
                    <UserX size={16} className="text-rose-500 shrink-0" />
                    <span>Sin Asignar</span>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[9px] font-extrabold">Pendiente U.E.</span>
                </div>
              )}
            </div>

            {/* ESPECIALIDAD */}
            <div className="p-5 rounded-3xl border border-slate-200 bg-slate-50/60 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Especialidad & Asignación</span>
              <div className="flex items-center gap-2 text-slate-900 font-black text-xs">
                <BookOpen size={16} className="text-[#801B28] shrink-0" />
                <span className="truncate">{resumenAcademico.especialidad}</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium truncate">{resumenAcademico.unidadEducativa}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};