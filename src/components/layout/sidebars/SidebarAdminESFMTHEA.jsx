import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  Blocks,
  BarChart2,
  Settings,
} from "lucide-react";
import { SidebarLayoutESFMTHEA } from "../sidebarLayoutESFMTHEA";
import { gestionService } from "../../../services/gestionService";

export const SidebarAdminESFMTHEA = () => {
  const [gestionesActivas, setGestionesActivas] = useState([]);
  const location = useLocation();

  // Función reutilizable para refrescar la lista de gestiones activas
  const fetchGestiones = useCallback(async () => {
    try {
      const data = await gestionService.getGestiones();
      const activas = data.filter((g) => g.estado === "Activa" || g.estado === "ACTIVA");
      setGestionesActivas(activas);
    } catch (error) {
      console.warn("No se pudieron cargar las gestiones dinámicas del menú:", error);
    }
  }, []);

  // Carga inicial y recarga al cambiar de ruta
  useEffect(() => {
    fetchGestiones();
  }, [location.pathname, fetchGestiones]);

  // Listener para escuchar eventos globales en tiempo real (crear/habilitar/deshabilitar)
  useEffect(() => {
    const handleGestionChange = () => {
      fetchGestiones();
    };

    window.addEventListener("gestionChanged", handleGestionChange);
    return () => {
      window.removeEventListener("gestionChanged", handleGestionChange);
    };
  }, [fetchGestiones]);

  // Construcción dinámica de sub-items para las gestiones activas
  const subItemsActasDinamicos = gestionesActivas.map((g) => ({
    name: `Gestión ${g.anio || g.gestion}`,
    subItems: [
      { name: "1er año", link: `/admin/actas/${g.anio || g.gestion}/1` },
      { name: "2do año", link: `/admin/actas/${g.anio || g.gestion}/2` },
      { name: "3er año", link: `/admin/actas/${g.anio || g.gestion}/3` },
      { name: "4to año", link: `/admin/actas/${g.anio || g.gestion}/4` },
      { name: "5to año", link: `/admin/actas/${g.anio || g.gestion}/5` },
    ],
  }));

  const menuItemsAdminIEPC = [
    {
      name: "Dashboard",
      link: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Gestión de usuarios",
      link: "/admin/usuarios",
      icon: Users,
    },
    {
      name: "Gestión académica",
      icon: GraduationCap,
      subItems: [
        { name: "Estudiantes", link: "/admin/academica/estudiantes" },
        { name: "Docentes acompañantes", link: "/admin/academica/docentes-acompanantes" },
        { name: "Docentes guía", link: "/admin/academica/docentes-guia" },
        { name: "Gestiones", link: "/admin/academica/gestiones" },
        { name: "Especialidades", link: "/admin/academica/especialidades" },
      ],
    },
    {
      name: "Actas IEPC-PEC",
      icon: FileText,
      subItems: subItemsActasDinamicos.length > 0 ? subItemsActasDinamicos : [
        { name: "Sin gestiones activas", link: "#" }
      ],
    },
    {
      name: "Integridad Blockchain",
      link: "/admin/blockchain",
      icon: Blocks,
    },
    {
      name: "Reportes",
      icon: BarChart2,
      subItems: [
        { name: "Por especialidad", link: "/admin/reportes/especialidad" },
        { name: "Por etapa", link: "/admin/reportes/etapa" },
        { name: "Por gestión", link: "/admin/reportes/gestion" },
        
      ],
    },
    {
      name: "Configuración",
      link: "/admin/configuracion",
      icon: Settings,
    },
  ];

  return (
    <SidebarLayoutESFMTHEA
      menuItems={menuItemsAdminIEPC}
      roleTitle="IEPC-PEC"
    />
  );
};