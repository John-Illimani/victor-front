import React, { useState, useEffect } from 'react';
import { 
  FileDown, 
  FileText, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  FileQuestion, 
  Loader2, 
  AlertCircle,
  Eye,
  X
} from 'lucide-react';

import { studentService } from '../../../services/studentService';

// IMPORTACIÓN DE COMPONENTES EXPLÍCITOS PARA ACTAS
import { ActaConformacion1erAno } from '../../admin/fichas/1año/ActaConformacion1erAno';
import { ActaInicio2doAno } from '../../admin/fichas/2año/ActaInicio2doAno';
import { ActaConformacion2doAno } from '../../admin/fichas/2año/ActaConformacion2doAno';
import { ActaConformacion3erAno } from '../../admin/fichas/3año/ActaConformacion3erAno';
import { ActaInicio3erAno } from '../../admin/fichas/3año/ActaInicio3erAno';
import { ActaSocializacion3erAno } from '../../admin/fichas/3año/ActaSocializacion3erAno';
import { ActaFinalEvolucion_4toAno } from '../../admin/fichas/4año/ActaFinalEvolucion_4toAno';
import { ActaPostergacion_4toAno } from '../../admin/fichas/4año/ActaPostergacion_4toAno';
import { ActaPostergacion_5toAno } from '../../admin/fichas/5año/ActaPostergacion_5toAno';

// IMPORTACIÓN DE CONTROLADORES DE IMPRESIÓN POR AÑO
import { ejecutarImpresion1erAno } from '../../../controllers/fichas/fichas1AnoController';
import { ejecutarImpresion2doAno } from '../../../controllers/fichas/fichas2AnoController';
import { ejecutarImpresion3erAno } from '../../../controllers/fichas/fichas3AnoController';
import { ejecutarImpresion4toAno } from '../../../controllers/fichas/fichas4AnoController';
import { ejecutarImpresion5toAno } from '../../../controllers/fichas/fichas5AnoController';

// CATÁLOGO COMPLETO DE ACTAS OFICIALES POR AÑO DE FORMACIÓN
const CATALAGO_ACTAS_ESTUDIANTE = [
  // 1er Año
  { codigo: "1_ACTA_EQUIPO", nombre: "Acta de Conformación del Equipo Comunitario", ano: "1er Año" },
  
  // 2do Año
  { codigo: "2_ACTA_INICIO", nombre: "Acta de Inicio - 2do Año (IEPC-PEC)", ano: "2do Año" },
  { codigo: "2_ACTA_EQUIPO", nombre: "Acta de Conformación de Equipo Comunitario", ano: "2do Año" },
  
  // 3er Año
  { codigo: "3_ACTA_EQUIPO", nombre: "Acta de Conformación y Compromiso de Equipo", ano: "3er Año" },
  { codigo: "3_ACTA_INICIO", nombre: "Acta de Inicio - 3er Año", ano: "3er Año" },
  { codigo: "3_ACTA_SOCIALIZACION", nombre: "Acta de Socialización del Diagnóstico", ano: "3er Año" },
  
  // 4to Año
  { codigo: "4_ACTA_FINAL", nombre: "Acta Final de Evaluación del Diseño Metodológico", ano: "4to Año" },
  { codigo: "4_ACTA_POSTERGACION", nombre: "Acta de Postergación de la Socialización Oral", ano: "4to Año" },
  
  // 5to Año
  { codigo: "5_ACTA_POSTERGACION", nombre: "Acta de Postergación de la Socialización de Trabajo de Grado", ano: "5to Año" }
];

// MAPEO DE COMPONENTES EXPLÍCITOS PARA VISUALIZAR EN MODAL
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

