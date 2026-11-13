"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ArrowUpRight } from "lucide-react"
import { useI18n } from "@/components/providers/i18n-provider"
import { BalandLogo } from "@/components/ui/baland-logo"
import { ThemeToggle } from "./theme-toggle"
import { LanguageToggle } from "./language-toggle"
import { cn } from "@/lib/utils"
import { scrollToTarget } from "@/components/scroll/smooth-scroll"
import { Button } from "@/components/ui/button"

const NAV_ITEMS = [
  { key: "school", href: "#school" },
  { key: "children", href: "#children" },
  { key: "parenting", href: "#parenting" },
  { key: "games", href: "#games" },
  { key: "contact", href: "#contact" },
] as const

interface Props {
  onAdminShortcut?: () => void
}

export function Header({ onAdminShortcut }: Props) {
  const { t, locale, dir } = useI18n()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string>("")

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24)
      const sections = NAV_ITEMS.map((n) => n.href.slice(1))
      let current = ""
      for (const s of sections) {
        const el = document.getElementById(s)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120 && rect.bottom >= 120) { current = s; break }
        }
      }
      setActive(current)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleNav = (href: string) => {
    setOpen(false)
    scrollToTarget(href)
  }

  return (
    <header
      dir={dir}
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled ? "glass border-b border-border/60 shadow-sm" : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => scrollToTarget(0)}
            className="flex items-center gap-2.5 group"
            aria-label="BALAND"
          >
            <div className="transition-transform group-hover:rotate-[10deg] group-hover:scale-105">
              <BalandLogo size={36} />
            </div>
            <span
              className="text-base sm:text-lg font-bold tracking-tight"
              style={{ fontFamily: locale === "fa" ? "var(--font-baland-fa)" : "var(--font-baland-en)" }}
            >
              {locale === "fa" ? t("intro.brandName") : "BALAND"}
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNav(item.href)}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-full transition-all",
                  active === item.key
                    ? "text-brand-orange"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted/60"
                )}
              >
                {t(`nav.${item.key}`)}
                {active === item.key && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-brand-orange rounded-full"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <button
              onClick={() => setOpen((o) => !o)}
              className="lg:hidden p-2 rounded-full hover:bg-muted/60 transition-colors"
              aria-label={t("common.menu")}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden glass border-t border-border/60"
          >
            <nav className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1" aria-label="Mobile navigation">
              {NAV_ITEMS.map((item, i) => (
                <motion.button
                  key={item.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleNav(item.href)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors",
                    active === item.key
                      ? "bg-brand-orange/10 text-brand-orange"
                      : "hover:bg-muted/60"
                  )}
                >
                  <span>{t(`nav.${item.key}`)}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-50" />
                </motion.button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setOpen(false); onAdminShortcut?.() }}
                className="mt-2 w-full justify-center text-muted-foreground"
              >
                {t("admin.title")}
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
