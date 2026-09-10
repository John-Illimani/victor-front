import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Eye, 
  UserCheck, 
  FileText, 
  CheckCircle2, 
  Clock, 
  X, 
  Sparkles,
  School,
  GraduationCap,
  ClipboardList,
  CheckSquare
} from 'lucide-react';

export const DocentesGuiaManagement = () => {
  // Lista de Docentes Guía (Maestros de Unidades Educativas / CEA / CEE)
  const [docentesGuia, setDocentesGuia] = useState([
    {
      id: 'DG-001',
      nombre: 'Mg. Carlos',
      apellido: 'Mamani Condori',
      ci: '5920183',
      institucion: 'U.E. Franz Tamayo',
      tipoInst: 'Unidad Educativa',
      correo: 'cmamani@uefranztamayo.edu.bo',
      telefono: '76543210',
      estado: 'Activo',
      estudiantesAsignados: [
        { codigo: 'EST-2026-001', nombre: 'Juan Carlos Pérez Gómez', ano: '2do año', especialidad: 'Educación Primaria' }
      ],
      fichasPermitidas: [
        'Ficha de Asistencia y Puntualidad',
        'F-3 Seguimiento a la Concreción Curricular',
        'Evaluación de la Práctica Educativa'
      ]
    },
    {
      id: 'DG-002',
      nombre: 'Lic. María',
      apellido: 'Choque Quispe',
      ci: '4920182',
      institucion: 'U.E. Bolivia Mar',
      tipoInst: 'Unidad Educativa',
      correo: 'mchoque@ueboliviamar.edu.bo',
      telefono: '71298301',
      estado: 'Activo',
      estudiantesAsignados: [
        { codigo: 'EST-2026-002', nombre: 'Sonia Aliaga Chuquimia', ano: '1er año', especialidad: 'Artes Plásticas y Visuales' }
      ],
      fichasPermitidas: [
        'Ficha de Asistencia y Puntualidad',
        'Ficha de Diagnóstico de Aula'
      ]
    },
    {
      id: 'DG-003',
      nombre: 'Prof. Hernán',
      apellido: 'Gutiérrez Calle',
      ci: '3829102',
      institucion: 'CEA Pedro Domingo Murillo',
      tipoInst: 'CEA',
      correo: 'hgutierrez@ceapedro.edu.bo',
      telefono: '73019283',
      estado: 'Activo',
      estudiantesAsignados: [
        { codigo: 'EST-2026-003', nombre: 'Marco Antonio Condori Yana', ano: '3er año', especialidad: 'Biología-Geografía' }
      ],
      fichasPermitidas: [
        'Ficha de Asistencia y Puntualidad',
        'F-3 Seguimiento a la Concreción Curricular',
        'Evaluación del Proyecto Productivo'
      ]
    }
  ]);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');

  // Modal Docente Guía
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('datos'); // 'datos' | 'institucion' | 'estudiantes' | 'fichas'

  // Filtrado
  const filteredDocentes = docentesGuia.filter(docente => {
    const matchesSearch = 
      docente.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${docente.nombre} ${docente.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docente.institucion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docente.ci.includes(searchTerm);

    const matchesTipo = tipoFilter === '' || docente.tipoInst === tipoFilter;

    return matchesSearch && matchesTipo;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <School size={14} className="text-[#8C731A]" /> Gestión Académica
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Docentes Guía
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Administración de maestros de Unidades Educativas, CEA y CEE encargados de la asistencia y la evaluación de la concreción curricular.
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
            placeholder="Buscar por Nombre, C.I. o Unidad Educativa / CEA / CEE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none appearance-none bg-white cursor-pointer"
          >
            <option value="">Todas las Instituciones (UE / CEA / CEE)</option>
            <option value="Unidad Educativa">Unidad Educativa</option>
            <option value="CEA">CEA (Centro de Educación de Alternativa)</option>
            <option value="CEE">CEE (Centro de Educación Especial)</option>
          </select>
        </div>
      </div>

      {/* TABLA DE DOCENTES GUÍA */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Docente Guía</th>
                <th className="py-3.5 px-4">C.I.</th>
                <th className="py-3.5 px-4">Unidad Educativa / CEA / CEE</th>
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
                    <td className="py-3.5 px-4">
                      <span className="block font-bold text-slate-800">{docente.institucion}</span>
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase">{docente.tipoInst}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-black text-slate-900">
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
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
                        <Eye size={14} /> Ver Ficha
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                    No se encontraron docentes guía registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FICHA DEL DOCENTE GUÍA */}
      {showModal && selectedDocente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* ENCABEZADO Y PESTAÑAS */}
            <div className="border-b border-slate-200 pb-4 mb-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#801B28]">
                DOCENTE GUÍA
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                {`${selectedDocente.nombre} ${selectedDocente.apellido}`}
              </h2>
              <p className="text-xs text-slate-500 font-mono">C.I. {selectedDocente.ci} | {selectedDocente.institucion}</p>

              {/* NAVEGACIÓN MODAL */}
              <div className="flex flex-wrap gap-2 mt-4 pt-2">
                {['datos', 'institucion', 'estudiantes', 'fichas'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      activeTab === tab
                        ? 'bg-[#801B28] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab === 'datos' && 'Datos del Docente'}
                    {tab === 'institucion' && 'Unidad Educativa'}
                    {tab === 'estudiantes' && `Estudiantes (${selectedDocente.estudiantesAsignados.length})`}
                    {tab === 'fichas' && 'Fichas que Habilita'}
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
                  <span className="block font-bold text-slate-400">Correo Electrónico:</span>
                  <span className="block font-bold text-slate-800 mt-0.5">{selectedDocente.correo}</span>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <span className="block font-bold text-slate-400">Teléfono / Celular:</span>
                  <span className="block font-bold text-slate-800 mt-0.5">{selectedDocente.telefono}</span>
                </div>
              </div>
            )}

            {/* TAB 2: UNIDAD EDUCATIVA / CEA / CEE */}
            {activeTab === 'institucion' && (
              <div className="space-y-4 text-xs">
                <div className="rounded-2xl bg-purple-50/60 p-5 border border-purple-200">
                  <span className="block text-[10px] font-extrabold text-purple-900 uppercase">Institución Educativa Registrada</span>
                  <h4 className="text-base font-black text-purple-950 mt-1">{selectedDocente.institucion}</h4>
                  <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-purple-200 text-purple-900 font-extrabold text-[10px]">
                    {selectedDocente.tipoInst}
                  </span>
                </div>
              </div>
            )}

            {/* TAB 3: ESTUDIANTES ASIGNADOS */}
            {activeTab === 'estudiantes' && (
              <div className="space-y-3 text-xs">
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  {selectedDocente.estudiantesAsignados.map((est) => (
                    <div key={est.codigo} className="p-3.5 hover:bg-slate-50 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-800 block">{est.nombre}</span>
                        <span className="text-[11px] text-slate-500">{est.codigo} • {est.ano} • {est.especialidad}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Asignado</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: FICHAS HABILITADAS QUE PUEDE LLENAR */}
            {activeTab === 'fichas' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-500 font-medium">Documentos y formularios en los que tiene participación directa:</p>
                <div className="space-y-2">
                  {selectedDocente.fichasPermitidas.map((ficha, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-800">
                      <CheckSquare size={16} className="text-[#801B28]" />
                      {ficha}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
              >
                Cerrar Ficha
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};