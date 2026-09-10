import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Blocks, 
  History, 
  Key, 
  Lock, 
  Sparkles,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';

export const BlockchainIntegrityManagement = () => {
  // Estado para la búsqueda de la verificación
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [resultadoVerificacion, setResultadoVerificacion] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Historial de auditorías (Módulo de la Sección 14)
  const [historialAuditoria, setHistorialAuditoria] = useState([
    { id: 'ACT-001', codigoEstudiante: 'EST-2026-001', fecha: '05/09/2026 10:30', usuario: 'Admin', resultado: 'Coincide' },
    { id: 'ACT-002', codigoEstudiante: 'EST-2026-002', fecha: '05/09/2026 09:15', usuario: 'Admin', resultado: 'Coincide' },
    { id: 'ACT-003', codigoEstudiante: 'EST-2026-003', fecha: '04/09/2026 16:45', usuario: 'Secretaría', resultado: 'Coincide' },
  ]);

  // Simulación de verificación técnica PostgreSQL vs Blockchain SHA-256
  const handleVerificarHash = (e) => {
    e.preventDefault();
    if (!codigoBusqueda.trim()) return;

    setIsSearching(true);
    setResultadoVerificacion(null);

    setTimeout(() => {
      setIsSearching(false);
      
      // Simulación: Si el código contiene '2026' la integridad coincide, en caso contrario simula alteración
      if (codigoBusqueda.includes('2026') || codigoBusqueda === 'EST-001') {
        setResultadoVerificacion({
          encontrado: true,
          coincide: true,
          codigo: codigoBusqueda,
          hashAlmacenado: 'A8F493BC8821DE019382F9A0192837461029384756A8F493BC8821DE019382F9',
          hashActual: 'A8F493BC8821DE019382F9A0192837461029384756A8F493BC8821DE019382F9',
          fechaBloque: '02/02/2026 14:22:01',
          bloqueId: '#1,284,920'
        });

        // Agregar al historial
        setHistorialAuditoria(prev => [
          { id: `ACT-${prev.length + 1}`, codigoEstudiante: codigoBusqueda, fecha: '09/09/2026 11:45', usuario: 'Admin', resultado: 'Coincide' },
          ...prev
        ]);
      } else {
        setResultadoVerificacion({
          encontrado: true,
          coincide: false,
          codigo: codigoBusqueda,
          hashAlmacenado: 'F9E188321029384756A8F493BC8821DE019382F9A8F493BC8821DE019382F920',
          hashActual: '9928103982103982103982103982103982103982103982103982103982103982',
          fechaBloque: '01/02/2025 09:10:44',
          bloqueId: '#1,102,400'
        });

        setHistorialAuditoria(prev => [
          { id: `ACT-${prev.length + 1}`, codigoEstudiante: codigoBusqueda, fecha: '09/09/2026 11:45', usuario: 'Admin', resultado: 'No Coincide' },
          ...prev
        ]);
      }
    }, 800);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER PRINCIPAL ENCABEZADO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <Blocks size={14} className="text-[#6B9E1E]" /> Consola de Integridad Inmutable
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Integridad Blockchain
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Verificación inalterable de actas y fichas IEPC-PEC. PostgreSQL almacena la información principal y Blockchain conserva el Hash SHA-256 de verificación.
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL: VERIFICACIÓN DE INTEGRIDAD */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* BUSCADOR DE VERIFICACIÓN (2 COLS) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#801B28]" />
              Verificación de integridad
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Ingresa el código del estudiante para comparar el hash actual contra el hash registrado en Blockchain.
            </p>
          </div>

          <form onSubmit={handleVerificarHash} className="space-y-4">
            <div className="relative">
              <span className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                BUSCAR ACTA
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Código estudiante (Ej: EST-2026-001)"
                  value={codigoBusqueda}
                  onChange={(e) => setCodigoBusqueda(e.target.value)}
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-xs font-mono font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-6 py-3 text-xs font-extrabold text-white shadow-md hover:bg-[#a32334] transition-all cursor-pointer"
                >
                  {isSearching ? <RefreshCw className="animate-spin" size={16} /> : <Search size={16} />}
                  [ Buscar ]
                </button>
              </div>
            </div>
          </form>

          {/* RESULTADO DE LA VERIFICACIÓN */}
          {resultadoVerificacion && (
            <div className="mt-6 pt-4 border-t border-slate-100 animate-in fade-in">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-3">
                Acta encontrada
              </span>

              {/* MUESTRA SI COINCIDE */}
              {resultadoVerificacion.coincide ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wider">
                        ✓ INTEGRIDAD VERIFICADA
                      </h3>
                      <p className="text-[11px] font-bold text-emerald-800">
                        El documento no ha sido alterado ni modificado desde su registro.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-mono bg-white/80 p-3.5 rounded-xl border border-emerald-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Hash almacenado (PostgreSQL):</span>
                      <span className="text-slate-800 font-bold break-all">{resultadoVerificacion.hashAlmacenado}</span>
                    </div>
                    <div className="pt-2 border-t border-emerald-100">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Hash generado actualmente:</span>
                      <span className="text-emerald-700 font-bold break-all">{resultadoVerificacion.hashActual}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* MUESTRA SI NO COINCIDE */
                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md">
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-rose-950 uppercase tracking-wider">
                        ⚠ VERIFICACIÓN NO COINCIDENTE
                      </h3>
                      <p className="text-[11px] font-bold text-rose-800">
                        El hash actual no coincide con el hash registrado en Blockchain.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-mono bg-white/80 p-3.5 rounded-xl border border-rose-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Hash almacenado en registro:</span>
                      <span className="text-slate-800 font-bold break-all">{resultadoVerificacion.hashAlmacenado}</span>
                    </div>
                    <div className="pt-2 border-t border-rose-100">
                      <span className="text-rose-600 block text-[10px] font-bold uppercase">Hash actual inconsistente:</span>
                      <span className="text-rose-700 font-bold break-all">{resultadoVerificacion.hashActual}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* REGLA DE NEGOCIO Y ESTADO TÉCNICO (1 COL) */}
        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8C731A]/20 text-[#8C731A] border border-[#8C731A]/40">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Política de Seguridad</h3>
                <p className="text-[11px] text-slate-400">Inmutabilidad Garantizada</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                El Administrador <strong className="text-[#F3EFCF]">no puede editar ni alterar los datos almacenados en Blockchain</strong>.
              </p>
              <p className="text-[11px] text-slate-400">
                PostgreSQL gestiona la persistencia operativa y la red Blockchain respalda las firmas digitales mediante Hash SHA-256 para auditorías forenses.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 p-4 border border-white/10 mt-6 space-y-1">
            <span className="block text-[10px] font-bold uppercase text-slate-400">Algoritmo de Hash</span>
            <span className="block text-sm font-black text-[#6B9E1E] font-mono">SHA-256 Inmutable</span>
          </div>
        </div>

      </div>

      {/* SECCIÓN INFERIOR: HISTORIAL DE VERIFICACIONES */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <History size={18} className="text-[#8C731A]" />
              Historial de verificaciones
            </h3>
            <p className="text-xs text-slate-400">Registro de auditorías de integridad realizadas por los administradores</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Acta / Código</th>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Usuario Evaluador</th>
                <th className="py-3 px-4 text-center">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {historialAuditoria.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#801B28]">
                    {item.id} ({item.codigoEstudiante})
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">{item.fecha}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{item.usuario}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      item.resultado === 'Coincide' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.resultado === 'Coincide' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      {item.resultado}
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