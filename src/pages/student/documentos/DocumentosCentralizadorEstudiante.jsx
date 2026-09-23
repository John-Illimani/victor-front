import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Loader2, 
  AlertCircle, 
  XCircle
} from 'lucide-react';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// SERVICIOS
import { userService } from '../../../services/userService';
import { centralizador1erAnoService } from '../../../services/fichas/1año/centralizador1erAnoService';
import { centralizador2doAnoService } from '../../../services/fichas/2año/centralizador2doAnoService';
import { centralizador3erAnoService } from '../../../services/fichas/3año/centralizador3erAnoService';
import { centralizador4toAnoService } from '../../../services/fichas/4año/centralizador4toAnoService';
import { centralizador5toAnoService } from '../../../services/fichas/5año/centralizador5toAnoService';

// MAPEO DE FICHAS PARA EL REPORTE PDF SEGÚN EL AÑO DE FORMACIÓN
const ESTRUCTURA_CENTRALIZADOR_POR_ANO = {
  "1er Año": [
    { codigo: '1_F1', nombre: 'Ficha F-1: Elaboración y Validación de Instrumentos', key: 'nota_f1' },
    { codigo: '1_F2', nombre: 'Ficha F-2: Control de Asistencia PEC', key: 'nota_f2' },
    { codigo: '1_F3', nombre: 'Ficha F-3: Aplicación de Técnicas e Instrumentos', key: 'nota_f3' },
    { codigo: '1_F4', nombre: 'Ficha F-4: Seguimiento del Docente Guía y Director', key: 'nota_f4' },
    { codigo: '1_F5', nombre: 'Ficha F-5: Valoración de la Producción de Conocimientos', key: 'nota_f5' },
  ],
  "2do Año": [
    { codigo: '2_F1', nombre: 'Ficha F-1: Coordinación y Gestión Comunitaria', key: 'nota_f1' },
    { codigo: '2_F2', nombre: 'Ficha F-2: Asistencia PEC (2 semanas)', key: 'nota_f2' },
    { codigo: '2_F3', nombre: 'Ficha F-3: Aplicación de Técnicas e Instrumentos', key: 'nota_f3' },
    { codigo: '2_F4', nombre: 'Ficha F-4: Apoyo y Seguimiento Concreción Curricular', key: 'nota_f4' },
    { codigo: '2_F5', nombre: 'Ficha F-5: Valoración del Docente Acompañante ESFM', key: 'nota_f5' },
    { codigo: '2_F6', nombre: 'Ficha F-6: Valoración de la Producción IEPC-PEC', key: 'nota_f6' },
  ],
  "3er Año": [
    { codigo: '3_A1', nombre: 'Ficha A-1: Técnicas e Instrumentos de Investigación', key: 'nota_a1' },
    { codigo: '3_B1', nombre: 'Ficha B-1: Apoyo y Seguimiento Docente Acompañante', key: 'nota_b1' },
    { codigo: '3_B2', nombre: 'Ficha B-2: Asistencia PEC (4 semanas)', key: 'nota_b2' },
    { codigo: '3_B3', nombre: 'Ficha B-3: Apoyo Docente Guía Concreción Curricular', key: 'nota_b3' },
    { codigo: '3_B4', nombre: 'Ficha B-4: Seguimiento y Apoyo Docente Tutor', key: 'nota_b4' },
    { codigo: '3_B5', nombre: 'Ficha B-5: Presentación Informe Diagnóstico Socioparticipativo', key: 'nota_b5' },
  ],
  "4to Año": [
    { codigo: '4_A1', nombre: 'Ficha A-1: Técnicas e Instrumentos de Investigación', key: 'nota_a1' },
    { codigo: '4_A2', nombre: 'Ficha A-2: Elaboración de PDC (4 a 6 PDC)', key: 'nota_a2' },
    { codigo: '4_B1', nombre: 'Ficha B-1: Control de Asistencia PEC (6 semanas)', key: 'nota_b1' },
    { codigo: '4_B2', nombre: 'Ficha B-2: Concreción Curricular - Desarrollo del PDC', key: 'nota_b2' },
    { codigo: '4_B3', nombre: 'Ficha B-3: Valoración de la Clase Comunitaria', key: 'nota_b3' },
    { codigo: '4_B4', nombre: 'Ficha B-4: Centralizador Concreción Curricular', key: 'nota_b4' },
    { codigo: '4_B5', nombre: 'Ficha B-5: Seguimiento y Apoyo de la/el Docente Guía', key: 'nota_b5' },
    { codigo: '4_B6', nombre: 'Ficha B-6: Seguimiento y Apoyo Docente Tutor Acompañante', key: 'nota_b6' },
    { codigo: '4_B7', nombre: 'Ficha B-7: Diagnóstico Socioparticipativo UE/CEA/CEE', key: 'nota_b7' },
    { codigo: '4_C1', nombre: 'Ficha C-1: Evaluación Documento de Diseño Metodológico', key: 'nota_c1' },
    { codigo: '4_C2', nombre: 'Ficha C-2: Socialización del Diseño Metodológico', key: 'nota_c2' },
  ],
  "5to Año": [
    { codigo: '5_A1', nombre: 'Ficha A-1: Planificación y Elaboración de PDC', key: 'nota_a1' },
    { codigo: '5_B1', nombre: 'Ficha B-1: Control de Asistencia PEC (10 Semanas)', key: 'nota_b1' },
    { codigo: '5_B2', nombre: 'Ficha B-2: Concreción Curricular - Aplicación del PDC', key: 'nota_b2' },
    { codigo: '5_B3', nombre: 'Ficha B-3: Valoración de la Clase Comunitaria', key: 'nota_b3' },
    { codigo: '5_B4', nombre: 'Ficha B-4: Centralizador de Desarrollo de PDC', key: 'nota_b4' },
    { codigo: '5_B5', nombre: 'Ficha B-5: Centralizador Seguimiento y Apoyo Docente Guía', key: 'nota_b5' },
    { codigo: '5_B6', nombre: 'Ficha B-6: Apoyo y Seguimiento Docente Tutor Acompañante', key: 'nota_b6' },
    { codigo: '5_C1', nombre: 'Ficha C-1: Evaluación Documento Trabajo de Grado', key: 'nota_c1' },
    { codigo: '5_C2', nombre: 'Ficha C-2: Socialización Trabajo de Grado', key: 'nota_c2' },
  ]
};

