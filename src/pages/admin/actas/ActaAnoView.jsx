import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Printer,
  X,
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldCheck
} from "lucide-react";
import { actaService } from "../../../services/actaService";
import { BlockchainResultModal } from "../../../components/modals/BlockchainResultModal";
import { blockchainService } from "../../../services/blockchainService";
import { imprimirCentralizador1erAno } from "../../../utils/fichas/1año/centralizador1AnoPdfGenerator";
import { imprimirCentralizador2doAno } from "../../../utils/fichas/2año/centralizador2AnoPdfGenerator";
import { imprimirCentralizador3erAno } from "../../../utils/fichas/3año/centralizador3AnoPdfGenerator";
import { imprimirCentralizador4toAno } from "../../../utils/fichas/4año/centralizador4AnoPdfGenerator";
import { imprimirCentralizador5toAno } from "../../../utils/fichas/5año/centralizador5AnoPdfGenerator";

// IMPORTACIÓN EXCLUSIVA DE CONTROLADORES POR AÑO
import { FICHAS_1ER_ANO, ejecutarImpresion1erAno } from "../../../controllers/fichas/fichas1AnoController";
import { FICHAS_2DO_ANO, ejecutarImpresion2doAno } from "../../../controllers/fichas/fichas2AnoController";
import { FICHAS_3ER_ANO, ejecutarImpresion3erAno } from "../../../controllers/fichas/fichas3AnoController";
import { FICHAS_4TO_ANO, ejecutarImpresion4toAno } from "../../../controllers/fichas/fichas4AnoController";
import { FICHAS_5TO_ANO, ejecutarImpresion5toAno } from "../../../controllers/fichas/fichas5AnoController";

