import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { CollectionCard } from "@/components/collection-card";
import { buildAnalyticsAttrs, buildSectionViewAttrs } from "@/lib/analytics";
import { getLocalizedCollections } from "@/lib/blog";
import { Locale, locales, siteConfig } from "@/lib/i18n";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "zh" ? "专题阅读 | BSVgo" : "Collections | BSVgo";
  const description =
    locale === "zh"
      ? "按主题组织的 BSVgo 文章专辑。"
      : "Topic-based BSVgo article collections.";

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/${locale}/collections`,
    },
  };
}

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const collections = await getLocalizedCollections(locale);

  return (
    <main className="bg-[rgb(249,251,250)]">
      <section
        className="border-b border-emerald-900/10 bg-[linear-gradient(135deg,rgba(236,253,245,0.95),rgba(250,252,255,0.98))] py-14"
        {...buildSectionViewAttrs("collections-index")}
      >
        <div className="mx-auto max-w-7xl px-5">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            <BookOpen className="h-4 w-4" />
            {locale === "zh" ? "专题" : "Collections"}
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            {locale === "zh" ? "专题阅读" : "Reading collections"}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            {locale === "zh"
              ? "围绕一个主题连续阅读，按后台设定顺序组织文章。"
              : "Follow a focused topic through an ordered set of articles."}
          </p>
        </div>
      </section>

      <section className="py-12">
        {collections.length > 0 ? (
          <div className="mx-auto grid max-w-7xl gap-5 px-5 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.slug}
                locale={locale}
                collection={collection}
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-3xl px-5">
            <div className="rounded-lg border border-emerald-900/10 bg-white p-8 text-center shadow-sm">
              <BookOpen className="mx-auto h-10 w-10 text-emerald-600" />
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                {locale === "zh" ? "专题正在整理中" : "Collections are being organized"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {locale === "zh"
                  ? "后台发布专题后，这里会自动展示可连续阅读的文章专辑。"
                  : "Published collections from the CMS will appear here automatically."}
              </p>
              <Link
                href={`/${locale}/archive`}
                {...buildAnalyticsAttrs({
                  eventName: "nav_click",
                  label: locale === "zh" ? "浏览归档" : "Browse archive",
                  href: `/${locale}/archive`,
                  targetType: "nav",
                })}
                className="mt-5 inline-flex items-center justify-center rounded-md bg-emerald-100 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-200"
              >
                {locale === "zh" ? "浏览归档" : "Browse archive"}
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