export const DocumentosActasEstudiante = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [estudianteLogueado, setEstudianteLogueado] = useState(null);
  const [anoDetectado, setAnoDetectado] = useState('1er Año');
  const [actasStatusMap, setActasStatusMap] = useState({});

  // ESTADOS MODAL DE ACTA
  const [selectedActa, setSelectedActa] = useState(null);
  const [fichaData, setFichaData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [printingCode, setPrintingCode] = useState(null);

  useEffect(() => {
    const cargarEstadoActas = async () => {
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

        // 3. FILTRAR Y CONSULTAR LAS ACTAS CORRESPONDIENTES AL AÑO DETECTADO
        const actasCorrespondientes = CATALAGO_ACTAS_ESTUDIANTE.filter(
          acta => normalizarAnoStr(acta.ano) === anoEst
        );

        const statusMap = {};
        await Promise.all(
          actasCorrespondientes.map(async (acta) => {
            try {
              const res = await studentService.getFicha(studentId, acta.codigo);
              const datos = res?.datos || {};
              statusMap[acta.codigo] = {
                hasData: Object.keys(datos).length > 0,
                data: datos
              };
            } catch (err) {
              statusMap[acta.codigo] = { hasData: false, data: {} };
            }
          })
        );

        setActasStatusMap(statusMap);

      } catch (err) {
        console.error("Error al cargar estado de las actas:", err);
        setErrorMessage("Error de conexión al obtener la información de tus documentos.");
      } finally {
        setLoading(false);
      }
    };

    cargarEstadoActas();
  }, []);

  const misActasCorrespondientes = CATALAGO_ACTAS_ESTUDIANTE.filter(
    acta => normalizarAnoStr(acta.ano) === anoDetectado
  );

  // ABRIR MODAL PARA VISUALIZAR/EDITAR EL ACTA
  const handleOpenActaModal = async (acta) => {
    if (!estudianteLogueado) return;

    setSelectedActa(acta);
    setActionLoading(true);

    try {
      const res = await studentService.getFicha(estudianteLogueado.id, acta.codigo);
      setFichaData(res.datos || {});
    } catch (err) {
      setFichaData({});
    } finally {
      setActionLoading(false);
    }
  };

  // GENERADOR Y DESCARGADOR DE PDF OFICIAL USANDO CONTROLADORES POR AÑO
  const handlePrintActaPDF = async (actaItem) => {
    if (normalizarAnoStr(actaItem.ano) !== anoDetectado) {
      alert(`Este documento corresponde a ${actaItem.ano} y no pertenece a tu año de formación activo (${anoDetectado}).`);
      return;
    }

    if (!estudianteLogueado?.id) return;

    setPrintingCode(actaItem.codigo);
    const estId = estudianteLogueado.id;
    const anoStr = normalizarAnoStr(actaItem.ano || anoDetectado);

    try {
      let res = { success: false, message: "" };

      if (anoStr.includes("1")) {
        res = await ejecutarImpresion1erAno(actaItem.codigo, estId);
      } else if (anoStr.includes("2")) {
        res = await ejecutarImpresion2doAno(actaItem.codigo, estId);
      } else if (anoStr.includes("3")) {
        res = await ejecutarImpresion3erAno(actaItem.codigo, estId);
      } else if (anoStr.includes("4")) {
        res = await ejecutarImpresion4toAno(actaItem.codigo, estId);
      } else if (anoStr.includes("5")) {
        res = await ejecutarImpresion5toAno(actaItem.codigo, estId);
      }

      if (!res?.success) {
        alert(res?.message || "No se pudo generar el documento PDF del acta.");
      }
    } catch (error) {
      console.error("Error al imprimir acta:", error);
      alert("Ocurrió un error al procesar la impresión del PDF.");
    } finally {
      setPrintingCode(null);
    }
  };

  const ComponenteActaModal = selectedActa ? COMPONENTES_ACTAS_MAP[selectedActa.codigo] : null;

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO INSTITUCIONAL */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <FileDown size={14} className="text-[#8C731A]" /> Descarga de Documentos
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Mis Actas
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Descarga directa de actas oficiales legalizadas del proceso IEPC-PEC.
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

      {/* LISTADO DE ACTAS DESCARGABLES */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center font-bold text-slate-500 text-xs">
            <Loader2 className="animate-spin inline mr-2 text-[#801B28]" size={18} />
            Cargando actas disponibles...
          </div>
        ) : misActasCorrespondientes.length > 0 ? (
          misActasCorrespondientes.map((item) => {
            const status = actasStatusMap[item.codigo] || { hasData: false };
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
                    onClick={() => handlePrintActaPDF(item)}
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
            No existen actas asociadas para {anoDetectado}.
          </div>
        )}
      </div>

      {/* MODAL DE VISUALIZACIÓN / EVALUACIÓN DE ACTA */}
      {selectedActa && estudianteLogueado && ComponenteActaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-[#801B28] px-5 py-3 text-white flex items-center justify-between shrink-0">
              <span className="text-xs font-black tracking-wide uppercase truncate pr-4">
                {selectedActa.nombre} — ({estudianteLogueado.nombre} {estudianteLogueado.apellido})
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