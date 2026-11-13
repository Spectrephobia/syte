"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useI18n } from "@/components/providers/i18n-provider"
import { Trophy, RotateCcw } from "lucide-react"

const ICONS = ["🦊", "🦋", "🌳", "⭐", "🌸", "🐠", "🌙", "🪁"] as const
const PAIRS = 6 // 12 cards

interface Card { id: number; icon: string; flipped: boolean; matched: boolean }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function newDeck(): Card[] {
  const picked = shuffle([...ICONS]).slice(0, PAIRS)
  const deck = shuffle([...picked, ...picked]).map((icon, id) => ({
    id, icon, flipped: false, matched: false,
  }))
  return deck
}

export function MemoryGame() {
  const { t, locale, dir } = useI18n()
  const [cards, setCards] = useState<Card[]>(() => newDeck())
  const [selected, setSelected] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)
  const [lock, setLock] = useState(false)

  const reset = useCallback(() => {
    setCards(newDeck())
    setSelected([])
    setMoves(0)
    setWon(false)
    setLock(false)
  }, [])

  const flip = (id: number) => {
    if (lock) return
    const card = cards.find(c => c.id === id)
    if (!card || card.flipped || card.matched) return
    const next = cards.map(c => c.id === id ? { ...c, flipped: true } : c)
    setCards(next)
    const newSelected = [...selected, id]
    setSelected(newSelected)
    if (newSelected.length === 2) {
      setMoves(m => m + 1)
      setLock(true)
      const [a, b] = newSelected
      const ca = next.find(c => c.id === a)!
      const cb = next.find(c => c.id === b)!
      if (ca.icon === cb.icon) {
        setTimeout(() => {
          setCards(cs => cs.map(c => c.id === a || c.id === b ? { ...c, matched: true } : c))
          setSelected([])
          setLock(false)
        }, 400)
      } else {
        setTimeout(() => {
          setCards(cs => cs.map(c => c.id === a || c.id === b ? { ...c, flipped: false } : c))
          setSelected([])
          setLock(false)
        }, 900)
      }
    }
  }

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched)) {
      setWon(true)
    }
  }, [cards])

  return (
    <div dir={dir} className="p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold">{locale === "fa" ? t("games.memory.title") : "Visual Memory"}</h3>
          <p className="text-sm text-muted-foreground mt-1">{locale === "fa" ? t("games.memory.desc") : "Find the matching pairs"}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-bold">
            {t("games.moves")}: {moves}
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

      {/* Cards grid */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-md mx-auto">
        {cards.map((card, i) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => flip(card.id)}
            className="relative aspect-square rounded-xl shadow-md"
            style={{ perspective: 1000 }}
            disabled={card.matched || card.flipped}
          >
            <AnimatePresence>
              {(card.flipped || card.matched) ? (
                <motion.div
                  key="front"
                  initial={{ rotateY: 180, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: 180, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`absolute inset-0 rounded-xl flex items-center justify-center text-3xl sm:text-4xl ${card.matched ? "bg-brand-teal/15 ring-2 ring-brand-teal" : "bg-card border-2 border-brand-orange/40"}`}
                >
                  {card.icon}
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -180, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 rounded-xl flex items-center justify-center text-white shadow-inner"
                  style={{ background: "linear-gradient(135deg, #094588 0%, #13A48B 100%)" }}
                >
                  <span className="text-2xl">◆</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      {/* Win overlay */}
      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 p-5 rounded-2xl bg-brand-teal/10 border border-brand-teal/30 text-center"
          >
            <Trophy className="w-8 h-8 text-brand-teal mx-auto mb-2" />
            <p className="font-semibold text-brand-teal mb-3">{t("games.win")}</p>
            <p className="text-xs text-muted-foreground mb-3">{t("games.moves")}: {moves}</p>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-teal text-white text-sm font-semibold hover:scale-105 transition-transform"
            >
              <RotateCcw className="w-4 h-4" />
              {t("games.restart")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
