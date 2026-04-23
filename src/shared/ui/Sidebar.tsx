import { useState, useEffect, type ComponentType } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";
import {
  IconMenu,
  IconBox,
  IconCart,
  IconPlus,
  IconPackage,
  IconFolder,
  IconUsers,
  IconSettings,
  IconChartBar,
  IconUserCog,
  IconCurrency,
} from "./icons";

type NavIcon = ComponentType<{ className?: string }>;
type NavItem = { to: string; label: string; icon: NavIcon };

const primaryMenuItems: NavItem[] = [
  { to: "/ventas", label: "Ventas", icon: IconCart },
  { to: "/ventas/nueva", label: "Nueva venta", icon: IconPlus },
  { to: "/productos", label: "Productos", icon: IconPackage },
  { to: "/inventario", label: "Inventario", icon: IconBox },
  { to: "/clientes", label: "Clientes", icon: IconUsers },
];

const moreBaseItems: NavItem[] = [
  { to: "/categorias", label: "Categorías", icon: IconFolder },
  { to: "/impuestos", label: "Impuestos", icon: IconCurrency },
  { to: "/configuraciones", label: "Configuración", icon: IconSettings },
];

const moreAdminItems: NavItem[] = [
  { to: "/usuarios", label: "Usuarios", icon: IconUserCog },
  { to: "/reportes", label: "Reportes", icon: IconChartBar },
];

function isMoreSectionPath(pathname: string) {
  if (["/categorias", "/impuestos", "/configuraciones", "/usuarios", "/reportes"].includes(pathname)) {
    return true;
  }
  if (pathname.startsWith("/reportes/")) {
    return true;
  }
  return false;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === "ADMIN";
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(() => isMoreSectionPath(location.pathname));

  const moreItems: NavItem[] = [...moreBaseItems, ...(isAdmin ? moreAdminItems : [])];

  useEffect(() => {
    if (isMoreSectionPath(location.pathname)) {
      setMoreOpen(true);
    }
  }, [location.pathname]);

  const moreHasActive = moreItems.some(
    (item) =>
      location.pathname === item.to ||
      (item.to === "/reportes" && location.pathname.startsWith("/reportes/"))
  );

  const linkRow = (active: boolean) =>
    `flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors ${
      active ? "bg-emerald-50 text-emerald-800 font-medium" : "hover:bg-gray-100"
    }`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-[44px] min-w-[44px] rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        aria-label="Abrir menú"
      >
        <IconMenu className="mx-auto" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="fixed left-0 top-0 z-50 flex h-full w-[min(18rem,100vw-2rem)] max-w-sm flex-col border-r border-gray-200 bg-white shadow-xl">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-4">
              <span className="font-semibold text-gray-900">POS</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-[44px] min-w-[44px] rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Cerrar menú"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
              {primaryMenuItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/ventas"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => linkRow(isActive)}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </NavLink>
              ))}

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setMoreOpen((v) => !v)}
                  className={`flex w-full min-h-[44px] items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 ${
                    moreOpen || moreHasActive ? "text-gray-900" : ""
                  } ${moreHasActive && !moreOpen ? "text-emerald-800" : ""}`}
                  aria-expanded={moreOpen}
                  aria-controls="nav-more-section"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center text-gray-500" aria-hidden>
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                        <circle cx="5" cy="12" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="19" cy="12" r="1.5" />
                      </svg>
                    </span>
                    <span className="font-medium">Más</span>
                    {moreHasActive && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                    )}
                  </span>
                  <Chevron open={moreOpen} />
                </button>

                {moreOpen && (
                  <div
                    id="nav-more-section"
                    className="ml-1 mt-0.5 space-y-0.5 border-l-2 border-gray-100 pl-2"
                    role="region"
                    aria-label="Más opciones"
                  >
                    {moreItems.map(({ to, label, icon: Icon }) => (
                      <NavLink
                        key={to}
                        to={to}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) => `${linkRow(isActive)} pl-1`}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
