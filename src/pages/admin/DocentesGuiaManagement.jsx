import React, { useState, useEffect } from 'react';
import { 
  School, 
  Search, 
  Filter, 
  Eye, 
  UserPlus, 
  X, 
  Sparkles,
  Trash2,
  Edit,
  Loader2,
  FileSpreadsheet,
  Upload,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lock,
  EyeOff,
  RefreshCw,
  Users,
  GraduationCap,
  UserMinus,
  FileText,
  UserCheck2,
  FileCode2
} from 'lucide-react';
import { read, utils } from 'xlsx';

import { guideService } from '../../services/guideService';
import { especialidadService } from '../../services/especialidadService';
import { studentService } from '../../services/studentService';

// IMPORTACIÓN DE COMPONENTES DE FICHAS Y ACTAS DE CADA AÑO
import { ActaConformacion1erAno } from "./fichas/1año/ActaConformacion1erAno";
import { FichaF1_1erAno } from "./fichas/1año/FichaF1_1erAno";
import { FichaF2_1erAno } from "./fichas/1año/FichaF2_1erAno";
import { FichaF3_1erAno } from "./fichas/1año/FichaF3_1erAno";
import { FichaF4_1erAno } from "./fichas/1año/FichaF4_1erAno";
import { FichaF5_1erAno } from "./fichas/1año/FichaF5_1erAno";
import { Centralizador1erAno } from "./fichas/1año/Centralizador1erAno";

import { ActaInicio2doAno } from "./fichas/2año/ActaInicio2doAno";
import { ActaConformacion2doAno } from "./fichas/2año/ActaConformacion2doAno";
import { FichaF1_2doAno } from "./fichas/2año/FichaF1_2doAno";
import { FichaF2_2doAno } from "./fichas/2año/FichaF2_2doAno";
import { FichaF3_2doAno } from "./fichas/2año/FichaF3_2doAno";
import { FichaF4_2doAno } from "./fichas/2año/FichaF4_2doAno";
import { FichaF5_2doAno } from "./fichas/2año/FichaF5_2doAno";
import { FichaF6_2doAno } from "./fichas/2año/FichaF6_2doAno";
import { Centralizador2doAno } from "./fichas/2año/Centralizador2doAno";

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

