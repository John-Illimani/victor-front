import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Calendar, 
  FileCheck2, 
  ChevronRight,
  School
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EstudianteDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error cargando datos del estudiante", e);
      }
    }
    return () => clearInterval(timer);
  }, []);

  // Datos consolidados del expediente del estudiante
  const datosEstudiante = {
    codigo: 'EST-026',
    especialidad: 'Educación Primaria Comunitaria Vocacional',
    ano: '2.º Año',
    gestion: '2026',
    progreso: 90,
    fichasCompletadas: 5,
    fichasPendientes: 1,
    promedioActual: 88.8
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-BO', { 
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
    });
  };

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const str = date.toLocaleDateString('es-BO', options);
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO INSTITUCIONAL */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <GraduationCap size={14} className="text-[#8C731A]" /> Estudiante Practicante ESFM/UA
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Bienvenida, {currentUser ? `${currentUser.nombre || ''} ${currentUser.apellido || ''}`.trim() || currentUser.username : 'María López'}
              <Sparkles size={28} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium">
              <span>Código: <strong className="text-white font-mono">{datosEstudiante.codigo}</strong></span>
              <span>•</span>
              <span>Especialidad: <strong className="text-white">{datosEstudiante.especialidad}</strong></span>
              <span>•</span>
              <span>Año: <strong className="text-[#F3EFCF]">{datosEstudiante.ano}</strong></span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="flex w-full sm:w-auto items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/15 shadow-inner">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#8C731A] text-white shadow-lg">
                <Clock size={24} />
              </div>
              <div>
                <span className="block font-mono text-xl font-black text-white tracking-wider">
                  {formatTime(time)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#F3EFCF]">
                  Hora Oficial
                </span>
              </div>
            </div>

            <div className="flex w-full sm:w-auto items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/15 shadow-inner">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#801B28] text-white shadow-lg">
                <Calendar size={22} />
              </div>
              <div>
                <span className="block text-xs font-bold text-white">
                  {formatDate(time)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  Gestión {datosEstudiante.gestion}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ESTADO DE MI IEPC-PEC (PROGRESO Y MÉTRICAS) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#801B28]">
              RESUMEN DE MI PRÁCTICA
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1">ESTADO DE MI IEPC-PEC</h2>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/estudiante/mis-actas"
              className="rounded-2xl bg-slate-100 px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1.5"
            >
              <FileCheck2 size={15} /> [ Ver mis actas ]
            </Link>
            <Link
              to="/estudiante/mis-calificaciones"
              className="rounded-2xl bg-[#801B28] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-[#a32334] transition-all flex items-center gap-1.5 shadow-md"
            >
              <Award size={15} /> [ Ver mis calificaciones ]
            </Link>
          </div>
        </div>

        {/* BARRA DE PROGRESO */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-600">Progreso general completado:</span>
            <span className="font-mono text-sm text-[#801B28] font-black">{datosEstudiante.progreso}%</span>
          </div>
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200 p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-[#801B28] to-[#8C731A] rounded-full transition-all duration-500" 
              style={{ width: `${datosEstudiante.progreso}%` }}
            />
          </div>
        </div>

        {/* TARJETAS DE INDICADORES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Fichas Completadas</span>
            <span className="text-2xl font-black text-slate-900 font-mono flex items-center gap-2">
              <CheckCircle2 size={22} className="text-emerald-600" />
              {datosEstudiante.fichasCompletadas} Fichas
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Fichas Pendientes</span>
            <span className="text-2xl font-black text-slate-900 font-mono flex items-center gap-2">
              <Clock size={22} className="text-amber-600" />
              {datosEstudiante.fichasPendientes} Ficha
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="text-emerald-800 block text-[10px] font-bold uppercase">Promedio Actual</span>
            <span className="text-2xl font-black text-emerald-900 font-mono flex items-center gap-2">
              <Award size={22} className="text-emerald-700" />
              {datosEstudiante.promedioActual} pts
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};