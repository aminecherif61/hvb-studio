import { randomBytes } from "node:crypto";
import sharp, { type Metadata } from "sharp";
import { HttpError } from "./guard";
import { deleteObjects, putObject } from "./storage";

const MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED_INPUT = new Set(["jpeg", "png", "webp", "avif", "tiff"]); // as sniffed by sharp

// Filenames are always server-generated hex + fixed extension; this pattern is
// also the only thing /media/* will serve — no traversal, no executables.
export const SAFE_NAME = /^[a-f0-9]{32}(-thumb)?\.webp$/;

export interface StoredImage {
  fileName: string;
  thumbName: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Hardened image intake: size cap → magic-byte sniff via sharp (extension and
 * client MIME are never trusted) → full re-encode to WebP (strips EXIF/GPS and
 * any embedded payloads) → thumbnail. Stored via the storage layer (Netlify
 * Blobs in production, disk locally). Original bytes are discarded.
 */
export async function processUpload(file: File): Promise<StoredImage> {
  if (file.size === 0 || file.size > MAX_BYTES) {
    throw new HttpError(400, "Image must be between 1 byte and 15 MB");
  }
  const input = Buffer.from(await file.arrayBuffer());

  let meta: Metadata;
  try {
    meta = await sharp(input, { limitInputPixels: 64_000_000 }).metadata();
  } catch {
    throw new HttpError(400, "Unsupported or corrupt image");
  }
  if (!meta.format || !ALLOWED_INPUT.has(meta.format)) {
    throw new HttpError(400, "Only JPEG, PNG, WebP, AVIF or TIFF images are accepted");
  }

  const id = randomBytes(16).toString("hex");
  const fileName = `${id}.webp`;
  const thumbName = `${id}-thumb.webp`;

  const base = sharp(input, { limitInputPixels: 64_000_000 }).rotate(); // apply EXIF orientation, then strip
  const full = await base.clone().resize({ width: 2400, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  const thumb = await base.clone().resize({ width: 480, withoutEnlargement: true }).webp({ quality: 70 }).toBuffer();
  const fullMeta = await sharp(full).metadata();

  await putObject(fileName, full);
  await putObject(thumbName, thumb);

  return {
    fileName,
    thumbName,
    width: fullMeta.width ?? 0,
    height: fullMeta.height ?? 0,
    bytes: full.byteLength,
  };
}

export async function deleteStored(names: string[]): Promise<void> {
  await deleteObjects(names.filter((n) => SAFE_NAME.test(n)));
}
