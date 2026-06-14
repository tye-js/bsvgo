import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage } from "@/components/home-page";
import { Locale, locales, siteConfig, uiCopy } from "@/lib/i18n";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    return {};
  }

  const copy = uiCopy[locale];

  return {
    title: "BSVgo",
    description: copy.heroDescription,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        zh: "/zh",
      },
    },
    openGraph: {
      title: "BSVgo",
      description: copy.heroDescription,
      url: `${siteConfig.url}/${locale}`,
    },
  };
}

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  return <HomePage locale={locale} />;
}
