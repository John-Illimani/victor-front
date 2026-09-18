import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  FileText, 
  X, 
  Eye,
  LogOut
} from 'lucide-react';

import { teacherService } from '../../../services/teacherService';
import { studentService } from '../../../services/studentService';
import { userService } from '../../../services/userService';
import { FormularioFichaDinamico } from '../../admin/FormularioFichaDinamico';

// IMPORTACIÓN DE COMPONENTES DE FICHAS POR AÑO
import { ActaConformacion1erAno } from '../../admin/fichas/1año/ActaConformacion1erAno';
import { FichaF1_1erAno } from '../../admin/fichas/1año/FichaF1_1erAno';
import { FichaF2_1erAno } from '../../admin/fichas/1año/FichaF2_1erAno';
import { FichaF3_1erAno } from '../../admin/fichas/1año/FichaF3_1erAno';
import { FichaF4_1erAno } from '../../admin/fichas/1año/FichaF4_1erAno';
import { FichaF5_1erAno } from '../../admin/fichas/1año/FichaF5_1erAno';
import { Centralizador1erAno } from '../../admin/fichas/1año/Centralizador1erAno';

import { ActaInicio2doAno } from '../../admin/fichas/2año/ActaInicio2doAno';
import { ActaConformacion2doAno } from '../../admin/fichas/2año/ActaConformacion2doAno';
import { FichaF1_2doAno } from '../../admin/fichas/2año/FichaF1_2doAno';
import { FichaF2_2doAno } from '../../admin/fichas/2año/FichaF2_2doAno';
import { FichaF3_2doAno } from '../../admin/fichas/2año/FichaF3_2doAno';
import { FichaF4_2doAno } from '../../admin/fichas/2año/FichaF4_2doAno';
import { FichaF5_2doAno } from '../../admin/fichas/2año/FichaF5_2doAno';
import { FichaF6_2doAno } from '../../admin/fichas/2año/FichaF6_2doAno';
import { Centralizador2doAno } from '../../admin/fichas/2año/Centralizador2doAno';

import { ActaConformacion3erAno } from '../../admin/fichas/3año/ActaConformacion3erAno';
import { ActaInicio3erAno } from '../../admin/fichas/3año/ActaInicio3erAno';
import { ActaSocializacion3erAno } from '../../admin/fichas/3año/ActaSocializacion3erAno';
import { FichaA1_3erAno } from '../../admin/fichas/3año/FichaA1_3erAno';
import { FichaB1_3erAno } from '../../admin/fichas/3año/FichaB1_3erAno';
import { FichaB2_3erAno } from '../../admin/fichas/3año/FichaB2_3erAno';
import { FichaB3_3erAno } from '../../admin/fichas/3año/FichaB3_3erAno';
import { FichaB4_3erAno } from '../../admin/fichas/3año/FichaB4_3erAno';
import { FichaB5_3erAno } from '../../admin/fichas/3año/FichaB5_3erAno';
import { Centralizador3erAno } from '../../admin/fichas/3año/Centralizador3erAno';

import { FichaA1_4toAno } from '../../admin/fichas/4año/FichaA1_4toAno';
import { FichaA2_4toAno } from '../../admin/fichas/4año/FichaA2_4toAno';
import { FichaB1_4toAno } from '../../admin/fichas/4año/FichaB1_4toAno';
import { FichaB2_4toAno } from '../../admin/fichas/4año/FichaB2_4toAno';
import { FichaB3_4toAno } from '../../admin/fichas/4año/FichaB3_4toAno';
import { FichaB4_4toAno } from '../../admin/fichas/4año/FichaB4_4toAno';
import { FichaB5_4toAno } from '../../admin/fichas/4año/FichaB5_4toAno';
import { FichaB6_4toAno } from '../../admin/fichas/4año/FichaB6_4toAno';
import { FichaB7_4toAno } from '../../admin/fichas/4año/FichaB7_4toAno';
import { FichaC1_4toAno } from '../../admin/fichas/4año/FichaC1_4toAno';
import { FichaC2_4toAno } from '../../admin/fichas/4año/FichaC2_4toAno';
import { ActaFinalEvolucion_4toAno } from '../../admin/fichas/4año/ActaFinalEvolucion_4toAno';
import { ActaPostergacion_4toAno } from '../../admin/fichas/4año/ActaPostergacion_4toAno';
import { Centralizador4toAno } from '../../admin/fichas/4año/Centralizador4toAno';