// HELPER DE NORMALIZACIÓN DE AÑO DE FORMACIÓN
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

// HELPER PARA FORMATEAR Y REDONDEAR NOTAS A NÚMEROS ENTEROS
const formatNota = (valor) => {
  if (valor === undefined || valor === null || valor === "") return '—';
  const num = parseFloat(valor);
  if (isNaN(num) || num === 0) return '0 pts';
  return `${Math.round(num)} pts`;
};

export const DocumentosCentralizadorEstudiante = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const [estudianteLogueado, setEstudianteLogueado] = useState(null);
  const [anoDetectado, setAnoDetectado] = useState('1er Año');
  const [datosCentralizador, setDatosCentralizador] = useState({});

  useEffect(() => {
    const cargarCentralizadorEstudiante = async () => {
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

        // 1. OBTENER INFORMACIÓN FRESCA DESDE LA API DE USUARIOS
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

        // 2. DETERMINAR EL AÑO DE FORMACIÓN DE FORMA ESTRICTA
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

        // 3. FALLBACK: BUSCAR EN LOS 5 SERVICIOS SI EL AÑO ERA INDETERMINADO O NO RETORNÓ REGISTRO
        if (!datosCentral) {
          const servicios = [
            { ano: "2do Año", service: centralizador2doAnoService },
            { ano: "1er Año", service: centralizador1erAnoService },
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
              // Continuar en el siguiente servicio
            }
          }
        }

        const anoFinal = anoEst || "1er Año";
        setAnoDetectado(anoFinal);
        setDatosCentralizador(datosCentral || {});

      } catch (err) {
        console.error("Error al cargar el centralizador de notas:", err);
        setErrorMessage("Error de conexión al consultar el centralizador oficial.");
      } finally {
        setLoading(false);
      }
    };

    cargarCentralizadorEstudiante();
  }, []);

  const estructuraFichas = ESTRUCTURA_CENTRALIZADOR_POR_ANO[anoDetectado] || [];

  const notaFinalRaw = parseFloat(
    datosCentralizador.promedio_numeral || 
    datosCentralizador.promedio_final_2 || 
    datosCentralizador.promedio_final_1 || 
    datosCentralizador.promedio_final || 
    datosCentralizador.puntaje_final || 
    0
  );

  const notaFinalNum = Math.round(notaFinalRaw);
  const esAprobado = notaFinalNum >= 51;

  // GENERADOR DEL CENTRALIZADOR EN PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    // ENCABEZADO INSTITUCIONAL
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(128, 27, 40); // #801B28
    doc.text('ESFM "THEA" - IEPC-PEC', 14, 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Centralizador Oficial de Notas — ${anoDetectado}`, 14, 20);

    doc.setFontSize(8);
    doc.text(`Fecha Emisión: ${new Date().toLocaleDateString('es-BO')}`, 198, 15, { align: 'right' });
    doc.text(`Gestión: 2026`, 198, 20, { align: 'right' });

    doc.setDrawColor(128, 27, 40);
    doc.setLineWidth(0.5);
    doc.line(14, 23, 198, 23);

    // DATOS DE FILIACIÓN DEL ESTUDIANTE
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 26, 184, 18, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);

    const nombreCompleto = `${estudianteLogueado?.nombre || ''} ${estudianteLogueado?.apellido || ''}`.trim();
    doc.text(`Estudiante: ${nombreCompleto || 'Sin Datos'}`, 18, 31);
    doc.text(`C.I.: ${estudianteLogueado?.ci || 'S/N'}   |   Especialidad: ${estudianteLogueado?.especialidad || 'General'}`, 18, 37);
    doc.text(`Estado Final: ${esAprobado ? 'APROBADO' : 'REPROBADO / EN CURSO'}   |   Promedio Numeral: ${formatNota(notaFinalNum)}`, 18, 42);

    // CONSTRUCCIÓN DE LA TABLA CON EL DESGLOSE DE FICHAS REDONDEADAS
    const rows = estructuraFichas.map(item => {
      const val = parseFloat(datosCentralizador[item.key] || 0);
      const valRedondeado = Math.round(val);
      return [
        item.codigo,
        item.nombre,
        formatNota(valRedondeado),
        valRedondeado >= 51 ? 'APROBADO' : (valRedondeado > 0 ? 'REPROBADO' : 'PENDIENTE')
      ];
    });

    // AGREGAR FILA DE TOTAL / PROMEDIO CON NOTA ENTERA REDONDEADA
    rows.push([
      'TOTAL',
      'PROMEDIO FINAL ACUMULADO DEL AÑO',
      formatNota(notaFinalNum),
      esAprobado ? 'APROBADO' : 'REPROBADO'
    ]);

    autoTable(doc, {
      head: [['Código', 'Ficha Pedagógica de Evaluación', 'Puntaje', 'Estado']],
      body: rows,
      startY: 48,
      theme: 'grid',
      headStyles: {
        fillColor: [128, 27, 40],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      didDrawPage: (data) => {
        // MARCA DE AGUA
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.04 }));
        doc.setFontSize(26);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(128, 27, 40);
        doc.text('CENTRALIZADOR OFICIAL DE NOTAS', 105, 140, {
          align: 'center',
          angle: 35
        });
        doc.restoreGraphicsState();

        // PIE DE PÁGINA
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text('Documento Oficial generado por la Plataforma IEPC-PEC ESFM THEA', 14, pageHeight - 10);
        doc.text(`Página ${doc.internal.getNumberOfPages()}`, 198, pageHeight - 10, { align: 'right' });
      }
    });

    // SECCIÓN DE FIRMAS AL FINAL
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 25 : 200;
    const pageHeight = doc.internal.pageSize.height;

    if (finalY < pageHeight - 40) {
      doc.setLineWidth(0.3);
      doc.setDrawColor(51, 65, 85);

      doc.line(30, finalY, 85, finalY);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('Docente Acompañante IEPC-PEC', 57.5, finalY + 4, { align: 'center' });

      doc.line(125, finalY, 180, finalY);
      doc.text('Dirección Académica ESFM THEA', 152.5, finalY + 4, { align: 'center' });
    }

    doc.save(`Centralizador_${anoDetectado}_${estudianteLogueado?.ci || 'Estudiante'}.pdf`);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO INSTITUCIONAL */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <Award size={14} className="text-[#8C731A]" /> Documento Institucional
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Centralizador de Notas
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Sábana consolidada oficial con las notas obtenidas en todas las fichas de la práctica.
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

      {/* TARJETA CONSOLIDADA DE NOTAS */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-[#801B28] uppercase tracking-wider block">Centralizador Oficial</span>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">SÁBANA DE NOTAS IEPC-PEC GESTIÓN 2026 — {anoDetectado}</h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 self-start sm:self-auto ${
            esAprobado ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}>
            {esAprobado ? <CheckCircle2 size={14} /> : <XCircle size={14} />} 
            {esAprobado ? 'APROBADO' : 'REPROBADO / EN CURSO'}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center font-bold text-slate-500 text-xs">
            <Loader2 className="animate-spin inline mr-2 text-[#801B28]" size={18} />
            Consultando datos consolidados del centralizador...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-bold uppercase text-[10px]">Practicante:</span>
                <span className="font-extrabold text-slate-900 text-sm block">
                  {estudianteLogueado?.nombre} {estudianteLogueado?.apellido}
                </span>
                <span className="block font-mono text-slate-400 text-[10px]">C.I.: {estudianteLogueado?.ci || 'S/N'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-800 block font-bold uppercase text-[10px]">Nota Promedio Final:</span>
                <span className="font-mono font-black text-emerald-900 text-xl">
                  {formatNota(notaFinalNum)}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-1 font-mono text-[10px]">
                <span className="text-[#F3EFCF] font-bold block flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-400" /> Registro Institucional
                </span>
                <p className="truncate text-slate-300">VALIDADO EN SERVIDOR IEPC-PEC</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-6 py-3 text-xs font-extrabold text-white shadow-md hover:bg-[#a32334] transition-all cursor-pointer"
              >
                <Download size={16} /> [ Descargar Centralizador Oficial PDF ]
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
};