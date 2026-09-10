import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Copy, 
  Blocks, 
  RefreshCw,
  FileCheck2
} from 'lucide-react';

export const VerificarIntegridadAcompanante = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedHash, setCopiedHash] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Registro de Actas y Fichas para validación de Hash SHA-256 vs Blockchain
  const [actasIntegridad, setActasIntegridad] = useState([
    {
      id: 'ACTA-2026-001',
      codigoEstudiante: 'EST-026',
      estudiante: 'María López',
      documento: 'Acta Final de Práctica IEPC-PEC',
      hashRegistrado: 'A8F493BC8821DE019382F9A8F493BC8821DE019382F9A8F493BC8821DE019382',
      hashCalculado: 'A8F493BC8821DE019382F9A8F493BC8821DE019382F9A8F493BC8821DE019382',
      bloque: '#1,284,920',
      timestamp: '08/09/2026 16:30:12',
      estadoIntegridad: 'Coincidente'
    },
    {
      id: 'ACTA-2026-002',
      codigoEstudiante: 'EST-027',
      estudiante: 'Juan Carlos Pérez Gómez',
      documento: 'Acta Final de Práctica IEPC-PEC',
      hashRegistrado: 'F9E188321029384756A8F493BC8821DE019382F9A8F493BC8821DE019382F920',
      hashCalculado: 'F9E188321029384756A8F493BC8821DE019382F9A8F493BC8821DE019382F920',
      bloque: '#1,284,918',
      timestamp: '05/09/2026 11:15:00',
      estadoIntegridad: 'Coincidente'
    }
  ]);

  const filteredActas = actasIntegridad.filter(item => 
    item.estudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigoEstudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyHash = (hash, id) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const handleRunReVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      alert('RE-VERIFICACIÓN COMPLETA\n\nTodos los registros de actas coinciden con los bloques asignados en Blockchain.');
    }, 1500);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <ShieldCheck size={14} className="text-[#6B9E1E]" /> Auditoría de Inmutabilidad
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Verificar Integridad
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Verificación criptográfica SHA-256 de las actas y calificaciones finales frente al registro inmutable de la red Blockchain.
            </p>
          </div>

          <button
            onClick={handleRunReVerification}
            disabled={isVerifying}
            className="flex items-center gap-2 rounded-2xl bg-[#6B9E1E] px-5 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-[#588318] transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isVerifying ? 'animate-spin' : ''} />
            {isVerifying ? 'Verificando Hash...' : '[ Ejecutar Auditoría General ]'}
          </button>
        </div>
      </div>

      {/* FILTRO DE BÚSQUEDA */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por estudiante, C.I. o número de acta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
          />
        </div>
      </div>

      {/* REGISTROS DE INTEGRIDAD */}
      <div className="space-y-4">
        {filteredActas.map((item) => {
          const isCoincidente = item.estadoIntegridad === 'Coincidente';

          return (
            <div 
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:border-[#8C731A]/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl border ${
                    isCoincidente ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    <Blocks size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{item.documento}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.estudiante} ({item.codigoEstudiante}) • ID: {item.id}
                    </span>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold self-start sm:self-auto ${
                  isCoincidente ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {isCoincidente ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  {isCoincidente ? '✓ Integridad Confirmada' : '⚠ Hash Incoincidente'}
                </span>
              </div>

              {/* BLOQUE DE DESGLOSE CRYPTOGRAPHIC */}
              <div className="rounded-2xl bg-slate-900 p-4 text-white space-y-3 font-mono text-xs shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#F3EFCF] flex items-center gap-1">
                    <Lock size={12} className="text-[#6B9E1E]" /> Hash SHA-256 Registrado en Blockchain:
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
                    <span className="text-slate-500">Bloque Blockchain: </span>
                    <span className="text-white font-bold">{item.bloque}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Sellado de Tiempo (Timestamp): </span>
                    <span className="text-white font-bold">{item.timestamp}</span>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};