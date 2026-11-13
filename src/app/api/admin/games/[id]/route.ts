import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth/session"
import { gameSettingsSchema } from "@/lib/validation/schemas"
import { ZodError } from "zod"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await getCurrentAdmin()
    const { id } = await params
    const body = await req.json()
    const parsed = gameSettingsSchema.partial().parse(body)
    const updated = await db.gameSettings.update({ where: { id }, data: parsed as any })
    return NextResponse.json({ game: updated })
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: "validation_error", details: e.issues }, { status: 400 })
    if ((e as Error).message === "UNAUTHORIZED") return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    console.error(e)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await getCurrentAdmin()
    const { id } = await params
    await db.gameSettings.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    if ((e as Error).message === "UNAUTHORIZED") return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    console.error(e)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
