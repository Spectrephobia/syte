"use client"

import { useEffect, useRef, type ReactNode } from "react"
import Lenis from "lenis"
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion"

/* ------------------------------------------------------------------ *
 * Scroll system: inertial smooth scrolling (Lenis), a brand progress
 * rail, and section "stages" that settle into place as they arrive.
 * ------------------------------------------------------------------ */

let lenis: Lenis | null = null

/** Smoothly scroll to a selector, element or Y position (header offset aware). */
export function scrollToTarget(target: string | HTMLElement | number, offset = -80) {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target
  if (el === null) return
  if (lenis) {
    lenis.scrollTo(el, { offset: typeof el === "number" ? 0 : offset, duration: 1.4 })
    return
  }
  const top = typeof el === "number" ? el : el.getBoundingClientRect().top + window.scrollY + offset
  window.scrollTo({ top, behavior: "smooth" })
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const instance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
    })
    lenis = instance
    let raf = 0
    const loop = (time: number) => {
      instance.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      instance.destroy()
      if (lenis === instance) lenis = null
    }
  }, [reduced])

  return <>{children}</>
}

/** Thin rail on top of the page showing reading progress in brand colours. */
export function ScrollProgress({ rtl = false }: { rtl?: boolean }) {
  const { scrollYProgress } = useScroll()
  const x = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 })
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[2px]"
      style={{
        scaleX: x,
        transformOrigin: rtl ? "100% 50%" : "0% 50%",
        background: `linear-gradient(${rtl ? 270 : 90}deg, #094588, #13A48B 55%, #EF8614)`,
      }}
    />
  )
}

/**
 * Wrap a section so it rises, sharpens and settles as it scrolls in,
 * and recedes slightly as the next one takes over.
 */
export function ScrollStage({ children, id }: { children: ReactNode; id?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.35"] })
  const { scrollYProgress: out } = useScroll({ target: ref, offset: ["end 0.6", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [90, 0])
  const scaleIn = useTransform(scrollYProgress, [0, 1], [0.96, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [0.25, 1])
  const scaleOut = useTransform(out, [0, 1], [1, 0.97])
  const dim = useTransform(out, [0, 1], [1, 0.55])
  const scale = useTransform([scaleIn, scaleOut], ([a, b]: number[]) => a * b)
  const fade = useTransform([opacity, dim], ([a, b]: number[]) => a * b)

  if (reduced) return <div id={id}>{children}</div>
  return (
    <motion.div ref={ref} id={id} style={{ y, scale, opacity: fade }} className="origin-top will-change-transform">
      {children}
    </motion.div>
  )
}
