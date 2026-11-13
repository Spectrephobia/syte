"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react"

export type Locale = "fa" | "en"
type Dict = Record<string, any>

interface I18nContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
  dir: "rtl" | "ltr"
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

import faMessages from "@/i18n/messages/fa.json"
import enMessages from "@/i18n/messages/en.json"

const dicts: Record<Locale, Dict> = { fa: faMessages, en: enMessages }

function resolveKey(dict: Dict, key: string): string {
  const parts = key.split(".")
  let cur: any = dict
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) cur = cur[p]
    else return key
  }
  return typeof cur === "string" ? cur : key
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fa")

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("baland.locale")) as Locale | null
    if (stored === "fa" || stored === "en") setLocaleState(stored)
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try { localStorage.setItem("baland.locale", l) } catch {}
  }, [])

  useEffect(() => {
    const dir = locale === "fa" ? "rtl" : "ltr"
    document.documentElement.lang = locale
    document.documentElement.dir = dir
  }, [locale])

  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    let str = resolveKey(dicts[locale], key)
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v))
      }
    }
    return str
  }, [locale])

  const dir = locale === "fa" ? "rtl" : "ltr"

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}
