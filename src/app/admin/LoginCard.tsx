"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { api, ApiError } from "@/components/vault/api";
import { Btn, TextInput, VEASE } from "@/components/vault/ui";

type Step = "credentials" | "mfa" | "forgot" | "forgot-sent";

export default function LoginCard() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const emailRef = useRef<HTMLInputElement>(null);

  // If a live refresh token exists, resume the session silently.
  useEffect(() => {
    let cancelled = false;
    api("/api/vault/auth/refresh")
      .then(() => {
        if (!cancelled) router.replace("/admin/overview");
      })
      .catch(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!checking) emailRef.current?.focus();
  }, [checking]);

  async function submitCredentials(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ ok?: boolean; mfaRequired?: boolean }>("/api/vault/auth/login", {
        body: { email, password, website: "" },
      });
      if (res.mfaRequired) {
        setStep("mfa");
      } else {
        router.replace("/admin/overview");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function submitMfa(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/vault/auth/mfa", { body: { code, rememberDevice } });
      router.replace("/admin/overview");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function submitForgot(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/vault/auth/forgot", { body: { email } });
      setStep("forgot-sent");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const transition = { duration: 0.5, ease: VEASE };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: VEASE }}
      className="glass-strong relative z-10 w-full max-w-md px-8 py-10 md:px-12 md:py-14"
    >
      <div className="mb-10 text-center">
        <Image
          src="/images/hamdi/brand/hvb-monogram-ivory.png"
          alt="HVB Studio"
          width={800}
          height={258}
          sizes="120px"
          className="mx-auto h-9 w-auto opacity-90"
          priority
        />
        <p className="label mt-4 text-smoke">The Vault</p>
      </div>

      {checking ? (
        <div className="flex justify-center py-10" role="status" aria-label="Checking session">
          <span className="h-5 w-5 animate-spin rounded-full border border-white/20 border-t-champagne" />
        </div>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          {step === "credentials" && (
            <motion.form
              key="credentials"
              onSubmit={submitCredentials}
              initial={reduce ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: 12 }}
              transition={transition}
              className="space-y-5"
            >
              <TextInput
                ref={emailRef}
                type="email"
                autoComplete="email"
                placeholder="Email"
                aria-label="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="relative">
                <TextInput
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Password"
                  aria-label="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="label absolute right-3 top-1/2 -translate-y-1/2 text-[0.56rem] text-smoke transition-colors hover:text-ivory"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {error && (
                <p role="alert" className="text-sm text-red-300/90">
                  {error}
                </p>
              )}
              <Btn type="submit" disabled={busy} className="w-full">
                {busy ? "Signing in…" : "Enter the Vault"}
              </Btn>
              <button
                type="button"
                onClick={() => {
                  setStep("forgot");
                  setError(null);
                }}
                className="link-draw label mx-auto block text-smoke hover:text-ivory"
              >
                Forgot password
              </button>
            </motion.form>
          )}

          {step === "mfa" && (
            <motion.form
              key="mfa"
              onSubmit={submitMfa}
              initial={reduce ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -12 }}
              transition={transition}
              className="space-y-5"
            >
              <p className="text-center text-sm leading-relaxed text-smoke">
                Enter the 6-digit code from your authenticator app, or a recovery code.
              </p>
              <TextInput
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000 000"
                aria-label="Authentication code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center tracking-[0.4em]"
              />
              <label className="flex items-center justify-center gap-3 text-xs text-smoke">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="h-4 w-4 accent-[#c3a878]"
                />
                Trust this device for 30 days
              </label>
              {error && (
                <p role="alert" className="text-sm text-red-300/90">
                  {error}
                </p>
              )}
              <Btn type="submit" disabled={busy} className="w-full">
                {busy ? "Verifying…" : "Verify"}
              </Btn>
            </motion.form>
          )}

          {step === "forgot" && (
            <motion.form
              key="forgot"
              onSubmit={submitForgot}
              initial={reduce ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -12 }}
              transition={transition}
              className="space-y-5"
            >
              <p className="text-center text-sm leading-relaxed text-smoke">
                Enter your email — if an account exists, a single-use reset link (valid 15 minutes) will be sent.
              </p>
              <TextInput
                autoFocus
                type="email"
                autoComplete="email"
                placeholder="Email"
                aria-label="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && (
                <p role="alert" className="text-sm text-red-300/90">
                  {error}
                </p>
              )}
              <Btn type="submit" disabled={busy} className="w-full">
                {busy ? "Sending…" : "Send Reset Link"}
              </Btn>
              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setError(null);
                }}
                className="link-draw label mx-auto block text-smoke hover:text-ivory"
              >
                Back to sign in
              </button>
            </motion.form>
          )}

          {step === "forgot-sent" && (
            <motion.div
              key="sent"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transition}
              className="space-y-6 text-center"
            >
              <p className="display text-2xl text-ivory">Check your inbox.</p>
              <p className="text-sm leading-relaxed text-smoke">
                If that account exists, a reset link is on its way. It expires in 15 minutes and works once.
              </p>
              <button
                type="button"
                onClick={() => setStep("credentials")}
                className="link-draw label mx-auto block text-smoke hover:text-ivory"
              >
                Back to sign in
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}
