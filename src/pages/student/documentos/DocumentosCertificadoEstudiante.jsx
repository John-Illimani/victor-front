import React from 'react';
import { FileDown, Award, Sparkles, Download, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

export const DocumentosCertificadoEstudiante = () => {
  const certificadoInfo = {
    codigoCertificado: 'CERT-IEPC-2026-84920',
    estudiante: 'María López',
    ci: '8492012',
    especialidad: 'Educación Primaria Comunitaria Vocacional',
    gestion: '2026',
    fechaEmision: '09/09/2026'
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <Award size={14} className="text-[#8C731A]" /> Acreditación Académica
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Certificado de Práctica
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Certificado institucional de conclusión satisfactoria de la Práctica Educativa Comunitaria.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-[#8C731A]">
            <Award size={36} />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#801B28]">
              MINISTERIO DE EDUCACIÓN · ESFM / UA
            </span>
            <h2 className="text-xl font-black text-slate-900">CERTIFICADO DE APROBACIÓN IEPC-PEC</h2>
            <p className="text-xs text-slate-600 max-w-lg mx-auto">
              Se certifica que la estudiante <strong className="text-slate-900">{certificadoInfo.estudiante}</strong> con C.I. <strong className="text-slate-900">{certificadoInfo.ci}</strong> ha concluido y aprobado satisfactoriamente la Práctica Educativa Comunitaria de la Gestión {certificadoInfo.gestion}.
            </p>
          </div>

          <div className="pt-2 flex justify-center items-center gap-4 text-xs font-mono text-slate-500">
            <span>Cód. Certificado: {certificadoInfo.codigoCertificado}</span>
            <span>•</span>
            <span>Emisión: {certificadoInfo.fechaEmision}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <ShieldCheck size={16} className="text-emerald-600" /> Verificación criptográfica habilitada mediante código QR
          </div>

          <button
            onClick={() => alert('Generando y descargando Certificado Oficial firmado digitalmente...')}
            className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-6 py-3 text-xs font-extrabold text-white shadow-md hover:bg-[#a32334] transition-all cursor-pointer shrink-0"
          >
            <Download size={16} /> [ Descargar Certificado PDF ]
          </button>
        </div>
      </div>
    </div>
  );
};