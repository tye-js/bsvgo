import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { getLocalizedPosts } from "@/lib/blog";
import { getCategoryBySlug } from "@/lib/content";
import { Locale, locales, siteConfig } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!locales.includes(locale)) {
    return {};
  }

  const category = getCategoryBySlug(slug);

  if (!category) {
    return {};
  }

  const translation = category.translations[locale];

  return {
    title: translation.name,
    description: translation.description,
    alternates: {
      canonical: `/${locale}/category/${slug}`,
      languages: {
        en: `/en/category/${slug}`,
        zh: `/zh/category/${slug}`,
      },
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const translation = category.translations[locale];
  const posts = (await getLocalizedPosts(locale)).filter(
    (post) => post?.categorySlug === slug
  );

  return (
    <main className="bg-[rgb(249,251,250)]">
      <section className="bg-[linear-gradient(135deg,rgba(236,253,245,0.95),rgba(239,246,255,0.95))] px-5 py-20 text-slate-900">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            {siteConfig.name}
          </p>
          <h1 className="mt-6 text-5xl font-black tracking-tight">
            {translation.name}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            {translation.description}
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16">
        {posts.map((post) => (
          <ArticleCard key={post.slug} locale={locale} post={post} />
        ))}
      </section>
    </main>
  );
}
