"use client"

import { motion } from "framer-motion"
import { useI18n } from "@/components/providers/i18n-provider"
import { ArrowDown, Brain, Heart, Compass, Sparkles } from "lucide-react"
import { Scene3D } from "@/components/three/scene-3d"

interface Props {
  onExplore: () => void
}

export function HeroSection({ onExplore }: Props) {
  const { t, locale, dir } = useI18n()

  return (
    <section
      dir={dir}
      className="relative min-h-[100svh] flex items-center pt-28 pb-20 overflow-hidden noise"
      aria-label="Hero"
    >
      {/* 3D Crystal scene */}
      <Scene3D className="opacity-70 dark:opacity-60" variant="full" />

      {/* Vignette overlay for text contrast */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, color-mix(in srgb, var(--background) 50%, transparent) 80%, var(--background) 100%)",
        }}
      />

      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-[0.4] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Eyebrow badge (hekpixle-style) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="eyebrow mb-8 mx-auto"
          >
            <span className="eyebrow-dot" />
            <span>
              {locale === "fa"
                ? "آموزش مبتنی بر علوم شناختی"
                : "Education grounded in cognitive sciences"}
            </span>
          </motion.div>

          {/* Heading — gradient text */}
          <motion.h1
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-bold leading-[1.05] tracking-tight"
          >
            <span className="text-brand-gradient">{t("home.heroTitle")}</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9 }}
            className="mt-7 text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            {t("home.heroDesc")}
          </motion.p>

          {/* CTA + pillars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.9 }}
            className="mt-10 flex flex-col items-center gap-6"
          >
            <button
              onClick={onExplore}
              className="group relative inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-background shadow-xl shadow-brand-navy/20 hover:shadow-brand-orange/40 hover:scale-[1.03] active:scale-95 transition-all"
              style={{ background: "linear-gradient(135deg, #094588 0%, #13A48B 100%)" }}
            >
              <span>{t("home.heroCta")}</span>
              <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-1" />
              <span className="absolute inset-0 rounded-full overflow-hidden">
                <span className="absolute inset-y-0 -left-1/2 w-1/2 bg-white/20 -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-700" />
              </span>
            </button>

            <div className="flex items-center gap-6 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-brand-teal" />
                <span>{locale === "fa" ? "علوم شناختی" : "Cognitive"}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-brand-orange" />
                <span>{locale === "fa" ? "رشد عاطفی" : "Emotional"}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-brand-navy" />
                <span>{locale === "fa" ? "مسیر رشد" : "Path"}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={onExplore}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-muted-foreground hover:text-brand-orange transition-colors"
        aria-label="Scroll"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase opacity-70">
          {locale === "fa" ? "بیشتر" : "Scroll"}
        </span>
        <div className="w-6 h-10 rounded-full border-2 border-current relative">
          <motion.span
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-current"
          />
        </div>
      </motion.button>

      {/* Sparkles icon top corner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute top-24 ltr:right-8 rtl:left-8 z-10 hidden sm:flex items-center gap-2 text-xs text-muted-foreground/60"
      >
        <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
        <span className="uppercase tracking-wider">
          {locale === "fa" ? "تجربه بصری ۳بعدی" : "3D visual experience"}
        </span>
      </motion.div>
    </section>
  )
}
