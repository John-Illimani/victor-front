import React from 'react';
import { X } from 'lucide-react';

export const ModalBase = ({ isOpen, onClose, titulo, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera del Modal */}
        <div className="bg-[#801B28] px-6 py-4 flex justify-between items-center shrink-0">
          <h3 className="text-white font-extrabold text-sm uppercase tracking-wide pr-4">
            {titulo}
          </h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {children}
        </div>

        {/* Pie del Modal */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 font-extrabold rounded-xl hover:bg-slate-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};