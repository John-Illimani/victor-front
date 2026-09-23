import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
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

// IMPORTACIÓN DE COMPONENTES EXPLÍCITOS PARA ACTAS DE EVALUACIÓN
import { ActaConformacion1erAno } from '../admin/fichas/1año/ActaConformacion1erAno';
import { ActaInicio2doAno } from '../admin/fichas/2año/ActaInicio2doAno';
import { ActaConformacion2doAno } from '../admin/fichas/2año/ActaConformacion2doAno';
import { ActaConformacion3erAno } from '../admin/fichas/3año/ActaConformacion3erAno';
import { ActaInicio3erAno } from '../admin/fichas/3año/ActaInicio3erAno';
import { ActaSocializacion3erAno } from '../admin/fichas/3año/ActaSocializacion3erAno';
import { ActaFinalEvolucion_4toAno } from '../admin/fichas/4año/ActaFinalEvolucion_4toAno';
import { ActaPostergacion_4toAno } from '../admin/fichas/4año/ActaPostergacion_4toAno';
import { ActaPostergacion_5toAno } from '../admin/fichas/5año/ActaPostergacion_5toAno';

// CATÁLOGO COMPLETO DE ACTAS POR AÑO DE FORMACIÓN
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

// HELPER ROBUSTO DE NORMALIZACIÓN DE AÑO
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

export const MisActasEstudiante = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const [estudianteLogueado, setEstudianteLogueado] = useState(null);
  const [anoDetectado, setAnoDetectado] = useState('1er Año');
  const [actasStatusMap, setActasStatusMap] = useState({});

  // ESTADO DE VISTA DE ACTA ACTIVA
  const [activeActa, setActiveActa] = useState(null);
  const [fichaData, setFichaData] = useState({});

  useEffect(() => {
    const cargarActasEstudiante = async () => {
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

        // 3. FILTRAR Y CONSULTAR LOS DATOS ALMACENADOS PARA CADA ACTA CORRESPONDIENTE
        const actasCorrespondientes = CATALAGO_ACTAS_ESTUDIANTE.filter(
          acta => normalizarAnoStr(acta.ano) === anoEst
        );

        const statusMap = {};
        await Promise.all(
          actasCorrespondientes.map(async (acta) => {
            try {
              const res = await studentService.getFicha(studentId, acta.codigo);
              const datos = res?.datos || {};
              const tieneInformacion = Object.keys(datos).length > 0;

              statusMap[acta.codigo] = {
                hasData: tieneInformacion,
                data: datos
              };
            } catch (err) {
              statusMap[acta.codigo] = { hasData: false, data: {} };
            }
          })
        );

        setActasStatusMap(statusMap);

      } catch (err) {
        console.error("Error al cargar las actas del estudiante:", err);
        setErrorMessage("Error de conexión al obtener la información de tus actas.");
      } finally {
        setLoading(false);
      }
    };

    cargarActasEstudiante();
  }, []);

  // FILTRAR ACTAS POR EL AÑO DETECTADO DEL ESTUDIANTE
  const misActasCorrespondientes = CATALAGO_ACTAS_ESTUDIANTE.filter(
    acta => normalizarAnoStr(acta.ano) === anoDetectado
  );

  // ABRIR CUALQUIER ACTA SIEMPRE EN SOLO LECTURA
  const handleOpenActa = (acta) => {
    const status = actasStatusMap[acta.codigo];
    setActiveActa(acta);
    setFichaData(status?.data || {});
  };

  const ComponenteActaExplicito = activeActa ? COMPONENTES_ACTAS_MAP[activeActa.codigo] : null;

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO INSTITUCIONAL */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <FileCheck2 size={14} className="text-[#8C731A]" /> Documentación Oficial
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Mis Actas
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Consulta de actas de evaluación emitidas y registradas en tu expediente académico IEPC-PEC.
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

      {/* LISTADO DE ACTAS */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <FileCheck2 size={18} className="text-[#801B28]" />
            Actas Oficiales de Evaluación — {anoDetectado}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Puedes previsualizar el contenido de cualquier acta en modo de solo lectura.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center font-bold text-slate-500 text-xs">
            <Loader2 className="animate-spin inline mr-2 text-[#801B28]" size={18} />
            Cargando expediente de actas...
          </div>
        ) : misActasCorrespondientes.length > 0 ? (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
            {misActasCorrespondientes.map((acta) => {
              const status = actasStatusMap[acta.codigo] || { hasData: false };
              const hasData = status.hasData;

              return (
                <div
                  key={acta.codigo}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 text-xs bg-white hover:bg-slate-50/80 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm block">
                        {acta.nombre}
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
                      Código: {acta.codigo} — {acta.ano}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenActa(acta)}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-sm bg-[#801B28] text-white hover:bg-[#a32334] cursor-pointer"
                  >
                    <Eye size={14} /> Visualizar Acta
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 font-medium text-xs border border-dashed border-slate-200 rounded-2xl">
            No existen actas programadas para el año de formación {anoDetectado}.
          </div>
        )}
      </div>

      {/* VISTA EN SOLO LECTURA CON HABILITACIÓN DE SCROLL E INHABILITACIÓN DE EDICIÓN */}
      {activeActa && ComponenteActaExplicito && (
        <React.Fragment>
          {/* BOTÓN FLOTANTE SUPERIOR */}
          <button
            onClick={() => setActiveActa(null)}
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
              onClick={() => setActiveActa(null)}
              className="bg-[#801B28] hover:bg-[#a32334] text-white px-4 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 shadow-md"
            >
              <LogOut size={16} /> Salir del Acta
            </button>
          </div>

          {/* CONTENEDOR TRASERO QUE PERMITE SCROLL CON CAMPOS INHABILITADOS */}
          <div className="fixed inset-0 z-[9990] bg-slate-950/70 backdrop-blur-sm overflow-y-auto p-2 sm:p-6">
            <div className="text-xs [&_button]:hidden [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none [&_input]:bg-slate-100 [&_select]:bg-slate-100 [&_textarea]:bg-slate-100 [&_input]:select-none [&_select]:select-none [&_textarea]:select-none">
              <ComponenteActaExplicito
                isOpen={Boolean(activeActa)}
                onClose={() => setActiveActa(null)}
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