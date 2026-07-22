"use client";

import { useState, type FormEvent } from "react";
import { Reveal } from "@/components/motion";

const shootTypes = [
  "Wedding",
  "Studio portrait",
  "Brand campaign",
  "Event",
  "Commercial",
  "Editorial",
  "Other",
];

const budgets = [
  "To discuss",
  "3,000 – 6,000 TND",
  "6,000 – 12,000 TND",
  "12,000 – 20,000 TND",
  "20,000+ TND",
  "Custom production",
];

const inputClass =
  "w-full border-b border-line-dark bg-transparent pb-3 pt-2 text-base text-ivory placeholder:text-smoke-dark focus:border-champagne focus:outline-none transition-colors duration-500";

const labelClass = "label block text-smoke";

export default function BookingForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(
      Array.from(data.entries()).filter(([k]) => k !== "form-name"),
    ) as Record<string, string>;
    setStatus("sending");
    try {
      // Primary: the site's own inquiries API (feeds the Vault dashboard).
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 429) throw new Error("throttled");
      if (!res.ok) {
        // Fallback: Netlify Forms static declaration (see public/__forms.html)
        // keeps inquiries arriving even if the database is unreachable.
        const fallback = await fetch("/__forms.html", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
        });
        if (!fallback.ok) throw new Error(String(fallback.status));
      }
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <Reveal>
        <div className="border border-line-dark p-12 text-center md:p-20">
          <p className="label text-champagne">Inquiry received</p>
          <p className="display mt-6 text-3xl text-ivory md:text-4xl">
            Thank you. You will hear back personally.
          </p>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-smoke">
            Availability, approach and a tailored proposal follow — usually within
            two working days.
          </p>
        </div>
      </Reveal>
    );
  }

  return (
    <form
      name="booking"
      method="POST"
      action="/__forms.html"
      onSubmit={onSubmit}
      className="grid gap-x-10 gap-y-12 md:grid-cols-2"
    >
      <input type="hidden" name="form-name" value="booking" />
      {/* Honeypot — humans never see or fill this */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        defaultValue=""
      />

      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input id="name" name="name" type="text" required autoComplete="name" className={inputClass} />
      </div>
      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
      </div>
      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone <span className="normal-case text-smoke-dark">(optional)</span>
        </label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
      </div>
      <div>
        <label htmlFor="shootType" className={labelClass}>
          Type of shoot
        </label>
        <div className="relative">
          <select id="shootType" name="shootType" className={`${inputClass} appearance-none pr-8`} defaultValue="Wedding">
            {shootTypes.map((t) => (
              <option key={t} value={t} className="bg-noir text-ivory">
                {t}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-smoke" aria-hidden>
            ↓
          </span>
        </div>
      </div>
      <div>
        <label htmlFor="date" className={labelClass}>
          Date <span className="normal-case text-smoke-dark">(if known)</span>
        </label>
        <input id="date" name="date" type="text" placeholder="e.g. 12 September 2026" className={inputClass} />
      </div>
      <div>
        <label htmlFor="location" className={labelClass}>
          Location
        </label>
        <input id="location" name="location" type="text" placeholder="City, venue or country" className={inputClass} />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="budget" className={labelClass}>
          Budget
        </label>
        <div className="relative">
          <select id="budget" name="budget" className={`${inputClass} appearance-none pr-8`} defaultValue="To discuss">
            {budgets.map((b) => (
              <option key={b} value={b} className="bg-noir text-ivory">
                {b}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-smoke" aria-hidden>
            ↓
          </span>
        </div>
      </div>
      <div className="md:col-span-2">
        <label htmlFor="message" className={labelClass}>
          The story
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="The place, the people, the feeling you want the photographs to keep."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="label border border-ivory/40 px-12 py-5 text-ivory transition-colors duration-500 hover:border-champagne hover:text-champagne disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send Inquiry"}
        </button>
        {status === "error" && (
          <p className="mt-6 text-sm text-smoke" role="alert">
            The form could not be sent. Reach out directly on Instagram{" "}
            <a
              href="https://www.instagram.com/hamdi_van_buuren/"
              target="_blank"
              rel="noopener noreferrer"
              className="link-draw text-ivory"
            >
              @hamdi_van_buuren
            </a>{" "}
            — messages are answered personally.
          </p>
        )}
      </div>
    </form>
  );
}
