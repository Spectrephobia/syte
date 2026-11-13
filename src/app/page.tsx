"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useI18n } from "@/components/providers/i18n-provider"
import { IntroScreen } from "@/components/intro/intro-screen"
import { HomeView } from "@/components/layout/home-view"
import { AdminApp } from "@/components/admin/admin-app"
import { motion, AnimatePresence } from "framer-motion"

type View = "intro" | "home" | "admin"

function ViewRouterInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale, setLocale } = useI18n()
  const [view, setView] = useState<View>("intro")
  const [booting, setBooting] = useState(true)

  // Sync view + locale from URL
  useEffect(() => {
    const v = (searchParams.get("view") as View) || "intro"
    const lang = searchParams.get("lang") as "fa" | "en" | null
    if (lang === "fa" || lang === "en") setLocale(lang)
    setView(v === "admin" || v === "home" ? v : "intro")
    setBooting(false)
  }, [searchParams, setLocale])

  // Update URL when locale changes
  useEffect(() => {
    if (booting) return
    const params = new URLSearchParams(window.location.search)
    if (params.get("lang") !== locale) {
      params.set("lang", locale)
      const newUrl = `${window.location.pathname}?${params.toString()}`
      router.replace(newUrl, { scroll: false })
    }
  }, [locale, booting, router])

  const goHome = () => {
    const params = new URLSearchParams(window.location.search)
    params.set("view", "home")
    router.push(`?${params.toString()}`, { scroll: false })
    setView("home")
  }

  const goIntro = () => {
    const params = new URLSearchParams(window.location.search)
    params.set("view", "intro")
    router.push(`?${params.toString()}`, { scroll: false })
    setView("intro")
  }

  const goAdmin = () => {
    const params = new URLSearchParams(window.location.search)
    params.set("view", "admin")
    router.push(`?${params.toString()}`, { scroll: false })
    setView("admin")
  }

  return (
    <AnimatePresence mode="wait">
      {view === "intro" && (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <IntroScreen onEnter={goHome} onAdminShortcut={goAdmin} />
        </motion.div>
      )}
      {view === "home" && (
        <motion.div
          key="home"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <HomeView onBackToIntro={goIntro} onAdminShortcut={goAdmin} />
        </motion.div>
      )}
      {view === "admin" && (
        <motion.div
          key="admin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AdminApp onBackToSite={goIntro} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ViewRouterInner />
    </Suspense>
  )
}
