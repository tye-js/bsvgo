import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Mail } from "lucide-react";
import { buildAnalyticsAttrs, buildSectionViewAttrs } from "@/lib/analytics";
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
    title: copy.aboutTitle,
    description: copy.aboutDescription,
    alternates: {
      canonical: `/${locale}/about`,
      languages: {
        en: "/en/about",
        zh: "/zh/about",
      },
    },
    openGraph: {
      title: `${copy.aboutTitle} | BSVgo`,
      description: copy.aboutDescription,
      url: `${siteConfig.url}/${locale}/about`,
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const copy = uiCopy[locale];

  return (
    <main className="bg-[rgb(249,251,250)] text-slate-900">
      <section
        className="border-b border-emerald-900/10 bg-[linear-gradient(135deg,rgba(236,253,245,0.96),rgba(250,252,255,0.98))]"
        {...buildSectionViewAttrs("about-hero")}
      >
        <div className="mx-auto max-w-7xl px-5 py-14 sm:py-18 lg:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            {copy.aboutKicker}
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
            {copy.aboutTitle}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            {copy.aboutDescription}
          </p>
        </div>
      </section>

      <section className="border-b border-emerald-900/10 bg-white py-12 sm:py-14">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.65fr)]">
          <article className="rounded-lg border border-teal-900/10 bg-[rgb(249,251,250)] p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              {copy.aboutMissionTitle}
            </p>
            <p className="mt-5 text-base leading-8 text-slate-700 sm:text-lg">
              {copy.aboutMissionBody}
            </p>
          </article>

          <article className="rounded-lg border border-teal-900/10 bg-[rgb(240,253,250)] p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              {copy.aboutBsvTitle}
            </p>
            <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              {copy.aboutBsvBody}
            </p>
          </article>
        </div>
      </section>

      <section className="border-b border-emerald-900/10 bg-[rgb(240,253,250)] py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-4 md:grid-cols-3">
            {copy.aboutPrinciples.map((principle, index) => (
              <div
                key={principle}
                className="rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  {copy.aboutPrinciplesTitle} / 0{index + 1}
                </p>
                <p className="mt-4 text-base font-semibold leading-7 text-slate-900">
                  {principle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-5">
          <aside className="max-w-2xl rounded-lg border border-teal-900/10 bg-[rgb(249,251,250)] p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              {copy.aboutContactTitle}
            </p>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              {copy.aboutContactBody}
            </p>
            <a
              href="mailto:hello@bsvgo.com"
              {...buildAnalyticsAttrs({
                eventName: "outbound_click",
                label: "hello@bsvgo.com",
                href: "mailto:hello@bsvgo.com",
                targetType: "email",
              })}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-emerald-200 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-100"
            >
              <Mail className="h-4 w-4" />
              hello@bsvgo.com
            </a>
          </aside>

          <Link
            href={`/${locale}`}
            {...buildAnalyticsAttrs({
              eventName: "nav_click",
              label: copy.backToHome,
              href: `/${locale}`,
              targetType: "nav",
            })}
            className="mt-8 inline-flex items-center gap-2 rounded-md border border-teal-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            {copy.backToHome}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
