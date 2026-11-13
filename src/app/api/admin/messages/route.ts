import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth/session"

export async function GET() {
  await getCurrentAdmin()
  const messages = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json({ messages })
}
