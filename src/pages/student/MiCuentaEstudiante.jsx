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
  Loader2,
  AlertCircle
} from 'lucide-react';

import { userService } from '../../services/userService';

// HELPER DE NORMALIZACIÓN DE AÑO DE FORMACIÓN
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

export const MiCuentaEstudiante = () => {
  // DATOS GENERALES DEL PERFIL INFORMATIVO
  const [userInfo, setUserInfo] = useState({
    codigo: 'S/C',
    ci: 'S/C',
    especialidad: 'Educación Primaria Comunitaria Vocacional',
    anoFormacion: '1er Año',
    esfm: 'ESFM/UA - El Alto',
    unidadEducativa: 'U.E. Franz Tamayo'
  });

  // FORMULARIO MI CUENTA
  const [profileData, setProfileData] = useState({
    nombre: '',
    apellido: '',
    username: '',
    correo: '',
    telefono: ''
  });

  // FORMULARIO SEGURIDAD
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingSecurity, setLoadingSecurity] = useState(false);
  const [message, setMessage] = useState(null);

  // CARGAR Y REHIDRATAR DATOS DESDE LOCALSTORAGE Y BACKEND
  useEffect(() => {
    const fetchFreshUserData = async () => {
      const savedUserStr = localStorage.getItem("user");
      let currentUserData = savedUserStr ? JSON.parse(savedUserStr) : null;

      if (!currentUserData) return;

      const initialTelefono = currentUserData.telefono || currentUserData.phone || currentUserData.celular || '';
      const initialCorreo = currentUserData.correo || currentUserData.email || `${currentUserData.username || 'estudiante'}@esfm.edu.bo`;

      setProfileData({
        nombre: currentUserData.nombre || '',
        apellido: currentUserData.apellido || '',
        username: currentUserData.username || '',
        correo: initialCorreo,
        telefono: initialTelefono
      });

      setUserInfo({
        codigo: currentUserData.codigo_estudiante || currentUserData.codigo || currentUserData.ci || 'EST-001',
        ci: currentUserData.ci || 'S/C',
        especialidad: currentUserData.especialidad || 'Educación Primaria Comunitaria Vocacional',
        anoFormacion: normalizarAnoStr(currentUserData.ano_formacion),
        esfm: currentUserData.esfm_ua || 'ESFM/UA - El Alto',
        unidadEducativa: currentUserData.unidad_educativa || currentUserData.ue_asignada || 'Unidad Educativa Asignada'
      });

      // Rehidratación fresca desde Backend
      try {
        const allUsers = await userService.getUsers();
        const list = Array.isArray(allUsers) ? allUsers : allUsers?.usuarios || [];
        const freshUser = list.find(u => u.id === currentUserData.id || u.username === currentUserData.username);

        if (freshUser) {
          const freshTelefono = freshUser.telefono || freshUser.phone || freshUser.celular || initialTelefono;
          const freshCorreo = freshUser.correo || freshUser.email || initialCorreo;

          setProfileData(prev => ({
            ...prev,
            nombre: freshUser.nombre || prev.nombre,
            apellido: freshUser.apellido || prev.apellido,
            username: freshUser.username || prev.username,
            correo: freshCorreo,
            telefono: freshTelefono
          }));

          const updatedUser = {
            ...currentUserData,
            ...freshUser,
            telefono: freshTelefono,
            correo: freshCorreo
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      } catch (e) {
        console.warn("Usando caché de sesión local.");
      }
    };

    fetchFreshUserData();
  }, []);

  // ACTUALIZAR PERFIL (NOMBRE, APELLIDO, USERNAME Y TELÉFONO)
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

      const response = await userService.updateProfile(payload);

      const currentUserLocal = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = {
        ...currentUserLocal,
        nombre: profileData.nombre,
        apellido: profileData.apellido,
        username: profileData.username,
        telefono: profileData.telefono,
        phone: profileData.telefono,
        ...(response?.user || {})
      };
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("storage"));

      setMessage({ type: 'success', text: 'Datos personales y de contacto actualizados correctamente.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'No se pudo actualizar el perfil.' });
    } finally {
      setLoadingProfile(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // CAMBIAR CONTRASEÑA
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

      setMessage({ type: 'success', text: 'Contraseña actualizada con éxito. Sus credenciales han sido protegidas.' });
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error al cambiar la contraseña. Verifique su contraseña actual.' });
    } finally {
      setLoadingSecurity(false);
      setTimeout(() => setMessage(null), 5000);
    }
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
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* TARJETA PRINCIPAL DEL PERFIL */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-[#801B28] to-[#121824] text-white shadow-xl text-3xl font-black font-mono">
          {profileData.nombre ? profileData.nombre.charAt(0) : 'E'}{profileData.apellido ? profileData.apellido.charAt(0) : 'P'}
        </div>

        <div className="space-y-1 text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h2 className="text-xl font-black text-slate-900">{profileData.nombre} {profileData.apellido}</h2>
            <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-[#801B28] text-xs font-mono font-bold">
              Cód: {userInfo.codigo}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-600 flex items-center justify-center md:justify-start gap-1">
            <GraduationCap size={15} className="text-[#8C731A]" />
            {userInfo.especialidad} — {userInfo.anoFormacion}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1 text-[11px] font-semibold text-slate-500">
            <span>C.I.: {userInfo.ci}</span>
            <span>•</span>
            <span>{userInfo.esfm}</span>
            <span>•</span>
            <span>Asignación: {userInfo.unidadEducativa}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* BLOQUE 1: DATOS PERSONALES Y CONTACTO */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Mail size={18} className="text-[#801B28]" />
              Datos personales y de contacto
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Actualiza tu información personal y teléfono celular de contacto.
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
                [ Guardar cambios ]
              </button>
            </div>
          </form>
        </div>

        {/* BLOQUE 2: SEGURIDAD DE LA CUENTA */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
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
              <label className="block font-extrabold text-slate-700 mb-1">Nueva Contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={securityData.newPassword}
                  onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 mb-1">Confirmar Nueva Contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  required
                  placeholder="Repita la nueva contraseña"
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
                className="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingSecurity ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <ShieldCheck size={16} />
                )}
                [ Cambiar contraseña ]
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};