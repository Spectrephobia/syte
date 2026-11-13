# BALAND | بالند — Cultural & Educational Platform

> بالند تا بالندگی همراه شماست — BALAND, growing together toward flourishing

A complete, modern, bilingual (Fa/En) full-stack website for the BALAND cultural and educational community. Built with Next.js 16, TypeScript, Tailwind CSS 4, Prisma ORM, Three.js (3D), and Framer Motion.

The platform serves three educational stages — Preschool, Elementary First Cycle, and Elementary Second Cycle — and is grounded in learning sciences, cognitive neuroscience, and developmental psychology.

---

## Quick install (Node.js)

**Requirements:** Node.js 20+, npm 10+

```bash
# 1. Extract the archive
tar -xzf baland-portable.tar.gz   # or unzip baland-portable.zip
cd baland-portable

# 2. Configure environment
cp .env.example .env
# Edit .env to set ADMIN_PASSWORD and other secrets

# 3. One-command install + setup + dev
npm install && npm run db:push && npm run db:seed && npm run dev
```

Open `http://localhost:3000`.

For full instructions, see **[INSTALL.md](./INSTALL.md)** (فارسی + English).

---

## Default admin credentials (dev only)

```
Email:    admin@baland.local
Password: baland-admin-2026
```

Change these before deployment by editing `.env` (before seeding) or via `npx prisma studio`.

Access admin at: `http://localhost:3000/?view=admin`

---

## Features

### Public site
- **Intro / Splash page** — full-screen 3D experience with floating diamond crystals, animated brand logo, "شروع بالندگی" CTA
- **Sticky responsive header** with logo, smooth-scroll nav, theme toggle, language switcher
- **Hero section** with 3D crystal scene, gradient text, animated pillars
- **School section** — three educational stage cards (preschool → elementary II) with 3D hover effects
- **Children's World** — 8 expandable article cards
- **Parenting & Family** — 7 expandable article cards
- **Play for Growth** — 3 real, playable games:
  1. **Visual Memory** — flip-and-match card game
  2. **Pattern Discovery** — sequence completion with progressive levels
  3. **Focus & Observation** — find-the-target among distractors with timed scoring
- **Contact section** — form (saves to DB) + admin-configurable contact info + social links + map embed

### Internationalization
- Full **Fa / En** translation system (RTL/LTR auto-switching)
- Locale persisted in `localStorage` and synced to URL `?lang=fa|en`

