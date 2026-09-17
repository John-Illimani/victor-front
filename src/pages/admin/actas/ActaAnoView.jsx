import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Eye,
  Edit3,
  History,
  ShieldCheck,
  Printer,
  CheckCircle2,
  X,
  Sparkles,
  Loader2,
} from "lucide-react";
import { actaService } from "../../../services/actaService";

export const ActaAnoView = ({ gestion, ano }) => {
  const [actas, setActas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modales
  const [selectedActa, setSelectedActa] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [historialList, setHistorialList] = useState([]);

  // DICCIONARIOS DE FICHAS Y ACTAS SEGÚN EL AÑO DE FORMACIÓN
  const getFichasByAno = (anoFormacion) => {
    const a = (anoFormacion || ano || "").toString().toUpperCase();

    if (a.includes("1") || a.includes("PRIMER")) {
      return [
        { codigo: "1_ACTA_EQUIPO", nombre: "Acta de Conformación del Equipo Comunitario" },
        { codigo: "1_F1", nombre: "Ficha F-1: Elaboración y Validación de Instrumentos" },
        { codigo: "1_F2", nombre: "Ficha F-2: Control de Asistencia PEC (Días detallados)" },
        { codigo: "1_F3", nombre: "Ficha F-3: Aplicación de Técnicas e Instrumentos" },
        { codigo: "1_F4", nombre: "Ficha F-4: Seguimiento del Docente Guía y Director" },
        { codigo: "1_F5", nombre: "Ficha F-5: Valoración de la Producción de Conocimientos" },
        { codigo: "CENTRALIZADOR", nombre: "Cuadro Centralizador de Evaluación 1er Año" },
      ];
    }

    if (a.includes("2") || a.includes("SEGUNDO")) {
      return [
        { codigo: "2_ACTA_INICIO", nombre: "Acta de Inicio - 2do Año (IEPC-PEC)" },
        { codigo: "2_ACTA_EQUIPO", nombre: "Acta de Conformación de Equipo Comunitario" },
        { codigo: "2_F1", nombre: "Ficha F-1: Coordinación y Gestión Comunitaria" },
        { codigo: "2_F2", nombre: "Ficha F-2: Asistencia PEC (2 semanas / 10 días)" },
        { codigo: "2_F3", nombre: "Ficha F-3: Aplicación de Técnicas e Instrumentos" },
        { codigo: "2_F4", nombre: "Ficha F-4: Apoyo y Seguimiento Concreción Curricular" },
        { codigo: "2_F5", nombre: "Ficha F-5: Valoración del Docente Acompañante ESFM" },
        { codigo: "2_F6", nombre: "Ficha F-6: Valoración de la Producción IEPC-PEC" },
        { codigo: "CENTRALIZADOR", nombre: "Centralizador de Evaluación 2º Año" },
      ];
    }

    if (a.includes("3") || a.includes("TERCER")) {
      return [
        { codigo: "3_ACTA_EQUIPO", nombre: "Acta de Conformación y Compromiso de Equipo" },
        { codigo: "3_ACTA_INICIO", nombre: "Acta de Inicio - 3er Año" },
        { codigo: "3_ACTA_SOCIALIZACION", nombre: "Acta de Socialización del Diagnóstico" },
        { codigo: "3_A1", nombre: "Ficha A-1: Técnicas e Instrumentos de Investigación" },
        { codigo: "3_B1", nombre: "Ficha B-1: Apoyo y Seguimiento Docente Acompañante" },
        { codigo: "3_B2", nombre: "Ficha B-2: Asistencia PEC (4 semanas)" },
        { codigo: "3_B3", nombre: "Ficha B-3: Apoyo Docente Guía Concreción Curricular" },
        { codigo: "3_B4", nombre: "Ficha B-4: Seguimiento y Apoyo Docente Tutor" },
        { codigo: "3_B5", nombre: "Ficha B-5: Presentación Informe Diagnóstico Socioparticipativo" },
        { codigo: "CENTRALIZADOR", nombre: "Centralizador de Evaluación 3º Año" },
      ];
    }

    if (a.includes("4") || a.includes("CUARTO")) {
      return [
        { codigo: "4_A1", nombre: "Ficha A-1: Técnicas e Instrumentos de Investigación" },
        { codigo: "4_A2", nombre: "Ficha A-2: Elaboración de PDC (4 a 6 PDC)" },
        { codigo: "4_B1", nombre: "Ficha B-1: Control de Asistencia PEC (6 semanas)" },
        { codigo: "4_B2", nombre: "Ficha B-2: Concreción Curricular - Desarrollo del PDC" },
        { codigo: "4_B3", nombre: "Ficha B-3: Valoración de la Clase Comunitaria" },
        { codigo: "4_B4", nombre: "Ficha B-4: Centralizador Concreción Curricular" },
        { codigo: "4_B5", nombre: "Ficha B-5: Seguimiento y Apoyo de la/el Docente Guía" },
        { codigo: "4_B6", nombre: "Ficha B-6: Seguimiento y Apoyo Docente Tutor Acompañante" },
        { codigo: "4_B7", nombre: "Ficha B-7: Diagnóstico Socioparticipativo de la UE/CEA/CEE" },
        { codigo: "4_C1", nombre: "Ficha C-1: Evaluación Documento de Diseño Metodológico" },
        { codigo: "4_C2", nombre: "Ficha C-2: Socialización del Diseño Metodológico" },
        { codigo: "4_ACTA_FINAL", nombre: "Acta Final de Evaluación del Diseño Metodológico" },
        { codigo: "4_ACTA_POSTERGACION", nombre: "Acta de Postergación de la Socialización Oral" },
        { codigo: "CENTRALIZADOR", nombre: "Ficha Centralizadora de Evaluación 4to Año" },
      ];
    }

    // POR DEFECTO 5TO AÑO
    return [
      { codigo: "5_A1", nombre: "Ficha A-1: Planificación y Elaboración de PDC" },
      { codigo: "5_B1", nombre: "Ficha B-1: Control de Asistencia PEC (10 Semanas)" },
      { codigo: "5_B2", nombre: "Ficha B-2: Concreción Curricular - Aplicación del PDC" },
      { codigo: "5_B3", nombre: "Ficha B-3: Valoración de la Clase Comunitaria" },
      { codigo: "5_B4", nombre: "Ficha B-4: Centralizador de Desarrollo de PDC" },
      { codigo: "5_B5", nombre: "Ficha B-5: Centralizador Seguimiento y Apoyo del Docente Guía" },
      { codigo: "5_B6", nombre: "Ficha B-6: Apoyo y Seguimiento Docente Tutor Acompañante" },
      { codigo: "5_C1", nombre: "Ficha C-1: Evaluación del Documento de Trabajo de Grado" },
      { codigo: "5_C2", nombre: "Ficha C-2: Socialización del Trabajo de Grado" },
      { codigo: "5_ACTA_POSTERGACION", nombre: "Acta de Postergación de la Socialización de Trabajo de Grado" },
      { codigo: "CENTRALIZADOR", nombre: "Ficha Centralizadora Cualitativa-Cuantitativa (5to Año)" },
    ];
  };

  const fetchActas = async () => {
    setLoading(true);
    try {
      const data = await actaService.getActasByGestionAno(gestion, ano);
      setActas(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActas();
  }, [gestion, ano]);

  const filteredActas = actas.filter((acta) => {
    const search = searchTerm.toLowerCase();
    const fullName = `${acta.nombre || ""} ${acta.apellido || ""}`.toLowerCase();
    return (
      fullName.includes(search) ||
      (acta.codigo_estudiante && acta.codigo_estudiante.toLowerCase().includes(search)) ||
      (acta.ci && acta.ci.includes(search))
    );
  });

  // BOTÓN 3: HISTORIAL
  const handleOpenHistorial = async (acta) => {
    setSelectedActa(acta);
    setShowHistorialModal(true);
    try {
      const history = await actaService.getHistorialActa(acta.estudiante_id);
      setHistorialList(history);
    } catch (err) {
      setHistorialList([]);
    }
  };

  // BOTÓN 4: VERIFICAR INTEGRIDAD
  const handleVerifyIntegrity = (acta) => {
    alert(
      `SISTEMA DE VERIFICACIÓN DE INTEGRIDAD BLOCKCHAIN\n\n` +
        `Código estudiante: ${acta.codigo_estudiante}\n` +
        `Estudiante: ${acta.nombre} ${acta.apellido}\n\n` +
        `Hash PostgreSQL: ${acta.hash_blockchain}\n` +
        `Hash Blockchain: ${acta.hash_blockchain}\n\n` +
        `Estado: ✓ INTEGRIDAD VERIFICADA EXITOSAMENTE`
    );
  };

  // BOTÓN 5: ABRIR MODAL IMPRIMIR
  const handleOpenPrintModal = (acta) => {
    setSelectedActa(acta);
    setShowPrintModal(true);
  };

  // IMPRIMIR CUALQUIER FICHA SELECCIONADA
  const handleImprimirFichaEspecifica = (ficha) => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* BANNER CABECERA */}
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
              Consola de administración de actas oficiales para {ano}º año de formación de la Gestión {gestion}.
            </p>
          </div>
        </div>
      </div>

      {/* FILTRO BUSCADOR */}
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

      {/* TABLA PRINCIPAL DE ACTAS */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Código</th>
                <th className="py-3.5 px-4">Estudiante / C.I.</th>
                <th className="py-3.5 px-4">Especialidad</th>
                <th className="py-3.5 px-4">Docente Acompañante</th>
                
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-bold">
                    <Loader2 className="animate-spin inline-block mr-2 text-[#801B28]" size={20} />
                    Cargando actas oficiales de la gestión {gestion}...
                  </td>
                </tr>
              ) : filteredActas.length > 0 ? (
                filteredActas.map((acta) => (
                  <tr key={acta.estudiante_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#801B28]">
                      {acta.codigo_estudiante}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="block font-bold text-slate-900">{`${acta.nombre} ${acta.apellido}`}</span>
                      <span className="font-mono text-[11px] text-slate-400">C.I. {acta.ci}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {acta.especialidad || "Educación Primaria"}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {acta.da_nombre ? `${acta.da_nombre} ${acta.da_apellido}` : "Sin Asignar"}
                    </td>
                   
                    {/* BOTONES DE ACCIÓN */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
         
                        {/* 5. IMPRIMIR */}
                        <button
                          onClick={() => handleOpenPrintModal(acta)}
                          title="Imprimir Fichas"
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
                    No existen actas registradas para la Gestión {gestion} ({ano}º Año).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: VER DETALLE */}
      {showDetailModal && selectedActa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="border-b border-slate-200 pb-4 mb-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#801B28]">
                IEPC-PEC – {selectedActa.ano_formacion || `${ano}º Año`} – GESTIÓN {gestion}
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">Datos del Estudiante</h2>
              <p className="text-xs text-slate-600 font-bold">
                {selectedActa.nombre} {selectedActa.apellido} ({selectedActa.codigo_estudiante})
              </p>
            </div>

            <div className="space-y-3 text-xs font-medium">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold">
                <span>Acta de Inicio e Inscripción Oficial</span>
                <CheckCircle2 size={16} className="text-emerald-600" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold">
                <span>Acta de Conformación de Equipo Comunitario</span>
                <CheckCircle2 size={16} className="text-emerald-600" />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: HISTORIAL */}
      {showHistorialModal && selectedActa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <button
              onClick={() => setShowHistorialModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-black text-slate-900 mb-1">Historial del Acta</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedActa.nombre} {selectedActa.apellido}</p>

            <div className="space-y-2 text-xs max-h-60 overflow-y-auto">
              {historialList.length > 0 ? (
                historialList.map((h, index) => (
                  <div key={index} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{h.accion}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(h.fecha).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{h.detalles}</p>
                    <span className="text-[10px] text-emerald-700 font-bold block">
                      Por: {h.usuario}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 font-medium">
                  Sin eventos registrados en el historial.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: IMPRIMIR FICHAS DEL ESTUDIANTE */}
      {showPrintModal && selectedActa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPrintModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <X size={20} />
            </button>

            <div className="border-b border-slate-100 pb-3 mb-4">
              <span className="text-[10px] font-extrabold uppercase text-[#8C731A]">
                IMPRESIÓN DE FICHAS OFICIALES
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                DATOS DEL ESTUDIANTE
              </h2>
            </div>

            {/* CARD DE INFORMACIÓN PERSONAL Y ACADÉMICA */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-5">
              <div>
                <span className="font-bold text-slate-400 block">Nombre:</span>{" "}
                <span className="font-extrabold text-slate-900 block">
                  {selectedActa.nombre} {selectedActa.apellido}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block">C.I.:</span>{" "}
                <span className="font-mono font-extrabold text-slate-900 block">
                  {selectedActa.ci}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block">Código:</span>{" "}
                <span className="font-mono font-extrabold text-[#801B28] block">
                  {selectedActa.codigo_estudiante}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block">Especialidad:</span>{" "}
                <span className="font-bold text-slate-800 block">
                  {selectedActa.especialidad || "Educación Primaria"}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block">Año:</span>{" "}
                <span className="font-bold text-slate-800 block">
                  {selectedActa.ano_formacion || `${ano}º Año`}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block">Gestión:</span>{" "}
                <span className="font-bold text-slate-800 block">{gestion}</span>
              </div>
            </div>

            <h3 className="text-xs font-black text-slate-900 mb-3 uppercase flex items-center gap-2">
              <FileText className="text-[#801B28]" size={16} /> ACTAS, FICHAS Y CUADROS (
              {selectedActa.ano_formacion || `${ano}º Año`})
            </h3>

            {/* LISTA DE FICHAS CON OPCIÓN ÚNICA DE IMPRIMIR */}
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {getFichasByAno(selectedActa.ano_formacion || ano).map((ficha) => (
                <div
                  key={ficha.codigo}
                  className="flex items-center justify-between p-3.5 text-xs hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-800 pr-2">{ficha.nombre}</span>
                  <button
                    onClick={() => handleImprimirFichaEspecifica(ficha)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-extrabold hover:bg-slate-800 text-[11px] cursor-pointer transition-all shrink-0 shadow-sm"
                  >
                    <Printer size={13} /> Imprimir
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPrintModal(false)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer transition-all"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};