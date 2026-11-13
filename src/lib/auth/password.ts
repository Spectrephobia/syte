import { randomBytes, scryptSync, timingSafeEqual } from "crypto"

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const test = scryptSync(password, salt, 64)
  const real = Buffer.from(hash, "hex")
  if (test.length !== real.length) return false
  return timingSafeEqual(test, real)
}

export function generateToken(): string {
  return randomBytes(32).toString("hex")
}

export const SESSION_COOKIE = "baland_admin_session"
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days
