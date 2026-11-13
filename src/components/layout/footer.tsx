"use client"

import { useI18n } from "@/components/providers/i18n-provider"
import { BalandLogo } from "@/components/ui/baland-logo"
import { usePublicContent } from "@/lib/hooks/use-public-content"
import { ArrowUp } from "lucide-react"

interface Props {
  onBackToIntro?: () => void
}

export function Footer({ onBackToIntro }: Props) {
  const { t, locale } = useI18n()
  const { data } = usePublicContent()
  const year = new Date().getFullYear()

  const brandName = data?.settings
    ? locale === "fa" ? data.settings.brandNameFa : data.settings.brandNameEn
    : (locale === "fa" ? "بالند" : "BALAND")

  const footerNote = data?.settings
    ? locale === "fa" ? data.settings.footerNoteFa : data.settings.footerNoteEn
    : t("footer.brandDesc")

  return (
    <footer className="relative mt-24 border-t border-border/60 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <BalandLogo size={36} />
              <span
                className="text-lg font-bold"
                style={{ fontFamily: locale === "fa" ? "var(--font-baland-fa)" : "var(--font-baland-en)" }}
              >
                {brandName}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {footerNote}
            </p>
          </div>

          {/* Nav */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-foreground">{t("common.menu")}</h3>
            <nav className="flex flex-col gap-2 text-sm">
              {["school", "children", "parenting", "games", "contact"].map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    const el = document.getElementById(k)
                    if (el) {
                      const top = el.getBoundingClientRect().top + window.scrollY - 80
                      window.scrollTo({ top, behavior: "smooth" })
                    }
                  }}
                  className="text-muted-foreground hover:text-brand-orange transition-colors w-fit"
                >
                  {t(`nav.${k}`)}
                </button>
              ))}
            </nav>
          </div>

          {/* Slogan + Back to intro */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-foreground">{locale === "fa" ? "بالند" : "BALAND"}</h3>
            <p className="text-sm text-muted-foreground italic mb-4">
              {locale === "fa" ? "بالند تا بالندگی همراه شماست" : "BALAND — Growing together toward flourishing"}
            </p>
            {onBackToIntro && (
              <button
                onClick={onBackToIntro}
                className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-brand-teal transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                {locale === "fa" ? "بازگشت به صفحه ورود" : "Back to intro"}
              </button>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {year} {brandName}. {t("footer.rights")}</span>
          <div className="flex items-center gap-4">
            <span>v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
