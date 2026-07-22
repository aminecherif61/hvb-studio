"use client";

import { useState, type FormEvent } from "react";
import { api, ApiError } from "@/components/vault/api";
import { Btn, Field, TextInput } from "@/components/vault/ui";

interface SeoValues {
  siteTitle: string;
  siteDescription: string;
  ogImage: string;
}

export default function SeoForm({ initial }: { initial: SeoValues }) {
  const [values, setValues] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await api("/api/vault/settings", { method: "PUT", body: values });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Field label="Site title" hint={`${values.siteTitle.length}/120`}>
        <TextInput
          maxLength={120}
          value={values.siteTitle}
          placeholder="Hamdi Van Buuren — Photographer, Tunis"
          onChange={(e) => setValues((v) => ({ ...v, siteTitle: e.target.value }))}
        />
      </Field>
      <Field label="Meta description" hint={`${values.siteDescription.length}/300 · aim for 150–160`}>
        <textarea
          maxLength={300}
          rows={3}
          value={values.siteDescription}
          placeholder="Wedding, portrait, commercial and live-stage photography…"
          onChange={(e) => setValues((v) => ({ ...v, siteDescription: e.target.value }))}
          className="vault-input resize-none"
        />
      </Field>
      <Field label="Open Graph image path" hint="Path under this domain, e.g. /images/hamdi/weddings/wedding-golden-car-intimate.jpg">
        <TextInput
          maxLength={300}
          value={values.ogImage}
          onChange={(e) => setValues((v) => ({ ...v, ogImage: e.target.value }))}
        />
      </Field>
      {error && (
        <p role="alert" className="text-sm text-red-300/90">
          {error}
        </p>
      )}
      <div className="flex items-center gap-4">
        <Btn type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </Btn>
        {saved && <span className="text-xs text-emerald-300/90">Saved</span>}
      </div>
    </form>
  );
}
