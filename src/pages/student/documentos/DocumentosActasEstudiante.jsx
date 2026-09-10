import React, { useState } from 'react';
import { FileDown, FileText, Sparkles, Eye, Download, CheckCircle2 } from 'lucide-react';

export const DocumentosActasEstudiante = () => {
  const [actas] = useState([
    {
      id: 'ACTA-2026-001',
      nombre: 'Acta Final de Práctica IEPC-PEC 2026',
      fecha: '08/09/2026',
      tamano: '1.8 MB',
      estado: 'Firmado y Validado'
    },
    {
      id: 'ACTA-2026-002',
      nombre: 'Acta de Conformación de Equipo y Asignación U.E.',
      fecha: '15/02/2026',
      tamano: '1.2 MB',
      estado: 'Firmado y Validado'
    }
  ]);

  return (
    <div className="space-y-6 font-sans">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <FileDown size={14} className="text-[#8C731A]" /> Descarga de Documentos
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Mis Actas
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Descarga directa de actas oficiales legalizadas del proceso IEPC-PEC.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {actas.map((item) => (
          <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-[#801B28]">
                <FileText size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">{item.nombre}</h3>
                <span className="text-[10px] text-slate-400 font-mono">ID: {item.id} • Fecha: {item.fecha} • Tamaño: {item.tamano}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1 mr-2">
                <CheckCircle2 size={12} /> {item.estado}
              </span>
              <button
                onClick={() => alert(`Previsualizando ${item.nombre}...`)}
                className="p-2.5 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => alert(`Descargando ${item.nombre} en PDF...`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#801B28] text-white text-xs font-extrabold hover:bg-[#a32334] transition-all cursor-pointer shadow-md"
              >
                <Download size={14} /> PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};