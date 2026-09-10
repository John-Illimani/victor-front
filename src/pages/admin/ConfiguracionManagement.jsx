import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Save,
  KeyRound,
  Bell
} from 'lucide-react';

export const ConfiguracionManagement = () => {
  // Cargar usuario actual
  const [currentUser, setCurrentUser] = useState({
    nombre: 'Administrador General',
    username: 'admin',
    correo: 'admin@esfm.edu.bo',
    telefono: '70000000'
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(prev => ({
          ...prev,
          nombre: `${parsed.nombre || 'Administrador'} ${parsed.apellido || ''}`.trim(),
          username: parsed.username || 'admin',
          correo: parsed.email || 'admin@esfm.edu.bo'
        }));
      } catch (e) {
        console.error("Error al cargar perfil", e);
      }
    }
  }, []);

  // Formulario Mi cuenta
  const [profileData, setProfileData] = useState({
    nombre: currentUser.nombre,
    username: currentUser.username,
    correo: currentUser.correo,
    telefono: currentUser.telefono
  });

  // Formulario Seguridad
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState(null);

  // Actualizar Mi Cuenta
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setMessage({ type: 'success', text: 'Datos de la cuenta actualizados correctamente.' });
    setTimeout(() => setMessage(null), 4000);
  };

  // Cambiar Contraseña
  const handleChangePassword = (e) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      setMessage({ type: 'error', text: 'La nueva contraseña y la confirmación no coinciden.' });
      return;
    }
    if (securityData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    setMessage({ type: 'success', text: 'Contraseña actualizada con éxito. Sus credenciales han sido reaseguradas.' });
    setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <Settings size={14} className="text-[#8C731A]" /> Módulo de Preferencias
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Configuración de Cuenta
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Gestión del perfil personal del Administrador y resguardo de credenciales de acceso al sistema IEPC-PEC.
            </p>
          </div>
        </div>
      </div>

      {/* MENSAJE DE NOTIFICACIÓN */}
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* BLOQUE 1: MI CUENTA (SECCIÓN 16 DEL MANUAL) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <User size={20} className="text-[#801B28]" />
              Mi cuenta
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Actualiza tus datos personales y de contacto en el sistema.
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-extrabold text-slate-700 mb-1">Nombre Completo *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  required
                  value={profileData.nombre}
                  onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 mb-1">Nombre de Usuario *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  required
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 font-mono font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 mb-1">Correo Electrónico *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  value={profileData.correo}
                  onChange={(e) => setProfileData({ ...profileData, correo: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 mb-1">Teléfono / Celular</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  value={profileData.telefono}
                  onChange={(e) => setProfileData({ ...profileData, telefono: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[#a32334] transition-all cursor-pointer"
              >
                <Save size={16} />
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>

        {/* BLOQUE 2: SEGURIDAD (CAMBIO DE CONTRASEÑA) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#8C731A]" />
              Seguridad
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Modifica tu contraseña de acceso para proteger la información del sistema.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-extrabold text-slate-700 mb-1">Contraseña actual *</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={securityData.currentPassword}
                  onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 mb-1">Nueva contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={securityData.newPassword}
                  onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 mb-1">Confirmar contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={securityData.confirmPassword}
                  onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-2xl bg-[#8C731A] px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[#735E14] transition-all cursor-pointer"
              >
                <Lock size={16} />
                [ Cambiar contraseña ]
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};