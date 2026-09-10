import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ClipboardCheck, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  School,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DocenteGuiaDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error cargando usuario docente guía", e);
      }
    }
    return () => clearInterval(timer);
  }, []);

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

  // KPIs del Docente Guía
  const kpisGuia = [
    {
      title: 'Estudiantes asignados',
      value: '10',
      badge: 'En aula',
      icon: Users,
      color: 'from-[#8C731A] to-[#B39324]',
      textColor: 'text-[#8C731A]',
      bgLight: 'bg-[#8C731A]/10'
    },
    {
      title: 'Fichas pendientes',
      value: '3',
      badge: 'Por evaluar',
      icon: Clock,
      color: 'from-[#801B28] to-[#A32334]',
      textColor: 'text-[#801B28]',
      bgLight: 'bg-[#801B28]/10'
    },
    {
      title: 'Fichas completadas',
      value: '22',
      badge: 'Registradas',
      icon: CheckCircle2,
      color: 'from-[#6B9E1E] to-[#8BC34A]',
      textColor: 'text-[#6B9E1E]',
      bgLight: 'bg-[#6B9E1E]/10'
    },
    {
      title: 'Seguimientos realizados',
      value: '15',
      badge: 'Controles de aula',
      icon: TrendingUp,
      color: 'from-blue-600 to-indigo-600',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-600/10'
    }
  ];

  // Actividades pendientes del Docente Guía
  const actividadesPendientes = [
    { id: 1, estudiante: 'Estudiante 1 (María López)', ficha: 'F-2: Registro de Asistencia y PDC', estado: 'Pendiente', fecha: '08/09/2026' },
    { id: 2, estudiante: 'Estudiante 2 (Juan Carlos Pérez)', ficha: 'F-4: Valoración de Concreción Curricular', estado: 'Pendiente', fecha: '07/09/2026' },
    { id: 3, estudiante: 'Estudiante 3 (Sonia Aliaga)', ficha: 'F-2: Registro de Asistencia', estado: 'Pendiente', fecha: '06/09/2026' }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#8C731A]/20 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <School size={14} className="text-[#6B9E1E]" /> Docente Guía (Maestro Titular U.E.)
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Bienvenido, {currentUser ? `${currentUser.nombre || ''} ${currentUser.apellido || ''}`.trim() || currentUser.username : 'Lic. Roberto Mendoza'}
              <Sparkles size={28} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Unidad Educativa Franz Tamayo · Control de asistencia, seguimiento pedagógico y evaluación en aula.
            </p>
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
                  Gestión 2026
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TARJETAS DE KPIS EXCLUSIVOS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpisGuia.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#8C731A]/40"
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${stat.color}`} />

              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-md`}>
                  <Icon size={20} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${stat.bgLight} ${stat.textColor}`}>
                  {stat.badge}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                  {stat.value}
                </h3>
                <p className="text-xs font-bold text-slate-700">
                  {stat.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECCIÓN PRINCIPAL: ACTIVIDADES PENDIENTES */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* TABLA DE ACTIVIDADES PENDIENTES (2 COLS) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ClipboardCheck size={18} className="text-[#801B28]" />
                Actividades pendientes
              </h3>
              <p className="text-xs text-slate-400">Evaluaciones y registros pendientes de validación en aula</p>
            </div>

            <Link 
              to="/docente-guia/fichas-asignadas" 
              className="text-xs font-bold text-[#801B28] hover:underline flex items-center gap-1"
            >
              Ver fichas <ChevronRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Estudiante</th>
                  <th className="py-3 px-4">Ficha</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {actividadesPendientes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.estudiante}</td>
                    <td className="py-3.5 px-4 font-bold text-[#8C731A]">{item.ficha}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                        <Clock size={12} /> {item.estado}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        to="/docente-guia/fichas-asignadas"
                        className="rounded-xl bg-[#801B28] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#a32334] transition-all"
                      >
                        Evaluar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ACCESO RÁPIDO A REGISTRO DE ASISTENCIA (1 COL) */}
        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#6B9E1E]/20 text-[#6B9E1E] border border-[#6B9E1E]/40">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Control de Aula</h3>
                <p className="text-[11px] text-slate-400">Seguimiento Directo</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed my-2">
              Registra atrasos, asistencias y la aplicación práctica del PDC de los practicantes asignados a tu aula.
            </p>
          </div>

          <Link
            to="/docente-guia/fichas-asignadas"
            className="w-full text-center rounded-2xl bg-[#801B28] py-3 text-xs font-extrabold text-white hover:bg-[#a32334] transition-all cursor-pointer block shadow-md"
          >
            Registrar Asistencia y Seguimiento
          </Link>
        </div>

      </div>

    </div>
  );
};