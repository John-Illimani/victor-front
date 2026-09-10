import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  Blocks,
  BarChart2,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { SidebarLayoutESFMTHEA } from "../sidebarLayoutESFMTHEA";

// Menú dinámico actualizado según la jerarquía de la interfaz
const MENU_ITEMS_ADMIN_IEPC = [
  { 
    name: "Dashboard", 
    link: "/admin/dashboard", 
    icon: LayoutDashboard 
  },
  { 
    name: "Gestión de usuarios", 
    link: "/admin/usuarios", 
    icon: Users 
  },
  {
    name: "Gestión académica",
    icon: GraduationCap,
    subItems: [
      { name: "Estudiantes", link: "/admin/academica/estudiantes" },
      { name: "Docentes acompañantes", link: "/admin/academica/docentes-acompanantes" },
      { name: "Docentes guía", link: "/admin/academica/docentes-guia" },
      { name: "Gestiones", link: "/admin/academica/gestiones" },
      { name: "Años de formación", link: "/admin/academica/anos-formacion" },
      { name: "Especialidades", link: "/admin/academica/especialidades" }
    ]
  },
  {
    name: "Actas IEPC-PEC",
    icon: FileText,
    subItems: [
      {
        name: "Gestión 2025",
        subItems: [
          { name: "1er año", link: "/admin/actas/2025/1" },
          { name: "2do año", link: "/admin/actas/2025/2" },
          { name: "3er año", link: "/admin/actas/2025/3" },
          { name: "4to año", link: "/admin/actas/2025/4" },
          { name: "5to año", link: "/admin/actas/2025/5" }
        ]
      },
      {
        name: "Gestión 2026",
        subItems: [
          { name: "1er año", link: "/admin/actas/2026/1" },
          { name: "2do año", link: "/admin/actas/2026/2" },
          { name: "3er año", link: "/admin/actas/2026/3" },
          { name: "4to año", link: "/admin/actas/2026/4" },
          { name: "5to año", link: "/admin/actas/2026/5" }
        ]
      }
    ]
  },
  { 
    name: "Integridad Blockchain", 
    link: "/admin/blockchain", 
    icon: Blocks 
  },
  {
    name: "Reportes",
    icon: BarChart2,
    subItems: [
      { name: "Por especialidad", link: "/admin/reportes/especialidad" },
      { name: "Por etapa", link: "/admin/reportes/etapa" },
      { name: "Por gestión", link: "/admin/reportes/gestion" },
      { name: "Por estudiante", link: "/admin/reportes/estudiante" }
    ]
  },
  { 
    name: "Configuración", 
    link: "/admin/configuracion", 
    icon: Settings 
  },
  
];

export const SidebarAdminESFMTHEA = () => {
  return (
    <SidebarLayoutESFMTHEA
      menuItems={MENU_ITEMS_ADMIN_IEPC}
      roleTitle="IEPC-PEC"
    />
  );
};