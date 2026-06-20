import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, Search, SlidersHorizontal } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { buildAnalyticsAttrs, buildSectionViewAttrs } from "@/lib/analytics";
import {
  getLocalizedCategories,
  getLocalizedTags,
  searchLocalizedPosts,
} from "@/lib/blog";
import { imageSizes } from "@/lib/image-sizes";
import { Locale, locales, siteConfig, uiCopy } from "@/lib/i18n";

export const revalidate = 120;

type ArchiveSearchParams = {
  q?: string | string[];
  category?: string | string[];
  tag?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeSearchParams(searchParams: ArchiveSearchParams) {
  return {
    q: firstParam(searchParams.q)?.trim() ?? "",
    category: firstParam(searchParams.category)?.trim() ?? "",
    tag: firstParam(searchParams.tag)?.trim() ?? "",
  };
}

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
    title: copy.archiveTitle,
    description: copy.archiveDescription,
    alternates: {
      canonical: `/${locale}/archive`,
      languages: {
        en: "/en/archive",
        zh: "/zh/archive",
      },
    },
    openGraph: {
      title: `${copy.archiveTitle} | BSVgo`,
      description: copy.archiveDescription,
      url: `${siteConfig.url}/${locale}/archive`,
      type: "website",
    },
  };
}

export default async function ArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<ArchiveSearchParams>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const copy = uiCopy[locale];
  const filters = normalizeSearchParams(await searchParams);
  const [categories, tags, posts] = await Promise.all([
    getLocalizedCategories(locale),
    getLocalizedTags(locale),
    searchLocalizedPosts(locale, {
      search: filters.q,
      categorySlug: filters.category,
      tagSlug: filters.tag,
    }),
  ]);
  const hasFilters = Boolean(filters.q || filters.category || filters.tag);

  return (
    <main className="bg-[rgb(249,251,250)] text-slate-900">
      <section
        className="border-b border-emerald-900/10 bg-[linear-gradient(135deg,rgba(236,253,245,0.96),rgba(250,252,255,0.98))] px-5 py-12"
        {...buildSectionViewAttrs("archive-hero")}
      >
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-900/10 bg-white/72 px-3 py-2 text-emerald-700">
            <Archive className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">
              {copy.archiveKicker}
            </span>
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
            {copy.archiveTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            {copy.archiveDescription}
          </p>
        </div>
      </section>

      <section
        className="border-b border-emerald-900/10 bg-white px-5 py-6"
        {...buildSectionViewAttrs("archive-filters")}
      >
        <form className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[minmax(240px,1.4fr)_minmax(180px,0.9fr)_minmax(180px,0.9fr)_auto_auto] lg:items-end">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {copy.archiveSearchLabel}
            </span>
            <span className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-[rgb(249,251,250)] px-3 py-2.5 focus-within:border-emerald-300">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                name="q"
                defaultValue={filters.q}
                placeholder={copy.archiveSearchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </span>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {copy.archiveCategoryLabel}
            </span>
            <select
              name="category"
              defaultValue={filters.category}
              className="mt-2 h-[43px] w-full rounded-lg border border-slate-200 bg-[rgb(249,251,250)] px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300"
            >
              <option value="">{copy.archiveAllCategories}</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {copy.archiveTagLabel}
            </span>
            <select
              name="tag"
              defaultValue={filters.tag}
              className="mt-2 h-[43px] w-full rounded-lg border border-slate-200 bg-[rgb(249,251,250)] px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300"
            >
              <option value="">{copy.archiveAllTags}</option>
              {tags.map((tag) => (
                <option key={tag.slug} value={tag.slug}>
                  {tag.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="inline-flex h-[43px] items-center justify-center gap-2 rounded-md bg-emerald-200 px-5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-100"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {copy.archiveSubmit}
          </button>

          {hasFilters ? (
            <Link
              href={`/${locale}/archive`}
              {...buildAnalyticsAttrs({
                eventName: "nav_click",
                label: copy.archiveClear,
                href: `/${locale}/archive`,
                targetType: "internal",
              })}
              className="inline-flex h-[43px] items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              {copy.archiveClear}
            </Link>
          ) : null}
        </form>
      </section>

      <section
        className="mx-auto max-w-7xl px-5 py-12"
        {...buildSectionViewAttrs("archive-results")}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-slate-700">
            {posts.length} {copy.archiveResults}
          </p>
          {hasFilters ? (
            <p className="truncate text-sm text-slate-500">
              {[filters.q, filters.category, filters.tag].filter(Boolean).join(" / ")}
            </p>
          ) : null}
        </div>

        {posts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <ArticleCard
                key={post.slug}
                locale={locale}
                post={post}
                section="archive"
                density="regular"
                showMetaIcons
                showReadMoreIcon
                imageSizes={imageSizes.cardGrid}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-emerald-900/10 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              {copy.archiveEmptyTitle}
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              {copy.archiveEmptyDescription}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
