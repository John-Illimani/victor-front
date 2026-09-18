import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Eye, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  FileText,
  X,
  LogOut,
  CheckCircle2,
  FileQuestion
} from 'lucide-react';

import { studentService } from '../../services/studentService';

// IMPORTACIÓN DE COMPONENTES EXPLÍCITOS DE FICHAS POR AÑO DE FORMACIÓN
import { FichaF1_1erAno } from '../admin/fichas/1año/FichaF1_1erAno';
import { FichaF2_1erAno } from '../admin/fichas/1año/FichaF2_1erAno';
import { FichaF3_1erAno } from '../admin/fichas/1año/FichaF3_1erAno';
import { FichaF4_1erAno } from '../admin/fichas/1año/FichaF4_1erAno';
import { FichaF5_1erAno } from '../admin/fichas/1año/FichaF5_1erAno';

import { FichaF1_2doAno } from '../admin/fichas/2año/FichaF1_2doAno';
import { FichaF2_2doAno } from '../admin/fichas/2año/FichaF2_2doAno';
import { FichaF3_2doAno } from '../admin/fichas/2año/FichaF3_2doAno';
import { FichaF4_2doAno } from '../admin/fichas/2año/FichaF4_2doAno';
import { FichaF5_2doAno } from '../admin/fichas/2año/FichaF5_2doAno';
import { FichaF6_2doAno } from '../admin/fichas/2año/FichaF6_2doAno';

import { FichaA1_3erAno } from '../admin/fichas/3año/FichaA1_3erAno';
import { FichaB1_3erAno } from '../admin/fichas/3año/FichaB1_3erAno';
import { FichaB2_3erAno } from '../admin/fichas/3año/FichaB2_3erAno';
import { FichaB3_3erAno } from '../admin/fichas/3año/FichaB3_3erAno';
import { FichaB4_3erAno } from '../admin/fichas/3año/FichaB4_3erAno';
import { FichaB5_3erAno } from '../admin/fichas/3año/FichaB5_3erAno';

import { FichaA1_4toAno } from '../admin/fichas/4año/FichaA1_4toAno';
import { FichaA2_4toAno } from '../admin/fichas/4año/FichaA2_4toAno';
import { FichaB1_4toAno } from '../admin/fichas/4año/FichaB1_4toAno';
import { FichaB2_4toAno } from '../admin/fichas/4año/FichaB2_4toAno';
import { FichaB3_4toAno } from '../admin/fichas/4año/FichaB3_4toAno';
import { FichaB4_4toAno } from '../admin/fichas/4año/FichaB4_4toAno';
import { FichaB5_4toAno } from '../admin/fichas/4año/FichaB5_4toAno';
import { FichaB6_4toAno } from '../admin/fichas/4año/FichaB6_4toAno';
import { FichaB7_4toAno } from '../admin/fichas/4año/FichaB7_4toAno';
import { FichaC1_4toAno } from '../admin/fichas/4año/FichaC1_4toAno';
import { FichaC2_4toAno } from '../admin/fichas/4año/FichaC2_4toAno';

import { FichaA1_5toAno } from '../admin/fichas/5año/FichaA1_5toAno';
import { FichaB1_5toAno } from '../admin/fichas/5año/FichaB1_5toAno';
import { FichaB2_5toAno } from '../admin/fichas/5año/FichaB2_5toAno';
import { FichaB3_5toAno } from '../admin/fichas/5año/FichaB3_5toAno';
import { FichaB4_5toAno } from '../admin/fichas/5año/FichaB4_5toAno';
import { FichaB5_5toAno } from '../admin/fichas/5año/FichaB5_5toAno';
import { FichaB6_5toAno } from '../admin/fichas/5año/FichaB6_5toAno';
import { FichaC1_5toAno } from '../admin/fichas/5año/FichaC1_5toAno';
import { FichaC2_5toAno } from '../admin/fichas/5año/FichaC2_5toAno';

