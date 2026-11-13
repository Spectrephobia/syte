"use client"

import dynamic from "next/dynamic"
import { motion, useReducedMotion } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import { useI18n } from "@/components/providers/i18n-provider"
import { LanguageToggle } from "@/components/layout/language-toggle"
import { ArrowLeft, ArrowRight, CornerDownLeft } from "lucide-react"

const ParticleLogo = dynamic(() => import("@/components/three/particle-logo").then((m) => m.ParticleLogo), {
  ssr: false,
})

interface Props {
  onEnter: () => void
  onAdminShortcut?: () => void
}

const EASE = [0.16, 1, 0.3, 1] as const

function useIsMobile() {
  const [m, setM] = useState(false)
  useEffect(() => {
    const q = window.matchMedia("(max-width: 1023px)")
    const on = () => setM(q.matches)
    on()
    q.addEventListener("change", on)
    return () => q.removeEventListener("change", on)
  }, [])
  return m
}

export function IntroScreen({ onEnter, onAdminShortcut }: Props) {
  const { t, locale, dir } = useI18n()
  const fa = locale === "fa"
  const isMobile = useIsMobile()
  const reduced = !!useReducedMotion()
  const [leaving, setLeaving] = useState(false)

  const enter = useCallback(() => {
    if (leaving) return
    setLeaving(true)
    setTimeout(onEnter, reduced ? 150 : 850)
  }, [leaving, onEnter, reduced])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") enter()
      if (e.key.toLowerCase() === "a" && e.shiftKey && e.ctrlKey) onAdminShortcut?.()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [enter, onAdminShortcut])

  const Arrow = fa ? ArrowLeft : ArrowRight
  const pillars = fa
    ? ["علوم یادگیری", "علوم شناختی", "روان‌شناسی رشد"]
    : ["Learning Sciences", "Cognitive Science", "Developmental Psychology"]

  return (
    <main
      dir={dir}
      className="dark relative min-h-[100svh] w-full overflow-hidden bg-[#04060c] text-white selection:bg-brand-orange/40"
    >
      {/* Aurora wash in brand colours */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="intro-aurora intro-aurora--navy" />
        <div className="intro-aurora intro-aurora--teal" />
        <div className="intro-aurora intro-aurora--orange" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#04060c_85%)]" />
      </div>

      {/* Living particle mark */}
      <ParticleLogo
        className="absolute inset-0"
        leaving={leaving}
        isMobile={isMobile}
        reduced={reduced}
        markSide={dir === "rtl" ? "left" : "right"}
      />

      {/* Fine grain */}
      <div aria-hidden className="intro-grain pointer-events-none absolute inset-0" />

      {/* Top bar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: leaving ? 0 : 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: leaving ? 0 : 0.4 }}
        className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 sm:px-10 py-5"
      >
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-light.svg" alt="" className="h-8 w-8" />
          <span className="text-[11px] font-semibold tracking-[0.35em] text-white/70" style={{ fontFamily: "var(--font-baland-en)" }}>
            BALAND
          </span>
        </div>
        <LanguageToggle />
      </motion.header>

      {/* Copy column */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl items-end lg:items-center px-6 sm:px-10 pb-16 pt-28 lg:py-0">
        <motion.div
          animate={leaving ? { opacity: 0, y: -24, filter: "blur(8px)" } : { opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="w-full lg:w-[46%] flex flex-col items-center text-center lg:items-start lg:text-start"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.9, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12px] text-white/70 backdrop-blur-md"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-teal opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-teal" />
            </span>
            {fa ? "مجموعه فرهنگی و آموزشی" : "Cultural & Educational Collective"}
          </motion.div>

          <h1 className="sr-only">{t("intro.brandName")}</h1>
          <motion.img
            src="/brand/wordmark-light.svg"
            alt=""
            initial={{ opacity: 0, y: 24, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 1.15, duration: 1.3, ease: EASE }}
            className="mt-8 h-24 sm:h-32 lg:h-40 w-auto drop-shadow-[0_0_40px_rgba(63,128,224,0.25)]"
          />

          {/* rule with diamond, echoing the lockup */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 1.6, duration: 1, ease: EASE }}
            className="relative mt-7 h-px w-56 sm:w-72 origin-center lg:origin-[var(--rule-origin)] bg-gradient-to-l from-transparent via-brand-orange to-brand-orange/0"
            style={{ ["--rule-origin" as string]: fa ? "right" : "left" }}
          >
            <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] bg-brand-orange shadow-[0_0_18px_rgba(255,154,46,0.8)]" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 1, ease: EASE }}
            className="mt-7 text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug text-white/90"
            style={{ fontFamily: fa ? "var(--font-baland-fa)" : "var(--font-baland-en)" }}
          >
            {fa ? (
              <>
                بالند تا <span className="text-[#2CC7A8]">بالندگی</span> همراه شماست
              </>
            ) : (
              <>
                Growing with you, <span className="text-[#2CC7A8]">all the way</span>.
              </>
            )}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 1, ease: EASE }}
            className="mt-4 max-w-md text-sm sm:text-base leading-relaxed text-white/50"
          >
            {fa
              ? "مدرسه، کودکان و فرزندپروری — آموزشی بر پایه‌ی علوم یادگیری و شناخت، برای رشدی که از درون آغاز می‌شود."
              : "School, children and parenting — learning grounded in cognitive science, for growth that begins from within."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.9, ease: EASE }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <button onClick={enter} className="intro-cta group" aria-label={t("intro.enterCta")}>
              <span className="intro-cta__ring" aria-hidden />
              <span className="relative z-10 flex items-center gap-3 rounded-full bg-[#0a0f1c]/90 px-8 py-4 text-base font-semibold text-white transition-colors group-hover:bg-[#0a0f1c]/60">
                {t("intro.enterCta")}
                <Arrow className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />
              </span>
            </button>
            <span className="hidden sm:inline-flex items-center gap-2 text-xs text-white/40">
              {fa ? "یا کلید" : "or press"}
              <kbd className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 font-sans text-[11px] text-white/60">
                Enter <CornerDownLeft className="h-3 w-3" />
              </kbd>
            </span>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
            className="mt-12 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-[12px] text-white/45"
          >
            {pillars.map((p, i) => (
              <li key={p} className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rotate-45 rounded-[1px]"
                  style={{ background: ["#2CC7A8", "#FF9A2E", "#3F80E0"][i] }}
                />
                {p}
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>

      {/* Footer corners */}
      <button
        onClick={onAdminShortcut}
        className="absolute bottom-5 ltr:right-6 rtl:left-6 z-20 flex items-center gap-2 text-[10px] text-white/30 transition-colors hover:text-brand-orange"
        aria-label="Admin panel"
      >
        <span className="uppercase tracking-wider">{fa ? "مدیریت" : "Admin"}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      </button>
      <div className="absolute bottom-5 ltr:left-6 rtl:right-6 z-20 text-[10px] uppercase tracking-[0.25em] text-white/25">
        © BALAND
      </div>
    </main>
  )
}
