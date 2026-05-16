import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Blocks, Brain, ServerCog } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import {
  getLocalizedCategoryBySlug,
  getLocalizedPosts,
} from "@/lib/blog";
import { getCategoryBySlug } from "@/lib/content";
import { Locale, locales, siteConfig, uiCopy } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const sectionIcons = {
  blockchain: Blocks,
  ai: Brain,
  infrastructure: ServerCog,
} as const;

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
    openGraph: {
      title: `${translation.name} | BSVgo`,
      description: translation.description,
      url: `${siteConfig.url}/${locale}/category/${slug}`,
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

  const category = await getLocalizedCategoryBySlug(locale, slug);

  if (!category) {
    notFound();
  }

  const copy = uiCopy[locale];
  const allPosts = await getLocalizedPosts(locale);
  const posts = allPosts.filter((post) => post.categorySlug === slug);
  const featured = posts.find((post) => post.featured) ?? posts[0] ?? null;
  const archive = featured
    ? posts.filter((post) => post.slug !== featured.slug)
    : posts;
  const Icon =
    sectionIcons[slug as keyof typeof sectionIcons] ?? ServerCog;

  return (
    <main className="bg-[rgb(249,251,250)] text-slate-900">
      <section className="relative isolate overflow-hidden border-b border-emerald-900/10 bg-[linear-gradient(135deg,rgba(236,253,245,0.96),rgba(250,252,255,0.96))]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.82fr)] lg:items-end lg:py-14">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
          {siteConfig.name}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="rounded-md bg-emerald-100 p-3 text-emerald-800">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                {copy.categoryFeaturedTitle}
              </p>
            </div>
            <h1 className="mt-4 text-4xl font-black leading-[0.98] tracking-tight text-slate-950 md:text-6xl">
              {category.name}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
              {category.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/${locale}#latest`}
                className="inline-flex items-center justify-center rounded-md bg-emerald-200 px-5 py-3 font-semibold text-slate-900 transition hover:bg-emerald-100"
              >
                {copy.heroPrimary}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href={`/${locale}`}
                className="inline-flex items-center justify-center rounded-md border border-teal-900/15 bg-white/70 px-5 py-3 font-semibold text-slate-700 transition hover:bg-white"
              >
                {copy.backToHome}
              </Link>
            </div>
          </div>

          {featured ? (
            <aside className="overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-sm">
              <Link href={`/${locale}/posts/${featured.slug}`} className="group block">
                <div className="relative aspect-[16/10] overflow-hidden bg-emerald-50">
                  <img
                    src={featured.coverImage}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/48 via-slate-950/8 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <span className="rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                      {copy.categoryFeaturedTitle}
                    </span>
                    <h2 className="mt-4 text-2xl font-bold leading-tight text-white">
                      {featured.title}
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-slate-100/90">
                      {featured.excerpt}
                    </p>
                  </div>
                </div>
              </Link>
            </aside>
          ) : null}
        </div>
      </section>

      <section className="border-b border-emerald-900/10 bg-white py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
              {copy.categoryArchiveTitle}
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
              {copy.categoryArchiveDescription}
            </h2>
          </div>
          <div className="mt-10">
            {archive.length > 0 ? (
              <div className="space-y-0">
                {archive.map((post) => (
                  <ArticleCard key={post.slug} locale={locale} post={post} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No more posts in this category.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
