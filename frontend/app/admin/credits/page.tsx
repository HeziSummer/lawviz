"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MinusCircle, PlusCircle, RefreshCw } from "lucide-react";
import AuthGuard from "../../../components/AuthGuard";
import { api, type CreditLedgerEntry } from "../../../lib/api";

export default function AdminCreditsPage() {
  return (
    <AuthGuard requireAdmin>
      {() => <AdminCreditsContent />}
    </AuthGuard>
  );
}

function AdminCreditsContent() {
  const [ledger, setLedger] = useState<CreditLedgerEntry[]>([]);
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadLedger() {
    setLoading(true);
    setMessage(null);
    try {
      setLedger(await api.adminCreditLedger());
    } catch {
      setMessage("Could not load credit ledger.");
    } finally {
      setLoading(false);
    }
  }

  async function performCredit(mode: "grant" | "adjust") {
    setMessage(null);

    const parsedAmount = Number(amount);
    if (!userId || !Number.isFinite(parsedAmount)) {
      setMessage("Enter a user id and a numeric amount.");
      return;
    }

    try {
      const payload = {
        user_id: userId,
        amount: parsedAmount,
        reason,
        idempotency_key: mode === "grant" ? `${userId}:${parsedAmount}:${Date.now()}` : undefined,
      };
      if (mode === "grant") {
        await api.adminGrantCredits(payload);
      } else {
        await api.adminAdjustCredits(payload);
      }
      setAmount("");
      setReason("");
      await loadLedger();
    } catch {
      setMessage("Credit update failed.");
    }
  }

  async function submitCredit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await performCredit("grant");
  }

  useEffect(() => {
    void loadLedger();
  }, []);

  return (
    <main>
      <AdminHeader current="credits" />
      <section className="lv-container py-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="lv-kicker">Admin</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-fg">Credits</h1>
            <p className="mt-3 text-sm text-muted">Grant or adjust internal credit balances. This is not a payment flow.</p>
          </div>
          <button className="lv-btn-ghost" type="button" onClick={loadLedger} disabled={loading}>
            <RefreshCw size={16} strokeWidth={1.5} /> Refresh
          </button>
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
          <form className="lv-card space-y-4 p-5" onSubmit={submitCredit}>
            <h2 className="text-lg font-semibold text-fg">Credit action</h2>
            <label className="block text-sm font-medium text-fg">
              User id
              <input className="lv-input mt-2" value={userId} onChange={(event) => setUserId(event.target.value)} required />
            </label>
            <label className="block text-sm font-medium text-fg">
              Amount
              <input
                className="lv-input mt-2"
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-medium text-fg">
              Reason
              <input className="lv-input mt-2" value={reason} onChange={(event) => setReason(event.target.value)} />
            </label>
            {message ? <p className="rounded-md bg-surface-2 p-3 text-sm text-muted">{message}</p> : null}
            <div className="grid gap-2 sm:grid-cols-2">
              <button className="lv-btn-coral" type="submit">
                <PlusCircle size={16} strokeWidth={1.5} /> Grant
              </button>
              <button className="lv-btn-ghost" type="button" onClick={() => performCredit("adjust")}>
                <MinusCircle size={16} strokeWidth={1.5} /> Adjust
              </button>
            </div>
          </form>

          <div className="lv-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-surface-2 text-xs text-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Reason</th>
                    <th className="px-5 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((entry) => (
                    <tr key={entry.id} className="border-t border-border">
                      <td className="px-5 py-4 text-muted">{entry.user_id}</td>
                      <td className="px-5 py-4 font-medium text-fg">{entry.type ?? "entry"}</td>
                      <td className="px-5 py-4 text-muted">{entry.amount}</td>
                      <td className="px-5 py-4 text-muted">{entry.reason ?? "-"}</td>
                      <td className="px-5 py-4 text-muted">{entry.created_at ?? "-"}</td>
                    </tr>
                  ))}
                  {!ledger.length ? (
                    <tr className="border-t border-border">
                      <td className="px-5 py-5 text-muted" colSpan={5}>
                        {loading ? "Loading ledger..." : "No credit entries found."}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function AdminHeader({ current }: { current: "users" | "credits" }) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="lv-container flex h-[72px] items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-accent">
          <ArrowLeft size={16} strokeWidth={1.5} /> Dashboard
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted">
          <Link href="/admin/users" className={current === "users" ? "font-semibold text-accent" : "hover:text-accent"}>
            Users
          </Link>
          <Link href="/admin/credits" className={current === "credits" ? "font-semibold text-accent" : "hover:text-accent"}>
            Credits
          </Link>
        </nav>
      </div>
    </header>
  );
}
