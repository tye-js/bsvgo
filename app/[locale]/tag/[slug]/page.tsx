import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { getLocalizedPosts, getLocalizedTags } from "@/lib/blog";
import { getAllTagSlugs, slugifyTag } from "@/lib/content";
import { Locale, locales, uiCopy } from "@/lib/i18n";

export function generateStaticParams() {
  const slugs = getAllTagSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!locales.includes(locale)) {
    return {};
  }

  const tags = await getLocalizedTags(locale);
  const tag = tags.find((item) => item.slug === slug);
  const copy = uiCopy[locale];

  if (!tag) {
    return {};
  }

  return {
    title: tag.name,
    description: `Posts tagged with ${tag.name} on BSVgo.`,
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

  const tags = await getLocalizedTags(locale);
  const tag = tags.find((item) => item.slug === slug);
  const copy = uiCopy[locale];

  if (!tag) {
    notFound();
  }

  const posts = (await getLocalizedPosts(locale)).filter((post) =>
    (post.tags ?? []).map(slugifyTag).includes(slug)
  );

  return (
    <main className="bg-[rgb(249,251,250)]">
      <section className="px-5 py-16">
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
      <section className="mx-auto max-w-7xl px-5 pb-16">
        {posts.map((post) => (
          <ArticleCard key={post.slug} locale={locale} post={post} />
        ))}
      </section>
    </main>
  );
}
