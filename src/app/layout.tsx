import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/config";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SetupBanner } from "@/components/SetupBanner";
import { AdSenseScript } from "@/components/AdSenseScript";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <AdSenseScript />
        <SetupBanner />
        <Header />
        <main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-8 sm:px-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
