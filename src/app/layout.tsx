import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { SITE_URL, siteUrl } from "@/lib/site";

const vazirmatn = localFont({
  src: [
    { path: "../../public/fonts/Vazirmatn-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Vazirmatn-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/Vazirmatn-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/Vazirmatn-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-baland-fa",
  display: "swap",
  preload: true,
});

const inter = localFont({
  src: [
    { path: "../../public/fonts/Inter-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Inter-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/Inter-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/Inter-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-baland-en",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "بالند | BALAND — مجموعه فرهنگی و آموزشی",
    template: "%s | بالند",
  },
  description: "بالند، مجموعه فرهنگی و آموزشی مبتنی بر علوم یادگیری، علوم اعصاب شناختی و روان‌شناسی رشد کودکان. بالند تا بالندگی همراه شماست.",
  keywords: [
    "بالند", "BALAND", "مدرسه", "آموزش", "پیش‌دبستانی", "دبستان",
    "رشد کودک", "فرزندپروری", "علوم یادگیری", "روان‌شناسی رشد",
    "BALAND school", "preschool", "elementary", "child development",
  ],
  authors: [{ name: "BALAND" }],
  creator: "BALAND",
  publisher: "BALAND",
  icons: {
    icon: "/favicon.svg",
    apple: "/logo.svg",
  },
  manifest: undefined,
  openGraph: {
    title: "BALAND | بالند — مجموعه فرهنگی و آموزشی",
    description: "بالند تا بالندگی همراه شماست — یادگیری مبتنی بر علم، رشد همه‌جانبه کودکان.",
    url: SITE_URL,
    siteName: "BALAND",
    locale: "fa_IR",
    alternateLocale: "en_US",
    type: "website",
    images: [{ url: "/logo.svg", width: 200, height: 200, alt: "BALAND logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BALAND | بالند",
    description: "مجموعه فرهنگی و آموزشی بالند — بالند تا بالندگی همراه شماست.",
    images: ["/logo.svg"],
  },
  alternates: {
    canonical: "/",
    languages: {
      "fa-IR": "/",
      "en-US": "/?lang=en",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "education",
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "BALAND",
  alternateName: "بالند",
  slogan: "BALAND — Growing together toward flourishing",
  description: "Cultural and educational community grounded in learning sciences, cognitive neuroscience, and developmental psychology.",
  url: SITE_URL,
  logo: siteUrl("/logo.svg"),
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body
        className={`${vazirmatn.variable} ${inter.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <ThemeProvider>
          <I18nProvider>
            {children}
            <Toaster />
            <SonnerToaster position="top-center" richColors closeButton />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
