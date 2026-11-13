"use client"

import { useI18n } from "@/components/providers/i18n-provider"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n()
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === "fa" ? "en" : "fa")}
      className="rounded-full gap-2 hover:bg-brand-teal/10 hover:text-brand-teal px-3"
      aria-label={t("common.language")}
      title={t("common.language")}
    >
      <Globe className="w-4 h-4" />
      <span className="text-xs font-semibold tracking-wide">{locale === "fa" ? "EN" : "فا"}</span>
    </Button>
  )
}
