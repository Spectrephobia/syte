"use client"

import { useState } from "react"
import { useI18n } from "@/components/providers/i18n-provider"
import { BalandLogo } from "@/components/ui/baland-logo"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { LanguageToggle } from "@/components/layout/language-toggle"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, MessageSquare, FileText, Settings, Share2,
  School, Gamepad2, Image, LogOut, ArrowRight, type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminOverview } from "./panels/admin-overview"
import { AdminMessages } from "./panels/admin-messages"
import { AdminArticles } from "./panels/admin-articles"
import { AdminSettings } from "./panels/admin-settings"
import { AdminSocial } from "./panels/admin-social"
import { AdminStages } from "./panels/admin-stages"
import { AdminGames } from "./panels/admin-games"
import { AdminMedia } from "./panels/admin-media"
import { AdminSections } from "./panels/admin-sections"
import type { AdminUser } from "./admin-app"

interface Props {
  user: AdminUser
  onLogout: () => void
  onBackToSite: () => void
}

type TabKey = "overview" | "messages" | "articles" | "sections" | "stages" | "games" | "settings" | "social" | "media"

const TABS: { key: TabKey; icon: LucideIcon; labelKey: string }[] = [
  { key: "overview", icon: LayoutDashboard, labelKey: "admin.dashboard" },
  { key: "messages", icon: MessageSquare, labelKey: "admin.messages" },
  { key: "articles", icon: FileText, labelKey: "admin.articles" },
  { key: "sections", icon: LayoutDashboard, labelKey: "admin.sections" },
  { key: "stages", icon: School, labelKey: "admin.stages" },
  { key: "games", icon: Gamepad2, labelKey: "admin.games" },
  { key: "settings", icon: Settings, labelKey: "admin.settings" },
  { key: "social", icon: Share2, labelKey: "admin.social" },
  { key: "media", icon: Image, labelKey: "admin.media" },
]

export function AdminDashboard({ user, onLogout, onBackToSite }: Props) {
  const { t, locale, dir } = useI18n()
  const [tab, setTab] = useState<TabKey>("overview")
  const [mobileNav, setMobileNav] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    onLogout()
  }

  return (
    <div dir={dir} className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 glass border-b border-border/60">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <BalandLogo size={36} />
            <div>
              <div className="font-bold leading-none" style={{ fontFamily: "var(--font-baland-en)" }}>BALAND</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{t("admin.title")}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToSite}
              className="hidden sm:inline-flex gap-2"
            >
              {t("admin.backToSite")}
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label={t("admin.logout")} className="hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 border-e border-border/60 min-h-[calc(100vh-4rem)] sticky top-16 self-start py-6 px-3">
          <nav className="flex flex-col gap-1">
            {TABS.map((tabItem) => {
              const Icon = tabItem.icon
              return (
                <button
                  key={tabItem.key}
                  onClick={() => setTab(tabItem.key)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    tab === tabItem.key
                      ? "bg-brand-orange/10 text-brand-orange"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {t(tabItem.labelKey)}
                </button>
              )
            })}
          </nav>
          <div className="mt-6 p-3 rounded-xl bg-muted/40 text-xs text-muted-foreground">
            <div className="font-medium text-foreground mb-1">{user.name}</div>
            <div className="opacity-70">{user.email}</div>
            <div className="opacity-70 mt-1 capitalize">{user.role}</div>
          </div>
        </aside>

        {/* Mobile tab bar */}
        <div className="lg:hidden w-full overflow-x-auto border-b border-border/60 px-2 py-2 sticky top-16 bg-background z-30">
          <div className="flex gap-1 min-w-max">
            {TABS.map((tabItem) => {
              const Icon = tabItem.icon
              return (
                <button
                  key={tabItem.key}
                  onClick={() => setTab(tabItem.key)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                    tab === tabItem.key ? "bg-brand-orange/10 text-brand-orange" : "text-muted-foreground hover:bg-muted/60"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t(tabItem.labelKey)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {tab === "overview" && <AdminOverview onNavigate={setTab} />}
          {tab === "messages" && <AdminMessages />}
          {tab === "articles" && <AdminArticles />}
          {tab === "sections" && <AdminSections />}
          {tab === "stages" && <AdminStages />}
          {tab === "games" && <AdminGames />}
          {tab === "settings" && <AdminSettings />}
          {tab === "social" && <AdminSocial />}
          {tab === "media" && <AdminMedia />}
        </main>
      </div>
    </div>
  )
}