import { FichaA1_5toAno } from '../../admin/fichas/5año/FichaA1_5toAno';
import { FichaB1_5toAno } from '../../admin/fichas/5año/FichaB1_5toAno';
import { FichaB2_5toAno } from '../../admin/fichas/5año/FichaB2_5toAno';
import { FichaB3_5toAno } from '../../admin/fichas/5año/FichaB3_5toAno';
import { FichaB4_5toAno } from '../../admin/fichas/5año/FichaB4_5toAno';
import { FichaB5_5toAno } from '../../admin/fichas/5año/FichaB5_5toAno';
import { FichaB6_5toAno } from '../../admin/fichas/5año/FichaB6_5toAno';
import { FichaC1_5toAno } from '../../admin/fichas/5año/FichaC1_5toAno';
import { FichaC2_5toAno } from '../../admin/fichas/5año/FichaC2_5toAno';
import { Centralizador5toAno } from '../../admin/fichas/5año/Centralizador5toAno';
import { ActaPostergacion_5toAno } from '../../admin/fichas/5año/ActaPostergacion_5toAno';

// DICCIONARIOS DE COMPONENTES POR AÑO
const COMPONENTES_1ER_ANO = {
  "1_ACTA_EQUIPO": ActaConformacion1erAno,
  "1_F1": FichaF1_1erAno,
  "1_F2": FichaF2_1erAno,
  "1_F3": FichaF3_1erAno,
  "1_F4": FichaF4_1erAno,
  "1_F5": FichaF5_1erAno,
  CENTRALIZADOR: Centralizador1erAno,
};

const COMPONENTES_2DO_ANO = {
  "2_ACTA_INICIO": ActaInicio2doAno,
  "2_ACTA_EQUIPO": ActaConformacion2doAno,
  "2_F1": FichaF1_2doAno,
  "2_F2": FichaF2_2doAno,
  "2_F3": FichaF3_2doAno,
  "2_F4": FichaF4_2doAno,
  "2_F5": FichaF5_2doAno,
  "2_F6": FichaF6_2doAno,
  CENTRALIZADOR: Centralizador2doAno,
};

const COMPONENTES_3ER_ANO = {
  "3_ACTA_EQUIPO": ActaConformacion3erAno,
  "3_ACTA_INICIO": ActaInicio3erAno,
  "3_ACTA_SOCIALIZACION": ActaSocializacion3erAno,
  "3_A1": FichaA1_3erAno,
  "3_B1": FichaB1_3erAno,
  "3_B2": FichaB2_3erAno,
  "3_B3": FichaB3_3erAno,
  "3_B4": FichaB4_3erAno,
  "3_B5": FichaB5_3erAno,
  CENTRALIZADOR: Centralizador3erAno,
};

const COMPONENTES_4TO_ANO = {
  "4_A1": FichaA1_4toAno,
  "4_A2": FichaA2_4toAno,
  "4_B1": FichaB1_4toAno,
  "4_B2": FichaB2_4toAno,
  "4_B3": FichaB3_4toAno,
  "4_B4": FichaB4_4toAno,
  "4_B5": FichaB5_4toAno,
  "4_B6": FichaB6_4toAno,
  "4_B7": FichaB7_4toAno,
  "4_C1": FichaC1_4toAno,
  "4_C2": FichaC2_4toAno,
  "4_ACTA_FINAL": ActaFinalEvolucion_4toAno,
  "4_ACTA_POSTERGACION": ActaPostergacion_4toAno,
  CENTRALIZADOR: Centralizador4toAno,
};

const COMPONENTES_5TO_ANO = {
  "5_A1": FichaA1_5toAno,
  "5_B1": FichaB1_5toAno,
  "5_B2": FichaB2_5toAno,
  "5_B3": FichaB3_5toAno,
  "5_B4": FichaB4_5toAno,
  "5_B5": FichaB5_5toAno,
  "5_B6": FichaB6_5toAno,
  "5_C1": FichaC1_5toAno,
  "5_C2": FichaC2_5toAno,
  "5_ACTA_POSTERGACION": ActaPostergacion_5toAno,
  CENTRALIZADOR: Centralizador5toAno,
};

