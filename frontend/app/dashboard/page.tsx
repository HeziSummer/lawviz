"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, FileText, History, LogOut, Plus } from "lucide-react";
import AuthGuard from "../../components/AuthGuard";
import CreditBalance from "../../components/CreditBalance";
import { api, type AuthUser, type CreditLedgerEntry } from "../../lib/api";
import { displayLawFirm, displayUserName, isAdmin } from "../../lib/auth";

export default function DashboardPage() {
  return (
    <AuthGuard>
      {(user) => (
        <main>
          <Topbar user={user} />
          <DashboardContent user={user} />
        </main>
      )}
    </AuthGuard>
  );
}

function DashboardContent({ user }: { user: AuthUser }) {
  const [ledger, setLedger] = useState<CreditLedgerEntry[]>([]);

  useEffect(() => {
    let mounted = true;
    api
      .creditLedger()
      .then((entries) => {
        if (mounted) setLedger(entries.slice(0, 5));
      })
      .catch(() => {
        if (mounted) setLedger([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="lv-container py-10">
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 md:flex-row md:items-end">
        <div>
          <p className="lv-kicker">Dashboard</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-fg">Private workspace</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Signed in as {displayUserName(user)}
            {displayLawFirm(user) ? `, ${displayLawFirm(user)}` : ""}. Generation and sharing stay behind account access.
          </p>
        </div>
        <Link href="/generate" className="lv-btn-coral">
          <Plus size={16} strokeWidth={1.5} /> New visualization
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <CreditBalance />
        <Panel icon={<FileText size={18} strokeWidth={1.5} />} label="Recent ledger" value={`${ledger.length} entries`} detail="Latest internal credit activity." />
        <Panel icon={<BarChart3 size={18} strokeWidth={1.5} />} label="Account status" value={user.status} detail="Activation is controlled by administrators." />
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="lv-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="text-lg font-semibold text-fg">Credit ledger</h2>
              <p className="mt-1 text-sm text-muted">Internal credit movements for this account.</p>
            </div>
            <History className="text-muted" size={18} strokeWidth={1.5} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-surface-2 text-xs text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Reason</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {ledger.length ? (
                  ledger.map((entry) => (
                    <tr key={entry.id} className="border-t border-border">
                      <td className="px-5 py-4 font-medium text-fg">{entry.type ?? "entry"}</td>
                      <td className="px-5 py-4 text-muted">{entry.amount}</td>
                      <td className="px-5 py-4 text-muted">{entry.reason ?? "-"}</td>
                      <td className="px-5 py-4 text-muted">{entry.created_at ?? "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-border">
                    <td className="px-5 py-5 text-muted" colSpan={4}>
                      No ledger entries yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="lv-card p-5">
          <h2 className="text-lg font-semibold text-fg">Access boundary</h2>
          <div className="mt-5 space-y-4 text-sm leading-6 text-muted">
            <p>Credits are internal ledger units, not public pricing.</p>
            <p>Public payment and checkout flows remain unavailable.</p>
            <p>Share links are still treated as private access surfaces.</p>
          </div>
          {isAdmin(user) ? (
            <Link href="/admin/users" className="lv-btn-ghost mt-6 w-full">
              Open admin tools <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          ) : null}
        </aside>
      </section>
    </section>
  );
}

function Topbar({ user }: { user: AuthUser }) {
  const router = useRouter();

  async function logout() {
    await api.logout();
    router.push("/auth/login");
  }

  return (
    <header className="border-b border-border bg-surface">
      <div className="lv-container flex h-[72px] items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold text-accent">LawViz</span>
          <span className="text-[11px] font-semibold uppercase text-muted">Private MVP</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted">
          <Link href="/dashboard" className="font-semibold text-accent">
            Dashboard
          </Link>
          {isAdmin(user) ? (
            <Link href="/admin/users" className="hover:text-accent">
              Admin
            </Link>
          ) : null}
          <button className="inline-flex items-center gap-1 hover:text-accent" type="button" onClick={logout}>
            <LogOut size={15} strokeWidth={1.5} /> Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

function Panel({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="lv-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-light text-accent">{icon}</div>
        <p className="text-sm font-medium text-muted">{label}</p>
      </div>
      <p className="mt-5 text-3xl font-semibold text-fg">{value}</p>
      <p className="mt-2 text-sm text-muted">{detail}</p>
    </div>
  );
}