// DICCIONARIO COMPLETO DE FORMULARIOS MAPEADOS A CÓDIGOS DE ESTUDIANTES
const CATALAGO_FORMULARIOS_MAP = {
  acta_conformacion_equipo: { codigo: "1_ACTA_EQUIPO", nombre: "Acta de Conformación del Equipo Comunitario", ano: "1er Año" },
  ficha_f1_elaboracion_instrumentos: { codigo: "1_F1", nombre: "Ficha F-1: Elaboración y Validación de Instrumentos", ano: "1er Año" },
  ficha_f2_control_asistencia: { codigo: "1_F2", nombre: "Ficha F-2: Control de Asistencia PEC (Días detallados)", ano: "1er Año" },
  ficha_f3_aplicacion_tecnicas: { codigo: "1_F3", nombre: "Ficha F-3: Aplicación de Técnicas e Instrumentos", ano: "1er Año" },
  ficha_f4_seguimiento_docente_director: { codigo: "1_F4", nombre: "Ficha F-4: Seguimiento del Docente Guía y Director", ano: "1er Año" },
  ficha_f5_valoracion_conocimientos: { codigo: "1_F5", nombre: "Ficha F-5: Valoración de la Producción de Conocimientos", ano: "1er Año" },
  cuadro_centralizador_1ro: { codigo: "CENTRALIZADOR", nombre: "Cuadro Centralizador de Evaluación 1er Año", ano: "1er Año" },

  acta_inicio_2do: { codigo: "2_ACTA_INICIO", nombre: "Acta de Inicio - 2do Año (IEPC-PEC)", ano: "2do Año" },
  acta_conformacion_equipo_2do: { codigo: "2_ACTA_EQUIPO", nombre: "Acta de Conformación de Equipo Comunitario", ano: "2do Año" },
  ficha_f1_coordinacion_gestion: { codigo: "2_F1", nombre: "Ficha F-1: Coordinación y Gestión Comunitaria", ano: "2do Año" },
  ficha_f2_asistencia_2semanas: { codigo: "2_F2", nombre: "Ficha F-2: Asistencia PEC (2 semanas / 10 días)", ano: "2do Año" },
  ficha_f3_tecnicas_instrumentos_2do: { codigo: "2_F3", nombre: "Ficha F-3: Aplicación de Técnicas e Instrumentos", ano: "2do Año" },
  ficha_f4_apoyo_concrecion: { codigo: "2_F4", nombre: "Ficha F-4: Apoyo y Seguimiento Concreción Curricular", ano: "2do Año" },
  ficha_f5_valoracion_docente_esfm: { codigo: "2_F5", nombre: "Ficha F-5: Valoración del Docente Acompañante ESFM", ano: "2do Año" },
  ficha_f6_valoracion_produccion: { codigo: "2_F6", nombre: "Ficha F-6: Valoración de la Producción IEPC-PEC", ano: "2do Año" },
  centralizador_2do: { codigo: "CENTRALIZADOR", nombre: "Centralizador de Evaluación 2º Año", ano: "2do Año" },

  acta_conformacion_compromiso: { codigo: "3_ACTA_EQUIPO", nombre: "Acta de Conformación y Compromiso de Equipo", ano: "3er Año" },
  acta_inicio_3ro: { codigo: "3_ACTA_INICIO", nombre: "Acta de Inicio - 3er Año", ano: "3er Año" },
  acta_socializacion_diagnostico: { codigo: "3_ACTA_SOCIALIZACION", nombre: "Acta de Socialización del Diagnóstico", ano: "3er Año" },
  ficha_a1_tecnicas_investigacion: { codigo: "3_A1", nombre: "Ficha A-1: Técnicas e Instrumentos de Investigación", ano: "3er Año" },
  ficha_b1_apoyo_seguimiento_docente: { codigo: "3_B1", nombre: "Ficha B-1: Apoyo y Seguimiento Docente Acompañante", ano: "3er Año" },
  ficha_b2_asistencia_4semanas: { codigo: "3_B2", nombre: "Ficha B-2: Asistencia PEC (4 semanas)", ano: "3er Año" },
  ficha_b3_apoyo_docente_guia: { codigo: "3_B3", nombre: "Ficha B-3: Apoyo Docente Guía Concreción Curricular", ano: "3er Año" },
  ficha_b4_seguimiento_docente_tutor: { codigo: "3_B4", nombre: "Ficha B-4: Seguimiento y Apoyo Docente Tutor", ano: "3er Año" },
  ficha_b5_presentacion_informe: { codigo: "3_B5", nombre: "Ficha B-5: Presentación Informe Diagnóstico Socioparticipativo", ano: "3er Año" },
  centralizador_3ro: { codigo: "CENTRALIZADOR", nombre: "Centralizador de Evaluación 3º Año", ano: "3er Año" },

  ficha_a1_tecnicas_4to: { codigo: "4_A1", nombre: "Ficha A-1: Técnicas e Instrumentos de Investigación", ano: "4to Año" },
  ficha_a2_elaboracion_pdc: { codigo: "4_A2", nombre: "Ficha A-2: Elaboración de PDC (4 a 6 PDC)", ano: "4to Año" },
  ficha_b1_asistencia_6semanas: { codigo: "4_B1", nombre: "Ficha B-1: Control de Asistencia PEC (6 semanas)", ano: "4to Año" },
  ficha_b2_concrecion_pdc: { codigo: "4_B2", nombre: "Ficha B-2: Concreción Curricular - Desarrollo del PDC", ano: "4to Año" },
  ficha_b3_valoracion_clase: { codigo: "4_B3", nombre: "Ficha B-3: Valoración de la Clase Comunitaria", ano: "4to Año" },
  ficha_b4_centralizador_concrecion: { codigo: "4_B4", nombre: "Ficha B-4: Centralizador Concreción Curricular", ano: "4to Año" },
  ficha_b5_seguimiento_docente_guia: { codigo: "4_B5", nombre: "Ficha B-5: Seguimiento y Apoyo de la/el Docente Guía", ano: "4to Año" },
  ficha_b6_seguimiento_tutor_acompanante: { codigo: "4_B6", nombre: "Ficha B-6: Seguimiento y Apoyo Docente Tutor Acompañante", ano: "4to Año" },
  ficha_b7_diagnostico_ue_cea_cee: { codigo: "4_B7", nombre: "Ficha B-7: Diagnóstico Socioparticipativo de la UE/CEA/CEE", ano: "4to Año" },
  ficha_c1_evaluacion_diseno_metodologico: { codigo: "4_C1", nombre: "Ficha C-1: Evaluación Documento de Diseño Metodológico", ano: "4to Año" },
  ficha_c2_socializacion_diseno: { codigo: "4_C2", nombre: "Ficha C-2: Socialización del Diseño Metodológico", ano: "4to Año" },
  acta_final_evaluacion_diseno: { codigo: "4_ACTA_FINAL", nombre: "Acta Final de Evaluación del Diseño Metodológico", ano: "4to Año" },
  acta_postergacion_socializacion: { codigo: "4_ACTA_POSTERGACION", nombre: "Acta de Postergación de la Socialización Oral", ano: "4to Año" },
  ficha_centralizadora_4to: { codigo: "CENTRALIZADOR", nombre: "Ficha Centralizadora de Evaluación 4to Año", ano: "4to Año" },

  ficha_a1_planificacion_pdc: { codigo: "5_A1", nombre: "Ficha A-1: Planificación y Elaboración de PDC", ano: "5to Año" },
  ficha_b1_asistencia_10semanas: { codigo: "5_B1", nombre: "Ficha B-1: Control de Asistencia PEC (10 Semanas)", ano: "5to Año" },
  ficha_b2_aplicacion_pdc: { codigo: "5_B2", nombre: "Ficha B-2: Concreción Curricular - Aplicación del PDC", ano: "5to Año" },
  ficha_b3_valoracion_clase_5to: { codigo: "5_B3", nombre: "Ficha B-3: Valoración de la Clase Comunitaria", ano: "5to Año" },
  ficha_b4_centralizador_desarrollo_pdc: { codigo: "5_B4", nombre: "Ficha B-4: Centralizador de Desarrollo de PDC", ano: "5to Año" },
  ficha_b5_centralizador_seguimiento_guia: { codigo: "5_B5", nombre: "Ficha B-5: Centralizador Seguimiento y Apoyo del Docente Guía", ano: "5to Año" },
  ficha_b6_apoyo_tutor_acompanante: { codigo: "5_B6", nombre: "Ficha B-6: Apoyo y Seguimiento Docente Tutor Acompañante", ano: "5to Año" },
  ficha_c1_evaluacion_trabajo_grado: { codigo: "5_C1", nombre: "Ficha C-1: Evaluación del Documento de Trabajo de Grado", ano: "5to Año" },
  ficha_c2_socializacion_trabajo_grado: { codigo: "5_C2", nombre: "Ficha C-2: Socialización del Trabajo de Grado", ano: "5to Año" },
  acta_postergacion_trabajo_grado: { codigo: "5_ACTA_POSTERGACION", nombre: "Acta de Postergación de la Socialización de Trabajo de Grado", ano: "5to Año" },
  ficha_centralizadora_5to: { codigo: "CENTRALIZADOR", nombre: "Ficha Centralizadora Cualitativa-Cuantitativa (5to Año)", ano: "5to Año" }
};

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

