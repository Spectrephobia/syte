"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useI18n } from "@/components/providers/i18n-provider"
import { Trophy, RotateCcw, Target } from "lucide-react"

type Shape = "diamond" | "circle" | "square" | "triangle" | "hex"
const SHAPES: Shape[] = ["diamond", "circle", "square", "triangle", "hex"]
const COLORS = ["#EF8614", "#13A48B", "#094588", "#F59E0B", "#06B6D4"]
const DISTRACTORS_COUNT = 24

interface BoardItem { id: number; shape: Shape; color: string; isTarget: boolean; rotation: number }

function generateLevel(n: number): { board: BoardItem[]; target: { shape: Shape; color: string } } {
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
  const target = { shape: pick(SHAPES), color: pick(COLORS) }
  const board: BoardItem[] = []
  const count = DISTRACTORS_COUNT + Math.min(n * 2, 12)
  for (let i = 0; i < count; i++) {
    let s = pick(SHAPES)
    let c = pick(COLORS)
    // make sure distractors differ from target
    while (s === target.shape && c === target.color) { s = pick(SHAPES); c = pick(COLORS) }
    board.push({
      id: i,
      shape: s,
      color: c,
      isTarget: false,
      rotation: Math.floor(Math.random() * 360),
    })
  }
  // hide 1-3 targets within the board
  const targets = Math.min(1 + Math.floor(n / 2), 3)
  for (let i = 0; i < targets; i++) {
    const idx = Math.floor(Math.random() * board.length)
    board[idx] = { ...board[idx], shape: target.shape, color: target.color, isTarget: true }
  }
  return { board, target }
}

export function FocusGame() {
  const { t, locale, dir } = useI18n()
  const [level, setLevel] = useState(1)
  const [data, setData] = useState(() => generateLevel(1))
  const [found, setFound] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(0)

  const reset = useCallback(() => {
    setLevel(1)
    setData(generateLevel(1))
    setFound([])
    setScore(0)
    setTime(0)
  }, [])

  const totalTargets = data.board.filter(b => b.isTarget).length

  useEffect(() => {
    if (found.length >= totalTargets) {
      const bonus = Math.max(0, 30 - Math.floor(time))
      setScore(s => s + 10 + bonus)
      const timer = setTimeout(() => {
        const nl = level + 1
        setLevel(nl)
        setData(generateLevel(nl))
        setFound([])
        setTime(0)
      }, 1100)
      return () => clearTimeout(timer)
    }
  }, [found, totalTargets, level, time])

  useEffect(() => {
    if (found.length >= totalTargets) return
    const t = setInterval(() => setTime(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [found.length, totalTargets])

  const onClickItem = (item: BoardItem) => {
    if (found.includes(item.id)) return
    if (item.isTarget) {
      setFound(f => [...f, item.id])
    } else {
      // Penalty: -2 score
      setScore(s => Math.max(0, s - 2))
    }
  }

  return (
    <div dir={dir} className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold">{locale === "fa" ? t("games.focus.title") : "Focus & Observation"}</h3>
          <p className="text-sm text-muted-foreground mt-1">{locale === "fa" ? t("games.focus.desc") : "Find the target shape"}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-bold">
            {t("games.score")}: {score}
          </div>
          <div className="px-3 py-1.5 rounded-full bg-brand-navy/10 text-brand-navy text-xs font-medium">
            {t("games.time")}: {time}s
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

      {/* Target indicator */}
      <div className="bg-muted/40 rounded-2xl p-4 mb-6 flex items-center justify-center gap-3">
        <Target className="w-5 h-5 text-brand-orange" />
        <span className="text-sm font-medium text-muted-foreground">
          {locale === "fa" ? "هدف:" : "Target:"}
        </span>
        <div className="relative">
          <ShapeView shape={data.target.shape} color={data.target.color} size={40} />
          <span className="absolute -top-2 -ltr:right-2 rtl:left-2 w-5 h-5 rounded-full bg-brand-orange text-white text-xs flex items-center justify-center font-bold">
            {totalTargets}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          ({found.length}/{totalTargets})
        </span>
      </div>

      {/* Board */}
      <div className="relative bg-card border border-border/60 rounded-2xl p-3 sm:p-4 min-h-[320px]">
        <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5 sm:gap-2">
          {data.board.map((item) => {
            const isFound = found.includes(item.id)
            return (
              <motion.button
                key={item.id}
                onClick={() => onClickItem(item)}
                whileTap={{ scale: 0.85 }}
                className={`relative aspect-square rounded-lg p-1.5 sm:p-2 flex items-center justify-center transition-all ${
                  isFound
                    ? "bg-brand-teal/15 ring-2 ring-brand-teal"
                    : "hover:bg-muted/60"
                }`}
                aria-label="shape"
              >
                <div style={{ transform: `rotate(${item.rotation}deg)` }}>
                  <ShapeView shape={item.shape} color={item.color} size={28} />
                </div>
                {isFound && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 rounded-lg ring-2 ring-brand-teal pointer-events-none"
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {found.length >= totalTargets && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 p-5 rounded-2xl bg-brand-teal/10 border border-brand-teal/30 text-center"
          >
            <Trophy className="w-8 h-8 text-brand-teal mx-auto mb-2" />
            <p className="font-semibold text-brand-teal">{t("games.win")}</p>
            <p className="text-xs text-muted-foreground mt-1">{locale === "fa" ? "در حال آماده‌سازی مرحله بعد..." : "Loading next level..."}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ShapeView({ shape, color, size = 28 }: { shape: Shape; color: string; size?: number }) {
  const w = size, h = size
  if (shape === "circle") return <svg viewBox="0 0 40 40" width={w} height={h}><circle cx="20" cy="20" r="16" fill={color} /></svg>
  if (shape === "square") return <svg viewBox="0 0 40 40" width={w} height={h}><rect x="6" y="6" width="28" height="28" rx="4" fill={color} /></svg>
  if (shape === "triangle") return <svg viewBox="0 0 40 40" width={w} height={h}><polygon points="20,4 36,34 4,34" fill={color} /></svg>
  if (shape === "hex") return <svg viewBox="0 0 40 40" width={w} height={h}><polygon points="20,4 34,12 34,28 20,36 6,28 6,12" fill={color} /></svg>
  return <svg viewBox="0 0 40 40" width={w} height={h}><polygon points="20,4 36,20 20,36 4,20" fill={color} /></svg>
}
