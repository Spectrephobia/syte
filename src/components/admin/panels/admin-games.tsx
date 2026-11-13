"use client"

import { useEffect, useState, useCallback } from "react"
import { useI18n } from "@/components/providers/i18n-provider"
import { Edit, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface Game {
  id: string
  key: string
  titleFa: string
  titleEn: string
  descriptionFa: string | null
  descriptionEn: string | null
  visible: boolean
  order: number
}

export function AdminGames() {
  const { t, locale, dir } = useI18n()
  const [items, setItems] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/games", { cache: "no-store" })
    const json = await res.json()
    setItems(json.games || [])
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const update = (id: string, patch: Partial<Game>) => {
    setItems(arr => arr.map(g => g.id === id ? { ...g, ...patch } : g))
  }

  const save = async (g: Game) => {
    const res = await fetch(`/api/admin/games/${g.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(g),
    })
    if (res.ok) toast.success(locale === "fa" ? "ذخیره شد." : "Saved.")
    else toast.error(locale === "fa" ? "خطا در ذخیره." : "Save failed.")
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" /></div>

  return (
    <div dir={dir} className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{t("admin.games")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{locale === "fa" ? "تنظیمات نمایش بازی‌ها" : "Game visibility settings"}</p>
      </div>

      <div className="grid gap-4">
        {items.map((g) => (
          <div key={g.id} className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs px-2 py-1 rounded bg-brand-orange/10 text-brand-orange font-mono">{g.key}</span>
              <div className="flex items-center gap-2">
                <Switch checked={g.visible} onCheckedChange={v => update(g.id, { visible: v })} />
                <Label className="text-sm">{t("admin.fields.visible")}</Label>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t("admin.fields.titleFa")}>
                <Input value={g.titleFa} onChange={e => update(g.id, { titleFa: e.target.value })} dir="rtl" />
              </Field>
              <Field label={t("admin.fields.titleEn")}>
                <Input value={g.titleEn} onChange={e => update(g.id, { titleEn: e.target.value })} dir="ltr" />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t("admin.fields.descriptionFa")}>
                <Textarea rows={2} value={g.descriptionFa || ""} onChange={e => update(g.id, { descriptionFa: e.target.value })} dir="rtl" />
              </Field>
              <Field label={t("admin.fields.descriptionEn")}>
                <Textarea rows={2} value={g.descriptionEn || ""} onChange={e => update(g.id, { descriptionEn: e.target.value })} dir="ltr" />
              </Field>
            </div>
            <div className="flex items-center gap-4">
              <Field label={t("admin.fields.order")}>
                <Input type="number" value={g.order} onChange={e => update(g.id, { order: parseInt(e.target.value || "0") })} dir="ltr" className="w-24" />
              </Field>
              <Button onClick={() => save(g)} className="gap-2 mt-5">
                <Save className="w-4 h-4" />
                {t("admin.actions.save")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 text-sm font-medium block">{label}</Label>
      {children}
    </div>
  )
}
