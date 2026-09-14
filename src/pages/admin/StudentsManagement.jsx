import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  Download,
  Save,
  X,
  RotateCcw,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Power,
  ToggleLeft,
  ToggleRight,
  UserCheck,
} from "lucide-react";

import { studentService } from "../../services/studentService";
import { userService } from "../../services/userService";
import { FormularioFichaDinamico } from "./FormularioFichaDinamico";
import { generarPdfFichaOficial } from "../../utils/pdfGenerator";

// IMPORTACIÓN DE COMPONENTES EXPLÍCITOS PARA 1ER AÑO
import { ActaConformacion1erAno } from "./fichas/1año/ActaConformacion1erAno";
import { FichaF1_1erAno } from "./fichas/1año/FichaF1_1erAno";
import { FichaF2_1erAno } from "./fichas/1año/FichaF2_1erAno";
import { FichaF3_1erAno } from "./fichas/1año/FichaF3_1erAno";
import { FichaF4_1erAno } from "./fichas/1año/FichaF4_1erAno";
import { FichaF5_1erAno } from "./fichas/1año/FichaF5_1erAno";
import { Centralizador1erAno } from "./fichas/1año/Centralizador1erAno";

// IMPORTACIÓN DE COMPONENTES EXPLÍCITOS PARA 2DO AÑO
import { ActaInicio2doAno } from "./fichas/2año/ActaInicio2doAno";
import { ActaConformacion2doAno } from "./fichas/2año/ActaConformacion2doAno";
import { FichaF1_2doAno } from "./fichas/2año/FichaF1_2doAno";
import { FichaF2_2doAno } from "./fichas/2año/FichaF2_2doAno";
import { FichaF3_2doAno } from "./fichas/2año/FichaF3_2doAno";
import { FichaF4_2doAno } from "./fichas/2año/FichaF4_2doAno";
import { FichaF5_2doAno } from "./fichas/2año/FichaF5_2doAno";
import { FichaF6_2doAno } from "./fichas/2año/FichaF6_2doAno";
import { Centralizador2doAno } from "./fichas/2año/Centralizador2doAno";

// IMPORTACIÓN DE COMPONENTES EXPLÍCITOS PARA 3ER AÑO
import { ActaConformacion3erAno } from "./fichas/3año/ActaConformacion3erAno";
import { ActaInicio3erAno } from "./fichas/3año/ActaInicio3erAno";
import { ActaSocializacion3erAno } from "./fichas/3año/ActaSocializacion3erAno";
import { FichaA1_3erAno } from "./fichas/3año/FichaA1_3erAno";
import { FichaB1_3erAno } from "./fichas/3año/FichaB1_3erAno";
import { FichaB2_3erAno } from "./fichas/3año/FichaB2_3erAno";
import { FichaB3_3erAno } from "./fichas/3año/FichaB3_3erAno";
import { FichaB4_3erAno } from "./fichas/3año/FichaB4_3erAno";
import { FichaB5_3erAno } from "./fichas/3año/FichaB5_3erAno";
import { Centralizador3erAno } from "./fichas/3año/Centralizador3erAno";

// IMPORTACIÓN DE COMPONENTES EXPLÍCITOS PARA 4TO AÑO
import { FichaA1_4toAno } from "./fichas/4año/FichaA1_4toAno";
import { FichaA2_4toAno } from "./fichas/4año/FichaA2_4toAno";
import { FichaB1_4toAno } from "./fichas/4año/FichaB1_4toAno";
import { FichaB2_4toAno } from "./fichas/4año/FichaB2_4toAno";
import { FichaB3_4toAno } from "./fichas/4año/FichaB3_4toAno";
import { FichaB4_4toAno } from "./fichas/4año/FichaB4_4toAno";
import { FichaB5_4toAno } from "./fichas/4año/FichaB5_4toAno";
import { FichaB6_4toAno } from "./fichas/4año/FichaB6_4toAno";
import { FichaB7_4toAno } from "./fichas/4año/FichaB7_4toAno";
import { FichaC1_4toAno } from "./fichas/4año/FichaC1_4toAno";
import { FichaC2_4toAno } from "./fichas/4año/FichaC2_4toAno";
import { ActaFinalEvolucion_4toAno } from "./fichas/4año/ActaFinalEvolucion_4toAno";
import { ActaPostergacion_4toAno } from "./fichas/4año/ActaPostergacion_4toAno";
import { Centralizador4toAno } from "./fichas/4año/Centralizador4toAno";

