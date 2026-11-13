"use client"

import { motion } from "framer-motion"
import { useI18n } from "@/components/providers/i18n-provider"
import { usePublicContent } from "@/lib/hooks/use-public-content"
import { Sparkles, Compass, Mountain, ArrowUpRight, type LucideIcon } from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  compass: Compass,
  mountain: Mountain,
}

export function SchoolSection() {
  const { t, locale, dir } = useI18n()
  const { data } = usePublicContent()

  const stages = data?.stages ?? []
  const section = data?.sections?.find((s) => s.key === "school")

  const title = section ? (locale === "fa" ? section.titleFa : section.titleEn) : t("school.title")
  const desc = section ? (locale === "fa" ? section.subtitleFa : section.subtitleEn) : t("school.desc")

  return (
    <section id="school" dir={dir} className="relative py-24 sm:py-32 scroll-mt-20 overflow-hidden">
      {/* Subtle backdrop */}
      <div className="absolute inset-0 -z-10 mesh-bg opacity-60" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="eyebrow mb-5 mx-auto">
            <span className="eyebrow-dot" />
            <span>{t("nav.school")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight max-w-3xl mx-auto text-ink-gradient">
            {title}
          </h2>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {desc}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
          {stages.map((stage, i) => {
            const Icon = ICON_MAP[stage.icon || "sparkles"] || Sparkles
            const color = i === 0 ? "orange" : i === 1 ? "teal" : "navy"
            const colorClasses = {
              orange: { bg: "bg-brand-orange/10", text: "text-brand-orange", border: "hover:border-brand-orange/40", glow: "glow-orange" },
              teal: { bg: "bg-brand-teal/10", text: "text-brand-teal", border: "hover:border-brand-teal/40", glow: "glow-teal" },
              navy: { bg: "bg-brand-navy/10", text: "text-brand-navy", border: "hover:border-brand-navy/40", glow: "glow-navy" },
            }[color]

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className={`group relative rounded-3xl border border-border/60 glass p-7 sm:p-8 card-3d ${colorClasses.border}`}
              >
                {/* Stage number — large, ghost */}
                <div className="absolute top-6 ltr:right-6 rtl:left-6 text-7xl font-bold opacity-[0.06] group-hover:opacity-[0.12] transition-opacity">
                  {String(i + 1).padStart(2, "0")}
                </div>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl ${colorClasses.bg} ${colorClasses.text} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                  {locale === "fa" ? stage.titleFa : stage.titleEn}
                </h3>

                {/* Age range */}
                {stage.ageRangeFa && (
                  <div className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-4 ${colorClasses.bg} ${colorClasses.text}`}>
                    {locale === "fa" ? stage.ageRangeFa : stage.ageRangeEn}
                  </div>
                )}

                {/* Description */}
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {locale === "fa" ? stage.descriptionFa : stage.descriptionEn}
                </p>

                {/* Hover arrow */}
                <div className={`mt-5 inline-flex items-center gap-1 text-xs font-medium ${colorClasses.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <span>{t("school.learnMore")}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </div>

                {/* Decorative corner glow on hover */}
                <div className={`absolute -bottom-12 -ltr:right-12 rtl:left-12 w-32 h-32 ${colorClasses.bg} opacity-0 group-hover:opacity-100 rounded-full blur-2xl transition-opacity duration-700 -z-10`} />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
