import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  UserCheck,
  Filter,
  Eye, 
  X 
} from 'lucide-react';

import { teacherService } from '../../../../services/teacherService';
import { studentService } from '../../../../services/studentService';
import { userService } from '../../../../services/userService';

// IMPORTACIÓN DE COMPONENTES CENTRALIZADORES EXACTOS
import { Centralizador1erAno } from '../../../admin/fichas/1año/Centralizador1erAno';
import { Centralizador2doAno } from '../../../admin/fichas/2año/Centralizador2doAno';
import { Centralizador3erAno } from '../../../admin/fichas/3año/Centralizador3erAno';
import { Centralizador4toAno } from '../../../admin/fichas/4año/Centralizador4toAno';
import { Centralizador5toAno } from '../../../admin/fichas/5año/Centralizador5toAno';

// CATÁLOGO MAPPING PARA CENTRALIZADORES
const CATALAGO_CENTRALIZADORES_MAP = {
  cuadro_centralizador_1ro: { codigo: "CENTRALIZADOR", numAno: "1", nombre: "Cuadro Centralizador de Evaluación 1er Año", ano: "1er Año" },
  centralizador_2do: { codigo: "CENTRALIZADOR", numAno: "2", nombre: "Centralizador de Evaluación 2º Año", ano: "2do Año" },
  centralizador_3ro: { codigo: "CENTRALIZADOR", numAno: "3", nombre: "Centralizador de Evaluación 3º Año", ano: "3er Año" },
  ficha_centralizadora_4to: { codigo: "CENTRALIZADOR", numAno: "4", nombre: "Ficha Centralizadora de Evaluación 4to Año", ano: "4to Año" },
  ficha_centralizadora_5to: { codigo: "CENTRALIZADOR", numAno: "5", nombre: "Ficha Centralizadora Cualitativa-Cuantitativa (5to Año)", ano: "5to Año" }
};

const COMPONENTES_CENTRALIZADORES = {
  "1": Centralizador1erAno,
  "2": Centralizador2doAno,
  "3": Centralizador3erAno,
  "4": Centralizador4toAno,
  "5": Centralizador5toAno
};

// HELPER PARA NORMALIZAR Y OBTENER EL AÑO EN FORMATO ESTÁNDAR
const normalizarAnoStr = (cadena) => {
  if (!cadena) return '';
  const c = cadena.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (c.includes("1") || c.includes("primer")) return "1er Año";
  if (c.includes("2") || c.includes("segundo")) return "2do Año";
  if (c.includes("3") || c.includes("tercer")) return "3er Año";
  if (c.includes("4") || c.includes("cuarto")) return "4to Año";
  if (c.includes("5") || c.includes("quinto")) return "5to Año";
  return cadena;
};

