"use client"

import { useEffect, useState, useCallback } from "react"
import { useI18n } from "@/components/providers/i18n-provider"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Stage {
  id?: string
  key: string
  titleFa: string
  titleEn: string
  descriptionFa: string
  descriptionEn: string
  ageRangeFa: string | null
  ageRangeEn: string | null
  icon: string | null
  coverImage: string | null
  visible: boolean
  order: number
}

const ICONS = ["sparkles", "compass", "mountain", "brain", "puzzle", "heart", "star"]

export function AdminStages() {
  const { t, locale, dir } = useI18n()
  const [items, setItems] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Stage | null>(null)
  const [open, setOpen] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/stages", { cache: "no-store" })
    const json = await res.json()
    setItems(json.stages || [])
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const openCreate = () => {
    setEditing({
      key: "", titleFa: "", titleEn: "",
      descriptionFa: "", descriptionEn: "",
      ageRangeFa: "", ageRangeEn: "",
      icon: "sparkles", coverImage: null,
      visible: true, order: items.length + 1,
    })
    setOpen(true)
  }

  const openEdit = (s: Stage) => {
    setEditing({ ...s, ageRangeFa: s.ageRangeFa || "", ageRangeEn: s.ageRangeEn || "", icon: s.icon || "sparkles" })
    setOpen(true)
  }

  const save = async () => {
    if (!editing) return
    if (!editing.key || !editing.titleFa || !editing.titleEn) {
      toast.error(t("contact.form.required"))
      return
    }
    const method = editing.id ? "PUT" : "POST"
    const url = editing.id ? `/api/admin/stages/${editing.id}` : "/api/admin/stages"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    })
    if (res.ok) {
      toast.success(locale === "fa" ? "ذخیره شد." : "Saved.")
      setOpen(false)
      setEditing(null)
      refresh()
    } else {
      toast.error(locale === "fa" ? "خطا در ذخیره." : "Save failed.")
    }
  }

  const remove = async (s: Stage) => {
    if (!s.id) return
    if (!confirm(t("common.confirmDelete"))) return
    await fetch(`/api/admin/stages/${s.id}`, { method: "DELETE" })
    toast.success(locale === "fa" ? "حذف شد." : "Deleted.")
    refresh()
  }

  return (
    <div dir={dir} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t("admin.stages")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{locale === "fa" ? "مراحل آموزشی مدرسه بالند" : "School stages of BALAND"}</p>
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
            <div key={s.id} className="rounded-2xl border border-border/60 bg-card p-5">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs px-1.5 py-0.5 rounded bg-brand-navy/10 text-brand-navy">{s.key}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-muted text-muted-foreground" aria-label={t("admin.actions.edit")}>
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => remove(s)} className="p-1.5 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground" aria-label={t("admin.actions.delete")}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold mb-1">{locale === "fa" ? s.titleFa : s.titleEn}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">{locale === "fa" ? s.descriptionFa : s.descriptionEn}</p>
              {s.ageRangeFa && <p className="text-xs text-brand-orange mt-2">{locale === "fa" ? s.ageRangeFa : s.ageRangeEn}</p>}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir={dir} className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? t("admin.actions.edit") : t("admin.actions.create")}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 p-1">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="key">
                  <Input value={editing.key} onChange={e => setEditing({ ...editing, key: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} dir="ltr" />
                </Field>
                <Field label={t("admin.fields.icon")}>
                  <select value={editing.icon || "sparkles"} onChange={e => setEditing({ ...editing, icon: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3">
                    {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t("admin.fields.titleFa")}>
                  <Input value={editing.titleFa} onChange={e => setEditing({ ...editing, titleFa: e.target.value })} dir="rtl" />
                </Field>
                <Field label={t("admin.fields.titleEn")}>
                  <Input value={editing.titleEn} onChange={e => setEditing({ ...editing, titleEn: e.target.value })} dir="ltr" />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t("admin.fields.descriptionFa")}>
                  <Textarea rows={3} value={editing.descriptionFa} onChange={e => setEditing({ ...editing, descriptionFa: e.target.value })} dir="rtl" />
                </Field>
                <Field label={t("admin.fields.descriptionEn")}>
                  <Textarea rows={3} value={editing.descriptionEn} onChange={e => setEditing({ ...editing, descriptionEn: e.target.value })} dir="ltr" />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t("admin.fields.ageRangeFa")}>
                  <Input value={editing.ageRangeFa || ""} onChange={e => setEditing({ ...editing, ageRangeFa: e.target.value })} dir="rtl" />
                </Field>
                <Field label={t("admin.fields.ageRangeEn")}>
                  <Input value={editing.ageRangeEn || ""} onChange={e => setEditing({ ...editing, ageRangeEn: e.target.value })} dir="ltr" />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <Field label={t("admin.fields.order")}>
                  <Input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value || "0") })} dir="ltr" />
                </Field>
                <div className="col-span-2 flex items-center gap-2 pt-5">
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
