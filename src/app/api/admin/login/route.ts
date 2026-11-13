import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword, verifyPassword, generateToken, SESSION_COOKIE, SESSION_TTL_MS } from "@/lib/auth/password"
import { loginSchema } from "@/lib/validation/schemas"
import { ZodError } from "zod"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = loginSchema.parse(body)
    // Rate limit (basic, in-memory per IP)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const key = `login:${ip}`
    if (!rateLimits.has(key)) rateLimits.set(key, { count: 0, first: Date.now() })
    const r = rateLimits.get(key)!
    if (Date.now() - r.first > 60_000) { r.count = 0; r.first = Date.now() }
    r.count++
    if (r.count > 8) {
      return NextResponse.json({ error: "too_many_attempts" }, { status: 429 })
    }

    const user = await db.adminUser.findUnique({ where: { email: parsed.email.toLowerCase() } })
    if (!user || !verifyPassword(parsed.password, user.passwordHash)) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 })
    }
    const token = generateToken()
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
    await db.adminSession.create({ data: { token, userId: user.id, expiresAt } })

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    })
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    })
    return res
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "validation_error", details: e.issues }, { status: 400 })
    }
    console.error("Login error:", e)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}

const rateLimits = new Map<string, { count: number; first: number }>()
