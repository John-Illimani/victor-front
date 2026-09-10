import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  Sparkles, 
  GraduationCap, 
  KeyRound,
  School
} from 'lucide-react';

export const MiCuentaEstudiante = () => {
  const [profile, setProfile] = useState({
    nombre: 'María',
    apellido: 'López',
    ci: '8492012',
    codigo: 'EST-026',
    especialidad: 'Educación Primaria Comunitaria Vocacional',
    anoFormacion: '2.º Año',
    esfm: 'ESFM/UA - El Alto',
    unidadEducativa: 'U.E. Franz Tamayo',
    correo: 'maria.lopez@est.esfm.edu.bo',
    telefono: '78912034'
  });

  const [passwords, setPasswords] = useState({
    actual: '',
    nueva: '',
    confirmacion: ''
  });

  const [message, setMessage] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setProfile(prev => ({
          ...prev,
          nombre: parsed.nombre || prev.nombre,
          apellido: parsed.apellido || prev.apellido,
          correo: parsed.email || prev.correo
        }));
      } catch (e) {
        console.error("Error al cargar perfil del estudiante", e);
      }
    }
  }, []);

  const handleSaveContact = (e) => {
    e.preventDefault();
    setMessage({ type: 'success', text: 'Datos de contacto actualizados correctamente en PostgreSQL.' });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwords.nueva !== passwords.confirmacion) {
      setMessage({ type: 'error', text: 'La nueva contraseña y su confirmación no coinciden.' });
      return;
    }
    if (passwords.nueva.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    setMessage({ type: 'success', text: 'Contraseña actualizada exitosamente.' });
    setPasswords({ actual: '', nueva: '', confirmacion: '' });
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO INSTITUCIONAL */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <User size={14} className="text-[#8C731A]" /> Perfil del Estudiante
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Mi cuenta
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Gestión de información académica personal, datos de contacto y credenciales de acceso.
            </p>
          </div>
        </div>
      </div>

      {/* NOTIFICACIÓN GENERAL */}
      {message && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <CheckCircle2 size={16} />
          {message.text}
        </div>
      )}

      {/* TARJETA PRINCIPAL DEL PERFIL */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-[#801B28] to-[#121824] text-white shadow-xl text-3xl font-black font-mono">
          {profile.nombre.charAt(0)}{profile.apellido.charAt(0)}
        </div>

        <div className="space-y-1 text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h2 className="text-xl font-black text-slate-900">{profile.nombre} {profile.apellido}</h2>
            <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-[#801B28] text-xs font-mono font-bold">
              {profile.codigo}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-600 flex items-center justify-center md:justify-start gap-1">
            <GraduationCap size={15} className="text-[#8C731A]" />
            {profile.especialidad} — {profile.anoFormacion}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1 text-[11px] font-semibold text-slate-500">
            <span>C.I.: {profile.ci}</span>
            <span>•</span>
            <span>{profile.esfm}</span>
            <span>•</span>
            <span>Asignación: {profile.unidadEducativa}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* FORMULARIO 1: ACTUALIZACIÓN DE CONTACTO */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Mail size={18} className="text-[#801B28]" />
              Datos de contacto
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dirección de correo institucional y teléfono de contacto activo.
            </p>
          </div>

          <form onSubmit={handleSaveContact} className="space-y-4 text-xs">
            <div>
              <label className="block font-extrabold text-slate-700 mb-1">Correo Electrónico *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  value={profile.correo}
                  onChange={(e) => setProfile({ ...profile, correo: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 mb-1">Teléfono / Celular de Contacto *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  required
                  value={profile.telefono}
                  onChange={(e) => setProfile({ ...profile, telefono: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[#a32334] transition-all cursor-pointer"
              >
                <Save size={16} /> [ Guardar datos de contacto ]
              </button>
            </div>
          </form>
        </div>

        {/* FORMULARIO 2: CAMBIO DE CONTRASEÑA */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <KeyRound size={18} className="text-[#8C731A]" />
              Seguridad de la cuenta
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Actualiza tu clave de acceso a la plataforma IEPC-PEC.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-extrabold text-slate-700 mb-1">Contraseña Actual *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwords.actual}
                  onChange={(e) => setPasswords({ ...passwords, actual: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 mb-1">Nueva Contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={passwords.nueva}
                  onChange={(e) => setPasswords({ ...passwords, nueva: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 mb-1">Confirmar Nueva Contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  placeholder="Repita la nueva contraseña"
                  value={passwords.confirmacion}
                  onChange={(e) => setPasswords({ ...passwords, confirmacion: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-slate-800 transition-all cursor-pointer"
              >
                <ShieldCheck size={16} /> [ Cambiar contraseña ]
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};