// CATÁLOGO DE FORMULARIOS POR AÑO DE FORMACIÓN
const FORMULARIOS_POR_ANO = {
  '1RO A': [
    { key: 'acta_conformacion_equipo', nombre: 'Acta de Conformación del Equipo Comunitario' },
    { key: 'ficha_f1_elaboracion_instrumentos', nombre: 'Ficha F-1: Elaboración y Validación de Instrumentos' },
    { key: 'ficha_f2_control_asistencia', nombre: 'Ficha F-2: Control de Asistencia PEC (Días detallados)' },
    { key: 'ficha_f3_aplicacion_tecnicas', nombre: 'Ficha F-3: Aplicación de Técnicas e Instrumentos' },
    { key: 'ficha_f4_seguimiento_docente_director', nombre: 'Ficha F-4: Seguimiento del Docente Guía y Director' },
    { key: 'ficha_f5_valoracion_conocimientos', nombre: 'Ficha F-5: Valoración de la Producción de Conocimientos' },
    { key: 'cuadro_centralizador_1ro', nombre: 'Cuadro Centralizador de Evaluación 1er Año' }
  ],
  '2DO A': [
    { key: 'acta_inicio_2do', nombre: 'Acta de Inicio - 2do Año (IEPC-PEC)' },
    { key: 'acta_conformacion_equipo_2do', nombre: 'Acta de Conformación de Equipo Comunitario' },
    { key: 'ficha_f1_coordinacion_gestion', nombre: 'Ficha F-1: Coordinación y Gestión Comunitaria' },
    { key: 'ficha_f2_asistencia_2semanas', nombre: 'Ficha F-2: Asistencia PEC (2 semanas / 10 días)' },
    { key: 'ficha_f3_tecnicas_instrumentos_2do', nombre: 'Ficha F-3: Aplicación de Técnicas e Instrumentos' },
    { key: 'ficha_f4_apoyo_concrecion', nombre: 'Ficha F-4: Apoyo y Seguimiento Concreción Curricular' },
    { key: 'ficha_f5_valoracion_docente_esfm', nombre: 'Ficha F-5: Valoración del Docente Acompañante ESFM' },
    { key: 'ficha_f6_valoracion_produccion', nombre: 'Ficha F-6: Valoración de la Producción IEPC-PEC' },
    { key: 'centralizador_2do', nombre: 'Centralizador de Evaluación 2º Año' }
  ],
  '3RO A': [
    { key: 'acta_conformacion_compromiso', nombre: 'Acta de Conformación y Compromiso de Equipo' },
    { key: 'acta_inicio_3ro', nombre: 'Acta de Inicio - 3er Año' },
    { key: 'acta_socializacion_diagnostico', nombre: 'Acta de Socialización del Diagnóstico' },
    { key: 'ficha_a1_tecnicas_investigacion', nombre: 'Ficha A-1: Técnicas e Instrumentos de Investigación' },
    { key: 'ficha_b1_apoyo_seguimiento_docente', nombre: 'Ficha B-1: Apoyo y Seguimiento Docente Acompañante' },
    { key: 'ficha_b2_asistencia_4semanas', nombre: 'Ficha B-2: Asistencia PEC (4 semanas)' },
    { key: 'ficha_b3_apoyo_docente_guia', nombre: 'Ficha B-3: Apoyo Docente Guía Concreción Curricular' },
    { key: 'ficha_b4_seguimiento_docente_tutor', nombre: 'Ficha B-4: Seguimiento y Apoyo Docente Tutor' },
    { key: 'ficha_b5_presentacion_informe', nombre: 'Ficha B-5: Presentación Informe Diagnóstico Socioparticipativo' },
    { key: 'centralizador_3ro', nombre: 'Centralizador de Evaluación 3º Año' }
  ],
  '4TO A': [
    { key: 'ficha_a1_tecnicas_4to', nombre: 'Ficha A-1: Técnicas e Instrumentos de Investigación' },
    { key: 'ficha_a2_elaboracion_pdc', nombre: 'Ficha A-2: Elaboración de PDC (4 a 6 PDC)' },
    { key: 'ficha_b1_asistencia_6semanas', nombre: 'Ficha B-1: Control de Asistencia PEC (6 semanas)' },
    { key: 'ficha_b2_concrecion_pdc', nombre: 'Ficha B-2: Concreción Curricular - Desarrollo del PDC' },
    { key: 'ficha_b3_valoracion_clase', nombre: 'Ficha B-3: Valoración de la Clase Comunitaria' },
    { key: 'ficha_b4_centralizador_concrecion', nombre: 'Ficha B-4: Centralizador Concreción Curricular' },
    { key: 'ficha_b5_seguimiento_docente_guia', nombre: 'Ficha B-5: Seguimiento y Apoyo de la/el Docente Guía' },
    { key: 'ficha_b6_seguimiento_tutor_acompanante', nombre: 'Ficha B-6: Seguimiento y Apoyo Docente Tutor Acompañante' },
    { key: 'ficha_b7_diagnostico_ue_cea_cee', nombre: 'Ficha B-7: Diagnóstico Socioparticipativo de la UE/CEA/CEE' },
    { key: 'ficha_c1_evaluacion_diseno_metodologico', nombre: 'Ficha C-1: Evaluación Documento de Diseño Metodológico' },
    { key: 'ficha_c2_socializacion_diseno', nombre: 'Ficha C-2: Socialización del Diseño Metodológico' },
    { key: 'acta_final_evaluacion_diseno', nombre: 'Acta Final de Evaluación del Diseño Metodológico' },
    { key: 'acta_postergacion_socializacion', nombre: 'Acta de Postergación de la Socialización Oral' },
    { key: 'ficha_centralizadora_4to', nombre: 'Ficha Centralizadora de Evaluación 4to Año' }
  ],
  '5TO A': [
    { key: 'ficha_a1_planificacion_pdc', nombre: 'Ficha A-1: Planificación y Elaboración de PDC' },
    { key: 'ficha_b1_asistencia_10semanas', nombre: 'Ficha B-1: Control de Asistencia PEC (10 Semanas)' },
    { key: 'ficha_b2_aplicacion_pdc', nombre: 'Ficha B-2: Concreción Curricular - Aplicación del PDC' },
    { key: 'ficha_b3_valoracion_clase_5to', nombre: 'Ficha B-3: Valoración de la Clase Comunitaria' },
    { key: 'ficha_b4_centralizador_desarrollo_pdc', nombre: 'Ficha B-4: Centralizador de Desarrollo de PDC' },
    { key: 'ficha_b5_centralizador_seguimiento_guia', nombre: 'Ficha B-5: Centralizador Seguimiento y Apoyo del Docente Guía' },
    { key: 'ficha_b6_apoyo_tutor_acompanante', nombre: 'Ficha B-6: Apoyo y Seguimiento Docente Tutor Acompañante' },
    { key: 'ficha_c1_evaluacion_trabajo_grado', nombre: 'Ficha C-1: Evaluación del Documento de Trabajo de Grado' },
    { key: 'ficha_c2_socializacion_trabajo_grado', nombre: 'Ficha C-2: Socialización del Trabajo de Grado' },
    { key: 'acta_postergacion_trabajo_grado', nombre: 'Acta de Postergación de la Socialización de Trabajo de Grado' },
    { key: 'ficha_centralizadora_5to', nombre: 'Ficha Centralizadora Cualitativa-Cuantitativa (5to Año)' }
  ]
};

