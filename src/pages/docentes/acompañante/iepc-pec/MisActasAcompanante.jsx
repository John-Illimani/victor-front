import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  Eye, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  UserCheck,
  Filter,
  X 
} from 'lucide-react';

import { teacherService } from '../../../../services/teacherService';
import { studentService } from '../../../../services/studentService';
import { userService } from '../../../../services/userService';

// IMPORTACIÓN DE COMPONENTES EXPLÍCITOS PARA ACTAS
import { ActaConformacion1erAno } from '../../../admin/fichas/1año/ActaConformacion1erAno';
import { ActaInicio2doAno } from '../../../admin/fichas/2año/ActaInicio2doAno';
import { ActaConformacion2doAno } from '../../../admin/fichas/2año/ActaConformacion2doAno';
import { ActaConformacion3erAno } from '../../../admin/fichas/3año/ActaConformacion3erAno';
import { ActaInicio3erAno } from '../../../admin/fichas/3año/ActaInicio3erAno';
import { ActaSocializacion3erAno } from '../../../admin/fichas/3año/ActaSocializacion3erAno';
import { ActaFinalEvolucion_4toAno } from '../../../admin/fichas/4año/ActaFinalEvolucion_4toAno';
import { ActaPostergacion_4toAno } from '../../../admin/fichas/4año/ActaPostergacion_4toAno';
import { ActaPostergacion_5toAno } from '../../../admin/fichas/5año/ActaPostergacion_5toAno';

