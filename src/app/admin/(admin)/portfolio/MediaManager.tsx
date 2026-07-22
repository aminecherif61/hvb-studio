"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api, ApiError } from "@/components/vault/api";
import { Btn, Empty, VEASE } from "@/components/vault/ui";

interface Asset {
  id: string;
  fileName: string;
  thumbName: string;
  width: number;
  height: number;
  bytes: number;
  alt: string;
}

export default function MediaManager({ assets }: { assets: Asset[] }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: FileList | File[]) {
    setError(null);
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        await api("/api/vault/media", { formData });
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveAlt(id: string, alt: string) {
    await api("/api/vault/media", { method: "PATCH", body: { id, alt } }).catch(() => undefined);
  }

  async function remove(id: string) {
    if (!confirm("Delete this image and its thumbnail?")) return;
    await api("/api/vault/media", { method: "DELETE", body: { id } });
    router.refresh();
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload images"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) void upload(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center transition-colors duration-500 ${
          dragOver ? "border-champagne/70 bg-champagne/[0.04]" : "border-white/15 hover:border-white/30"
        }`}
      >
        <p className="display text-xl text-ivory/90">{busy ? "Processing…" : "Drop photographs here"}</p>
        <p className="mt-2 max-w-sm text-xs leading-relaxed text-smoke-dark">
          JPEG, PNG, WebP, AVIF or TIFF · up to 15 MB. Images are re-encoded, stripped of metadata and thumbnailed
          automatically.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/tiff"
          multiple
          hidden
          onChange={(e) => e.target.files?.length && void upload(e.target.files)}
        />
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-300/90">
          {error}
        </p>
      )}

      {assets.length === 0 ? (
        <Empty title="Library is empty" body="Uploaded photographs appear here with automatic thumbnails, ready to use." />
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset, i) => (
            <motion.li
              key={asset.id}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.4), ease: VEASE }}
              className="group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- served by our own /media route, already optimized */}
              <img
                src={`/media/${asset.thumbName}`}
                alt={asset.alt || "Uploaded photograph"}
                width={480}
                height={Math.round((480 / asset.width) * asset.height) || 480}
                loading="lazy"
                className="aspect-[4/5] w-full rounded-xl border border-white/[0.06] object-cover"
              />
              <input
                defaultValue={asset.alt}
                placeholder="Describe for alt text…"
                aria-label="Alt text"
                onBlur={(e) => void saveAlt(asset.id, e.target.value.trim())}
                className="mt-2 w-full bg-transparent text-xs text-ivory/80 placeholder:text-smoke-dark focus:outline-none"
              />
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[0.65rem] text-smoke-dark">
                  {asset.width}×{asset.height} · {(asset.bytes / 1024).toFixed(0)} KB
                </span>
                <Btn
                  variant="danger"
                  onClick={() => void remove(asset.id)}
                  className="!px-3 !py-1.5 text-[0.55rem] opacity-0 transition-opacity duration-300 focus:opacity-100 group-hover:opacity-100"
                >
                  Delete
                </Btn>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
