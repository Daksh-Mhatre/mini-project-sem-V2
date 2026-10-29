import { Navigate } from "react-router-dom";
import type { UserRole } from "../types/db";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "./paths";

/**
 * Guards a role's routes. A user who is not signed in, or signed in under
 * the wrong role, is redirected to the login screen instead of rendering
 * the protected interface — this is the client-side half of authorization;
 * the Supabase backend additionally enforces it at the database layer via
 * Row Level Security, so this check is UX convenience, not the security
 * boundary itself.
 */
export function ProtectedRoute({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted">Loading your session…</div>;
  }
  if (!profile || profile.role !== role) {
    return <Navigate to={ROUTES.login} replace />;
  }
  return <>{children}</>;
}