export const DocentesGuiaManagement = () => {
  const [docentesGuia, setDocentesGuia] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Selección múltiple para eliminación masiva
  const [selectedIds, setSelectedIds] = useState([]);

  // Filtros generales
  const [searchTerm, setSearchTerm] = useState('');
  const [especialidadFilter, setEspecialidadFilter] = useState('');

  // Modales
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showNewGuideModal, setShowNewGuideModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Estados para asignación de estudiantes
  const [estudiantesAsignados, setEstudiantesAsignados] = useState([]);
  const [todosEstudiantes, setTodosEstudiantes] = useState([]);
  const [selectedEstudianteObject, setSelectedEstudianteObject] = useState(null);
  const [assignSearchTerm, setAssignSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);

  // Panel de formularios habilitados
  const [showFormulariosPanel, setShowFormulariosPanel] = useState(false);
  const [selectedAnoFormacion, setSelectedAnoFormacion] = useState('1RO A');

  // ESTADOS PARA REVISIÓN / APERTURA DE FORMULARIO ACTIVO
  const [selectedEstudianteVista, setSelectedEstudianteVista] = useState(null);
  const [activeFicha, setActiveFicha] = useState(null);
  const [fichaData, setFichaData] = useState({});

  // Modal Confirmación de Eliminación
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [guideToDeleteId, setGuideToDeleteId] = useState(null);

  // Modal Feedback / Notificación
  const [feedbackModal, setFeedbackModal] = useState({
    show: false,
    title: '',
    message: '',
    type: 'success'
  });

  // Formulario Manual
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    password: '',
    nombres: '',
    apellidos: '',
    ci: '',
    telefono: '',
    esfm_ua: 'U.E. Franz Tamayo',
    especialidad: '',
    item_docente: ''
  });

  // Carga Masiva Excel
  const [excelFile, setExcelFile] = useState(null);
  const [parsedDocentes, setParsedDocentes] = useState([]);

  const showFeedback = (title, message, type = 'success') => {
    setFeedbackModal({ show: true, title, message, type });
  };

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const [dataGuides, dataEspec] = await Promise.all([
        guideService.getGuides(),
        especialidadService.getEspecialidades()
      ]);
      setDocentesGuia(dataGuides);
      setEspecialidades(Array.isArray(dataEspec) ? dataEspec : dataEspec?.especialidades || []);
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

  const loadEstudiantesData = async (docenteId) => {
    setLoadingEstudiantes(true);
    try {
      const [assigned, total] = await Promise.all([
        guideService.getAssignedStudents(docenteId),
        studentService.getStudents()
      ]);
      setEstudiantesAsignados(assigned);
      setTodosEstudiantes(Array.isArray(total) ? total : []);
      if (assigned.length > 0 && !selectedEstudianteVista) {
        setSelectedEstudianteVista(assigned[0]);
      }
    } catch (err) {
      console.error("Error al cargar estudiantes:", err);
    } finally {
      setLoadingEstudiantes(false);
    }
  };

  const openAdminModal = (docente) => {
    setSelectedDocente(docente);
    setAssignSearchTerm('');
    setSelectedEstudianteObject(null);
    setShowSearchResults(false);
    setShowFormulariosPanel(false);
    setSelectedAnoFormacion('1RO A');
    setSelectedEstudianteVista(null);
    setActiveFicha(null);
    setShowModal(true);
    loadEstudiantesData(docente.id);
  };

  const handleAssignStudent = async () => {
    if (!selectedEstudianteObject || !selectedDocente) return;
    try {
      await guideService.assignStudent(selectedDocente.id, selectedEstudianteObject.id);
      showFeedback('Asignación Exitosa', 'El estudiante fue asignado al docente guía correctamente.', 'success');
      setSelectedEstudianteObject(null);
      setAssignSearchTerm('');
      setShowSearchResults(false);
      loadEstudiantesData(selectedDocente.id);
      fetchGuides();
    } catch (err) {
      showFeedback('Error al Asignar', err.message || 'No se pudo realizar la asignación.', 'error');
    }
  };

  const handleUnassignStudent = async (estudianteId) => {
    if (!selectedDocente) return;
    try {
      await guideService.unassignStudent(selectedDocente.id, estudianteId);
      showFeedback('Asignación Revocada', 'Se removió la asignación del estudiante.', 'success');
      loadEstudiantesData(selectedDocente.id);
      fetchGuides();
    } catch (err) {
      showFeedback('Error al Desasignar', err.message || 'No se pudo revocar la asignación.', 'error');
    }
  };

  const handleToggleFormularioGuide = async (formularioKey, currentState) => {
    if (!selectedDocente) return;
    try {
      const newState = !currentState;
      await guideService.toggleFormularioGuide(selectedDocente.id, formularioKey, newState);
      
      const updatedFormularios = {
        ...(selectedDocente.formularios_habilitados || {}),
        [formularioKey]: newState
      };

      setSelectedDocente({
        ...selectedDocente,
        formularios_habilitados: updatedFormularios
      });

      setDocentesGuia(prev => prev.map(doc => {
        if (doc.id === selectedDocente.id) {
          return { ...doc, formularios_habilitados: updatedFormularios };
        }
        return doc;
      }));
    } catch (err) {
      showFeedback('Error', err.message || 'No se pudo cambiar el permiso del formulario.', 'error');
    }
  };

  // APERTURA DE FORMULARIO ACTIVO PARA VER SUS DATOS
  const handleOpenFichaActiva = async (itemFormulario) => {
    if (!selectedEstudianteVista) {
      showFeedback('Seleccione un Estudiante', 'Debe seleccionar un estudiante asignado para consultar sus registros.', 'error');
      return;
    }

    setActiveFicha(itemFormulario);
    setActionLoading(true);

    try {
      const res = await studentService.getFicha(selectedEstudianteVista.id, itemFormulario.codigo);
      setFichaData(res.datos || {});
    } catch (err) {
      setFichaData({});
    } finally {
      setActionLoading(false);
    }
  };

  // OBTENER COMPONENTE EXPLÍCITO BUSCANDO POR AÑO DE FORMACIÓN CON NORMALIZACIÓN
  const getComponenteExplicitoDocente = () => {
    if (!activeFicha || !selectedEstudianteVista) return null;
    const ano = (selectedEstudianteVista.ano_formacion || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

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

  const ComponenteExplicitoDocente = getComponenteExplicitoDocente();

  // FILTRAR SOLO LOS FORMULARIOS ACTIVOS DEL DOCENTE GUÍA
  const obtenerFormulariosActivosDelDocente = () => {
    if (!selectedDocente || !selectedDocente.formularios_habilitados) return [];
    
    return Object.entries(selectedDocente.formularios_habilitados)
      .filter(([key, isEnabled]) => isEnabled === true && CATALAGO_FORMULARIOS_MAP[key])
      .map(([key]) => ({
        key,
        ...CATALAGO_FORMULARIOS_MAP[key]
      }));
  };

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

  const confirmSingleDelete = (id) => {
    setGuideToDeleteId(id);
    setDeleteTarget('single');
    setShowDeleteConfirmModal(true);
  };

  const confirmBatchDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteTarget('batch');
    setShowDeleteConfirmModal(true);
  };

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
      especialidad: docente.especialidad || (especialidades[0]?.nombre || ''),
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
      especialidad: especialidades[0]?.nombre || '',
      item_docente: ''
    });
  };

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
          rol: 'DOCENTE_GUIA',
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

  // Filtrado dinámico en tiempo real para asignación de estudiantes practicantes
  const estudiantesDisponiblesFiltrados = todosEstudiantes
    .filter(est => !estudiantesAsignados.some(asig => asig.id === est.id))
    .filter(est => {
      if (!assignSearchTerm.trim()) return false;
      const search = assignSearchTerm.toLowerCase();
      const fullName = `${est.nombre || ''} ${est.apellido || ''}`.toLowerCase();
      const ci = String(est.ci || '').toLowerCase();
      return fullName.includes(search) || ci.includes(search);
    });

  const formulariosActivosDocente = obtenerFormulariosActivosDelDocente();

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
            {especialidades.map((esp) => (
              <option key={esp.id || esp.nombre} value={esp.nombre || esp.especialidad}>
                {esp.nombre || esp.especialidad}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLA DE DOCENTES GUÍA */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] border-b border-slate-200 text-[#475569] font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5 w-12 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredDocentes.length > 0 && selectedIds.length === filteredDocentes.length}
                    className="h-4 w-4 rounded border-slate-300 text-[#801B28] focus:ring-[#801B28] cursor-pointer"
                  />
                </th>
                <th className="py-4 px-5 tracking-widest text-[11px]">DOCENTE</th>
                <th className="py-4 px-5 tracking-widest text-[11px]">C.I.</th>
                <th className="py-4 px-5 tracking-widest text-[11px]">ESPECIALIDAD</th>
                <th className="py-4 px-5 text-center tracking-widest text-[11px]">ESTUDIANTES ASIGNADOS</th>
                <th className="py-4 px-5 text-center tracking-widest text-[11px]">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 font-bold">
                    <Loader2 className="animate-spin inline-block mr-2 text-[#8C731A]" size={20} />
                    Cargando docentes guía desde la base de datos...
                  </td>
                </tr>
              ) : filteredDocentes.length > 0 ? (
                filteredDocentes.map((docente) => {
                  const isSelected = selectedIds.includes(docente.id);
                  return (
                    <tr key={docente.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-rose-50/40' : ''}`}>
                      <td className="py-4 px-5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(docente.id)}
                          className="h-4 w-4 rounded border-slate-300 text-[#801B28] focus:ring-[#801B28] cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 text-[13px]">{`${docente.nombre} ${docente.apellido}`}</div>
                        <div className="text-[11px] font-mono text-[#a32d3d] mt-0.5">{docente.username}</div>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-slate-800 text-[12px]">{docente.ci}</td>
                      <td className="py-4 px-5 font-bold text-slate-800 text-[12px]">
                        {docente.especialidad || 'Sin Asignar'}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#fffbeb] text-[#a16207] font-black text-[12px] border border-[#fde68a]">
                          {docente.estudiantes_asignados_count || 0} Estudiantes
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openAdminModal(docente)}
                            title="Ver / Asignar Estudiantes / Habilitar Formularios"
                            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openEditModal(docente)}
                            title="Editar Datos"
                            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => confirmSingleDelete(docente.id)}
                            title="Eliminar"
                            className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 hover:bg-rose-100 transition-all cursor-pointer"
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
                    No se encontraron docentes guía registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL GESTIÓN DEL DOCENTE GUÍA (ASIGNACIÓN CON BÚSQUEDA AUTOCOMPLETE + FORMULARIOS HABILITADOS) */}
      {showModal && selectedDocente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* ENCABEZADO Y BOTÓN "HABILITAR FORMULARIOS" */}
            <div className="border-b border-slate-200 pb-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#8C731A]">
                  DOCENTE GUÍA DE UNIDAD EDUCATIVA
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  {`${selectedDocente.nombre} ${selectedDocente.apellido}`}
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  C.I.: {selectedDocente.ci} | U.E.: {selectedDocente.esfm_ua || 'Sin Asignar'}
                </p>
              </div>

              <button
                onClick={() => setShowFormulariosPanel(!showFormulariosPanel)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs border transition-all cursor-pointer ${
                  showFormulariosPanel 
                    ? 'bg-[#801B28] text-white border-[#801B28] shadow-md' 
                    : 'bg-amber-50 text-[#8C731A] border-amber-300 hover:bg-amber-100'
                }`}
              >
                <FileText size={16} />
                {showFormulariosPanel ? 'Ocultar Formularios' : 'Habilitar Formularios'}
              </button>
            </div>

            {/* SECCIÓN 1: FORMULARIOS HABILITADOS ACTUALMENTE PARA ESTE DOCENTE GUÍA */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <FileCode2 size={18} className="text-[#801B28]" />
                  <span className="font-extrabold text-slate-900 text-xs uppercase">
                    Formularios Activos del Docente ({formulariosActivosDocente.length})
                  </span>
                </div>

                {/* SELECTOR DEL ESTUDIANTE A CONSULTAR */}
                {estudiantesAsignados.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold text-slate-500">Estudiante:</span>
                    <select
                      value={selectedEstudianteVista ? selectedEstudianteVista.id : ''}
                      onChange={(e) => {
                        const est = estudiantesAsignados.find(s => s.id === e.target.value);
                        setSelectedEstudianteVista(est || null);
                      }}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none cursor-pointer"
                    >
                      {estudiantesAsignados.map(est => (
                        <option key={est.id} value={est.id}>
                          {est.apellido} {est.nombre} ({est.ano_formacion || 'S/A'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {formulariosActivosDocente.length > 0 ? (
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white overflow-hidden">
                  {formulariosActivosDocente.map((item) => (
                    <div key={item.key} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                      <div>
                        <span className="font-bold text-slate-800 block">{item.nombre}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{item.ano}</span>
                      </div>
                      <button
                        onClick={() => handleOpenFichaActiva(item)}
                        disabled={!selectedEstudianteVista}
                        className="px-3 py-1.5 bg-[#801B28] text-white font-extrabold text-[11px] rounded-xl hover:bg-[#a32334] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      >
                        Abrir / Evaluar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-400 font-medium text-xs border border-dashed border-slate-200 rounded-xl">
                  Este docente guía no tiene formularios activos asignados actualmente.
                </div>
              )}
            </div>

            {/* PANEL DE CONTROL DE FORMULARIOS DEL DOCENTE GUÍA */}
            {showFormulariosPanel && (
              <div className="rounded-3xl border border-amber-200 bg-amber-50/40 p-5 mb-6 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <FileText size={18} className="text-[#8C731A]" />
                      FORMULARIOS DISPONIBLES PARA EL DOCENTE GUÍA
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ACTIVE EL SWITCH PARA HABILITAR EL LLENADO AL DOCENTE GUÍA
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-amber-200">
                    {Object.keys(FORMULARIOS_POR_ANO).map((ano) => (
                      <button
                        key={ano}
                        onClick={() => setSelectedAnoFormacion(ano)}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all cursor-pointer ${
                          selectedAnoFormacion === ano
                            ? 'bg-[#801B28] text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {ano}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {(FORMULARIOS_POR_ANO[selectedAnoFormacion] || []).map((form) => {
                    const isEnabled = !!(selectedDocente.formularios_habilitados && selectedDocente.formularios_habilitados[form.key]);

                    return (
                      <div 
                        key={form.key} 
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                          isEnabled ? 'bg-emerald-50/80 border-emerald-300 shadow-sm' : 'bg-white border-slate-200'
                        }`}
                      >
                        <span className="font-semibold text-slate-800 text-xs max-w-[75%] leading-tight">
                          {form.nombre}
                        </span>

                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => handleToggleFormularioGuide(form.key, isEnabled)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* BUSCADOR EN TIEMPO REAL AUTOCOMPLETE DE ESTUDIANTES */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 mb-6 space-y-3">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#8C731A]" />
                <span className="font-extrabold text-amber-900 text-xs uppercase">Asignar Estudiante Practicante</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start">
                
                <div className="relative sm:col-span-10">
                  <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Escriba un nombre, apellido o C.I. para ver coincidencias..."
                    value={assignSearchTerm}
                    onChange={(e) => {
                      setAssignSearchTerm(e.target.value);
                      setSelectedEstudianteObject(null);
                      setShowSearchResults(true);
                    }}
                    onFocus={() => {
                      if (assignSearchTerm.trim()) setShowSearchResults(true);
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-8 py-2.5 text-xs font-medium text-slate-800 focus:border-[#8C731A] focus:outline-none shadow-sm"
                  />

                  {assignSearchTerm && (
                    <button
                      onClick={() => {
                        setAssignSearchTerm('');
                        setSelectedEstudianteObject(null);
                        setShowSearchResults(false);
                      }}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  )}

                  {/* ESTUDIANTE SELECCIONADO */}
                  {selectedEstudianteObject && (
                    <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <UserCheck2 size={16} className="text-emerald-700" />
                        <span className="font-bold text-emerald-900">
                          {selectedEstudianteObject.apellido} {selectedEstudianteObject.nombre}
                        </span>
                        <span className="text-emerald-700 font-mono">CI: {selectedEstudianteObject.ci}</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-800 font-extrabold text-[10px]">
                          {selectedEstudianteObject.ano_formacion || 'S/A'}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedEstudianteObject(null)}
                        className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
                      >
                        Cambiar
                      </button>
                    </div>
                  )}

                  {/* MENÚ DESPLEGABLE FLOTANTE */}
                  {showSearchResults && assignSearchTerm.trim() !== '' && !selectedEstudianteObject && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100">
                      {estudiantesDisponiblesFiltrados.length > 0 ? (
                        estudiantesDisponiblesFiltrados.map((est) => (
                          <div
                            key={est.id}
                            onClick={() => {
                              setSelectedEstudianteObject(est);
                              setAssignSearchTerm(`${est.apellido} ${est.nombre}`);
                              setShowSearchResults(false);
                            }}
                            className="p-3 hover:bg-amber-50/80 cursor-pointer transition-colors flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-900">{est.apellido} {est.nombre}</div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                C.I.: {est.ci} | Especialidad: {est.especialidad || 'General'}
                              </div>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-700">
                              {est.ano_formacion || 'Sin Año'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-slate-400 font-semibold text-xs">
                          No se encontraron estudiantes coincidentes con "{assignSearchTerm}"
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <button
                    onClick={handleAssignStudent}
                    disabled={!selectedEstudianteObject}
                    className="w-full h-10 bg-[#801B28] text-white font-extrabold text-xs rounded-xl hover:bg-rose-900 transition-all cursor-pointer disabled:opacity-50 shrink-0 flex items-center justify-center gap-1"
                  >
                    + Asignar
                  </button>
                </div>
              </div>
            </div>

            {/* TABLA DE ESTUDIANTES ASIGNADOS */}
            <div className="space-y-3 text-xs">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                <GraduationCap size={18} className="text-[#801B28]" />
                Estudiantes Asignados ({estudiantesAsignados.length})
              </h3>

              {loadingEstudiantes ? (
                <div className="p-8 text-center text-slate-500 font-bold">
                  <Loader2 size={20} className="animate-spin inline mr-2 text-[#801B28]" /> Cargando estudiantes asignados...
                </div>
              ) : estudiantesAsignados.length > 0 ? (
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Estudiante</th>
                          <th className="py-3 px-4">C.I.</th>
                          <th className="py-3 px-4">Año de Formación</th>
                          <th className="py-3 px-4">Especialidad</th>
                          <th className="py-3 px-4 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {estudiantesAsignados.map((est) => (
                          <tr key={est.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900">
                              {est.nombre} {est.apellido}
                            </td>
                            <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                              {est.ci}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                                {est.ano_formacion || 'Sin Año'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {est.especialidad || 'General'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleUnassignStudent(est.id)}
                                title="Quitar Asignación"
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-600 hover:text-white transition-all text-[11px] cursor-pointer"
                              >
                                <UserMinus size={14} /> Quitar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 font-medium border border-dashed border-slate-200 rounded-2xl">
                  Este docente guía no tiene estudiantes asignados.
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDERIZADO DIRECTO Y ÚNICO DEL COMPONENTE EXPLÍCITO DE LA FICHA */}
      {activeFicha && selectedEstudianteVista && ComponenteExplicitoDocente && (
        <ComponenteExplicitoDocente
          isOpen={Boolean(activeFicha)}
          onClose={() => setActiveFicha(null)}
          fichaData={fichaData}
          setFichaData={setFichaData}
          listaDocentes={docentesGuia}
          estudianteSeleccionado={selectedEstudianteVista}
        />
      )}

      {/* MODAL REGISTRAR / EDITAR DOCENTE GUÍA */}
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

            <form onSubmit={handleSubmitGuide} className="space-y-4 text-xs mt-4">
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

                <div className="sm:col-span-2 rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-[#801B28] flex items-center gap-1.5">
                      <Lock size={14} /> Credenciales
                    </span>
                    <button
                      type="button"
                      onClick={handleRegenerateCredentials}
                      className="text-[10px] font-bold text-[#8C731A] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} /> Regenerar
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
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-700 mb-1">
                        {isEditing ? 'Nueva Contraseña' : 'Contraseña *'}
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showPassword ? "text" : "password"}
                          required={!isEditing}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-white pl-3 pr-10 py-2 font-mono font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 text-slate-400 cursor-pointer"
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
                  <select
                    required
                    value={formData.especialidad}
                    onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-800 focus:border-[#8C731A] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="">-- Seleccionar --</option>
                    {especialidades.map((esp) => (
                      <option key={esp.id || esp.nombre} value={esp.nombre || esp.especialidad}>
                        {esp.nombre || esp.especialidad}
                      </option>
                    ))}
                  </select>
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

      {/* MODAL EXCEL */}
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

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors my-4">
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
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 mb-4 text-xs">
                <span className="font-bold text-slate-800 block mb-2">✓ {parsedDocentes.length} docentes guía detectados</span>
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
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin inline" /> : <FileCheck size={16} className="inline mr-1" />}
                Importar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMACIÓN ELIMINACIÓN */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle size={28} />
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-2">¿Confirmar Eliminación?</h3>

            <div className="flex justify-center gap-3 mt-6">
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

      {/* FEEDBACK */}
      {feedbackModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
              feedbackModal.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {feedbackModal.type === 'success' ? <CheckCircle2 size={30} /> : <AlertCircle size={30} />}
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-1">{feedbackModal.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">{feedbackModal.message}</p>

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