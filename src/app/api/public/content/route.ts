import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const [settings, social, sections, stages, games] = await Promise.all([
    db.siteSettings.findUnique({ where: { id: "default" } }),
    db.socialLink.findMany({ where: { visible: true, NOT: { url: "" } }, orderBy: { order: "asc" } }),
    db.contentSection.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
    db.schoolStage.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
    db.gameSettings.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
  ])

  // Map articles by section
  const sectionIds = sections.map((s) => s.id)
  const articles = sectionIds.length
    ? await db.article.findMany({
        where: { sectionId: { in: sectionIds }, published: true },
        orderBy: { order: "asc" },
      })
    : []

  return NextResponse.json({
    settings,
    social: social.filter(s => s.url && s.url.length > 0),
    sections,
    stages,
    games,
    articles,
  })
}
