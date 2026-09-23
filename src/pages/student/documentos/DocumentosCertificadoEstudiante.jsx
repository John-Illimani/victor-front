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

import jsPDF from 'jspdf';

// SERVICIOS DE APIS DE CENTRALIZADORES POR AÑO DE FORMACIÓN
import { centralizador1erAnoService } from '../../../services/fichas/1año/centralizador1erAnoService';
import { centralizador2doAnoService } from '../../../services/fichas/2año/centralizador2doAnoService';
import { centralizador3erAnoService } from '../../../services/fichas/3año/centralizador3erAnoService';
import { centralizador4toAnoService } from '../../../services/fichas/4año/centralizador4toAnoService';
import { centralizador5toAnoService } from '../../../services/fichas/5año/centralizador5toAnoService';

// HELPER DE NORMALIZACIÓN DE AÑO DE FORMACIÓN
const normalizarAnoStr = (cadena) => {
  if (!cadena) return '1er Año';
  const c = cadena.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (c.includes("1") || c.includes("primer")) return "1er Año";
  if (c.includes("2") || c.includes("segundo")) return "2do Año";
  if (c.includes("3") || c.includes("tercer")) return "3er Año";
  if (c.includes("4") || c.includes("cuarto")) return "4to Año";
  if (c.includes("5") || c.includes("quinto")) return "5to Año";
  return "1er Año";
};

// HELPER PARA FORMATEAR NOTA (SIN DECIMALES INÚTILES SI ES ENTERO)
const formatNota = (valor) => {
  const num = parseFloat(valor || 0);
  if (isNaN(num) || num === 0) return '0';
  return Number.isInteger(num) ? `${num}` : `${num.toFixed(1)}`;
};

// HELPER PARA OBTENER MES EN ESPAÑOL
const obtenerMesLetras = (mesIndex) => {
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return meses[mesIndex];
};

