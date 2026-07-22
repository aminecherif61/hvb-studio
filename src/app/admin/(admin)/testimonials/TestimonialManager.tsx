"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, ApiError } from "@/components/vault/api";
import { Badge, Btn, Empty, Field, TextInput } from "@/components/vault/ui";

interface Row {
  id: string;
  author: string;
  role: string;
  quote: string;
  published: boolean;
}

export default function TestimonialManager({ items }: { items: Row[] }) {
  const router = useRouter();
  const [author, setAuthor] = useState("");
  const [role, setRole] = useState("");
  const [quote, setQuote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/vault/testimonials", { body: { author, role, quote, published: false } });
      setAuthor("");
      setRole("");
      setQuote("");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function setPublished(id: string, published: boolean) {
    await api("/api/vault/testimonials", { method: "PATCH", body: { id, published } });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await api("/api/vault/testimonials", { method: "DELETE", body: { id } });
    router.refresh();
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
      <form onSubmit={add} className="space-y-5">
        <Field label="Client name">
          <TextInput required maxLength={120} value={author} onChange={(e) => setAuthor(e.target.value)} />
        </Field>
        <Field label="Context (optional)" hint="e.g. Wedding, Mövenpick Gammarth 2026">
          <TextInput maxLength={120} value={role} onChange={(e) => setRole(e.target.value)} />
        </Field>
        <Field label="Their words">
          <textarea
            required
            maxLength={1000}
            rows={4}
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            className="vault-input resize-none"
          />
        </Field>
        {error && (
          <p role="alert" className="text-sm text-red-300/90">
            {error}
          </p>
        )}
        <Btn type="submit" disabled={busy}>
          {busy ? "Saving…" : "Add Testimonial"}
        </Btn>
      </form>

      <div>
        {items.length === 0 ? (
          <Empty title="None yet" body="Add real client words on the left — publish them when the site is ready to show them." />
        ) : (
          <ul className="space-y-4">
            {items.map((t) => (
              <li key={t.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
                <p className="display text-lg italic leading-snug text-ivory/90">“{t.quote}”</p>
                <p className="mt-3 text-xs text-smoke">
                  {t.author}
                  {t.role && <span className="text-smoke-dark"> · {t.role}</span>}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <Badge tone={t.published ? "green" : "gray"}>{t.published ? "published" : "draft"}</Badge>
                  <Btn variant="ghost" className="!px-3 !py-1.5 text-[0.55rem]" onClick={() => void setPublished(t.id, !t.published)}>
                    {t.published ? "Unpublish" : "Publish"}
                  </Btn>
                  <Btn variant="danger" className="!px-3 !py-1.5 text-[0.55rem]" onClick={() => void remove(t.id)}>
                    Delete
                  </Btn>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
