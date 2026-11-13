import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL
  const now = new Date()
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/?view=home`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/?view=home#school`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/?view=home#children`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/?view=home#parenting`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/?view=home#games`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/?view=home#contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ]
}
