import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth/session"
import { stageSchema } from "@/lib/validation/schemas"
import { ZodError } from "zod"

export async function GET() {
  const stages = await db.schoolStage.findMany({ orderBy: { order: "asc" } })
  return NextResponse.json({ stages })
}

export async function POST(req: NextRequest) {
  try {
    await getCurrentAdmin()
    const body = await req.json()
    const parsed = stageSchema.parse(body)
    const created = await db.schoolStage.create({ data: parsed as any })
    return NextResponse.json({ stage: created })
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: "validation_error", details: e.issues }, { status: 400 })
    if ((e as Error).message === "UNAUTHORIZED") return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    console.error(e)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
