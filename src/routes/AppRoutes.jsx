import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginESFMTHEA from "../pages/auth/login";

// LAYOUTS DE SIDEBAR
import { SidebarAdminESFMTHEA } from "../components/layout/sidebars/SidebarAdminESFMTHEA";
import { SidebarDocenteAcompañanteESFMTHEA } from "../components/layout/sidebars/SidebarDocenteAcompañanteESFMTHEA";
import SidebarDocenteGuiaESFMTHEA from "../components/layout/sidebars/SidebarDocenteGuiaESFMTHEA";
import SidebarEstudianteESFMTHEA from "../components/layout/sidebars/SidebarEstudianteESFMTHEA";

// ADMINISTRADOR
import { AdminDashboard } from "../pages/admin/dashborad";
import { UserManagement } from "../pages/admin/UserManagement";
import { DocentesAcompañantesManagement } from "../pages/admin/DocentesManagement";
import { StudentsManagement } from "../pages/admin/StudentsManagement";
import { DocentesGuiaManagement } from "../pages/admin/DocentesGuiaManagement";
import { GestionesManagement } from "../pages/admin/GestionesManagement";
import { AnosFormacionManagement } from "../pages/admin/AnosFormacionManagement";
import { EspecialidadesManagement } from "../pages/admin/EspecialidadesManagement";
import { RevisionValidacionManagement } from "../pages/admin/RevisionValidacionManagement";
import { BlockchainIntegrityManagement } from "../pages/admin/BlockchainIntegrityManagement";
import { ConfiguracionManagement } from "../pages/admin/ConfiguracionManagement";
import {
  Actas2025Ano1,
  Actas2025Ano2,
  Actas2025Ano3,
  Actas2025Ano4,
  Actas2025Ano5,
  Actas2026Ano1,
  Actas2026Ano2,
  Actas2026Ano3,
  Actas2026Ano4,
  Actas2026Ano5,
} from "../pages/admin/actas/ActasPages";

// DOCENTE ACOMPAÑANTE
import { DocenteAcompananteDashboard } from "../pages/docentes/acompañante/DocenteAcompananteDashboard";
import { MisEstudiantes } from "../pages/docentes/acompañante/MisEstudiantes";
import { MisActasAcompanante } from "../pages/docentes/acompañante/iepc-pec/MisActasAcompanante";
import { FichasAcompanante } from "../pages/docentes/acompañante/iepc-pec/FichasAcompanante";
import { CentralizadoresAcompanante } from "../pages/docentes/acompañante/iepc-pec/CentralizadoresAcompanante";
import { SeguimientoAcompanante } from "../pages/docentes/acompañante/SeguimientoAcompanante";
import { VerificarIntegridadAcompanante } from "../pages/docentes/acompañante/VerificarIntegridadAcompanante";
import { ReportesAcompanante } from "../pages/docentes/acompañante/ReportesAcompanante";
import { MiCuentaAcompanante } from "../pages/docentes/acompañante/MiCuentaAcompanante";

// DOCENTE GUÍA
import { DocenteGuiaDashboard } from "../pages/docentes/guia/DocenteGuiaDashboard";
import { MisEstudiantesGuia } from "../pages/docentes/guia/MisEstudiantesGuia";
import { FichasAsignadasGuia } from "../pages/docentes/guia/FichasAsignadasGuia";
import { SeguimientoGuia } from "../pages/docentes/guia/SeguimientoGuia";
import { ConsultasGuia } from "../pages/docentes/guia/ConsultasGuia";
import { MiCuentaGuia } from "../pages/docentes/guia/MiCuentaGuia";

