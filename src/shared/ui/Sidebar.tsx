import { useState } from "react";
import { NavLink } from "react-router-dom";
import { IconMenu, IconBox, IconCart, IconPackage, IconMapPin, IconFolder } from "./icons";

const menuItems = [
  { to: "/productos", label: "Productos", icon: IconPackage },
  { to: "/categorias", label: "Categorías", icon: IconFolder },
  { to: "/ubicaciones", label: "Ubicaciones", icon: IconMapPin },
  { to: "/inventario", label: "Inventario", icon: IconBox },
  { to: "/ventas", label: "Ventas", icon: IconCart },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        aria-label="Abrir menú"
      >
        <IconMenu />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="fixed left-0 top-0 z-50 h-full w-64 border-r border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
              <span className="font-semibold text-gray-900">POS</span>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
                aria-label="Cerrar menú"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="p-2">
              {menuItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-colors ${
                      isActive ? "bg-emerald-50 text-emerald-700" : "hover:bg-gray-100"
                    }`
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
