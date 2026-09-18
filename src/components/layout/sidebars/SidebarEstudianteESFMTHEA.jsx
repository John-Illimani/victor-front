import React from "react";
import {
  LayoutDashboard,
  FileCheck2,
  FolderOpen,
  Award,
  FileDown,
  ShieldCheck,
  User
} from "lucide-react";
import { SidebarLayoutESFMTHEA } from "../sidebarLayoutESFMTHEA";

// Menú de Navegación Oficial del Estudiante Practicante
const MENU_ITEMS_ESTUDIANTE = [
  { 
    name: "Mi Dashboard", 
    link: "/estudiante/dashboard", 
    icon: LayoutDashboard 
  },
  { 
    name: "Mis actas", 
    link: "/estudiante/mis-actas", 
    icon: FileCheck2 
  },
  { 
    name: "Mis fichas", 
    link: "/estudiante/mis-fichas", 
    icon: FolderOpen 
  },
  { 
    name: "Mis calificaciones", 
    link: "/estudiante/mis-calificaciones", 
    icon: Award 
  },
  { 
    name: "Mis documentos", 
    icon: FileDown,
    subItems: [
      { name: "Actas", link: "/estudiante/documentos/actas" },
      { name: "Centralizador", link: "/estudiante/documentos/centralizador" },
      { name: "Certificado", link: "/estudiante/documentos/certificado" }
    ]
  },
  
  { 
    name: "Mi cuenta", 
    link: "/estudiante/cuenta", 
    icon: User 
  }
];

export const SidebarEstudianteESFMTHEA = () => {
  return (
    <SidebarLayoutESFMTHEA
      menuItems={MENU_ITEMS_ESTUDIANTE}
      roleTitle="Estudiante Practicante"
    />
  );
};

export default SidebarEstudianteESFMTHEA;