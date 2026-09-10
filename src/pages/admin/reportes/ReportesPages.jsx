import React from 'react';
import { ReporteBaseView } from './ReporteBaseView';

export const ReporteEspecialidad = () => (
  <ReporteBaseView 
    tipo="especialidad"
    titulo="Reporte por Especialidad"
    descripcion="Consolidado de calificaciones y estudiantes filtrados según área académica."
  />
);

export const ReporteEtapa = () => (
  <ReporteBaseView 
    tipo="etapa"
    titulo="Reporte por Etapa"
    descripcion="Seguimiento de notas por cada ficha (F-1 a F-6) y promedios por etapa."
  />
);

export const ReporteGestion = () => (
  <ReporteBaseView 
    tipo="gestion"
    titulo="Reporte por Gestión"
    descripcion="Análisis comparativo de avance entre períodos académicos."
  />
);

export const ReporteEstudiante = () => (
  <ReporteBaseView 
    tipo="estudiante"
    titulo="Reporte por Estudiante"
    descripcion="Ficha consolidada de progreso individual por estudiante."
  />
);