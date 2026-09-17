import React from 'react';
import { ReporteBaseView } from './ReporteBaseView';

export const ReporteEspecialidad = () => (
  <ReporteBaseView 
    tipo="especialidad"
    titulo="Reporte por Especialidad"
    descripcion="Consolidado de calificaciones y asignación de docentes acompañantes filtrados por área académica."
  />
);

export const ReporteEtapa = () => (
  <ReporteBaseView 
    tipo="etapa"
    titulo="Reporte por Etapa"
    descripcion="Evaluación cualitativa y cuantitativa por ficha y promedios finales según el año de formación."
  />
);

export const ReporteGestion = () => (
  <ReporteBaseView 
    tipo="gestion"
    titulo="Reporte por Gestión"
    descripcion="Nómina completa de datos personales y registro de matriculación de estudiantes filtrados por año."
  />
);