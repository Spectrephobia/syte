"use client"

import { useEffect, useState } from "react"
import { useI18n } from "@/components/providers/i18n-provider"
import { MessageSquare, FileText, School, Image, ArrowLeft, type LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

interface Props {
  onNavigate: (tab: "overview" | "messages" | "articles" | "sections" | "stages" | "games" | "settings" | "social" | "media") => void
}

interface Stats { messages: number; articles: number; stages: number; media: number }

export function AdminOverview({ onNavigate }: Props) {
  const { t, locale, dir } = useI18n()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setStats(d))
      .catch(() => {})
  }, [])

  const cards: { key: keyof Stats; icon: LucideIcon; tab: "messages" | "articles" | "stages" | "media"; color: string }[] = [
    { key: "messages", icon: MessageSquare, tab: "messages", color: "var(--brand-orange)" },
    { key: "articles", icon: FileText, tab: "articles", color: "var(--brand-teal)" },
    { key: "stages", icon: School, tab: "stages", color: "var(--brand-navy)" },
    { key: "media", icon: Image, tab: "media", color: "var(--brand-orange)" },
  ]

  return (
    <div dir={dir} className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{t("admin.dashboard")}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {locale === "fa" ? "خلاصه‌ای از وضعیت سایت بالند" : "Overview of the BALAND site"}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon
          const val = stats ? stats[c.key] : "—"
          return (
            <motion.button
              key={c.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => onNavigate(c.tab)}
              className="text-start rounded-2xl border border-border/60 bg-card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.color + "1A", color: c.color }}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowLeft className="w-4 h-4 text-muted-foreground rtl:rotate-180" />
              </div>
              <div className="text-3xl font-bold">{val}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {t(`admin.stats.${c.key === "stages" ? "stages" : c.key === "media" ? "media" : c.key === "messages" ? "messages" : "articles"}`)}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="text-lg font-bold mb-4">{locale === "fa" ? "دسترسی سریع" : "Quick access"}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { tab: "settings", label: locale === "fa" ? "تنظیمات سایت و اطلاعات تماس" : "Site settings & contact info" },
            { tab: "social", label: locale === "fa" ? "شبکه‌های اجتماعی" : "Social links" },
            { tab: "articles", label: locale === "fa" ? "مدیریت مطالب" : "Manage articles" },
            { tab: "messages", label: locale === "fa" ? "پیام‌های دریافتی" : "Received messages" },
            { tab: "media", label: locale === "fa" ? "رسانه‌ها" : "Media assets" },
            { tab: "sections", label: locale === "fa" ? "بخش‌ها" : "Sections" },
          ].map((q) => (
            <button
              key={q.tab}
              onClick={() => onNavigate(q.tab as any)}
              className="text-start p-3 rounded-xl border border-border/60 hover:bg-muted/40 transition-colors text-sm"
            >
              <span className="block text-foreground font-medium">{q.label}</span>
              <span className="block text-xs text-muted-foreground mt-1 ltr:float-right rtl:float-left">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
