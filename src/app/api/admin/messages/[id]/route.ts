import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth/session"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await getCurrentAdmin()
    const { id } = await params
    const body = await req.json()
    const read = Boolean(body?.read)
    const updated = await db.contactMessage.update({ where: { id }, data: { read } })
    return NextResponse.json({ message: updated })
  } catch (e) {
    if ((e as Error).message === "UNAUTHORIZED") return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    console.error(e)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await getCurrentAdmin()
    const { id } = await params
    await db.contactMessage.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    if ((e as Error).message === "UNAUTHORIZED") return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    console.error(e)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
