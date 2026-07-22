import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { env } from "./env";

// Media persistence. On Netlify (serverless, ephemeral disk) uploads go to
// Netlify Blobs; locally they go to UPLOADS_DIR on disk. The processing and
// validation pipeline in uploads.ts is identical either way.

const STORE = "hvb-media";
const onNetlify = Boolean(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT);

function localRoot(): string {
  return resolve(process.cwd(), env.UPLOADS_DIR);
}

export async function putObject(name: string, data: Buffer): Promise<void> {
  if (onNetlify) {
    const { getStore } = await import("@netlify/blobs");
    const ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
    await getStore(STORE).set(name, ab);
    return;
  }
  const root = localRoot();
  await mkdir(root, { recursive: true });
  await writeFile(join(root, name), data);
}

export async function getObject(name: string): Promise<Buffer | null> {
  if (onNetlify) {
    const { getStore } = await import("@netlify/blobs");
    const buf = await getStore(STORE).get(name, { type: "arrayBuffer" });
    return buf ? Buffer.from(buf as ArrayBuffer) : null;
  }
  try {
    return await readFile(join(localRoot(), name));
  } catch {
    return null;
  }
}

export async function deleteObjects(names: string[]): Promise<void> {
  if (onNetlify) {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore(STORE);
    await Promise.all(names.map((n) => store.delete(n).catch(() => undefined)));
    return;
  }
  const root = localRoot();
  await Promise.all(names.map((n) => unlink(join(root, n)).catch(() => undefined)));
}
