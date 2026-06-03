"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { api, type AuthUser } from "../lib/api";
import { isAdmin } from "../lib/auth";

type AuthGuardProps = {
  children: (user: AuthUser) => ReactNode;
  requireAdmin?: boolean;
};

export default function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    api
      .me()
      .then((currentUser) => {
        if (!mounted) return;
        if (!currentUser.is_active || currentUser.status !== "active") {
          setError("Your account is not active yet.");
          return;
        }
        if (requireAdmin && !isAdmin(currentUser)) {
          setError("Admin access is required.");
          return;
        }
        setUser(currentUser);
      })
      .catch(() => {
        if (mounted) router.replace("/auth/login");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [requireAdmin, router]);

  if (loading) {
    return (
      <main className="lv-container flex min-h-screen items-center justify-center">
        <div className="lv-card p-6 text-sm text-muted">Loading account...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="lv-container flex min-h-screen items-center justify-center">
        <div className="lv-card max-w-md p-6">
          <div className="mb-4 flex items-center gap-3 text-accent">
            <ShieldAlert size={20} strokeWidth={1.5} />
            <h1 className="text-lg font-semibold text-fg">Access unavailable</h1>
          </div>
          <p className="text-sm leading-6 text-muted">{error}</p>
          <button className="lv-btn-ghost mt-5" type="button" onClick={() => router.replace("/auth/login")}>
            Back to login
          </button>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return <>{children(user)}</>;
}
