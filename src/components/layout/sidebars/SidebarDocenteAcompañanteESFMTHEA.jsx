import React from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  TrendingUp,
  ShieldCheck,
  FileBarChart2,
  User,
  LogOut
} from "lucide-react";
import { SidebarLayoutESFMTHEA } from "../sidebarLayoutESFMTHEA";

// Menú de Navegación del Docente Acompañante
const MENU_ITEMS_DOCENTE_ACOMPANANTE = [
  { 
    name: "Dashboard", 
    link: "/docente-acompanante/dashboard", 
    icon: LayoutDashboard 
  },
  { 
    name: "Mis estudiantes", 
    link: "/docente-acompanante/estudiantes", 
    icon: Users 
  },
  { 
    name: "IEPC-PEC", 
    icon: ClipboardList,
    subItems: [
      { name: "Mis actas", link: "/docente-acompanante/iepc-pec/actas" },
      { name: "Fichas", link: "/docente-acompanante/iepc-pec/fichas" },
      { name: "Centralizadores", link: "/docente-acompanante/iepc-pec/centralizadores" }
    ]
  },
  // { 
  //   name: "Seguimiento", 
  //   link: "/docente-acompanante/seguimiento", 
  //   icon: TrendingUp 
  // },
  { 
    name: "Verificar integridad", 
    link: "/docente-acompanante/verificar-integridad", 
    icon: ShieldCheck 
  },
  { 
    name: "Reportes", 
    link: "/docente-acompanante/reportes", 
    icon: FileBarChart2 
  },
  { 
    name: "Mi cuenta", 
    link: "/docente-acompanante/cuenta", 
    icon: User 
  }
];

export const SidebarDocenteAcompañanteESFMTHEA = () => {
  return (
    <SidebarLayoutESFMTHEA
      menuItems={MENU_ITEMS_DOCENTE_ACOMPANANTE}
      roleTitle="Docente Acompañante"
    />
  );
};

export default SidebarDocenteAcompañanteESFMTHEA;