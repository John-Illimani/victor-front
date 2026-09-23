import React, { useState, useEffect } from 'react';
import { 
  FileDown, 
  FileText, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  FileQuestion, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { studentService } from '../../../services/studentService';

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

  // GENERADOR Y DESCARGADOR DE PDF OFICIAL
  const handleDownloadPDF = (actaItem) => {
    const status = actasStatusMap[actaItem.codigo] || { data: {} };
    const datos = status.data;

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
    doc.text(`Escuela Superior de Formación de Maestros — ${actaItem.nombre}`, 14, 20);

    doc.setFontSize(8);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-BO')}`, 198, 15, { align: 'right' });
    doc.text(`Gestión: 2026`, 198, 20, { align: 'right' });

    doc.setDrawColor(128, 27, 40);
    doc.setLineWidth(0.5);
    doc.line(14, 23, 198, 23);

    // DATOS DEL ESTUDIANTE
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 26, 184, 16, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    
    const nombreCompleto = `${estudianteLogueado?.nombre || ''} ${estudianteLogueado?.apellido || ''}`.trim();
    doc.text(`Estudiante: ${nombreCompleto || 'Sin Datos'}`, 18, 31);
    doc.text(`C.I.: ${estudianteLogueado?.ci || 'S/N'}   |   Año de Formación: ${anoDetectado}`, 18, 37);

    // CONSTRUCCIÓN DE CONTENIDO Y CAMPOS REGISTRADOS
    const rows = [];
    if (Object.keys(datos).length > 0) {
      Object.entries(datos).forEach(([clave, valor]) => {
        rows.push([
          clave.replace(/_/g, ' ').toUpperCase(),
          typeof valor === 'object' ? JSON.stringify(valor) : String(valor)
        ]);
      });
    } else {
      rows.push(['ESTADO DE REGISTRO', 'Sin datos registrados en la base de datos']);
      rows.push(['CÓDIGO DE DOCUMENTO', actaItem.codigo]);
      rows.push(['AÑO DE FORMACIÓN', actaItem.ano]);
    }

    autoTable(doc, {
      head: [['Campo / Parámetro Evaluado', 'Valor Registrado']],
      body: rows,
      startY: 46,
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
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(128, 27, 40);
        doc.text('DOCUMENTO OFICIAL IEPC-PEC', 105, 140, {
          align: 'center',
          angle: 35
        });
        doc.restoreGraphicsState();

        // PIE DE PÁGINA
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text('Documento Oficial emitido por la Plataforma IEPC-PEC ESFM THEA', 14, pageHeight - 10);
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
      doc.text('Firma del Estudiante Practicante', 57.5, finalY + 4, { align: 'center' });

      doc.line(125, finalY, 180, finalY);
      doc.text('Dirección Académica / Docente Acompañante', 152.5, finalY + 4, { align: 'center' });
    }

    doc.save(`${actaItem.codigo}_${estudianteLogueado?.ci || 'Estudiante'}.pdf`);
  };

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
                  {hasData ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1 mr-2">
                      <CheckCircle2 size={12} /> Registrado
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-500 flex items-center gap-1 mr-2">
                      <FileQuestion size={12} /> Vacío / Sin Registro
                    </span>
                  )}

                  <button
                    onClick={() => handleDownloadPDF(item)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#801B28] text-white text-xs font-extrabold hover:bg-[#a32334] transition-all cursor-pointer shadow-md"
                  >
                    <Download size={14} /> PDF
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

    </div>
  );
};