"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleSlash, RefreshCw } from "lucide-react";
import AuthGuard from "../../../components/AuthGuard";
import { api, type AuthUser } from "../../../lib/api";
import { displayUserName } from "../../../lib/auth";

export default function AdminUsersPage() {
  return (
    <AuthGuard requireAdmin>
      {() => <AdminUsersContent />}
    </AuthGuard>
  );
}

function AdminUsersContent() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    setLoading(true);
    setMessage(null);
    try {
      setUsers(await api.adminUsers());
    } catch {
      setMessage("Could not load users.");
    } finally {
      setLoading(false);
    }
  }

  async function activateUser(userId: string) {
    try {
      await api.adminActivateUser(userId);
      await loadUsers();
    } catch {
      setMessage("Could not activate user.");
    }
  }

  async function disableUser(userId: string) {
    try {
      await api.adminDisableUser(userId);
      await loadUsers();
    } catch {
      setMessage("Could not disable user.");
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  return (
    <main>
      <AdminHeader current="users" />
      <section className="lv-container py-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="lv-kicker">Admin</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-fg">Users</h1>
            <p className="mt-3 text-sm text-muted">Activate pending accounts and disable inactive access.</p>
          </div>
          <button className="lv-btn-ghost" type="button" onClick={loadUsers} disabled={loading}>
            <RefreshCw size={16} strokeWidth={1.5} /> Refresh
          </button>
        </div>

        {message ? <p className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-700">{message}</p> : null}

        <div className="lv-card mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead className="bg-surface-2 text-xs text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-border">
                    <td className="px-5 py-4">
                      <p className="font-medium text-fg">{displayUserName(user)}</p>
                      <p className="mt-1 text-xs text-muted">{user.email}</p>
                    </td>
                    <td className="px-5 py-4 text-muted">{user.phone}</td>
                    <td className="px-5 py-4 text-muted">{user.role}</td>
                    <td className="px-5 py-4">
                      <span className="lv-status">{user.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button className="lv-btn-ghost" type="button" onClick={() => activateUser(user.id)}>
                          <CheckCircle2 size={15} strokeWidth={1.5} /> Activate
                        </button>
                        <button className="lv-btn-ghost" type="button" onClick={() => disableUser(user.id)}>
                          <CircleSlash size={15} strokeWidth={1.5} /> Disable
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!users.length ? (
                  <tr className="border-t border-border">
                    <td className="px-5 py-5 text-muted" colSpan={5}>
                      {loading ? "Loading users..." : "No users found."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
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
