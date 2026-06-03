"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { ApiError, api } from "../../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      await api.login({ identifier, password });
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setMessage("This account is waiting for activation or has been disabled.");
      } else {
        setMessage("Login failed. Check the phone/email and password.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="lv-container grid min-h-screen items-center gap-10 py-10 lg:grid-cols-[1fr_420px]">
      <section>
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold text-accent">LawViz</span>
          <span className="text-[11px] font-semibold uppercase text-muted">Private MVP</span>
        </Link>
        <p className="lv-kicker mt-14">Access Control</p>
        <h1 className="mt-5 max-w-2xl font-display text-5xl font-bold leading-tight text-fg">
          Sign in to the private workspace
        </h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-muted">
          Access is limited to verified accounts. Credits are managed internally by the team.
        </p>
      </section>

      <section className="lv-card p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-light text-accent">
            <LockKeyhole size={18} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg">Login</h2>
            <p className="text-sm text-muted">Use phone or email with your password.</p>
          </div>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-fg">
            Phone or email
            <input
              className="lv-input mt-2"
              placeholder="+15555550115 or lawyer@example.com"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium text-fg">
            Password
            <input
              className="lv-input mt-2"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {message ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{message}</p> : null}
          <button className="lv-btn-coral w-full" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"} <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </form>
        <p className="mt-5 text-sm text-muted">
          Need access?{" "}
          <Link href="/auth/register" className="font-semibold text-accent">
            Submit a request
          </Link>
        </p>
      </section>
    </main>
  );
}
