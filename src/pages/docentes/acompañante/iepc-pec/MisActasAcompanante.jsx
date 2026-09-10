import React, { useState } from 'react';
import { FileCheck2, Search, CheckCircle2, AlertTriangle, Clock, Eye, Sparkles } from 'lucide-react';

export const MisActasAcompanante = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const [actas, setActas] = useState([
    {
      id: 'ACTA-2026-001',
      estudiante: 'María López',
      codigoEstudiante: 'EST-026',
      ano: '2.º Año',
      tipoActa: 'Acta Final de Práctica IEPC-PEC',
      fecha: '08/09/2026',
      estado: 'Pendiente de Validación',
      promedio: 88.8
    },
    {
      id: 'ACTA-2026-002',
      estudiante: 'Juan Carlos Pérez Gómez',
      codigoEstudiante: 'EST-027',
      ano: '2.º Año',
      tipoActa: 'Acta Final de Práctica IEPC-PEC',
      fecha: '05/09/2026',
      estado: 'Validada',
      promedio: 91.6
    }
  ]);

  const filteredActas = actas.filter(a =>
    a.estudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.codigoEstudiante.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
            <FileCheck2 size={14} className="text-[#8C731A]" /> Gestión Documental
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Mis Actas IEPC-PEC
            <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Revisión, validación y control de actas oficiales de práctica para los estudiantes asignados.
          </p>
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
                <th className="py-3.5 px-4">Código / Acta</th>
                <th className="py-3.5 px-4">Estudiante</th>
                <th className="py-3.5 px-4">Año</th>
                <th className="py-3.5 px-4 font-mono text-center">Promedio</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredActas.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono">
                    <span className="block font-bold text-[#801B28]">{item.id}</span>
                    <span className="text-[10px] text-slate-400">{item.tipoActa}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {item.estudiante}
                    <span className="block font-mono text-[10px] text-slate-400">{item.codigoEstudiante}</span>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-800">{item.ano}</td>
                  <td className="py-3.5 px-4 font-mono font-black text-center text-sm text-emerald-700">
                    {item.promedio} pts
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      item.estado === 'Validada' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.estado === 'Validada' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {item.estado}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => alert(`Visualizando ${item.tipoActa} de ${item.estudiante}`)}
                      className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-[#801B28] hover:text-white transition-all cursor-pointer"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};