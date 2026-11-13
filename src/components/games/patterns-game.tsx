"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useI18n } from "@/components/providers/i18n-provider"
import { Trophy, RotateCcw, Check, X } from "lucide-react"

// Pattern: a sequence of shapes; user picks the next one from options.
type ShapeKind = "circle" | "square" | "triangle" | "diamond"
const SHAPES: ShapeKind[] = ["circle", "square", "triangle", "diamond"]
const COLORS = ["#EF8614", "#13A48B", "#094588"]

interface Level { sequence: { shape: ShapeKind; color: string }[]; options: { shape: ShapeKind; color: string; correct: boolean }[] }

function generateLevel(n: number): Level {
  // Build a repeating pattern: e.g. A B A B -> next is A
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
  const seqLen = 3 + Math.min(n, 3) // 3 to 6
  const patternLen = 2 // simple ABAB pattern
  const pattern = Array.from({ length: patternLen }, () => ({ shape: pick(SHAPES), color: pick(COLORS) }))
  const sequence = Array.from({ length: seqLen }, (_, i) => pattern[i % patternLen])
  const correctNext = pattern[seqLen % patternLen]
  // Build options: 4 with one correct
  const opts = [correctNext]
  while (opts.length < 4) {
    const o = { shape: pick(SHAPES), color: pick(COLORS), correct: false }
    if (!opts.some(x => x.shape === o.shape && x.color === o.color)) opts.push(o)
  }
  // shuffle
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[opts[i], opts[j]] = [opts[j], opts[i]]
  }
  const options = opts.map(o => ({ ...o, correct: o.shape === correctNext.shape && o.color === correctNext.color }))
  return { sequence, options }
}

export function PatternsGame() {
  const { t, locale, dir } = useI18n()
  const [level, setLevel] = useState(1)
  const [data, setData] = useState<Level>(() => generateLevel(1))
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [wrong, setWrong] = useState(0)

  const nextLevel = useCallback(() => {
    const nl = level + 1
    setLevel(nl)
    setData(generateLevel(nl))
    setPicked(null)
  }, [level])

  const reset = useCallback(() => {
    setLevel(1)
    setData(generateLevel(1))
    setPicked(null)
    setScore(0)
    setWrong(0)
  }, [])

  const pickOption = (idx: number) => {
    if (picked !== null) return
    setPicked(idx)
    if (data.options[idx].correct) {
      setScore(s => s + 10)
      setTimeout(nextLevel, 900)
    } else {
      setWrong(w => w + 1)
      setTimeout(() => setPicked(null), 900)
    }
  }

  return (
    <div dir={dir} className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold">{locale === "fa" ? t("games.patterns.title") : "Pattern Discovery"}</h3>
          <p className="text-sm text-muted-foreground mt-1">{locale === "fa" ? t("games.patterns.desc") : "Complete the pattern"}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-full bg-brand-teal/10 text-brand-teal text-sm font-bold">
            {t("games.score")}: {score}
          </div>
          <div className="px-3 py-1.5 rounded-full bg-brand-navy/10 text-brand-navy text-xs font-medium">
            {locale === "fa" ? "مرحله" : "Level"} {level}
          </div>
          <button
            onClick={reset}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label={t("games.restart")}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sequence */}
      <div className="bg-muted/40 rounded-2xl p-6 sm:p-8 mb-6">
        <p className="text-xs text-muted-foreground mb-4 text-center uppercase tracking-wider">
          {locale === "fa" ? "الگوی دنباله‌شده" : "Sequence"}
        </p>
        <div className="flex items-center justify-center flex-wrap gap-3">
          {data.sequence.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Shape shape={item.shape} color={item.color} size={48} />
            </motion.div>
          ))}
          {/* Next placeholder */}
          <div className="mx-1 px-1 text-muted-foreground">→</div>
          <div className="w-12 h-12 rounded-xl border-2 border-dashed border-brand-orange/50 flex items-center justify-center text-brand-orange font-bold">
            ?
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.options.map((opt, i) => {
          const isPicked = picked === i
          const showResult = picked !== null
          return (
            <motion.button
              key={i}
              onClick={() => pickOption(i)}
              whileHover={{ scale: picked === null ? 1.05 : 1 }}
              whileTap={{ scale: 0.95 }}
              disabled={picked !== null}
              className={`relative rounded-2xl p-4 sm:p-6 border-2 transition-all ${
                showResult && opt.correct
                  ? "border-brand-teal bg-brand-teal/10"
                  : showResult && isPicked && !opt.correct
                  ? "border-destructive bg-destructive/10"
                  : "border-border/60 hover:border-brand-orange/40 bg-card"
              }`}
            >
              <div className="flex items-center justify-center">
                <Shape shape={opt.shape} color={opt.color} size={56} />
              </div>
              {showResult && opt.correct && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -ltr:right-2 rtl:left-2 w-6 h-6 rounded-full bg-brand-teal text-white flex items-center justify-center"
                >
                  <Check className="w-4 h-4" />
                </motion.div>
              )}
              {showResult && isPicked && !opt.correct && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 ltr:right-2 rtl:left-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {score >= 100 && score % 50 === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 p-4 rounded-2xl bg-brand-teal/10 border border-brand-teal/30 text-center"
          >
            <Trophy className="w-7 h-7 text-brand-teal mx-auto mb-1" />
            <p className="font-semibold text-brand-teal text-sm">{t("games.win")}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Shape({ shape, color, size = 40 }: { shape: ShapeKind; color: string; size?: number }) {
  const common = { width: size, height: size, fill: color }
  if (shape === "circle") return <svg viewBox="0 0 40 40" width={size} height={size}><circle cx="20" cy="20" r="16" fill={color} /></svg>
  if (shape === "square") return <svg viewBox="0 0 40 40" width={size} height={size}><rect x="6" y="6" width="28" height="28" rx="4" fill={color} /></svg>
  if (shape === "triangle") return <svg viewBox="0 0 40 40" width={size} height={size}><polygon points="20,4 36,34 4,34" fill={color} /></svg>
  return <svg viewBox="0 0 40 40" width={size} height={size}><polygon points="20,4 36,20 20,36 4,20" fill={color} /></svg>
}
