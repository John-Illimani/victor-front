import React, { useState } from 'react';
import { 
  UserCheck, 
  Search, 
  Filter, 
  Eye, 
  UserPlus, 
  Building2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  X, 
  Sparkles,
  BookOpen,
  Users,
  ShieldCheck,
  ChevronRight,
  Plus,
  Trash2
} from 'lucide-react';

export const DocentesAcompañantesManagement = () => {
  // Datos iniciales de Docentes Acompañantes (ESFM/UA)
  const [docentes, setDocentes] = useState([
    {
      id: 'DOC-001',
      nombre: 'Dra. Elena',
      apellido: 'Quisbert Flores',
      ci: '6129384',
      correo: 'equisbert@esfmthea.edu.bo',
      telefono: '72839401',
      especialidad: 'Educación Primaria Comunitaria Vocacional',
      estado: 'Activo',
      estudiantesAsignados: [
        { codigo: 'EST-2026-001', nombre: 'Juan Carlos Pérez Gómez', ano: '2do año', ue: 'U.E. Franz Tamayo' },
        { codigo: 'EST-2026-003', nombre: 'Marco Antonio Condori Yana', ano: '3er año', ue: 'CEA Pedro Domingo Murillo' }
      ]
    },
    {
      id: 'DOC-002',
      nombre: 'Lic. Roberto',
      apellido: 'Mendoza Aliaga',
      ci: '4839201',
      correo: 'rmendoza@esfmthea.edu.bo',
      telefono: '71234567',
      especialidad: 'Artes Plásticas y Visuales',
      estado: 'Activo',
      estudiantesAsignados: [
        { codigo: 'EST-2026-002', nombre: 'Sonia Aliaga Chuquimia', ano: '1er año', ue: 'U.E. Bolivia Mar' }
      ]
    },
    {
      id: 'DOC-003',
      nombre: 'Lic. Mario',
      apellido: 'Vargas Mamani',
      ci: '5820194',
      correo: 'mvargas@esfmthea.edu.bo',
      telefono: '76543210',
      especialidad: 'Educación Musical',
      estado: 'Inactivo',
      estudiantesAsignados: []
    }
  ]);

  // Lista global de estudiantes disponibles para asignar
  const [estudiantesDisponibles] = useState([
    { codigo: 'EST-2026-004', nombre: 'Laura Vanessa Quispe Morales', ano: '4to año', especialidad: 'Educación Musical' },
    { codigo: 'EST-2026-005', nombre: 'Pedro Luis Mamani Calle', ano: '2do año', especialidad: 'Educación Primaria Comunitaria Vocacional' }
  ]);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [especialidadFilter, setEspecialidadFilter] = useState('');

  // Modal Docente
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('datos'); // 'datos' | 'estudiantes' | 'actas' | 'seguimiento'
  const [selectedEstudianteToAdd, setSelectedEstudianteToAdd] = useState('');

  // Filtrado de docentes
  const filteredDocentes = docentes.filter(docente => {
    const matchesSearch = 
      docente.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${docente.nombre} ${docente.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docente.ci.includes(searchTerm);

    const matchesEspecialidad = especialidadFilter === '' || docente.especialidad === especialidadFilter;

    return matchesSearch && matchesEspecialidad;
  });

  // Asignar estudiante a docente
  const handleAssignStudent = () => {
    if (!selectedEstudianteToAdd || !selectedDocente) return;
    const studentObj = estudiantesDisponibles.find(e => e.codigo === selectedEstudianteToAdd);
    if (!studentObj) return;

    const updatedDocente = {
      ...selectedDocente,
      estudiantesAsignados: [
        ...selectedDocente.estudiantesAsignados,
        { codigo: studentObj.codigo, nombre: studentObj.nombre, ano: studentObj.ano, ue: 'Por Asignar' }
      ]
    };

    setSelectedDocente(updatedDocente);
    setDocentes(docentes.map(d => d.id === updatedDocente.id ? updatedDocente : d));
    setSelectedEstudianteToAdd('');
  };

  // Quitar estudiante
  const handleRemoveStudent = (codigoEstudiante) => {
    const updatedDocente = {
      ...selectedDocente,
      estudiantesAsignados: selectedDocente.estudiantesAsignados.filter(e => e.codigo !== codigoEstudiante)
    };
    setSelectedDocente(updatedDocente);
    setDocentes(docentes.map(d => d.id === updatedDocente.id ? updatedDocente : d));
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <UserCheck size={14} className="text-[#6B9E1E]" /> Gestión Académica
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Docentes Acompañantes
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Administración de docentes tutores de la ESFM/UA, asignación de estudiantes practicantes y seguimiento institucional de actas.
            </p>
          </div>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por C.I., nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <select
            value={especialidadFilter}
            onChange={(e) => setEspecialidadFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none appearance-none bg-white cursor-pointer"
          >
            <option value="">Todas las Especialidades</option>
            <option value="Artes Plásticas y Visuales">Artes Plásticas y Visuales</option>
            <option value="Ciencias Naturales Biología-Geografía">Ciencias Naturales Biología-Geografía</option>
            <option value="Educación Inicial en Familia Comunitaria">Educación Inicial en Familia Comunitaria</option>
            <option value="Educación Musical">Educación Musical</option>
            <option value="Educación Primaria Comunitaria Vocacional">Educación Primaria Comunitaria Vocacional</option>
            <option value="Comunicación y Lenguajes – Lengua Extranjera Inglés">Comunicación y Lenguajes – Lengua Extranjera Inglés</option>
          </select>
        </div>
      </div>

      {/* TABLA DE DOCENTES ACOMPAÑANTES */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Docente Acompañante</th>
                <th className="py-3.5 px-4">C.I.</th>
                <th className="py-3.5 px-4">Especialidad</th>
                <th className="py-3.5 px-4 text-center">Estudiantes Asignados</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredDocentes.length > 0 ? (
                filteredDocentes.map((docente) => (
                  <tr key={docente.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="block font-bold text-slate-900">{`${docente.nombre} ${docente.apellido}`}</span>
                      <span className="text-[11px] text-slate-400">{docente.correo}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{docente.ci}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{docente.especialidad}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-black text-slate-900">
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                        {docente.estudiantesAsignados.length}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        docente.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {docente.estado}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => { setSelectedDocente(docente); setShowModal(true); setActiveTab('datos'); }}
                        className="flex items-center justify-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-[#8C731A] hover:text-white transition-all mx-auto cursor-pointer"
                      >
                        <Eye size={14} /> Administrar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                    No se encontraron docentes acompañantes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ADMINISTRAR DOCENTE ACOMPAÑANTE */}
      {showModal && selectedDocente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* ENCABEZADO Y PESTAÑAS */}
            <div className="border-b border-slate-200 pb-4 mb-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8C731A]">
                DOCENTE ACOMPAÑANTE (ESFM/UA)
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                {`${selectedDocente.nombre} ${selectedDocente.apellido}`}
              </h2>
              <p className="text-xs text-slate-500 font-mono">C.I. {selectedDocente.ci} | {selectedDocente.especialidad}</p>

              {/* BARRA DE NAVEGACIÓN MODAL */}
              <div className="flex flex-wrap gap-2 mt-4 pt-2">
                {['datos', 'estudiantes', 'actas', 'seguimiento'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      activeTab === tab
                        ? 'bg-[#801B28] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab === 'datos' && 'Datos Personales'}
                    {tab === 'estudiantes' && `Estudiantes (${selectedDocente.estudiantesAsignados.length})`}
                    {tab === 'actas' && 'Actas / Fichas'}
                    {tab === 'seguimiento' && 'Seguimiento'}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: DATOS PERSONALES */}
            {activeTab === 'datos' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <span className="block font-bold text-slate-400">Nombre Completo:</span>
                  <span className="block font-extrabold text-slate-800 text-sm mt-0.5">{`${selectedDocente.nombre} ${selectedDocente.apellido}`}</span>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <span className="block font-bold text-slate-400">C.I.:</span>
                  <span className="block font-mono font-extrabold text-slate-800 text-sm mt-0.5">{selectedDocente.ci}</span>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <span className="block font-bold text-slate-400">Correo Institucional:</span>
                  <span className="block font-bold text-slate-800 mt-0.5">{selectedDocente.correo}</span>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <span className="block font-bold text-slate-400">Teléfono / Celular:</span>
                  <span className="block font-bold text-slate-800 mt-0.5">{selectedDocente.telefono}</span>
                </div>
              </div>
            )}

            {/* TAB 2: ASIGNACIÓN DE ESTUDIANTES */}
            {activeTab === 'estudiantes' && (
              <div className="space-y-4 text-xs">
                {/* Asignar Nuevo Estudiante */}
                <div className="flex gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <select
                    value={selectedEstudianteToAdd}
                    onChange={(e) => setSelectedEstudianteToAdd(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-700 bg-white"
                  >
                    <option value="">-- Seleccionar Estudiante para Asignar --</option>
                    {estudiantesDisponibles.map((e) => (
                      <option key={e.codigo} value={e.codigo}>{e.codigo} - {e.nombre} ({e.ano})</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignStudent}
                    className="flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    <Plus size={14} /> Asignar
                  </button>
                </div>

                {/* Lista de Estudiantes Asignados */}
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  {selectedDocente.estudiantesAsignados.length > 0 ? (
                    selectedDocente.estudiantesAsignados.map((est) => (
                      <div key={est.codigo} className="flex items-center justify-between p-3.5 hover:bg-slate-50">
                        <div>
                          <span className="font-bold text-slate-800 block">{est.nombre}</span>
                          <span className="text-[11px] font-mono text-slate-400">{est.codigo} • {est.ano} • {est.ue}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveStudent(est.codigo)}
                          className="rounded-xl p-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Desasignar Estudiante"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-center text-slate-400">Sin estudiantes asignados actualmente.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ACTAS Y FICHAS */}
            {activeTab === 'actas' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-500 font-medium">Fichas bajo revisión directa de este docente acompañante:</p>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="font-bold text-slate-800">F-1 Diagnóstico Institucional (EST-2026-001)</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Validado</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-bold text-slate-800">F-2 Planificación de Práctica (EST-2026-003)</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">En Revisión</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SEGUIMIENTO */}
            {activeTab === 'seguimiento' && (
              <div className="text-xs space-y-3">
                <div className="rounded-2xl bg-blue-50/60 border border-blue-200 p-4 text-slate-700">
                  <span className="block font-bold text-blue-900 mb-1">Resumen de Avance IEPC-PEC</span>
                  <p>El docente ha completado la revisión del 80% de las fichas asignadas para la Gestión 2026.</p>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
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