// CATÁLOGO COMPLETO DE FICHAS PEDAGÓGICAS POR AÑO
const CATALAGO_FICHAS_ESTUDIANTE = [
  // 1er Año
  { codigo: "1_F1", nombre: "Ficha F-1: Elaboración y Validación de Instrumentos", ano: "1er Año" },
  { codigo: "1_F2", nombre: "Ficha F-2: Control de Asistencia PEC (Días detallados)", ano: "1er Año" },
  { codigo: "1_F3", nombre: "Ficha F-3: Aplicación de Técnicas e Instrumentos", ano: "1er Año" },
  { codigo: "1_F4", nombre: "Ficha F-4: Seguimiento del Docente Guía y Director", ano: "1er Año" },
  { codigo: "1_F5", nombre: "Ficha F-5: Valoración de la Producción de Conocimientos", ano: "1er Año" },

  // 2do Año
  { codigo: "2_F1", nombre: "Ficha F-1: Coordinación y Gestión Comunitaria", ano: "2do Año" },
  { codigo: "2_F2", nombre: "Ficha F-2: Asistencia PEC (2 semanas / 10 días)", ano: "2do Año" },
  { codigo: "2_F3", nombre: "Ficha F-3: Aplicación de Técnicas e Instrumentos", ano: "2do Año" },
  { codigo: "2_F4", nombre: "Ficha F-4: Apoyo y Seguimiento Concreción Curricular", ano: "2do Año" },
  { codigo: "2_F5", nombre: "Ficha F-5: Valoración del Docente Acompañante ESFM", ano: "2do Año" },
  { codigo: "2_F6", nombre: "Ficha F-6: Valoración de la Producción IEPC-PEC", ano: "2do Año" },

  // 3er Año
  { codigo: "3_A1", nombre: "Ficha A-1: Técnicas e Instrumentos de Investigación", ano: "3er Año" },
  { codigo: "3_B1", nombre: "Ficha B-1: Apoyo y Seguimiento Docente Acompañante", ano: "3er Año" },
  { codigo: "3_B2", nombre: "Ficha B-2: Asistencia PEC (4 semanas)", ano: "3er Año" },
  { codigo: "3_B3", nombre: "Ficha B-3: Apoyo Docente Guía Concreción Curricular", ano: "3er Año" },
  { codigo: "3_B4", nombre: "Ficha B-4: Seguimiento y Apoyo Docente Tutor", ano: "3er Año" },
  { codigo: "3_B5", nombre: "Ficha B-5: Presentación Informe Diagnóstico Socioparticipativo", ano: "3er Año" },

  // 4to Año
  { codigo: "4_A1", nombre: "Ficha A-1: Técnicas e Instrumentos de Investigación", ano: "4to Año" },
  { codigo: "4_A2", nombre: "Ficha A-2: Elaboración de PDC (4 a 6 PDC)", ano: "4to Año" },
  { codigo: "4_B1", nombre: "Ficha B-1: Control de Asistencia PEC (6 semanas)", ano: "4to Año" },
  { codigo: "4_B2", nombre: "Ficha B-2: Concreción Curricular - Desarrollo del PDC", ano: "4to Año" },
  { codigo: "4_B3", nombre: "Ficha B-3: Valoración de la Clase Comunitaria", ano: "4to Año" },
  { codigo: "4_B4", nombre: "Ficha B-4: Centralizador Concreción Curricular", ano: "4to Año" },
  { codigo: "4_B5", nombre: "Ficha B-5: Seguimiento y Apoyo de la/el Docente Guía", ano: "4to Año" },
  { codigo: "4_B6", nombre: "Ficha B-6: Seguimiento y Apoyo Docente Tutor Acompañante", ano: "4to Año" },
  { codigo: "4_B7", nombre: "Ficha B-7: Diagnóstico Socioparticipativo de la UE/CEA/CEE", ano: "4to Año" },
  { codigo: "4_C1", nombre: "Ficha C-1: Evaluación Documento de Diseño Metodológico", ano: "4to Año" },
  { codigo: "4_C2", nombre: "Ficha C-2: Socialización del Diseño Metodológico", ano: "4to Año" },

  // 5to Año
  { codigo: "5_A1", nombre: "Ficha A-1: Planificación y Elaboración de PDC", ano: "5to Año" },
  { codigo: "5_B1", nombre: "Ficha B-1: Control de Asistencia PEC (10 Semanas)", ano: "5to Año" },
  { codigo: "5_B2", nombre: "Ficha B-2: Concreción Curricular - Aplicación del PDC", ano: "5to Año" },
  { codigo: "5_B3", nombre: "Ficha B-3: Valoración de la Clase Comunitaria", ano: "5to Año" },
  { codigo: "5_B4", nombre: "Ficha B-4: Centralizador de Desarrollo de PDC", ano: "5to Año" },
  { codigo: "5_B5", nombre: "Ficha B-5: Centralizador Seguimiento y Apoyo del Docente Guía", ano: "5to Año" },
  { codigo: "5_B6", nombre: "Ficha B-6: Apoyo y Seguimiento Docente Tutor Acompañante", ano: "5to Año" },
  { codigo: "5_C1", nombre: "Ficha C-1: Evaluación del Documento de Trabajo de Grado", ano: "5to Año" },
  { codigo: "5_C2", nombre: "Ficha C-2: Socialización del Trabajo de Grado", ano: "5to Año" }
];

// DICCIONARIOS DE COMPONENTES DE FICHAS POR AÑO
const COMPONENTES_1ER_ANO = {
  "1_F1": FichaF1_1erAno,
  "1_F2": FichaF2_1erAno,
  "1_F3": FichaF3_1erAno,
  "1_F4": FichaF4_1erAno,
  "1_F5": FichaF5_1erAno,
};

