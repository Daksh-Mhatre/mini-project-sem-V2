import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Profile, UserRole } from "../types/db";
import { backend, BACKEND_MODE } from "../lib/backend";

interface AuthState {
  profile: Profile | null;
  loading: boolean;
  mode: "supabase" | "local";
  signIn: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    backend.getSession().then((p) => {
      if (active) {
        setProfile(p);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (role: UserRole) => {
    setLoading(true);
    try {
      const p = await backend.signInDemo(role);
      setProfile(p);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await backend.signOut();
    setProfile(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ profile, loading, mode: BACKEND_MODE, signIn, signOut }),
    [profile, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
