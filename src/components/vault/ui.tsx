"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

export const VEASE = [0.22, 1, 0.36, 1] as const;

export function Rise({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: VEASE }}
    >
      {children}
    </motion.div>
  );
}

export function PageTitle({ kicker, title, action }: { kicker: string; title: string; action?: ReactNode }) {
  return (
    <Rise className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="label text-champagne">{kicker}</p>
        <h1 className="display mt-2 text-3xl text-[#f3eee6] md:text-4xl">{title}</h1>
      </div>
      {action}
    </Rise>
  );
}

export function Card({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Rise delay={delay} className={`glass p-6 md:p-7 ${className}`}>
      {children}
    </Rise>
  );
}

export function StatCard({
  label,
  value,
  hint,
  delay = 0,
}: {
  label: string;
  value: string;
  hint?: string;
  delay?: number;
}) {
  return (
    <Card delay={delay}>
      <p className="label text-smoke">{label}</p>
      <p className="display mt-3 text-4xl text-[#f3eee6]">{value}</p>
      {hint && <p className="mt-2 text-xs text-smoke-dark">{hint}</p>}
    </Card>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" };

export function Btn({ variant = "primary", className = "", ...props }: BtnProps) {
  const styles = {
    primary:
      "border border-champagne/60 text-champagne hover:bg-champagne hover:text-noir disabled:hover:bg-transparent disabled:hover:text-champagne",
    ghost: "border border-white/15 text-ivory/80 hover:border-white/40 hover:text-ivory",
    danger: "border border-red-400/30 text-red-300/90 hover:border-red-400/70 hover:bg-red-500/10",
  }[variant];
  return (
    <button
      {...props}
      className={`label rounded-xl px-5 py-3 transition-colors duration-500 disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`}
    />
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="label mb-2 block text-smoke">{label}</span>
      {children}
      {hint && <span className="mt-2 block text-xs text-smoke-dark">{hint}</span>}
    </label>
  );
}

export function TextInput(props: ComponentProps<"input">) {
  return <input {...props} className={`vault-input ${props.className ?? ""}`} />;
}

export function Badge({ tone, children }: { tone: "gold" | "gray" | "green" | "red"; children: ReactNode }) {
  const styles = {
    gold: "border-champagne/40 text-champagne",
    gray: "border-white/15 text-smoke",
    green: "border-emerald-400/30 text-emerald-300",
    red: "border-red-400/30 text-red-300",
  }[tone];
  return (
    <span className={`label inline-block rounded-full border px-3 py-1 text-[0.58rem] ${styles}`}>{children}</span>
  );
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="py-16 text-center">
      <p className="display text-2xl text-ivory/80">{title}</p>
      <p className="mx-auto mt-3 max-w-sm text-sm text-smoke">{body}</p>
    </div>
  );
}

/** Minimal inline sparkline — no chart library, pure SVG. */
export function Sparkline({ points, height = 56 }: { points: number[]; height?: number }) {
  const max = Math.max(...points, 1);
  const w = 100;
  const step = w / Math.max(points.length - 1, 1);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(2)},${(height - (p / max) * (height - 6) - 3).toFixed(2)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="h-14 w-full" preserveAspectRatio="none" aria-hidden>
      <path d={d} fill="none" stroke="#c3a878" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
