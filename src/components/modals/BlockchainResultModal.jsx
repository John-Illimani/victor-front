import React, { useEffect, useState } from 'react';
import { CheckCircle2, ShieldAlert, ExternalLink, X, Hash, Layers, Printer } from 'lucide-react';

export const BlockchainResultModal = ({ show, onClose, onConfirmPrint, data }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (show) {
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
    }
  }, [show]);

  if (!show && !animate) return null;

  const yaExistia = data?.yaExistia || false;
  const txHash = data?.tx_hash || data?.txHash || '';
  const hashLocal = data?.hash_local || data?.hash || '';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-opacity duration-300 ease-out ${
        animate ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 transform transition-all duration-300 ease-out ${
          animate ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Botón de Cierre */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Ícono de Estado */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl mb-4 shadow-sm border">
          {yaExistia ? (
            <div className="bg-amber-50 text-amber-600 border-amber-200 p-3 rounded-2xl">
              <ShieldAlert size={32} />
            </div>
          ) : (
            <div className="bg-emerald-50 text-emerald-600 border-emerald-200 p-3 rounded-2xl">
              <CheckCircle2 size={32} />
            </div>
          )}
        </div>

        {/* Encabezado */}
        <div className="text-center space-y-1 mb-5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#801B28]">
            {yaExistia ? 'CERTIFICACIÓN PREVIA DETECTADA' : 'EMISIÓN EXITOSA EN BLOCKCHAIN'}
          </span>
          <h3 className="text-lg font-black text-slate-900">
            {yaExistia
              ? 'El Centralizador Ya Se Encuentra Certificado'
              : 'Registrado Correctamente en la Red'}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            {yaExistia
              ? 'Este registro ya existe. ¿Desea generar e imprimir el PDF?'
              : 'Se ha emitido la certificación inmutable. ¿Desea proceder a generar el documento PDF impreso?'}
          </p>
        </div>

        {/* Detalles Técnicos Web3 */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs font-mono mb-6">
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold block uppercase flex items-center gap-1">
              <Layers size={12} className="text-[#801B28]" /> Transacción TX Hash (EVM):
            </span>
            <span className="text-emerald-700 font-bold break-all block text-[11px]">
              {txHash || 'PENDIENTE_DE_MINADO'}
            </span>
          </div>

          <div className="pt-1 border-t border-slate-200">
            <span className="text-[10px] text-slate-400 font-extrabold block uppercase flex items-center gap-1">
              <Hash size={12} className="text-[#801B28]" /> Hash Local SHA-256:
            </span>
            <span className="text-slate-800 font-bold break-all block text-[11px]">
              {hashLocal || '0x...'}
            </span>
          </div>
        </div>

        {/* Pregunta & Botones de Acción */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirmPrint}
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-slate-900 py-3 text-xs font-extrabold text-white hover:bg-slate-800 transition-all cursor-pointer shadow-md"
          >
            <Printer size={15} /> Sí, Generar e Imprimir PDF
          </button>

          {txHash && !txHash.includes('REGISTERED_ON_CHAIN') && (
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
            >
              <ExternalLink size={13} /> Explorar en Etherscan
            </a>
          )}

          <button
            onClick={onClose}
            className="w-full rounded-2xl border border-slate-200 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all cursor-pointer mt-1"
          >
            Cancelar / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};