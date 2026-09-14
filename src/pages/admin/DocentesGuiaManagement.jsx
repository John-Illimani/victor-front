import React, { useState, useEffect } from 'react';
import { 
  School, 
  Search, 
  Filter, 
  Eye, 
  X, 
  Sparkles,
  CheckSquare,
  UserPlus,
  Edit,
  Trash2,
  Loader2,
  FileSpreadsheet,
  Upload,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lock,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { read, utils } from 'xlsx';

import { guideService } from '../../services/guideService';

export const DocentesGuiaManagement = () => {
  const [docentesGuia, setDocentesGuia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Selección múltiple para eliminación masiva
  const [selectedIds, setSelectedIds] = useState([]);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [especialidadFilter, setEspecialidadFilter] = useState('');

  // Modales
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showNewGuideModal, setShowNewGuideModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('datos');

  // Modal Confirmación de Eliminación
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // 'single' o 'batch'
  const [guideToDeleteId, setGuideToDeleteId] = useState(null);

  // Modal Feedback / Notificación
  const [feedbackModal, setFeedbackModal] = useState({
    show: false,
    title: '',
    message: '',
    type: 'success'
  });

  // Formulario Manual (Sin correo visible)
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    password: '',
    nombres: '',
    apellidos: '',
    ci: '',
    telefono: '',
    esfm_ua: 'U.E. Franz Tamayo',
    especialidad: 'Educación Primaria Comunitaria Vocacional',
    item_docente: ''
  });

  // Carga Masiva Excel
  const [excelFile, setExcelFile] = useState(null);
  const [parsedDocentes, setParsedDocentes] = useState([]);

  const showFeedback = (title, message, type = 'success') => {
    setFeedbackModal({ show: true, title, message, type });
  };

  // Cargar docentes guía desde PostgreSQL
  const fetchGuides = async () => {
    setLoading(true);
    try {
      const data = await guideService.getGuides();
      setDocentesGuia(data);
      setSelectedIds([]);
    } catch (err) {
      showFeedback('Error de Conexión', err.message || 'Error al conectar con la base de datos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  // Filtrado
  const filteredDocentes = docentesGuia.filter(docente => {
    const fullName = `${docente.nombre || ''} ${docente.apellido || ''}`.toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = 
      (docente.username && docente.username.toLowerCase().includes(search)) ||
      fullName.includes(search) ||
      (docente.esfm_ua && docente.esfm_ua.toLowerCase().includes(search)) ||
      (docente.ci && docente.ci.includes(search));

    const matchesEspecialidad = especialidadFilter === '' || docente.especialidad === especialidadFilter;

    return matchesSearch && matchesEspecialidad;
  });

  // Selección múltiple
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredDocentes.map(d => d.id));
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
      showFeedback('Atención', 'Ingrese Nombres y C.I. para generar credenciales.', 'error');
      return;
    }

    setFormData({
      ...formData,
      username: `${primerNombre}_${carnet}`,
      password: `${carnet}*`
    });
  };

  // Guardar (Crear / Actualizar)
  const handleSubmitGuide = async (e) => {
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
        item_docente: formData.item_docente || null
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (isEditing) {
        await guideService.updateGuide(formData.id, payload);
        showFeedback('Docente Guía Actualizado', 'Los datos fueron actualizados correctamente.', 'success');
      } else {
        await guideService.createGuide(payload);
        showFeedback('Docente Guía Registrado', 'El docente guía ha sido registrado exitosamente.', 'success');
      }

      setShowNewGuideModal(false);
      resetForm();
      fetchGuides();
    } catch (err) {
      showFeedback('Error al Guardar', err.message || 'Ocurrió un error al procesar la solicitud.', 'error');
    }
  };

  // Confirmar Eliminación Individual
  const confirmSingleDelete = (id) => {
    setGuideToDeleteId(id);
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
      if (deleteTarget === 'single' && guideToDeleteId) {
        await guideService.deleteGuide(guideToDeleteId);
        showFeedback('Docente Guía Eliminado', 'El registro se eliminó correctamente.', 'success');
      } else if (deleteTarget === 'batch' && selectedIds.length > 0) {
        const res = await guideService.deleteMultipleGuides(selectedIds);
        showFeedback('Eliminación Masiva', res.message || 'Docentes guía eliminados correctamente.', 'success');
      }
      fetchGuides();
    } catch (err) {
      showFeedback('Error al Eliminar', err.message || 'No se pudo completar la eliminación.', 'error');
    } finally {
      setActionLoading(false);
      setGuideToDeleteId(null);
    }
  };

  const openEditModal = (docente) => {
    setIsEditing(true);
    setFormData({
      id: docente.id,
      username: docente.username,
      password: '',
      nombres: docente.nombre,
      apellidos: docente.apellido,
      ci: docente.ci,
      telefono: docente.telefono || '',
      esfm_ua: docente.esfm_ua || 'U.E. Franz Tamayo',
      especialidad: docente.especialidad || 'Educación Primaria Comunitaria Vocacional',
      item_docente: docente.item_docente || ''
    });
    setShowNewGuideModal(true);
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
      esfm_ua: 'U.E. Franz Tamayo',
      especialidad: 'Educación Primaria Comunitaria Vocacional',
      item_docente: ''
    });
  };

  // Lector de Excel (Rol Forzado: DOCENTE_GUIA)
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
        showFeedback('Archivo Vacío', 'El archivo Excel no contiene datos.', 'error');
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
      const nameIdx = headers.findIndex(h => h.toUpperCase().includes('NOMBRES'));
      const codIdx = headers.findIndex(h => h.toUpperCase().includes('CÓDIGO') || h.toUpperCase().includes('CODIGO'));

      rawRows.forEach(row => {
        if (!row[ciIdx]) return;
        const ci = String(row[ciIdx]).trim();
        const fullName = String(row[nameIdx] || '').trim();
        const codigo = row[codIdx] ? String(row[codIdx]).trim() : `doc_${ci}`;

        const parts = fullName.split(' ');
        const nombre = parts[0] || fullName;
        const apellido = parts.slice(1).join(' ') || fullName;
        const primerNombre = nombre.toLowerCase();

        parsed.push({
          ci,
          nombre,
          apellido,
          username: `${primerNombre}_${ci}`,
          correo: `${ci}@esfm.edu.bo`,
          password: `${ci}*`,
          rol: 'DOCENTE_GUIA', // ROL FORZADO
          codigo
        });
      });

      setParsedDocentes(parsed);
    };

    reader.readAsBinaryString(file);
  };

  const handleImportExcelToDB = async () => {
    if (parsedDocentes.length === 0) return;

    setActionLoading(true);
    try {
      const res = await guideService.importBatchGuides(parsedDocentes);
      showFeedback('Importación Exitosa', res.message || `Se importaron ${parsedDocentes.length} docentes guía.`, 'success');
      setShowExcelModal(false);
      setExcelFile(null);
      setParsedDocentes([]);
      fetchGuides();
    } catch (err) {
      showFeedback('Error de Importación', err.message || 'Ocurrió un fallo en la importación masiva.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

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

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowExcelModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-extrabold uppercase text-white shadow-lg hover:bg-emerald-700 transition-all cursor-pointer"
            >
              <FileSpreadsheet size={16} />
              Cargar Excel
            </button>
            <button
              onClick={() => { resetForm(); setShowNewGuideModal(true); }}
              className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-4 py-3 text-xs font-extrabold uppercase text-white shadow-lg hover:bg-[#a32334] transition-all cursor-pointer"
            >
              <UserPlus size={16} />
              + Nuevo Docente Guía
            </button>
          </div>
        </div>
      </div>

      {/* BARRA DE SELECCIÓN MÚLTIPLE */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl bg-[#801B28] px-6 py-3 text-white shadow-xl animate-in fade-in slide-in-from-top-2">
          <span className="text-xs font-black uppercase tracking-wider">
            {selectedIds.length} {selectedIds.length === 1 ? 'docente seleccionado' : 'docentes seleccionados'}
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por Nombre, C.I., Username o Unidad Educativa..."
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
            <option value="EDUCACIÓN PRIMARIA COMUNITARIA VOCACIONAL">Educación Primaria Comunitaria Vocacional</option>
            <option value="ARTES PLÁSTICAS Y VISUALES">Artes Plásticas y Visuales</option>
            <option value="EDUCACIÓN MUSICAL">Educación Musical</option>
            <option value="EDUCACIÓN INICIAL EN FAMILIA COMUNITARIA">Educación Inicial en Familia Comunitaria</option>
            <option value="CIENCIAS NATURALES BIOLOGÍA-GEOGRAFÍA">Ciencias Naturales Biología-Geografía</option>
          </select>
        </div>
      </div>

      {/* TABLA DE DOCENTES GUÍA CON CHECKBOXES */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredDocentes.length > 0 && selectedIds.length === filteredDocentes.length}
                    className="h-4 w-4 rounded border-slate-300 text-[#801B28] focus:ring-[#801B28] cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Docente Guía</th>
                <th className="py-3.5 px-4">C.I.</th>
                <th className="py-3.5 px-4">Unidad Educativa / CEA / CEE</th>
                <th className="py-3.5 px-4">Teléfono</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500 font-bold">
                    <Loader2 className="animate-spin inline-block mr-2 text-[#8C731A]" size={20} />
                    Cargando docentes guía desde PostgreSQL...
                  </td>
                </tr>
              ) : filteredDocentes.length > 0 ? (
                filteredDocentes.map((docente) => {
                  const isSelected = selectedIds.includes(docente.id);
                  return (
                    <tr key={docente.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-rose-50/40' : ''}`}>
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(docente.id)}
                          className="h-4 w-4 rounded border-slate-300 text-[#801B28] focus:ring-[#801B28] cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#801B28]">{docente.username}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{`${docente.nombre} ${docente.apellido}`}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">{docente.ci}</td>
                      <td className="py-3.5 px-4">
                        <span className="block font-bold text-slate-800">{docente.esfm_ua || 'Sin Asignar'}</span>
                        <span className="text-[10px] text-slate-500 font-extrabold uppercase">{docente.especialidad || 'Docente de Aula'}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{docente.telefono || 'Sin registrar'}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => { setSelectedDocente(docente); setShowModal(true); setActiveTab('datos'); }}
                            title="Ver Ficha"
                            className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-[#8C731A] hover:text-white transition-all cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openEditModal(docente)}
                            title="Editar"
                            className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => confirmSingleDelete(docente.id)}
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
                  <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                    No se encontraron docentes guía registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: REGISTRAR / EDITAR DOCENTE GUÍA */}
      {showNewGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowNewGuideModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-1">
              <UserPlus className="text-[#801B28]" size={22} />
              {isEditing ? 'Editar Datos del Docente Guía' : 'Registrar Nuevo Docente Guía'}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              {isEditing 
                ? 'Modifique los datos del maestro guía o reestablezca sus credenciales.' 
                : 'Formato predeterminado: Username (nombre_carnet) y Contraseña (carnet*).'}
            </p>

            <form onSubmit={handleSubmitGuide} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombres}
                    onChange={(e) => handleNameOrCiChange('nombres', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#8C731A] focus:outline-none"
                    placeholder="Ej. Carlos"
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
                    placeholder="Ej. Mamani Condori"
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
                    placeholder="Ej. 5920183"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#8C731A] focus:outline-none"
                    placeholder="Ej. 76543210"
                  />
                </div>

                {/* BLOQUE CREDENCIALES */}
                <div className="sm:col-span-2 rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-[#801B28] flex items-center gap-1.5">
                      <Lock size={14} /> Credenciales de Acceso
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
                        placeholder="Ej. carlos_5920183"
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
                          placeholder={isEditing ? "Dejar en blanco para mantener" : "Ej. 5920183*"}
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
                  <label className="block font-extrabold text-slate-700 mb-1">Unidad Educativa / CEA / CEE *</label>
                  <input
                    type="text"
                    required
                    value={formData.esfm_ua}
                    onChange={(e) => setFormData({ ...formData, esfm_ua: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#8C731A] focus:outline-none"
                    placeholder="Ej. U.E. Franz Tamayo"
                  />
                </div>

                <div>
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
                  onClick={() => setShowNewGuideModal(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#801B28] px-5 py-2 font-bold text-white hover:bg-[#a32334] shadow-md cursor-pointer"
                >
                  {isEditing ? 'Guardar Cambios' : 'Registrar Docente Guía'}
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
                setParsedDocentes([]);
              }}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-1">
              <FileSpreadsheet className="text-emerald-600" size={22} />
              CARGAR DOCENTES GUÍA (EXCEL)
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Cargue el archivo de personal <code className="bg-slate-100 px-1 rounded">BASEDEDATOS_PERSONAL2026.xlsx</code>.
            </p>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors mb-4">
              <Upload className="mx-auto text-slate-400 mb-2" size={32} />
              <input
                type="file"
                accept=".xlsx, .xls"
                id="excelUploadDocentesGuia"
                className="hidden"
                onChange={handleExcelFileSelect}
              />
              <label htmlFor="excelUploadDocentesGuia" className="cursor-pointer text-xs font-bold text-[#801B28] hover:underline block">
                {excelFile ? excelFile.name : '[ Seleccionar archivo Excel ]'}
              </label>
            </div>

            {parsedDocentes.length > 0 && (
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 mb-4 text-xs space-y-2">
                <div className="flex items-center justify-between font-extrabold text-slate-800">
                  <span>✓ {parsedDocentes.length} docentes guía detectados</span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full uppercase">
                    Rol: DOCENTE GUÍA
                  </span>
                </div>

                <div className="max-h-36 overflow-y-auto divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white p-2 font-mono text-[11px]">
                  {parsedDocentes.slice(0, 5).map((u, i) => (
                    <div key={i} className="py-1 flex items-center justify-between text-slate-700">
                      <span>{u.nombre} {u.apellido}</span>
                      <span className="text-slate-400">CI: {u.ci} • Pass: {u.password}</span>
                    </div>
                  ))}
                  {parsedDocentes.length > 5 && (
                    <p className="text-center text-[10px] text-slate-400 pt-1">
                      ...y {parsedDocentes.length - 5} docentes más.
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
                disabled={parsedDocentes.length === 0 || actionLoading}
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

            <div className="border-b border-slate-200 pb-4 mb-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#801B28]">
                DOCENTE GUÍA
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                {`${selectedDocente.nombre} ${selectedDocente.apellido}`}
              </h2>
              <p className="text-xs text-slate-500 font-mono">User: {selectedDocente.username} | C.I. {selectedDocente.ci}</p>

              <div className="flex flex-wrap gap-2 mt-4 pt-2">
                {['datos', 'institucion', 'fichas'].map((tab) => (
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
                    {tab === 'fichas' && 'Fichas que Habilita'}
                  </button>
                ))}
              </div>
            </div>

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
                  <span className="block font-bold text-slate-400">Especialidad:</span>
                  <span className="block font-bold text-slate-800 mt-0.5">{selectedDocente.especialidad || 'No asignada'}</span>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <span className="block font-bold text-slate-400">Teléfono / Celular:</span>
                  <span className="block font-bold text-slate-800 mt-0.5">{selectedDocente.telefono || 'Sin registrar'}</span>
                </div>
              </div>
            )}

            {activeTab === 'institucion' && (
              <div className="space-y-4 text-xs">
                <div className="rounded-2xl bg-purple-50/60 p-5 border border-purple-200">
                  <span className="block text-[10px] font-extrabold text-purple-900 uppercase">Institución Educativa Registrada</span>
                  <h4 className="text-base font-black text-purple-950 mt-1">{selectedDocente.esfm_ua || 'Sin Asignar'}</h4>
                </div>
              </div>
            )}

            {activeTab === 'fichas' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-500 font-medium">Documentos y formularios en los que tiene participación directa:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-800">
                    <CheckSquare size={16} className="text-[#801B28]" />
                    Ficha de Asistencia y Puntualidad
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-800">
                    <CheckSquare size={16} className="text-[#801B28]" />
                    F-3 Seguimiento a la Concreción Curricular
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-800">
                    <CheckSquare size={16} className="text-[#801B28]" />
                    Evaluación de la Práctica Educativa
                  </div>
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

      {/* MODAL CONFIRMACIÓN DE ELIMINACIÓN */}
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
                ? '¿Está seguro de eliminar este docente guía? Esta acción no se puede deshacer.'
                : `¿Está seguro de eliminar los ${selectedIds.length} docentes guía seleccionados? Esta acción es irreversible.`}
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