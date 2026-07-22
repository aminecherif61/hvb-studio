"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, ApiError } from "@/components/vault/api";
import { Badge, Btn, Card, Field, TextInput, VEASE } from "@/components/vault/ui";

interface SessionRow {
  id: string;
  browser: string;
  os: string;
  ip: string;
  lastActiveAt: string;
}
interface DeviceRow {
  id: string;
  label: string;
  createdAt: string;
  expiresAt: string;
}

export default function SecurityPanel({
  email,
  totpEnabled,
  currentSessionId,
  sessions,
  devices,
}: {
  email: string;
  totpEnabled: boolean;
  currentSessionId: string;
  sessions: SessionRow[];
  devices: DeviceRow[];
}) {
  const router = useRouter();
  const reduce = useReducedMotion();

  // — password change —
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // — 2FA —
  const [setup, setSetup] = useState<{ qr: string; secret: string } | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [disablePassword, setDisablePassword] = useState("");
  const [mfaBusy, setMfaBusy] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPwBusy(true);
    setPwMsg(null);
    try {
      await api("/api/vault/account/password", { method: "PUT", body: { currentPassword, newPassword } });
      setPwMsg({ ok: true, text: "Password updated — other sessions were signed out." });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPwMsg({ ok: false, text: err instanceof ApiError ? err.message : "Something went wrong" });
    } finally {
      setPwBusy(false);
    }
  }

  async function startSetup() {
    setMfaBusy(true);
    setMfaError(null);
    try {
      const res = await api<{ qr: string; secret: string }>("/api/vault/account/2fa");
      setSetup(res);
    } catch (err) {
      setMfaError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setMfaBusy(false);
    }
  }

  async function confirmSetup(e: FormEvent) {
    e.preventDefault();
    setMfaBusy(true);
    setMfaError(null);
    try {
      const res = await api<{ recoveryCodes: string[] }>("/api/vault/account/2fa", {
        method: "PUT",
        body: { code: totpCode },
      });
      setRecoveryCodes(res.recoveryCodes);
      setSetup(null);
      setTotpCode("");
      router.refresh();
    } catch (err) {
      setMfaError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setMfaBusy(false);
    }
  }

  async function disable2fa(e: FormEvent) {
    e.preventDefault();
    if (!confirm("Disable two-factor authentication?")) return;
    setMfaBusy(true);
    setMfaError(null);
    try {
      await api("/api/vault/account/2fa", { method: "DELETE", body: { password: disablePassword } });
      setDisablePassword("");
      router.refresh();
    } catch (err) {
      setMfaError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setMfaBusy(false);
    }
  }

  async function revokeSession(id?: string) {
    await api("/api/vault/sessions", { method: "DELETE", body: id ? { id } : { allOthers: true } });
    router.refresh();
  }

  async function forgetDevice(id: string) {
    await api("/api/vault/devices", { method: "DELETE", body: { id } });
    router.refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <p className="label text-smoke">Signed in as</p>
        <p className="mt-2 text-sm text-ivory/90">{email}</p>

        <form onSubmit={changePassword} className="mt-8 space-y-5">
          <p className="label text-smoke">Change password</p>
          <Field label="Current password">
            <TextInput
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </Field>
          <Field label="New password" hint="14+ chars · upper & lower · number · special. Breached passwords are rejected.">
            <TextInput
              type="password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Field>
          {pwMsg && (
            <p role={pwMsg.ok ? "status" : "alert"} className={`text-sm ${pwMsg.ok ? "text-emerald-300/90" : "text-red-300/90"}`}>
              {pwMsg.text}
            </p>
          )}
          <Btn type="submit" disabled={pwBusy}>
            {pwBusy ? "Saving…" : "Update Password"}
          </Btn>
        </form>
      </Card>

      <Card delay={0.05}>
        <div className="flex items-center justify-between">
          <p className="label text-smoke">Two-factor authentication</p>
          <Badge tone={totpEnabled ? "green" : "gray"}>{totpEnabled ? "enabled" : "off"}</Badge>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {recoveryCodes ? (
            <motion.div
              key="codes"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: VEASE }}
              className="mt-6"
            >
              <p className="text-sm text-ivory/90">Two-factor is on. Store these recovery codes somewhere safe —</p>
              <p className="mt-1 text-xs text-smoke-dark">each works once, and they are shown only now.</p>
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 font-mono text-sm text-champagne">
                {recoveryCodes.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
              <Btn variant="ghost" className="mt-4" onClick={() => setRecoveryCodes(null)}>
                I have saved them
              </Btn>
            </motion.div>
          ) : setup ? (
            <motion.form
              key="setup"
              onSubmit={confirmSetup}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: VEASE }}
              className="mt-6 space-y-5"
            >
              <p className="text-sm leading-relaxed text-smoke">
                Scan with Google Authenticator (or any TOTP app), then confirm with the current code.
              </p>
              <div className="flex items-start gap-5">
                <Image src={setup.qr} alt="TOTP QR code" width={132} height={132} className="rounded-lg" unoptimized />
                <div className="min-w-0">
                  <p className="label text-smoke-dark">Manual key</p>
                  <p className="mt-1 break-all font-mono text-xs text-ivory/80">{setup.secret}</p>
                </div>
              </div>
              <TextInput
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit code"
                aria-label="Authenticator code"
                required
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                className="max-w-[200px] text-center tracking-[0.3em]"
              />
              {mfaError && (
                <p role="alert" className="text-sm text-red-300/90">
                  {mfaError}
                </p>
              )}
              <div className="flex gap-3">
                <Btn type="submit" disabled={mfaBusy}>
                  {mfaBusy ? "Verifying…" : "Confirm & Enable"}
                </Btn>
                <Btn type="button" variant="ghost" onClick={() => setSetup(null)}>
                  Cancel
                </Btn>
              </div>
            </motion.form>
          ) : totpEnabled ? (
            <motion.form
              key="disable"
              onSubmit={disable2fa}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 space-y-5"
            >
              <p className="text-sm leading-relaxed text-smoke">
                Codes are required at every new sign-in. Trusted devices skip the prompt for 30 days.
              </p>
              <Field label="Confirm password to disable">
                <TextInput
                  type="password"
                  autoComplete="current-password"
                  required
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                />
              </Field>
              {mfaError && (
                <p role="alert" className="text-sm text-red-300/90">
                  {mfaError}
                </p>
              )}
              <Btn type="submit" variant="danger" disabled={mfaBusy}>
                Disable 2FA
              </Btn>
            </motion.form>
          ) : (
            <motion.div key="off" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
              <p className="text-sm leading-relaxed text-smoke">
                Add an authenticator app so a stolen password alone can never open the Vault.
              </p>
              {mfaError && (
                <p role="alert" className="mt-3 text-sm text-red-300/90">
                  {mfaError}
                </p>
              )}
              <Btn className="mt-5" disabled={mfaBusy} onClick={() => void startSetup()}>
                {mfaBusy ? "Preparing…" : "Enable 2FA"}
              </Btn>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Card delay={0.1}>
        <div className="flex items-center justify-between">
          <p className="label text-smoke">Active sessions</p>
          {sessions.length > 1 && (
            <Btn variant="ghost" className="!px-3 !py-1.5 text-[0.55rem]" onClick={() => void revokeSession()}>
              Sign out others
            </Btn>
          )}
        </div>
        <ul className="mt-5 divide-y divide-white/[0.06]">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-ivory/90">
                  {s.browser} <span className="text-smoke-dark">· {s.os}</span>
                </p>
                <p className="mt-0.5 text-xs text-smoke-dark">
                  {s.ip} · active {new Date(s.lastActiveAt).toLocaleString("en-GB")}
                </p>
              </div>
              {s.id === currentSessionId ? (
                <Badge tone="gold">this device</Badge>
              ) : (
                <Btn variant="danger" className="!px-3 !py-1.5 text-[0.55rem]" onClick={() => void revokeSession(s.id)}>
                  Revoke
                </Btn>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card delay={0.15}>
        <p className="label text-smoke">Trusted devices</p>
        {devices.length === 0 ? (
          <p className="mt-5 text-sm text-smoke-dark">None — every sign-in asks for a code.</p>
        ) : (
          <ul className="mt-5 divide-y divide-white/[0.06]">
            {devices.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-ivory/90">{d.label}</p>
                  <p className="mt-0.5 text-xs text-smoke-dark">
                    trusted {new Date(d.createdAt).toLocaleDateString("en-GB")} · until{" "}
                    {new Date(d.expiresAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <Btn variant="danger" className="!px-3 !py-1.5 text-[0.55rem]" onClick={() => void forgetDevice(d.id)}>
                  Forget
                </Btn>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
