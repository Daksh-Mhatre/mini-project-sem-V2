import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bike, LayoutDashboard, ShoppingBag, Store } from "lucide-react";
import type { UserRole } from "../types/db";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/ui/Logo";
import { Button } from "../components/ui/Button";
import { ROUTES } from "../router/paths";

const options: { role: UserRole; label: string; desc: string; icon: typeof Store; path: string }[] = [
  { role: "customer", label: "Continue as Customer", desc: "Browse, order groceries and track delivery", icon: ShoppingBag, path: ROUTES.customer },
  { role: "store", label: "Continue as Store Partner", desc: "Manage incoming orders for Fresh Mart", icon: Store, path: ROUTES.store },
  { role: "delivery", label: "Continue as Delivery Partner", desc: "Accept and complete delivery jobs", icon: Bike, path: ROUTES.delivery },
  { role: "admin", label: "Continue as Admin", desc: "Monitor the whole partner network", icon: LayoutDashboard, path: ROUTES.admin },
];

export function LoginPage() {
  const { signIn, mode } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<UserRole | null>(null);

  const choose = async (role: UserRole, path: string) => {
    setBusy(role);
    try {
      await signIn(role);
      navigate(path, { replace: true });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8 text-center">
        <div className="flex justify-center"><Logo /></div>
        <p className="mt-2 text-sm text-muted">Quick commerce, powered by the supermarket next door.</p>
      </div>

      <div className="rounded-2xl bg-white p-2 shadow-sm">
        {options.map(({ role, label, desc, icon: Icon, path }) => (
          <button
            key={role}
            onClick={() => choose(role, path)}
            disabled={busy !== null}
            className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-surface disabled:opacity-60"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand"><Icon size={22} /></span>
            <span className="flex-1">
              <span className="block text-sm font-extrabold">{label}</span>
              <span className="block text-xs text-muted">{desc}</span>
            </span>
            {busy === role && <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />}
          </button>
        ))}
      </div>

      <p className="mt-6 rounded-xl bg-brand-light/60 p-3 text-center text-xs text-muted">
        Demo mode: these are sample identities for presenting the prototype — not a real account system.
        Running on the <strong>{mode === "supabase" ? "Supabase" : "local demo"}</strong> backend.
      </p>
      <Button variant="ghost" className="mt-2" disabled={busy !== null} onClick={() => choose("customer", ROUTES.customer)}>
        Skip and preview as guest customer
      </Button>
    </div>
  );
}
