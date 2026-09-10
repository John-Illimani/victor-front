import React from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  TrendingUp,
  Search,
  User
} from "lucide-react";
import { SidebarLayoutESFMTHEA } from "../sidebarLayoutESFMTHEA";

// Menú de Navegación Oficial del Docente Guía (Unidad Educativa)
const MENU_ITEMS_DOCENTE_GUIA = [
  { 
    name: "Dashboard", 
    link: "/docente-guia/dashboard", 
    icon: LayoutDashboard 
  },
  { 
    name: "Mis estudiantes", 
    link: "/docente-guia/estudiantes", 
    icon: Users 
  },
  { 
    name: "Fichas asignadas", 
    link: "/docente-guia/fichas-asignadas", 
    icon: ClipboardCheck 
  },
  { 
    name: "Seguimiento", 
    link: "/docente-guia/seguimiento", 
    icon: TrendingUp 
  },
  { 
    name: "Consultas", 
    link: "/docente-guia/consultas", 
    icon: Search 
  },
  { 
    name: "Mi cuenta", 
    link: "/docente-guia/cuenta", 
    icon: User 
  }
];

export const SidebarDocenteGuiaESFMTHEA = () => {
  return (
    <SidebarLayoutESFMTHEA
      menuItems={MENU_ITEMS_DOCENTE_GUIA}
      roleTitle="Docente Guía (U.E.)"
    />
  );
};

export default SidebarDocenteGuiaESFMTHEA;