// CATÁLOGO COMPLETO DE FORMULARIOS Y ACTAS
const CATALAGO_FORMULARIOS_MAP = {
  acta_conformacion_equipo: { codigo: "1_ACTA_EQUIPO", nombre: "Acta de Conformación del Equipo Comunitario", ano: "1er Año" },
  ficha_f1_elaboracion_instrumentos: { codigo: "1_F1", nombre: "Ficha F-1: Elaboración y Validación de Instrumentos", ano: "1er Año" },
  ficha_f2_control_asistencia: { codigo: "1_F2", nombre: "Ficha F-2: Control de Asistencia PEC (Días detallados)", ano: "1er Año" },
  ficha_f3_aplicacion_tecnicas: { codigo: "1_F3", nombre: "Ficha F-3: Aplicación de Técnicas e Instrumentos", ano: "1er Año" },
  ficha_f4_seguimiento_docente_director: { codigo: "1_F4", nombre: "Ficha F-4: Seguimiento del Docente Guía y Director", ano: "1er Año" },
  ficha_f5_valoracion_conocimientos: { codigo: "1_F5", nombre: "Ficha F-5: Valoración de la Producción de Conocimientos", ano: "1er Año" },
  cuadro_centralizador_1ro: { codigo: "CENTRALIZADOR", nombre: "Cuadro Centralizador de Evaluación 1er Año", ano: "1er Año" },

  acta_inicio_2do: { codigo: "2_ACTA_INICIO", nombre: "Acta de Inicio - 2do Año (IEPC-PEC)", ano: "2do Año" },
  acta_conformacion_equipo_2do: { codigo: "2_ACTA_EQUIPO", nombre: "Acta de Conformación de Equipo Comunitario", ano: "2do Año" },
  ficha_f1_coordinacion_gestion: { codigo: "2_F1", nombre: "Ficha F-1: Coordinación y Gestión Comunitaria", ano: "2do Año" },
  ficha_f2_asistencia_2semanas: { codigo: "2_F2", nombre: "Ficha F-2: Asistencia PEC (2 semanas / 10 días)", ano: "2do Año" },
  ficha_f3_tecnicas_instrumentos_2do: { codigo: "2_F3", nombre: "Ficha F-3: Aplicación de Técnicas e Instrumentos", ano: "2do Año" },
  ficha_f4_apoyo_concrecion: { codigo: "2_F4", nombre: "Ficha F-4: Apoyo y Seguimiento Concreción Curricular", ano: "2do Año" },
  ficha_f5_valoracion_docente_esfm: { codigo: "2_F5", nombre: "Ficha F-5: Valoración del Docente Acompañante ESFM", ano: "2do Año" },
  ficha_f6_valoracion_produccion: { codigo: "2_F6", nombre: "Ficha F-6: Valoración de la Producción IEPC-PEC", ano: "2do Año" },
  centralizador_2do: { codigo: "CENTRALIZADOR", nombre: "Centralizador de Evaluación 2º Año", ano: "2do Año" },

  acta_conformacion_compromiso: { codigo: "3_ACTA_EQUIPO", nombre: "Acta de Conformación y Compromiso de Equipo", ano: "3er Año" },
  acta_inicio_3ro: { codigo: "3_ACTA_INICIO", nombre: "Acta de Inicio - 3er Año", ano: "3er Año" },
  acta_socializacion_diagnostico: { codigo: "3_ACTA_SOCIALIZACION", nombre: "Acta de Socialización del Diagnóstico", ano: "3er Año" },
  ficha_a1_tecnicas_investigacion: { codigo: "3_A1", nombre: "Ficha A-1: Técnicas e Instrumentos de Investigación", ano: "3er Año" },
  ficha_b1_apoyo_seguimiento_docente: { codigo: "3_B1", nombre: "Ficha B-1: Apoyo y Seguimiento Docente Acompañante", ano: "3er Año" },
  ficha_b2_asistencia_4semanas: { codigo: "3_B2", nombre: "Ficha B-2: Asistencia PEC (4 semanas)", ano: "3er Año" },
  ficha_b3_apoyo_docente_guia: { codigo: "3_B3", nombre: "Ficha B-3: Apoyo Docente Guía Concreción Curricular", ano: "3er Año" },
  ficha_b4_seguimiento_docente_tutor: { codigo: "3_B4", nombre: "Ficha B-4: Seguimiento y Apoyo Docente Tutor", ano: "3er Año" },
  ficha_b5_presentacion_informe: { codigo: "3_B5", nombre: "Ficha B-5: Presentación Informe Diagnóstico Socioparticipativo", ano: "3er Año" },
  centralizador_3ro: { codigo: "CENTRALIZADOR", nombre: "Centralizador de Evaluación 3º Año", ano: "3er Año" },

  ficha_a1_tecnicas_4to: { codigo: "4_A1", nombre: "Ficha A-1: Técnicas e Instrumentos de Investigación", ano: "4to Año" },
  ficha_a2_elaboracion_pdc: { codigo: "4_A2", nombre: "Ficha A-2: Elaboración de PDC (4 a 6 PDC)", ano: "4to Año" },
  ficha_b1_asistencia_6semanas: { codigo: "4_B1", nombre: "Ficha B-1: Control de Asistencia PEC (6 semanas)", ano: "4to Año" },
  ficha_b2_concrecion_pdc: { codigo: "4_B2", nombre: "Ficha B-2: Concreción Curricular - Desarrollo del PDC", ano: "4to Año" },
  ficha_b3_valoracion_clase: { codigo: "4_B3", nombre: "Ficha B-3: Valoración de la Clase Comunitaria", ano: "4to Año" },
  ficha_b4_centralizador_concrecion: { codigo: "4_B4", nombre: "Ficha B-4: Centralizador Concreción Curricular", ano: "4to Año" },
  ficha_b5_seguimiento_docente_guia: { codigo: "4_B5", nombre: "Ficha B-5: Seguimiento y Apoyo de la/el Docente Guía", ano: "4to Año" },
  ficha_b6_seguimiento_tutor_acompanante: { codigo: "4_B6", nombre: "Ficha B-6: Seguimiento y Apoyo Docente Tutor Acompañante", ano: "4to Año" },
  ficha_b7_diagnostico_ue_cea_cee: { codigo: "4_B7", nombre: "Ficha B-7: Diagnóstico Socioparticipativo de la UE/CEA/CEE", ano: "4to Año" },
  ficha_c1_evaluacion_diseno_metodologico: { codigo: "4_C1", nombre: "Ficha C-1: Evaluación Documento de Diseño Metodológico", ano: "4to Año" },
  ficha_c2_socializacion_diseno: { codigo: "4_C2", nombre: "Ficha C-2: Socialización del Diseño Metodológico", ano: "4to Año" },
  acta_final_evaluacion_diseno: { codigo: "4_ACTA_FINAL", nombre: "Acta Final de Evaluación del Diseño Metodológico", ano: "4to Año" },
  acta_postergacion_socializacion: { codigo: "4_ACTA_POSTERGACION", nombre: "Acta de Postergación de la Socialización Oral", ano: "4to Año" },
  ficha_centralizadora_4to: { codigo: "CENTRALIZADOR", nombre: "Ficha Centralizadora de Evaluación 4to Año", ano: "4to Año" },

  ficha_a1_planificacion_pdc: { codigo: "5_A1", nombre: "Ficha A-1: Planificación y Elaboración de PDC", ano: "5to Año" },
  ficha_b1_asistencia_10semanas: { codigo: "5_B1", nombre: "Ficha B-1: Control de Asistencia PEC (10 Semanas)", ano: "5to Año" },
  ficha_b2_aplicacion_pdc: { codigo: "5_B2", nombre: "Ficha B-2: Concreción Curricular - Aplicación del PDC", ano: "5to Año" },
  ficha_b3_valoracion_clase_5to: { codigo: "5_B3", nombre: "Ficha B-3: Valoración de la Clase Comunitaria", ano: "5to Año" },
  ficha_b4_centralizador_desarrollo_pdc: { codigo: "5_B4", nombre: "Ficha B-4: Centralizador de Desarrollo de PDC", ano: "5to Año" },
  ficha_b5_centralizador_seguimiento_guia: { codigo: "5_B5", nombre: "Ficha B-5: Centralizador Seguimiento y Apoyo del Docente Guía", ano: "5to Año" },
  ficha_b6_apoyo_tutor_acompanante: { codigo: "5_B6", nombre: "Ficha B-6: Apoyo y Seguimiento Docente Tutor Acompañante", ano: "5to Año" },
  ficha_c1_evaluacion_trabajo_grado: { codigo: "5_C1", nombre: "Ficha C-1: Evaluación del Documento de Trabajo de Grado", ano: "5to Año" },
  ficha_c2_socializacion_trabajo_grado: { codigo: "5_C2", nombre: "Ficha C-2: Socialización del Trabajo de Grado", ano: "5to Año" },
  acta_postergacion_trabajo_grado: { codigo: "5_ACTA_POSTERGACION", nombre: "Acta de Postergación de la Socialización de Trabajo de Grado", ano: "5to Año" },
  ficha_centralizadora_5to: { codigo: "CENTRALIZADOR", nombre: "Ficha Centralizadora Cualitativa-Cuantitativa (5to Año)", ano: "5to Año" }
};

