"use client"

import { useState } from "react"
import { useI18n } from "@/components/providers/i18n-provider"
import { BalandLogo } from "@/components/ui/baland-logo"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { LanguageToggle } from "@/components/layout/language-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import type { AdminUser } from "./admin-app"

interface Props {
  onLogin: (u: AdminUser) => void
  onBackToSite: () => void
}

export function AdminLogin({ onLogin, onBackToSite }: Props) {
  const { t, locale, dir } = useI18n()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !password) { setError(t("contact.form.required")); return }
    setLoading(true)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (!res.ok) {
        if (json.error === "too_many_attempts") {
          setError(locale === "fa" ? "تلاش‌های زیادی. چند دقیقه بعد دوباره تلاش کنید." : "Too many attempts. Try again later.")
        } else {
          setError(t("admin.invalidCreds"))
        }
        return
      }
      toast.success(locale === "fa" ? "خوش آمدید!" : "Welcome!")
      onLogin(json.user)
    } catch {
      setError(t("contact.form.error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div dir={dir} className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <BalandLogo size={32} />
          <span className="font-bold text-lg" style={{ fontFamily: "var(--font-baland-en)" }}>BALAND</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Decorative header */}
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #094588 0%, #13A48B 100%)" }}>
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t("admin.login")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("admin.title")}</p>
          </div>

          {/* Form card */}
          <form onSubmit={onSubmit} className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-xl">
            <div className="space-y-4">
              <div>
                <Label className="mb-1.5 text-sm font-medium block">{t("admin.email")}</Label>
                <div className="relative">
                  <Mail className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@baland.local"
                    className="ltr:pl-10 rtl:pr-10"
                    dir="ltr"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 text-sm font-medium block">{t("admin.password")}</Label>
                <div className="relative">
                  <Lock className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="ltr:pl-10 rtl:pr-10"
                    dir="ltr"
                    autoComplete="current-password"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-6 w-full h-12 rounded-xl font-semibold"
              style={{ background: "linear-gradient(135deg, #094588 0%, #13A48B 100%)" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  {t("admin.signingIn")}
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 me-2" />
                  {t("admin.signIn")}
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={onBackToSite}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-brand-orange transition-colors"
            >
              {t("admin.backToSite")}
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </form>

          {/* Default credentials hint (dev only) */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            {locale === "fa"
              ? "برای تست: admin@baland.local / baland-admin-2026 (قابل تغییر از طریق env)"
              : "Demo: admin@baland.local / baland-admin-2026 (configurable via env)"}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
