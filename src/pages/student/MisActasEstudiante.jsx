import React, { useState } from 'react';
import { 
  FileCheck2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Download, 
  ShieldCheck,
  FileText
} from 'lucide-react';

export const MisActasEstudiante = () => {
  // Lista de actas pertenecientes al estudiante practicante
  const [actas, setActas] = useState([
    {
      id: 'ACTA-2026-001',
      tipoActa: 'Acta Final de Práctica IEPC-PEC',
      etapa: 'Etapa Final',
      fechaEmision: '08/09/2026',
      estado: 'Validada',
      promedioFinal: 88.8,
      firmadoDocente: true,
      firmadoGuia: true,
      hashBlockchain: 'A8F493BC8821DE019382F9A8F493BC8821DE019382F9A8F493BC8821DE019382'
    },
    {
      id: 'ACTA-2026-002',
      tipoActa: 'Acta de Conformación de Equipo y Asignación de U.E.',
      etapa: 'Etapa Preparatoria',
      fechaEmision: '15/02/2026',
      estado: 'Validada',
      promedioFinal: null,
      firmadoDocente: true,
      firmadoGuia: true,
      hashBlockchain: 'C731A89201920D83B891A8F493BC8821DE019382F9A8F493BC8821DE019382F'
    }
  ]);

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO INSTITUCIONAL */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <FileCheck2 size={14} className="text-[#8C731A]" /> Documentos Oficiales
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Mis actas
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Consulta de actas oficiales emitidas, estado de firmas de validación y certificación de inmutabilidad.
            </p>
          </div>
        </div>
      </div>

      {/* LISTADO DE ACTAS */}
      <div className="space-y-4">
        {actas.map((item) => {
          const isValidada = item.estado === 'Validada';

          return (
            <div 
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:border-[#8C731A]/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-[#801B28]">
                    <FileText size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#8C731A] uppercase tracking-wider block">
                      {item.etapa}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm">{item.tipoActa}</h3>
                    <span className="text-[10px] font-mono text-slate-400">ID Acta: {item.id} | Fecha: {item.fechaEmision}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.promedioFinal && (
                    <div className="text-right mr-2">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Nota Final</span>
                      <span className="font-mono font-black text-emerald-700 text-base">{item.promedioFinal} pts</span>
                    </div>
                  )}

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold ${
                    isValidada ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isValidada ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {item.estado}
                  </span>
                </div>
              </div>

              {/* DETALLES DE FIRMAS Y ACCIONES */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    Firma Docente Acompañante
                  </span>
                  <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    Firma Docente Guía (U.E.)
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0">
                  <button
                    onClick={() => alert(`Previsualizando ${item.tipoActa}...`)}
                    className="flex items-center gap-1.5 rounded-2xl bg-slate-100 px-4 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    <Eye size={15} /> Previsualizar
                  </button>

                  <button
                    onClick={() => alert(`Descargando copia oficial de ${item.id} en formato PDF...`)}
                    className="flex items-center gap-1.5 rounded-2xl bg-[#801B28] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#a32334] transition-all cursor-pointer shadow-md"
                  >
                    <Download size={15} /> Descargar PDF
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};