import { z } from "zod"

export const contactSchema = z.object({
  parentName: z.string().min(2).max(120),
  contact: z.string().min(3).max(200),
  subject: z.string().min(2).max(200),
  body: z.string().min(5).max(5000),
  lang: z.enum(["fa", "en"]).default("fa"),
})

export const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(6).max(200),
})

export const articleSchema = z.object({
  sectionId: z.string().min(1),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, "slug must be lowercase + dashes"),
  titleFa: z.string().min(1).max(300),
  titleEn: z.string().min(1).max(300),
  excerptFa: z.string().max(600).optional().nullable(),
  excerptEn: z.string().max(600).optional().nullable(),
  bodyFa: z.string().max(20000).optional().nullable(),
  bodyEn: z.string().max(20000).optional().nullable(),
  coverImage: z.string().max(500).optional().nullable(),
  icon: z.string().max(80).optional().nullable(),
  published: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
})

export const siteSettingsSchema = z.object({
  brandNameFa: z.string().min(1).max(100),
  brandNameEn: z.string().min(1).max(100),
  sloganFa: z.string().max(300),
  sloganEn: z.string().max(300),
  addressFa: z.string().max(500).optional().nullable(),
  addressEn: z.string().max(500).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().max(200).optional().or(z.literal("")).nullable(),
  footerNoteFa: z.string().max(600).optional().nullable(),
  footerNoteEn: z.string().max(600).optional().nullable(),
  mapUrl: z.string().max(1000).optional().nullable(),
})

export const socialLinkSchema = z.object({
  platform: z.string().min(2).max(50),
  url: z.string().max(500).optional().nullable(),
  labelFa: z.string().max(100).optional().nullable(),
  labelEn: z.string().max(100).optional().nullable(),
  visible: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
})

export const sectionSchema = z.object({
  key: z.string().min(2).max(80),
  titleFa: z.string().min(1).max(300),
  titleEn: z.string().min(1).max(300),
  subtitleFa: z.string().max(600).optional().nullable(),
  subtitleEn: z.string().max(600).optional().nullable(),
  visible: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
})

export const stageSchema = z.object({
  key: z.string().min(2).max(80),
  titleFa: z.string().min(1).max(200),
  titleEn: z.string().min(1).max(200),
  descriptionFa: z.string().min(1).max(1000),
  descriptionEn: z.string().min(1).max(1000),
  ageRangeFa: z.string().max(80).optional().nullable(),
  ageRangeEn: z.string().max(80).optional().nullable(),
  icon: z.string().max(80).optional().nullable(),
  coverImage: z.string().max(500).optional().nullable(),
  visible: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
})

export const gameSettingsSchema = z.object({
  key: z.string().min(2).max(80),
  titleFa: z.string().min(1).max(200),
  titleEn: z.string().min(1).max(200),
  descriptionFa: z.string().max(500).optional().nullable(),
  descriptionEn: z.string().max(500).optional().nullable(),
  visible: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
})