### Theme system
- **Light mode** — bone canvas (#ECE7DC) with navy/orange accents
- **Dark mode** — void canvas (#07080B) with controlled brand-color usage
- Toggle persisted via `next-themes`

### 3D visuals (React Three Fiber + Three.js)
- Floating diamond crystals in brand colors (orange / teal / navy)
- MeshTransmissionMaterial central piece with chromatic aberration
- Sparkle particles, multi-light setup (ambient + directional + 3 colored point lights)
- Environment map for realistic reflections

### Admin panel (`?view=admin`)
- Secure login (scrypt-hashed passwords, httpOnly session cookies, 7-day TTL)
- In-memory rate limiting on login and contact form
- Dashboard with live stats
- Full CRUD for: messages, articles, sections, school stages, games, social links, media uploads
- Site settings editor (brand, contact info, footer, map URL)

### Backend (Next.js Route Handlers + Prisma)
- 10 Prisma models: AdminUser, AdminSession, SiteSettings, SocialLink, ContentSection, Article, SchoolStage, ContactMessage, MediaAsset, GameSettings
- 25+ API endpoints with Zod validation and admin auth middleware
- Media upload (jpg/png/webp/svg, max 5 MB)

### SEO
- Per-page metadata, OpenGraph, Twitter cards
- JSON-LD EducationalOrganization schema
- Auto `sitemap.xml` and `robots.txt`
- Semantic HTML, ARIA labels, alt text

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Animations | Framer Motion |
| 3D | Three.js + @react-three/fiber + @react-three/drei |
| Icons | lucide-react |
| Database | Prisma ORM (SQLite default; PostgreSQL-ready) |
| Auth | scrypt + httpOnly session cookies |
| Validation | Zod |
| i18n | Custom — `src/i18n/messages/{fa,en}.json` |
| Fonts | Vazirmatn (Fa) + Inter (En), self-hosted woff2 |

---

## npm scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Run migrations |
| `npm run db:reset` | Reset database (destructive) |
| `npm run db:seed` | Seed initial content + admin user |
| `npm run setup` | install + generate + push + seed |

---

## Brand identity

| Token | Value | Usage |
| --- | --- | --- |
| Orange | `#EF8614` | CTA, energy, creativity |
| Teal | `#13A48B` | Growth, learning, flourishing |
| Navy | `#094588` | Trust, stability, brand identity |

**Logo**: SVG diamond mark with three nested diamonds. Replace at `public/logo.svg` and `public/logo-light.svg`.

---

## Routes

| URL | View |
| --- | --- |
| `/` | Intro / splash (3D) |
| `/?view=home` | Main site |
| `/?view=admin` | Admin login → dashboard |
| `/?lang=en` | Switch to English |
| `/?lang=fa` | Switch to Persian (default) |

Sections within home: `#school`, `#children`, `#parenting`, `#games`, `#contact`.

---

## Project structure

```
baland-portable/
├── src/
│   ├── app/                    ← Next.js App Router pages + APIs
│   │   ├── layout.tsx          ← Root layout (fonts, providers, metadata)
│   │   ├── page.tsx            ← View router (intro | home | admin)
│   │   ├── globals.css         ← BALAND design system
│   │   ├── sitemap.ts          ← Auto sitemap.xml
│   │   ├── robots.ts           ← Auto robots.txt
│   │   └── api/                ← API endpoints
│   │       ├── admin/          ← Auth + CRUD (25+ endpoints)
│   │       ├── contact/        ← Public contact form
│   │       └── public/         ← Public content endpoint
│   ├── components/
│   │   ├── three/              ← 3D scenes (React Three Fiber)
│   │   ├── intro/               ← Splash screen
│   │   ├── layout/              ← Header, Footer, Toggles
│   │   ├── sections/            ← Hero, School, Children, Parenting, Games, Contact
│   │   ├── games/               ← 3 playable games
│   │   ├── admin/               ← Admin app + 9 panels
│   │   ├── providers/           ← Theme + i18n providers
│   │   └── ui/                  ← shadcn/ui + BalandLogo
│   ├── lib/
│   │   ├── auth/                ← Password hashing (scrypt) + session
│   │   ├── validation/          ← Zod schemas
│   │   ├── hooks/               ← usePublicContent
│   │   ├── db.ts                ← Prisma client
│   │   └── utils.ts
│   └── i18n/messages/           ← fa.json + en.json
├── prisma/
│   ├── schema.prisma            ← 10 database models
│   └── seed.ts                   ← Seed script (admin + content)
├── public/
│   ├── logo.svg, logo-light.svg, favicon.svg
│   ├── fonts/                    ← Vazirmatn + Inter (woff2, self-hosted)
│   └── uploads/                  ← User-uploaded media (admin)
├── .env.example
├── docker-compose.yml            ← PostgreSQL template
├── Dockerfile                    ← Production Docker image
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── components.json               ← shadcn/ui config
├── INSTALL.md                    ← Full installation guide (Fa/En)
├── README.md                     ← This file
└── package.json
```

---

## API reference (key endpoints)

### Public
- `GET  /api/public/content` — all published site content
- `POST /api/contact` — submit a contact message (rate-limited)

### Admin (auth required)
- `POST   /api/admin/login` — login
- `POST   /api/admin/logout` — logout
- `GET    /api/admin/session` — current session
- `GET    /api/admin/stats` — dashboard counts
- `GET/POST /api/admin/articles` — list / create article
- `PUT/DELETE /api/admin/articles/:id` — update / delete article
- `GET/POST /api/admin/sections` — list / create section
- `GET/POST /api/admin/stages` — list / create school stage
- `GET/POST /api/admin/games` — list / create game settings
- `GET/PUT /api/admin/settings` — get / update site settings + social links
- `POST /api/admin/social` — create social link
- `GET/POST /api/admin/media` — list / upload media
- `GET    /api/admin/messages` — list contact messages
- `PATCH/DELETE /api/admin/messages/:id` — mark read/unread / delete

Full details in [INSTALL.md](./INSTALL.md).

---

## Migrate to PostgreSQL (production)

1. Start Postgres: `docker compose up -d postgres`
2. Edit `prisma/schema.prisma`: change `provider = "sqlite"` → `"postgresql"`
3. Set `DATABASE_URL` in `.env` to `postgresql://baland:baland_secret@localhost:5432/baland`
4. `npm run db:push && npm run db:seed`

---

## Docker deployment

```bash
docker build -t baland .
docker run -p 3000:3000 \
  -e ADMIN_EMAIL=admin@baland.local \
  -e ADMIN_PASSWORD=change-me \
  -e NEXT_PUBLIC_SITE_URL=https://your-domain.com \
  baland
```

---

## License

© BALAND. All rights reserved. Private and proprietary.
