import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../router/paths";
import { Logo } from "../ui/Logo";
import { Badge } from "../ui/Badge";

/** Minimal bar shown on the store/delivery/admin dashboards: identity + sign out only. */
export function RoleTopBar({ title, subtitle }: { title: string; subtitle: string }) {
  const { signOut, mode } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink text-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        <Logo light />
        <span className="hidden h-6 w-px bg-white/20 sm:block" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold">{title}</p>
          <p className="truncate text-xs text-white/60">{subtitle}</p>
        </div>
        <Badge tone="gray" className="hidden bg-white/10 text-white sm:inline-flex">{mode === "supabase" ? "Supabase" : "Demo mode"}</Badge>
        <button
          onClick={async () => {
            await signOut();
            navigate(ROUTES.login, { replace: true });
          }}
          className="flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-white/90 hover:bg-white/10"
        >
          <LogOut size={15} /> Switch role
        </button>
      </div>
    </header>
  );
}
