import React from 'react';
import { AlertCircle, CheckCircle2, Trash2, X } from 'lucide-react';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, titulo, mensaje, tipo = 'info', cargando = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-sm w-full space-y-4 text-center">
        
        <div className="flex justify-center">
          {tipo === 'danger' && <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl"><Trash2 size={28} /></div>}
          {tipo === 'success' && <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><CheckCircle2 size={28} /></div>}
          {tipo === 'error' && <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl"><AlertCircle size={28} /></div>}
        </div>

        <div className="space-y-1">
          <h4 className="font-extrabold text-slate-900 text-sm">{titulo}</h4>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">{mensaje}</p>
        </div>

        <div className="flex gap-2 pt-2 justify-center">
          {tipo === 'danger' ? (
            <>
              <button
                onClick={onClose}
                disabled={cargando}
                className="w-1/2 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                disabled={cargando}
                className="w-1/2 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition-colors"
              >
                {cargando ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2 bg-[#801B28] text-white font-bold rounded-xl text-xs hover:bg-rose-900 transition-colors"
            >
              Aceptar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};