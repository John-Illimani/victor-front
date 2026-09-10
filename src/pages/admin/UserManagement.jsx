import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Upload, 
  CheckCircle2, 
  X, 
  Sparkles,
  Loader2,
  AlertCircle,
  FileCheck,
  Lock,
  EyeOff,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { read, utils } from 'xlsx';

import { userService } from '../../services/userService';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // SELECCIÓN MÚLTIPLE PARA ELIMINACIÓN
  const [selectedIds, setSelectedIds] = useState([]);

  // FILTROS
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // MODALES DE ACCIONES Y FORMULARIOS
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // 'single' o 'batch'
  const [userToDeleteId, setUserToDeleteId] = useState(null);

  // MODAL DE NOTIFICACIÓN/FEEDBACK
  const [feedbackModal, setFeedbackModal] = useState({
    show: false,
    title: '',
    message: '',
    type: 'success'
  });

  // FORMULARIO MANUAL (SIN CORREO VISIBLE)
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    password: '',
    nombres: '',
    apellidos: '',
    ci: '',
    telefono: '',
    rol: 'ESTUDIANTE',
    esfm_ua: 'ESFM/UA - El Alto',
    especialidad: 'Educación Primaria Comunitaria Vocacional',
    item_docente: ''
  });

  // CARGA MASIVA EXCEL
  const [excelFile, setExcelFile] = useState(null);
  const [detectedFileType, setDetectedFileType] = useState(null);
  const [targetRoleForPersonal, setTargetRoleForPersonal] = useState('DOCENTE_ACOMPANANTE');
  const [parsedExcelUsers, setParsedExcelUsers] = useState([]);

  // OBTENER LISTA DE USUARIOS
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
      setSelectedIds([]);
    } catch (err) {
      showFeedback('Error de Conexión', err.message || 'Error al conectar con la base de datos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showFeedback = (title, message, type = 'success') => {
    setFeedbackModal({ show: true, title, message, type });
  };

  // FILTRADO DE FILAS
  const filteredUsers = users.filter(user => {
    const fullName = `${user.nombre || ''} ${user.apellido || ''}`.toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = 
      (user.id && user.id.toLowerCase().includes(search)) ||
      (user.username && user.username.toLowerCase().includes(search)) ||
      fullName.includes(search) ||
      (user.ci && user.ci.includes(search));

    const matchesRole = roleFilter === '' || user.rol === roleFilter;

    return matchesSearch && matchesRole;
  });

  // SELECCIÓN MÚLTIPLE
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredUsers.map(u => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // AUTO-GENERACIÓN DE USERNAME (nombre_carnet) Y PASSWORD (carnet*)
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

  // REGENERAR CREDENCIALES
  const handleRegenerateCredentials = () => {
    const primerNombre = (formData.nombres || '').trim().split(' ')[0].toLowerCase();
    const carnet = (formData.ci || '').trim();
    
    if (!primerNombre || !carnet) {
      showFeedback('Atención', 'Ingrese el Nombre y C.I. para generar credenciales.', 'error');
      return;
    }

    setFormData({
      ...formData,
      username: `${primerNombre}_${carnet}`,
      password: `${carnet}*`
    });
  };

  // CREAR / EDITAR USUARIO
  const handleSubmitUser = async (e) => {
    e.preventDefault();

    try {
      const carnet = (formData.ci || '').trim();
      const domain = formData.rol === 'ESTUDIANTE' ? 'est.esfm.edu.bo' : 'esfm.edu.bo';
      
      // SE GENERA AUTOMÁTICAMENTE EL CORREO PARA EL BACKEND SIN MOSTRARLO EN EL FRONTEND
      const generatedEmail = `${carnet}@${domain}`;

      const payload = {
        username: formData.username,
        correo: generatedEmail,
        nombre: formData.nombres,
        apellido: formData.apellidos,
        ci: formData.ci,
        telefono: formData.telefono,
        rol: formData.rol,
        esfm_ua: formData.esfm_ua,
        especialidad: formData.especialidad,
        item_docente: formData.item_docente || null
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (isEditing) {
        await userService.updateUser(formData.id, payload);
        showFeedback('Usuario Actualizado', 'El usuario fue actualizado correctamente.', 'success');
      } else {
        await userService.createUser(payload);
        showFeedback('Usuario Registrado', 'El usuario ha sido registrado en el sistema.', 'success');
      }

      setShowNewUserModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      showFeedback('Error al Guardar', err.message || 'Ocurrió un fallo al procesar la solicitud.', 'error');
    }
  };

  // PROCESO DE ELIMINACIÓN INDIVIDUAL
  const confirmSingleDelete = (id) => {
    setUserToDeleteId(id);
    setDeleteTarget('single');
    setShowDeleteConfirmModal(true);
  };

  // PROCESO DE ELIMINACIÓN EN LOTE
  const confirmBatchDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteTarget('batch');
    setShowDeleteConfirmModal(true);
  };

  // EJECUCIÓN DE ELIMINACIÓN
  const executeDelete = async () => {
    setShowDeleteConfirmModal(false);
    setActionLoading(true);

    try {
      if (deleteTarget === 'single' && userToDeleteId) {
        await userService.deleteUser(userToDeleteId);
        showFeedback('Usuario Eliminado', 'El registro fue eliminado de la base de datos.', 'success');
      } else if (deleteTarget === 'batch' && selectedIds.length > 0) {
        const res = await userService.deleteMultipleUsers(selectedIds);
        showFeedback('Eliminación Masiva', res.message || 'Usuarios eliminados correctamente.', 'success');
      }
      fetchUsers();
    } catch (err) {
      showFeedback('Error al Eliminar', err.message || 'No se pudo completar la eliminación.', 'error');
    } finally {
      setActionLoading(false);
      setUserToDeleteId(null);
    }
  };

  const openEditModal = (user) => {
    setIsEditing(true);
    setFormData({
      id: user.id,
      username: user.username,
      password: '',
      nombres: user.nombre,
      apellidos: user.apellido,
      ci: user.ci,
      telefono: user.telefono || '',
      rol: user.rol,
      esfm_ua: user.esfm_ua || 'ESFM/UA - El Alto',
      especialidad: user.especialidad || 'Educación Primaria Comunitaria Vocacional',
      item_docente: user.item_docente || ''
    });
    setShowNewUserModal(true);
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
      rol: 'ESTUDIANTE',
      esfm_ua: 'ESFM/UA - El Alto',
      especialidad: 'Educación Primaria Comunitaria Vocacional',
      item_docente: ''
    });
  };

  // PARSEO Y PROCESAMIENTO DE EXCEL
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
        showFeedback('Archivo Vacío', 'El archivo Excel seleccionado no contiene datos.', 'error');
        return;
      }

      let isPersonal = false;
      let headerRowIndex = 0;

      for (let i = 0; i < Math.min(data.length, 5); i++) {
        const rowStr = JSON.stringify(data[i]).toUpperCase();
        if (rowStr.includes('PERSONAL')) {
          isPersonal = true;
          break;
        }
      }

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

      if (isPersonal) {
        setDetectedFileType('PERSONAL');
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
            correo: `${ci}@esfm.edu.bo`, // Generado silenciosamente
            password: `${ci}*`,
            rol: targetRoleForPersonal,
            codigo
          });
        });

      } else {
        setDetectedFileType('ESTUDIANTE');
        const ciIdx = headers.findIndex(h => h.toUpperCase().includes('CÉDULA') || h.toUpperCase().includes('CEDULA'));
        const nameIdx = headers.findIndex(h => h.toUpperCase().includes('APELLIDOS'));
        const codIdx = headers.findIndex(h => h.toUpperCase().includes('CÓDIGO') || h.toUpperCase().includes('CODIGO'));
        const genIdx = headers.findIndex(h => h.toUpperCase().includes('GENERO'));
        const espIdx = headers.findIndex(h => h.toUpperCase().includes('ESPECIALIDAD'));
        const modIdx = headers.findIndex(h => h.toUpperCase().includes('MODALIDAD'));
        const anoIdx = headers.findIndex(h => h.toUpperCase().includes('FORMACION') || h.toUpperCase().includes('AÑO'));

        rawRows.forEach(row => {
          if (!row[ciIdx]) return;
          const ci = String(row[ciIdx]).trim();
          const fullName = String(row[nameIdx] || '').trim();
          const codigo = row[codIdx] ? String(row[codIdx]).trim() : `est_${ci}`;
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
            correo: `${ci}@est.esfm.edu.bo`, // Generado silenciosamente
            password: `${ci}*`,
            rol: 'ESTUDIANTE',
            especialidad,
            genero,
            modalidad_ingreso: modalidad,
            ano_formacion: ano
          });
        });
      }

      setParsedExcelUsers(parsed);
    };

    reader.readAsBinaryString(file);
  };

  const handleTargetRoleChange = (newRole) => {
    setTargetRoleForPersonal(newRole);
    if (detectedFileType === 'PERSONAL' && parsedExcelUsers.length > 0) {
      const updated = parsedExcelUsers.map(u => ({
        ...u,
        rol: newRole
      }));
      setParsedExcelUsers(updated);
    }
  };

  const handleImportExcelToDB = async () => {
    if (parsedExcelUsers.length === 0) return;

    setActionLoading(true);
    try {
      const res = await userService.importBatchUsers(parsedExcelUsers);
      showFeedback('Importación Exitosa', res.message || `Se procesaron ${parsedExcelUsers.length} registros.`, 'success');
      setShowExcelModal(false);
      setExcelFile(null);
      setParsedExcelUsers([]);
      fetchUsers();
    } catch (err) {
      showFeedback('Error de Importación', err.message || 'Falló el proceso masivo.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER PRINCIPAL */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <Users size={14} className="text-[#8C731A]" /> Base de Datos Institucional
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Gestión de Usuarios
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Administración centralizada de usuarios, estudiantes, docentes acompañantes y docentes guía.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowExcelModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-extrabold uppercase text-white shadow-lg hover:bg-emerald-700 transition-all cursor-pointer"
            >
              <FileSpreadsheet size={16} />
              Carga masiva Excel
            </button>
            <button
              onClick={() => { resetForm(); setShowNewUserModal(true); }}
              className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-4 py-3 text-xs font-extrabold uppercase text-white shadow-lg hover:bg-[#a32334] transition-all cursor-pointer"
            >
              <UserPlus size={16} />
              + Nuevo usuario
            </button>
          </div>
        </div>
      </div>

      {/* BARRA DE ACCIÓN PARA SELECCIÓN MÚLTIPLE */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl bg-[#801B28] px-6 py-3 text-white shadow-xl animate-in fade-in slide-in-from-top-2">
          <span className="text-xs font-black uppercase tracking-wider">
            {selectedIds.length} {selectedIds.length === 1 ? 'usuario seleccionado' : 'usuarios seleccionados'}
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

      {/* BÚSQUEDA Y FILTROS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por Username, Nombre, Apellido o CI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none appearance-none bg-white cursor-pointer"
          >
            <option value="">Todos los Roles</option>
            <option value="ESTUDIANTE">ESTUDIANTE</option>
            <option value="DOCENTE_ACOMPANANTE">DOCENTE_ACOMPANANTE</option>
            <option value="DOCENTE_GUIA">DOCENTE_GUIA</option>
            <option value="ADMINISTRADOR">ADMINISTRADOR</option>
          </select>
        </div>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredUsers.length > 0 && selectedIds.length === filteredUsers.length}
                    className="h-4 w-4 rounded border-slate-300 text-[#801B28] focus:ring-[#801B28] cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Usuario</th>
                <th className="py-3.5 px-4">Nombre Completo</th>
                <th className="py-3.5 px-4">C.I.</th>
                <th className="py-3.5 px-4">Rol</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-bold">
                    <Loader2 className="animate-spin inline-block mr-2 text-[#8C731A]" size={20} />
                    Cargando usuarios desde PostgreSQL...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isSelected = selectedIds.includes(user.id);
                  return (
                    <tr key={user.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-rose-50/40' : ''}`}>
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(user.id)}
                          className="h-4 w-4 rounded border-slate-300 text-[#801B28] focus:ring-[#801B28] cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#801B28]">{user.username}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{`${user.nombre} ${user.apellido}`}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">{user.ci}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          user.rol === 'ESTUDIANTE' ? 'bg-blue-100 text-blue-800' :
                          user.rol === 'DOCENTE_ACOMPANANTE' ? 'bg-emerald-100 text-emerald-800' :
                          user.rol === 'DOCENTE_GUIA' ? 'bg-purple-100 text-purple-800' :
                          'bg-slate-200 text-slate-800'
                        }`}>
                          {user.rol}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => { setSelectedUser(user); setShowDetailModal(true); }}
                            title="Ver Ficha"
                            className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-[#8C731A] hover:text-white transition-all cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            title="Editar"
                            className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => confirmSingleDelete(user.id)}
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
                    No se encontraron usuarios coincidentes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: REGISTRAR / EDITAR */}
      {showNewUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowNewUserModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-1">
              <UserPlus className="text-[#801B28]" size={22} />
              {isEditing ? 'Editar Usuario y Credenciales' : 'Registrar Nuevo Usuario'}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              {isEditing 
                ? 'Modifique la información del usuario o reestablezca sus credenciales.' 
                : 'Formato predeterminado: Username (nombre_carnet) y Contraseña (carnet*).'}
            </p>

            <form onSubmit={handleSubmitUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombres}
                    onChange={(e) => handleNameOrCiChange('nombres', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#8C731A] focus:outline-none"
                    placeholder="Ej. Juan Carlos"
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
                    placeholder="Ej. Pérez Gómez"
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
                    placeholder="Ej. 8492012"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Rol *</label>
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-700 focus:border-[#8C731A] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="ESTUDIANTE">ESTUDIANTE</option>
                    <option value="DOCENTE_ACOMPANANTE">DOCENTE_ACOMPANANTE</option>
                    <option value="DOCENTE_GUIA">DOCENTE_GUIA</option>
                    <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                  </select>
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
                      <label className="block font-extrabold text-slate-700 mb-1">Nombre de Usuario (Username) *</label>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none"
                        placeholder="Ej. juan_8492012"
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
                          placeholder={isEditing ? "Dejar en blanco para conservar actual" : "Ej. 8492012*"}
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
                  <label className="block font-extrabold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#8C731A] focus:outline-none"
                    placeholder="Ej. 71234567"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Item / Código Docente</label>
                  <input
                    type="text"
                    value={formData.item_docente}
                    onChange={(e) => setFormData({ ...formData, item_docente: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#8C731A] focus:outline-none"
                    placeholder="Ej. 206-MMJ11115800"
                  />
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
                  onClick={() => setShowNewUserModal(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#801B28] px-5 py-2 font-bold text-white hover:bg-[#a32334] shadow-md cursor-pointer"
                >
                  {isEditing ? 'Guardar Cambios' : 'Registrar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CARGA MASIVA DE EXCEL */}
      {showExcelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowExcelModal(false);
                setExcelFile(null);
                setParsedExcelUsers([]);
                setDetectedFileType(null);
              }}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-1">
              <FileSpreadsheet className="text-emerald-600" size={22} />
              IMPORTAR EXCEL OFICIAL (ESTUDIANTES / PERSONAL)
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Cargue directamente los archivos <code className="bg-slate-100 px-1 rounded">BASEDEDATOS_EST2026.xlsx</code> o <code className="bg-slate-100 px-1 rounded">BASEDEDATOS_PERSONAL2026.xlsx</code>.
            </p>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors mb-4">
              <Upload className="mx-auto text-slate-400 mb-2" size={32} />
              <input
                type="file"
                accept=".xlsx, .xls"
                id="excelUploadInput"
                className="hidden"
                onChange={handleExcelFileSelect}
              />
              <label htmlFor="excelUploadInput" className="cursor-pointer text-xs font-bold text-[#801B28] hover:underline block">
                {excelFile ? excelFile.name : '[ Seleccionar archivo Excel ]'}
              </label>
            </div>

            {detectedFileType === 'PERSONAL' && (
              <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 mb-4 text-xs space-y-2">
                <span className="font-extrabold text-amber-900 block">
                  ⚠ Archivo de Personal detectado ({parsedExcelUsers.length} registros)
                </span>
                <p className="text-amber-800">Seleccione el rol al cual desea asignar a este grupo de personal:</p>
                <select
                  value={targetRoleForPersonal}
                  onChange={(e) => handleTargetRoleChange(e.target.value)}
                  className="w-full rounded-xl border border-amber-300 bg-white p-2 font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="DOCENTE_ACOMPANANTE">DOCENTE ACOMPAÑANTE</option>
                  <option value="DOCENTE_GUIA">DOCENTE GUÍA</option>
                  <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                </select>
              </div>
            )}

            {parsedExcelUsers.length > 0 && (
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 mb-4 text-xs space-y-2">
                <div className="flex items-center justify-between font-extrabold text-slate-800">
                  <span>✓ {parsedExcelUsers.length} registros listos para importar</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                    Rol: {parsedExcelUsers[0].rol}
                  </span>
                </div>

                <div className="max-h-40 overflow-y-auto divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white p-2 font-mono text-[11px]">
                  {parsedExcelUsers.slice(0, 5).map((u, i) => (
                    <div key={i} className="py-1 flex items-center justify-between text-slate-700">
                      <span>{u.nombre} {u.apellido}</span>
                      <span className="text-slate-400">CI: {u.ci} • Pass: {u.password}</span>
                    </div>
                  ))}
                  {parsedExcelUsers.length > 5 && (
                    <p className="text-center text-[10px] text-slate-400 pt-1">
                      ...y {parsedExcelUsers.length - 5} usuarios más.
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
                disabled={parsedExcelUsers.length === 0 || actionLoading}
                onClick={handleImportExcelToDB}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <FileCheck size={16} />}
                Confirmar e Importar a BD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FICHA DETALLADA */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-black text-slate-900 mb-4 border-b border-slate-100 pb-3">
              Ficha del Usuario
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-bold">UUID del Sistema:</span>
                <span className="text-slate-800 font-mono text-[10px]">{selectedUser.id}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-bold">Nombre Completo:</span>
                <span className="text-slate-900 font-extrabold text-sm">{`${selectedUser.nombre} ${selectedUser.apellido}`}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block font-bold">C.I.:</span>
                  <span className="text-slate-800 font-mono font-bold">{selectedUser.ci}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">Usuario:</span>
                  <span className="text-slate-800 font-mono font-bold">{selectedUser.username}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block font-bold">Rol:</span>
                  <span className="text-slate-800 font-bold">{selectedUser.rol}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">Teléfono:</span>
                  <span className="text-slate-800 font-bold">{selectedUser.telefono || 'Sin registrar'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-bold">Especialidad:</span>
                <span className="text-slate-800 font-semibold">{selectedUser.especialidad || 'Sin especialidad'}</span>
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

      {/* MODAL PERSONALIZADO DE CONFIRMACIÓN DE ELIMINACIÓN */}
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
                ? '¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.'
                : `¿Está seguro de que desea eliminar los ${selectedIds.length} usuarios seleccionados? Esta acción es irreversible.`}
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

      {/* MODAL PERSONALIZADO DE FEEDBACK/NOTIFICACIÓN */}
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