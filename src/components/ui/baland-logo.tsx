"use client"

import Image from "next/image"
import { useTheme } from "next-themes"

interface Props {
  size?: number
  className?: string
}

export function BalandLogo({ size = 40, className = "" }: Props) {
  const { theme, systemTheme } = useTheme()
  const isDark = theme === "dark" || (theme === "system" && systemTheme === "dark")
  return (
    <Image
      src={isDark ? "/logo-light.svg" : "/logo.svg"}
      alt="BALAND logo"
      width={size}
      height={size}
      priority
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
