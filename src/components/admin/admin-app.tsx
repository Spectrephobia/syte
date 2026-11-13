"use client"

import { useEffect, useState, useCallback } from "react"
import { useI18n } from "@/components/providers/i18n-provider"
import { AdminLogin } from "./admin-login"
import { AdminDashboard } from "./admin-dashboard"
import { Loader2 } from "lucide-react"

export interface AdminUser { id: string; email: string; name: string; role: string }

interface Props {
  onBackToSite: () => void
}

export function AdminApp({ onBackToSite }: Props) {
  const { t, locale, dir } = useI18n()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [checking, setChecking] = useState(true)

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session", { cache: "no-store" })
      if (res.ok) {
        const json = await res.json()
        if (json.user) setUser(json.user)
      }
    } catch {}
    setChecking(false)
  }, [])

  useEffect(() => { checkSession() }, [checkSession])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir={dir}>
        <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
      </div>
    )
  }

  if (!user) {
    return <AdminLogin onLogin={setUser} onBackToSite={onBackToSite} />
  }

  return <AdminDashboard user={user} onLogout={() => setUser(null)} onBackToSite={onBackToSite} />
}
