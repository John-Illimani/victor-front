import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  School,
  FileText,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

// SERVICIOS DE API
import { teacherService } from '../../../services/teacherService';
import { userService } from '../../../services/userService';

export const DocenteAcompananteDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [time, setTime] = useState(new Date());

  // ESTADOS DE KPIS Y ACTIVIDADES DYNAMIC
  const [loading, setLoading] = useState(true);
  const [estudiantesAsignados, setEstudiantesAsignados] = useState([]);
  const [actividadesPendientes, setActividadesPendientes] = useState([]);
  const [stats, setStats] = useState({
    totalEstudiantes: 0
  });

  // RELOJ EN TIEMPO REAL Y CARGA DEL USUARIO AUTENTICADO
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const savedUserStr = localStorage.getItem("user");
        let userObj = savedUserStr ? JSON.parse(savedUserStr) : null;

        if (!userObj) {
          setLoading(false);
          return;
        }

        // 1. Rehidratar datos frescos del usuario desde la BD si es posible
        try {
          const allUsers = await userService.getUsers();
          const list = Array.isArray(allUsers) ? allUsers : allUsers?.usuarios || [];
          const found = list.find(u => u.id === userObj.id || u.username === userObj.username);
          if (found) {
            userObj = { ...userObj, ...found };
            localStorage.setItem("user", JSON.stringify(userObj));
          }
        } catch (e) {
          console.warn("Usando sesión guardada en localStorage.");
        }

        setCurrentUser(userObj);

        // 2. Obtener lista de estudiantes asignados al docente acompañante
        const docenteId = userObj.id || userObj.docente_id;
        if (docenteId) {
          const assignedData = await teacherService.getAssignedStudents(docenteId);
          const listaEst = Array.isArray(assignedData) ? assignedData : assignedData?.estudiantes || [];
          setEstudiantesAsignados(listaEst);

          // 3. Consolidado dinámico de actividades según los estudiantes asignados
          const pendientesList = [];
          for (const est of listaEst.slice(0, 5)) {
            pendientesList.push({
              id: est.id,
              estudiante: `${est.nombre || ''} ${est.apellido || ''}`.trim(),
              ficha: `Seguimiento Práctica PEC (${est.ano_formacion || '1er Año'})`,
              fecha: new Date().toLocaleDateString('es-BO')
            });
          }

          setActividadesPendientes(pendientesList);
          setStats({
            totalEstudiantes: listaEst.length
          });
        }

      } catch (err) {
        console.error("Error al cargar dashboard del docente:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
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

  // OBTENER NOMBRE DEL USUARIO LOGUEADO
  const getNombreUsuarioLogueado = () => {
    if (!currentUser) return 'Docente Acompañante';
    const nombreCompleto = `${currentUser.nombre || ''} ${currentUser.apellido || ''}`.trim();
    if (nombreCompleto) return `Prof. ${nombreCompleto}`;
    return currentUser.username ? `Prof. ${currentUser.username}` : 'Docente Acompañante';
  };

  // KPI CARDS
  const kpisDocente = [
    {
      title: 'Estudiantes asignados',
      value: stats.totalEstudiantes,
      badge: 'Bajo tutoría',
      icon: Users,
      color: 'from-[#8C731A] to-[#B39324]',
      textColor: 'text-[#8C731A]',
      bgLight: 'bg-[#8C731A]/10'
    }
  ];

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2">
      
      {/* BANNER ENCABEZADO */}
      <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-5 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#8C731A]/20 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <School size={14} className="text-[#6B9E1E]" /> Docente Acompañante · ESFM / UA
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center justify-center lg:justify-start gap-3">
              Bienvenido, {getNombreUsuarioLogueado()}
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0 hidden sm:inline-block" />
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed mx-auto lg:mx-0">
              Consola de supervisión y evaluación de la Práctica Educativa Comunitaria (IEPC-PEC) para tus estudiantes asignados.
            </p>
          </div>

          {/* HORA Y FECHA RESPONSIVAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row items-center gap-3 shrink-0">
            <div className="flex items-center justify-center sm:justify-start gap-3 rounded-2xl bg-white/10 p-3.5 sm:p-4 backdrop-blur-md border border-white/15 shadow-inner">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-[#8C731A] text-white shadow-lg shrink-0">
                <Clock size={22} />
              </div>
              <div className="text-left">
                <span className="block font-mono text-lg sm:text-xl font-black text-white tracking-wider">
                  {formatTime(time)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#F3EFCF]">
                  Hora Oficial
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3 rounded-2xl bg-white/10 p-3.5 sm:p-4 backdrop-blur-md border border-white/15 shadow-inner">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-[#801B28] text-white shadow-lg shrink-0">
                <Calendar size={20} />
              </div>
              <div className="text-left">
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

      {/* SECCIÓN KPI + ACCESO RÁPIDO Y BANDEJA EN GRID ADAPTATIVO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA (2 COLS EN LG): KPI CARD + ACTIVIDADES PENDIENTES */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TARJETA DE KPI RESPONSIVA */}
          <div className="grid grid-cols-1 gap-4">
            {kpisDocente.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={idx} 
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-[#8C731A]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className={`absolute top-0 left-0 right-0 sm:right-auto sm:bottom-0 sm:w-1.5 h-1.5 sm:h-auto bg-gradient-to-r sm:bg-gradient-to-b ${stat.color}`} />

                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-md shrink-0`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {stat.title}
                      </p>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                        {loading ? <Loader2 className="animate-spin text-[#801B28]" size={24} /> : stat.value}
                      </h3>
                    </div>
                  </div>

                  <span className={`self-start sm:self-center text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${stat.bgLight} ${stat.textColor}`}>
                    {stat.badge}
                  </span>
                </div>
              );
            })}
          </div>

          {/* BANDEJA DE ACTIVIDADES PENDIENTES */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FileText size={18} className="text-[#801B28]" />
                  Actividades pendientes
                </h3>
                <p className="text-xs text-slate-400">Fichas e informes requeridos para revisión y evaluación</p>
              </div>

              <Link 
                to="/docente-acompanante/iepc-pec/fichas" 
                className="text-xs font-bold text-[#801B28] hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                Ver todas <ChevronRight size={14} />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="py-12 text-center text-slate-500 font-bold text-xs">
                  <Loader2 className="animate-spin inline mr-2 text-[#801B28]" size={18} />
                  Sincronizando actividades de practicantes...
                </div>
              ) : actividadesPendientes.length > 0 ? (
                actividadesPendientes.map((item) => (
                  <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/80 rounded-2xl px-3 transition-colors">
                    <div>
                      <span className="font-extrabold text-slate-900 block text-xs">{item.estudiante}</span>
                      <span className="text-[11px] font-bold text-[#8C731A] block">{item.ficha}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">Enviado: {item.fecha}</span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 font-medium text-xs">
                  No tienes actividades ni evaluaciones pendientes por revisar.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA (1 COL EN LG): TARJETA LATERAL DE RESUMEN */}
        <div className="lg:col-span-1 rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-xl flex flex-col justify-between h-full min-h-[320px]">
          <div>
            <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#6B9E1E]/20 text-[#6B9E1E] border border-[#6B9E1E]/40 shrink-0">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Tutoría Asignada</h3>
                <p className="text-[11px] text-slate-400">Gestión Académica 2026</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed my-4">
              <p>
                Como Docente Acompañante debes revisar y evaluar las fichas de tu nómina asignada para habilitar los <strong className="text-[#F3EFCF]">Centralizadores y Actas Finales</strong>.
              </p>
              
              <div className="rounded-2xl bg-white/5 p-4 border border-white/5 space-y-1">
                <span className="block text-[10px] font-bold uppercase text-slate-400">Estado de Nómina</span>
                <span className="block text-xs font-bold text-[#6B9E1E]">
                  {estudiantesAsignados.length} Practicantes bajo tu supervisión
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/docente-acompanante/estudiantes"
            className="w-full text-center rounded-2xl bg-[#8C731A] py-3 text-xs font-extrabold text-white hover:bg-[#735E14] transition-all cursor-pointer block shadow-lg mt-4"
          >
            Ver mis estudiantes asignados
          </Link>
        </div>

      </div>

    </div>
  );
};