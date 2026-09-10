import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Eye, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  X, 
  Sparkles,
  FileSpreadsheet,
  Upload,
  Loader2,
  FileCheck,
  AlertCircle,
  UserPlus,
  Edit,
  Trash2,
  Lock,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { read, utils } from 'xlsx';

import { studentService } from '../../services/studentService';

export const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Selección múltiple para eliminación
  const [selectedIds, setSelectedIds] = useState([]);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [anoFilter, setAnoFilter] = useState('');
  const [especialidadFilter, setEspecialidadFilter] = useState('');

  // Modales
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showFichaModal, setShowFichaModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showNewStudentModal, setShowNewStudentModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Modal Confirmación de Eliminación
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // 'single' o 'batch'
  const [studentToDeleteId, setStudentToDeleteId] = useState(null);

  // Modal Feedback / Notificación
  const [feedbackModal, setFeedbackModal] = useState({
    show: false,
    title: '',
    message: '',
    type: 'success'
  });

  // Formulario de Estudiante (Sin correo visible)
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    password: '',
    nombres: '',
    apellidos: '',
    ci: '',
    telefono: '',
    esfm_ua: 'ESFM/UA - El Alto',
    especialidad: 'Educación Primaria Comunitaria Vocacional',
    genero: '',
    modalidad_ingreso: 'ADMISION GENERAL',
    ano_formacion: '1RO A'
  });

  // Carga Masiva Excel
  const [excelFile, setExcelFile] = useState(null);
  const [parsedStudents, setParsedStudents] = useState([]);

  const showFeedback = (title, message, type = 'success') => {
    setFeedbackModal({ show: true, title, message, type });
  };

  // Cargar estudiantes desde PostgreSQL
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await studentService.getStudents();
      setStudents(data);
      setSelectedIds([]);
    } catch (err) {
      showFeedback('Error de Conexión', err.message || 'Error al obtener la lista de estudiantes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filtrado de la lista
  const filteredStudents = students.filter(student => {
    const fullName = `${student.nombre || ''} ${student.apellido || ''}`.toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = 
      (student.username && student.username.toLowerCase().includes(search)) ||
      fullName.includes(search) ||
      (student.ci && student.ci.includes(search));

    const matchesAno = anoFilter === '' || student.ano_formacion === anoFilter;
    const matchesEspecialidad = especialidadFilter === '' || student.especialidad === especialidadFilter;

    return matchesSearch && matchesAno && matchesEspecialidad;
  });

  // Selección múltiple
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredStudents.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Auto-generación de Username (nombre_carnet) y Password (carnet*)
  const handleNameOrCiChange = (field, value) => {
    const updatedForm = { ...formData, [field]: value };
    const primerNombre = (updatedForm.nombres || '').trim().split(' ')[0].toLowerCase();
    const carnet = (updatedForm.ci || '').trim();

    if (!isEditing) {
      if (primerNombre && carnet) {
        updatedForm.username = `${primerNombre}_${carnet}`;
      }
      if (carnet) {
        updatedForm.password = `${carnet}*`;
      }
    }
    setFormData(updatedForm);
  };

  const handleRegenerateCredentials = () => {
    const primerNombre = (formData.nombres || '').trim().split(' ')[0].toLowerCase();
    const carnet = (formData.ci || '').trim();

    if (!primerNombre || !carnet) {
      showFeedback('Atención', 'Ingrese Nombres y C.I. para generar las credenciales.', 'error');
      return;
    }

    setFormData({
      ...formData,
      username: `${primerNombre}_${carnet}`,
      password: `${carnet}*`
    });
  };

  // Guardar (Crear / Actualizar)
  const handleSubmitStudent = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        username: formData.username,
        nombre: formData.nombres,
        apellido: formData.apellidos,
        ci: formData.ci,
        telefono: formData.telefono,
        esfm_ua: formData.esfm_ua,
        especialidad: formData.especialidad,
        genero: formData.genero,
        modalidad_ingreso: formData.modalidad_ingreso,
        ano_formacion: formData.ano_formacion
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (isEditing) {
        await studentService.updateStudent(formData.id, payload);
        showFeedback('Estudiante Actualizado', 'Los datos han sido modificados correctamente.', 'success');
      } else {
        await studentService.createStudent(payload);
        showFeedback('Estudiante Registrado', 'El estudiante fue registrado exitosamente.', 'success');
      }

      setShowNewStudentModal(false);
      resetForm();
      fetchStudents();
    } catch (err) {
      showFeedback('Error al Guardar', err.message || 'Ocurrió un error al procesar la solicitud.', 'error');
    }
  };

  // Confirmar Eliminación Individual
  const confirmSingleDelete = (id) => {
    setStudentToDeleteId(id);
    setDeleteTarget('single');
    setShowDeleteConfirmModal(true);
  };

  // Confirmar Eliminación Masiva
  const confirmBatchDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteTarget('batch');
    setShowDeleteConfirmModal(true);
  };

  // Ejecutar Eliminación
  const executeDelete = async () => {
    setShowDeleteConfirmModal(false);
    setActionLoading(true);

    try {
      if (deleteTarget === 'single' && studentToDeleteId) {
        await studentService.deleteStudent(studentToDeleteId);
        showFeedback('Estudiante Eliminado', 'El estudiante fue eliminado del sistema.', 'success');
      } else if (deleteTarget === 'batch' && selectedIds.length > 0) {
        const res = await studentService.deleteMultipleStudents(selectedIds);
        showFeedback('Eliminación Masiva', res.message || 'Estudiantes eliminados correctamente.', 'success');
      }
      fetchStudents();
    } catch (err) {
      showFeedback('Error al Eliminar', err.message || 'No se pudo completar la eliminación.', 'error');
    } finally {
      setActionLoading(false);
      setStudentToDeleteId(null);
    }
  };

  const openEditModal = (student) => {
    setIsEditing(true);
    setFormData({
      id: student.id,
      username: student.username,
      password: '',
      nombres: student.nombre,
      apellidos: student.apellido,
      ci: student.ci,
      telefono: student.telefono || '',
      esfm_ua: student.esfm_ua || 'ESFM/UA - El Alto',
      especialidad: student.especialidad || 'Educación Primaria Comunitaria Vocacional',
      genero: student.genero || '',
      modalidad_ingreso: student.modalidad_ingreso || 'ADMISION GENERAL',
      ano_formacion: student.ano_formacion || '1RO A'
    });
    setShowNewStudentModal(true);
  };

  const resetForm = () => {
    setIsEditing(false);
    setShowPassword(false);
    setFormData({
      id: '',
      username: '',
      password: '',
      nombres: '',
      apellidos: '',
      ci: '',
      telefono: '',
      esfm_ua: 'ESFM/UA - El Alto',
      especialidad: 'Educación Primaria Comunitaria Vocacional',
      genero: '',
      modalidad_ingreso: 'ADMISION GENERAL',
      ano_formacion: '1RO A'
    });
  };

  // Excel Parser exclusivo de estudiantes
  const handleExcelFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelFile(file);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = read(bstr, { type: 'binary' });
      const wsName = wb.SheetNames[0];
      const ws = wb.Sheets[wsName];

      const data = utils.sheet_to_json(ws, { header: 1 });

      if (data.length === 0) {
        showFeedback('Archivo Vacío', 'El archivo Excel no contiene información.', 'error');
        return;
      }

      let headerRowIndex = 0;
      for (let i = 0; i < Math.min(data.length, 5); i++) {
        const rowStr = JSON.stringify(data[i]).toUpperCase();
        if (rowStr.includes('CÉDULA') || rowStr.includes('CEDULA')) {
          headerRowIndex = i;
          break;
        }
      }

      const headers = data[headerRowIndex].map(h => String(h || '').trim());
      const rawRows = data.slice(headerRowIndex + 1);

      const parsed = [];

      const ciIdx = headers.findIndex(h => h.toUpperCase().includes('CÉDULA') || h.toUpperCase().includes('CEDULA'));
      const nameIdx = headers.findIndex(h => h.toUpperCase().includes('APELLIDOS') || h.toUpperCase().includes('NOMBRES'));
      const genIdx = headers.findIndex(h => h.toUpperCase().includes('GENERO'));
      const espIdx = headers.findIndex(h => h.toUpperCase().includes('ESPECIALIDAD'));
      const modIdx = headers.findIndex(h => h.toUpperCase().includes('MODALIDAD'));
      const anoIdx = headers.findIndex(h => h.toUpperCase().includes('FORMACION') || h.toUpperCase().includes('AÑO'));

      rawRows.forEach(row => {
        if (!row[ciIdx]) return;
        const ci = String(row[ciIdx]).trim();
        const fullName = String(row[nameIdx] || '').trim();
        const genero = row[genIdx] ? String(row[genIdx]).trim() : '';
        const especialidad = row[espIdx] ? String(row[espIdx]).trim() : '';
        const modalidad = row[modIdx] ? String(row[modIdx]).trim() : '';
        const ano = row[anoIdx] ? String(row[anoIdx]).trim() : '';

        const parts = fullName.split(' ');
        let apellido = fullName;
        let nombre = fullName;

        if (parts.length >= 2) {
          apellido = `${parts[0]} ${parts[1]}`;
          nombre = parts.slice(2).join(' ') || parts[1];
        }

        const primerNombre = (nombre || '').split(' ')[0].toLowerCase();

        parsed.push({
          ci,
          nombre,
          apellido,
          username: `${primerNombre}_${ci}`,
          correo: `${ci}@est.esfm.edu.bo`,
          password: `${ci}*`,
          rol: 'ESTUDIANTE',
          especialidad,
          genero,
          modalidad_ingreso: modalidad,
          ano_formacion: ano
        });
      });

      setParsedStudents(parsed);
    };

    reader.readAsBinaryString(file);
  };

  const handleImportExcelToDB = async () => {
    if (parsedStudents.length === 0) return;

    setActionLoading(true);
    try {
      const res = await studentService.importBatchStudents(parsedStudents);
      showFeedback('Importación Exitosa', res.message || `Se procesaron ${parsedStudents.length} estudiantes.`, 'success');
      setShowExcelModal(false);
      setExcelFile(null);
      setParsedStudents([]);
      fetchStudents();
    } catch (err) {
      showFeedback('Error de Importación', err.message || 'Ocurrió un error al importar.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Fichas adaptativas
  const getFichasByAno = (ano) => {
    if (ano && ano.includes('1')) {
      return [
        { id: 'acta_inicio', nombre: 'Acta de Inicio', estado: 'Completado' },
        { id: 'f1', nombre: 'F-1: Ficha de Diagnóstico Institucional', estado: 'Completado' },
        { id: 'f2', nombre: 'F-2: Planificación de Observación', estado: 'Completado' },
        { id: 'centralizador', nombre: 'Centralizador de Notas', estado: 'Pendiente' },
      ];
    } else if (ano && ano.includes('2')) {
      return [
        { id: 'acta_inicio', nombre: 'Acta de Inicio', estado: 'Completado' },
        { id: 'acta_conf', nombre: 'Acta de Conformación de Equipo', estado: 'Completado' },
        { id: 'f1', nombre: 'F-1: Ficha de Diagnóstico Comunitario', estado: 'Completado' },
        { id: 'f2', nombre: 'F-2: Plan de Investigación-Acción', estado: 'Completado' },
        { id: 'f3', nombre: 'F-3: Seguimiento del Docente Guía', estado: 'Completado' },
        { id: 'f4', nombre: 'F-4: Registro de Experiencias', estado: 'Observado' },
        { id: 'centralizador', nombre: 'Centralizador Final', estado: 'Pendiente' },
      ];
    } else {
      return [
        { id: 'acta_inicio', nombre: 'Acta de Inicio', estado: 'Completado' },
        { id: 'acta_conf', nombre: 'Acta de Conformación de Equipo', estado: 'Completado' },
        { id: 'f1', nombre: 'F-1: Diagnóstico Socio-Ambiental', estado: 'Completado' },
        { id: 'f2', nombre: 'F-2: Diseño del Proyecto de Investigación', estado: 'Completado' },
        { id: 'f3', nombre: 'F-3: Validación Curricular', estado: 'Completado' },
        { id: 'f4', nombre: 'F-4: Aplicación Instrumentos', estado: 'Completado' },
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
              Consulta de estudiantes matriculados, seguimiento del estado de fichas y actas IEPC-PEC.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowExcelModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-extrabold uppercase text-white shadow-lg hover:bg-emerald-700 transition-all cursor-pointer"
            >
              <FileSpreadsheet size={16} />
              Cargar Excel
            </button>
            <button
              onClick={() => { resetForm(); setShowNewStudentModal(true); }}
              className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-4 py-3 text-xs font-extrabold uppercase text-white shadow-lg hover:bg-[#a32334] transition-all cursor-pointer"
            >
              <UserPlus size={16} />
              + Nuevo Estudiante
            </button>
          </div>
        </div>
      </div>

      {/* BARRA DE SELECCIÓN MÚLTIPLE */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl bg-[#801B28] px-6 py-3 text-white shadow-xl animate-in fade-in slide-in-from-top-2">
          <span className="text-xs font-black uppercase tracking-wider">
            {selectedIds.length} {selectedIds.length === 1 ? 'estudiante seleccionado' : 'estudiantes seleccionados'}
          </span>
          <button
            onClick={confirmBatchDelete}
            disabled={actionLoading}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-extrabold uppercase text-[#801B28] hover:bg-rose-100 transition-all cursor-pointer disabled:opacity-50"
          >
            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Eliminar Selección
          </button>
        </div>
      )}

      {/* FILTROS Y BÚSQUEDA */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por Username, Estudiante o C.I...."
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
            <option value="1RO A">1RO A</option>
            <option value="1RO B">1RO B</option>
            <option value="2DO A">2DO A</option>
            <option value="2DO B">2DO B</option>
            <option value="3RO A">3RO A</option>
            <option value="4TO A">4TO A</option>
            <option value="5TO A">5TO A</option>
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
            <option value="EDUCACIÓN INICIAL EN FAMILIA COMUNITARIA">Educación Inicial en Familia Comunitaria</option>
            <option value="EDUCACIÓN PRIMARIA COMUNITARIA VOCACIONAL">Educación Primaria Comunitaria Vocacional</option>
            <option value="ARTES PLÁSTICAS Y VISUALES">Artes Plásticas y Visuales</option>
            <option value="CIENCIAS NATURALES BIOLOGÍA-GEOGRAFÍA">Ciencias Naturales Biología-Geografía</option>
            <option value="EDUCACIÓN MUSICAL">Educación Musical</option>
          </select>
        </div>
      </div>

      {/* TABLA DE ESTUDIANTES CON CHECKBOXES Y ACCIONES COMPLETAS */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredStudents.length > 0 && selectedIds.length === filteredStudents.length}
                    className="h-4 w-4 rounded border-slate-300 text-[#801B28] focus:ring-[#801B28] cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Estudiante / C.I.</th>
                <th className="py-3.5 px-4">Año / Especialidad</th>
                <th className="py-3.5 px-4">Modalidad</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-bold">
                    <Loader2 className="animate-spin inline-block mr-2 text-[#8C731A]" size={20} />
                    Cargando estudiantes desde PostgreSQL...
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const isSelected = selectedIds.includes(student.id);
                  return (
                    <tr key={student.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-rose-50/40' : ''}`}>
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(student.id)}
                          className="h-4 w-4 rounded border-slate-300 text-[#801B28] focus:ring-[#801B28] cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#801B28]">{student.username}</td>
                      <td className="py-3.5 px-4">
                        <span className="block font-bold text-slate-900">{`${student.nombre} ${student.apellido}`}</span>
                        <span className="font-mono text-[11px] text-slate-400">C.I. {student.ci}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="block font-bold text-slate-800">{student.ano_formacion || 'Sin Asignar'}</span>
                        <span className="text-[11px] text-slate-500">{student.especialidad || 'General'}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">{student.modalidad_ingreso || 'Normal'}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => { setSelectedStudent(student); setShowFichaModal(true); }}
                            title="Ficha Estudiante"
                            className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-[#8C731A] hover:text-white transition-all cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openEditModal(student)}
                            title="Editar"
                            className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => confirmSingleDelete(student.id)}
                            title="Eliminar"
                            className="rounded-xl bg-rose-50 p-2 text-rose-600 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                    No se encontraron estudiantes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: REGISTRAR O EDITAR ESTUDIANTE */}
      {showNewStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowNewStudentModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-1">
              <UserPlus className="text-[#801B28]" size={22} />
              {isEditing ? 'Editar Datos del Estudiante' : 'Registrar Nuevo Estudiante'}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              {isEditing 
                ? 'Actualice la información del estudiante seleccionando los datos académicos.' 
                : 'Formato predeterminado: Username (nombre_carnet) y Contraseña (carnet*).'}
            </p>

            <form onSubmit={handleSubmitStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombres}
                    onChange={(e) => handleNameOrCiChange('nombres', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#8C731A] focus:outline-none"
                    placeholder="Ej. Sonia"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#8C731A] focus:outline-none"
                    placeholder="Ej. Aliaga Chuquimia"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">C.I. *</label>
                  <input
                    type="text"
                    required
                    value={formData.ci}
                    onChange={(e) => handleNameOrCiChange('ci', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#8C731A] focus:outline-none font-mono"
                    placeholder="Ej. 9120394"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#8C731A] focus:outline-none"
                    placeholder="Ej. 71234567"
                  />
                </div>

                {/* BLOQUE CREDENCIALES */}
                <div className="sm:col-span-2 rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-[#801B28] flex items-center gap-1.5">
                      <Lock size={14} /> Credenciales del Estudiante
                    </span>
                    <button
                      type="button"
                      onClick={handleRegenerateCredentials}
                      className="text-[10px] font-bold text-[#8C731A] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} /> Regenerar Credenciales
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block font-extrabold text-slate-700 mb-1">Username *</label>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none"
                        placeholder="Ej. sonia_9120394"
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-700 mb-1">
                        {isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña *'}
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showPassword ? "text" : "password"}
                          required={!isEditing}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-white pl-3 pr-10 py-2 font-mono font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none"
                          placeholder={isEditing ? "Dejar en blanco para mantener" : "Ej. 9120394*"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Año de Formación *</label>
                  <select
                    value={formData.ano_formacion}
                    onChange={(e) => setFormData({ ...formData, ano_formacion: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-700 focus:border-[#8C731A] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="1RO A">1RO A</option>
                    <option value="1RO B">1RO B</option>
                    <option value="2DO A">2DO A</option>
                    <option value="2DO B">2DO B</option>
                    <option value="3RO A">3RO A</option>
                    <option value="4TO A">4TO A</option>
                    <option value="5TO A">5TO A</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Género</label>
                  <select
                    value={formData.genero}
                    onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-700 focus:border-[#8C731A] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="">Seleccionar Género</option>
                    <option value="FEMENIMO">FEMENINO</option>
                    <option value="MASCULINO">MASCULINO</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-extrabold text-slate-700 mb-1">Especialidad *</label>
                  <input
                    type="text"
                    required
                    value={formData.especialidad}
                    onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#8C731A] focus:outline-none"
                    placeholder="Ej. Educación Primaria Comunitaria Vocacional"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewStudentModal(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#801B28] px-5 py-2 font-bold text-white hover:bg-[#a32334] shadow-md cursor-pointer"
                >
                  {isEditing ? 'Guardar Cambios' : 'Registrar Estudiante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CARGAR EXCEL */}
      {showExcelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <button
              onClick={() => {
                setShowExcelModal(false);
                setExcelFile(null);
                setParsedStudents([]);
              }}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-1">
              <FileSpreadsheet className="text-emerald-600" size={22} />
              CARGAR ARCHIVO DE ESTUDIANTES (EXCEL)
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Cargue el archivo oficial de estudiantes <code className="bg-slate-100 px-1 rounded">BASEDEDATOS_EST2026.xlsx</code>.
            </p>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors mb-4">
              <Upload className="mx-auto text-slate-400 mb-2" size={32} />
              <input
                type="file"
                accept=".xlsx, .xls"
                id="excelUploadStudents"
                className="hidden"
                onChange={handleExcelFileSelect}
              />
              <label htmlFor="excelUploadStudents" className="cursor-pointer text-xs font-bold text-[#801B28] hover:underline block">
                {excelFile ? excelFile.name : '[ Seleccionar archivo Excel ]'}
              </label>
            </div>

            {parsedStudents.length > 0 && (
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 mb-4 text-xs space-y-2">
                <div className="flex items-center justify-between font-extrabold text-slate-800">
                  <span>✓ {parsedStudents.length} estudiantes detectados</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase">
                    Rol: ESTUDIANTE
                  </span>
                </div>

                <div className="max-h-36 overflow-y-auto divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white p-2 font-mono text-[11px]">
                  {parsedStudents.slice(0, 5).map((u, i) => (
                    <div key={i} className="py-1 flex items-center justify-between text-slate-700">
                      <span>{u.nombre} {u.apellido}</span>
                      <span className="text-slate-400">CI: {u.ci} • Pass: {u.password}</span>
                    </div>
                  ))}
                  {parsedStudents.length > 5 && (
                    <p className="text-center text-[10px] text-slate-400 pt-1">
                      ...y {parsedStudents.length - 5} estudiantes más.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowExcelModal(false)}
                className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 cursor-pointer text-xs"
              >
                Cancelar
              </button>

              <button
                disabled={parsedStudents.length === 0 || actionLoading}
                onClick={handleImportExcelToDB}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <FileCheck size={16} />}
                Importar a la Base de Datos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FICHA DEL ESTUDIANTE */}
      {showFichaModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowFichaModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="border-b border-slate-200 pb-4 mb-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8C731A]">
                Ficha Académica del Estudiante
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                {`${selectedStudent.nombre} ${selectedStudent.apellido}`}
              </h2>
              <p className="text-xs text-slate-500 font-mono">User: {selectedStudent.username} | C.I. {selectedStudent.ci}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-200 mb-6 text-xs">
              <div>
                <span className="block font-bold text-slate-400">Especialidad:</span>
                <span className="block font-extrabold text-slate-800">{selectedStudent.especialidad || 'No asignada'}</span>
              </div>
              <div>
                <span className="block font-bold text-slate-400">Año de Formación:</span>
                <span className="block font-extrabold text-slate-800">{selectedStudent.ano_formacion || 'Sin registrar'}</span>
              </div>
              <div>
                <span className="block font-bold text-slate-400">Género:</span>
                <span className="block font-bold text-slate-800">{selectedStudent.genero || 'Sin especificar'}</span>
              </div>
              <div>
                <span className="block font-bold text-slate-400">Modalidad Ingreso:</span>
                <span className="block font-bold text-slate-800">{selectedStudent.modalidad_ingreso || 'ADMISION GENERAL'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} className="text-[#801B28]" />
                Seguimiento de Fichas IEPC-PEC
              </h3>

              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                {getFichasByAno(selectedStudent.ano_formacion).map((ficha) => (
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

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle size={28} />
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-2">
              ¿Confirmar Eliminación?
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              {deleteTarget === 'single'
                ? '¿Está seguro de eliminar este estudiante? Esta acción no se puede deshacer.'
                : `¿Está seguro de eliminar los ${selectedIds.length} estudiantes seleccionados? Esta acción es irreversible.`}
            </p>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 shadow-md cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOTIFICACIÓN / FEEDBACK */}
      {feedbackModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
              feedbackModal.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {feedbackModal.type === 'success' ? <CheckCircle2 size={30} /> : <AlertCircle size={30} />}
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-1">
              {feedbackModal.title}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              {feedbackModal.message}
            </p>

            <button
              type="button"
              onClick={() => setFeedbackModal({ ...feedbackModal, show: false })}
              className={`w-full rounded-xl py-2.5 text-xs font-bold text-white shadow-md cursor-pointer ${
                feedbackModal.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};