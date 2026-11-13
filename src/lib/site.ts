/**
 * Single source of truth for the public site URL (SEO, sitemap, robots, OG).
 * Set NEXT_PUBLIC_SITE_URL on the host, e.g. https://baland.onrender.com
 * Note: NEXT_PUBLIC_* values are inlined at build time.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "")

export const siteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
