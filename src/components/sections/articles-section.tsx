"use client"

import { motion } from "framer-motion"
import { useI18n } from "@/components/providers/i18n-provider"
import { usePublicContent } from "@/lib/hooks/use-public-content"
import {
  Brain, Puzzle, Heart, Palette, Gamepad2, Star, MessageCircle, Users,
  Sparkles, Compass, Mountain, ArrowUpRight, type LucideIcon
} from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

const ICONS: Record<string, LucideIcon> = {
  brain: Brain, puzzle: Puzzle, heart: Heart, palette: Palette,
  gamepad: Gamepad2, star: Star, "message-circle": MessageCircle, users: Users,
  sparkles: Sparkles, compass: Compass, mountain: Mountain,
}

interface Props {
  sectionKey: "children" | "parenting"
}

export function ArticlesSection({ sectionKey }: Props) {
  const { t, locale, dir } = useI18n()
  const { data } = usePublicContent()
  const [selected, setSelected] = useState<string | null>(null)

  const section = data?.sections?.find((s) => s.key === sectionKey)
  const articles = (data?.articles ?? []).filter((a) => a.sectionId === section?.id)

  const title = section ? (locale === "fa" ? section.titleFa : section.titleEn) : t(`${sectionKey}.title`)
  const desc = section ? (locale === "fa" ? section.subtitleFa : section.subtitleEn) : t(`${sectionKey}.subtitle`)

  const selectedArticle = articles.find((a) => a.id === selected)

  return (
    <section id={sectionKey} dir={dir} className="relative py-24 sm:py-32 scroll-mt-20 overflow-hidden">
      {/* Backdrop accent */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute top-1/3 ltr:left-0 rtl:right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-[0.18]"
          style={{ background: sectionKey === "children" ? "var(--brand-teal)" : "var(--brand-orange)" }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div
            className="eyebrow mb-5 mx-auto"
            style={{
              backgroundColor: sectionKey === "children"
                ? "color-mix(in srgb, var(--brand-teal) 10%, transparent)"
                : "color-mix(in srgb, var(--brand-orange) 10%, transparent)",
              borderColor: sectionKey === "children"
                ? "color-mix(in srgb, var(--brand-teal) 30%, transparent)"
                : "color-mix(in srgb, var(--brand-orange) 30%, transparent)",
              color: sectionKey === "children" ? "var(--brand-teal)" : "var(--brand-orange)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: sectionKey === "children" ? "var(--brand-teal)" : "var(--brand-orange)",
                boxShadow: `0 0 10px ${sectionKey === "children" ? "var(--brand-teal)" : "var(--brand-orange)"}`,
                animation: "pulse-dot 2s ease-in-out infinite",
              }}
            />
            <span>{t(`nav.${sectionKey}`)}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight max-w-3xl mx-auto text-ink-gradient">
            {title}
          </h2>
          {desc && (
            <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {desc}
            </p>
          )}
        </motion.div>

        {articles.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">{t("common.noData")}</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {articles.map((article, i) => {
              const Icon = ICONS[article.icon || "sparkles"] || Sparkles
              const colorIdx = i % 3
              const colors = ["orange", "teal", "navy"] as const
              const color = colors[colorIdx]
              const colorMap = {
                orange: { bg: "bg-brand-orange/10", text: "text-brand-orange", glow: "shadow-[0_0_30px_-15px_var(--brand-orange)]" },
                teal: { bg: "bg-brand-teal/10", text: "text-brand-teal", glow: "shadow-[0_0_30px_-15px_var(--brand-teal)]" },
                navy: { bg: "bg-brand-navy/10", text: "text-brand-navy", glow: "shadow-[0_0_30px_-15px_var(--brand-navy)]" },
              }[color]

              return (
                <motion.button
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
                  whileHover={{ y: -6 }}
                  onClick={() => setSelected(article.id)}
                  className="group relative text-start rounded-2xl border border-border/60 glass p-6 card-3d"
                >
                  <div className={`w-12 h-12 rounded-xl ${colorMap.bg} ${colorMap.text} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 leading-tight">
                    {locale === "fa" ? article.titleFa : article.titleEn}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {locale === "fa" ? article.excerptFa : article.excerptEn}
                  </p>
                  <span className={`mt-4 inline-flex items-center gap-1 text-xs font-medium ${colorMap.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    {t(`${sectionKey}.readMore`)}
                    <ArrowUpRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </span>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>

      {/* Article detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent dir={dir} className="max-w-2xl max-h-[80vh] overflow-y-auto glass-strong">
          <DialogHeader>
            {selectedArticle?.icon && (() => {
              const Icon = ICONS[selectedArticle.icon] || Sparkles
              return (
                <div className="w-14 h-14 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center mb-2">
                  <Icon className="w-7 h-7" />
                </div>
              )
            })()}
            <DialogTitle className="text-2xl">
              {selectedArticle ? (locale === "fa" ? selectedArticle.titleFa : selectedArticle.titleEn) : ""}
            </DialogTitle>
            {selectedArticle && (locale === "fa" ? selectedArticle.excerptFa : selectedArticle.excerptEn) && (
              <DialogDescription className="text-base">
                {locale === "fa" ? selectedArticle.excerptFa : selectedArticle.excerptEn}
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedArticle && (locale === "fa" ? selectedArticle.bodyFa : selectedArticle.bodyEn) && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {locale === "fa" ? selectedArticle.bodyFa : selectedArticle.bodyEn}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}

export function ChildrenSection() { return <ArticlesSection sectionKey="children" /> }
export function ParentingSection() { return <ArticlesSection sectionKey="parenting" /> }