const COMPONENTES_2DO_ANO = {
  "2_F1": FichaF1_2doAno,
  "2_F2": FichaF2_2doAno,
  "2_F3": FichaF3_2doAno,
  "2_F4": FichaF4_2doAno,
  "2_F5": FichaF5_2doAno,
  "2_F6": FichaF6_2doAno,
};

const COMPONENTES_3ER_ANO = {
  "3_A1": FichaA1_3erAno,
  "3_B1": FichaB1_3erAno,
  "3_B2": FichaB2_3erAno,
  "3_B3": FichaB3_3erAno,
  "3_B4": FichaB4_3erAno,
  "3_B5": FichaB5_3erAno,
};

const COMPONENTES_4TO_ANO = {
  "4_A1": FichaA1_4toAno,
  "4_A2": FichaA2_4toAno,
  "4_B1": FichaB1_4toAno,
  "4_B2": FichaB2_4toAno,
  "4_B3": FichaB3_4toAno,
  "4_B4": FichaB4_4toAno,
  "4_B5": FichaB5_4toAno,
  "4_B6": FichaB6_4toAno,
  "4_B7": FichaB7_4toAno,
  "4_C1": FichaC1_4toAno,
  "4_C2": FichaC2_4toAno,
};

const COMPONENTES_5TO_ANO = {
  "5_A1": FichaA1_5toAno,
  "5_B1": FichaB1_5toAno,
  "5_B2": FichaB2_5toAno,
  "5_B3": FichaB3_5toAno,
  "5_B4": FichaB4_5toAno,
  "5_B5": FichaB5_5toAno,
  "5_B6": FichaB6_5toAno,
  "5_C1": FichaC1_5toAno,
  "5_C2": FichaC2_5toAno,
};

// HELPER DE NORMALIZACIÓN DE AÑO DE FORMACIÓN
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

