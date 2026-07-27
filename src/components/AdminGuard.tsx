import { ReactNode, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface AdminGuardProps {
  children: ReactNode;
}

/**
 * Guards admin-only routes.
 * - While auth is loading: render a spinner (avoid flicker).
 * - Unauthenticated: redirect to dedicated /admin-login with a `next` param.
 * - Authenticated but not admin: redirect to home.
 * - Once authorized, the subtree stays mounted through background token/role
 *   refreshes so the console never resets mid-session.
 */
export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, userRole, loading } = useAuth();
  const location = useLocation();
  const authorizedOnce = useRef(false);

  if (user && userRole === "admin") authorizedOnce.current = true;
  if (authorizedOnce.current && user) return <>{children}</>;

  if (loading || (user && userRole === null)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/admin-login?next=${next}`} replace />;
  }

  if (userRole !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

