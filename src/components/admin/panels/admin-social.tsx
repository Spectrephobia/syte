"use client"

import { useEffect, useState, useCallback } from "react"
import { useI18n } from "@/components/providers/i18n-provider"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Social {
  id?: string
  platform: string
  url: string
  labelFa: string | null
  labelEn: string | null
  visible: boolean
  order: number
}

const PLATFORMS = ["instagram", "telegram", "whatsapp", "linkedin", "youtube", "twitter", "facebook"]

export function AdminSocial() {
  const { t, locale, dir } = useI18n()
  const [items, setItems] = useState<Social[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Social | null>(null)
  const [open, setOpen] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/settings", { cache: "no-store" })
    const json = await res.json()
    setItems(json.social || [])
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const openCreate = () => {
    setEditing({ platform: "instagram", url: "", labelFa: "", labelEn: "", visible: true, order: items.length + 1 })
    setOpen(true)
  }

  const openEdit = (s: Social) => {
    setEditing({ ...s, labelFa: s.labelFa || "", labelEn: s.labelEn || "", url: s.url || "" })
    setOpen(true)
  }

  const save = async () => {
    if (!editing) return
    if (!editing.platform || editing.platform.length < 2) {
      toast.error(t("contact.form.required"))
      return
    }
    if (editing.id) {
      const res = await fetch(`/api/admin/social/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      })
      if (res.ok) toast.success(locale === "fa" ? "ذخیره شد." : "Saved.")
    } else {
      const res = await fetch("/api/admin/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      })
      if (res.ok) toast.success(locale === "fa" ? "اضافه شد." : "Created.")
    }
    setOpen(false)
    setEditing(null)
    refresh()
  }

  const remove = async (s: Social) => {
    if (!s.id) return
    if (!confirm(t("common.confirmDelete"))) return
    await fetch(`/api/admin/social/${s.id}`, { method: "DELETE" })
    toast.success(locale === "fa" ? "حذف شد." : "Deleted.")
    refresh()
  }

  return (
    <div dir={dir} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t("admin.social")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{locale === "fa" ? "لینک شبکه‌های اجتماعی قابل نمایش در سایت" : "Social links shown on the site"}</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          {t("admin.actions.create")}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">{t("common.noData")}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((s) => (
            <div key={s.id} className={`rounded-2xl border bg-card p-4 ${!s.visible || !s.url ? "opacity-70" : "border-border/60"}`}>
              <div className="flex items-start justify-between mb-2">
                <span className="font-bold capitalize text-sm">{s.platform}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-muted text-muted-foreground" aria-label={t("admin.actions.edit")}>
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => remove(s)} className="p-1.5 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground" aria-label={t("admin.actions.delete")}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground truncate">{s.url || (locale === "fa" ? "بدون آدرس" : "No URL set")}</p>
              <div className="flex items-center gap-2 mt-2 text-[10px]">
                <span className={`px-1.5 py-0.5 rounded ${s.visible ? "bg-brand-teal/15 text-brand-teal" : "bg-muted text-muted-foreground"}`}>
                  {s.visible ? (locale === "fa" ? "نمایش" : "Visible") : (locale === "fa" ? "مخفی" : "Hidden")}
                </span>
                {s.labelFa && <span className="text-muted-foreground">{s.labelFa}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir={dir} className="max-w-lg">
          <DialogHeader><DialogTitle>{editing?.id ? t("admin.actions.edit") : t("admin.actions.create")}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 p-1">
              <Field label={t("admin.fields.platform")}>
                <select
                  value={editing.platform}
                  onChange={e => setEditing({ ...editing, platform: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3"
                >
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label={t("admin.fields.url")}>
                <Input value={editing.url} onChange={e => setEditing({ ...editing, url: e.target.value })} dir="ltr" placeholder="https://..." />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("admin.fields.labelFa")}>
                  <Input value={editing.labelFa || ""} onChange={e => setEditing({ ...editing, labelFa: e.target.value })} dir="rtl" />
                </Field>
                <Field label={t("admin.fields.labelEn")}>
                  <Input value={editing.labelEn || ""} onChange={e => setEditing({ ...editing, labelEn: e.target.value })} dir="ltr" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <Field label={t("admin.fields.order")}>
                  <Input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value || "0") })} dir="ltr" />
                </Field>
                <div className="flex items-center gap-2 pt-5">
                  <Switch checked={editing.visible} onCheckedChange={v => setEditing({ ...editing, visible: v })} />
                  <Label className="text-sm">{t("admin.fields.visible")}</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <Button variant="outline" onClick={() => setOpen(false)}>{t("admin.actions.cancel")}</Button>
                <Button onClick={save}>{t("admin.actions.save")}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
