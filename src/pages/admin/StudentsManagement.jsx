import React, { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Eye, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  Building2, 
  Calendar, 
  X, 
  Sparkles,
  Download,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const StudentsManagement = () => {
  // Lista de estudiantes basada en las 6 especialidades de la ESFM/UA
  const [students, setStudents] = useState([
    {
      codigo: 'EST-2026-001',
      nombre: 'Juan Carlos',
      apellido: 'Pérez Gómez',
      ci: '8492012',
      ano: '2do año',
      especialidad: 'Educación Primaria Comunitaria Vocacional',
      gestion: '2026',
      docenteAcompanante: 'Dra. Elena Quisbert Flores',
      docenteGuia: 'Mg. Carlos Mamani Condori',
      unidadEducativa: 'U.E. Franz Tamayo',
      estado: 'En Proceso'
    },
    {
      codigo: 'EST-2026-002',
      nombre: 'Sonia',
      apellido: 'Aliaga Chuquimia',
      ci: '9120394',
      ano: '1er año',
      especialidad: 'Artes Plásticas y Visuales',
      gestion: '2026',
      docenteAcompanante: 'Lic. Roberto Mendoza Aliaga',
      docenteGuia: 'Lic. María Choque',
      unidadEducativa: 'U.E. Bolivia Mar',
      estado: 'Aprobado'
    },
    {
      codigo: 'EST-2026-003',
      nombre: 'Marco Antonio',
      apellido: 'Condori Yana',
      ci: '7482910',
      ano: '3er año',
      especialidad: 'Ciencias Naturales Biología-Geografía',
      gestion: '2026',
      docenteAcompanante: 'Dra. Elena Quisbert Flores',
      docenteGuia: 'Prof. Hernán Gutiérrez',
      unidadEducativa: 'CEA Pedro Domingo Murillo',
      estado: 'Observado'
    },
    {
      codigo: 'EST-2026-004',
      nombre: 'Laura Vanessa',
      apellido: 'Quispe Morales',
      ci: '6930192',
      ano: '4to año',
      especialidad: 'Educación Musical',
      gestion: '2026',
      docenteAcompanante: 'Lic. Mario Vargas',
      docenteGuia: 'Prof. Beatriz López',
      unidadEducativa: 'U.E. Mariscal Sucre',
      estado: 'En Proceso'
    }
  ]);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [anoFilter, setAnoFilter] = useState('');
  const [especialidadFilter, setEspecialidadFilter] = useState('');

  // Modal Ficha del Estudiante
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showFichaModal, setShowFichaModal] = useState(false);

  // Filtrado de la lista
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${student.nombre} ${student.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.ci.includes(searchTerm);

    const matchesAno = anoFilter === '' || student.ano === anoFilter;
    const matchesEspecialidad = especialidadFilter === '' || student.especialidad === especialidadFilter;

    return matchesSearch && matchesAno && matchesEspecialidad;
  });

  // Estructura adaptativa de Fichas según el Año de Formación
  const getFichasByAno = (ano) => {
    // Configuración general por año de formación según normativa ESFM 2026
    if (ano === '1er año') {
      return [
        { id: 'acta_inicio', nombre: 'Acta de Inicio', estado: 'Completado' },
        { id: 'f1', nombre: 'F-1: Ficha de Diagnóstico Institucional', estado: 'Completado' },
        { id: 'f2', nombre: 'F-2: Planificación de Observación', estado: 'Completado' },
        { id: 'centralizador', nombre: 'Centralizador de Notas', estado: 'Pendiente' },
      ];
    } else if (ano === '2do año') {
      return [
        { id: 'acta_inicio', nombre: 'Acta de Inicio', estado: 'Completado' },
        { id: 'acta_conf', nombre: 'Acta de Conformación de Equipo', estado: 'Completado' },
        { id: 'f1', nombre: 'F-1: Ficha de Diagnóstico Comunitario', estado: 'Completado' },
        { id: 'f2', nombre: 'F-2: Plan de Investigación-Acción', estado: 'Completado' },
        { id: 'f3', nombre: 'F-3: Seguimiento del Docente Guía', estado: 'Completado' },
        { id: 'f4', nombre: 'F-4: Registro de Experiencias', estado: 'Observado' },
        { id: 'f5', nombre: 'F-5: Evaluación de la Concreción', estado: 'Pendiente' },
        { id: 'f6', nombre: 'F-6: Informe de Producción', estado: 'Pendiente' },
        { id: 'centralizador', nombre: 'Centralizador Final', estado: 'Pendiente' },
      ];
    } else {
      // 3er a 5to Año
      return [
        { id: 'acta_inicio', nombre: 'Acta de Inicio', estado: 'Completado' },
        { id: 'acta_conf', nombre: 'Acta de Conformación de Equipo', estado: 'Completado' },
        { id: 'f1', nombre: 'F-1: Diagnóstico Socio-Ambiental', estado: 'Completado' },
        { id: 'f2', nombre: 'F-2: Diseño del Proyecto de Investigación', estado: 'Completado' },
        { id: 'f3', nombre: 'F-3: Validación Curricular', estado: 'Completado' },
        { id: 'f4', nombre: 'F-4: Aplicación Instrumentos', estado: 'Completado' },
        { id: 'f5', nombre: 'F-5: Evaluación IEPC-PEC', estado: 'Completado' },
        { id: 'f6', nombre: 'F-6: Producto Final / Artículo Técnico', estado: 'Pendiente' },
        { id: 'centralizador', nombre: 'Centralizador Final', estado: 'Pendiente' },
      ];
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER ENCABEZADO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <GraduationCap size={14} className="text-[#8C731A]" /> Gestión Académica
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Administración de Estudiantes
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Consulta de estudiantes matriculados, asignación de docentes y seguimiento del estado de fichas y actas IEPC-PEC.
            </p>
          </div>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por Código, Estudiante o C.I...."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <select
            value={anoFilter}
            onChange={(e) => setAnoFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none appearance-none bg-white cursor-pointer"
          >
            <option value="">Todos los Años de Formación</option>
            <option value="1er año">1er año</option>
            <option value="2do año">2do año</option>
            <option value="3er año">3er año</option>
            <option value="4to año">4to año</option>
            <option value="5to año">5to año</option>
          </select>
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

      {/* TABLA DE ESTUDIANTES */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Código</th>
                <th className="py-3.5 px-4">Estudiante / C.I.</th>
                <th className="py-3.5 px-4">Año / Especialidad</th>
                <th className="py-3.5 px-4">Gestión</th>
                <th className="py-3.5 px-4">Docente Acompañante</th>
                <th className="py-3.5 px-4">Estado IEPC-PEC</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.codigo} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#801B28]">{student.codigo}</td>
                    <td className="py-3.5 px-4">
                      <span className="block font-bold text-slate-900">{`${student.nombre} ${student.apellido}`}</span>
                      <span className="font-mono text-[11px] text-slate-400">C.I. {student.ci}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="block font-bold text-slate-800">{student.ano}</span>
                      <span className="text-[11px] text-slate-500">{student.especialidad}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{student.gestion}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">{student.docenteAcompanante}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        student.estado === 'Aprobado' ? 'bg-emerald-100 text-emerald-800' :
                        student.estado === 'En Proceso' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {student.estado}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => { setSelectedStudent(student); setShowFichaModal(true); }}
                        className="flex items-center justify-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-[#8C731A] hover:text-white transition-all mx-auto cursor-pointer"
                      >
                        <Eye size={14} /> Ficha Estudiante
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                    No se encontraron estudiantes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: FICHA DEL ESTUDIANTE CON FICHAS ADAPTATIVAS */}
      {showFichaModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowFichaModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* ENCABEZADO FICHA */}
            <div className="border-b border-slate-200 pb-4 mb-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8C731A]">
                Ficha Académica del Estudiante
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                {`${selectedStudent.nombre} ${selectedStudent.apellido}`}
              </h2>
              <p className="text-xs text-slate-500 font-mono">{selectedStudent.codigo} | C.I. {selectedStudent.ci}</p>
            </div>

            {/* DATOS DEL ESTUDIANTE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-200 mb-6 text-xs">
              <div>
                <span className="block font-bold text-slate-400">Especialidad:</span>
                <span className="block font-extrabold text-slate-800">{selectedStudent.especialidad}</span>
              </div>
              <div>
                <span className="block font-bold text-slate-400">Año de Formación / Gestión:</span>
                <span className="block font-extrabold text-slate-800">{selectedStudent.ano} - Gestión {selectedStudent.gestion}</span>
              </div>
              <div>
                <span className="block font-bold text-slate-400">Docente Acompañante (ESFM):</span>
                <span className="block font-bold text-slate-800">{selectedStudent.docenteAcompanante}</span>
              </div>
              <div>
                <span className="block font-bold text-slate-400">Docente Guía / Unidad Educativa:</span>
                <span className="block font-bold text-slate-800">{selectedStudent.docenteGuia} ({selectedStudent.unidadEducativa})</span>
              </div>
            </div>

            {/* FICHAS Y ACTAS ADAPTATIVAS SEGÚN AÑO */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} className="text-[#801B28]" />
                Actas y Fichas Asignadas ({selectedStudent.ano})
              </h3>

              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                {getFichasByAno(selectedStudent.ano).map((ficha) => (
                  <div key={ficha.id} className="flex items-center justify-between p-3.5 text-xs hover:bg-slate-50">
                    <span className="font-bold text-slate-800">{ficha.nombre}</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      ficha.estado === 'Completado' ? 'bg-emerald-100 text-emerald-800' :
                      ficha.estado === 'Observado' ? 'bg-rose-100 text-rose-800' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {ficha.estado === 'Completado' && <CheckCircle2 size={12} />}
                      {ficha.estado === 'Observado' && <AlertTriangle size={12} />}
                      {ficha.estado === 'Pendiente' && <Clock size={12} />}
                      {ficha.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowFichaModal(false)}
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