// IMPORTACIÓN DE COMPONENTES EXPLÍCITOS PARA 5TO AÑO
import { FichaA1_5toAno } from "./fichas/5año/FichaA1_5toAno";
import { FichaB1_5toAno } from "./fichas/5año/FichaB1_5toAno";
import { FichaB2_5toAno } from "./fichas/5año/FichaB2_5toAno";
import { FichaB3_5toAno } from "./fichas/5año/FichaB3_5toAno";
import { FichaB4_5toAno } from "./fichas/5año/FichaB4_5toAno";
import { FichaB5_5toAno } from "./fichas/5año/FichaB5_5toAno";
import { FichaB6_5toAno } from "./fichas/5año/FichaB6_5toAno";
import { FichaC1_5toAno } from "./fichas/5año/FichaC1_5toAno";
import { FichaC2_5toAno } from "./fichas/5año/FichaC2_5toAno";
import { Centralizador5toAno } from "./fichas/5año/Centralizador5toAno";
import { ActaPostergacion_5toAno } from "./fichas/5año/ActaPostergacion_5toAno";

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

export const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);

  // FILTROS
  const [searchTerm, setSearchTerm] = useState("");
  const [anoFilter, setAnoFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // MODALES
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showFichaModal, setShowFichaModal] = useState(false);
  const [activeFicha, setActiveFicha] = useState(null);
  const [fichaData, setFichaData] = useState({});
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [studentToDeleteId, setStudentToDeleteId] = useState(null);

  const [feedbackModal, setFeedbackModal] = useState({
    show: false,
    title: "",
    message: "",
    type: "success",
  });

  const [formData, setFormData] = useState({
    id: "",
    username: "",
    password: "",
    nombres: "",
    apellidos: "",
    ci: "",
    telefono: "",
    estado: "ACTIVO",
    esfm_ua: "ESFM/UA - El Alto",
    especialidad: "Educación Primaria Comunitaria Vocacional",
    genero: "",
    modalidad_ingreso: "ADMISION GENERAL",
    ano_formacion: "1er Año",
    docente_acompanante_id: "",
    docente_guia_id: "",
  });

  const showFeedback = (title, message, type = "success") => {
    setFeedbackModal({ show: true, title, message, type });
  };

  const fetchInitialData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const data = await studentService.getStudents();
      setStudents(data);
      setSelectedIds([]);
      try {
        const users = await userService.getUsers();
        setDocentes(users.filter((u) => u.rol && u.rol.includes("DOCENTE")));
      } catch (e) {
        console.warn("Docentes no cargados");
      }
    } catch (err) {
      showFeedback(
        "Error de Conexión",
        err.message || "Error al conectar con la base de datos.",
        "error"
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData(true);
  }, []);

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.nombre || ""} ${student.apellido || ""}`.toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (student.username && student.username.toLowerCase().includes(search)) ||
      fullName.includes(search) ||
      (student.ci && student.ci.includes(search));

    const matchesAno =
      anoFilter === "" ||
      (student.ano_formacion && student.ano_formacion.includes(anoFilter));
    const matchesStatus =
      statusFilter === "" || student.estado === statusFilter;

    return matchesSearch && matchesAno && matchesStatus;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredStudents.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleStatus = async (student) => {
    const nextStatus = student.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    try {
      await studentService.toggleStatus(student.id, nextStatus);
      showFeedback(
        "Estado Modificado",
        `El estudiante ${student.username} ahora está ${nextStatus}.`,
        "success"
      );
      fetchInitialData(false);
    } catch (err) {
      showFeedback(
        "Error al Cambiar Estado",
        err.message || "No se pudo cambiar el estado.",
        "error"
      );
    }
  };

  const handleNameOrCiChange = (field, value) => {
    const updatedForm = { ...formData, [field]: value };
    const primerNombre = (updatedForm.nombres || "")
      .trim()
      .split(" ")[0]
      .toLowerCase();
    const carnet = (updatedForm.ci || "").trim();

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

  const handleSubmitStudent = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await studentService.updateStudent(formData.id, formData);
        showFeedback(
          "Estudiante Actualizado",
          "Los datos del estudiante fueron actualizados correctamente.",
          "success"
        );
      } else {
        await studentService.createStudent(formData);
        showFeedback(
          "Estudiante Registrado",
          "El estudiante ha sido registrado exitosamente.",
          "success"
        );
      }
      setShowStudentModal(false);
      resetForm();
      fetchInitialData(false);
    } catch (err) {
      showFeedback(
        "Error al Guardar",
        err.message || "Ocurrió un fallo al procesar la solicitud.",
        "error"
      );
    }
  };

  const confirmSingleDelete = (id) => {
    setStudentToDeleteId(id);
    setDeleteTarget("single");
    setShowDeleteConfirmModal(true);
  };

  const confirmBatchDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteTarget("batch");
    setShowDeleteConfirmModal(true);
  };

  const executeDelete = async () => {
    setShowDeleteConfirmModal(false);
    setActionLoading(true);

    try {
      if (deleteTarget === "single" && studentToDeleteId) {
        await studentService.deleteStudent(studentToDeleteId);
        showFeedback(
          "Estudiante Eliminado",
          "El estudiante fue eliminado de la base de datos.",
          "success"
        );
      } else if (deleteTarget === "batch" && selectedIds.length > 0) {
        const res = await studentService.deleteBatch(selectedIds);
        showFeedback(
          "Eliminación Masiva",
          res.message || "Estudiantes eliminados correctamente.",
          "success"
        );
      }
      fetchInitialData(false);
    } catch (err) {
      showFeedback(
        "Error al Eliminar",
        err.message || "No se pudo completar la eliminación.",
        "error"
      );
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
      password: "",
      nombres: student.nombre,
      apellidos: student.apellido,
      ci: student.ci,
      telefono: student.telefono || "",
      estado: student.estado || "ACTIVO",
      esfm_ua: student.esfm_ua || "ESFM/UA - El Alto",
      especialidad:
        student.especialidad || "Educación Primaria Comunitaria Vocacional",
      genero: student.genero || "",
      modalidad_ingreso: student.modalidad_ingreso || "ADMISION GENERAL",
      ano_formacion: student.ano_formacion || "1er Año",
      docente_acompanante_id: student.docente_acompanante_id || "",
      docente_guia_id: student.docente_guia_id || "",
    });
    setShowStudentModal(true);
  };

  const resetForm = () => {
    setIsEditing(false);
    setFormData({
      id: "",
      username: "",
      password: "",
      nombres: "",
      apellidos: "",
      ci: "",
      telefono: "",
      estado: "ACTIVO",
      esfm_ua: "ESFM/UA - El Alto",
      especialidad: "Educación Primaria Comunitaria Vocacional",
      genero: "",
      modalidad_ingreso: "ADMISION GENERAL",
      ano_formacion: "1er Año",
      docente_acompanante_id: "",
      docente_guia_id: "",
    });
  };

  // OBTENER FICHAS SEGÚN EL AÑO DE FORMACIÓN
  const getFichasByAno = (ano) => {
    const a = (ano || "").toUpperCase();
    if (a.includes("1") || a.includes("PRIMER"))
      return [
        { codigo: "1_ACTA_EQUIPO", nombre: "Acta de Conformación del Equipo Comunitario", bd: "acta_equipo_1er_ano" },
        { codigo: "1_F1", nombre: "Ficha F-1: Elaboración y Validación de Instrumentos", bd: "ficha_f1_1er_ano_2026" },
        { codigo: "1_F2", nombre: "Ficha F-2: Control de Asistencia PEC (Días detallados)", bd: "ficha_f2_1er_ano_2026" },
        { codigo: "1_F3", nombre: "Ficha F-3: Aplicación de Técnicas e Instrumentos", bd: "ficha_f3_1er_ano_2026" },
        { codigo: "1_F4", nombre: "Ficha F-4: Seguimiento del Docente Guía y Director", bd: "ficha_f4_1er_ano_2026" },
        { codigo: "1_F5", nombre: "Ficha F-5: Valoración de la Producción de Conocimientos", bd: "ficha_f5_1er_ano_2026" },
        { codigo: "CENTRALIZADOR", nombre: "Cuadro Centralizador de Evaluación 1er Año", bd: "centralizadores_notas" },
      ];
    if (a.includes("2") || a.includes("SEGUNDO"))
      return [
        { codigo: "2_ACTA_INICIO", nombre: "Acta de Inicio - 2do Año (IEPC-PEC)", bd: "acta_inicio_2do_ano" },
        { codigo: "2_ACTA_EQUIPO", nombre: "Acta de Conformación de Equipo Comunitario", bd: "acta_equipo_2do_ano" },
        { codigo: "2_F1", nombre: "Ficha F-1: Coordinación y Gestión Comunitaria", bd: "ficha_f1_2do_ano_2026" },
        { codigo: "2_F2", nombre: "Ficha F-2: Asistencia PEC (2 semanas / 10 días)", bd: "ficha_f2_2do_ano_2026" },
        { codigo: "2_F3", nombre: "Ficha F-3: Aplicación de Técnicas e Instrumentos", bd: "ficha_f3_2do_ano_2026" },
        { codigo: "2_F4", nombre: "Ficha F-4: Apoyo y Seguimiento Concreción Curricular", bd: "ficha_f4_2do_ano_2026" },
        { codigo: "2_F5", nombre: "Ficha F-5: Valoración del Docente Acompañante ESFM", bd: "ficha_f5_2do_ano_2026" },
        { codigo: "2_F6", nombre: "Ficha F-6: Valoración de la Producción IEPC-PEC", bd: "ficha_f6_2do_ano_2026" },
        { codigo: "CENTRALIZADOR", nombre: "Centralizador de Evaluación 2º Año", bd: "centralizadores_notas" },
      ];
    if (a.includes("3") || a.includes("TERCER"))
      return [
        { codigo: "3_ACTA_EQUIPO", nombre: "Acta de Conformación y Compromiso de Equipo", bd: "acta_equipo_3er_ano" },
        { codigo: "3_ACTA_INICIO", nombre: "Acta de Inicio - 3er Año", bd: "acta_inicio_3er_ano" },
        { codigo: "3_ACTA_SOCIALIZACION", nombre: "Acta de Socialización del Diagnóstico", bd: "acta_socializacion_3er_ano" },
        { codigo: "3_A1", nombre: "Ficha A-1: Técnicas e Instrumentos de Investigación", bd: "ficha_a1_3er_ano_2026" },
        { codigo: "3_B1", nombre: "Ficha B-1: Apoyo y Seguimiento Docente Acompañante", bd: "ficha_b1_3er_ano_2026" },
        { codigo: "3_B2", nombre: "Ficha B-2: Asistencia PEC (4 semanas)", bd: "ficha_b2_3er_ano_2026" },
        { codigo: "3_B3", nombre: "Ficha B-3: Apoyo Docente Guía Concreción Curricular", bd: "ficha_b3_3er_ano_2026" },
        { codigo: "3_B4", nombre: "Ficha B-4: Seguimiento y Apoyo Docente Tutor", bd: "ficha_b4_3er_ano_2026" },
        { codigo: "3_B5", nombre: "Ficha B-5: Presentación Informe Diagnóstico Socioparticipativo", bd: "ficha_b5_3er_ano_2026" },
        { codigo: "CENTRALIZADOR", nombre: "Centralizador de Evaluación 3º Año", bd: "centralizadores_notas" },
      ];
    if (a.includes("4") || a.includes("CUARTO"))
      return [
        { codigo: "4_A1", nombre: "Ficha A-1: Técnicas e Instrumentos de Investigación", bd: "ficha_a1_4to_ano_2026" },
        { codigo: "4_A2", nombre: "Ficha A-2: Elaboración de PDC (4 a 6 PDC)", bd: "ficha_a2_pdc_2026" },
        { codigo: "4_B1", nombre: "Ficha B-1: Control de Asistencia PEC (6 semanas)", bd: "ficha_b1_4to_ano_2026" },
        { codigo: "4_B2", nombre: "Ficha B-2: Concreción Curricular - Desarrollo del PDC", bd: "ficha_b2_4to_ano_2026" },
        { codigo: "4_B3", nombre: "Ficha B-3: Valoración de la Clase Comunitaria", bd: "ficha_b3_4to_ano_2026" },
        { codigo: "4_B4", nombre: "Ficha B-4: Centralizador Concreción Curricular", bd: "ficha_b4_4to_ano_2026" },
        { codigo: "4_B5", nombre: "Ficha B-5: Seguimiento y Apoyo de la/el Docente Guía", bd: "ficha_b5_4to_ano_2026" },
        { codigo: "4_B6", nombre: "Ficha B-6: Seguimiento y Apoyo Docente Tutor Acompañante", bd: "ficha_b6_4to_ano_2026" },
        { codigo: "4_B7", nombre: "Ficha B-7: Diagnóstico Socioparticipativo de la UE/CEA/CEE", bd: "ficha_b7_4to_ano_2026" },
        { codigo: "4_C1", nombre: "Ficha C-1: Evaluación Documento de Diseño Metodológico", bd: "ficha_c1_4to_ano_2026" },
        { codigo: "4_C2", nombre: "Ficha C-2: Socialización del Diseño Metodológico", bd: "ficha_c2_4to_ano_2026" },
        { codigo: "4_ACTA_FINAL", nombre: "Acta Final de Evaluación del Diseño Metodológico", bd: "acta_final_4to_ano_2026" },
        { codigo: "4_ACTA_POSTERGACION", nombre: "Acta de Postergación de la Socialización Oral", bd: "acta_postergacion_4to_ano_2026" },
        { codigo: "CENTRALIZADOR", nombre: "Ficha Centralizadora de Evaluación 4to Año", bd: "centralizadores_notas" },
      ];
    
    // RETORNO POR DEFECTO: 5TO AÑO DE FORMACIÓN
    return [
      { codigo: "5_A1", nombre: "Ficha A-1: Planificación y Elaboración de PDC", bd: "ficha_a1_5to_ano_2026" },
      { codigo: "5_B1", nombre: "Ficha B-1: Control de Asistencia PEC (10 Semanas)", bd: "ficha_b1_5to_ano_2026" },
      { codigo: "5_B2", nombre: "Ficha B-2: Concreción Curricular - Aplicación del PDC", bd: "ficha_b2_5to_ano_2026" },
      { codigo: "5_B3", nombre: "Ficha B-3: Valoración de la Clase Comunitaria", bd: "ficha_b3_5to_ano_2026" },
      { codigo: "5_B4", nombre: "Ficha B-4: Centralizador de Desarrollo de PDC", bd: "ficha_b4_5to_ano_2026" },
      { codigo: "5_B5", nombre: "Ficha B-5: Centralizador Seguimiento y Apoyo del Docente Guía", bd: "ficha_b5_5to_ano_2026" },
      { codigo: "5_B6", nombre: "Ficha B-6: Apoyo y Seguimiento Docente Tutor Acompañante", bd: "ficha_b6_5to_ano_2026" },
      { codigo: "5_C1", nombre: "Ficha C-1: Evaluación del Documento de Trabajo de Grado", bd: "ficha_c1_5to_ano_2026" },
      { codigo: "5_C2", nombre: "Ficha C-2: Socialización del Trabajo de Grado", bd: "ficha_c2_5to_ano_2026" },
      { codigo: "5_ACTA_POSTERGACION", nombre: "Acta de Postergación de la Socialización de Trabajo de Grado", bd: "acta_postergacion_5to_ano_2026" },
      { codigo: "CENTRALIZADOR", nombre: "Ficha Centralizadora Cualitativa-Cuantitativa (5to Año)", bd: "centralizadores_notas" },
    ];
  };

  const handleOpenFichaDetalle = async (ficha) => {
    setActiveFicha(ficha);
    setActionLoading(true);
    try {
      const res = await studentService.getFicha(
        selectedStudent.id,
        ficha.codigo
      );
      setFichaData(res.datos || {});
    } catch (err) {
      setFichaData({});
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveFichaData = async () => {
    const notaEvaluada = parseFloat(
      fichaData.promedio_numeral ||
        fichaData.puntaje_final ||
        fichaData.promedio_final ||
        fichaData.promedio_total ||
        fichaData.promedio_parcial ||
        0
    );
    if (
      !activeFicha.codigo.includes("ACTA") &&
      (isNaN(notaEvaluada) || notaEvaluada < 0 || notaEvaluada > 100)
    ) {
      showFeedback(
        "Calificación Inválida",
        "La nota asignada debe encontrarse estrictamente entre 0 y 100 puntos.",
        "error"
      );
      return;
    }

    setActionLoading(true);
    try {
      const payloadConAno = {
        ...fichaData,
        ano_formacion: fichaData.ano_formacion || selectedStudent.ano_formacion,
      };

      await studentService.saveFicha(
        selectedStudent.id,
        activeFicha.codigo,
        payloadConAno
      );
      showFeedback(
        "Éxito",
        "Calificaciones y datos guardados correctamente.",
        "success"
      );
    } catch (err) {
      showFeedback("Error", "No se pudieron guardar los datos.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFichaData = async () => {
    if (
      !window.confirm(
        "¿Está seguro de eliminar o reiniciar los datos de este documento?"
      )
    )
      return;
    setActionLoading(true);
    try {
      await studentService.deleteFicha(selectedStudent.id, activeFicha.codigo);
      setFichaData({});
      showFeedback(
        "Registro Reiniciado",
        "Los datos se eliminaron correctamente.",
        "success"
      );
    } catch (err) {
      showFeedback("Error", "No se pudo eliminar el registro.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // OBTENER COMPONENTE EXPLÍCITO POR AÑO DE FORMACIÓN
  const getComponenteExplicito = () => {
    if (!activeFicha || !selectedStudent) return null;
    const ano = (selectedStudent.ano_formacion || "").toLowerCase();

    if (ano.includes("1") || ano.includes("primer")) {
      return COMPONENTES_1ER_ANO[activeFicha.codigo] || null;
    }
    if (ano.includes("2") || ano.includes("segundo")) {
      return COMPONENTES_2DO_ANO[activeFicha.codigo] || null;
    }
    if (ano.includes("3") || ano.includes("tercer")) {
      return COMPONENTES_3ER_ANO[activeFicha.codigo] || null;
    }
    if (ano.includes("4") || ano.includes("cuarto")) {
      return COMPONENTES_4TO_ANO[activeFicha.codigo] || null;
    }
    if (ano.includes("5") || ano.includes("quinto")) {
      return COMPONENTES_5TO_ANO[activeFicha.codigo] || null;
    }
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
              <GraduationCap size={14} className="text-[#8C731A]" /> Gestión
              Académica → Estudiantes
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Lista de Estudiantes IEPC-PEC
              <Sparkles
                size={26}
                className="text-[#8C731A] animate-pulse shrink-0"
              />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Control centralizado de matriculados, tutores asignados y fichas
              evaluativas adaptadas de 1ro a 5to Año (Gestión 2026).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                resetForm();
                setShowStudentModal(true);
              }}
              className="flex items-center gap-2 rounded-2xl bg-[#801B28] px-4 py-3 text-xs font-extrabold uppercase text-white shadow-lg hover:bg-[#a32334] transition-all cursor-pointer"
            >
              <UserPlus size={16} />+ Nuevo estudiante
            </button>
          </div>
        </div>
      </div>

      {/* BARRA SELECCIÓN MÚLTIPLE */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl bg-[#801B28] px-6 py-3 text-white shadow-xl animate-in fade-in slide-in-from-top-2">
          <span className="text-xs font-black uppercase tracking-wider">
            {selectedIds.length}{" "}
            {selectedIds.length === 1
              ? "estudiante seleccionado"
              : "estudiantes seleccionados"}
          </span>
          <button
            onClick={confirmBatchDelete}
            disabled={actionLoading}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-extrabold uppercase text-[#801B28] hover:bg-rose-100 transition-all cursor-pointer disabled:opacity-50"
          >
            {actionLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            Eliminar Selección
          </button>
        </div>
      )}

      {/* FILTROS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            className="absolute left-3.5 top-3 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por Código, Estudiante o C.I...."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none"
          />
        </div>

        <div className="relative">
          <Filter
            className="absolute left-3.5 top-3 text-slate-400"
            size={16}
          />
          <select
            value={anoFilter}
            onChange={(e) => setAnoFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none appearance-none bg-white cursor-pointer"
          >
            <option value="">Todos los Años de Formación</option>
            <option value="1">1er Año</option>
            <option value="2">2do Año</option>
            <option value="3">3er Año</option>
            <option value="4">4to Año</option>
            <option value="5">5to Año</option>
          </select>
        </div>

        <div className="relative">
          <Power className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none appearance-none bg-white cursor-pointer"
          >
            <option value="">Todos los Estados</option>
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
          </select>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      filteredStudents.length > 0 &&
                      selectedIds.length === filteredStudents.length
                    }
                    className="h-4 w-4 rounded border-slate-300 text-[#801B28] focus:ring-[#801B28] cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Código</th>
                <th className="py-3.5 px-4">Estudiante</th>
                <th className="py-3.5 px-4">C.I.</th>
                <th className="py-3.5 px-4">Año</th>
                <th className="py-3.5 px-4">Especialidad</th>
                <th className="py-3.5 px-4">Gestión</th>
                <th className="py-3.5 px-4">Docente Acompañante</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td
                    colSpan="10"
                    className="py-8 text-center text-slate-500 font-bold"
                  >
                    <Loader2
                      className="animate-spin inline-block mr-2 text-[#8C731A]"
                      size={20}
                    />
                    Cargando lista de estudiantes...
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const isSelected = selectedIds.includes(student.id);
                  const isActive = student.estado === "ACTIVO";
                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-rose-50/40" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(student.id)}
                          className="h-4 w-4 rounded border-slate-300 text-[#801B28] focus:ring-[#801B28] cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#801B28]">
                        {student.username}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{`${student.nombre} ${student.apellido}`}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {student.ci}
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        {student.ano_formacion || "1er Año"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {student.especialidad || "Educación Primaria"}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        2026
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-800">
                        {student.da_nombre
                          ? `${student.da_nombre} ${student.da_apellido}`
                          : "Sin Asignar"}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(student)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all cursor-pointer ${
                            isActive
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {isActive ? (
                            <ToggleRight
                              size={16}
                              className="text-emerald-600"
                            />
                          ) : (
                            <ToggleLeft size={16} className="text-slate-400" />
                          )}
                          {student.estado || "ACTIVO"}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowFichaModal(true);
                            }}
                            className="rounded-xl bg-[#801B28] px-3 py-1.5 text-white font-extrabold hover:bg-[#a32334] transition-all cursor-pointer shadow-sm"
                          >
                            Ver Ficha
                          </button>
                          <button
                            onClick={() => openEditModal(student)}
                            className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => confirmSingleDelete(student.id)}
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
                  <td
                    colSpan="10"
                    className="py-8 text-center text-slate-400 font-medium"
                  >
                    No se encontraron estudiantes coincidentes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: REGISTRAR / EDITAR ESTUDIANTE */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all duration-300 ease-out animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowStudentModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-1">
              <UserPlus className="text-[#801B28]" size={22} />
              {isEditing
                ? "Editar Estudiante y Asignaciones"
                : "Registrar Nuevo Estudiante"}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Complete la información personal, académica y asignación de
              tutores.
            </p>

            <form onSubmit={handleSubmitStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombres}
                    onChange={(e) =>
                      handleNameOrCiChange("nombres", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#8C731A] focus:outline-none"
                    placeholder="Ej. María"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.apellidos}
                    onChange={(e) =>
                      setFormData({ ...formData, apellidos: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#8C731A] focus:outline-none"
                    placeholder="Ej. López Calle"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">
                    C.I. *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ci}
                    onChange={(e) =>
                      handleNameOrCiChange("ci", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#8C731A] focus:outline-none font-mono"
                    placeholder="Ej. 8492012"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">
                    Año de Formación *
                  </label>
                  <select
                    value={formData.ano_formacion}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ano_formacion: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-700 focus:border-[#8C731A] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="1er Año">1er Año</option>
                    <option value="2do Año">2do Año</option>
                    <option value="3er Año">3er Año</option>
                    <option value="4to Año">4to Año</option>
                    <option value="5to Año">5to Año</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">
                    Estado *
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({ ...formData, estado: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-700 focus:border-[#8C731A] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="INACTIVO">INACTIVO</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-[#8C731A] focus:outline-none"
                    placeholder="Ej. 78912034"
                  />
                </div>

                <div className="sm:col-span-2 rounded-2xl bg-emerald-50/60 p-4 border border-emerald-200 space-y-3">
                  <span className="text-[11px] font-black uppercase text-emerald-900 flex items-center gap-1.5">
                    <UserCheck size={14} /> Asignación de Docente Acompañante y
                    Guía
                  </span>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block font-extrabold text-slate-700 mb-1">
                        Docente Acompañante ESFM
                      </label>
                      <select
                        value={formData.docente_acompanante_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            docente_acompanante_id: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white p-2 font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none cursor-pointer"
                      >
                        <option value="">-- Sin Asignar --</option>
                        {docentes
                          .filter(
                            (d) =>
                              d.rol === "DOCENTE_ACOMPANANTE" ||
                              d.rol.includes("ACOMPANANTE")
                          )
                          .map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.nombre} {d.apellido}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-700 mb-1">
                        Docente Guía / UE
                      </label>
                      <select
                        value={formData.docente_guia_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            docente_guia_id: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white p-2 font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none cursor-pointer"
                      >
                        <option value="">-- Sin Asignar --</option>
                        {docentes
                          .filter(
                            (d) =>
                              d.rol === "DOCENTE_GUIA" ||
                              d.rol.includes("GUIA")
                          )
                          .map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.nombre} {d.apellido}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 cursor-pointer transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#801B28] px-5 py-2 font-bold text-white hover:bg-[#a32334] shadow-md cursor-pointer transition-all"
                >
                  {isEditing ? "Guardar Cambios" : "Registrar Estudiante"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SELECCIÓN DE FICHA Y MALLA */}
      {showFichaModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all duration-300 ease-out animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowFichaModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <X size={20} />
            </button>

            <div className="border-b border-slate-100 pb-3 mb-4">
              <span className="text-[10px] font-extrabold uppercase text-[#8C731A]">
                FICHA DEL ESTUDIANTE
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                DATOS DEL ESTUDIANTE
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-5">
              <div>
                <span className="font-bold text-slate-400 block">Nombre:</span>{" "}
                <span className="font-extrabold text-slate-900 block">
                  {selectedStudent.nombre} {selectedStudent.apellido}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block">C.I.:</span>{" "}
                <span className="font-mono font-extrabold text-slate-900 block">
                  {selectedStudent.ci}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block">Código:</span>{" "}
                <span className="font-mono font-extrabold text-[#801B28] block">
                  {selectedStudent.username}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block">
                  Especialidad:
                </span>{" "}
                <span className="font-bold text-slate-800 block">
                  {selectedStudent.especialidad}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block">Año:</span>{" "}
                <span className="font-bold text-slate-800 block">
                  {selectedStudent.ano_formacion}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block">Gestión:</span>{" "}
                <span className="font-bold text-slate-800 block">2026</span>
              </div>
            </div>

            <h3 className="text-sm font-black text-slate-900 mb-3 uppercase flex items-center gap-2">
              <FileText className="text-[#801B28]" size={16} /> Actas, Fichas y
              Cuadros ({selectedStudent.ano_formacion})
            </h3>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {getFichasByAno(selectedStudent.ano_formacion).map((item) => (
                <div
                  key={item.codigo}
                  className="flex items-center justify-between p-3 text-xs hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-800">
                    {item.nombre}
                  </span>
                  <button
                    onClick={() => handleOpenFichaDetalle(item)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-extrabold hover:bg-slate-800 text-[11px] cursor-pointer transition-all"
                  >
                    Abrir / Evaluar
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

      {/* MODAL 3: EVALUACIÓN */}
      {activeFicha && selectedStudent && (
        <>
          {ComponenteExplicito ? (
            <ComponenteExplicito
              isOpen={Boolean(activeFicha)}
              onClose={() => setActiveFicha(null)}
              fichaData={fichaData}
              setFichaData={setFichaData}
              listaDocentes={docentes}
              estudianteSeleccionado={selectedStudent}
            />
          ) : (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all duration-300 ease-out animate-in fade-in">
              <div className="w-full max-w-2xl bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                <div className="text-center border-b border-slate-200 pb-3 mb-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    PRESIDENCIA DEL ESTADO PLURINACIONAL DE BOLIVIA - MINISTERIO DE EDUCACIÓN
                  </h4>
                  <h3 className="text-xs font-black uppercase text-slate-800">
                    {selectedStudent.ano_formacion} - GESTIÓN 2026
                  </h3>
                </div>

                {actionLoading ? (
                  <div className="py-12 text-center font-bold text-slate-500">
                    <Loader2 className="animate-spin inline-block mr-2 text-[#8C731A]" />{" "}
                    Cargando datos...
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <FormularioFichaDinamico
                      codigoFicha={activeFicha.codigo}
                      fichaData={fichaData}
                      setFichaData={setFichaData}
                      listaDocentes={docentes}
                      estudianteSeleccionado={selectedStudent}
                      anoFormacion={selectedStudent.ano_formacion}
                    />

                    <div className="flex justify-between items-center border-t border-slate-200 pt-4">
                      <button
                        onClick={() =>
                          generarPdfFichaOficial(
                            selectedStudent,
                            activeFicha,
                            fichaData
                          )
                        }
                        className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md hover:bg-emerald-700 transition-all cursor-pointer"
                      >
                        <Download size={16} /> Descargar PDF Oficial
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={handleDeleteFichaData}
                          className="px-3 py-2 bg-rose-100 text-rose-700 font-bold rounded-xl flex items-center gap-1 hover:bg-rose-200 transition-all cursor-pointer"
                        >
                          <RotateCcw size={14} /> Reiniciar
                        </button>
                        <button
                          onClick={() => setActiveFicha(null)}
                          className="px-3 py-2 bg-slate-200 text-slate-800 font-bold rounded-xl hover:bg-slate-300 transition-all cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveFichaData}
                          className="px-5 py-2 bg-[#801B28] text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md hover:bg-[#a32334] transition-all cursor-pointer"
                        >
                          <Save size={16} /> Guardar Registro
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all duration-300 ease-out animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              ¿Confirmar Eliminación?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Esta acción es irreversible.
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

      {/* MODAL DE FEEDBACK */}
      {feedbackModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all duration-300 ease-out animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
                feedbackModal.type === "success"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-rose-100 text-rose-600"
              }`}
            >
              {feedbackModal.type === "success" ? (
                <CheckCircle2 size={30} />
              ) : (
                <AlertCircle size={30} />
              )}
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">
              {feedbackModal.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              {feedbackModal.message}
            </p>
            <button
              type="button"
              onClick={() =>
                setFeedbackModal({ ...feedbackModal, show: false })
              }
              className={`w-full rounded-xl py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
                feedbackModal.type === "success"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
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