// COMPONENTES DE ACTAS MAPEADOS
const COMPONENTES_ACTAS_MAP = {
  "1_ACTA_EQUIPO": ActaConformacion1erAno,
  "2_ACTA_INICIO": ActaInicio2doAno,
  "2_ACTA_EQUIPO": ActaConformacion2doAno,
  "3_ACTA_EQUIPO": ActaConformacion3erAno,
  "3_ACTA_INICIO": ActaInicio3erAno,
  "3_ACTA_SOCIALIZACION": ActaSocializacion3erAno,
  "4_ACTA_FINAL": ActaFinalEvolucion_4toAno,
  "4_ACTA_POSTERGACION": ActaPostergacion_4toAno,
  "5_ACTA_POSTERGACION": ActaPostergacion_5toAno
};

// NORMALIZADOR DE FORMATO DE AÑO DE FORMACIÓN
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

export const MisActasAcompanante = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const [todosLosEstudiantes, setTodosLosEstudiantes] = useState([]);
  const [estudiantesFiltrados, setEstudiantesFiltrados] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [selectedAno, setSelectedAno] = useState('1er Año');
  const [actasHabilitadasBD, setActasHabilitadasBD] = useState([]);

  // ESTADOS MODAL DE ACTA
  const [selectedActa, setSelectedActa] = useState(null);
  const [fichaData, setFichaData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchActasData = async () => {
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

        // Extraer solo las actas activadas en true desde la base de datos
        const formsMap = currentUserData.formularios_habilitados || {};
        const actasFiltradas = Object.entries(formsMap)
          .filter(([key, isEnabled]) => {
            const estaEnTrue = isEnabled === true;
            const empiezaConActa = key.toLowerCase().startsWith("acta_");
            const existeEnCatalogo = Boolean(CATALAGO_FORMULARIOS_MAP[key]);
            return estaEnTrue && empiezaConActa && existeEnCatalogo;
          })
          .map(([key]) => ({
            key,
            ...CATALAGO_FORMULARIOS_MAP[key]
          }));

        setActasHabilitadasBD(actasFiltradas);

        // Cargar lista de estudiantes asignados
        const docenteId = currentUserData.id || currentUserData.docente_id;
        if (docenteId) {
          const assigned = await teacherService.getAssignedStudents(docenteId);
          const listaEst = Array.isArray(assigned) ? assigned : assigned?.estudiantes || [];
          setTodosLosEstudiantes(listaEst);
        }

      } catch (err) {
        console.error("Error al cargar datos:", err);
        setErrorMessage("Error de conexión al obtener la información de actas.");
      } finally {
        setLoading(false);
      }
    };

    fetchActasData();
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

  // FILTRAR ACTAS QUE CORRESPONDEN AL AÑO SELECCIONADO
  const actasDelAnoSeleccionado = actasHabilitadasBD.filter(
    acta => normalizarAnoStr(acta.ano) === selectedAno
  );

  const handleOpenActaModal = async (acta) => {
    if (!selectedStudent) {
      alert("No hay un estudiante seleccionado para este año de formación.");
      return;
    }

    setSelectedActa(acta);
    setActionLoading(true);

    try {
      const res = await studentService.getFicha(selectedStudent.id, acta.codigo);
      setFichaData(res.datos || {});
    } catch (err) {
      setFichaData({});
    } finally {
      setActionLoading(false);
    }
  };

  const ComponenteActaModal = selectedActa ? COMPONENTES_ACTAS_MAP[selectedActa.codigo] : null;

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
            <FileCheck2 size={14} className="text-[#8C731A]" /> Gestión Documental
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Mis Actas Habilitadas
            <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Gestión de actas oficiales de evaluación IEPC-PEC filtradas por curso y practicante.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={18} />
          {errorMessage}
        </div>
      )}

      {/* CONTROLES DE FILTRADO: AÑO Y ESTUDIANTE */}
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

      {/* LISTADO DE ACTAS HABILITADAS */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
            <FileCheck2 size={18} className="text-[#801B28]" /> Actas Habilitadas - {selectedAno} ({actasDelAnoSeleccionado.length})
          </h2>
          {selectedStudent ? (
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full w-fit">
              Estudiante: <strong className="text-slate-900">{selectedStudent.nombre} {selectedStudent.apellido}</strong>
            </span>
          ) : (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full w-fit">
              Visualizando actas sin asignación directa
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center font-bold text-slate-500 text-xs">
            <Loader2 className="animate-spin inline mr-2 text-[#801B28]" size={18} />
            Cargando actas de evaluación...
          </div>
        ) : actasDelAnoSeleccionado.length > 0 ? (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
            {actasDelAnoSeleccionado.map((acta) => (
              <div
                key={acta.key}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 text-xs hover:bg-slate-50 transition-colors"
              >
                <div>
                  <span className="font-extrabold text-slate-900 block text-sm">{acta.nombre}</span>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[#8C731A] text-[10px] font-black uppercase">
                    {acta.ano}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenActaModal(acta)}
                  disabled={!selectedStudent}
                  className="px-4 py-2 rounded-xl bg-[#801B28] text-white font-extrabold hover:bg-[#a32334] text-xs cursor-pointer transition-all shadow-sm disabled:opacity-50 shrink-0 flex items-center gap-1.5 justify-center"
                >
                  <Eye size={14} /> Abrir / Evaluar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 font-medium text-xs border border-dashed border-slate-200 rounded-2xl space-y-1">
            <p className="font-bold text-slate-600">No existen actas habilitadas para {selectedAno}.</p>
            <p className="text-[11px] text-slate-400">El administrador no ha habilitado formularios de tipo acta para este curso.</p>
          </div>
        )}
      </div>

      {/* MODAL DE EVALUACIÓN DE ACTA */}
      {selectedActa && selectedStudent && ComponenteActaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-[#801B28] px-5 py-3 text-white flex items-center justify-between shrink-0">
              <span className="text-xs font-black tracking-wide uppercase truncate pr-4">
                {selectedActa.nombre} — ({selectedStudent.nombre} {selectedStudent.apellido})
              </span>
              <button
                onClick={() => setSelectedActa(null)}
                className="rounded-full p-1 text-white/80 hover:text-white hover:bg-white/20 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {actionLoading ? (
                <div className="py-12 text-center font-bold text-slate-500">
                  <Loader2 className="animate-spin inline mr-2 text-[#8C731A]" size={20} /> Cargando datos del acta...
                </div>
              ) : (
                <ComponenteActaModal
                  isOpen={Boolean(selectedActa)}
                  onClose={() => setSelectedActa(null)}
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