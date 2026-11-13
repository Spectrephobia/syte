# راهنمای انتشار: GitHub ← Render

## ۱. فرستادن پروژه به GitHub
1. در github.com یک ریپازیتوری **Private** و خالی بسازید (بدون README).
2. [GitHub Desktop](https://desktop.github.com) را نصب کنید → `File → Add local repository` → همین پوشه را انتخاب کنید → «create a repository» → `Publish repository`.
   - یا با Git:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/<USER>/<REPO>.git
     git push -u origin main
     ```
3. فایل‌های محرمانه (`.env`، دیتابیس، آپلودها، `node_modules`) طبق `.gitignore` آپلود **نمی‌شوند**.
4. بعد از هر push، تب **Actions** در گیت‌هاب بیلد را خودکار تست می‌کند (`.github/workflows/ci.yml`).

## ۲. بالا آوردن در Render
1. در render.com با حساب GitHub وارد شوید.
2. `New → Blueprint` → ریپازیتوری را انتخاب کنید. Render فایل `render.yaml` را می‌خواند.
3. مقادیر خواسته‌شده را وارد کنید:
   | متغیر | مثال |
   |---|---|
   | `ADMIN_EMAIL` | ایمیل مدیر |
   | `ADMIN_PASSWORD` | یک رمز قوی |
   | `NEXT_PUBLIC_SITE_URL` | `https://baland.onrender.com` (بعداً دامنهٔ خودتان) |
4. `Apply` → چند دقیقه صبر کنید → سایت روی `https://<name>.onrender.com` بالا می‌آید.
5. از این به بعد هر push به `main` خودکار دوباره منتشر می‌شود.

## ⚠️ پلن رایگان
- دیسک ماندگار ندارد: **تغییرات پنل ادمین و عکس‌های آپلودی با هر deploy یا ری‌استارت پاک می‌شوند** (محتوای پیش‌فرض دوباره ساخته می‌شود).
- بعد از ۱۵ دقیقه بی‌استفاده می‌خوابد؛ اولین بازدید بعدی حدود یک دقیقه طول می‌کشد.
- برای سایت واقعی: پلن `starter` + دیسک — راهنمایش داخل `render.yaml` است
  (`DATABASE_URL=file:/var/data/baland.db` و `UPLOAD_DIR=/var/data/uploads`).

## ۳. وصل کردن دامنه
Render → سرویس → `Settings → Custom Domains → Add` → رکورد DNS گفته‌شده (CNAME یا A) را در پنل دامنه ثبت کنید. SSL خودکار فعال می‌شود.
سپس `NEXT_PUBLIC_SITE_URL` را به دامنهٔ جدید تغییر دهید و `Manual Deploy` بزنید.
