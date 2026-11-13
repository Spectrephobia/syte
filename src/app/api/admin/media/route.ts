import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth/session"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { randomUUID } from "crypto"
import { UPLOAD_DIR, UPLOAD_TYPES } from "@/lib/storage"

const MAX_BYTES = 5 * 1024 * 1024

export async function GET() {
  try {
    await getCurrentAdmin()
    const media = await db.mediaAsset.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json({ media })
  } catch (e) {
    if ((e as Error).message === "UNAUTHORIZED") return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await getCurrentAdmin()
    const formData = await req.formData()
    const file = formData.get("file")
    const altFa = formData.get("altFa") as string | null
    const altEn = formData.get("altEn") as string | null
    if (!(file instanceof File)) return NextResponse.json({ error: "no_file" }, { status: 400 })
    const ext = UPLOAD_TYPES[file.type]
    if (!ext) return NextResponse.json({ error: "invalid_type" }, { status: 400 })
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "too_large" }, { status: 400 })

    const filename = `${randomUUID()}.${ext}`
    if (!existsSync(UPLOAD_DIR)) await mkdir(UPLOAD_DIR, { recursive: true })
    const filepath = path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, filename)
    const bytes = await file.arrayBuffer()
    await writeFile(filepath, Buffer.from(bytes))
    const url = `/uploads/${filename}`
    const asset = await db.mediaAsset.create({
      data: {
        filename,
        url,
        mimeType: file.type,
        size: file.size,
        altFa: altFa || null,
        altEn: altEn || null,
      },
    })
    return NextResponse.json({ asset })
  } catch (e) {
    if ((e as Error).message === "UNAUTHORIZED") return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    console.error(e)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
