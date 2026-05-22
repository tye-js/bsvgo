import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { buildAnalyticsAttrs, buildSectionViewAttrs } from "@/lib/analytics";
import { Locale, uiCopy } from "@/lib/i18n";

type NotFoundContentProps = {
  locale: Locale;
};

export function NotFoundContent({ locale }: NotFoundContentProps) {
  const copy = uiCopy[locale];

  return (
    <main className="bg-[rgb(249,251,250)] px-5 py-16 text-slate-900 md:py-24">
      <section
        className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[1fr_0.85fr]"
        {...buildSectionViewAttrs("404")}
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            {copy.notFoundKicker}
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight text-slate-950 md:text-6xl">
            {copy.notFoundTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
            {copy.notFoundDescription}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${locale}`}
              {...buildAnalyticsAttrs({
                eventName: "nav_click",
                label: copy.backToHome,
                href: `/${locale}`,
                targetType: "nav",
              })}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-200 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              <ArrowLeft className="h-4 w-4" />
              {copy.backToHome}
            </Link>
            <Link
              href={`/${locale}/archive`}
              {...buildAnalyticsAttrs({
                eventName: "nav_click",
                label: copy.navArchive,
                href: `/${locale}/archive`,
                targetType: "nav",
              })}
              className="inline-flex items-center gap-2 rounded-md border border-emerald-900/15 bg-white px-5 py-3 font-semibold text-slate-800 transition hover:border-emerald-500 hover:text-emerald-700"
            >
              {copy.navArchive}
            </Link>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-lg border border-emerald-900/10 bg-white p-6 shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-300 via-cyan-300 to-lime-300" />
          <div className="grid h-48 place-items-center rounded-md bg-[linear-gradient(135deg,rgba(236,253,245,0.98),rgba(240,253,250,0.92))] md:h-64">
            <Compass className="h-20 w-20 text-emerald-600" strokeWidth={1.4} />
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-600">
            {copy.notFoundHint}
          </p>
        </div>
      </section>
    </main>
  );
}
