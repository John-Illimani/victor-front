import React, { useState } from 'react';
import { 
  FolderOpen, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Upload, 
  FileText,
  Save,
  ShieldCheck
} from 'lucide-react';

export const MisFichasEstudiante = () => {
  const [selectedFicha, setSelectedFicha] = useState('F-1');
  const [formData, setFormData] = useState({
    unidadEducativa: 'U.E. Franz Tamayo',
    distrito: 'El Alto 1',
    comunidad: 'Zona 16 de Julio',
    diagnostico: 'Se identificó la necesidad de fortalecer los procesos de lectura comprensiva mediante el uso de recursos didácticos contextualizados al entorno sociocomunitario.'
  });

  const [isSaved, setIsSaved] = useState(false);

  // Estructura oficial de Fichas del Estudiante por Etapa
  const etapas = [
    {
      etapa: 'ETAPA PREPARATORIA',
      fichas: [
        { codigo: 'F-1', nombre: 'Diagnóstico Sociocomunitario', estado: 'Guardado' }
      ]
    },
    {
      etapa: 'ETAPA DE EJECUCIÓN',
      fichas: [
        { codigo: 'F-2', nombre: 'Planificación de la Práctica (PDC)', estado: 'Aprobado' },
        { codigo: 'F-3', nombre: 'Cuaderno de Campo Diario', estado: 'Aprobado' },
        { codigo: 'F-4', nombre: 'Registro de Experiencias en Aula', estado: 'Observado' },
        { codigo: 'F-5', nombre: 'Valoración del Docente Acompañante', estado: 'Pendiente' }
      ]
    },
    {
      etapa: 'ETAPA DE PRODUCCIÓN',
      fichas: [
        { codigo: 'F-6', nombre: 'Informe Final de Práctica IEPC-PEC', estado: 'Sin Entregar' }
      ]
    }
  ];

  const handleSaveBorrador = (e) => {
    e.preventDefault();
    setIsSaved(true);
    alert('Ficha guardada temporalmente en borrador (PostgreSQL).');
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO INSTITUCIONAL */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <FolderOpen size={14} className="text-[#8C731A]" /> Registro y Carga de Evidencias
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Mis fichas
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Diligenciamiento de fichas pedagógicas, cuaderno de campo e informes por etapas correspondientes a la gestión 2026.
            </p>
          </div>
        </div>
      </div>

      {/* CUERPO PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ÁRBOL NAVEGADOR DE FICHAS */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <FolderOpen size={20} className="text-[#801B28]" /> ESTRUCTURA DE FICHAS
          </h2>

          <div className="space-y-4 text-xs">
            {etapas.map((grupo, idx) => (
              <div key={idx} className="space-y-2">
                <span className="font-black text-[10px] uppercase tracking-wider text-slate-400 block">
                  {grupo.etapa}
                </span>
                <div className="space-y-1 pl-2 border-l-2 border-slate-100">
                  {grupo.fichas.map((f) => (
                    <button
                      key={f.codigo}
                      onClick={() => setSelectedFicha(f.codigo)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-between ${
                        selectedFicha === f.codigo
                          ? 'bg-[#801B28] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">├── {f.codigo} {f.nombre}</span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md ${
                        selectedFicha === f.codigo
                          ? 'bg-white/20 text-white'
                          : f.estado === 'Aprobado' ? 'bg-emerald-100 text-emerald-800' :
                            f.estado === 'Observado' ? 'bg-rose-100 text-rose-800' :
                            'bg-slate-100 text-slate-600'
                      }`}>
                        {f.estado}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FORMULARIO DE FORMULARIO FICHA SELECCIONADA */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono font-black text-[#801B28] px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-100">
                FICHA SELECCIONADA: {selectedFicha}
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-2">
                {selectedFicha === 'F-1' ? 'DIAGNÓSTICO SOCIOCOMUNITARIO' : 'REGISTRO DE INFORMACIÓN Y EVIDENCIAS'}
              </h2>
            </div>

            {isSaved && (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center gap-1">
                <CheckCircle2 size={14} /> Guardado
              </span>
            )}
          </div>

          <form onSubmit={handleSaveBorrador} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Unidad Educativa *</label>
                <input
                  type="text"
                  required
                  value={formData.unidadEducativa}
                  onChange={(e) => setFormData({ ...formData, unidadEducativa: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 p-2.5 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Distrito Educativo *</label>
                <input
                  type="text"
                  required
                  value={formData.distrito}
                  onChange={(e) => setFormData({ ...formData, distrito: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 p-2.5 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 mb-1">Descripción del Diagnóstico / Registro *</label>
              <textarea
                rows="4"
                required
                value={formData.diagnostico}
                onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 p-3 font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
              />
            </div>

            {/* SECCIÓN DE ARCHIVO ADJUNTO */}
            <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center space-y-2">
              <Upload size={24} className="mx-auto text-slate-400" />
              <div className="text-slate-600">
                <span className="font-extrabold text-slate-800">Adjuntar Evidencia en Documento PDF</span>
                <p className="text-[10px] text-slate-400">PDC, fotografías adjuntas o documentos firmados (Máx. 10MB)</p>
              </div>
              <button
                type="button"
                onClick={() => alert('Selección de archivo activada.')}
                className="px-4 py-1.5 rounded-xl bg-slate-200 font-bold text-slate-700 hover:bg-slate-300 transition-all text-xs cursor-pointer"
              >
                Examinar archivo...
              </button>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-200 cursor-pointer flex items-center gap-1.5"
              >
                <Save size={15} /> [ Guardar borrador ]
              </button>

              <button
                type="button"
                onClick={() => alert('Ficha enviada para revisión del Docente Acompañante.')}
                className="rounded-xl bg-[#801B28] px-5 py-2.5 text-xs font-extrabold text-white hover:bg-[#a32334] cursor-pointer shadow-md"
              >
                [ Enviar para revisión ]
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};