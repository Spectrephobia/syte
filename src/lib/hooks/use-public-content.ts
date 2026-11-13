"use client"

import { useEffect, useState, useCallback } from "react"

export interface PublicContent {
  settings: {
    id: string
    brandNameFa: string
    brandNameEn: string
    sloganFa: string
    sloganEn: string
    addressFa: string | null
    addressEn: string | null
    phone: string | null
    email: string | null
    footerNoteFa: string | null
    footerNoteEn: string | null
    ogImage: string | null
    mapUrl: string | null
  } | null
  social: { id: string; platform: string; url: string; labelFa: string | null; labelEn: string | null; order: number }[]
  sections: {
    id: string
    key: string
    titleFa: string
    titleEn: string
    subtitleFa: string | null
    subtitleEn: string | null
    visible: boolean
    order: number
  }[]
  stages: {
    id: string
    key: string
    titleFa: string
    titleEn: string
    descriptionFa: string
    descriptionEn: string
    ageRangeFa: string | null
    ageRangeEn: string | null
    icon: string | null
    coverImage: string | null
    visible: boolean
    order: number
  }[]
  games: {
    id: string
    key: string
    titleFa: string
    titleEn: string
    descriptionFa: string | null
    descriptionEn: string | null
    visible: boolean
    order: number
  }[]
  articles: {
    id: string
    sectionId: string
    slug: string
    titleFa: string
    titleEn: string
    excerptFa: string | null
    excerptEn: string | null
    bodyFa: string | null
    bodyEn: string | null
    coverImage: string | null
    icon: string | null
    published: boolean
    order: number
  }[]
}

let cache: PublicContent | null = null

export function usePublicContent() {
  const [data, setData] = useState<PublicContent | null>(cache)
  const [loading, setLoading] = useState(!cache)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/public/content", { cache: "no-store" })
      if (res.ok) {
        const json = await res.json()
        cache = json as PublicContent
        setData(json as PublicContent)
      }
    } catch (e) {
      console.error("Failed to fetch public content:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (!cache) refresh() }, [refresh])

  return { data, loading, refresh }
}

export function clearPublicCache() { cache = null }
