import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/i18n";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "BSVgo",
    template: "%s | BSVgo",
  },
  description: siteConfig.description,
  alternates: {
    languages: {
      en: "/en",
      zh: "/zh",
    },
  },
  openGraph: {
    title: "BSVgo",
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: "BSVgo",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
