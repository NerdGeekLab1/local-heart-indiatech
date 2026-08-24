import { ReactNode } from "react";
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
 * Role checks remain live so an approval or role repair immediately moves the
 * account to its one permitted dashboard.
 */
export default function RequireAuth({ children, role }: RequireAuthProps) {
  const { user, userRole, userRoles, loading, roleLoaded } = useAuth();
  const location = useLocation();
  // A signed-in account with no role row yet is treated as a traveler so the
  // guard can never bounce between two dashboards forever.
  const effectiveRole = userRole ?? "traveler";
  const hasRole = !role || effectiveRole === role || userRoles.includes(role) || effectiveRole === "admin";

  // Spin only until the role lookup settles — never forever when a user has no role row.
  if (loading || (user && !roleLoaded)) return <Spinner />;

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    const loginPath = role === "host" ? "/login/host" : role === "traveler" ? "/login/traveler" : "/signup";
    return <Navigate to={`${loginPath}?next=${next}`} replace />;
  }

  // A failed/empty role lookup must never bounce a host to the traveler dashboard —
  // stay put and let the live role subscription resolve it.
  if (!hasRole && userRole) {
    return <Navigate to={effectiveRole === "host" ? "/dashboard/host" : "/dashboard/traveler"} replace />;
  }


  return <>{children}</>;
}
