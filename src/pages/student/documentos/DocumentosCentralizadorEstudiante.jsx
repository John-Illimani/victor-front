import React from 'react';
import { FileDown, Award, Sparkles, Download, CheckCircle2, ShieldCheck } from 'lucide-react';

export const DocumentosCentralizadorEstudiante = () => {
  const centralizadorInfo = {
    gestion: '2026',
    estudiante: 'María López',
    codigo: 'EST-026',
    promedioFinal: 88.8,
    estado: 'APROBADO',
    hashBlockchain: 'A8F493BC8821DE019382F9A8F493BC8821DE019382F9A8F493BC8821DE019382'
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <Award size={14} className="text-[#8C731A]" /> Documento Institucional
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Centralizador de Notas
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Sábana consolidada oficial con las notas obtenidas en todas las fichas de la práctica.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-[#801B28] uppercase tracking-wider block">Centralizador Oficial</span>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">SÁBANA DE NOTAS IEPC-PEC GESTIÓN {centralizadorInfo.gestion}</h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center gap-1 self-start sm:self-auto">
            <CheckCircle2 size={14} /> {centralizadorInfo.estado}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block font-bold uppercase text-[10px]">Practicante:</span>
            <span className="font-extrabold text-slate-900 text-sm">{centralizadorInfo.estudiante}</span>
            <span className="block font-mono text-slate-400 text-[10px]">{centralizadorInfo.codigo}</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-emerald-800 block font-bold uppercase text-[10px]">Nota Promedio Final:</span>
            <span className="font-mono font-black text-emerald-900 text-xl">{centralizadorInfo.promedioFinal} pts</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-1 font-mono text-[10px]">
            <span className="text-[#F3EFCF] font-bold block flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-400" /> Registro Blockchain
            </span>
            <p className="truncate text-slate-300">{centralizadorInfo.hashBlockchain}</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => alert('Descargando Centralizador de Notas en formato PDF oficial...')}
            className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-6 py-3 text-xs font-extrabold text-white shadow-md hover:bg-[#a32334] transition-all cursor-pointer"
          >
            <Download size={16} /> [ Descargar Centralizador Oficial PDF ]
          </button>
        </div>
      </div>
    </div>
  );
};