import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentAdmin } from "@/lib/auth/session"

export async function GET() {
  try {
    await getCurrentAdmin()
    const [messages, articles, stages, media] = await Promise.all([
      db.contactMessage.count({ where: { read: false } }),
      db.article.count({ where: { published: true } }),
      db.schoolStage.count({ where: { visible: true } }),
      db.mediaAsset.count(),
    ])
    return NextResponse.json({ messages, articles, stages, media })
  } catch (e) {
    if ((e as Error).message === "UNAUTHORIZED") return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
