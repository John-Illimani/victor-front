import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  Blocks, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Calendar,
  Activity,
  UserCheck,
  GraduationCap,
  Sparkles,
  PieChart,
  History,
  Search,
  ArrowRight
} from 'lucide-react';

export const AdminDashboard = () => {
  // Estado para el usuario logueado
  const [currentUser, setCurrentUser] = useState(null);
  
  // Estado para fecha y hora en tiempo real
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Reloj en vivo
    const timer = setInterval(() => setTime(new Date()), 1000);

    // Carga de usuario desde localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error cargando usuario", e);
      }
    }

    return () => clearInterval(timer);
  }, []);

  // Formateadores de fecha y hora
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

  // 1. Tarjetas Superiores: Usuarios y Actas (8 KPIs solicitados)
  const kpiStats = [
    { 
      title: 'Total Estudiantes', 
      value: '1,240', 
      badge: 'Matriculados',
      icon: GraduationCap, 
      color: 'from-blue-600 to-indigo-700',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50'
    },
    { 
      title: 'Docentes Acompañantes', 
      value: '86', 
      badge: 'ESFM / UA',
      icon: UserCheck, 
      color: 'from-emerald-600 to-teal-700', 
      textColor: 'text-emerald-600',
      bgLight: 'bg-emerald-50'
    },
    { 
      title: 'Docentes Guía', 
      value: '142', 
      badge: 'UE / CEA / CEE',
      icon: Users, 
      color: 'from-violet-600 to-purple-700', 
      textColor: 'text-violet-600',
      bgLight: 'bg-violet-50'
    },
    { 
      title: 'Total Usuarios', 
      value: '1,478', 
      badge: 'Sistema',
      icon: ShieldCheck, 
      color: 'from-slate-700 to-slate-900', 
      textColor: 'text-slate-700',
      bgLight: 'bg-slate-100'
    },
    { 
      title: 'Actas Registradas', 
      value: '348', 
      badge: 'Total General',
      icon: FileText, 
      color: 'from-[#8C731A] to-[#B39324]',
      textColor: 'text-[#8C731A]',
      bgLight: 'bg-[#8C731A]/10'
    },
    { 
      title: 'Actas Validadas', 
      value: '215', 
      badge: 'Concluidas',
      icon: CheckCircle2, 
      color: 'from-[#6B9E1E] to-[#8BC34A]', 
      textColor: 'text-[#6B9E1E]',
      bgLight: 'bg-[#6B9E1E]/10'
    },
    { 
      title: 'Actas en Revisión', 
      value: '88', 
      badge: 'En Proceso',
      icon: Clock, 
      color: 'from-amber-500 to-amber-600', 
      textColor: 'text-amber-600',
      bgLight: 'bg-amber-500/10'
    },
    { 
      title: 'Actas Pendientes / Obs.', 
      value: '45', 
      badge: 'Revisión Req.',
      icon: AlertTriangle, 
      color: 'from-[#801B28] to-[#A32334]', 
      textColor: 'text-[#801B28]',
      bgLight: 'bg-[#801B28]/10'
    },
  ];

  // Datos de Actas por Gestión
  const gestionesData = [
    { gestion: 'Gestión 2025', cantidad: 310, porcentaje: 70, color: 'bg-slate-600' },
    { gestion: 'Gestión 2026', cantidad: 348, porcentaje: 90, color: 'bg-[#801B28]' },
  ];

  // Datos de Actas por Estado
  const estadosActasData = [
    { estado: 'Validadas', cantidad: 215, porcentaje: 61, color: 'bg-[#6B9E1E]' },
    { estado: 'En revisión', cantidad: 88, porcentaje: 25, color: 'bg-amber-500' },
    { estado: 'Pendientes', cantidad: 28, porcentaje: 8, color: 'bg-blue-500' },
    { estado: 'Observadas', cantidad: 17, porcentaje: 6, color: 'bg-[#801B28]' },
  ];

  // Datos de Actividad Reciente (Trazabilidad)
  const recentActivity = [
    { id: 1, usuario: 'Docente Acompañante', accion: 'Actualizó F-2', fecha: '05/09/2026 10:42', modulo: 'Actas', badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 2, usuario: 'Administrador', accion: 'Registró usuario U003', fecha: '05/09/2026 09:15', modulo: 'Usuarios', badgeColor: 'bg-blue-100 text-blue-800' },
    { id: 3, usuario: 'Docente Guía', accion: 'Firmó digitalmente F-1', fecha: '04/09/2026 18:30', modulo: 'Actas', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { id: 4, usuario: 'Administrador', accion: 'Validó Hash Blockchain ACT-2026-02', fecha: '04/09/2026 15:10', modulo: 'Blockchain', badgeColor: 'bg-purple-100 text-purple-800' },
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER PRINCIPAL CON SALUDO, RELOJ Y FECHA */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        
        {/* Efectos de Iluminación de Fondo */}
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#8C731A]/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-[#801B28]/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Lado Izquierdo: Usuario y Bienvenida */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <ShieldCheck size={14} className="text-[#6B9E1E]" /> Portal Administrador IEPC-PEC
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Bienvenido, {currentUser ? `${currentUser.nombre || ''} ${currentUser.apellido || ''}`.trim() || currentUser.username : 'Administrador'}
              <Sparkles size={28} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Resumen general del sistema de investigación y práctica educativa. Monitoreo integral de datos académicos, usuarios y trazabilidad en Blockchain.
            </p>
          </div>

          {/* Lado Derecho: FECHA Y HORA */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {/* Tarjeta de Hora */}
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

            {/* Tarjeta de Fecha */}
            <div className="flex w-full sm:w-auto items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/15 shadow-inner">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#801B28] text-white shadow-lg">
                <Calendar size={22} />
              </div>
              <div>
                <span className="block text-xs font-bold text-white">
                  {formatDate(time)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  Gestión Académica 2026
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Barra inferior de estado rápido */}
        <div className="mt-6 flex flex-wrap items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-300 gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6B9E1E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#6B9E1E]"></span>
            </span>
            <span className="font-semibold">Base PostgreSQL Sincronizada</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 font-mono text-[#F3EFCF]">
              <Activity size={14} className="text-[#6B9E1E]" /> Latencia Red: 14ms
            </span>
            <span className="hidden sm:inline-block text-slate-500">|</span>
            <span className="font-mono text-slate-400">Seguridad: JWT + Hash Blockchain</span>
          </div>
        </div>

      </div>

      {/* TARJETAS DE MÉTRICAS (8 TARJETAS SOLICITADAS) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <h3 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
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

      {/* SECCIÓN DE GRÁFICOS PARTE CENTRAL */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* GRÁFICO 1: ACTAS POR GESTIÓN */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h3 className="text-base font-black text-[#1A1A1A] flex items-center gap-2">
                <BarChart3 size={18} className="text-[#8C731A]" /> 
                Actas por Gestión
              </h3>
              <p className="text-xs text-slate-400">Comparativa histórica de documentos generados</p>
            </div>
          </div>

          <div className="space-y-6">
            {gestionesData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800 font-extrabold">{item.gestion}</span>
                  <span className="font-mono text-slate-900 font-black">{item.cantidad} actas</span>
                </div>
                
                <div className="h-4 w-full rounded-full bg-slate-100 p-0.5 overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full ${item.color} transition-all duration-700 ease-out shadow-sm`}
                    style={{ width: `${item.porcentaje}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRÁFICO 2: ACTAS POR ESTADO */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h3 className="text-base font-black text-[#1A1A1A] flex items-center gap-2">
                <PieChart size={18} className="text-[#801B28]" /> 
                Actas por Estado
              </h3>
              <p className="text-xs text-slate-400">Distribución de actas en el flujo de aprobación</p>
            </div>
          </div>

          <div className="space-y-4">
            {estadosActasData.map((item, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    {item.estado}
                  </span>
                  <span className="font-mono text-slate-900">{item.cantidad} ({item.porcentaje}%)</span>
                </div>
                
                <div className="h-3 w-full rounded-full bg-slate-100 p-0.5 overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.porcentaje}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECCIÓN PARTE INFERIOR: ACTIVIDAD RECIENTE & BLOCKCHAIN */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* TABLA DE ACTIVIDAD RECIENTE (2 COLS) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-base font-black text-[#1A1A1A] flex items-center gap-2">
                <History size={18} className="text-[#8C731A]" /> 
                Actividad Reciente
              </h3>
              <p className="text-xs text-slate-400">Registro de acciones para trazabilidad</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Usuario</th>
                  <th className="py-2.5 px-3">Acción</th>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Módulo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {recentActivity.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{row.usuario}</td>
                    <td className="py-3 px-3">{row.accion}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{row.fecha}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.badgeColor}`}>
                        {row.modulo}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* NODO BLOCKCHAIN E INTEGRIDAD (1 COL) */}
        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#6B9E1E]/20 text-[#6B9E1E] border border-[#6B9E1E]/40">
                  <Blocks size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Integridad Blockchain</h3>
                  <p className="text-[11px] text-slate-400">Auditoría Hash Inmutable</p>
                </div>
              </div>
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#6B9E1E] animate-ping" />
            </div>

            <div className="space-y-4 my-4">
              <div className="rounded-2xl bg-white/5 p-4 border border-white/5 space-y-1">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Hashes SHA-256 Registrados</span>
                <span className="block text-2xl font-black text-white font-mono">215 / 215</span>
                <span className="text-[10px] text-[#6B9E1E] font-bold">100% Sincronizado con PostgreSQL</span>
              </div>

              <div className="rounded-2xl bg-white/5 p-4 border border-white/5 space-y-1">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Tiempo de Confirmación</span>
                <span className="block text-xl font-black text-[#8C731A] font-mono">0.82s</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-[#8C731A]/30 to-[#801B28]/30 p-3.5 border border-white/10 text-center">
            <p className="text-xs font-bold text-[#F3EFCF]">Seguridad Garantizada</p>
            <p className="text-[10px] text-slate-300 mt-0.5">PostgreSQL respalda datos; Blockchain inmutabilidad.</p>
          </div>
        </div>

      </div>

    </div>
  );
};