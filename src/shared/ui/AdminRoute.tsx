import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";

/** Protege rutas que solo deben ser accesibles por administradores */
export function AdminRoute() {
  const { user } = useAuth();
  if (user?.role !== "ADMIN") {
    return <Navigate to="/productos" replace />;
  }
  return <Outlet />;
}
