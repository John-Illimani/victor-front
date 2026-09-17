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
  Loader2,
  AlertCircle
} from 'lucide-react';

import { userService } from '../../services/userService';

export const ConfiguracionManagement = () => {
  // Formulario Mi cuenta
  const [profileData, setProfileData] = useState({
    nombre: '',
    apellido: '',
    username: '',
    correo: '',
    telefono: ''
  });

  // Formulario Seguridad
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingSecurity, setLoadingSecurity] = useState(false);
  const [message, setMessage] = useState(null);

  // Cargar usuario autenticado desde localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setProfileData({
          nombre: parsed.nombre || '',
          apellido: parsed.apellido || '',
          username: parsed.username || '',
          correo: parsed.correo || parsed.email || '',
          telefono: parsed.telefono || ''
        });
      } catch (e) {
        console.error("Error al cargar perfil desde localStorage", e);
      }
    }
  }, []);

  // Actualizar Mi Cuenta (Nombre, Apellido, Username y Teléfono)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoadingProfile(true);

    try {
      const payload = {
        nombre: profileData.nombre,
        apellido: profileData.apellido,
        username: profileData.username,
        telefono: profileData.telefono
      };

      // Usa la ruta /usuarios/me/perfil que lee el ID del Token JWT
      const response = await userService.updateProfile(payload);

      // Actualizar localStorage manteniendo el correo previo e integrando los datos actualizados
      const currentUserLocal = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = {
        ...currentUserLocal,
        nombre: profileData.nombre,
        apellido: profileData.apellido,
        username: profileData.username,
        telefono: profileData.telefono,
        ...(response?.user || {})
      };
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("storage"));

      setMessage({ type: 'success', text: 'Datos de la cuenta actualizados correctamente.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'No se pudo actualizar el perfil.' });
    } finally {
      setLoadingProfile(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // Cambiar Contraseña
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (securityData.newPassword !== securityData.confirmPassword) {
      setMessage({ type: 'error', text: 'La nueva contraseña y la confirmación no coinciden.' });
      return;
    }
    if (securityData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    setLoadingSecurity(true);

    try {
      await userService.changePassword({
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword
      });

      setMessage({ type: 'success', text: 'Contraseña actualizada con éxito. Credenciales reaseguradas.' });
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error al cambiar contraseña. Verifique su contraseña actual.' });
    } finally {
      setLoadingSecurity(false);
      setTimeout(() => setMessage(null), 5000);
    }
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
              Gestión del perfil personal del usuario autenticado y resguardo de credenciales de acceso al sistema IEPC-PEC.
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
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* BLOQUE 1: MI CUENTA */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Nombre *</label>
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
                <label className="block font-extrabold text-slate-700 mb-1">Apellido *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    value={profileData.apellido}
                    onChange={(e) => setProfileData({ ...profileData, apellido: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none"
                  />
                </div>
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
                disabled={loadingProfile}
                className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[#a32334] transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingProfile ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
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
                  type="text"
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
                  type="text"
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
                  type="text"
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
                disabled={loadingSecurity}
                className="flex items-center gap-2 rounded-2xl bg-[#8C731A] px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[#735E14] transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingSecurity ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Lock size={16} />
                )}
                Cambiar contraseña
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};