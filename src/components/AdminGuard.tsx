import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface AdminGuardProps {
  children: ReactNode;
}

/**
 * Guards admin-only routes.
 * - While auth is loading: render nothing (avoid flicker).
 * - Unauthenticated: redirect to /signup with a `next` param so users return here after login.
 * - Authenticated but not admin: redirect to home.
 */
export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/signup?next=${next}`} replace />;
  }

  if (userRole !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
