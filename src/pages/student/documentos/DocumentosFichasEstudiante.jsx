import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  FileText, 
  Eye, 
  Download, 
  CheckCircle2, 
  FileQuestion,
  X 
} from 'lucide-react';

import { studentService } from '../../../services/studentService';

// IMPORTACIÓN DE COMPONENTES DE FICHAS DE CADA AÑO (PARA VISUALIZACIÓN EN MODAL)
import { FichaF1_1erAno } from '../../admin/fichas/1año/FichaF1_1erAno';
import { FichaF2_1erAno } from '../../admin/fichas/1año/FichaF2_1erAno';
import { FichaF3_1erAno } from '../../admin/fichas/1año/FichaF3_1erAno';
import { FichaF4_1erAno } from '../../admin/fichas/1año/FichaF4_1erAno';
import { FichaF5_1erAno } from '../../admin/fichas/1año/FichaF5_1erAno';

import { FichaF1_2doAno } from '../../admin/fichas/2año/FichaF1_2doAno';
import { FichaF2_2doAno } from '../../admin/fichas/2año/FichaF2_2doAno';
import { FichaF3_2doAno } from '../../admin/fichas/2año/FichaF3_2doAno';
import { FichaF4_2doAno } from '../../admin/fichas/2año/FichaF4_2doAno';
import { FichaF5_2doAno } from '../../admin/fichas/2año/FichaF5_2doAno';
import { FichaF6_2doAno } from '../../admin/fichas/2año/FichaF6_2doAno';

import { FichaA1_3erAno } from '../../admin/fichas/3año/FichaA1_3erAno';
import { FichaB1_3erAno } from '../../admin/fichas/3año/FichaB1_3erAno';
import { FichaB2_3erAno } from '../../admin/fichas/3año/FichaB2_3erAno';
import { FichaB3_3erAno } from '../../admin/fichas/3año/FichaB3_3erAno';
import { FichaB4_3erAno } from '../../admin/fichas/3año/FichaB4_3erAno';
import { FichaB5_3erAno } from '../../admin/fichas/3año/FichaB5_3erAno';

import { FichaA1_4toAno } from '../../admin/fichas/4año/FichaA1_4toAno';
import { FichaA2_4toAno } from '../../admin/fichas/4año/FichaA2_4toAno';
import { FichaB1_4toAno } from '../../admin/fichas/4año/FichaB1_4toAno';
import { FichaB2_4toAno } from '../../admin/fichas/4año/FichaB2_4toAno';
import { FichaB3_4toAno } from '../../admin/fichas/4año/FichaB3_4toAno';
import { FichaB4_4toAno } from '../../admin/fichas/4año/FichaB4_4toAno';
import { FichaB5_4toAno } from '../../admin/fichas/4año/FichaB5_4toAno';
import { FichaB6_4toAno } from '../../admin/fichas/4año/FichaB6_4toAno';
import { FichaB7_4toAno } from '../../admin/fichas/4año/FichaB7_4toAno';
import { FichaC1_4toAno } from '../../admin/fichas/4año/FichaC1_4toAno';
import { FichaC2_4toAno } from '../../admin/fichas/4año/FichaC2_4toAno';

import { FichaA1_5toAno } from '../../admin/fichas/5año/FichaA1_5toAno';
import { FichaB1_5toAno } from '../../admin/fichas/5año/FichaB1_5toAno';
import { FichaB2_5toAno } from '../../admin/fichas/5año/FichaB2_5toAno';
import { FichaB3_5toAno } from '../../admin/fichas/5año/FichaB3_5toAno';
import { FichaB4_5toAno } from '../../admin/fichas/5año/FichaB4_5toAno';
import { FichaB5_5toAno } from '../../admin/fichas/5año/FichaB5_5toAno';
import { FichaB6_5toAno } from '../../admin/fichas/5año/FichaB6_5toAno';
import { FichaC1_5toAno } from '../../admin/fichas/5año/FichaC1_5toAno';
import { FichaC2_5toAno } from '../../admin/fichas/5año/FichaC2_5toAno';

// IMPORTACIÓN DE CONTROLADORES DE IMPRESIÓN POR AÑO
import { ejecutarImpresion1erAno } from '../../../controllers/fichas/fichas1AnoController';
import { ejecutarImpresion2doAno } from '../../../controllers/fichas/fichas2AnoController';
import { ejecutarImpresion3erAno } from '../../../controllers/fichas/fichas3AnoController';
import { ejecutarImpresion4toAno } from '../../../controllers/fichas/fichas4AnoController';
import { ejecutarImpresion5toAno } from '../../../controllers/fichas/fichas5AnoController';

// CATÁLOGO COMPLETO DE FICHAS OFICIALES POR AÑO (EXCLUYENDO ACTAS Y CENTRALIZADORES)
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

