import type { Metadata, Viewport } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealScript from "@/components/RevealScript";
import { site } from "@/lib/content";
import { archivo, syne } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.seo.url || "https://example.com"),
  title: {
    default: site.seo.siteName,
    template: `%s — ${site.name}`,
  },
  description: site.seo.description,
  applicationName: site.seo.siteName,
  authors: [{ name: site.name }],
  creator: site.name,
  openGraph: {
    type: "website",
    siteName: site.seo.siteName,
    title: site.seo.siteName,
    description: site.seo.description,
    url: site.seo.url || undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: site.seo.siteName,
    description: site.seo.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#08090A",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-Hant"
      suppressHydrationWarning
      className={`no-js ${syne.variable} ${archivo.variable}`}
    >
      <head>
        <RevealScript />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-bone focus:px-4 focus:py-2 focus:text-[length:var(--text-meta)] focus:font-semibold focus:tracking-widest focus:text-ink focus:uppercase"
        >
          跳至主要內容
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <Reveal />
      </body>
    </html>
  );
}
