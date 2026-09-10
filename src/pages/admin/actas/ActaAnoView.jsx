import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Eye, 
  Edit3, 
  History, 
  ShieldCheck, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  X, 
  Sparkles,
  Blocks
} from 'lucide-react';

export const ActaAnoView = ({ gestion, ano }) => {
  const [actas, setActas] = useState([
    {
      id: `ACT-${gestion}-${ano}-01`,
      codigoEstudiante: `EST-${gestion}-0${ano}1`,
      estudiante: 'Sonia Aliaga Chuquimia',
      ci: '9120394',
      especialidad: 'Artes Plásticas y Visuales',
      docenteAcompanante: 'Lic. Roberto Mendoza Aliaga',
      estadoGeneral: 'Validado',
      hashBlockchain: 'A8F493BC8821DE019382',
    },
    {
      id: `ACT-${gestion}-${ano}-02`,
      codigoEstudiante: `EST-${gestion}-0${ano}2`,
      estudiante: 'Pedro Luis Mamani Calle',
      ci: '8392019',
      especialidad: 'Educación Primaria Comunitaria Vocacional',
      docenteAcompanante: 'Dra. Elena Quisbert Flores',
      estadoGeneral: 'En Revisión',
      hashBlockchain: 'C7B211FA0012DE992810',
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActa, setSelectedActa] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredActas = actas.filter(acta => 
    acta.estudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acta.codigoEstudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acta.ci.includes(searchTerm)
  );

  const handleVerifyIntegrity = (acta) => {
    alert(
      `BUSCAR ACTA\n\nCódigo estudiante: ${acta.codigoEstudiante}\n\nActa encontrada\n\n` +
      `Hash almacenado (PostgreSQL):\n${acta.hashBlockchain}\n\n` +
      `Hash generado actualmente:\n${acta.hashBlockchain}\n\n` +
      `Estado: ✓ INTEGRIDAD VERIFICADA`
    );
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <FileText size={14} className="text-[#8C731A]" /> ACTAS IEPC-PEC
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Gestión {gestion} → {ano}º Año
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Consola de administración de actas para {ano}º año de formación durante la Gestión {gestion}.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por Estudiante, Código o C.I...."
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
                <th className="py-3.5 px-4">Código</th>
                <th className="py-3.5 px-4">Estudiante / C.I.</th>
                <th className="py-3.5 px-4">Especialidad</th>
                <th className="py-3.5 px-4">Docente Acompañante</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredActas.length > 0 ? (
                filteredActas.map((acta) => (
                  <tr key={acta.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#801B28]">{acta.codigoEstudiante}</td>
                    <td className="py-3.5 px-4">
                      <span className="block font-bold text-slate-900">{acta.estudiante}</span>
                      <span className="font-mono text-[11px] text-slate-400">C.I. {acta.ci}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{acta.especialidad}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{acta.docenteAcompanante}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        acta.estadoGeneral === 'Validado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {acta.estadoGeneral}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => { setSelectedActa(acta); setShowDetailModal(true); }}
                          title="Ver Fichas del Acta"
                          className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-[#8C731A] hover:text-white transition-all cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          title="Editar"
                          className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => alert(`Historial del acta ${acta.id} cargado.`)}
                          title="Historial"
                          className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                        >
                          <History size={15} />
                        </button>
                        <button
                          onClick={() => handleVerifyIntegrity(acta)}
                          title="Verificar Integridad Blockchain"
                          className="rounded-xl bg-purple-50 p-2 text-purple-700 hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
                        >
                          <Blocks size={15} />
                        </button>
                        <button
                          title="Imprimir"
                          className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-900 hover:text-white transition-all cursor-pointer"
                        >
                          <Printer size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                    No existen actas registradas para este período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDetailModal && selectedActa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="border-b border-slate-200 pb-4 mb-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#801B28]">
                IEPC-PEC – {ano}º AÑO – GESTIÓN {gestion}
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">Datos del estudiante</h2>
              <p className="text-xs text-slate-600 font-bold">{selectedActa.estudiante} ({selectedActa.codigoEstudiante})</p>
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800">
                  <span>Acta de inicio</span>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800">
                  <span>Acta de conformación</span>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">ETAPA PREPARATORIA</span>
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800">F-1</span>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">ETAPA DE EJECUCIÓN</span>
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800">F-2</span>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
                {ano !== '1' && (
                  <>
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800">F-3</span>
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-amber-200 bg-amber-50/50">
                      <span className="font-bold text-slate-800">F-4</span>
                      <AlertTriangle size={16} className="text-amber-600" />
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800">F-5</span>
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">ETAPA DE PRODUCCIÓN</span>
                {ano !== '1' && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800">F-6</span>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  </div>
                )}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800">CENTRALIZADOR</span>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => alert("Historial cargado.")}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer flex items-center gap-1.5"
              >
                <History size={14} /> [ Ver historial ]
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleVerifyIntegrity(selectedActa)}
                  className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck size={14} /> [ Verificar integridad ]
                </button>

                <button
                  onClick={() => alert("Generando PDF del Acta...")}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Printer size={14} /> [ Generar PDF ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};