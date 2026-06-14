import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { buildSectionViewAttrs } from "@/lib/analytics";
import {
  getLocalizedPostsByTagSlug,
  getLocalizedTagBySlug,
} from "@/lib/blog";
import { Locale, locales, siteConfig, uiCopy } from "@/lib/i18n";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!locales.includes(locale)) {
    return {};
  }

  const tag = await getLocalizedTagBySlug(locale, slug);

  if (!tag) {
    return {};
  }

  return {
    title: tag.name,
    description: `Posts tagged with ${tag.name} on BSVgo.`,
    alternates: {
      canonical: `/${locale}/tag/${slug}`,
      languages: {
        en: `/en/tag/${slug}`,
        zh: `/zh/tag/${slug}`,
      },
    },
    openGraph: {
      title: `${tag.name} | BSVgo`,
      description: `Posts tagged with ${tag.name} on BSVgo.`,
      url: `${siteConfig.url}/${locale}/tag/${slug}`,
    },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const tag = await getLocalizedTagBySlug(locale, slug);
  const copy = uiCopy[locale];

  if (!tag) {
    notFound();
  }

  const posts = await getLocalizedPostsByTagSlug(locale, slug);

  return (
    <main className="bg-[rgb(249,251,250)]">
      <section className="px-5 py-16" {...buildSectionViewAttrs(`tag-hero-${slug}`)}>
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            {copy.tagArchiveTitle}
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
            {tag.name}
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            {tag.count} {copy.tagCountLabel}
          </p>
        </div>
      </section>
      <section
        className="mx-auto max-w-7xl px-5 pb-16"
        {...buildSectionViewAttrs(`tag-articles-${slug}`)}
      >
        {posts.map((post) => (
          <ArticleCard key={post.slug} locale={locale} post={post} />
        ))}
      </section>
    </main>
  );
}
