# راهنمای نصب BALAND

> بالند | BALAND — مجموعه فرهنگی و آموزشی

این پکیج شامل کل کد فرانت‌اند و بک‌اند پلتفرم بالند است و با Node.js قابل اجراست.

---

## پیش‌نیازها

| مورد | حداقل نسخه | توضیح |
| --- | --- | --- |
| Node.js | 20.0+ | حتماً LTS نصب کنید → https://nodejs.org |
| npm | 10+ | همراه با Node.js نصب می‌شود |
| (اختیاری) Docker | هر نسخه | برای اجرای PostgreSQL محلی |

برای بررسی نصب بودن:
```bash
node --version
npm --version
```

---

## مراحل نصب سریع (Quick Start)

### مرحله ۱ — استخراج پکیج

```bash
tar -xzf baland-portable.tar.gz
cd baland-portable
```

### مرحله ۲ — نصب وابستگی‌ها

```bash
npm install
```

این دستور همه‌ی پکیج‌های موردنیاز را نصب می‌کند و به‌طور خودکار Prisma Client را تولید می‌کند.

### مرحله ۳ — تنظیم متغیرهای محیط

```bash
cp .env.example .env
```

سپس فایل `.env` را با ویرایشگر متن باز کنید و مقادیر را تنظیم کنید:

```env
DATABASE_URL="file:./db/custom.db"
ADMIN_EMAIL="admin@baland.local"
ADMIN_PASSWORD="baland-admin-2026"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

> رمز عبور مدیر را حتماً قبل از راه‌اندازی تغییر دهید.

### مرحله ۴ — راه‌اندازی دیتابیس

```bash
npm run db:push    # ایجاد جداول در دیتابیس SQLite
npm run db:seed    # درج محتوای اولیه و کاربر مدیر
```

### مرحله ۵ — اجرای پروژه

```bash
npm run dev
```

سایت روی آدرس زیر در دسترس است:
```
http://localhost:3000
```

---

## نصب یک‌مرحله‌ای (All-in-one)

می‌توانید با یک دستور همه مراحل را اجرا کنید:

```bash
cp .env.example .env && npm install && npm run db:push && npm run db:seed && npm run dev
```

---

## ساخت نسخه Production

```bash
npm run build
npm run start
```

برای اجرای Production روی پورت دلخواه:
```bash
PORT=8080 npm run start
```

---

## دسترسی به پنل مدیریت

پس از اجرای پروژه:

1. به آدرس `http://localhost:3000/?view=admin` بروید
2. با اطلاعات زیر وارد شوید:
   - ایمیل: `admin@baland.local`
   - رمز: `baland-admin-2026`
3. از پنل مدیریت می‌توانید:
   - مطالب بخش «دنیای فرزندان» و «والدگری» را مدیریت کنید
   - اطلاعات تماس، آدرس و شبکه‌های اجتماعی را تنظیم کنید
   - مراحل آموزشی مدرسه را ویرایش کنید
   - پیام‌های دریافتی از فرم تماس را مشاهده کنید
   - تصاویر و فایل‌های رسانه‌ای را آپلود کنید
   - تنظیمات نمایش بازی‌ها را تغییر دهید

---

## مسیرهای اصلی سایت

| مسیر | توضیح |
| --- | --- |
| `/` | صفحه‌ی Intro (Splash) با تجربه بصری ۳بعدی |
| `/?view=home` | صفحه‌ی اصلی سایت |
| `/?view=admin` | پنل مدیریت |
| `/?lang=en` | تغییر زبان به انگلیسی |
| `/?lang=fa` | تغییر زبان به فارسی (پیش‌فرض) |

بخش‌های صفحه اصلی با Hash قابل دسترسی هستند:
`#school`, `#children`, `#parenting`, `#games`, `#contact`

---

## اجرا با PostgreSQL (توصیه شده برای Production)

### گزینه ۱ — با Docker

```bash
docker compose up -d postgres
```

### گزینه ۲ — PostgreSQL محلی

اگر PostgreSQL روی سیستم شما نصب است، یک دیتابیس بسازید:

```sql
CREATE DATABASE baland;
CREATE USER baland WITH PASSWORD 'baland_secret';
GRANT ALL PRIVILEGES ON DATABASE baland TO baland;
```

### تنظیم پروژه برای PostgreSQL

