"use client";

import { NotFoundContent } from "@/components/not-found-content";
import { useParams } from "next/navigation";
import { defaultLocale, Locale, locales } from "@/lib/i18n";

export default function LocaleNotFound() {
  const params = useParams<{ locale?: string }>();
  const locale = locales.includes(params.locale as Locale)
    ? (params.locale as Locale)
    : defaultLocale;

  return <NotFoundContent locale={locale} />;
}
