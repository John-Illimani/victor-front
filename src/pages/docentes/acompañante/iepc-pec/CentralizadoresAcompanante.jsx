import React, { useState } from 'react';
import { Award, Printer, Search, Sparkles } from 'lucide-react';

export const CentralizadoresAcompanante = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const centralizadorData = [
    { id: 'EST-026', estudiante: 'María López', f1: 85, f2: 90, f3: 88, f4: 92, f5: 87, f6: 91, estado: 'COMPLETADO' },
    { id: 'EST-027', estudiante: 'Juan Carlos Pérez Gómez', f1: 90, f2: 95, f3: 92, f4: 88, f5: 94, f6: 91, estado: 'COMPLETADO' }
  ];

  const filtered = centralizadorData.filter(item =>
    item.estudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <Award size={14} className="text-[#8C731A]" /> Sábana de Notas IEPC-PEC
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Centralizadores
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
          </div>
          <button
            onClick={() => alert('Generando Centralizador Oficial en PDF...')}
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-emerald-700 transition-all cursor-pointer shrink-0"
          >
            <Printer size={16} /> Exportar Centralizador PDF
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por estudiante o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Código / Estudiante</th>
                <th className="py-3.5 px-3 text-center font-mono">F-1</th>
                <th className="py-3.5 px-3 text-center font-mono">F-2</th>
                <th className="py-3.5 px-3 text-center font-mono">F-3</th>
                <th className="py-3.5 px-3 text-center font-mono">F-4</th>
                <th className="py-3.5 px-3 text-center font-mono">F-5</th>
                <th className="py-3.5 px-3 text-center font-mono">F-6</th>
                <th className="py-3.5 px-4 text-center font-mono">Promedio Final</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map((item) => {
                const prom = ((item.f1 + item.f2 + item.f3 + item.f4 + item.f5 + item.f6) / 6).toFixed(1);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.estudiante}
                      <span className="block font-mono text-[10px] text-[#801B28]">{item.id}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono">{item.f1}</td>
                    <td className="py-3.5 px-3 text-center font-mono">{item.f2}</td>
                    <td className="py-3.5 px-3 text-center font-mono">{item.f3}</td>
                    <td className="py-3.5 px-3 text-center font-mono">{item.f4}</td>
                    <td className="py-3.5 px-3 text-center font-mono">{item.f5}</td>
                    <td className="py-3.5 px-3 text-center font-mono">{item.f6}</td>
                    <td className="py-3.5 px-4 font-mono font-black text-center text-sm text-emerald-700">
                      {prom} pts
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                        {item.estado}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};