1. فایل `prisma/schema.prisma` را باز کنید و خط زیر را تغییر دهید:
   ```prisma
   datasource db {
     provider = "postgresql"   // از "sqlite" به "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. فایل `.env` را به‌روزرسانی کنید:
   ```env
   DATABASE_URL="postgresql://baland:baland_secret@localhost:5432/baland"
   ```

3. دیتابیس را راه‌اندازی کنید:
   ```bash
   npm run db:push
   npm run db:seed
   ```

---

## اسکریپت‌های npm

| دستور | کاربرد |
| --- | --- |
| `npm run dev` | اجرای سرور توسعه روی پورت 3000 |
| `npm run build` | ساخت نسخه‌ی Production |
| `npm run start` | اجرای نسخه‌ی Production |
| `npm run lint` | بررسی کد با ESLint |
| `npm run db:push` | اعمال schema روی دیتابیس |
| `npm run db:generate` | تولید Prisma Client |
| `npm run db:migrate` | اجرای migration |
| `npm run db:reset` | ریست دیتابیس (محتوای قبلی حذف می‌شود) |
| `npm run db:seed` | درج محتوای اولیه و کاربر مدیر |
| `npm run setup` | نصب + تولید Prisma + push + seed |

---

## ساختار پروژه

```
baland-portable/
├── src/
│   ├── app/                    ← صفحات و APIهای Next.js
│   │   ├── layout.tsx          ← ریشه‌ی اپلیکیشن
│   │   ├── page.tsx            ← صفحه‌ی اصلی (intro / home / admin)
│   │   ├── globals.css         ← سیستم طراحی BALAND
│   │   ├── sitemap.ts          ← SEO sitemap
│   │   ├── robots.ts           ← SEO robots
│   │   └── api/                ← API endpoints
│   │       ├── admin/          ← احراز هویت و CRUD مدیریت
│   │       ├── contact/        ← فرم تماس عمومی
│   │       └── public/         ← محتوای عمومی سایت
│   ├── components/
│   │   ├── three/              ← صحنه‌های ۳بعدی با Three.js
│   │   ├── intro/              ← صفحه‌ی splash
│   │   ├── layout/             ← Header, Footer, Toggles
│   │   ├── sections/           ← بخش‌های صفحه اصلی
│   │   ├── games/              ← بازی‌های واقعی
│   │   ├── admin/              ← پنل مدیریت
│   │   ├── providers/          ← Theme و i18n Providers
│   │   └── ui/                 ← کامپوننت‌های shadcn/ui
│   ├── lib/
│   │   ├── auth/               ← هش رمز و session
│   │   ├── validation/         ← Zod schemas
│   │   ├── hooks/              ← React hooks
│   │   ├── db.ts               ← Prisma Client
│   │   └── utils.ts
│   └── i18n/messages/          ← ترجمه‌های fa.json و en.json
├── prisma/
│   ├── schema.prisma           ← مدل‌های دیتابیس (10 مدل)
│   └── seed.ts                 ← اسکریپت درج داده اولیه
├── public/
│   ├── logo.svg                ← لوگوی اصلی
│   ├── logo-light.svg          ← لوگوی تم تاریک
│   ├── favicon.svg
│   └── fonts/                  ← فونت‌های Vazirmatn و Inter (woff2)
├── .env.example                ← نمونه‌ی متغیرهای محیط
├── docker-compose.yml          ← پیکربندی PostgreSQL با Docker
├── next.config.ts              ← پیکربندی Next.js
├── tailwind.config.ts          ← پیکربندی Tailwind CSS 4
├── tsconfig.json               ← پیکربندی TypeScript
├── eslint.config.mjs           ← پیکربندی ESLint
├── components.json             ← پیکربندی shadcn/ui
├── package.json                ← وابستگی‌ها و اسکریپت‌ها
└── README.md                   ← مستندات کامل پروژه
```

---

## عیب‌یابی

### خطای "Cannot find module '@prisma/client'"

```bash
npm run db:generate
```

### خطای "Database connection failed"

- بررسی کنید فایل `.env` وجود دارد و `DATABASE_URL` درست تنظیم شده است.
- برای SQLite، مطمئن شوید پوشه‌ی `db/` وجود دارد (به‌طور خودکار ساخته می‌شود).

### خطای "Port 3000 is already in use"

```bash
PORT=3001 npm run dev
```

### بازیابی رمز مدیر

اگر رمز مدیر را فراموش کردید، می‌توانید دیتابیس را ریست کنید:

```bash
npm run db:reset
```

یا با ابزار Prisma Studio کاربر را ویرایش کنید:

```bash
npx prisma studio
```

سپس جدول `AdminUser` را باز کنید و رمز جدید وارد کنید (رمز باید با scrypt هش شود؛ برای تولید هش از اسکریپت `prisma/seed.ts` کمک بگیرید).

---

## اطلاعات تماس

برای پشتیبانی و سؤال‌های فنی، لطفاً از طریق فرم تماس سایت با ما در ارتباط باشید.

© BALAND. All rights reserved.
