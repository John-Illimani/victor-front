import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  LogOut, 
  School, 
  User 
} from "lucide-react";
import { authService } from "../../services/authService";

// Componente recursivo para Renderizar Menús y Submenús N-Niveles
const MenuItem = ({ item, isCollapsed, setIsMobileOpen, level = 0 }) => {
  const location = useLocation();

  const subItems = item.subItems || item.children;
  const hasSubItems = Boolean(subItems && subItems.length);
  const Icon = item.icon;

  const checkIsActive = (node) => {
    if (node.link && (location.pathname === node.link || location.pathname.startsWith(node.link + "/"))) {
      return true;
    }
    const children = node.subItems || node.children;
    if (children) {
      return children.some(checkIsActive);
    }
    return false;
  };

  const isCurrentActive = checkIsActive(item);
  const [isOpen, setIsOpen] = useState(isCurrentActive);

  useEffect(() => {
    if (isCurrentActive) {
      setIsOpen(true);
    }
  }, [location.pathname, isCurrentActive]);

  if (hasSubItems) {
    return (
      <div className="w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`nav-item-transition relative flex w-full items-center justify-between rounded-l-3xl py-2 text-xs font-bold cursor-pointer transition-all ${
            level === 0 ? "px-3.5" : "pl-4 pr-3 text-slate-300 hover:text-white"
          } ${
            isCurrentActive && level === 0
              ? "curved-active text-[#8C731A] font-black shadow-sm"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
          style={{ paddingLeft: level > 0 ? `${(level + 1) * 12}px` : undefined }}
          title={isCollapsed ? item.name : undefined}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            {Icon && <Icon size={18} className="shrink-0 transition-transform duration-300" />}
            {!isCollapsed && <span className="truncate">{item.name}</span>}
          </div>
          {!isCollapsed && (
            <ChevronDown
              size={14}
              className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#8C731A]" : ""}`}
            />
          )}
        </button>

        {isOpen && !isCollapsed && (
          <div className="mt-1 space-y-1 border-l-2 border-[#8C731A]/30 ml-5 pl-1 transition-all duration-300">
            {subItems.map((sub, idx) => (
              <MenuItem
                key={sub.link || sub.name || idx}
                item={sub}
                isCollapsed={isCollapsed}
                setIsMobileOpen={setIsMobileOpen}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.link || "#"}
      onClick={() => setIsMobileOpen(false)}
      className={({ isActive }) =>
        `nav-item-transition relative flex w-full items-center gap-3 py-2 text-xs font-bold transition-all ${
          level === 0
            ? isActive
              ? "curved-active text-[#8C731A] font-black rounded-l-3xl px-3.5"
              : "rounded-l-3xl px-3.5 text-slate-300 hover:bg-white/10 hover:text-white"
            : isActive
              ? "bg-[#8C731A]/20 text-[#F3EFCF] font-black rounded-2xl px-3 border-l-2 border-[#8C731A] shadow-inner"
              : "rounded-2xl px-3 text-slate-400 hover:bg-white/5 hover:text-white"
        }`
      }
      style={{ paddingLeft: level > 0 ? `${(level + 1) * 10}px` : undefined }}
      title={isCollapsed ? item.name : undefined}
    >
      {({ isActive }) => (
        <>
          {Icon && (
            <Icon
              size={16}
              className={`shrink-0 transition-transform duration-300 ${
                isActive ? "scale-110 text-[#8C731A]" : ""
              }`}
            />
          )}
          {!isCollapsed && <span className="truncate">{item.name}</span>}
        </>
      )}
    </NavLink>
  );
};

export const SidebarLayoutESFMTHEA = ({
  menuItems = [],
  roleTitle = "Gestión IEPC-PEC",
  onLogout,
}) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // MANEJO DE LOGOUT CONECTADO A LA API
  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }

    setIsLoggingOut(true);

    try {
      await authService.logout();
    } catch (error) {
      // Silenciado para evitar exposiciones
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      setIsLoggingOut(false);
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f1f5f9] font-sans text-slate-800">
      <style>{`
        .curved-active {
          background-color: #f1f5f9 !important;
          position: relative;
          z-index: 20;
        }

        .curved-active::before,
        .curved-active::after {
          content: "";
          position: absolute;
          right: 0;
          height: 20px;
          width: 20px;
          pointer-events: none;
          background-color: transparent;
          transition: box-shadow 0.3s ease;
        }

        .curved-active::before {
          top: -20px;
          border-bottom-right-radius: 20px;
          box-shadow: 6px 6px 0 6px #f1f5f9;
        }

        .curved-active::after {
          bottom: -20px;
          border-top-right-radius: 20px;
          box-shadow: 6px -6px 0 6px #f1f5f9;
        }

        /* Personalización de barra de desplazamiento discreta */
        .custom-sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(140, 115, 26, 0.5);
        }
      `}</style>

      {/* OVERLAY MÓVIL */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)} 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* SIDEBAR RESPONSIVO Y OPTIMIZADO EN ALTURA */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex h-dvh flex-col justify-between bg-gradient-to-b from-[#121824] via-[#1A1A1A] to-[#121824] text-white transition-all duration-300 ease-in-out lg:sticky lg:top-0 shrink-0 ${
          isCollapsed ? "lg:w-20" : "lg:w-72"
        } ${isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* ENCABEZADO SUPERIOR */}
        <div className="relative flex h-16 sm:h-20 items-center justify-between border-b border-white/10 px-4 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative shrink-0 rounded-2xl bg-gradient-to-br from-[#8C731A] to-[#801B28] p-[2px] shadow-lg shadow-[#8C731A]/20">
              <img
                src="/logo_esfmthea.png"
                alt="ESFMTHEA"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-[14px] bg-white object-contain p-1 ring-1 ring-white/10"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-[14px] bg-[#1A1A1A] text-[#8C731A]">
                <School size={20} />
              </div>
            </div>

            {!isCollapsed && (
              <div className="leading-tight transition-all duration-300 overflow-hidden">
                <span className="block text-sm sm:text-base font-black tracking-wider text-white truncate">
                  ESFMTHEA
                </span>
                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-[#F3EFCF] truncate">
                  {roleTitle}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/10 cursor-pointer shrink-0"
            title={isCollapsed ? "Expandir Menú" : "Colapsar Menú"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVEGACIÓN PRINCIPAL CON SCROLLABLE INDEPENDIENTE */}
        <nav className="my-2 flex-1 min-h-0 space-y-1 pl-3 pr-1 overflow-y-auto custom-sidebar-scroll">
          {menuItems.map((item, idx) => (
            <MenuItem
              key={item.link || item.name || idx}
              item={item}
              isCollapsed={isCollapsed}
              setIsMobileOpen={setIsMobileOpen}
            />
          ))}
        </nav>

        {/* SECCIÓN INFERIOR FIJA: USUARIO Y BOTÓN DE CERRAR SESIÓN */}
        <div className="border-t border-white/10 p-2.5 sm:p-3 shrink-0 bg-[#121824]/90">
          {!isCollapsed && (
            <div className="mb-2 sm:mb-2.5 flex items-center gap-2.5 rounded-2xl bg-white/5 p-2 sm:p-2.5 border border-white/5">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-[#801B28] text-white font-bold text-xs">
                <User size={15} />
              </div>
              <div className="overflow-hidden leading-tight text-xs">
                <span className="block truncate font-bold text-white text-[11px] sm:text-xs">Usuario Activo</span>
                <span className="block truncate text-[9px] sm:text-[10px] text-slate-400">{roleTitle}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`flex w-full items-center gap-2.5 rounded-2xl bg-[#801B28]/25 hover:bg-[#801B28] px-3 py-2.5 sm:py-2.5 text-xs font-bold text-red-200 hover:text-white transition-all duration-300 cursor-pointer disabled:opacity-50 border border-[#801B28]/40 ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
            title="Cerrar sesión"
          >
            <LogOut size={16} className={`shrink-0 ${isLoggingOut ? "animate-spin" : ""}`} />
            {!isCollapsed && <span className="truncate">{isLoggingOut ? "Cerrando..." : "Cerrar sesión"}</span>}
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-y-auto bg-[#f1f5f9]">
        {/* ENCABEZADO MÓVIL */}
        <header className="flex h-14 sm:h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden shrink-0">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <Menu size={22} />
          </button>
          <span className="font-extrabold text-xs sm:text-sm text-[#1A1A1A]">
            ESFMTHEA - IEPC-PEC
          </span>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#8C731A]/20 flex items-center justify-center text-[#8C731A] font-bold text-xs">
            PEC
          </div>
        </header>

        {/* VISTA CONTENIDO */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8">
          <div className="mx-auto min-h-full w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};