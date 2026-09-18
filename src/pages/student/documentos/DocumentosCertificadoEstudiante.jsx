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
  Lock,
  FileText
} from 'lucide-react';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export const DocumentosCertificadoEstudiante = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

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

  // GENERADOR DE CERTIFICADO DE CONCLUSIÓN EN PDF
  const handleDownloadPDF = () => {
    if (!esAprobado) return;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'letter'
    });

    const nombreCompleto = `${estudianteLogueado?.nombre || ''} ${estudianteLogueado?.apellido || ''}`.trim();

    // MARCO EXTERIOR Y DECORATIVO
    doc.setDrawColor(128, 27, 40); // #801B28
    doc.setLineWidth(1.5);
    doc.rect(8, 8, 263, 199);

    doc.setDrawColor(140, 115, 26); // #8C731A
    doc.setLineWidth(0.5);
    doc.rect(11, 11, 257, 193);

    // ENCABEZADO INSTITUCIONAL
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(128, 27, 40);
    doc.text('ESTADO PLURINACIONAL DE BOLIVIA — MINISTERIO DE EDUCACIÓN', 139.5, 25, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text('ESCUELA SUPERIOR DE FORMACIÓN DE MAESTROS / UNIDAD ACADÉMICA', 139.5, 31, { align: 'center' });

    // TÍTULO DEL CERTIFICADO
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(128, 27, 40);
    doc.text('CERTIFICADO DE CONCLUSIÓN DE ESTUDIOS', 139.5, 48, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text('INVESTIGACIÓN EDUCATIVA Y PRODUCCIÓN DE CONOCIMIENTOS (IEPC-PEC)', 139.5, 55, { align: 'center' });

    // LÍNEA DIVISORIA
    doc.setDrawColor(140, 115, 26);
    doc.setLineWidth(0.8);
    doc.line(70, 60, 209, 60);

    // CUERPO DEL TEXTO
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text('El Ministerio de Educación y la Dirección Académica certifican que la/el estudiante:', 139.5, 75, { align: 'center' });

    // NOMBRE DEL ESTUDIANTE
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(nombreCompleto.toUpperCase(), 139.5, 90, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(`Con C.I. Nº ${estudianteLogueado?.ci || 'S/N'}, correspondiente al ${anoEstudiante.toUpperCase()} de Formación,`, 139.5, 102, { align: 'center' });
    
    const esp = estudianteLogueado?.especialidad ? `en la especialidad de ${estudianteLogueado.especialidad.toUpperCase()},` : '';
    if (esp) {
      doc.text(esp, 139.5, 108, { align: 'center' });
    }

    doc.text(`ha CONCLUIDO y APROBADO satisfactoriamente todas las etapas de la Práctica Educativa Comunitaria`, 139.5, esp ? 116 : 110, { align: 'center' });
    doc.text(`correspondientes a la Gestión Académica 2026, alcanzando una Calificación Promedio Final de:`, 139.5, esp ? 122 : 116, { align: 'center' });

    // CAJA DE PROMEDIO FINAL
    const yCaja = esp ? 128 : 122;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(128, 27, 40);
    doc.roundedRect(104.5, yCaja, 70, 16, 3, 3, 'FD');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(128, 27, 40);
    doc.text(`${formatNota(promedioGeneral)} PUNTOS — APROBADO`, 139.5, yCaja + 11, { align: 'center' });

    // CÓDIGO Y FECHA
    doc.setFontSize(8);
    doc.setFont('helvetica', 'mono');
    doc.setTextColor(100, 116, 139);
    doc.text(`CÓDIGO DE VERIFICACIÓN: ${codigoCertificado}   |   FECHA DE EMISIÓN: ${fechaEmisionStr}`, 139.5, yCaja + 26, { align: 'center' });

    // FIRMAS INSTITUCIONALES
    const yFirmas = 180;
    doc.setLineWidth(0.3);
    doc.setDrawColor(51, 65, 85);

    doc.line(35, yFirmas, 95, yFirmas);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Docente Acompañante IEPC-PEC', 65, yFirmas + 4, { align: 'center' });

    doc.line(184, yFirmas, 244, yFirmas);
    doc.text('Dirección General ESFM / UA', 214, yFirmas + 4, { align: 'center' });

    // MARCA DE AGUA LIGERAMENTE VISIBLE
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.03 }));
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(128, 27, 40);
    doc.text('MINISTERIO DE EDUCACIÓN - IEPC PEC', 139.5, 115, {
      align: 'center',
      angle: 20
    });
    doc.restoreGraphicsState();

    doc.save(`Certificado_Conclusion_${estudianteLogueado?.ci || 'Estudiante'}.pdf`);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO INSTITUCIONAL */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <Award size={14} className="text-[#8C731A]" /> Acreditación Académica
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
                  CERTIFICADO DE CONCLUSIÓN DE ESTUDIOS IEPC-PEC
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
                  className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-6 py-3 text-xs font-extrabold text-white shadow-md hover:bg-[#a32334] transition-all cursor-pointer shrink-0"
                >
                  <Download size={16} /> [ Descargar Certificado PDF ]
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