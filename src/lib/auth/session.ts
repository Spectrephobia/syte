import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { SESSION_COOKIE } from "./password"

export interface AdminSessionUser {
  id: string
  email: string
  name: string
  role: string
}

export async function getCurrentAdmin(): Promise<AdminSessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const session = await db.adminSession.findUnique({
    where: { token },
    include: { user: true },
  })
  if (!session) return null
  if (session.expiresAt < new Date()) {
    await db.adminSession.delete({ where: { id: session.id } }).catch(() => {})
    return null
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  }
}

export async function requireAdmin(): Promise<AdminSessionUser> {
  const user = await getCurrentAdmin()
  if (!user) throw new Error("UNAUTHORIZED")
  return user
}
