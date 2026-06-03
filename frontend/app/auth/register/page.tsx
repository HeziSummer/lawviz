"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { ApiError, api } from "../../../lib/api";

export default function RegisterPage() {
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [lawFirm, setLawFirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [sendingCode, setSendingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function sendCode() {
    setMessage(null);
    setSendingCode(true);
    try {
      await api.sendSmsCode({ phone, purpose: "register" });
      setMessage("Verification code sent.");
    } catch {
      setMessage("Could not send the verification code.");
    } finally {
      setSendingCode(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      await api.register({
        phone,
        sms_code: smsCode,
        email,
        password,
        full_name: fullName,
        law_firm: lawFirm,
      });
      setMessage("Request submitted. An administrator must activate the account before login.");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setMessage("This phone or email is already registered.");
      } else {
        setMessage("Registration failed. Check the SMS code and required fields.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="lv-container grid min-h-screen items-center gap-10 py-10 lg:grid-cols-[1fr_460px]">
      <section>
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold text-accent">LawViz</span>
          <span className="text-[11px] font-semibold uppercase text-muted">Private MVP</span>
        </Link>
        <p className="lv-kicker mt-14">Private Access Request</p>
        <h1 className="mt-5 max-w-2xl font-display text-5xl font-bold leading-tight text-fg">
          Request a verified account
        </h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-muted">
          Registration creates a pending account only. Credits and activation stay under administrator control.
        </p>
      </section>

      <section className="lv-card p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-light text-accent">
            <ShieldCheck size={18} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg">Access request</h2>
            <p className="text-sm text-muted">Phone verification is required.</p>
          </div>
        </div>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-fg">
            Full name
            <input
              className="lv-input mt-2"
              placeholder="Case Lawyer"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium text-fg">
            Law firm
            <input
              className="lv-input mt-2"
              placeholder="Case LLP"
              value={lawFirm}
              onChange={(event) => setLawFirm(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium text-fg">
            Phone
            <div className="mt-2 flex gap-2">
              <input
                className="lv-input"
                placeholder="+15555550110"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
              />
              <button className="lv-btn-ghost shrink-0" type="button" onClick={sendCode} disabled={!phone || sendingCode}>
                {sendingCode ? "Sending..." : "Send code"}
              </button>
            </div>
          </label>
          <label className="block text-sm font-medium text-fg">
            SMS code
            <input
              className="lv-input mt-2"
              placeholder="123456"
              value={smsCode}
              onChange={(event) => setSmsCode(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium text-fg">
            Email
            <input
              className="lv-input mt-2"
              type="email"
              placeholder="lawyer@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium text-fg">
            Password
            <input
              className="lv-input mt-2"
              type="password"
              placeholder="Set a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {message ? <p className="rounded-md bg-surface-2 p-3 text-sm text-muted">{message}</p> : null}
          <button className="lv-btn-coral w-full" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Create pending account"} <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </form>
        <p className="mt-5 text-sm text-muted">
          Already active?{" "}
          <Link href="/auth/login" className="font-semibold text-accent">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
