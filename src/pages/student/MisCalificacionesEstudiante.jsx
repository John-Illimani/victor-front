import React from 'react';
import { 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  School 
} from 'lucide-react';

export const MisCalificacionesEstudiante = () => {
  // Desglose de calificaciones del practicante por ficha y evaluador
  const calificacionesData = [
    {
      fichaCodigo: 'F-1',
      fichaNombre: 'Diagnóstico Sociocomunitario',
      etapa: 'Etapa Preparatoria',
      notaGuia: 90,
      notaAcompanante: 85,
      promedioFicha: 87.5,
      estado: 'Aprobado'
    },
    {
      fichaCodigo: 'F-2',
      fichaNombre: 'Planificación de la Práctica (PDC)',
      etapa: 'Etapa de Ejecución',
      notaGuia: 92,
      notaAcompanante: 88,
      promedioFicha: 90.0,
      estado: 'Aprobado'
    },
    {
      fichaCodigo: 'F-3',
      fichaNombre: 'Cuaderno de Campo Diario',
      etapa: 'Etapa de Ejecución',
      notaGuia: 88,
      notaAcompanante: 88,
      promedioFicha: 88.0,
      estado: 'Aprobado'
    },
    {
      fichaCodigo: 'F-4',
      fichaNombre: 'Registro de Experiencias en Aula',
      etapa: 'Etapa de Ejecución',
      notaGuia: 85,
      notaAcompanante: 80,
      promedioFicha: 82.5,
      estado: 'Aprobado'
    },
    {
      fichaCodigo: 'F-5',
      fichaNombre: 'Valoración del Docente Acompañante',
      etapa: 'Etapa de Ejecución',
      notaGuia: null,
      notaAcompanante: 90,
      promedioFicha: 90.0,
      estado: 'Aprobado'
    },
    {
      fichaCodigo: 'F-6',
      fichaNombre: 'Informe Final de Práctica IEPC-PEC',
      etapa: 'Etapa de Producción',
      notaGuia: null,
      notaAcompanante: 94,
      promedioFicha: 94.0,
      estado: 'Aprobado'
    }
  ];

  // Cálculo del Promedio General
  const promedioGeneral = (
    calificacionesData.reduce((acc, curr) => acc + curr.promedioFicha, 0) / calificacionesData.length
  ).toFixed(1);

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO INSTITUCIONAL */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <Award size={14} className="text-[#8C731A]" /> Historial Académico IEPC-PEC
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Mis calificaciones
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Desglose cuantitativo de puntajes asignados por el Docente Acompañante (ESFM/UA) y Docente Guía (U.E.).
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 p-5 backdrop-blur-md border border-white/15 text-center shrink-0">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-[#F3EFCF]">
              Promedio Final Acumulado
            </span>
            <span className="block font-mono text-3xl font-black text-white tracking-wider mt-1">
              {promedioGeneral} pts
            </span>
            <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
              Aprobado
            </span>
          </div>
        </div>
      </div>

      {/* DETALLE DE NOTAS POR FICHA */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-900">DESGLOSE DE NOTAS POR FICHA DE EVALUACIÓN</h2>
          <p className="text-xs text-slate-400">Escala oficial de calificación de 1 a 100 puntos</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Ficha / Etapa</th>
                <th className="py-3.5 px-4 font-mono text-center">Docente Guía (U.E.)</th>
                <th className="py-3.5 px-4 font-mono text-center">Docente Acompañante (ESFM)</th>
                <th className="py-3.5 px-4 font-mono text-center">Promedio Ficha</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {calificacionesData.map((item) => (
                <tr key={item.fichaCodigo} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-black text-[#801B28] px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-100">
                        {item.fichaCodigo}
                      </span>
                      <div>
                        <span className="block font-bold text-slate-900">{item.fichaNombre}</span>
                        <span className="text-[10px] text-slate-400">{item.etapa}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-center text-slate-800">
                    {item.notaGuia ? `${item.notaGuia} pts` : '—'}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-center text-slate-800">
                    {item.notaAcompanante ? `${item.notaAcompanante} pts` : '—'}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-center text-sm text-emerald-700">
                    {item.promedioFicha.toFixed(1)} pts
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 size={12} /> {item.estado}
                    </span>
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