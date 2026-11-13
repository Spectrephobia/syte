"use client"

import { Header } from "./header"
import { Footer } from "./footer"
import { HeroSection } from "@/components/sections/hero-section"
import { SchoolSection } from "@/components/sections/school-section"
import { ChildrenSection } from "@/components/sections/children-section"
import { ParentingSection } from "@/components/sections/parenting-section"
import { GamesSection } from "@/components/sections/games-section"
import { ContactSection } from "@/components/sections/contact-section"
import { SmoothScroll, ScrollProgress, ScrollStage, scrollToTarget } from "@/components/scroll/smooth-scroll"
import { useI18n } from "@/components/providers/i18n-provider"

interface Props {
  onBackToIntro?: () => void
  onAdminShortcut?: () => void
}

export function HomeView({ onBackToIntro, onAdminShortcut }: Props) {
  const { dir } = useI18n()
  return (
    <SmoothScroll>
      <ScrollProgress rtl={dir === "rtl"} />
      <div className="min-h-screen flex flex-col">
        <Header onAdminShortcut={onAdminShortcut} />
        <main className="flex-1 overflow-x-clip">
          <HeroSection onExplore={() => scrollToTarget("#school")} />
          <ScrollStage><SchoolSection /></ScrollStage>
          <ScrollStage><ChildrenSection /></ScrollStage>
          <ScrollStage><ParentingSection /></ScrollStage>
          <ScrollStage><GamesSection /></ScrollStage>
          <ScrollStage><ContactSection /></ScrollStage>
        </main>
        <Footer onBackToIntro={onBackToIntro} />
      </div>
    </SmoothScroll>
  )
}
