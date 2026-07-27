import { ReactNode, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RequireAuthProps {
  children: ReactNode;
  /** Role required for this route. Omit to only require a signed-in user. */
  role?: "traveler" | "host" | "admin";
}

const Spinner = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

/**
 * Protects traveler/host routes.
 * Once a user has been authorized, the subtree stays mounted through background
 * auth/role refreshes so dashboards never reset mid-session.
 */
export default function RequireAuth({ children, role }: RequireAuthProps) {
  const { user, userRole, userRoles, loading } = useAuth();
  const location = useLocation();
  const authorizedOnce = useRef(false);

  const hasRole = !role || userRole === role || userRoles.includes(role) || userRole === "admin";

  if (user && userRole !== null && hasRole) authorizedOnce.current = true;
  if (authorizedOnce.current && user) return <>{children}</>;

  if (loading || (user && userRole === null)) return <Spinner />;

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/signup?next=${next}`} replace />;
  }

  if (!hasRole) {
    return <Navigate to={userRole === "host" ? "/dashboard/host" : "/dashboard/traveler"} replace />;
  }

  return <>{children}</>;
}
