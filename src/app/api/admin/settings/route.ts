import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth/session"
import { siteSettingsSchema } from "@/lib/validation/schemas"
import { ZodError } from "zod"

export async function GET() {
  const settings = await db.siteSettings.findUnique({ where: { id: "default" } })
  const social = await db.socialLink.findMany({ orderBy: { order: "asc" } })
  return NextResponse.json({ settings, social })
}

export async function PUT(req: NextRequest) {
  try {
    await getCurrentAdmin()
    const body = await req.json()
    const parsed = siteSettingsSchema.parse(body)
    const updated = await db.siteSettings.upsert({
      where: { id: "default" },
      update: parsed as any,
      create: { id: "default", ...parsed } as any,
    })
    return NextResponse.json({ settings: updated })
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: "validation_error", details: e.issues }, { status: 400 })
    if ((e as Error).message === "UNAUTHORIZED") return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    console.error(e)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
