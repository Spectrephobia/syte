"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useI18n } from "@/components/providers/i18n-provider"
import { usePublicContent } from "@/lib/hooks/use-public-content"
import { MapPin, Phone, Mail, Send, Loader2, CheckCircle2, AlertCircle, Instagram, MessageCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const SOCIAL_ICONS: Record<string, any> = {
  instagram: Instagram,
  telegram: MessageCircle,
  whatsapp: Phone,
}

export function ContactSection() {
  const { t, locale, dir } = useI18n()
  const { data } = usePublicContent()
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const section = data?.sections?.find((s) => s.key === "contact")
  const title = section ? (locale === "fa" ? section.titleFa : section.titleEn) : t("contact.title")
  const settings = data?.settings

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})
    const form = new FormData(e.currentTarget)
    const parentName = (form.get("parentName") as string)?.trim()
    const contact = (form.get("contact") as string)?.trim()
    const subject = (form.get("subject") as string)?.trim()
    const body = (form.get("body") as string)?.trim()

    const errs: Record<string, string> = {}
    if (!parentName || parentName.length < 2) errs.parentName = t("contact.form.required")
    if (!contact || contact.length < 3) errs.contact = t("contact.form.required")
    if (!subject || subject.length < 2) errs.subject = t("contact.form.required")
    if (!body || body.length < 5) errs.body = t("contact.form.required")
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentName, contact, subject, body, lang: locale }),
      })
      if (res.ok) {
        toast.success(t("contact.form.success"))
        e.currentTarget.reset()
      } else {
        const j = await res.json().catch(() => ({}))
        if (j.error === "too_many_attempts") {
          toast.error(locale === "fa" ? "تعداد درخواست‌ها زیاد است. کمی بعد تلاش کنید." : "Too many requests. Try again shortly.")
        } else {
          toast.error(t("contact.form.error"))
        }
      }
    } catch {
      toast.error(t("contact.form.error"))
    } finally {
      setSubmitting(false)
    }
  }

  const hasContactInfo = settings && (settings.phone || settings.email || settings.addressFa || settings.addressEn)
  const visibleSocial = (data?.social ?? []).filter(s => s.url && s.url.length > 0)

  return (
    <section id="contact" dir={dir} className="relative py-24 sm:py-32 scroll-mt-20 overflow-hidden noise">
      <div className="absolute inset-0 -z-10 mesh-bg opacity-50" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 ltr:right-1/4 rtl:left-1/4 w-[600px] h-[600px] rounded-full bg-brand-navy/8 blur-3xl animate-float-slow" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="eyebrow mb-5 mx-auto" style={{ backgroundColor: "color-mix(in srgb, var(--brand-navy) 10%, transparent)", borderColor: "color-mix(in srgb, var(--brand-navy) 30%, transparent)", color: "var(--brand-navy)" }}>
            <span className="eyebrow-dot" style={{ background: "var(--brand-navy)", boxShadow: "0 0 10px var(--brand-navy)" }} />
            <span>{t("nav.contact")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight max-w-3xl mx-auto text-ink-gradient">{title}</h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: dir === "rtl" ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {!hasContactInfo && (
              <div className="p-6 rounded-2xl border border-dashed border-border/60 bg-muted/30 text-sm text-muted-foreground text-center">
                {t("contact.noAddress")}
              </div>
            )}

            {/* Address */}
            {(settings?.addressFa || settings?.addressEn) && (
              <ContactInfoCard
                icon={<MapPin className="w-5 h-5" />}
                color="orange"
                label={t("contact.address")}
                value={locale === "fa" ? settings.addressFa : settings.addressEn}
              />
            )}

            {/* Phone */}
            {settings?.phone && (
              <ContactInfoCard
                icon={<Phone className="w-5 h-5" />}
                color="teal"
                label={t("contact.phone")}
                value={settings.phone}
                href={`tel:${settings.phone}`}
              />
            )}

            {/* Email */}
            {settings?.email && (
              <ContactInfoCard
                icon={<Mail className="w-5 h-5" />}
                color="navy"
                label={t("contact.email")}
                value={settings.email}
                href={`mailto:${settings.email}`}
              />
            )}

            {/* Social */}
            {visibleSocial.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">{t("contact.social")}</h3>
                <div className="flex flex-wrap gap-2">
                  {visibleSocial.map((s) => {
                    const Icon = SOCIAL_ICONS[s.platform] || MessageCircle
                    return (
                      <a
                        key={s.id}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-card hover:bg-brand-orange/10 hover:border-brand-orange/40 hover:text-brand-orange transition-all text-sm font-medium"
                      >
                        <Icon className="w-4 h-4" />
                        {locale === "fa" ? (s.labelFa || s.platform) : (s.labelEn || s.platform)}
                      </a>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-dashed border-border/60 bg-muted/30 text-xs text-muted-foreground text-center">
                {t("contact.noSocial")}
              </div>
            )}

            {/* Map embed */}
            {settings?.mapUrl && (
              <div className="rounded-2xl overflow-hidden border border-border/60 aspect-video">
                <iframe
                  src={settings.mapUrl}
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="map"
                />
              </div>
            )}
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: dir === "rtl" ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <form
              onSubmit={onSubmit}
              className="rounded-3xl border border-border/60 glass-strong p-6 sm:p-8 shadow-lg"
            >
              <h3 className="text-lg font-bold mb-6">{t("contact.form.title")}</h3>

              <div className="space-y-4">
                <Field label={t("contact.form.parentName")} error={errors.parentName}>
                  <Input name="parentName" placeholder={t("contact.form.parentName")} dir={dir} />
                </Field>
                <Field label={t("contact.form.contact")} error={errors.contact}>
                  <Input name="contact" placeholder={t("contact.form.contact")} dir={dir} />
                </Field>
                <Field label={t("contact.form.subject")} error={errors.subject}>
                  <Input name="subject" placeholder={t("contact.form.subject")} dir={dir} />
                </Field>
                <Field label={t("contact.form.body")} error={errors.body}>
                  <Textarea name="body" placeholder={t("contact.form.body")} rows={5} dir={dir} />
                </Field>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full h-12 rounded-full text-base font-semibold shadow-lg shadow-brand-navy/20"
                style={{ background: "linear-gradient(135deg, #094588 0%, #13A48B 100%)" }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
                    {t("contact.form.sending")}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 me-2" />
                    {t("contact.form.submit")}
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 text-sm font-medium block">{label}</Label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  )
}

function ContactInfoCard({
  icon, label, value, color, href,
}: {
  icon: React.ReactNode; label: string; value: string | null; color: "orange" | "teal" | "navy"; href?: string
}) {
  if (!value) return null
  const colorMap = {
    orange: "bg-brand-orange/10 text-brand-orange",
    teal: "bg-brand-teal/10 text-brand-teal",
    navy: "bg-brand-navy/10 text-brand-navy",
  }[color]
  const content = (
    <div className="flex items-start gap-4 p-5 rounded-2xl border border-border/60 glass hover:shadow-md transition-shadow card-3d">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap}`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
        <div className="text-sm font-medium text-foreground whitespace-pre-line">{value}</div>
      </div>
    </div>
  )
  return href ? <a href={href} className="block">{content}</a> : content
}
