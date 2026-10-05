import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Search, Filter, Sparkles, Loader2, RefreshCw, Clock, Database, Activity, Printer, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { auditoriaService } from '../../services/auditoriaService';
import { userService } from '../../services/userService';

const DICCIONARIO_TABLAS = {
  "usuarios": { nombre: "Gestión de Usuarios", ano: "General" },
  "especialidades": { nombre: "Especialidades Académicas", ano: "General" },
  "unidades_educativas": { nombre: "Unidades Educativas / CEE / CEA", ano: "General" },
  "gestiones": { nombre: "Gestiones Académicas", ano: "General" },
  "equipos_comunitarios": { nombre: "Equipos Comunitarios IEPC-PEC", ano: "General" },
  "integrantes_equipo": { nombre: "Integrantes de Equipos Comunitarios", ano: "General" },
  "asignaciones_docente_estudiante": { nombre: "Asignaciones Docente - Estudiante", ano: "General" },
  "certificaciones_blockchain": { nombre: "Certificaciones Blockchain", ano: "General" },
  "actas_historial": { nombre: "Historial de Actas", ano: "General" },
  "actas_oficiales": { nombre: "Actas Oficiales", ano: "General" },
  "centralizadores_notas": { nombre: "Centralizador General de Notas", ano: "General" },

  // 1ER AÑO DE FORMACIÓN
  "acta_conformacion_1er_ano_2026": { nombre: "Acta de Conformación del Equipo Comunitario", ano: "1er Año" },
  "ficha_f1_1er_ano_2026": { nombre: "Ficha F-1: Elaboración y Validación de Instrumentos", ano: "1er Año" },
  "ficha_f2_1er_ano_2026": { nombre: "Ficha F-2: Control de Asistencia PEC", ano: "1er Año" },
  "ficha_f3_1er_ano_2026": { nombre: "Ficha F-3: Aplicación de Técnicas e Instrumentos", ano: "1er Año" },
  "ficha_f4_1er_ano_2026": { nombre: "Ficha F-4: Seguimiento del Docente Guía y Director", ano: "1er Año" },
  "ficha_f5_1er_ano_2026": { nombre: "Ficha F-5: Valoración de la Producción de Conocimientos", ano: "1er Año" },
  "centralizador_1er_ano_2026": { nombre: "Cuadro Centralizador de Evaluación 1er Año", ano: "1er Año" },

  // 2DO AÑO DE FORMACIÓN
  "acta_inicio_2do_ano_2026": { nombre: "Acta de Inicio - 2do Año (IEPC-PEC)", ano: "2do Año" },
  "acta_conformacion_2do_ano_2026": { nombre: "Acta de Conformación de Equipo Comunitario", ano: "2do Año" },
  "ficha_f1_2do_ano_2026": { nombre: "Ficha F-1: Coordinación y Gestión Comunitaria", ano: "2do Año" },
  "ficha_f2_2do_ano_2026": { nombre: "Ficha F-2: Asistencia PEC (2 semanas)", ano: "2do Año" },
  "ficha_f3_2do_ano_2026": { nombre: "Ficha F-3: Aplicación de Técnicas e Instrumentos", ano: "2do Año" },
  "ficha_f4_2do_ano_2026": { nombre: "Ficha F-4: Apoyo y Seguimiento Concreción Curricular", ano: "2do Año" },
  "ficha_f5_2do_ano_2026": { nombre: "Ficha F-5: Valoración del Docente Acompañante ESFM", ano: "2do Año" },
  "ficha_f6_2do_ano_2026": { nombre: "Ficha F-6: Valoración de la Producción IEPC-PEC", ano: "2do Año" },
  "centralizador_2do_ano_2026": { nombre: "Centralizador de Evaluación 2º Año", ano: "2do Año" },

  // 3ER AÑO DE FORMACIÓN
  "acta_conformacion_3er_ano_2026": { nombre: "Acta de Conformación y Compromiso de Equipo", ano: "3er Año" },
  "acta_inicio_3er_ano_2026": { nombre: "Acta de Inicio - 3er Año", ano: "3er Año" },
  "acta_socializacion_3er_ano_2026": { nombre: "Acta de Socialización del Diagnóstico", ano: "3er Año" },
  "ficha_a1_3er_ano_2026": { nombre: "Ficha A-1: Técnicas e Instrumentos de Investigación", ano: "3er Año" },
  "ficha_b1_3er_ano_2026": { nombre: "Ficha B-1: Apoyo y Seguimiento Docente Acompañante", ano: "3er Año" },
  "ficha_b2_3er_ano_2026": { nombre: "Ficha B-2: Asistencia PEC (4 semanas)", ano: "3er Año" },
  "ficha_b3_3er_ano_2026": { nombre: "Ficha B-3: Apoyo Docente Guía Concreción Curricular", ano: "3er Año" },
  "ficha_b4_3er_ano_2026": { nombre: "Ficha B-4: Seguimiento y Apoyo Docente Tutor", ano: "3er Año" },
  "ficha_b5_3er_ano_2026": { nombre: "Ficha B-5: Presentación Informe Diagnóstico", ano: "3er Año" },
  "centralizador_3er_ano_2026": { nombre: "Centralizador de Evaluación 3º Año", ano: "3er Año" },

  // 4TO AÑO DE FORMACIÓN
  "ficha_a1_4to_ano_2026": { nombre: "Ficha A-1: Técnicas e Instrumentos de Investigación", ano: "4to Año" },
  "ficha_a2_4to_ano_2026": { nombre: "Ficha A-2: Elaboración de PDC", ano: "4to Año" },
  "ficha_b1_4to_ano_2026": { nombre: "Ficha B-1: Control de Asistencia PEC (6 semanas)", ano: "4to Año" },
  "ficha_b2_4to_ano_2026": { nombre: "Ficha B-2: Concreción Curricular - Desarrollo del PDC", ano: "4to Año" },
  "ficha_b3_4to_ano_2026": { nombre: "Ficha B-3: Valoración de la Clase Comunitaria", ano: "4to Año" },
  "ficha_b4_4to_ano_2026": { nombre: "Ficha B-4: Centralizador Concreción Curricular", ano: "4to Año" },
  "ficha_b5_4to_ano_2026": { nombre: "Ficha B-5: Seguimiento y Apoyo Docente Guía", ano: "4to Año" },
  "ficha_b6_4to_ano_2026": { nombre: "Ficha B-6: Seguimiento y Apoyo Docente Tutor", ano: "4to Año" },
  "ficha_b7_4to_ano_2026": { nombre: "Ficha B-7: Diagnóstico Socioparticipativo", ano: "4to Año" },
  "ficha_c1_4to_ano_2026": { nombre: "Ficha C-1: Evaluación Documento de Diseño Metodológico", ano: "4to Año" },
  "ficha_c2_4to_ano_2026": { nombre: "Ficha C-2: Socialización del Diseño Metodológico", ano: "4to Año" },
  "acta_final_evaluacion_4to_ano_2026": { nombre: "Acta Final de Evaluación del Diseño Metodológico", ano: "4to Año" },
  "acta_postergacion_4to_ano_2026": { nombre: "Acta de Postergación de la Socialización Oral", ano: "4to Año" },
  "centralizador_4to_ano_2026": { nombre: "Ficha Centralizadora de Evaluación 4to Año", ano: "4to Año" },

  // 5TO AÑO DE FORMACIÓN
  "ficha_a1_5to_ano_2026": { nombre: "Ficha A-1: Planificación y Elaboración de PDC", ano: "5to Año" },
  "ficha_b1_5to_ano_2026": { nombre: "Ficha B-1: Control de Asistencia PEC (10 Semanas)", ano: "5to Año" },
  "ficha_b2_5to_ano_2026": { nombre: "Ficha B-2: Concreción Curricular - Aplicación del PDC", ano: "5to Año" },
  "ficha_b3_5to_ano_2026": { nombre: "Ficha B-3: Valoración de la Clase Comunitaria", ano: "5to Año" },
  "ficha_b4_5to_ano_2026": { nombre: "Ficha B-4: Centralizador de Desarrollo de PDC", ano: "5to Año" },
  "ficha_b5_5to_ano_2026": { nombre: "Ficha B-5: Centralizador Seguimiento Docente Guía", ano: "5to Año" },
  "ficha_b6_5to_ano_2026": { nombre: "Ficha B-6: Apoyo y Seguimiento Docente Tutor", ano: "5to Año" },
  "ficha_c1_5to_ano_2026": { nombre: "Ficha C-1: Evaluación Documento Trabajo de Grado", ano: "5to Año" },
  "ficha_c2_5to_ano_2026": { nombre: "Ficha C-2: Socialización del Trabajo de Grado", ano: "5to Año" },
  "acta_postergacion_5to_ano_2026": { nombre: "Acta de Postergación de Socialización", ano: "5to Año" },
  "centralizador_5to_ano_2026": { nombre: "Ficha Centralizadora Cualitativa-Cuantitativa (5to Año)", ano: "5to Año" }
};

