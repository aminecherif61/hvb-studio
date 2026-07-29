import { randomBytes } from "node:crypto";
import { db } from "./db";
import { databaseConfigured, safe } from "./safe-db";

/**
 * Persistence for booking/contact inquiries.
 *
 * Primary store is Vercel Blob with **private** access — one JSON object per
 * inquiry, readable only with the store token, never over a public URL. This
 * keeps client details private and survives without a database (serverless
 * filesystems are ephemeral, and a lost inquiry is a lost client). When a
 * Postgres database is attached it is used instead.
 */

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  shootType: string;
  date: string;
  location: string;
  budget: string;
  message: string;
  status: "new" | "replied" | "archived";
  createdAt: string;
  ip?: string;
}

const PREFIX = "inquiries/";
const ACCESS = "private" as const;

export function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

const token = () => process.env.BLOB_READ_WRITE_TOKEN;

/** Pathname carries an inverted timestamp so listings come back newest-first. */
function pathFor(createdAt: string, id: string): string {
  const inverted = (9_999_999_999_999 - new Date(createdAt).getTime()).toString().padStart(13, "0");
  return `${PREFIX}${inverted}-${id}.json`;
}

async function readBlob(pathname: string): Promise<Inquiry | null> {
  try {
    const { get } = await import("@vercel/blob");
    const result = await get(pathname, { access: ACCESS, useCache: false, token: token() });
    if (!result) return null;
    const text = await new Response(result.stream as unknown as ReadableStream).text();
    return JSON.parse(text) as Inquiry;
  } catch {
    return null;
  }
}

export async function saveInquiry(input: Omit<Inquiry, "id" | "status" | "createdAt">): Promise<boolean> {
  const record: Inquiry = {
    ...input,
    id: randomBytes(9).toString("hex"),
    status: "new",
    createdAt: new Date().toISOString(),
  };

  if (blobConfigured()) {
    try {
      const { put } = await import("@vercel/blob");
      await put(pathFor(record.createdAt, record.id), JSON.stringify(record), {
        access: ACCESS,
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
        token: token(),
      });
      return true;
    } catch (err) {
      console.error(JSON.stringify({ level: "error", scope: "inquiry.blob", err: String(err).slice(0, 200) }));
    }
  }

  if (databaseConfigured()) {
    const ok = await safe(
      async () => {
        await db.inquiry.create({ data: { ...input, status: "new" } });
        return true;
      },
      false,
      "inquiry.create",
    );
    if (ok) return true;
  }

  return false;
}

export async function listInquiries(limit = 200): Promise<Inquiry[]> {
  if (blobConfigured()) {
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: PREFIX, limit, token: token() });
      const records = await Promise.all(blobs.map((b) => readBlob(b.pathname)));
      return records
        .filter((r): r is Inquiry => r !== null)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch (err) {
      console.error(JSON.stringify({ level: "error", scope: "inquiry.list", err: String(err).slice(0, 200) }));
    }
  }

  if (databaseConfigured()) {
    const rows = await safe(
      () => db.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: limit }),
      [] as Awaited<ReturnType<typeof db.inquiry.findMany>>,
      "inquiry.list",
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone ?? "",
      shootType: r.shootType,
      date: r.date ?? "",
      location: r.location ?? "",
      budget: r.budget ?? "",
      message: r.message,
      status: r.status as Inquiry["status"],
      createdAt: r.createdAt.toISOString(),
    }));
  }

  return [];
}

/** Find the stored pathname for an inquiry id. */
async function findPath(id: string): Promise<{ pathname: string; record: Inquiry } | null> {
  const { list } = await import("@vercel/blob");
  const { blobs } = await list({ prefix: PREFIX, limit: 500, token: token() });
  for (const b of blobs) {
    const record = await readBlob(b.pathname);
    if (record?.id === id) return { pathname: b.pathname, record };
  }
  return null;
}

export async function setInquiryStatus(id: string, status: Inquiry["status"]): Promise<boolean> {
  if (blobConfigured()) {
    try {
      const found = await findPath(id);
      if (!found) return false;
      const { put } = await import("@vercel/blob");
      await put(found.pathname, JSON.stringify({ ...found.record, status }), {
        access: ACCESS,
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
        token: token(),
      });
      return true;
    } catch (err) {
      console.error(JSON.stringify({ level: "error", scope: "inquiry.status", err: String(err).slice(0, 200) }));
      return false;
    }
  }

  if (databaseConfigured()) {
    return safe(
      async () => (await db.inquiry.updateMany({ where: { id }, data: { status } })).count === 1,
      false,
      "inquiry.status",
    );
  }
  return false;
}

export async function deleteInquiry(id: string): Promise<boolean> {
  if (blobConfigured()) {
    try {
      const found = await findPath(id);
      if (!found) return false;
      const { del } = await import("@vercel/blob");
      await del(found.pathname, { token: token() });
      return true;
    } catch (err) {
      console.error(JSON.stringify({ level: "error", scope: "inquiry.delete", err: String(err).slice(0, 200) }));
      return false;
    }
  }

  if (databaseConfigured()) {
    return safe(async () => (await db.inquiry.deleteMany({ where: { id } })).count === 1, false, "inquiry.delete");
  }
  return false;
}

export async function countInquiries(): Promise<{ total: number; newCount: number; last30: number }> {
  const all = await listInquiries(500);
  const cutoff = Date.now() - 30 * 86_400_000;
  return {
    total: all.length,
    newCount: all.filter((i) => i.status === "new").length,
    last30: all.filter((i) => new Date(i.createdAt).getTime() >= cutoff).length,
  };
}
