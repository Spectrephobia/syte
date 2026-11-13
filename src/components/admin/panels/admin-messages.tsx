"use client"

import { useEffect, useState, useCallback } from "react"
import { useI18n } from "@/components/providers/i18n-provider"
import { Mail, Phone, Clock, Trash2, MailOpen, MailCheck } from "lucide-react"
import { toast } from "sonner"

interface Message {
  id: string
  parentName: string
  contact: string
  subject: string
  body: string
  lang: string
  read: boolean
  createdAt: string
}

export function AdminMessages() {
  const { t, locale, dir } = useI18n()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/messages", { cache: "no-store" })
      if (res.ok) setMessages(await res.json().then(j => j.messages))
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const toggleRead = async (m: Message) => {
    await fetch(`/api/admin/messages/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !m.read }),
    })
    refresh()
  }

  const remove = async (m: Message) => {
    if (!confirm(t("common.confirmDelete"))) return
    await fetch(`/api/admin/messages/${m.id}`, { method: "DELETE" })
    toast.success(locale === "fa" ? "حذف شد." : "Deleted.")
    refresh()
  }

  const filtered = filter === "unread" ? messages.filter(m => !m.read) : messages

  return (
    <div dir={dir} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t("admin.messages")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {messages.length} {locale === "fa" ? "پیام" : "messages"} • {messages.filter(m => !m.read).length} {locale === "fa" ? "خوانده‌نشده" : "unread"}
          </p>
        </div>
        <div className="flex gap-1 p-1 rounded-full bg-muted">
          <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-full text-xs font-medium ${filter === "all" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
            {locale === "fa" ? "همه" : "All"}
          </button>
          <button onClick={() => setFilter("unread")} className={`px-3 py-1.5 rounded-full text-xs font-medium ${filter === "unread" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
            {locale === "fa" ? "خوانده‌نشده" : "Unread"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">{t("common.loading")}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">{t("common.noData")}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl border bg-card p-5 transition-all ${m.read ? "border-border/60 opacity-80" : "border-brand-orange/40 shadow-sm"}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!m.read && <span className="w-2 h-2 rounded-full bg-brand-orange flex-shrink-0" />}
                    <h3 className="font-bold truncate">{m.subject}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{m.parentName}</span>
                    <span className="inline-flex items-center gap-1">
                      {m.contact.includes("@") ? <Mail className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                      {m.contact}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(m.createdAt).toLocaleString(locale === "fa" ? "fa-IR" : "en-US")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleRead(m)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                    aria-label={m.read ? t("admin.actions.markUnread") : t("admin.actions.markRead")}
                  >
                    {m.read ? <MailOpen className="w-4 h-4" /> : <MailCheck className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => remove(m)}
                    className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                    aria-label={t("admin.actions.delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{m.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
