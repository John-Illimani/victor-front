import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Sparkles, 
  Download, 
  ShieldCheck, 
  Loader2, 
  AlertCircle, 
  XCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';

// SERVICIOS
import { userService } from '../../../services/userService';
import { blockchainService } from '../../../services/blockchainService';
import { centralizador1erAnoService } from '../../../services/fichas/1año/centralizador1erAnoService';
import { centralizador2doAnoService } from '../../../services/fichas/2año/centralizador2doAnoService';
import { centralizador3erAnoService } from '../../../services/fichas/3año/centralizador3erAnoService';
import { centralizador4toAnoService } from '../../../services/fichas/4año/centralizador4toAnoService';
import { centralizador5toAnoService } from '../../../services/fichas/5año/centralizador5toAnoService';

// MODAL BLOCKCHAIN
import { BlockchainResultModal } from '../../../components/modals/BlockchainResultModal';

// GENERADORES PDF
import { imprimirCertificado1erAno } from './certificados/certificado1AnoPdfGenerator';
import { imprimirCertificado2doAno } from './certificados/certificado2AnoPdfGenerator';
import { imprimirCertificado3erAno } from './certificados/certificado3AnoPdfGenerator';
import { imprimirCertificado4toAno } from './certificados/certificado4AnoPdfGenerator';
import { imprimirCertificado5toAno } from './certificados/certificado5AnoPdfGenerator';

const normalizarAnoStr = (cadena) => {
  if (!cadena) return null;
  const c = cadena.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (c.includes("5") || c.includes("quinto")) return "5to Año";
  if (c.includes("4") || c.includes("cuarto")) return "4to Año";
  if (c.includes("3") || c.includes("tercer") || c.includes("tercero")) return "3er Año";
  if (c.includes("2") || c.includes("segundo")) return "2do Año";
  if (c.includes("1") || c.includes("primer") || c.includes("primero")) return "1er Año";
  
  return null;
};

const formatNota = (valor) => {
  const num = parseFloat(valor || 0);
  if (isNaN(num) || num === 0) return '0';
  return String(Math.round(num));
};

