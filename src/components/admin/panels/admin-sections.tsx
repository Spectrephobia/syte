"use client"

import { useEffect, useState, useCallback } from "react"
import { useI18n } from "@/components/providers/i18n-provider"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface Section {
  id: string
  key: string
  titleFa: string
  titleEn: string
  subtitleFa: string | null
  subtitleEn: string | null
  visible: boolean
  order: number
}

export function AdminSections() {
  const { t, locale, dir } = useI18n()
  const [items, setItems] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/sections", { cache: "no-store" })
    const json = await res.json()
    setItems(json.sections || [])
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const update = (id: string, patch: Partial<Section>) => {
    setItems(arr => arr.map(s => s.id === id ? { ...s, ...patch } : s))
  }

  const save = async (s: Section) => {
    const res = await fetch(`/api/admin/sections/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    })
    if (res.ok) toast.success(locale === "fa" ? "ذخیره شد." : "Saved.")
    else toast.error(locale === "fa" ? "خطا در ذخیره." : "Save failed.")
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" /></div>

  return (
    <div dir={dir} className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{t("admin.sections")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{locale === "fa" ? "عناوین و توضیحات بخش‌های اصلی سایت" : "Titles and descriptions for site sections"}</p>
      </div>

      <div className="grid gap-4">
        {items.map((s) => (
          <div key={s.id} className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs px-2 py-1 rounded bg-brand-teal/10 text-brand-teal font-mono">{s.key}</span>
              <div className="flex items-center gap-2">
                <Switch checked={s.visible} onCheckedChange={v => update(s.id, { visible: v })} />
                <Label className="text-sm">{t("admin.fields.visible")}</Label>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t("admin.fields.titleFa")}>
                <Input value={s.titleFa} onChange={e => update(s.id, { titleFa: e.target.value })} dir="rtl" />
              </Field>
              <Field label={t("admin.fields.titleEn")}>
                <Input value={s.titleEn} onChange={e => update(s.id, { titleEn: e.target.value })} dir="ltr" />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t("admin.fields.subtitleFa")}>
                <Textarea rows={2} value={s.subtitleFa || ""} onChange={e => update(s.id, { subtitleFa: e.target.value })} dir="rtl" />
              </Field>
              <Field label={t("admin.fields.subtitleEn")}>
                <Textarea rows={2} value={s.subtitleEn || ""} onChange={e => update(s.id, { subtitleEn: e.target.value })} dir="ltr" />
              </Field>
            </div>
            <div className="flex items-center gap-4">
              <Field label={t("admin.fields.order")}>
                <Input type="number" value={s.order} onChange={e => update(s.id, { order: parseInt(e.target.value || "0") })} dir="ltr" className="w-24" />
              </Field>
              <Button onClick={() => save(s)} className="gap-2 mt-5">
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