export const MisFichasEstudiante = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const [estudianteLogueado, setEstudianteLogueado] = useState(null);
  const [fichasStatusMap, setFichasStatusMap] = useState({});

  // ESTADO DE FICHA ACTIVA PARA PREVISUALIZACIÓN
  const [activeFicha, setActiveFicha] = useState(null);
  const [fichaData, setFichaData] = useState({});

  useEffect(() => {
    const cargarFichasEstudiante = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const savedUserStr = localStorage.getItem("user");
        if (!savedUserStr) {
          setErrorMessage("No se encontró una sesión activa de estudiante.");
          setLoading(false);
          return;
        }

        const student = JSON.parse(savedUserStr);
        setEstudianteLogueado(student);

        const studentId = student.id || student.estudiante_id || student.ci;
        if (!studentId) {
          setErrorMessage("Identificador de estudiante no válido.");
          setLoading(false);
          return;
        }

        // Obtener la información de cada ficha desde backend
        const statusMap = {};
        
        await Promise.all(
          CATALAGO_FICHAS_ESTUDIANTE.map(async (ficha) => {
            try {
              const res = await studentService.getFicha(studentId, ficha.codigo);
              const datos = res?.datos || {};
              const tieneInformacion = Object.keys(datos).length > 0;

              statusMap[ficha.codigo] = {
                hasData: tieneInformacion,
                data: datos
              };
            } catch (err) {
              statusMap[ficha.codigo] = { hasData: false, data: {} };
            }
          })
        );

        setFichasStatusMap(statusMap);

      } catch (err) {
        console.error("Error al cargar las fichas del estudiante:", err);
        setErrorMessage("Error de conexión al obtener tus fichas pedagógicas.");
      } finally {
        setLoading(false);
      }
    };

    cargarFichasEstudiante();
  }, []);

  // FILTRAR FICHAS CORRESPONDIENTES AL AÑO DEL ESTUDIANTE
  const anoEstudiante = normalizarAnoStr(estudianteLogueado?.ano_formacion || '1er Año');
  const misFichasCorrespondientes = CATALAGO_FICHAS_ESTUDIANTE.filter(
    ficha => normalizarAnoStr(ficha.ano) === anoEstudiante
  );

  // ABRIR FICHA EN SOLO LECTURA
  const handleOpenFicha = (ficha) => {
    const status = fichasStatusMap[ficha.codigo];
    setActiveFicha(ficha);
    setFichaData(status?.data || {});
  };

  const getComponenteExplicito = () => {
    if (!activeFicha) return null;

    if (anoEstudiante === "1er Año") return COMPONENTES_1ER_ANO[activeFicha.codigo] || null;
    if (anoEstudiante === "2do Año") return COMPONENTES_2DO_ANO[activeFicha.codigo] || null;
    if (anoEstudiante === "3er Año") return COMPONENTES_3ER_ANO[activeFicha.codigo] || null;
    if (anoEstudiante === "4to Año") return COMPONENTES_4TO_ANO[activeFicha.codigo] || null;
    if (anoEstudiante === "5to Año") return COMPONENTES_5TO_ANO[activeFicha.codigo] || null;
    return null;
  };

  const ComponenteFichaExplicito = getComponenteExplicito();

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO INSTITUCIONAL */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <FolderOpen size={14} className="text-[#8C731A]" /> Registro de Evidencias
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Mis Fichas
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Consulta de fichas de seguimiento y evaluación pedagógica registradas en la gestión IEPC-PEC.
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

      {/* INFORMACIÓN DEL ESTUDIANTE */}
      {estudianteLogueado && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-[#801B28]">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-base">
                {estudianteLogueado.nombre} {estudianteLogueado.apellido}
              </h2>
              <span className="text-xs font-mono text-slate-500 font-bold block">
                C.I.: {estudianteLogueado.ci || 'S/N'} | Usuario: {estudianteLogueado.username}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-black uppercase">
              {anoEstudiante}
            </span>
          </div>
        </div>
      )}

      {/* LISTADO DE FICHAS */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <FolderOpen size={18} className="text-[#801B28]" />
            Fichas Pedagógicas — {anoEstudiante}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Puedes previsualizar el contenido de cualquiera de tus fichas en modo de solo lectura.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center font-bold text-slate-500 text-xs">
            <Loader2 className="animate-spin inline mr-2 text-[#801B28]" size={18} />
            Cargando fichas de evaluación...
          </div>
        ) : misFichasCorrespondientes.length > 0 ? (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
            {misFichasCorrespondientes.map((ficha) => {
              const status = fichasStatusMap[ficha.codigo] || { hasData: false };
              const hasData = status.hasData;

              return (
                <div
                  key={ficha.codigo}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 text-xs bg-white hover:bg-slate-50/80 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm block">
                        {ficha.nombre}
                      </span>
                      {hasData ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={11} /> REGISTRADA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-500 border border-slate-200">
                          <FileQuestion size={11} /> 
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Código: {ficha.codigo} — {ficha.ano}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenFicha(ficha)}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-sm bg-[#801B28] text-white hover:bg-[#a32334] cursor-pointer"
                  >
                    <Eye size={14} /> Visualizar Ficha
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 font-medium text-xs border border-dashed border-slate-200 rounded-2xl">
            No existen fichas asignadas para el año de formación {anoEstudiante}.
          </div>
        )}
      </div>

      {/* VISUALIZACIÓN EN SOLO LECTURA CON SCROLL HABILITADO */}
      {activeFicha && ComponenteFichaExplicito && (
        <React.Fragment>
          {/* BOTÓN FLOTANTE SUPERIOR CERRAR */}
          <button
            onClick={() => setActiveFicha(null)}
            className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] bg-[#801B28] text-white p-3 rounded-full shadow-2xl hover:bg-[#a32334] transition-all cursor-pointer border-2 border-white flex items-center gap-2"
            title="Cerrar Vista"
          >
            <X size={22} className="stroke-[3]" />
            <span className="hidden sm:inline text-xs font-black uppercase pr-1">Cerrar</span>
          </button>

          {/* BARRA FLOTANTE INFERIOR */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] bg-slate-900/90 backdrop-blur-md px-6 py-2.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-4">
            <span className="text-xs font-extrabold text-white hidden sm:inline">
              VISTA DE SOLO LECTURA — ESTUDIANTE
            </span>
            <button
              onClick={() => setActiveFicha(null)}
              className="bg-[#801B28] hover:bg-[#a32334] text-white px-4 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 shadow-md"
            >
              <LogOut size={16} /> Salir de la Ficha
            </button>
          </div>

          {/* CONTENEDOR FLOTANTE TRASERO (PERMITE DESPLAZAMIENTO / SCROLL PERO INHABILITA EDICIÓN) */}
          <div className="fixed inset-0 z-[9990] bg-slate-950/70 backdrop-blur-sm overflow-y-auto p-2 sm:p-6">
            <div className="text-xs [&_button]:hidden [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none [&_input]:bg-slate-100 [&_select]:bg-slate-100 [&_textarea]:bg-slate-100 [&_input]:select-none [&_select]:select-none [&_textarea]:select-none">
              <ComponenteFichaExplicito
                isOpen={Boolean(activeFicha)}
                onClose={() => setActiveFicha(null)}
                fichaData={fichaData}
                setFichaData={() => {}}
                listaDocentes={[]}
                estudianteSeleccionado={estudianteLogueado}
                readOnly={true}
              />
            </div>
          </div>
        </React.Fragment>
      )}

    </div>
  );
};