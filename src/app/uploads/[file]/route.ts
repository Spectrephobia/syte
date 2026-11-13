import { readFile } from "fs/promises"
import path from "path"
import { MIME_BY_EXT, UPLOAD_DIR } from "@/lib/storage"

// Serves admin uploads at /uploads/<file>. Needed because files written after
// `next build` (or to a persistent disk outside public/) are not served statically.
export const dynamic = "force-dynamic"

const SAFE_NAME = /^[a-zA-Z0-9-]+\.(jpg|png|webp|svg)$/

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  if (!SAFE_NAME.test(file)) return new Response("Not found", { status: 404 })

  const ext = file.split(".").pop() as string
  try {
    const data = await readFile(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, file))
    const headers: Record<string, string> = {
      "Content-Type": MIME_BY_EXT[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    }
    // SVG can carry scripts — never let it execute when opened directly.
    if (ext === "svg") headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox"
    return new Response(new Uint8Array(data), { headers })
  } catch {
    return new Response("Not found", { status: 404 })
  }
}