// MAPEO DE COMPONENTES EXPLÍCITOS PARA VISUALIZAR EN MODAL
const COMPONENTES_FICHAS_MAP = {
  // 1er Año
  "1_F1": FichaF1_1erAno,
  "1_F2": FichaF2_1erAno,
  "1_F3": FichaF3_1erAno,
  "1_F4": FichaF4_1erAno,
  "1_F5": FichaF5_1erAno,
  // 2do Año
  "2_F1": FichaF1_2doAno,
  "2_F2": FichaF2_2doAno,
  "2_F3": FichaF3_2doAno,
  "2_F4": FichaF4_2doAno,
  "2_F5": FichaF5_2doAno,
  "2_F6": FichaF6_2doAno,
  // 3er Año
  "3_A1": FichaA1_3erAno,
  "3_B1": FichaB1_3erAno,
  "3_B2": FichaB2_3erAno,
  "3_B3": FichaB3_3erAno,
  "3_B4": FichaB4_3erAno,
  "3_B5": FichaB5_3erAno,
  // 4to Año
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
  // 5to Año
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

// HELPER ROBUSTO PARA NORMALIZAR CUALQUIER FORMATO DE AÑO DE LA API
const normalizarAnoStr = (cadena) => {
  if (!cadena) return "1er Año";
  const c = cadena.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (c.includes("5") || c.includes("quinto")) return "5to Año";
  if (c.includes("4") || c.includes("cuarto")) return "4to Año";
  if (c.includes("3") || c.includes("tercer") || c.includes("tercero")) return "3er Año";
  if (c.includes("2") || c.includes("segundo")) return "2do Año";
  if (c.includes("1") || c.includes("primer") || c.includes("primero")) return "1er Año";
  
  return "1er Año";
};

export const DocumentosFichasEstudiante = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [estudianteLogueado, setEstudianteLogueado] = useState(null);
  const [anoDetectado, setAnoDetectado] = useState('1er Año');
  const [fichasStatusMap, setFichasStatusMap] = useState({});

  // ESTADOS MODAL DE FICHA
  const [selectedFicha, setSelectedFicha] = useState(null);
  const [fichaData, setFichaData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [printingCode, setPrintingCode] = useState(null);

  useEffect(() => {
    const cargarEstadoFichas = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const savedUserStr = localStorage.getItem("user");
        if (!savedUserStr) {
          setErrorMessage("No se encontró una sesión activa de estudiante.");
          setLoading(false);
          return;
        }

        let student = JSON.parse(savedUserStr);
        let studentId = student.id || student.estudiante_id;

        // 1. OBTENER INFORMACIÓN FRESCA DESDE LA API DE ESTUDIANTES
        try {
          const estudiantesList = await studentService.getStudents();
          if (Array.isArray(estudiantesList)) {
            const studentApi = estudiantesList.find(u => 
              String(u.id) === String(studentId) || 
              String(u.ci) === String(student.ci) || 
              String(u.correo) === String(student.correo)
            );
            if (studentApi) {
              student = { ...student, ...studentApi };
              studentId = studentApi.id || studentId;
            }
          }
        } catch (e) {
          console.warn("No se pudo refrescar el perfil desde la API de estudiantes, usando sesión local:", e);
        }

        setEstudianteLogueado(student);

        // 2. EXTRAER Y NORMALIZAR EL AÑO DE FORMACIÓN DE LA API
        const anoCrudo = student.ano_formacion || student.ano || student.curso || student.nivel || "";
        const anoEst = normalizarAnoStr(anoCrudo);
        setAnoDetectado(anoEst);

        if (!studentId) {
          setErrorMessage("Identificador de estudiante no válido.");
          setLoading(false);
          return;
        }

        // 3. FILTRAR Y CONSULTAR LAS FICHAS CORRESPONDIENTES AL AÑO DETECTADO
        const fichasCorrespondientes = CATALAGO_FICHAS_ESTUDIANTE.filter(
          ficha => normalizarAnoStr(ficha.ano) === anoEst
        );

        const statusMap = {};
        await Promise.all(
          fichasCorrespondientes.map(async (ficha) => {
            try {
              const res = await studentService.getFicha(studentId, ficha.codigo);
              const datos = res?.datos || {};
              statusMap[ficha.codigo] = {
                hasData: Object.keys(datos).length > 0,
                data: datos
              };
            } catch (err) {
              statusMap[ficha.codigo] = { hasData: false, data: {} };
            }
          })
        );

        setFichasStatusMap(statusMap);

      } catch (err) {
        console.error("Error al cargar estado de las fichas:", err);
        setErrorMessage("Error de conexión al obtener la información de tus fichas de evaluación.");
      } finally {
        setLoading(false);
      }
    };

    cargarEstadoFichas();
  }, []);

  const misFichasCorrespondientes = CATALAGO_FICHAS_ESTUDIANTE.filter(
    ficha => normalizarAnoStr(ficha.ano) === anoDetectado
  );

  // ABRIR MODAL PARA VISUALIZAR LA FICHA
  const handleOpenFichaModal = async (ficha) => {
    if (!estudianteLogueado) return;

    setSelectedFicha(ficha);
    setActionLoading(true);

    try {
      const res = await studentService.getFicha(estudianteLogueado.id, ficha.codigo);
      setFichaData(res.datos || {});
    } catch (err) {
      setFichaData({});
    } finally {
      setActionLoading(false);
    }
  };

  // GENERADOR Y DESCARGADOR DE PDF OFICIAL USANDO CONTROLADORES POR AÑO
  const handlePrintFichaPDF = async (fichaItem) => {
    if (normalizarAnoStr(fichaItem.ano) !== anoDetectado) {
      alert(`Esta ficha corresponde a ${fichaItem.ano} y no pertenece a tu año de formación activo (${anoDetectado}).`);
      return;
    }

    if (!estudianteLogueado?.id) return;

    setPrintingCode(fichaItem.codigo);
    const estId = estudianteLogueado.id;
    const anoStr = normalizarAnoStr(fichaItem.ano || anoDetectado);

    try {
      let res = { success: false, message: "" };

      if (anoStr.includes("1")) {
        res = await ejecutarImpresion1erAno(fichaItem.codigo, estId);
      } else if (anoStr.includes("2")) {
        res = await ejecutarImpresion2doAno(fichaItem.codigo, estId);
      } else if (anoStr.includes("3")) {
        res = await ejecutarImpresion3erAno(fichaItem.codigo, estId);
      } else if (anoStr.includes("4")) {
        res = await ejecutarImpresion4toAno(fichaItem.codigo, estId);
      } else if (anoStr.includes("5")) {
        res = await ejecutarImpresion5toAno(fichaItem.codigo, estId);
      }

      if (!res?.success) {
        alert(res?.message || "No se pudo generar el documento PDF de la ficha.");
      }
    } catch (error) {
      console.error("Error al imprimir ficha:", error);
      alert("Ocurrió un error al procesar la impresión del PDF.");
    } finally {
      setPrintingCode(null);
    }
  };

  const ComponenteFichaModal = selectedFicha ? COMPONENTES_FICHAS_MAP[selectedFicha.codigo] : null;

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO INSTITUCIONAL */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <ClipboardList size={14} className="text-[#8C731A]" /> Evaluación Pedagógica
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Mis Fichas de Evaluación
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Visualización y descarga directa de fichas de seguimiento y evaluación práctica IEPC-PEC.
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

      {/* TARJETA DE INFORMACIÓN DEL ESTUDIANTE LOGUEADO */}
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
              {anoDetectado}
            </span>
          </div>
        </div>
      )}

      {/* LISTADO DE FICHAS DESCARGABLES */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center font-bold text-slate-500 text-xs">
            <Loader2 className="animate-spin inline mr-2 text-[#801B28]" size={18} />
            Cargando fichas disponibles...
          </div>
        ) : misFichasCorrespondientes.length > 0 ? (
          misFichasCorrespondientes.map((item) => {
            const status = fichasStatusMap[item.codigo] || { hasData: false };
            const hasData = status.hasData;

            return (
              <div 
                key={item.codigo} 
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-[#801B28]">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{item.nombre}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Código: {item.codigo} • Año: {item.ano}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  
                  

                  <button
                    onClick={() => handlePrintFichaPDF(item)}
                    disabled={printingCode === item.codigo}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#801B28] text-white text-xs font-extrabold hover:bg-[#a32334] transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {printingCode === item.codigo ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )} PDF
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-400 font-medium text-xs border border-dashed border-slate-200 rounded-2xl">
            No existen fichas asociadas para {anoDetectado}.
          </div>
        )}
      </div>

      {/* MODAL DE VISUALIZACIÓN DE FICHA */}
      {selectedFicha && estudianteLogueado && ComponenteFichaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-[#801B28] px-5 py-3 text-white flex items-center justify-between shrink-0">
              <span className="text-xs font-black tracking-wide uppercase truncate pr-4">
                {selectedFicha.nombre} — ({estudianteLogueado.nombre} {estudianteLogueado.apellido})
              </span>
              <button
                onClick={() => setSelectedFicha(null)}
                className="rounded-full p-1 text-white/80 hover:text-white hover:bg-white/20 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {actionLoading ? (
                <div className="py-12 text-center font-bold text-slate-500">
                  <Loader2 className="animate-spin inline mr-2 text-[#8C731A]" size={20} /> Cargando datos de la ficha...
                </div>
              ) : (
                <ComponenteFichaModal
                  isOpen={Boolean(selectedFicha)}
                  onClose={() => setSelectedFicha(null)}
                  fichaData={fichaData}
                  setFichaData={setFichaData}
                  listaDocentes={[]}
                  estudianteSeleccionado={estudianteLogueado}
                />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};