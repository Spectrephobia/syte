"use client"

import { useEffect, useState, useCallback } from "react"
import { useI18n } from "@/components/providers/i18n-provider"
import { Plus, Edit, Trash2, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Section { id: string; key: string; titleFa: string; titleEn: string }
interface Article {
  id: string; sectionId: string; slug: string
  titleFa: string; titleEn: string
  excerptFa: string | null; excerptEn: string | null
  bodyFa: string | null; bodyEn: string | null
  icon: string | null; coverImage: string | null
  published: boolean; order: number
}

const ICONS = ["sparkles", "brain", "puzzle", "heart", "palette", "gamepad", "star", "message-circle", "users", "compass", "mountain"]

export function AdminArticles() {
  const { t, locale, dir } = useI18n()
  const [articles, setArticles] = useState<Article[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Article | null>(null)
  const [open, setOpen] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/articles", { cache: "no-store" })
      const json = await res.json()
      setArticles(json.articles || [])
      const secRes = await fetch("/api/admin/sections", { cache: "no-store" })
      const secJson = await secRes.json()
      setSections(secJson.sections || [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const openCreate = () => {
    setEditing({
      id: "", sectionId: sections[0]?.id || "", slug: "",
      titleFa: "", titleEn: "",
      excerptFa: "", excerptEn: "",
      bodyFa: "", bodyEn: "",
      icon: "sparkles", coverImage: null,
      published: true, order: 0,
    })
    setOpen(true)
  }

  const openEdit = (a: Article) => {
    setEditing({ ...a, excerptFa: a.excerptFa || "", excerptEn: a.excerptEn || "", bodyFa: a.bodyFa || "", bodyEn: a.bodyEn || "", icon: a.icon || "sparkles" })
    setOpen(true)
  }

  const save = async () => {
    if (!editing) return
    if (!editing.slug || !editing.titleFa || !editing.titleEn) {
      toast.error(t("contact.form.required"))
      return
    }
    const method = editing.id ? "PUT" : "POST"
    const url = editing.id ? `/api/admin/articles/${editing.id}` : "/api/admin/articles"
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

  const remove = async (a: Article) => {
    if (!confirm(t("common.confirmDelete"))) return
    await fetch(`/api/admin/articles/${a.id}`, { method: "DELETE" })
    toast.success(locale === "fa" ? "حذف شد." : "Deleted.")
    refresh()
  }

  const sectionLabel = (id: string) => sections.find(s => s.id === id)?.key ?? "—"

  return (
    <div dir={dir} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t("admin.articles")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{articles.length} {locale === "fa" ? "مطلب" : "articles"}</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          {t("admin.actions.create")}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">{t("common.loading")}</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">{t("common.noData")}</div>
      ) : (
        <div className="grid gap-3">
          {articles.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border/60 bg-card p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{sectionLabel(a.sectionId)}</span>
                  {!a.published && <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{locale === "fa" ? "پیش‌نویس" : "Draft"}</span>}
                </div>
                <h3 className="font-bold truncate">{locale === "fa" ? a.titleFa : a.titleEn}</h3>
                <p className="text-xs text-muted-foreground mt-1 truncate">{locale === "fa" ? (a.excerptFa || "") : (a.excerptEn || "")}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">/{a.slug}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEdit(a)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground" aria-label={t("admin.actions.edit")}>
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => remove(a)} className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground" aria-label={t("admin.actions.delete")}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir={dir} className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? t("admin.actions.edit") : t("admin.actions.create")}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 p-2">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t("admin.fields.titleFa")}>
                  <Input value={editing.titleFa} onChange={e => setEditing({ ...editing, titleFa: e.target.value })} dir="rtl" />
                </Field>
                <Field label={t("admin.fields.titleEn")}>
                  <Input value={editing.titleEn} onChange={e => setEditing({ ...editing, titleEn: e.target.value })} dir="ltr" />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t("admin.fields.excerptFa")}>
                  <Textarea rows={2} value={editing.excerptFa || ""} onChange={e => setEditing({ ...editing, excerptFa: e.target.value })} dir="rtl" />
                </Field>
                <Field label={t("admin.fields.excerptEn")}>
                  <Textarea rows={2} value={editing.excerptEn || ""} onChange={e => setEditing({ ...editing, excerptEn: e.target.value })} dir="ltr" />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t("admin.fields.bodyFa")}>
                  <Textarea rows={5} value={editing.bodyFa || ""} onChange={e => setEditing({ ...editing, bodyFa: e.target.value })} dir="rtl" />
                </Field>
                <Field label={t("admin.fields.bodyEn")}>
                  <Textarea rows={5} value={editing.bodyEn || ""} onChange={e => setEditing({ ...editing, bodyEn: e.target.value })} dir="ltr" />
                </Field>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label={locale === "fa" ? "بخش" : "Section"}>
                  <select
                    value={editing.sectionId}
                    onChange={e => setEditing({ ...editing, sectionId: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                  >
                    {sections.map(s => <option key={s.id} value={s.id}>{s.key}</option>)}
                  </select>
                </Field>
                <Field label="slug">
                  <Input value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} dir="ltr" />
                </Field>
                <Field label={t("admin.fields.icon")}>
                  <select
                    value={editing.icon || "sparkles"}
                    onChange={e => setEditing({ ...editing, icon: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                  >
                    {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t("admin.fields.order")}>
                  <Input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value || "0") })} dir="ltr" />
                </Field>
                <div className="flex items-center gap-3 pt-6">
                  <Switch checked={editing.published} onCheckedChange={(v) => setEditing({ ...editing, published: v })} />
                  <Label className="text-sm">{t("admin.fields.published")}</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
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
