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
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { teacherService } from '../../../services/teacherService';
import { userService } from '../../../services/userService';

export const DocenteGuiaDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [assignedStudents, setAssignedStudents] = useState([]);

  useEffect(() => {
    // Reloj dinámico
    const timer = setInterval(() => setTime(new Date()), 1000);

    // Cargar y refrescar usuario logueado + datos de aula
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const savedUserStr = localStorage.getItem("user");
        let userObj = savedUserStr ? JSON.parse(savedUserStr) : null;

        if (userObj) {
          // Rehidratación fresca del usuario si es posible
          try {
            const allUsers = await userService.getUsers();
            const list = Array.isArray(allUsers) ? allUsers : allUsers?.usuarios || [];
            const fresh = list.find(u => u.id === userObj.id || u.username === userObj.username);
            if (fresh) {
              userObj = fresh;
              localStorage.setItem("user", JSON.stringify(fresh));
            }
          } catch (e) {
            console.warn("Usando sesión de localStorage para el dashboard.");
          }

          setCurrentUser(userObj);

          // Cargar estudiantes practicantes asignados al aula
          const docenteId = userObj.id || userObj.docente_id;
          if (docenteId) {
            const res = await teacherService.getAssignedStudents(docenteId);
            const list = Array.isArray(res) ? res : res?.estudiantes || [];
            setAssignedStudents(list);
          }
        }
      } catch (err) {
        console.error("Error al cargar datos del Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

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

  // KPIs dinámicos orientados a Fichas de Aula
  const kpisGuia = [
    {
      title: 'Practicantes en Aula',
      value: assignedStudents.length,
      badge: 'Asignados',
      icon: Users,
      color: 'from-[#8C731A] to-[#B39324]',
      textColor: 'text-[#8C731A]',
      bgLight: 'bg-[#8C731A]/10'
    },
    {
      title: 'Fichas Habilitadas',
      value: currentUser?.formularios_habilitados 
        ? Object.entries(currentUser.formularios_habilitados).filter(([k, v]) => v && k.startsWith('ficha_')).length 
        : '0',
      badge: 'En Sistema',
      icon: Clock,
      color: 'from-[#801B28] to-[#A32334]',
      textColor: 'text-[#801B28]',
      bgLight: 'bg-[#801B28]/10'
    }
   
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO CON NOMBRE DINÁMICO DEL USUARIO LOGUEADO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#8C731A]/20 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <School size={14} className="text-[#6B9E1E]" /> Docente Guía (Maestro Titular U.E.)
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Bienvenido, {currentUser ? `${currentUser.nombre || ''} ${currentUser.apellido || ''}`.trim() || currentUser.username : 'Docente Guía'}
              <Sparkles size={28} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {currentUser?.unidad_educativa || 'Unidad Educativa Asignada'} · Control de asistencia, seguimiento pedagógico y evaluación de fichas en aula.
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

      {/* TARJETAS DE KPIS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
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
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono truncate">
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

      {/* SECCIÓN PRINCIPAL: NÓMINA DE PRACTICANTES Y EVALUACIÓN DE FICHAS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* NÓMINA DE PRACTICANTES EN AULA */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ClipboardCheck size={18} className="text-[#801B28]" />
                Practicantes en Aula
              </h3>
              <p className="text-xs text-slate-400">Estudiantes asignados para el desarrollo de la práctica docente en tu curso</p>
            </div>

            <Link 
              to="/docente-guia/fichas-asignadas" 
              className="text-xs font-bold text-[#801B28] hover:underline flex items-center gap-1"
            >
              Ir a Fichas <ChevronRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Estudiante Practicante</th>
                  <th className="py-3 px-4">C.I.</th>
                  <th className="py-3 px-4">Año</th>
                  <th className="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500 font-bold">
                      <Loader2 className="animate-spin inline mr-2 text-[#801B28]" size={18} />
                      Cargando practicantes asignados...
                    </td>
                  </tr>
                ) : assignedStudents.length > 0 ? (
                  assignedStudents.slice(0, 5).map((est, idx) => (
                    <tr key={est.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {est.nombre} {est.apellido}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-[#801B28]">
                        {est.ci || 'S/C'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {est.ano_formacion || '1er Año'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          to="/docente-guia/fichas-asignadas"
                          className="rounded-xl bg-[#801B28] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#a32334] transition-all inline-block"
                        >
                          Ficha
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400 font-medium">
                      No tienes practicantes registrados en tu aula actualmente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ACCESO RÁPIDO A EVALUACIÓN Y CONTROL DE AULA */}
        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#6B9E1E]/20 text-[#6B9E1E] border border-[#6B9E1E]/40">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Evaluación Continua</h3>
                <p className="text-[11px] text-slate-400">Control de Asistencia y PDC</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed my-2">
              Llenado de fichas de seguimiento, control diario de asistencia y valoración pedagógica del desarrollo de la clase del practicante.
            </p>
          </div>

          <Link
            to="/docente-guia/fichas-asignadas"
            className="w-full text-center rounded-2xl bg-[#801B28] py-3 text-xs font-extrabold text-white hover:bg-[#a32334] transition-all cursor-pointer block shadow-md"
          >
            Evaluar Fichas en Aula
          </Link>
        </div>

      </div>

    </div>
  );
};