export const AuditLogsManagement = () => {
  const [logs, setLogs] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [operationFilter, setOperationFilter] = useState('');
  const [tableFilter, setTableFilter] = useState('');

  // 1. CARGAR TODOS LOS USUARIOS DESDE LA API
  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers();
      if (Array.isArray(data)) {
        const map = {};
        data.forEach(user => {
          map[user.id] = user;
        });
        setUsersMap(map);
      }
    } catch (err) {
      console.error("Error al cargar la lista de usuarios:", err);
    }
  };

  // 2. CARGAR REGISTROS DE AUDITORÍA
  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await auditoriaService.getLogs({
        operacion: operationFilter,
        tabla: tableFilter,
        search: searchTerm
      });
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando auditoría:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [operationFilter, tableFilter]);

  // 3. RESOLVER EL USUARIO QUE EJECUTÓ LA ACCIÓN EXCLUSIVAMENTE CON EL USUARIO_ID
  const resolveUserFromLog = (log) => {
    const executorId = log.usuario_id;
    const matchedUser = usersMap[executorId];

    if (matchedUser) {
      return {
        nombreCompleto: `${matchedUser.nombre} ${matchedUser.apellido}`.trim(),
        username: matchedUser.username,
        rol: matchedUser.rol
      };
    }

    return {
      nombreCompleto: 'Usuario Sin Sesión',
      username: executorId ? `id: ${String(executorId).substring(0, 8)}...` : 'desconocido',
      rol: 'SISTEMA'
    };
  };

  // 4. FILTRADO COMPLETO
  const processedLogs = useMemo(() => {
    return logs.map(log => {
      const userInfo = resolveUserFromLog(log);
      return {
        ...log,
        userInfo
      };
    }).filter(log => {
      const search = searchTerm.toLowerCase();
      const userExec = log.userInfo.username.toLowerCase();
      const fullName = log.userInfo.nombreCompleto.toLowerCase();
      const tableInfo = DICCIONARIO_TABLAS[log.nombre_tabla]?.nombre || log.nombre_tabla;

      const matchesSearch = userExec.includes(search) || 
                            fullName.includes(search) || 
                            tableInfo.toLowerCase().includes(search) || 
                            (log.ip_origen || '').toLowerCase().includes(search);

      const matchesRole = roleFilter === '' || log.userInfo.rol === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [logs, usersMap, searchTerm, roleFilter]);

  // EXPORTAR A EXCEL (.xlsx)
  const handleExportExcel = () => {
    if (processedLogs.length === 0) return;

    const excelData = processedLogs.map(log => {
      const fecha = log.fecha_hora 
        ? new Date(log.fecha_hora).toLocaleString('es-BO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        : '---';

      const infoTabla = DICCIONARIO_TABLAS[log.nombre_tabla] || {
        nombre: log.nombre_tabla
      };

      return {
        'FECHA Y HORA': fecha,
        'REALIZADO POR': log.userInfo.nombreCompleto,
        'ROL': log.userInfo.rol,
        'OPERACIÓN': log.operacion,
        'SECCIÓN / TABLA AFECTADA': infoTabla.nombre
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Auditoria');

    const fileName = `Reporte_Auditoria_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // EXPORTAR A PDF CON FORMATO INSTITUCIONAL
  const handleExportPDF = () => {
    if (processedLogs.length === 0) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const totalPagesExp = '{total_pages_count_string}';

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(128, 27, 40);
    doc.text('ESFM "THEA" - IEPC-PEC', 14, 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Escuela Superior de Formación de Maestros - Reporte de Auditoría del Sistema', 14, 20);

    doc.setFontSize(8);
    doc.text(`Fecha Emisión: ${new Date().toLocaleDateString('es-BO')}`, doc.internal.pageSize.width - 14, 15, { align: 'right' });

    doc.setDrawColor(128, 27, 40);
    doc.setLineWidth(0.5);
    doc.line(14, 23, doc.internal.pageSize.width - 14, 23);

    const columns = ['FECHA Y HORA', 'REALIZADO POR', 'ROL', 'OPERACIÓN', 'SECCIÓN / TABLA AFECTADA'];

    const rows = processedLogs.map(log => {
      const fecha = log.fecha_hora 
        ? new Date(log.fecha_hora).toLocaleString('es-BO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        : '---';

      const infoTabla = DICCIONARIO_TABLAS[log.nombre_tabla] || {
        nombre: log.nombre_tabla
      };

      return [
        fecha,
        log.userInfo.nombreCompleto,
        log.userInfo.rol,
        log.operacion,
        infoTabla.nombre
      ];
    });

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 28,
      theme: 'grid',
      headStyles: {
        fillColor: [128, 27, 40],
        textColor: [255, 255, 255],
        fontSize: 7,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [30, 41, 59]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });

    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }

    doc.save(`Reporte_Auditoria_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* ENCABEZADO */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <ShieldCheck size={14} className="text-[#8C731A]" /> Registro de Actividades
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Auditoría del Sistema
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Mapeo de acciones ejecutadas sobre la base de datos vinculado a la API de usuarios.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleExportExcel}
              disabled={loading || processedLogs.length === 0}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet size={16} /> Exportar Excel
            </button>
            <button
              onClick={handleExportPDF}
              disabled={loading || processedLogs.length === 0}
              className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-4 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-[#a32334] transition-all cursor-pointer disabled:opacity-50"
            >
              <Printer size={16} /> Exportar PDF
            </button>
            <button
              onClick={() => { fetchUsers(); fetchAuditLogs(); }}
              className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-4 py-3 text-xs font-extrabold uppercase text-white shadow-lg hover:bg-[#a32334] transition-all cursor-pointer border border-white/10"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por Nombre, Username o Tabla..."
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

        <div className="relative">
          <Activity className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <select
            value={operationFilter}
            onChange={(e) => setOperationFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none appearance-none bg-white cursor-pointer"
          >
            <option value="">Todas las Operaciones</option>
            <option value="Inserción">Inserción</option>
            <option value="Modificación">Modificación</option>
            <option value="Eliminación">Eliminación</option>
          </select>
        </div>

        <div className="relative">
          <Database className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none appearance-none bg-white cursor-pointer"
          >
            <option value="">Todas las Secciones / Tablas</option>
            {Object.entries(DICCIONARIO_TABLAS).map(([key, item]) => (
              <option key={key} value={key}>{item.nombre} ({item.ano})</option>
            ))}
          </select>
        </div>

      </div>

      {/* TABLA PRINCIPAL */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5 tracking-widest text-[11px]">FECHA Y HORA</th>
                <th className="py-3.5 px-5 tracking-widest text-[11px]">REALIZADO POR</th>
                <th className="py-3.5 px-5 tracking-widest text-[11px]">ROL</th>
                <th className="py-3.5 px-5 tracking-widest text-[11px]">OPERACIÓN</th>
                <th className="py-3.5 px-5 tracking-widest text-[11px]">SECCIÓN / TABLA AFECTADA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-bold">
                    <Loader2 className="animate-spin inline-block mr-2 text-[#8C731A]" size={20} />
                    Cargando registros de auditoría...
                  </td>
                </tr>
              ) : processedLogs.length > 0 ? (
                processedLogs.map((log, index) => {
                  const fecha = log.fecha_hora 
                    ? new Date(log.fecha_hora).toLocaleString('es-BO', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })
                    : '---';

                  const infoTabla = DICCIONARIO_TABLAS[log.nombre_tabla] || {
                    nombre: log.nombre_tabla,
                    ano: "General"
                  };

                  return (
                    <tr key={log.log_id || index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5 font-mono text-slate-800 font-bold text-[12px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-slate-400 shrink-0" />
                          {fecha}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-extrabold text-slate-900 text-[13px]">
                          {log.userInfo.nombreCompleto}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          log.userInfo.rol === 'ESTUDIANTE' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          log.userInfo.rol === 'DOCENTE_ACOMPANANTE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          log.userInfo.rol === 'DOCENTE_GUIA' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          log.userInfo.rol === 'ADMINISTRADOR' ? 'bg-slate-800 text-white' :
                          'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {log.userInfo.rol}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                          log.operacion === 'Inserción' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          log.operacion === 'Modificación' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {log.operacion}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-extrabold text-slate-800 text-[12px]">{infoTabla.nombre}</div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">
                    No se encontraron registros de auditoría.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};