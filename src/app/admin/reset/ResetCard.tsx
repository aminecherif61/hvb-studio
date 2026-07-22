"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, ApiError } from "@/components/vault/api";
import { Btn, TextInput, VEASE } from "@/components/vault/ui";

const RULES = [
  { test: (v: string) => v.length >= 14, label: "14+ characters" },
  { test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v), label: "Upper & lower case" },
  { test: (v: string) => /[0-9]/.test(v), label: "A number" },
  { test: (v: string) => /[^A-Za-z0-9]/.test(v), label: "A special character" },
];

export default function ResetCard({ token }: { token: string }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/vault/auth/reset", { body: { token, password } });
      setDone(true);
      setTimeout(() => router.replace("/admin"), 1800);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: VEASE }}
      className="glass-strong w-full max-w-md px-8 py-12 md:px-12"
    >
      {done ? (
        <div className="text-center">
          <p className="display text-2xl text-ivory">Password updated.</p>
          <p className="mt-3 text-sm text-smoke">All sessions were signed out. Redirecting to sign in…</p>
        </div>
      ) : !token ? (
        <div className="text-center">
          <p className="display text-2xl text-ivory">Link incomplete.</p>
          <p className="mt-3 text-sm text-smoke">Open the reset link from your email again.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-6">
          <div className="text-center">
            <p className="label text-champagne">The Vault</p>
            <h1 className="display mt-3 text-3xl text-ivory">Choose a new password</h1>
          </div>
          <div className="relative">
            <TextInput
              autoFocus
              type={show ? "text" : "password"}
              autoComplete="new-password"
              placeholder="New password"
              aria-label="New password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-16"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              className="label absolute right-3 top-1/2 -translate-y-1/2 text-[0.56rem] text-smoke hover:text-ivory"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
          <ul className="grid grid-cols-2 gap-2" aria-label="Password requirements">
            {RULES.map((rule) => {
              const ok = rule.test(password);
              return (
                <li key={rule.label} className={`text-xs transition-colors ${ok ? "text-emerald-300/90" : "text-smoke-dark"}`}>
                  {ok ? "✓" : "·"} {rule.label}
                </li>
              );
            })}
          </ul>
          {error && (
            <p role="alert" className="text-sm text-red-300/90">
              {error}
            </p>
          )}
          <Btn type="submit" disabled={busy || !RULES.every((r) => r.test(password))} className="w-full">
            {busy ? "Saving…" : "Set Password"}
          </Btn>
        </form>
      )}
    </motion.div>
  );
}
