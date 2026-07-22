"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/components/vault/api";
import { Badge, Btn, VEASE } from "@/components/vault/ui";

export interface InquiryRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  shootType: string;
  date: string;
  location: string;
  budget: string;
  message: string;
  status: string;
  createdAt: string;
}

const FILTERS = ["all", "new", "replied", "archived"] as const;

export default function InquiryList({ items }: { items: InquiryRow[] }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const visible = items.filter((i) => filter === "all" || i.status === filter);

  async function setStatus(id: string, status: string) {
    setBusyId(id);
    try {
      await api("/api/vault/inquiries", { method: "PATCH", body: { id, status } });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this inquiry permanently?")) return;
    setBusyId(id);
    try {
      await api("/api/vault/inquiries", { method: "DELETE", body: { id } });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div role="group" aria-label="Filter inquiries" className="flex flex-wrap gap-6 border-b border-white/[0.06] pb-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`label transition-colors duration-300 ${filter === f ? "text-champagne" : "text-smoke hover:text-ivory"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <ul className="divide-y divide-white/[0.06]">
        {visible.map((inq) => {
          const open = openId === inq.id;
          return (
            <li key={inq.id} className="py-4">
              <button
                onClick={() => setOpenId(open ? null : inq.id)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-ivory/90">
                    {inq.name} <span className="text-smoke-dark">· {inq.shootType}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-smoke-dark">
                    {new Date(inq.createdAt).toLocaleString("en-GB")}
                    {inq.location && ` · ${inq.location}`}
                  </p>
                </div>
                <Badge tone={inq.status === "new" ? "gold" : inq.status === "replied" ? "green" : "gray"}>
                  {inq.status}
                </Badge>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduce ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: VEASE }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                      <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="label inline text-smoke-dark">Email </dt>
                          <dd className="inline text-ivory/85">{inq.email}</dd>
                        </div>
                        {inq.phone && (
                          <div>
                            <dt className="label inline text-smoke-dark">Phone </dt>
                            <dd className="inline text-ivory/85">{inq.phone}</dd>
                          </div>
                        )}
                        {inq.date && (
                          <div>
                            <dt className="label inline text-smoke-dark">Date </dt>
                            <dd className="inline text-ivory/85">{inq.date}</dd>
                          </div>
                        )}
                        {inq.budget && (
                          <div>
                            <dt className="label inline text-smoke-dark">Budget </dt>
                            <dd className="inline text-ivory/85">{inq.budget}</dd>
                          </div>
                        )}
                      </dl>
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ivory/80">{inq.message}</p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <a
                          href={`mailto:${encodeURIComponent(inq.email)}?subject=${encodeURIComponent("Your inquiry — Hamdi Van Buuren")}`}
                          className="label rounded-xl border border-champagne/60 px-5 py-3 text-champagne transition-colors duration-500 hover:bg-champagne hover:text-noir"
                        >
                          Reply by email
                        </a>
                        {inq.status !== "replied" && (
                          <Btn variant="ghost" disabled={busyId === inq.id} onClick={() => setStatus(inq.id, "replied")}>
                            Mark replied
                          </Btn>
                        )}
                        {inq.status !== "archived" && (
                          <Btn variant="ghost" disabled={busyId === inq.id} onClick={() => setStatus(inq.id, "archived")}>
                            Archive
                          </Btn>
                        )}
                        <Btn variant="danger" disabled={busyId === inq.id} onClick={() => remove(inq.id)}>
                          Delete
                        </Btn>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
        {visible.length === 0 && <li className="py-10 text-center text-sm text-smoke-dark">Nothing under this filter.</li>}
      </ul>
    </div>
  );
}