export const DocumentosCertificadoEstudiante = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [estudianteLogueado, setEstudianteLogueado] = useState(null);
  const [promedioGeneral, setPromedioGeneral] = useState(0);

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

        const student = JSON.parse(savedUserStr);
        setEstudianteLogueado(student);

        const studentId = student.id || student.estudiante_id || student.ci;
        const anoEst = normalizarAnoStr(student.ano_formacion);

        if (!studentId) {
          setErrorMessage("Identificador de estudiante no válido.");
          setLoading(false);
          return;
        }

        // Consultar el centralizador según el año de formación para obtener la nota acumulada final
        let response = {};
        if (anoEst === "1er Año") {
          response = await centralizador1erAnoService.getByEstudiante(studentId);
        } else if (anoEst === "2do Año") {
          response = await centralizador2doAnoService.getByEstudiante(studentId);
        } else if (anoEst === "3er Año") {
          response = await centralizador3erAnoService.getByEstudiante(studentId);
        } else if (anoEst === "4to Año") {
          response = await centralizador4toAnoService.getByEstudiante(studentId);
        } else if (anoEst === "5to Año") {
          response = await centralizador5toAnoService.getByEstudiante(studentId);
        }

        const datosCentral = response?.datos || {};
        const notaFinal = parseFloat(
          datosCentral.promedio_numeral || 
          datosCentral.promedio_final || 
          datosCentral.puntaje_final || 
          0
        );

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

  const anoEstudiante = normalizarAnoStr(estudianteLogueado?.ano_formacion);
  const esAprobado = promedioGeneral >= 51;
  const codigoCertificado = `CERT-IEPC-2026-${estudianteLogueado?.ci || '000000'}`;
  const fechaEmisionStr = new Date().toLocaleDateString('es-BO');

  // FUNCIÓN PARA CARGAR LA IMAGEN Y CONVERTIRLA A BASE64
  const getBase64ImageFromUrl = async (url) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn("No se pudo cargar el logo:", err);
      return null;
    }
  };

  // GENERADOR DE CERTIFICADO DE CONCLUSIÓN EN PDF VERTICAL
  const handleDownloadPDF = async () => {
    if (!esAprobado) return;
    setIsGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter' // 215.9 mm x 279.4 mm
      });

      const nombreCompleto = `${estudianteLogueado?.nombre || ''} ${estudianteLogueado?.apellido || ''}`.trim();
      const especialidad = estudianteLogueado?.especialidad || 'S/E';
      const ciStr = estudianteLogueado?.ci || 'S/N';
      const anoFormacionUpper = anoEstudiante.toUpperCase();

      // CARGAR LOGO
      const logoBase64 = await getBase64ImageFromUrl('/logo_esfmthea.png');

      // ==========================================
      // ENCABEZADOS Y TEXTOS SUPERIORES
      // ==========================================
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      
      // Izquierda (Simulación de logos institucionales del estado)
      doc.text("BOLIVIA", 25, 20);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.text("MINISTERIO\nDE EDUCACIÓN", 25, 24);

      // Derecha (Texto ESFM THEA)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text("ESCUELA SUPERIOR DE FORMACIÓN DE MAESTRAS Y MAESTROS", 190, 20, { align: 'right' });
      doc.text("TECNOLÓGICO Y HUMANÍSTICO EL ALTO", 190, 24, { align: 'right' });
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6);
      doc.text("Fundado el 6 de marzo de 2009 por D.S. 29825 y Ley 3441", 190, 27, { align: 'right' });

      // ==========================================
      // TÍTULO CENTRAL: CERTIFICACIÓN
      // ==========================================
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text("CERTIFICACIÓN", 108, 55, { align: 'center' });

      // ==========================================
      // SUBTÍTULO DESCRIPTIVO
      // ==========================================
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const subTitleText = "LA DIRECCIÓN ACADÉMICA Y COORDINACIÓN ACADÉMICA IEPC - PEC DE LA ESCUELA SUPERIOR DE FORMACIÓN DE MAESTRAS Y MAESTROS TECNOLÓGICO Y HUMANÍSTICO EL ALTO, EN USO DE SUS ATRIBUCIONES:";
      doc.text(subTitleText, 108, 70, { align: 'center', maxWidth: 150 });

      // ==========================================
      // CUERPO DEL DOCUMENTO
      // ==========================================
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text("CERTIFICA:", 25, 105);

      const bodyText = `Que el/la estudiante ${nombreCompleto.toUpperCase()} con C.I. ${ciStr}, Código: Nº ${codigoCertificado} de la especialidad de ${especialidad.toUpperCase()} de ${anoFormacionUpper} DE FORMACIÓN de la Escuela Superior de Formación de Maestras y Maestros Tecnológico y Humanístico El Alto, CONCLUYÓ Y APROBÓ SATISFACTORIAMENTE LA PRÁCTICA EDUCATIVA COMUNITARIA en la gestión académica 2026, con una Calificación Promedio Final de ${formatNota(promedioGeneral)} PUNTOS, por tanto, queda habilitado para los fines consiguientes del(a) interesado(a).`;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      // Justificación de texto con maxWidth en jsPDF
      doc.text(bodyText, 25, 120, { align: 'justify', maxWidth: 165, lineHeightFactor: 1.5 });

      const finalPhrase = "Es cuanto se certifica para fines consiguientes del(a) interesado(a).";
      doc.text(finalPhrase, 25, 155);

      // ==========================================
      // MARCA DE AGUA (CENTRAL)
      // ==========================================
      if (logoBase64) {
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.12 }));
        // Centrar imagen: (215.9 - 100) / 2 = 57.95
        doc.addImage(logoBase64, 'PNG', 58, 85, 100, 100);
        doc.restoreGraphicsState();
      }

      // ==========================================
      // FECHA (Alineada a la derecha)
      // ==========================================
      const diaActual = new Date().getDate();
      const mesActual = obtenerMesLetras(new Date().getMonth());
      const anoActual = new Date().getFullYear();
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`El Alto, ${diaActual} de ${mesActual} de ${anoActual}`, 190, 180, { align: 'right' });

      // ==========================================
      // FIRMAS Y SELLOS
      // ==========================================
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.4);

      // Firma 1 (Izquierda) - Coordinador IEPC-PEC
      doc.line(30, 235, 90, 235);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text("Coordinador(a) Académico IEPC-PEC", 60, 240, { align: 'center' });
      doc.text("E.S.F.M.T.H. EL ALTO", 60, 244, { align: 'center' });

      // Firma 2 (Derecha) - Director Académico
      doc.line(125, 235, 185, 235);
      doc.text("Director(a) Académico", 155, 240, { align: 'center' });
      doc.text("E.S.F.M.T.H. EL ALTO", 155, 244, { align: 'center' });

      // ==========================================
      // PIE DE PÁGINA
      // ==========================================
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.text('2026 "Año del Bicentenario con Calidad"', 108, 265, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text('Av. Buenos Aires 1441 Zona Alta Chijini Distrito 12 El Alto • Teléfono/Fax: 2807049 • esfmthea.elalto.206@gmail.com', 108, 269, { align: 'center' });

      // ==========================================
      // GUARDAR DOCUMENTO
      // ==========================================
      doc.save(`Certificacion_IEPC_PEC_${ciStr}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF de Certificación:", error);
      alert("Hubo un error al generar el documento. Verifica la consola.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO INSTITUCIONAL */}
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

      {/* TARJETA PRINCIPAL DEL CERTIFICADO */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        
        {loading ? (
          <div className="py-12 text-center font-bold text-slate-500 text-xs">
            <Loader2 className="animate-spin inline mr-2 text-[#801B28]" size={18} />
            Verificando promedio acumulado en el centralizador...
          </div>
        ) : (
          <>
            {/* SECCIÓN RESUMEN DE PROMEDIO GENERAL */}
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
                  Se certifica el registro académico de la/el estudiante <strong className="text-slate-900">{estudianteLogueado?.nombre} {estudianteLogueado?.apellido}</strong> con C.I. <strong className="text-slate-900">{estudianteLogueado?.ci || 'S/N'}</strong> en el <strong className="text-slate-900">{anoEstudiante}</strong> de Formación.
                </p>
              </div>

              {/* MUESTRA DEL PROMEDIO GENERAL DEL ESTUDIANTE */}
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

            {/* ACCIÓN Y CONDICIONAL DE DESCARGA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className={`flex items-center gap-2 text-xs font-extrabold px-3.5 py-2 rounded-xl border ${
                esAprobado 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                <ShieldCheck size={16} className={esAprobado ? 'text-emerald-600' : 'text-amber-600'} />
                {esAprobado 
                  ? 'Acreditación aprobada. Certificado verificado listo para descarga.' 
                  : 'Se requiere una nota mayor o igual a 51 pts para habilitar la descarga del certificado.'}
              </div>

              {esAprobado ? (
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 rounded-2xl bg-[#801B28] px-6 py-3 text-xs font-extrabold text-white shadow-md hover:bg-[#a32334] transition-all shrink-0 ${isGenerating ? 'opacity-70 cursor-wait' : 'cursor-pointer'}`}
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
                  {isGenerating ? '[ Generando... ]' : '[ Descargar Certificación PDF ]'}
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

    </div>
  );
};