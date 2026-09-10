import React, { useState } from 'react';
import { 
  Layers, 
  Eye, 
  FileText, 
  CheckCircle2, 
  X, 
  Sparkles,
  BookOpen,
  SlidersHorizontal,
  FolderTree
} from 'lucide-react';

export const AnosFormacionManagement = () => {
  // Configuración de los 5 Años de Formación de la ESFM/UA
  const [anosFormacion, setAnosFormacion] = useState([
    {
      id: 'ANO-1',
      nivel: '1er Año',
      descripcion: 'Etapa de Inmersión y Diagnóstico Institucional Comunitario',
      fichasAsignadas: [
        { codigo: 'Acta-Inicio', nombre: 'Acta de Inicio IEPC-PEC', etapa: 'Preparatoria' },
        { codigo: 'F-1', nombre: 'Ficha de Diagnóstico Institucional', etapa: 'Preparatoria' },
        { codigo: 'F-2', nombre: 'Planificación de Observación Activa', etapa: 'Ejecución' },
        { codigo: 'Centralizador', nombre: 'Centralizador de Calificaciones', etapa: 'Producción' }
      ],
      totalEstudiantes: 280,
      estado: 'Activo'
    },
    {
      id: 'ANO-2',
      nivel: '2do Año',
      descripcion: 'Etapa de Investigación-Acción Educativa y Concreción Curricular',
      fichasAsignadas: [
        { codigo: 'Acta-Inicio', nombre: 'Acta de Inicio IEPC-PEC', etapa: 'Preparatoria' },
        { codigo: 'Acta-Conf', nombre: 'Acta de Conformación de Equipo', etapa: 'Preparatoria' },
        { codigo: 'F-1', nombre: 'Ficha de Diagnóstico Comunitario', etapa: 'Preparatoria' },
        { codigo: 'F-2', nombre: 'Plan de Investigación-Acción', etapa: 'Ejecución' },
        { codigo: 'F-3', nombre: 'Seguimiento del Docente Guía', etapa: 'Ejecución' },
        { codigo: 'F-4', nombre: 'Registro de Experiencias Pedagógicas', etapa: 'Ejecución' },
        { codigo: 'F-5', nombre: 'Evaluación de la Concreción Curricular', etapa: 'Ejecución' },
        { codigo: 'F-6', nombre: 'Informe de Producción de Conocimientos', etapa: 'Producción' },
        { codigo: 'Centralizador', nombre: 'Centralizador Final de Evaluación', etapa: 'Producción' }
      ],
      totalEstudiantes: 260,
      estado: 'Activo'
    },
    {
      id: 'ANO-3',
      nivel: '3er Año',
      descripcion: 'Desarrollo de Propuestas Pedagógicas e Instrumentación',
      fichasAsignadas: [
        { codigo: 'Acta-Inicio', nombre: 'Acta de Inicio IEPC-PEC', etapa: 'Preparatoria' },
        { codigo: 'Acta-Conf', nombre: 'Acta de Conformación de Equipo', etapa: 'Preparatoria' },
        { codigo: 'F-1', nombre: 'Diagnóstico Socio-Ambiental y Comunitario', etapa: 'Preparatoria' },
        { codigo: 'F-2', nombre: 'Diseño del Proyecto de Investigación', etapa: 'Ejecución' },
        { codigo: 'F-3', nombre: 'Validación Curricular', etapa: 'Ejecución' },
        { codigo: 'F-4', nombre: 'Aplicación de Instrumentos', etapa: 'Ejecución' },
        { codigo: 'F-5', nombre: 'Evaluación de Impacto IEPC-PEC', etapa: 'Ejecución' },
        { codigo: 'F-6', nombre: 'Producto Final y Sistematización', etapa: 'Producción' },
        { codigo: 'Centralizador', nombre: 'Centralizador Final de Evaluación', etapa: 'Producción' }
      ],
      totalEstudiantes: 240,
      estado: 'Activo'
    },
    {
      id: 'ANO-4',
      nivel: '4to Año',
      descripcion: 'Ejecución y Sistematización de la Práctica Docente',
      fichasAsignadas: [
        { codigo: 'Acta-Inicio', nombre: 'Acta de Inicio IEPC-PEC', etapa: 'Preparatoria' },
        { codigo: 'F-1 a F-5', nombre: 'Fichas de Concreción e Investigación', etapa: 'Ejecución' },
        { codigo: 'F-6', nombre: 'Borrador de Trabajo de Grado', etapa: 'Producción' },
        { codigo: 'Centralizador', nombre: 'Centralizador Final', etapa: 'Producción' }
      ],
      totalEstudiantes: 230,
      estado: 'Activo'
    },
    {
      id: 'ANO-5',
      nivel: '5to Año',
      descripcion: 'Implementación Final, Trabajo de Grado y Defensa de Grado',
      fichasAsignadas: [
        { codigo: 'Acta-Inicio', nombre: 'Acta de Inicio IEPC-PEC', etapa: 'Preparatoria' },
        { codigo: 'Fichas TFG', nombre: 'Validación de Trabajo de Grado', etapa: 'Ejecución' },
        { codigo: 'Centralizador', nombre: 'Centralizador Definitivo de Grado', etapa: 'Producción' }
      ],
      totalEstudiantes: 230,
      estado: 'Activo'
    }
  ]);

  // Modal Ver Estructura
  const [selectedAno, setSelectedAno] = useState(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <Layers size={14} className="text-[#8C731A]" /> Gestión Académica
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Años de Formación
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Configuración de la estructura normativa de fichas, actas y etapas de evaluación para cada año lectivo (1er a 5to año).
            </p>
          </div>
        </div>
      </div>

      {/* TARJETAS DE LOS 5 AÑOS DE FORMACIÓN */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {anosFormacion.map((ano) => (
          <div 
            key={ano.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-black text-[#801B28] tracking-tight">{ano.nivel}</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                  {ano.estado}
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
                {ano.descripcion}
              </p>

              <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100 text-xs space-y-1.5 mb-5">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Total Fichas Normadas:</span>
                  <span className="font-bold text-slate-800 font-mono">{ano.fichasAsignadas.length} documentos</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Estudiantes Registrados:</span>
                  <span className="font-bold text-slate-800 font-mono">{ano.totalEstudiantes}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { setSelectedAno(ano); setShowModal(true); }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-[#8C731A] hover:text-white transition-all cursor-pointer"
            >
              <Eye size={15} /> Ver Estructura de Fichas
            </button>
          </div>
        ))}
      </div>

      {/* MODAL: VER ESTRUCTURA DE FICHAS POR AÑO */}
      {showModal && selectedAno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="border-b border-slate-200 pb-4 mb-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8C731A]">
                CONFIGURACIÓN ACADÉMICA
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                Estructura de Fichas - {selectedAno.nivel}
              </h2>
              <p className="text-xs text-slate-500">{selectedAno.descripcion}</p>
            </div>

            {/* LISTA DE FICHAS Y ETAPAS */}
            <div className="space-y-3 text-xs">
              <h3 className="font-black text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FolderTree size={16} className="text-[#801B28]" /> Fichas y Formularios Habilitados
              </h3>

              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                {selectedAno.fichasAsignadas.map((ficha, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-800 block">{ficha.nombre}</span>
                      <span className="text-[10px] font-mono text-slate-400">Código: {ficha.codigo}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      ficha.etapa === 'Preparatoria' ? 'bg-blue-100 text-blue-800' :
                      ficha.etapa === 'Ejecución' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      Etapa {ficha.etapa}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
              >
                Cerrar Estructura
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};