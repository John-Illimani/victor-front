import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  School,
  ArrowRight
} from 'lucide-react';

import { authService } from '../../services/authService';

export const LoginESFMTHEA = () => {
  const navigate = useNavigate();

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await authService.login(loginUsername, loginPassword);
      
      if (response.token) {
        localStorage.setItem("access_token", response.token);
      }
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      const rol = response.user?.rol;

      // REDIRECCIÓN SEGÚN LOS ROLES DE POSTGRESQL
      if (rol === 'ADMINISTRADOR') {
        navigate('/admin');
      } else if (rol === 'DOCENTE_ACOMPANANTE') {
        navigate('/docente-acompanante');
      } else if (rol === 'DOCENTE_GUIA') {
        navigate('/docente-guia');
      } else if (rol === 'ESTUDIANTE') {
        navigate('/estudiante');
      } else {
        setLoginError('Rol de usuario no reconocido en el sistema.');
      }
    } catch (err) {
      setLoginError(err.message || 'Credenciales inválidas o error de conexión.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#070A10] p-4 font-sans selection:bg-[#8C731A] selection:text-white">
      
      {/* TRANSPARENCIA Y TEXTO BLANCO EN AUTOCOMPLETADO DEL NAVEGADOR */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: #ffffff !important;
          transition: background-color 5000s ease-in-out 0s !important;
          background-color: transparent !important;
        }

        .dot-pattern {
          background-image: radial-gradient(rgba(255, 255, 255, 0.15) 1.2px, transparent 1.2px);
          background-size: 24px 24px;
        }
      `}</style>

      {/* --- FONDO DE MALLA DE PUNTOS (DOT PATTERN) Y ONDAS FLUIDAS --- */}
      <div className="absolute inset-0 dot-pattern opacity-60 pointer-events-none" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Onda Guindo / Rojo Tinto (Inferior Izquierda) */}
        <div className="absolute -bottom-32 -left-24 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-[#801B28]/50 via-[#801B28]/15 to-transparent blur-[140px] animate-[pulse_7s_ease-in-out_infinite]" />
        
        {/* Onda Dorada Chakana (Superior Derecha) */}
        <div className="absolute -top-32 -right-24 h-[650px] w-[650px] rounded-full bg-gradient-to-bl from-[#8C731A]/40 via-[#8C731A]/15 to-transparent blur-[150px] animate-[pulse_9s_ease-in-out_infinite]" />
        
        {/* Destello Verde Engranaje / Blockchain (Centro) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-[#6B9E1E]/15 blur-[160px]" />
      </div>

      {/* --- CONTENEDOR CIRCULAR GLASSMORPHISM --- */}
      <div className="relative z-10 flex h-[540px] w-[540px] sm:h-[580px] sm:w-[580px] flex-col items-center justify-center rounded-full bg-gradient-to-b from-white/10 via-white/[0.03] to-black/50 p-8 sm:p-12 backdrop-blur-2xl border border-white/20 shadow-[0_35px_90px_-15px_rgba(0,0,0,0.9)] transition-all duration-500">
        
        <div className="w-full max-w-[340px] flex flex-col items-center text-center">
          
          {/* LOGO AMPLIADO INSTITUCIONAL DE LA ESFMTHEA */}
          <div className="mb-2 flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-white/10 p-3 backdrop-blur-md border border-white/25 shadow-2xl transition-transform hover:scale-105 duration-300">
            <img 
              src="/logo_esfmthea.png" 
              alt="Escudo ESFMTHEA" 
              className="h-full w-full object-contain filter drop-shadow-md"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden h-full w-full items-center justify-center text-[#8C731A]">
              <School size={48} />
            </div>
          </div>

          {/* TÍTULO Y SUBTÍTULO */}
          <h2 className="text-2xl sm:text-3xl font-black tracking-widest text-white mt-1">
            LOGIN
          </h2>
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-[#F3EFCF] uppercase mb-3 block">
            ESFMTHEA • IEPC-PEC
          </span>

          {/* ALERTA DE ERROR */}
          {loginError && (
            <div className="mb-3 w-full flex items-center justify-center gap-2 rounded-xl bg-[#801B28]/50 p-2 text-[11px] text-white border border-[#801B28]/70 animate-in fade-in">
              <AlertCircle size={15} className="shrink-0 text-rose-300" />
              <span className="font-semibold truncate">{loginError}</span>
            </div>
          )}

          {/* FORMULARIO CÁPSULA GLASSMORPHISM */}
          <form onSubmit={handleLogin} className="w-full space-y-3">
            
            {/* INPUT USUARIO / C.I. */}
            <div className="relative flex items-center rounded-full bg-white/10 border border-white/20 focus-within:border-[#8C731A] focus-within:bg-white/15 focus-within:ring-2 focus-within:ring-[#8C731A]/40 transition-all backdrop-blur-md">
              <input 
                type="text" 
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Username / C.I." 
                className="w-full bg-transparent pl-5 pr-11 py-3 text-xs font-semibold text-white outline-none placeholder:text-slate-400 placeholder:font-normal"
              />
              <User size={18} className="absolute right-4 text-slate-300 pointer-events-none" />
            </div>

            {/* INPUT CONTRASEÑA */}
            <div className="relative flex items-center rounded-full bg-white/10 border border-white/20 focus-within:border-[#8C731A] focus-within:bg-white/15 focus-within:ring-2 focus-within:ring-[#8C731A]/40 transition-all backdrop-blur-md">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Password" 
                className="w-full bg-transparent pl-5 pr-11 py-3 text-xs font-semibold text-white outline-none placeholder:text-slate-400 placeholder:font-normal"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-300 hover:text-white focus:outline-none transition-colors cursor-pointer"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Lock size={18} />}
              </button>
            </div>

            {/* BOTÓN SUBMIT */}
            <button 
              type="submit"
              disabled={loginLoading}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8C731A] to-[#801B28] py-3 text-xs font-extrabold tracking-widest text-white shadow-lg shadow-[#801B28]/40 hover:shadow-xl hover:shadow-[#8C731A]/50 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-70 cursor-pointer uppercase border border-white/20"
            >
              {loginLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <>
                  <span>LOGIN</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>

          </form>

          {/* FOOTER INTERNO */}
          <div className="mt-4 flex items-center justify-between w-full px-2 text-[10px] text-slate-300">
            <span className="hover:underline cursor-pointer text-slate-400 hover:text-white transition-colors">
              ESFMTHEA 2026
            </span>
            <span className="hover:underline cursor-pointer text-[#F3EFCF] hover:text-white transition-colors">
              Gestión IEPC-PEC
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};

export default LoginESFMTHEA;