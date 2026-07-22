import { NextResponse } from "next/server";
import { getObject } from "@/lib/server/storage";
import { SAFE_NAME } from "@/lib/server/uploads";

// Serves optimized uploads from the storage layer (Netlify Blobs in prod,
// disk locally). Only server-generated filenames pass SAFE_NAME, which
// excludes traversal and non-image content.
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!SAFE_NAME.test(name)) return new NextResponse(null, { status: 404 });

  const file = await getObject(name);
  if (!file) return new NextResponse(null, { status: 404 });

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