export const MisEstudiantes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAno, setFilterAno] = useState('Todos');

  // ESTADOS DE DATOS
  const [estudiantes, setEstudiantes] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // MODALES
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showFichaModal, setShowFichaModal] = useState(false);
  const [activeFicha, setActiveFicha] = useState(null);
  const [fichaData, setFichaData] = useState({});

  // CARGAR ESTUDIANTES ASIGNADOS
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const savedUser = localStorage.getItem("user");
        let docenteId = null;

        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          docenteId = parsed.id || parsed.docente_id || parsed.teacher_id;
        }

        if (!docenteId) {
          setErrorMessage("No se encontró el identificador del docente autenticado.");
          setLoading(false);
          return;
        }

        const [assignedData, usersData] = await Promise.allSettled([
          teacherService.getAssignedStudents(docenteId),
          userService.getUsers()
        ]);

        if (assignedData.status === 'fulfilled') {
          const list = Array.isArray(assignedData.value) ? assignedData.value : assignedData.value?.estudiantes || [];
          setEstudiantes(list);
        } else {
          setErrorMessage("No se pudieron cargar los estudiantes asignados.");
        }

        if (usersData.status === 'fulfilled') {
          setDocentes(usersData.value.filter((u) => u.rol && u.rol.includes("DOCENTE")));
        }

      } catch (err) {
        console.error("Error al cargar datos:", err);
        setErrorMessage("Error de conexión al cargar la nómina de estudiantes.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // FILTRADO POR AÑO
  const filteredEstudiantes = estudiantes.filter((item) => {
    const fullName = `${item.nombre || ""} ${item.apellido || ""}`.toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchSearch =
      fullName.includes(search) ||
      (item.username && item.username.toLowerCase().includes(search)) ||
      (item.ci && item.ci.includes(search));

    let matchAno = true;
    if (filterAno !== "Todos") {
      const val = (item.ano_formacion || "").toUpperCase();
      if (filterAno === '1er Año') matchAno = val.includes("1") || val.includes("PRIMER") || val.includes("1RO");
      else if (filterAno === '2do Año') matchAno = val.includes("2") || val.includes("SEGUNDO") || val.includes("2DO");
      else if (filterAno === '3er Año') matchAno = val.includes("3") || val.includes("TERCER") || val.includes("3RO");
      else if (filterAno === '4to Año') matchAno = val.includes("4") || val.includes("CUARTO") || val.includes("4TO");
      else if (filterAno === '5to Año') matchAno = val.includes("5") || val.includes("QUINTO") || val.includes("5TO");
    }

    return matchSearch && matchAno;
  });

  // MALLA DE FICHAS SEGÚN EL AÑO
  const getFichasByAno = (ano) => {
    const a = (ano || "").toUpperCase();
    if (a.includes("1") || a.includes("PRIMER") || a.includes("1RO"))
      return [
        { codigo: "1_ACTA_EQUIPO", nombre: "Acta de Conformación del Equipo Comunitario" },
        { codigo: "1_F1", nombre: "Ficha F-1: Elaboración y Validación de Instrumentos" },
        { codigo: "1_F2", nombre: "Ficha F-2: Control de Asistencia PEC (Días detallados)" },
        { codigo: "1_F3", nombre: "Ficha F-3: Aplicación de Técnicas e Instrumentos" },
        { codigo: "1_F4", nombre: "Ficha F-4: Seguimiento del Docente Guía y Director" },
        { codigo: "1_F5", nombre: "Ficha F-5: Valoración de la Producción de Conocimientos" },
        { codigo: "CENTRALIZADOR", nombre: "Cuadro Centralizador de Evaluación 1er Año" },
      ];
    if (a.includes("2") || a.includes("SEGUNDO") || a.includes("2DO"))
      return [
        { codigo: "2_ACTA_INICIO", nombre: "Acta de Inicio - 2do Año (IEPC-PEC)" },
        { codigo: "2_ACTA_EQUIPO", nombre: "Acta de Conformación de Equipo Comunitario" },
        { codigo: "2_F1", nombre: "Ficha F-1: Coordinación y Gestión Comunitaria" },
        { codigo: "2_F2", nombre: "Ficha F-2: Asistencia PEC (2 semanas / 10 días)" },
        { codigo: "2_F3", nombre: "Ficha F-3: Aplicación de Técnicas e Instrumentos" },
        { codigo: "2_F4", nombre: "Ficha F-4: Apoyo y Seguimiento Concreción Curricular" },
        { codigo: "2_F5", nombre: "Ficha F-5: Valoración del Docente Acompañante ESFM" },
        { codigo: "2_F6", nombre: "Ficha F-6: Valoración de la Producción IEPC-PEC" },
        { codigo: "CENTRALIZADOR", nombre: "Centralizador de Evaluación 2º Año" },
      ];
    if (a.includes("3") || a.includes("TERCER") || a.includes("3RO"))
      return [
        { codigo: "3_ACTA_EQUIPO", nombre: "Acta de Conformación y Compromiso de Equipo" },
        { codigo: "3_ACTA_INICIO", nombre: "Acta de Inicio - 3er Año" },
        { codigo: "3_ACTA_SOCIALIZACION", nombre: "Acta de Socialización del Diagnóstico" },
        { codigo: "3_A1", nombre: "Ficha A-1: Técnicas e Instrumentos de Investigación" },
        { codigo: "3_B1", nombre: "Ficha B-1: Apoyo y Seguimiento Docente Acompañante" },
        { codigo: "3_B2", nombre: "Ficha B-2: Asistencia PEC (4 semanas)" },
        { codigo: "3_B3", nombre: "Ficha B-3: Apoyo Docente Guía Concreción Curricular" },
        { codigo: "3_B4", nombre: "Ficha B-4: Seguimiento y Apoyo Docente Tutor" },
        { codigo: "3_B5", nombre: "Ficha B-5: Presentación Informe Diagnóstico Socioparticipativo" },
        { codigo: "CENTRALIZADOR", nombre: "Centralizador de Evaluación 3º Año" },
      ];
    if (a.includes("4") || a.includes("CUARTO") || a.includes("4TO"))
      return [
        { codigo: "4_A1", nombre: "Ficha A-1: Técnicas e Instrumentos de Investigación" },
        { codigo: "4_A2", nombre: "Ficha A-2: Elaboración de PDC (4 a 6 PDC)" },
        { codigo: "4_B1", nombre: "Ficha B-1: Control de Asistencia PEC (6 semanas)" },
        { codigo: "4_B2", nombre: "Ficha B-2: Concreción Curricular - Desarrollo del PDC" },
        { codigo: "4_B3", nombre: "Ficha B-3: Valoración de la Clase Comunitaria" },
        { codigo: "4_B4", nombre: "Ficha B-4: Centralizador Concreción Curricular" },
        { codigo: "4_B5", nombre: "Ficha B-5: Seguimiento y Apoyo de la/el Docente Guía" },
        { codigo: "4_B6", nombre: "Ficha B-6: Seguimiento y Apoyo Docente Tutor Acompañante" },
        { codigo: "4_B7", nombre: "Ficha B-7: Diagnóstico Socioparticipativo de la UE/CEA/CEE" },
        { codigo: "4_C1", nombre: "Ficha C-1: Evaluación Documento de Diseño Metodológico" },
        { codigo: "4_C2", nombre: "Ficha C-2: Socialización del Diseño Metodológico" },
        { codigo: "4_ACTA_FINAL", nombre: "Acta Final de Evaluación del Diseño Metodológico" },
        { codigo: "4_ACTA_POSTERGACION", nombre: "Acta de Postergación de la Socialización Oral" },
        { codigo: "CENTRALIZADOR", nombre: "Ficha Centralizadora de Evaluación 4to Año" },
      ];
    
    return [
      { codigo: "5_A1", nombre: "Ficha A-1: Planificación y Elaboración de PDC" },
      { codigo: "5_B1", nombre: "Ficha B-1: Control de Asistencia PEC (10 Semanas)" },
      { codigo: "5_B2", nombre: "Ficha B-2: Concreción Curricular - Aplicación del PDC" },
      { codigo: "5_B3", nombre: "Ficha B-3: Valoración de la Clase Comunitaria" },
      { codigo: "5_B4", nombre: "Ficha B-4: Centralizador de Desarrollo de PDC" },
      { codigo: "5_B5", nombre: "Ficha B-5: Centralizador Seguimiento y Apoyo del Docente Guía" },
      { codigo: "5_B6", nombre: "Ficha B-6: Apoyo y Seguimiento Docente Tutor Acompañante" },
      { codigo: "5_C1", nombre: "Ficha C-1: Evaluación del Documento de Trabajo de Grado" },
      { codigo: "5_C2", nombre: "Ficha C-2: Socialización del Trabajo de Grado" },
      { codigo: "5_ACTA_POSTERGACION", nombre: "Acta de Postergación de la Socialización de Trabajo de Grado" },
      { codigo: "CENTRALIZADOR", nombre: "Ficha Centralizadora Cualitativa-Cuantitativa (5to Año)" },
    ];
  };

  // CORDENAR ABRIR LA FICHA Y CARGAR SUS DATOS
  const handleOpenFichaDetalle = async (ficha) => {
    setActiveFicha(ficha);
    setActionLoading(true);
    try {
      const res = await studentService.getFicha(selectedStudent.id, ficha.codigo);
      setFichaData(res.datos || {});
    } catch (err) {
      setFichaData({});
    } finally {
      setActionLoading(false);
    }
  };

  // COMPONENTE POR AÑO
  const getComponenteExplicito = () => {
    if (!activeFicha || !selectedStudent) return null;
    const ano = (selectedStudent.ano_formacion || "").toLowerCase();

    if (ano.includes("1") || ano.includes("primer") || ano.includes("1ro")) return COMPONENTES_1ER_ANO[activeFicha.codigo] || null;
    if (ano.includes("2") || ano.includes("segundo") || ano.includes("2do")) return COMPONENTES_2DO_ANO[activeFicha.codigo] || null;
    if (ano.includes("3") || ano.includes("tercer") || ano.includes("3ro")) return COMPONENTES_3ER_ANO[activeFicha.codigo] || null;
    if (ano.includes("4") || ano.includes("cuarto") || ano.includes("4to")) return COMPONENTES_4TO_ANO[activeFicha.codigo] || null;
    if (ano.includes("5") || ano.includes("quinto") || ano.includes("5to")) return COMPONENTES_5TO_ANO[activeFicha.codigo] || null;
    return null;
  };

  const ComponenteExplicito = getComponenteExplicito();

  return (
    <div className="space-y-6 font-sans">
      
      {/* BANNER PRINCIPAL */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#121824] via-[#1A1A1A] to-[#801B28] p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-[#F3EFCF] backdrop-blur-md border border-white/15">
              <Users size={14} className="text-[#8C731A]" /> Consulta de Tutoría
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Mis estudiantes
              <Sparkles size={26} className="text-[#8C731A] animate-pulse shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Consulta de registros, actas y fichas de seguimiento IEPC-PEC de los estudiantes asignados.
            </p>
          </div>
        </div>
      </div>

      {/* MENSAJE DE ERROR */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={18} />
          {errorMessage}
        </div>
      )}

      {/* BÚSQUEDA Y FILTROS POR AÑO */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-xs font-black uppercase text-slate-400 mr-1 w-full sm:w-auto">Año de Formación:</span>
          {['Todos', '1er Año', '2do Año', '3er Año', '4to Año', '5to Año'].map((ano) => (
            <button
              key={ano}
              onClick={() => setFilterAno(ano)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filterAno === ano
                  ? 'bg-[#801B28] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {ano}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por estudiante, C.I. o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2 text-xs font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
          />
        </div>
      </div>

      {/* TABLA PRINCIPAL DE ESTUDIANTES */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Estudiante</th>
                <th className="py-3.5 px-4">Año</th>
                <th className="py-3.5 px-4">Especialidad</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 font-bold">
                    <Loader2 className="animate-spin inline-block mr-2 text-[#801B28]" size={20} />
                    Cargando estudiantes asignados...
                  </td>
                </tr>
              ) : filteredEstudiantes.length > 0 ? (
                filteredEstudiantes.map((item, index) => {
                  const isActive = item.estado === 'ACTIVO' || item.estado === 'Activo' || item.activo === true;
                  return (
                    <tr key={item.id || index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono font-black text-slate-500">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.nombre} {item.apellido}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-800">
                        {item.ano_formacion || '1er Año'}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {item.especialidad || 'Sin especialidad'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isActive ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedStudent(item);
                            setShowFichaModal(true);
                          }}
                          className="rounded-xl bg-[#801B28] px-3.5 py-1.5 text-white font-extrabold hover:bg-[#a32334] transition-all cursor-pointer shadow-sm text-xs flex items-center gap-1.5 mx-auto"
                        >
                          <Eye size={14} />
                          Ver Fichas
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                    No se encontraron estudiantes asignados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: MALLA Y EXPEDIENTE DE FICHAS */}
      {showFichaModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-3 sm:p-4">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowFichaModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <X size={20} />
            </button>

            <div className="border-b border-slate-100 pb-3 mb-4">
              <span className="text-[10px] font-extrabold uppercase text-[#8C731A]">
                CONSULTA DE EXPEDIENTE
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                DATOS DEL ESTUDIANTE
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-5">
              <div>
                <span className="font-bold text-slate-400 block">Nombre:</span>
                <span className="font-extrabold text-slate-900 block">
                  {selectedStudent.nombre} {selectedStudent.apellido}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block">C.I.:</span>
                <span className="font-mono font-extrabold text-slate-900 block">
                  {selectedStudent.ci || 'Sin C.I.'}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block">Código / Usuario:</span>
                <span className="font-mono font-extrabold text-[#801B28] block">
                  {selectedStudent.username || selectedStudent.ci}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block">Especialidad:</span>
                <span className="font-bold text-slate-800 block">
                  {selectedStudent.especialidad || 'Sin Especialidad'}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block">Año de Formación:</span>
                <span className="font-bold text-slate-800 block">
                  {selectedStudent.ano_formacion}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block">Gestión:</span>
                <span className="font-bold text-slate-800 block">
                  {selectedStudent.gestion_academica || "2026"}
                </span>
              </div>
            </div>

            <h3 className="text-sm font-black text-slate-900 mb-3 uppercase flex items-center gap-2">
              <FileText className="text-[#801B28]" size={16} /> Actas, Fichas y Cuadros ({selectedStudent.ano_formacion})
            </h3>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {getFichasByAno(selectedStudent.ano_formacion).map((item) => (
                <div
                  key={item.codigo}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 text-xs hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-800">
                    {item.nombre}
                  </span>
                  <button
                    onClick={() => handleOpenFichaDetalle(item)}
                    className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-900 text-white font-extrabold hover:bg-slate-800 text-[11px] cursor-pointer transition-all flex items-center gap-1 shrink-0"
                  >
                    <Eye size={13} /> Visualizar
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowFichaModal(false)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer transition-all"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MODO LECTURA Y CONTROLES DE SALIDA CON CAPA ABSOLUTA Z-[9999] */}
      {activeFicha && selectedStudent && (
        <React.Fragment>
          {/* BOTÓN 1: X FLOTANTE EN ESQUINA SUPERIOR DERECHA (MAX PRIORIDAD Z-INDEX) */}
          <button
            onClick={() => setActiveFicha(null)}
            className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] bg-[#801B28] text-white p-3 rounded-full shadow-2xl hover:bg-[#a32334] transition-all cursor-pointer border-2 border-white flex items-center gap-2"
            title="Cerrar Ficha Actual"
          >
            <X size={22} className="stroke-[3]" />
            <span className="hidden sm:inline text-xs font-black uppercase pr-1">Cerrar</span>
          </button>

          {/* BOTÓN 2: BARRA FLOTANTE DE ESCAPE EN LA PARTE INFERIOR (Z-INDEX 9999) */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] bg-slate-900/90 backdrop-blur-md px-6 py-2.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-4">
            <span className="text-xs font-extrabold text-white hidden sm:inline">
              VISTA DE SOLO LECTURA
            </span>
            <button
              onClick={() => setActiveFicha(null)}
              className="bg-[#801B28] hover:bg-[#a32334] text-white px-4 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 shadow-md"
            >
              <LogOut size={16} /> Salir de la Ficha
            </button>
          </div>

          {/* CONTENIDO DE LA FICHA O COMPONENTE SELECCIONADO */}
          <div className="fixed inset-0 z-[9990] bg-slate-950/70 backdrop-blur-sm overflow-y-auto p-2 sm:p-6">
            <div className="pointer-events-auto text-xs [&_button]:hidden [&_input]:bg-slate-50 [&_select]:bg-slate-50 [&_textarea]:bg-slate-50">
              {ComponenteExplicito ? (
                <ComponenteExplicito
                  isOpen={Boolean(activeFicha)}
                  onClose={() => setActiveFicha(null)}
                  fichaData={fichaData}
                  setFichaData={() => {}}
                  listaDocentes={docentes}
                  estudianteSeleccionado={selectedStudent}
                  readOnly={true}
                />
              ) : (
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-3xl shadow-2xl my-8">
                  <FormularioFichaDinamico
                    codigoFicha={activeFicha.codigo}
                    fichaData={fichaData}
                    setFichaData={() => {}}
                    listaDocentes={docentes}
                    estudianteSeleccionado={selectedStudent}
                    anoFormacion={selectedStudent.ano_formacion}
                    readOnly={true}
                  />
                </div>
              )}
            </div>
          </div>
        </React.Fragment>
      )}

    </div>
  );
};