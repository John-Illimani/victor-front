import React, { useState } from 'react';
import { 
  Award, 
  Search, 
  Eye, 
  Plus, 
  Edit, 
  X, 
  Sparkles,
  Users,
  BookOpen,
  GraduationCap
} from 'lucide-react';

export const EspecialidadesManagement = () => {
  // Las 6 Especialidades oficiales registradas en el sistema IEPC-PEC
  const [especialidades, setEspecialidades] = useState([
    {
      id: 'ESP-001',
      codigo: 'APV',
      nombre: 'Artes Plásticas y Visuales',
      area: 'Comunidad y Sociedad',
      totalEstudiantes: 180,
      docentesAcompanantes: 12,
      estado: 'Activo'
    },
    {
      id: 'ESP-002',
      codigo: 'CNBG',
      nombre: 'Ciencias Naturales Biología-Geografía',
      area: 'Vida Tierra Territorio',
      totalEstudiantes: 210,
      docentesAcompanantes: 15,
      estado: 'Activo'
    },
    {
      id: 'ESP-003',
      codigo: 'EIFC',
      nombre: 'Educación Inicial en Familia Comunitaria',
      area: 'Desarrollo Humano',
      totalEstudiantes: 195,
      docentesAcompanantes: 14,
      estado: 'Activo'
    },
    {
      id: 'ESP-004',
      codigo: 'EMU',
      nombre: 'Educación Musical',
      area: 'Comunidad y Sociedad',
      totalEstudiantes: 160,
      docentesAcompanantes: 10,
      estado: 'Activo'
    },
    {
      id: 'ESP-005',
      codigo: 'EPCV',
      nombre: 'Educación Primaria Comunitaria Vocacional',
      area: 'Educación General',
      totalEstudiantes: 320,
      docentesAcompanantes: 22,
      estado: 'Activo'
    },
    {
      id: 'ESP-006',
      codigo: 'CLEI',
      nombre: 'Comunicación y Lenguajes – Lengua Extranjera Inglés',
      area: 'Comunidad y Sociedad',
      totalEstudiantes: 175,
      docentesAcompanantes: 13,
      estado: 'Activo'
    }
  ]);

  // Búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Modales
  const [selectedEspecialidad, setSelectedEspecialidad] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  // Formulario Nueva Especialidad
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    area: 'Comunidad y Sociedad',
    estado: 'Activo'
  });

  // Filtrado
  const filteredEspecialidades = especialidades.filter(esp =>
    esp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    esp.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    esp.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Crear Especialidad
  const handleCreateEspecialidad = (e) => {
    e.preventDefault();
    const newEsp = {
      id: `ESP-00${especialidades.length + 1}`,
      codigo: formData.codigo.toUpperCase(),
      nombre: formData.nombre,
      area: formData.area,
      totalEstudiantes: 0,
      docentesAcompanantes: 0,
      estado: formData.estado
    };
    setEspecialidades([...especialidades, newEsp]);
    setShowNewModal(false);
    setFormData({ codigo: '', nombre: '', area: 'Comunidad y Sociedad', estado: 'Activo' });
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <Award size={14} className="text-[#8C731A]" /> Gestión Académica
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Especialidades Académicas
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Catálogo oficial de especialidades de formación de maestros matriculados en la ESFM/UA.
            </p>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg hover:bg-[#a32334] transition-all cursor-pointer shrink-0"
          >
            <Plus size={18} />
            Nueva Especialidad
          </button>
        </div>
      </div>

      {/* FILTRO DE BÚSQUEDA */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por Especialidad, Código o Área..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
          />
        </div>
      </div>

      {/* TARJETAS DE ESPECIALIDADES */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEspecialidades.map((esp) => (
          <div 
            key={esp.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-[#8C731A]/10 text-[#8C731A] font-mono font-black text-xs border border-[#8C731A]/20">
                  {esp.codigo}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                  {esp.estado}
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900 mb-1 leading-snug">
                {esp.nombre}
              </h3>
              <p className="text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-wider">
                Área: {esp.area}
              </p>

              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-3.5 border border-slate-100 text-xs mb-5">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Estudiantes:</span>
                  <span className="font-mono font-black text-slate-800 text-sm">{esp.totalEstudiantes}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Docentes Acompañantes:</span>
                  <span className="font-mono font-black text-slate-800 text-sm">{esp.docentesAcompanantes}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { setSelectedEspecialidad(esp); setShowDetailModal(true); }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-[#8C731A] hover:text-white transition-all cursor-pointer"
            >
              <Eye size={15} /> Ver Estadísticas de Especialidad
            </button>
          </div>
        ))}
      </div>

      {/* MODAL: NUEVA ESPECIALIDAD */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <button
              onClick={() => setShowNewModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-1">
              <Award className="text-[#801B28]" size={20} />
              Registrar Nueva Especialidad
            </h2>

            <form onSubmit={handleCreateEspecialidad} className="space-y-4 text-xs mt-4">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Código Abreviado *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. MAT"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono font-bold focus:border-[#8C731A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Nombre de la Especialidad *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Matemática Educación Secundaria"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold focus:border-[#8C731A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1">Área de Conocimiento *</label>
                <select
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-700 focus:border-[#8C731A] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Comunidad y Sociedad">Comunidad y Sociedad</option>
                  <option value="Vida Tierra Territorio">Vida Tierra Territorio</option>
                  <option value="Desarrollo Humano">Desarrollo Humano</option>
                  <option value="Educación General">Educación General</option>
                  <option value="Ciencia Tecnología y Producción">Ciencia Tecnología y Producción</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#801B28] px-5 py-2 font-bold text-white hover:bg-[#a32334] shadow-md cursor-pointer"
                >
                  Guardar Especialidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VER DETALLE ESPECIALIDAD */}
      {showDetailModal && selectedEspecialidad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-black text-slate-900 mb-1">
              {selectedEspecialidad.nombre}
            </h3>
            <p className="text-xs text-slate-400 font-mono mb-4">Código: {selectedEspecialidad.codigo}</p>

            <div className="space-y-3 text-xs">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Área Saberes:</span>
                  <span className="font-bold text-slate-800">{selectedEspecialidad.area}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Total Estudiantes:</span>
                  <span className="font-bold text-slate-800 font-mono">{selectedEspecialidad.totalEstudiantes}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Docentes Acompañantes:</span>
                  <span className="font-bold text-slate-800 font-mono">{selectedEspecialidad.docentesAcompanantes}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};