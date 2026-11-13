import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { contactSchema } from "@/lib/validation/schemas"
import { ZodError } from "zod"

// Basic in-memory rate limiting
const rate = new Map<string, { count: number; first: number }>()

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const key = `contact:${ip}`
    if (!rate.has(key)) rate.set(key, { count: 0, first: Date.now() })
    const r = rate.get(key)!
    if (Date.now() - r.first > 60_000) { r.count = 0; r.first = Date.now() }
    r.count++
    if (r.count > 5) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 })

    const body = await req.json()
    const parsed = contactSchema.parse(body)
    const msg = await db.contactMessage.create({
      data: {
        parentName: parsed.parentName.trim(),
        contact: parsed.contact.trim(),
        subject: parsed.subject.trim(),
        body: parsed.body.trim(),
        lang: parsed.lang,
      },
    })
    return NextResponse.json({ ok: true, id: msg.id })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "validation_error", details: e.issues }, { status: 400 })
    }
    console.error("Contact error:", e)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
