import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Calendar, 
  Activity, 
  UserCheck, 
  GraduationCap, 
  Sparkles, 
  BarChart3, 
  Clock, 
  Loader2,
  Award,
  BookOpen
} from 'lucide-react';

// SERVICIOS DE API REALES
import { userService } from '../../services/userService';
import { studentService } from '../../services/studentService';
import { teacherService } from '../../services/teacherService';
import { guideService } from '../../services/guideService';
import { gestionService } from '../../services/gestionService';
import { especialidadService } from '../../services/especialidadService';

export const AdminDashboard = () => {
  // ESTADOS DE USUARIO LOGUEADO Y RELOJ EN TIEMPO REAL
  const [currentUser, setCurrentUser] = useState(null);
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // ESTADOS CON DATOS REALES DE BASE DE DATOS
  const [metrics, setMetrics] = useState({
    estudiantes: 0,
    docentesAcompanantes: 0,
    docentesGuia: 0,
    totalUsuarios: 0,
    gestionesCount: 0,
    especialidadesCount: 0
  });

  const [gestionesList, setGestionesList] = useState([]);
  const [especialidadesList, setEspecialidadesList] = useState([]);

  useEffect(() => {
    // Reloj en tiempo real
    const timer = setInterval(() => setTime(new Date()), 1000);

    // Cargar información del usuario logueado desde localStorage
    const loadUserData = () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Error al parsear el usuario del localStorage", e);
        }
      }
    };

    loadUserData();
    window.addEventListener("storage", loadUserData);

    // CONSULTAS A LAS APIS PARA OBTENER DATOS REALES
    const fetchRealData = async () => {
      setLoading(true);
      try {
        const [estudRes, teachRes, guideRes, userRes, gestRes, espRes] = await Promise.allSettled([
          studentService.getStudents(),
          teacherService.getTeachers(),
          guideService.getGuides(),
          userService.getUsers(),
          gestionService.getGestiones(),
          especialidadService.getEspecialidades()
        ]);

        // 1. Estudiantes
        const totalEstud = estudRes.status === 'fulfilled' 
          ? (Array.isArray(estudRes.value) ? estudRes.value.length : estudRes.value?.estudiantes?.length || 0) 
          : 0;

        // 2. Docentes Acompañantes
        const totalTeach = teachRes.status === 'fulfilled' 
          ? (Array.isArray(teachRes.value) ? teachRes.value.length : teachRes.value?.docentes?.length || 0) 
          : 0;

        // 3. Docentes Guía
        const totalGuides = guideRes.status === 'fulfilled' 
          ? (Array.isArray(guideRes.value) ? guideRes.value.length : guideRes.value?.docentes?.length || 0) 
          : 0;

        // 4. Usuarios Totales
        const totalUsers = userRes.status === 'fulfilled' 
          ? (Array.isArray(userRes.value) ? userRes.value.length : 0) 
          : 0;

        // 5. Gestiones Académicas
        const listGest = gestRes.status === 'fulfilled' 
          ? (Array.isArray(gestRes.value) ? gestRes.value : gestRes.value?.gestiones || []) 
          : [];

        // 6. Especialidades
        const listEsp = espRes.status === 'fulfilled' 
          ? (Array.isArray(espRes.value) ? espRes.value : espRes.value?.especialidades || []) 
          : [];

        setGestionesList(listGest);
        setEspecialidadesList(listEsp);

        setMetrics({
          estudiantes: totalEstud,
          docentesAcompanantes: totalTeach,
          docentesGuia: totalGuides,
          totalUsuarios: totalUsers,
          gestionesCount: listGest.length,
          especialidadesCount: listEsp.length
        });

      } catch (err) {
        console.error("Error al cargar métricas reales:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();

    return () => {
      clearInterval(timer);
      window.removeEventListener("storage", loadUserData);
    };
  }, []);

  // Formateadores
  const formatTime = (date) => {
    return date.toLocaleTimeString('es-BO', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const str = date.toLocaleDateString('es-BO', options);
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getNombreLogueado = () => {
    if (!currentUser) return 'Administrador';
    const nombreCompleto = `${currentUser.nombre || ''} ${currentUser.apellido || ''}`.trim();
    return nombreCompleto || currentUser.username || 'Administrador';
  };

  // TARJETAS DE MÉTRICAS REALES DE LA BASE DE DATOS
  const kpiStats = [
    { 
      title: 'Estudiantes Matriculados', 
      value: loading ? null : metrics.estudiantes, 
      badge: 'Nivel Superior',
      icon: GraduationCap, 
      color: 'from-blue-600 to-indigo-700',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50'
    },
    { 
      title: 'Docentes Acompañantes', 
      value: loading ? null : metrics.docentesAcompanantes, 
      badge: 'ESFM / UA',
      icon: UserCheck, 
      color: 'from-emerald-600 to-teal-700', 
      textColor: 'text-emerald-600',
      bgLight: 'bg-emerald-50'
    },
    { 
      title: 'Docentes Guía', 
      value: loading ? null : metrics.docentesGuia, 
      badge: 'UE / CEA / CEE',
      icon: Users, 
      color: 'from-violet-600 to-purple-700', 
      textColor: 'text-violet-600',
      bgLight: 'bg-violet-50'
    },
    { 
      title: 'Usuarios Registrados', 
      value: loading ? null : metrics.totalUsuarios, 
      badge: 'Plataforma',
      icon: ShieldCheck, 
      color: 'from-slate-700 to-slate-900', 
      textColor: 'text-slate-700',
      bgLight: 'bg-slate-100'
    },
    { 
      title: 'Gestiones Configuradas', 
      value: loading ? null : metrics.gestionesCount, 
      badge: 'Académicas',
      icon: Calendar, 
      color: 'from-[#8C731A] to-[#B39324]',
      textColor: 'text-[#8C731A]',
      bgLight: 'bg-[#8C731A]/10'
    },
    { 
      title: 'Especialidades', 
      value: loading ? null : metrics.especialidadesCount, 
      badge: 'Habilitadas',
      icon: Award, 
      color: 'from-[#801B28] to-[#A32334]', 
      textColor: 'text-[#801B28]',
      bgLight: 'bg-[#801B28]/10'
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO CON NOMBRE REAL Y HORA EN VIVO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#8C731A]/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-[#801B28]/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <ShieldCheck size={14} className="text-[#6B9E1E]" /> Módulo Administrador IEPC-PEC
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Bienvenido, {getNombreLogueado()}
              <Sparkles size={28} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Consola de administración general del sistema IEPC-PEC. Control de catálogos institucionales, asignación de docentes y gestión de usuarios.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {/* HORA OFICIAL */}
            <div className="flex w-full sm:w-auto items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/15 shadow-inner">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#8C731A] text-white shadow-lg">
                <Clock size={24} />
              </div>
              <div>
                <span className="block font-mono text-xl font-black text-white tracking-wider">
                  {formatTime(time)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#F3EFCF]">
                  Hora Oficial Bolivia
                </span>
              </div>
            </div>

            {/* FECHA */}
            <div className="flex w-full sm:w-auto items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/15 shadow-inner">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#801B28] text-white shadow-lg">
                <Calendar size={22} />
              </div>
              <div>
                <span className="block text-xs font-bold text-white">
                  {formatDate(time)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  Gestión Institucional
                </span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-300 gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6B9E1E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#6B9E1E]"></span>
            </span>
            <span className="font-semibold">Servidor PostgreSQL Conectado</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 font-mono text-[#F3EFCF]">
              <Activity size={14} className="text-[#6B9E1E]" /> API REST Sincronizada
            </span>
          </div>
        </div>

      </div>

      {/* TARJETAS DE MÉTRICAS GENERALES REALES */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpiStats.map((stat, idx) => {
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
                <h3 className="text-2xl font-black text-slate-900 tracking-tight font-mono flex items-center gap-2">
                  {stat.value === null ? (
                    <Loader2 className="animate-spin text-slate-400" size={20} />
                  ) : (
                    stat.value.toLocaleString()
                  )}
                </h3>
                <p className="text-xs font-bold text-slate-700">
                  {stat.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECCIÓN DATOS REALES: GESTIONES Y ESPECIALIDADES */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* BLOQUE 1: GESTIONES ACADÉMICAS REGISTRADAS */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-base font-black text-[#1A1A1A] flex items-center gap-2">
                <BarChart3 size={18} className="text-[#8C731A]" /> 
                Gestiones Académicas
              </h3>
              <p className="text-xs text-slate-400">Registros obtenidos de `gestionService`</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#801B28] bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
              {gestionesList.length} Gestiones
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs font-bold text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="animate-spin text-[#801B28]" size={18} /> Cargando gestiones...
            </div>
          ) : gestionesList.length > 0 ? (
            <div className="divide-y divide-slate-100 text-xs">
              {gestionesList.map((g, idx) => (
                <div key={g.id || idx} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-amber-50 text-[#8C731A] font-bold flex items-center justify-center font-mono">
                      #{idx + 1}
                    </div>
                    <div>
                      <span className="block font-extrabold text-slate-800">
                        Gestión {g.anio || g.gestion || 'S/G'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {g.descripcion || 'Sin descripción'}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    (g.estado === 'ACTIVA' || g.estado === 'Activa' || g.activo) 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {g.estado || (g.activo ? 'ACTIVA' : 'INACTIVA')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No hay gestiones registradas en la base de datos.
            </div>
          )}
        </div>

        {/* BLOQUE 2: ESPECIALIDADES HABILITADAS */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-base font-black text-[#1A1A1A] flex items-center gap-2">
                <BookOpen size={18} className="text-[#801B28]" /> 
                Especialidades
              </h3>
              <p className="text-xs text-slate-400">Registros obtenidos de `especialidadService`</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              {especialidadesList.length} Especialidades
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs font-bold text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="animate-spin text-[#801B28]" size={18} /> Cargando especialidades...
            </div>
          ) : especialidadesList.length > 0 ? (
            <div className="divide-y divide-slate-100 text-xs max-h-[280px] overflow-y-auto pr-1">
              {especialidadesList.map((esp, idx) => (
                <div key={esp.id || idx} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-rose-50 text-[#801B28] font-bold flex items-center justify-center font-mono">
                      {esp.codigo || `E${idx + 1}`}
                    </div>
                    <span className="font-extrabold text-slate-800">
                      {esp.nombre || esp.especialidad}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    {esp.area || 'Formación General'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No hay especialidades registradas en la base de datos.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};