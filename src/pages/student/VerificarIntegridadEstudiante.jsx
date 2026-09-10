import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  Copy, 
  Blocks, 
  FileCheck2,
  RefreshCw
} from 'lucide-react';

export const VerificarIntegridadEstudiante = () => {
  const [copiedHash, setCopiedHash] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Registros de inmutabilidad en Blockchain del estudiante
  const [registrosCriptograficos, setRegistrosCriptograficos] = useState([
    {
      id: 'ACTA-2026-001',
      documento: 'Acta Final de Práctica IEPC-PEC 2026',
      hashRegistrado: 'A8F493BC8821DE019382F9A8F493BC8821DE019382F9A8F493BC8821DE019382',
      bloque: '#1,284,920',
      timestamp: '08/09/2026 16:30:12',
      estado: 'Valido y Coincidente'
    },
    {
      id: 'ACTA-2026-002',
      documento: 'Acta de Conformación de Equipo y Asignación U.E.',
      hashRegistrado: 'C731A89201920D83B891A8F493BC8821DE019382F9A8F493BC8821DE019382F',
      bloque: '#1,280,105',
      timestamp: '15/02/2026 10:15:44',
      estado: 'Valido y Coincidente'
    }
  ]);

  const handleCopyHash = (hash, id) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const handleReVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      alert('AUDITORÍA DE INTEGRIDAD COMPLETADA\n\nTodos tus documentos y calificaciones registradas coinciden exactamente con la red Blockchain.');
    }, 1500);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO INSTITUCIONAL */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <ShieldCheck size={14} className="text-[#6B9E1E]" /> Certificación de Inmutabilidad
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Verificar integridad
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Comprueba la validez e inmutabilidad de tus actas y notas finales registradas en la red Blockchain.
            </p>
          </div>

          <button
            onClick={handleReVerify}
            disabled={isVerifying}
            className="flex items-center gap-2 rounded-2xl bg-[#6B9E1E] px-5 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-[#588318] transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isVerifying ? 'animate-spin' : ''} />
            {isVerifying ? 'Verificando Hash...' : '[ Comprobar Integridad ]'}
          </button>
        </div>
      </div>

      {/* REGISTROS CRIPTOGRÁFICOS */}
      <div className="space-y-4">
        {registrosCriptograficos.map((item) => (
          <div 
            key={item.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:border-[#8C731A]/40 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Blocks size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{item.documento}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {item.id}</span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 self-start sm:self-auto">
                <CheckCircle2 size={12} /> {item.estado}
              </span>
            </div>

            {/* DETALLE DEL HASH */}
            <div className="rounded-2xl bg-slate-900 p-4 text-white space-y-3 font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#F3EFCF] flex items-center gap-1">
                  <Lock size={12} className="text-[#6B9E1E]" /> Hash SHA-256 Registrado:
                </span>
                <button
                  onClick={() => handleCopyHash(item.hashRegistrado, item.id)}
                  className="text-[10px] text-slate-300 hover:text-white flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded transition-all cursor-pointer"
                >
                  <Copy size={12} /> {copiedHash === item.id ? 'Copiado' : 'Copiar'}
                </button>
              </div>

              <p className="font-bold text-slate-200 text-[11px] break-all bg-black/40 p-2.5 rounded-xl border border-white/10">
                {item.hashRegistrado}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
                <div>
                  <span className="text-slate-500">Bloque Asignado: </span>
                  <span className="text-white font-bold">{item.bloque}</span>
                </div>
                <div>
                  <span className="text-slate-500">Sello de Tiempo: </span>
                  <span className="text-white font-bold">{item.timestamp}</span>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};