export const CentralizadoresAcompanante = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const [todosLosEstudiantes, setTodosLosEstudiantes] = useState([]);
  const [estudiantesFiltrados, setEstudiantesFiltrados] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [selectedAno, setSelectedAno] = useState('1er Año');
  const [centralizadoresHabilitadosBD, setCentralizadoresHabilitadosBD] = useState([]);

  // ESTADOS MODAL DE CENTRALIZADOR
  const [activeAnoCentralizador, setActiveAnoCentralizador] = useState(null);
  const [fichaData, setFichaData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchAssigned = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const savedUserStr = localStorage.getItem("user");
        let currentUserData = savedUserStr ? JSON.parse(savedUserStr) : null;

        if (!currentUserData) {
          setErrorMessage("No se encontró la sesión del usuario autenticado.");
          setLoading(false);
          return;
        }

        try {
          const allUsers = await userService.getUsers();
          const list = Array.isArray(allUsers) ? allUsers : allUsers?.usuarios || [];
          const found = list.find(u => u.id === currentUserData.id || u.username === currentUserData.username);
          if (found) {
            currentUserData = found;
            localStorage.setItem("user", JSON.stringify(found));
          }
        } catch (e) {
          console.warn("Usando sesión almacenada en localStorage.");
        }

        // Extraer centralizadores habilitados en true desde la base de datos
        const formsMap = currentUserData.formularios_habilitados || {};
        const centralizadoresFiltrados = Object.entries(formsMap)
          .filter(([key, isEnabled]) => {
            const estaEnTrue = isEnabled === true;
            const existeEnCatalogo = Boolean(CATALAGO_CENTRALIZADORES_MAP[key]);
            return estaEnTrue && existeEnCatalogo;
          })
          .map(([key]) => ({
            key,
            ...CATALAGO_CENTRALIZADORES_MAP[key]
          }));

        setCentralizadoresHabilitadosBD(centralizadoresFiltrados);

        // Cargar lista de estudiantes asignados
        const docenteId = currentUserData.id || currentUserData.docente_id;
        if (docenteId) {
          const assigned = await teacherService.getAssignedStudents(docenteId);
          const listaEst = Array.isArray(assigned) ? assigned : assigned?.estudiantes || [];
          setTodosLosEstudiantes(listaEst);
        }
      } catch (err) {
        console.error("Error al cargar centralizadores:", err);
        setErrorMessage("Error de conexión al obtener la información del centralizador.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssigned();
  }, []);

  // REACCIONAR Y FILTRAR ESTUDIANTES AL CAMBIAR EL AÑO SELECCIONADO
  useEffect(() => {
    const estudiantesDelAno = todosLosEstudiantes.filter(est => {
      const anoEst = normalizarAnoStr(est.ano_formacion);
      return anoEst === selectedAno;
    });

    setEstudiantesFiltrados(estudiantesDelAno);

    if (estudiantesDelAno.length > 0) {
      setSelectedStudent(estudiantesDelAno[0]);
    } else {
      setSelectedStudent(null);
    }
  }, [selectedAno, todosLosEstudiantes]);

  // FILTRAR CENTRALIZADORES QUE CORRESPONDEN AL AÑO SELECCIONADO
  const centralizadoresDelAnoSeleccionado = centralizadoresHabilitadosBD.filter(
    item => normalizarAnoStr(item.ano) === selectedAno
  );

  const handleOpenCentralizador = async (itemCentralizador) => {
    if (!selectedStudent) {
      alert("No hay un estudiante seleccionado para este año de formación.");
      return;
    }

    setActiveAnoCentralizador(itemCentralizador.numAno);
    setActionLoading(true);

    try {
      const res = await studentService.getFicha(selectedStudent.id, "CENTRALIZADOR");
      setFichaData(res.datos || {});
    } catch (err) {
      setFichaData({});
    } finally {
      setActionLoading(false);
    }
  };

  const ComponenteCentralizador = activeAnoCentralizador ? COMPONENTES_CENTRALIZADORES[activeAnoCentralizador] : null;

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO */}
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
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Consolidado cualitativo y cuantitativo de notas por año de formación y estudiante practicante.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={18} />
          {errorMessage}
        </div>
      )}

      {/* FILTROS: AÑO DE FORMACIÓN Y ESTUDIANTE SÍNCRONO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        
        {/* SELECCIÓN DE AÑO */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Filter size={14} className="text-[#801B28]" /> 1. Filtrar por Año de Formación
          </label>
          <select
            value={selectedAno}
            onChange={(e) => setSelectedAno(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none bg-white cursor-pointer"
          >
            <option value="1er Año">1er Año</option>
            <option value="2do Año">2do Año</option>
            <option value="3er Año">3er Año</option>
            <option value="4to Año">4to Año</option>
            <option value="5to Año">5to Año</option>
          </select>
        </div>

        {/* SELECCIÓN DE ESTUDIANTE (FILTRADO AUTOMÁTICAMENTE POR EL AÑO) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck size={14} className="text-[#801B28]" /> 2. Estudiante Practicante ({selectedAno})
          </label>
          <select
            value={selectedStudent ? selectedStudent.id : ''}
            onChange={(e) => {
              const est = estudiantesFiltrados.find(s => s.id === e.target.value);
              setSelectedStudent(est || null);
            }}
            disabled={estudiantesFiltrados.length === 0}
            className="w-full rounded-2xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none bg-white cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
          >
            {estudiantesFiltrados.length > 0 ? (
              estudiantesFiltrados.map((est) => (
                <option key={est.id} value={est.id}>
                  {est.nombre} {est.apellido} - CI: {est.ci}
                </option>
              ))
            ) : (
              <option value="">No hay estudiantes registrados en {selectedAno}</option>
            )}
          </select>
        </div>

      </div>

      {/* LISTADO DE CENTRALIZADORES HABILITADOS */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
            <Award size={18} className="text-[#801B28]" /> Centralizadores Habilitados - {selectedAno} ({centralizadoresDelAnoSeleccionado.length})
          </h2>
          {selectedStudent ? (
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full w-fit">
              Estudiante: <strong className="text-slate-900">{selectedStudent.nombre} {selectedStudent.apellido}</strong>
            </span>
          ) : (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full w-fit">
              Visualizando centralizador sin asignación directa
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center font-bold text-slate-500 text-xs">
            <Loader2 className="animate-spin inline mr-2 text-[#801B28]" size={18} />
            Cargando centralizadores de evaluación...
          </div>
        ) : centralizadoresDelAnoSeleccionado.length > 0 ? (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
            {centralizadoresDelAnoSeleccionado.map((item) => (
              <div
                key={item.key}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 text-xs hover:bg-slate-50 transition-colors"
              >
                <div>
                  <span className="font-extrabold text-slate-900 block text-sm">{item.nombre}</span>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[#8C731A] text-[10px] font-black uppercase">
                    {item.ano}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenCentralizador(item)}
                  disabled={!selectedStudent}
                  className="px-4 py-2 rounded-xl bg-[#801B28] text-white font-extrabold hover:bg-[#a32334] text-xs cursor-pointer transition-all shadow-sm disabled:opacity-50 shrink-0 flex items-center gap-1.5 justify-center"
                >
                  <Eye size={14} /> Abrir Centralizador
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 font-medium text-xs border border-dashed border-slate-200 rounded-2xl space-y-1">
            <p className="font-bold text-slate-600">No existen centralizadores habilitados para {selectedAno}.</p>
            <p className="text-[11px] text-slate-400">El administrador no ha habilitado el centralizador de notas para este curso.</p>
          </div>
        )}
      </div>

      {/* MODAL DEL CENTRALIZADOR */}
      {selectedStudent && ComponenteCentralizador && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-[#801B28] px-5 py-3 text-white flex items-center justify-between shrink-0">
              <span className="text-xs font-black tracking-wide uppercase truncate pr-4">
                CENTRALIZADOR DE NOTAS — ({selectedStudent.nombre} {selectedStudent.apellido})
              </span>
              <button
                onClick={() => setActiveAnoCentralizador(null)}
                className="rounded-full p-1 text-white/80 hover:text-white hover:bg-white/20 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {actionLoading ? (
                <div className="py-12 text-center font-bold text-slate-500">
                  <Loader2 className="animate-spin inline mr-2 text-[#8C731A]" size={20} /> Cargando notas del centralizador...
                </div>
              ) : (
                <ComponenteCentralizador
                  isOpen={Boolean(activeAnoCentralizador)}
                  onClose={() => setActiveAnoCentralizador(null)}
                  fichaData={fichaData}
                  setFichaData={setFichaData}
                  listaDocentes={[]}
                  estudianteSeleccionado={selectedStudent}
                />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};