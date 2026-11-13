"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Gamepad2, Trophy, RotateCcw, X, Info } from "lucide-react"
import { useI18n } from "@/components/providers/i18n-provider"
import { usePublicContent } from "@/lib/hooks/use-public-content"
import { MemoryGame } from "@/components/games/memory-game"
import { PatternsGame } from "@/components/games/patterns-game"
import { FocusGame } from "@/components/games/focus-game"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

type GameKey = "memory" | "patterns" | "focus"

export function GamesSection() {
  const { t, locale, dir } = useI18n()
  const { data } = usePublicContent()
  const [active, setActive] = useState<GameKey | null>(null)
  const [showInfo, setShowInfo] = useState(false)

  const games = (data?.games ?? []).filter(g => g.visible)
  const section = data?.sections?.find(s => s.key === "games")
  const title = section ? (locale === "fa" ? section.titleFa : section.titleEn) : t("games.title")
  const subtitle = section ? (locale === "fa" ? section.subtitleFa : section.subtitleEn) : t("games.subtitle")

  const gameMeta: Record<GameKey, { color: string; bg: string }> = {
    memory: { color: "var(--brand-orange)", bg: "rgba(239,134,20,0.10)" },
    patterns: { color: "var(--brand-teal)", bg: "rgba(19,164,139,0.10)" },
    focus: { color: "var(--brand-navy)", bg: "rgba(9,69,136,0.10)" },
  }

  const handlePlay = (key: string) => {
    if (key === "memory" || key === "patterns" || key === "focus") setActive(key)
  }

  return (
    <section id="games" dir={dir} className="relative py-24 sm:py-32 scroll-mt-20 overflow-hidden">
      {/* Animated conic glow + mesh backdrop */}
      <div className="absolute inset-0 -z-10 mesh-bg opacity-50" />
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full conic-glow animate-rotate-slow"
          style={{ animationDuration: "40s" }}
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
          <div className="eyebrow mb-5 mx-auto" style={{ backgroundColor: "color-mix(in srgb, var(--brand-orange) 10%, transparent)", borderColor: "color-mix(in srgb, var(--brand-orange) 30%, transparent)", color: "var(--brand-orange)" }}>
            <span className="eyebrow-dot" style={{ background: "var(--brand-orange)", boxShadow: "0 0 10px var(--brand-orange)" }} />
            <span>{t("nav.games")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight max-w-3xl mx-auto text-ink-gradient">{title}</h2>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        {/* Games grid */}
        {games.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">{t("common.noData")}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {games.map((g, i) => {
              const key = g.key as GameKey
              const meta = gameMeta[key]
              return (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group relative rounded-3xl border border-border/60 glass overflow-hidden card-3d"
                >
                  {/* Game preview canvas */}
                  <div
                    className="relative aspect-[4/3] overflow-hidden"
                    style={{ background: meta.bg }}
                  >
                    <GamePreview gameKey={key} color={meta.color} />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg sm:text-xl font-bold mb-2">
                      {locale === "fa" ? g.titleFa : g.titleEn}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {locale === "fa" ? g.descriptionFa : g.descriptionEn}
                    </p>
                    <button
                      onClick={() => handlePlay(g.key)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                      style={{ background: meta.color }}
                    >
                      <Gamepad2 className="w-4 h-4" />
                      {t("games.play")}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <button
            onClick={() => setShowInfo(true)}
            className="w-full flex items-start gap-3 p-4 rounded-2xl border border-border/60 glass hover:bg-muted/40 transition-colors text-start"
          >
            <Info className="w-5 h-5 text-brand-teal flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t("games.disclaimer")}
            </p>
          </button>
        </motion.div>
      </div>

      {/* Game modal */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent dir={dir} className="max-w-4xl p-0 overflow-hidden" aria-describedby={undefined}>
          <DialogTitle className="sr-only">{t("nav.games")}</DialogTitle>
          <div className="relative">
            <button
              onClick={() => setActive(null)}
              className="absolute top-4 ltr:right-4 rtl:left-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-muted transition-colors"
              aria-label={t("common.close")}
            >
              <X className="w-5 h-5" />
            </button>
            <AnimatePresence mode="wait">
              {active === "memory" && (
                <motion.div key="memory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <MemoryGame />
                </motion.div>
              )}
              {active === "patterns" && (
                <motion.div key="patterns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <PatternsGame />
                </motion.div>
              )}
              {active === "focus" && (
                <motion.div key="focus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <FocusGame />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info dialog */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent dir={dir} className="max-w-md">
          <div className="flex items-start gap-3">
            <Trophy className="w-6 h-6 text-brand-orange flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold mb-2">{t("nav.games")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("games.disclaimer")}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function GamePreview({ gameKey, color }: { gameKey: GameKey; color: string }) {
  // Static decorative preview
  if (gameKey === "memory") {
    return (
      <div className="absolute inset-0 grid grid-cols-3 gap-2 p-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-lg shadow-sm flex items-center justify-center"
            style={{
              background: i % 2 === 0 ? color : "var(--card)",
              border: `2px solid ${i % 2 === 0 ? "transparent" : color + "40"}`,
            }}
          >
            {i % 2 === 0 && (
              <div className="w-3 h-3 rotate-45 bg-white/80 rounded-sm" />
            )}
          </div>
        ))}
      </div>
    )
  }
  if (gameKey === "patterns") {
    return (
      <div className="absolute inset-0 flex items-center justify-center gap-2 p-6">
        <div className="w-10 h-10 rounded-lg" style={{ background: color }} />
        <div className="w-10 h-10 rounded-lg" style={{ background: color + "60" }} />
        <div className="w-10 h-10 rounded-lg" style={{ background: color }} />
        <div className="w-10 h-10 rounded-lg border-2 border-dashed flex items-center justify-center text-lg font-bold" style={{ borderColor: color + "60", color }}>?</div>
      </div>
    )
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-6 h-6 rotate-45 rounded"
            style={{
              background: i === 4 ? color : color + "30",
              transform: `rotate(45deg) translate(${(i % 3 - 1) * 36}px, ${Math.floor(i / 3 - 1) * 36}px)`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
