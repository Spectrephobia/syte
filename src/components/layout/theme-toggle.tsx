"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useI18n } from "@/components/providers/i18n-provider"
import { Button } from "@/components/ui/button"

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = theme === "dark"

  if (!mounted) return <div className="w-9 h-9" />

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t("common.lightMode") : t("common.darkMode")}
      title={isDark ? t("common.lightMode") : t("common.darkMode")}
      className="relative rounded-full hover:bg-brand-orange/10 hover:text-brand-orange"
    >
      <Sun className={`h-5 w-5 transition-all ${isDark ? "rotate-0 scale-100" : "rotate-90 scale-0 absolute"}`} />
      <Moon className={`h-5 w-5 transition-all ${isDark ? "rotate-90 scale-0 absolute" : "rotate-0 scale-100"}`} />
      {!compact && <span className="sr-only">{isDark ? t("common.lightMode") : t("common.darkMode")}</span>}
    </Button>
  )
}
