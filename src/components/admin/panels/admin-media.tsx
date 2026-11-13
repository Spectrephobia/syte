"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useI18n } from "@/components/providers/i18n-provider"
import { Upload, Loader2, Copy, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Media {
  id: string
  filename: string
  url: string
  mimeType: string
  size: number
  altFa: string | null
  altEn: string | null
  createdAt: string
}

export function AdminMedia() {
  const { t, locale, dir } = useI18n()
  const [items, setItems] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/media", { cache: "no-store" })
    if (res.ok) {
      const json = await res.json()
      setItems(json.media || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const handleUpload = async (file: File) => {
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    try {
      const res = await fetch("/api/admin/media", { method: "POST", body: fd })
      if (res.ok) {
        const json = await res.json()
        toast.success(locale === "fa" ? "آپلود شد." : "Uploaded.")
        setItems(arr => [json.asset, ...arr])
      } else {
        const j = await res.json().catch(() => ({}))
        if (j.error === "too_large") toast.error(locale === "fa" ? "حجم فایل زیاد است." : "File too large.")
        else if (j.error === "invalid_type") toast.error(locale === "fa" ? "نوع فایل مجاز نیست." : "Invalid file type.")
        else toast.error(locale === "fa" ? "خطا در آپلود." : "Upload failed.")
      }
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success(locale === "fa" ? "کپی شد." : "Copied.")
  }

  const remove = async (m: Media) => {
    if (!confirm(t("common.confirmDelete"))) return
    // Note: actual file deletion from disk not implemented in API; just DB record
    await fetch(`/api/admin/media/${m.id}`, { method: "DELETE" }).catch(() => {})
    setItems(arr => arr.filter(x => x.id !== m.id))
    toast.success(locale === "fa" ? "حذف شد." : "Deleted.")
  }

  return (
    <div dir={dir} className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{t("admin.media")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{locale === "fa" ? "تصاویر و فایل‌های آپلودشده" : "Uploaded images and files"}</p>
      </div>

      {/* Upload zone */}
      <div
        onClick={() => fileRef.current?.click()}
        className="rounded-2xl border-2 border-dashed border-border/60 bg-card hover:bg-muted/40 transition-colors p-8 text-center cursor-pointer"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleUpload(f)
          }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
            <p className="text-sm text-muted-foreground">{locale === "fa" ? "در حال آپلود..." : "Uploading..."}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium">{t("admin.upload.drop")}</p>
            <p className="text-xs text-muted-foreground">{t("admin.upload.hint")}</p>
          </div>
        )}
      </div>

      {/* Gallery */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">{t("common.noData")}</div>
      ) : (
        <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((m) => (
            <div key={m.id} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
              <div className="aspect-square bg-muted/40 flex items-center justify-center overflow-hidden">
                <img src={m.url} alt={m.altFa || m.filename} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-xs font-mono truncate">{m.filename}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{(m.size / 1024).toFixed(1)} KB • {m.mimeType}</p>
                <div className="flex gap-1 mt-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => copyUrl(m.url)}>
                    <Copy className="w-3 h-3" />
                    URL
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => remove(m)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
