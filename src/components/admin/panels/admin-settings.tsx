"use client"

import { useEffect, useState } from "react"
import { useI18n } from "@/components/providers/i18n-provider"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Settings {
  id: string
  brandNameFa: string
  brandNameEn: string
  sloganFa: string
  sloganEn: string
  addressFa: string | null
  addressEn: string | null
  phone: string | null
  email: string | null
  footerNoteFa: string | null
  footerNoteEn: string | null
  mapUrl: string | null
}

export function AdminSettings() {
  const { t, locale, dir } = useI18n()
  const [data, setData] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" })
      .then(r => r.json())
      .then(j => setData(j.settings))
      .catch(() => {})
  }, [])

  const update = (k: keyof Settings, v: string) => {
    setData(d => d ? { ...d, [k]: v } : d)
  }

  const save = async () => {
    if (!data) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          email: data.email || "",
          phone: data.phone || "",
          mapUrl: data.mapUrl || "",
          addressFa: data.addressFa || "",
          addressEn: data.addressEn || "",
          footerNoteFa: data.footerNoteFa || "",
          footerNoteEn: data.footerNoteEn || "",
        }),
      })
      if (res.ok) toast.success(locale === "fa" ? "ذخیره شد." : "Saved.")
      else toast.error(locale === "fa" ? "خطا در ذخیره." : "Save failed.")
    } finally {
      setSaving(false)
    }
  }

  if (!data) return <div className="text-center py-12"><Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" /></div>

  return (
    <div dir={dir} className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{t("admin.settings")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{locale === "fa" ? "اطلاعات اصلی سایت و اطلاعات تماس" : "Site branding and contact info"}</p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
        <h2 className="font-bold text-lg">{locale === "fa" ? "هویت برند" : "Brand identity"}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={t("admin.fields.brandNameFa")}>
            <Input value={data.brandNameFa} onChange={e => update("brandNameFa", e.target.value)} dir="rtl" />
          </Field>
          <Field label={t("admin.fields.brandNameEn")}>
            <Input value={data.brandNameEn} onChange={e => update("brandNameEn", e.target.value)} dir="ltr" />
          </Field>
          <Field label={t("admin.fields.sloganFa")}>
            <Input value={data.sloganFa} onChange={e => update("sloganFa", e.target.value)} dir="rtl" />
          </Field>
          <Field label={t("admin.fields.sloganEn")}>
            <Input value={data.sloganEn} onChange={e => update("sloganEn", e.target.value)} dir="ltr" />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
        <h2 className="font-bold text-lg">{t("admin.contactInfo")}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={t("admin.fields.phone")}>
            <Input value={data.phone || ""} onChange={e => update("phone", e.target.value)} dir="ltr" placeholder="+98 21 000 000 0000" />
          </Field>
          <Field label={t("admin.fields.email")}>
            <Input type="email" value={data.email || ""} onChange={e => update("email", e.target.value)} dir="ltr" placeholder="info@baland.example" />
          </Field>
          <Field label={t("admin.fields.addressFa")}>
            <Textarea rows={2} value={data.addressFa || ""} onChange={e => update("addressFa", e.target.value)} dir="rtl" />
          </Field>
          <Field label={t("admin.fields.addressEn")}>
            <Textarea rows={2} value={data.addressEn || ""} onChange={e => update("addressEn", e.target.value)} dir="ltr" />
          </Field>
        </div>
        <Field label={t("admin.fields.mapUrl")}>
          <Input value={data.mapUrl || ""} onChange={e => update("mapUrl", e.target.value)} dir="ltr" placeholder="https://www.google.com/maps/embed?pb=..." />
        </Field>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
        <h2 className="font-bold text-lg">{locale === "fa" ? "متن فوتر" : "Footer note"}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={t("admin.fields.footerNoteFa")}>
            <Textarea rows={2} value={data.footerNoteFa || ""} onChange={e => update("footerNoteFa", e.target.value)} dir="rtl" />
          </Field>
          <Field label={t("admin.fields.footerNoteEn")}>
            <Textarea rows={2} value={data.footerNoteEn || ""} onChange={e => update("footerNoteEn", e.target.value)} dir="ltr" />
          </Field>
        </div>
      </div>

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-2 shadow-xl">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {t("admin.actions.save")}
        </Button>
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