// ESTUDIANTE
import { EstudianteDashboard } from "../pages/student/EstudianteDashboard";
import { MisFichasEstudiante } from "../pages/student/MisFichasEstudiante";
import { DocumentosActasEstudiante } from "../pages/student/documentos/DocumentosActasEstudiante";
import { DocumentosCentralizadorEstudiante } from "../pages/student/documentos/DocumentosCentralizadorEstudiante";
import { DocumentosCertificadoEstudiante } from "../pages/student/documentos/DocumentosCertificadoEstudiante";
import { MisActasEstudiante } from "../pages/student/MisActasEstudiante";
import { MisCalificacionesEstudiante } from "../pages/student/MisCalificacionesEstudiante";
import { VerificarIntegridadEstudiante } from "../pages/student/VerificarIntegridadEstudiante";
import { MiCuentaEstudiante } from "../pages/student/MiCuentaEstudiante";
import { ProtectedRoute } from "./ProtectedRoute";
import { ActaAnoContainer } from "../pages/admin/actas/ActaAnoContainer";
import { ReporteEspecialidad, ReporteEtapa, ReporteGestion } from "../pages/admin/reportes/ReportesPages";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Pública */}
        <Route path="/" element={<LoginESFMTHEA />} />

        {/* --- MÓDULO ADMINISTRADOR --- */}
        <Route element={<ProtectedRoute allowedRoles={["ADMINISTRADOR"]} />}>
          <Route path="/admin" element={<SidebarAdminESFMTHEA />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="usuarios" element={<UserManagement />} />
            <Route path="academica">
              <Route path="estudiantes" element={<StudentsManagement />} />
              <Route
                path="docentes-acompanantes"
                element={<DocentesAcompañantesManagement />}
              />
              <Route
                path="docentes-guia"
                element={<DocentesGuiaManagement />}
              />
              <Route path="gestiones" element={<GestionesManagement />} />
              <Route
                path="anos-formacion"
                element={<AnosFormacionManagement />}
              />
              <Route
                path="especialidades"
                element={<EspecialidadesManagement />}
              />
            </Route>
            <Route path="actas">
              <Route path=":gestion/:ano" element={<ActaAnoContainer />} />
            </Route>
            <Route
              path="blockchain"
              element={<BlockchainIntegrityManagement />}
            />
            <Route
              path="validacion"
              element={<RevisionValidacionManagement />}
            />
            <Route path="reportes/especialidad" element={<ReporteEspecialidad />} />
          <Route path="reportes/etapa" element={<ReporteEtapa />} />
          <Route path="reportes/gestion" element={<ReporteGestion />} />
            <Route path="configuracion" element={<ConfiguracionManagement />} />
          </Route>
        </Route>

        {/* --- MÓDULO DOCENTE ACOMPAÑANTE --- */}
        <Route
          element={<ProtectedRoute allowedRoles={["DOCENTE_ACOMPANANTE"]} />}
        >
          <Route
            path="/docente-acompanante"
            element={<SidebarDocenteAcompañanteESFMTHEA />}
          >
            <Route index element={<DocenteAcompananteDashboard />} />
            <Route path="dashboard" element={<DocenteAcompananteDashboard />} />
            <Route path="estudiantes" element={<MisEstudiantes />} />
            <Route path="iepc-pec">
              <Route path="actas" element={<MisActasAcompanante />} />
              <Route path="fichas" element={<FichasAcompanante />} />
              <Route
                path="centralizadores"
                element={<CentralizadoresAcompanante />}
              />
            </Route>
            <Route path="seguimiento" element={<SeguimientoAcompanante />} />
            <Route
              path="verificar-integridad"
              element={<VerificarIntegridadAcompanante />}
            />
            <Route path="reportes" element={<ReportesAcompanante />} />
            <Route path="cuenta" element={<MiCuentaAcompanante />} />
          </Route>
        </Route>

        {/* --- MÓDULO DOCENTE GUÍA --- */}
        <Route element={<ProtectedRoute allowedRoles={["DOCENTE_GUIA"]} />}>
          <Route path="/docente-guia" element={<SidebarDocenteGuiaESFMTHEA />}>
            <Route index element={<DocenteGuiaDashboard />} />
            <Route path="dashboard" element={<DocenteGuiaDashboard />} />
            <Route path="estudiantes" element={<MisEstudiantesGuia />} />
            <Route path="fichas-asignadas" element={<FichasAsignadasGuia />} />
            <Route path="seguimiento" element={<SeguimientoGuia />} />
            <Route path="consultas" element={<ConsultasGuia />} />
            <Route path="cuenta" element={<MiCuentaGuia />} />
          </Route>
        </Route>

        {/* --- MÓDULO ESTUDIANTE --- */}
        <Route element={<ProtectedRoute allowedRoles={["ESTUDIANTE"]} />}>
          <Route path="/estudiante" element={<SidebarEstudianteESFMTHEA />}>
            <Route index element={<EstudianteDashboard />} />
            <Route path="dashboard" element={<EstudianteDashboard />} />
            <Route path="mis-actas" element={<MisActasEstudiante />} />
            <Route path="mis-fichas" element={<MisFichasEstudiante />} />
            <Route
              path="mis-calificaciones"
              element={<MisCalificacionesEstudiante />}
            />
            <Route path="documentos">
              <Route path="actas" element={<DocumentosActasEstudiante />} />
              <Route
                path="centralizador"
                element={<DocumentosCentralizadorEstudiante />}
              />
              <Route
                path="certificado"
                element={<DocumentosCertificadoEstudiante />}
              />
            </Route>
            <Route
              path="verificar-integridad"
              element={<VerificarIntegridadEstudiante />}
            />
            <Route path="cuenta" element={<MiCuentaEstudiante />} />
          </Route>
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<LoginESFMTHEA />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