export const ActaAnoView = ({ gestion, ano }) => {
  const [actas, setActas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modales
  const [selectedActa, setSelectedActa] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Modal de Notificaciones UI Generales
  const [systemModal, setSystemModal] = useState({
    show: false,
    title: "",
    message: "",
    type: "info"
  });

  // Modal Suave de Respuesta Blockchain
  const [modalBlockchain, setModalBlockchain] = useState({
    show: false,
    data: null,
    estudianteId: null
  });

  const getFichasByAno = (anoFormacion) => {
    const a = (anoFormacion || ano || "").toString().toUpperCase();
    if (a.includes("1") || a.includes("PRIMER")) return FICHAS_1ER_ANO;
    if (a.includes("2") || a.includes("SEGUNDO")) return FICHAS_2DO_ANO;
    if (a.includes("3") || a.includes("TERCER")) return FICHAS_3ER_ANO;
    if (a.includes("4") || a.includes("CUARTO")) return FICHAS_4TO_ANO;
    return FICHAS_5TO_ANO;
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

  const handleOpenPrintModal = (acta) => {
    setSelectedActa(acta);
    setShowPrintModal(true);
  };

  const handleImprimirFichaEspecifica = async (ficha) => {
    if (!selectedActa) return;

    setGeneratingPdf(true);
    const a = (selectedActa.ano_formacion || ano || "").toString().toUpperCase();
    const id = selectedActa.estudiante_id;

    const es1erAno = a.includes("1") || a.includes("PRIMER");
    const es2doAno = a.includes("2") || a.includes("SEGUNDO");
    const es3erAno = a.includes("3") || a.includes("TERCER");
    const es4toAno = a.includes("4") || a.includes("CUARTO");
    const es5toAno = a.includes("5") || a.includes("QUINTO") || (!es1erAno && !es2doAno && !es3erAno && !es4toAno);

    // 1. CASO ESPECIAL: Centralizadores de 1ro, 2do, 3ro, 4to y 5to Año con Registro Blockchain
    if ((es1erAno || es2doAno || es3erAno || es4toAno || es5toAno) && ficha.codigo === "CENTRALIZADOR") {
      try {
        let resCert;
        if (es1erAno) {
          resCert = await blockchainService.certificar1erAno(id);
        } else if (es2doAno) {
          resCert = await blockchainService.certificar2doAno(id);
        } else if (es3erAno) {
          resCert = await blockchainService.certificar3erAno(id);
        } else if (es4toAno) {
          resCert = await blockchainService.certificar4toAno(id);
        } else {
          resCert = await blockchainService.certificar5toAno(id);
        }

        setGeneratingPdf(false);
        setModalBlockchain({
          show: true,
          data: resCert,
          estudianteId: id
        });
      } catch (errBlockchain) {
        setGeneratingPdf(false);
        if (errBlockchain?.tx_hash || errBlockchain?.hash_local) {
          setModalBlockchain({
            show: true,
            data: errBlockchain,
            estudianteId: id
          });
        } else {
          setSystemModal({
            show: true,
            title: "Error en Blockchain",
            message: errBlockchain?.message || "No se pudo realizar la certificación Web3.",
            type: "error"
          });
        }
      }
      return;
    }

    // 2. CASO TRADICIONAL: Fichas normales
    let res = { success: false, message: "" };
    if (es1erAno) {
      res = await ejecutarImpresion1erAno(ficha.codigo, id);
    } else if (es2doAno) {
      res = await ejecutarImpresion2doAno(ficha.codigo, id);
    } else if (es3erAno) {
      res = await ejecutarImpresion3erAno(ficha.codigo, id);
    } else if (es4toAno) {
      res = await ejecutarImpresion4toAno(ficha.codigo, id);
    } else {
      res = await ejecutarImpresion5toAno(ficha.codigo, id);
    }

    setGeneratingPdf(false);

    if (!res.success) {
      setSystemModal({
        show: true,
        title: "Información del Sistema",
        message: res.message || "No se pudo generar el documento solicitado.",
        type: res.message?.includes("configurada") ? "info" : "error"
      });
    }
  };

  // Confirmación e Impresión del Centralizador con Blockchain por Año
  const handleConfirmarImpresionPdf = async () => {
    if (!modalBlockchain.estudianteId) return;

    setGeneratingPdf(true);
    const a = (selectedActa?.ano_formacion || ano || "").toString().toUpperCase();

    if (a.includes("1") || a.includes("PRIMER")) {
      await imprimirCentralizador1erAno(modalBlockchain.estudianteId, modalBlockchain.data);
    } else if (a.includes("2") || a.includes("SEGUNDO")) {
      await imprimirCentralizador2doAno(modalBlockchain.estudianteId, modalBlockchain.data);
    } else if (a.includes("3") || a.includes("TERCER")) {
      await imprimirCentralizador3erAno(modalBlockchain.estudianteId, modalBlockchain.data);
    } else if (a.includes("4") || a.includes("CUARTO")) {
      await imprimirCentralizador4toAno(modalBlockchain.estudianteId, modalBlockchain.data);
    } else {
      await imprimirCentralizador5toAno(modalBlockchain.estudianteId, modalBlockchain.data);
    }

    setGeneratingPdf(false);
    setModalBlockchain({ show: false, data: null, estudianteId: null });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* BANNER ENCABEZADO */}
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
              Consola de administración, impresión de fichas e inmutabilidad Web3.
            </p>
          </div>
        </div>
      </div>

      {/* BUSCADOR */}
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

      {/* TABLA DE ACTAS */}
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
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-bold">
                    <Loader2 className="animate-spin inline-block mr-2 text-[#801B28]" size={20} />
                    Cargando estudiantes de la gestión {gestion}...
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
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenPrintModal(acta)}
                        title="Imprimir Fichas"
                        className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-900 hover:text-white transition-all cursor-pointer"
                      >
                        <Printer size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">
                    No existen actas registradas para la Gestión {gestion} ({ano}º Año).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: SELECCIÓN DE FICHAS E IMPRESIÓN */}
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

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4">
              <div>
                <span className="font-bold text-[#801B28] block">Nombre:</span>
                <span className="font-extrabold text-slate-900 block">
                  {selectedActa.nombre} {selectedActa.apellido}
                </span>
              </div>
              <div>
                <span className="font-bold text-[#801B28] block">C.I.:</span>
                <span className="font-mono font-extrabold text-slate-900 block">
                  {selectedActa.ci}
                </span>
              </div>
              <div>
                <span className="font-bold text-[#801B28] block">Código:</span>
                <span className="font-mono font-extrabold text-[#801B28] block">
                  {selectedActa.codigo_estudiante}
                </span>
              </div>
              <div>
                <span className="font-bold text-[#801B28] block">Especialidad:</span>
                <span className="font-bold text-slate-800 block">
                  {selectedActa.especialidad || "Educación Primaria"}
                </span>
              </div>
            </div>

           

            <h3 className="text-xs font-black text-slate-900 mb-3 uppercase flex items-center gap-2">
              <FileText className="text-[#801B28]" size={16} /> ACTAS Y FICHAS DISPONIBLES
            </h3>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {getFichasByAno(selectedActa.ano_formacion || ano).map((ficha) => (
                <div
                  key={ficha.codigo}
                  className="flex items-center justify-between p-3.5 text-xs hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-800 pr-2">{ficha.nombre}</span>
                  <button
                    disabled={generatingPdf}
                    onClick={() => handleImprimirFichaEspecifica(ficha)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-extrabold hover:bg-slate-800 text-[11px] cursor-pointer transition-all shrink-0 shadow-sm disabled:opacity-50"
                  >
                    {generatingPdf ? <Loader2 size={13} className="animate-spin" /> : <Printer size={13} />}
                    {generatingPdf ? "Procesando..." : "Imprimir"}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPrintModal(false)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUAVE: RESULTADO BLOCKCHAIN CON CONFIRMACIÓN */}
      <BlockchainResultModal
        show={modalBlockchain.show}
        onClose={() => setModalBlockchain({ show: false, data: null, estudianteId: null })}
        onConfirmPrint={handleConfirmarImpresionPdf}
        data={modalBlockchain.data}
      />

      {/* MODAL: NOTIFICACIONES DEL SISTEMA */}
      {systemModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100">
              {systemModal.type === 'error' && <AlertTriangle size={28} className="text-rose-600" />}
              {systemModal.type === 'success' && <CheckCircle2 size={28} className="text-emerald-600" />}
              {systemModal.type === 'info' && <Info size={28} className="text-[#801B28]" />}
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">{systemModal.title}</h3>
              <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                {systemModal.message}
              </p>
            </div>

            <button
              onClick={() => setSystemModal({ ...systemModal, show: false })}
              className="w-full rounded-2xl bg-slate-900 py-2.5 text-xs font-extrabold text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};