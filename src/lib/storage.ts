import path from "path"

/**
 * Where admin-uploaded media is stored on disk.
 * - Local dev / plain Node host: public/uploads (default)
 * - Render (or any host with a mounted persistent disk): set UPLOAD_DIR,
 *   e.g. UPLOAD_DIR=/var/data/uploads
 * Files are always served at /uploads/<file> by src/app/uploads/[file]/route.ts.
 */
export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR)
  : path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads")

/** Accepted upload types → file extension (never trust the client filename). */
export const UPLOAD_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
}

export const MIME_BY_EXT: Record<string, string> = Object.fromEntries(
  Object.entries(UPLOAD_TYPES).map(([mime, ext]) => [ext, mime])
)