export const DocumentosCertificadoEstudiante = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [estudianteLogueado, setEstudianteLogueado] = useState(null);
  const [anoDetectado, setAnoDetectado] = useState('1er Año');
  const [promedioGeneral, setPromedioGeneral] = useState(0);

  // ESTADO PARA EL MODAL DE RESULTADO BLOCKCHAIN
  const [modalBlockchain, setModalBlockchain] = useState({
    show: false,
    data: null,
    estudianteId: null
  });

  useEffect(() => {
    const cargarCertificadoEstudiante = async () => {
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

        try {
          const usuariosList = await userService.getUsers();
          if (Array.isArray(usuariosList)) {
            const userApi = usuariosList.find(u => 
              String(u.id) === String(studentId) || 
              String(u.ci) === String(student.ci) || 
              String(u.username) === String(student.username)
            );
            if (userApi) {
              student = { ...student, ...userApi };
              studentId = userApi.id || studentId;
            }
          }
        } catch (e) {
          console.warn("No se pudo refrescar el perfil del usuario desde la API:", e);
        }

        setEstudianteLogueado(student);

        let anoEst = normalizarAnoStr(student.ano_formacion || student.ano || student.curso);
        let datosCentral = null;

        if (anoEst === "2do Año") {
          const res = await centralizador2doAnoService.getByEstudiante(studentId);
          if (res?.existe || res?.datos) datosCentral = res.datos || res;
        } else if (anoEst === "3er Año") {
          const res = await centralizador3erAnoService.getByEstudiante(studentId);
          if (res?.existe || res?.datos) datosCentral = res.datos || res;
        } else if (anoEst === "4to Año") {
          const res = await centralizador4toAnoService.getByEstudiante(studentId);
          if (res?.existe || res?.datos) datosCentral = res.datos || res;
        } else if (anoEst === "5to Año") {
          const res = await centralizador5toAnoService.getByEstudiante(studentId);
          if (res?.existe || res?.datos) datosCentral = res.datos || res;
        } else if (anoEst === "1er Año") {
          const res = await centralizador1erAnoService.getByEstudiante(studentId);
          if (res?.existe || res?.datos) datosCentral = res.datos || res;
        }

        if (!datosCentral) {
          const servicios = [
            { ano: "1er Año", service: centralizador1erAnoService },
            { ano: "2do Año", service: centralizador2doAnoService },
            { ano: "3er Año", service: centralizador3erAnoService },
            { ano: "4to Año", service: centralizador4toAnoService },
            { ano: "5to Año", service: centralizador5toAnoService },
          ];

          for (const s of servicios) {
            try {
              const res = await s.service.getByEstudiante(studentId);
              if (res?.existe && res?.datos && Object.keys(res.datos).length > 0) {
                datosCentral = res.datos;
                anoEst = s.ano;
                break;
              }
            } catch (err) {
              // Continuar buscando
            }
          }
        }

        const anoFinal = anoEst || "1er Año";
        setAnoDetectado(anoFinal);

        let notaFinal = 0;
        if (anoFinal === "5to Año" && datosCentral) {
          const p1 = parseFloat(datosCentral?.promedio_final_1 || 0);
          const p2 = parseFloat(datosCentral?.promedio_final_2 || 0);
          notaFinal = (p1 + p2) / 2;
        } else {
          notaFinal = parseFloat(
            datosCentral?.promedio_numeral || 
            datosCentral?.promedio_final_2 || 
            datosCentral?.promedio_final_1 || 
            datosCentral?.promedio_final || 
            datosCentral?.puntaje_final || 
            0
          );
        }

        setPromedioGeneral(notaFinal);

      } catch (err) {
        console.error("Error al obtener la calificación para el certificado:", err);
        setErrorMessage("Error de conexión al verificar el promedio de acreditación.");
      } finally {
        setLoading(false);
      }
    };

    cargarCertificadoEstudiante();
  }, []);

  const esAprobado = promedioGeneral >= 51;
  const codigoCertificado = `CERT-IEPC-2026-${estudianteLogueado?.ci || '000000'}`;
  const fechaEmisionStr = new Date().toLocaleDateString('es-BO');

  // PASO 1: SOLICITAR CERTIFICACIÓN WEB3 Y MOSTRAR MODAL
  const handleStartCertificationProcess = async () => {
    if (!esAprobado || !estudianteLogueado) return;
    setIsGenerating(true);

    try {
      const studentId = estudianteLogueado.id || estudianteLogueado.estudiante_id || estudianteLogueado.ci;
      let resCert;

      try {
        if (anoDetectado === "1er Año") {
          resCert = await blockchainService.certificar1erAno(studentId);
        } else if (anoDetectado === "2do Año") {
          resCert = await blockchainService.certificar2doAno(studentId);
        } else if (anoDetectado === "3er Año") {
          resCert = await blockchainService.certificar3erAno(studentId);
        } else if (anoDetectado === "4to Año") {
          resCert = await blockchainService.certificar4toAno(studentId);
        } else {
          resCert = await blockchainService.certificar5toAno(studentId);
        }
      } catch (errBc) {
        resCert = errBc;
      }

      setIsGenerating(false);

      // MOSTRAR EL MODAL CON LA INFORMACIÓN RECIBIDA DE LA RED
      setModalBlockchain({
        show: true,
        data: resCert,
        estudianteId: studentId
      });

    } catch (error) {
      console.error("Error al iniciar proceso Web3:", error);
      setIsGenerating(false);
      alert("Hubo un fallo de comunicación al verificar con la red Blockchain.");
    }
  };

  // PASO 2: CONFIRMAR IMPRESIÓN DEL PDF DESDE EL MODAL
  const handleConfirmPrintPdf = async () => {
    if (!modalBlockchain.estudianteId) return;

    setIsGenerating(true);
    const studentId = modalBlockchain.estudianteId;
    let res = { success: false, message: "Año no reconocido." };

    try {
      if (anoDetectado === "1er Año") {
        res = await imprimirCertificado1erAno(studentId, modalBlockchain.data);
      } else if (anoDetectado === "2do Año") {
        res = await imprimirCertificado2doAno(studentId, modalBlockchain.data);
      } else if (anoDetectado === "3er Año") {
        res = await imprimirCertificado3erAno(studentId, modalBlockchain.data);
      } else if (anoDetectado === "4to Año") {
        res = await imprimirCertificado4toAno(studentId, modalBlockchain.data);
      } else if (anoDetectado === "5to Año") {
        res = await imprimirCertificado5toAno(studentId, modalBlockchain.data);
      }

      if (!res.success) {
        alert(res.message || "No se pudo generar el documento PDF.");
      }
    } catch (e) {
      console.error("Error al generar PDF:", e);
      alert("Fallo al construir el PDF del certificado.");
    } finally {
      setIsGenerating(false);
      setModalBlockchain({ show: false, data: null, estudianteId: null });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <Award size={14} className="text-[#8C731A]" /> Certificación Académica
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Certificado de Conclusión
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Acreditación institucional de conclusión satisfactoria de la Práctica Educativa Comunitaria.
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

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        {loading ? (
          <div className="py-12 text-center font-bold text-slate-500 text-xs">
            <Loader2 className="animate-spin inline mr-2 text-[#801B28]" size={18} />
            Verificando promedio acumulado en el centralizador...
          </div>
        ) : (
          <>
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 text-center">
              <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
                esAprobado ? 'bg-amber-100 text-[#8C731A]' : 'bg-rose-100 text-rose-700'
              }`}>
                <Award size={36} />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#801B28]">
                  MINISTERIO DE EDUCACIÓN · ESFM / UA
                </span>
                <h2 className="text-xl font-black text-slate-900">
                  CERTIFICACIÓN ACADÉMICA IEPC-PEC
                </h2>
                <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                  Se certifica el registro académico de la/el estudiante <strong className="text-slate-900">{estudianteLogueado?.nombre} {estudianteLogueado?.apellido}</strong> con C.I. <strong className="text-slate-900">{estudianteLogueado?.ci || 'S/N'}</strong> en el <strong className="text-slate-900">{anoDetectado}</strong> de Formación.
                </p>
              </div>

              <div className="pt-2 flex flex-col items-center justify-center gap-2">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Promedio General Acumulado:
                </span>
                <div className={`px-6 py-2.5 rounded-2xl border text-2xl font-black font-mono shadow-sm flex items-center gap-2 ${
                  esAprobado 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {esAprobado ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                  <span>{formatNota(promedioGeneral)} pts</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center items-center gap-4 text-xs font-mono text-slate-500">
                <span>Cód. Certificado: {codigoCertificado}</span>
                <span>•</span>
                <span>Emisión: {fechaEmisionStr}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className={`flex items-center gap-2 text-xs font-extrabold px-3.5 py-2 rounded-xl border ${
                esAprobado 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                <ShieldCheck size={16} className={esAprobado ? 'text-emerald-600' : 'text-amber-600'} />
                {esAprobado 
                  ? 'Acreditación aprobada. Certificado verificado e inmutable en Blockchain.' 
                  : 'Se requiere una nota mayor o igual a 51 pts para habilitar la descarga del certificado.'}
              </div>

              {esAprobado ? (
                <button
                  onClick={handleStartCertificationProcess}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 rounded-2xl bg-[#801B28] px-6 py-3 text-xs font-extrabold text-white shadow-md hover:bg-[#a32334] transition-all shrink-0 ${isGenerating ? 'opacity-70 cursor-wait' : 'cursor-pointer'}`}
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
                  {isGenerating ? '[ Validando en Web3... ]' : '[ Descargar Certificación PDF ]'}
                </button>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-2 rounded-2xl bg-slate-200 px-6 py-3 text-xs font-extrabold text-slate-400 cursor-not-allowed shrink-0"
                >
                  <Lock size={16} /> [ Descarga Bloqueada ]
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* MODAL BLOCKCHAIN DE CONFIRMACIÓN DE DESCARGA */}
      <BlockchainResultModal
        show={modalBlockchain.show}
        onClose={() => setModalBlockchain({ show: false, data: null, estudianteId: null })}
        onConfirmPrint={handleConfirmPrintPdf}
        data={modalBlockchain.data}
      />
    </div>
  );
};