import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Blocks,
  Brain,
  ServerCog,
} from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { SectionHeader } from "@/components/section-header";
import { SafeImage } from "@/components/safe-image";
import { buildAnalyticsAttrs, buildSectionViewAttrs } from "@/lib/analytics";
import {
  getCategoryFeaturedPost,
  getCategoryPromotedPosts,
  getLocalizedCategoryBySlug,
  getLocalizedPostsByCategorySlug,
} from "@/lib/blog";
import { createCoverArtDataUri, getRenderableImageSrc } from "@/lib/cover-art";
import { isCategorySlug } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { Locale, locales, siteConfig, uiCopy } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const sectionIcons = {
  blockchain: Blocks,
  ai: Brain,
  infrastructure: ServerCog,
} as const;

const categoryStyles = {
  blockchain: {
    page: "bg-[rgb(249,251,250)]",
    hero:
      "bg-[linear-gradient(135deg,rgba(236,253,245,0.96),rgba(250,252,255,0.98))]",
    section: "bg-white",
    list: "bg-[rgb(249,251,250)]",
    border: "border-emerald-900/10",
    eyebrow: "text-emerald-700",
    icon: "bg-emerald-100 text-emerald-800",
    accent: "bg-emerald-200 text-slate-950",
    tag: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    hover: "hover:border-emerald-300",
  },
  ai: {
    page: "bg-[rgb(248,252,255)]",
    hero:
      "bg-[linear-gradient(135deg,rgba(240,249,255,0.98),rgba(249,251,250,0.98))]",
    section: "bg-[rgb(240,249,255)]",
    list: "bg-white",
    border: "border-cyan-900/10",
    eyebrow: "text-cyan-700",
    icon: "bg-cyan-100 text-cyan-800",
    accent: "bg-cyan-200 text-slate-950",
    tag: "bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
    hover: "hover:border-cyan-300",
  },
  infrastructure: {
    page: "bg-[rgb(250,252,246)]",
    hero:
      "bg-[linear-gradient(135deg,rgba(247,254,231,0.96),rgba(250,252,255,0.98))]",
    section: "bg-[rgb(247,254,231)]",
    list: "bg-white",
    border: "border-lime-900/10",
    eyebrow: "text-lime-800",
    icon: "bg-lime-100 text-lime-800",
    accent: "bg-lime-200 text-slate-950",
    tag: "bg-lime-50 text-lime-800 hover:bg-lime-100",
    hover: "hover:border-lime-300",
  },
} as const;

const categoryPageCopy = {
  en: {
    categoryLabel: "Category",
    latestLabel: "Latest update",
    featuredLabel: "Lead article",
    promotedLabel: "Promoted",
    promotedTitle: "Promoted articles",
    promotedDescription: "Sponsored reads selected for this category.",
    empty: "No articles in this category yet.",
  },
  zh: {
    categoryLabel: "分类",
    latestLabel: "最近更新",
    featuredLabel: "主打文章",
    promotedLabel: "推广",
    promotedTitle: "推广文章",
    promotedDescription: "为当前分类筛选的推广阅读内容。",
    empty: "这个分类暂时还没有文章。",
  },
} satisfies Record<
  Locale,
  {
    categoryLabel: string;
    latestLabel: string;
    featuredLabel: string;
    promotedLabel: string;
    promotedTitle: string;
    promotedDescription: string;
    empty: string;
  }
>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!locales.includes(locale)) {
    return {};
  }

  const category = await getLocalizedCategoryBySlug(locale, slug);

  if (!category) {
    return {};
  }

  return {
    title: category.name,
    description: category.description,
    alternates: {
      canonical: `/${locale}/category/${slug}`,
      languages: {
        en: `/en/category/${slug}`,
        zh: `/zh/category/${slug}`,
      },
    },
    openGraph: {
      title: `${category.name} | BSVgo`,
      description: category.description,
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

  const knownCategorySlug = isCategorySlug(category.slug)
    ? category.slug
    : "infrastructure";
  const copy = uiCopy[locale];
  const pageCopy = categoryPageCopy[locale];
  const [posts, placedFeatured, promotedPosts] = await Promise.all([
    getLocalizedPostsByCategorySlug(locale, slug),
    getCategoryFeaturedPost(locale, slug),
    getCategoryPromotedPosts(locale, slug, 5),
  ]);
  const featured = placedFeatured ?? posts[0] ?? null;
  const latestDate = posts[0]?.publishedAt;
  const Icon = sectionIcons[knownCategorySlug];
  const style = categoryStyles[knownCategorySlug];
  const featuredImageFallback = featured
    ? createCoverArtDataUri({
        title: featured.title,
        label: featured.categoryName,
        subtitle: featured.excerpt,
        categorySlug: featured.categorySlug,
        variant: "hero",
      })
    : "";

  return (
    <main className={`${style.page} text-slate-900`}>
      <section
        className={`relative isolate overflow-hidden border-b ${style.border} ${style.hero}`}
        {...buildSectionViewAttrs(`category-hero-${category.slug}`)}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:min-h-[520px] lg:grid-cols-[minmax(0,0.92fr)_minmax(340px,0.9fr)] lg:items-center lg:py-14">
          <div>
            <div className="inline-flex items-center gap-2 overflow-hidden whitespace-nowrap rounded-lg border border-slate-200 bg-white/70 px-3 py-2 backdrop-blur-sm">
              <span className={`grid h-7 w-7 place-items-center rounded-md ${style.icon}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${style.eyebrow}`}>
                {pageCopy.categoryLabel} / {category.slug}
              </span>
            </div>

            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.96] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              {category.name}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              {category.description}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white/72 p-4">
                <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${style.eyebrow}`}>
                  {copy.tagCountLabel}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {posts.length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/72 p-4">
                <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${style.eyebrow}`}>
                  {pageCopy.latestLabel}
                </p>
                <p className="mt-2 truncate text-base font-semibold text-slate-950">
                  {latestDate ? formatDate(latestDate, locale) : "-"}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/72 p-4">
                <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${style.eyebrow}`}>
                  {copy.readingTime}
                </p>
                <p className="mt-2 text-base font-semibold text-slate-950">
                  {featured ? `${featured.readingMinutes} ${copy.readingTime}` : "-"}
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/${locale}/category/${category.slug}#articles`}
                {...buildAnalyticsAttrs({
                  eventName: "section_jump",
                  label: copy.categoryArchiveTitle,
                  href: `/${locale}/category/${category.slug}#articles`,
                  categorySlug: category.slug,
                  targetType: "internal",
                })}
                className="inline-flex items-center justify-center rounded-md bg-emerald-200 px-5 py-3 font-semibold text-slate-900 transition hover:bg-emerald-100"
              >
                {copy.categoryArchiveTitle}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href={`/${locale}`}
                {...buildAnalyticsAttrs({
                  eventName: "nav_click",
                  label: copy.backToHome,
                  href: `/${locale}`,
                  targetType: "nav",
                })}
                className="inline-flex items-center justify-center rounded-md border border-teal-900/15 bg-white/70 px-5 py-3 font-semibold text-slate-700 transition hover:bg-white"
              >
                {copy.backToHome}
              </Link>
            </div>
          </div>

          {featured ? (
            <article className={`group relative min-h-[360px] overflow-hidden rounded-lg border ${style.border} bg-slate-950 shadow-sm lg:min-h-[430px]`}>
              <Link
                href={`/${locale}/posts/${featured.slug}`}
                {...buildAnalyticsAttrs({
                  eventName: "article_click",
                  label: featured.title,
                  href: `/${locale}/posts/${featured.slug}`,
                  articleSlug: featured.slug,
                  categorySlug: featured.categorySlug,
                  targetType: "article",
                })}
                className="block h-full"
              >
                <SafeImage
                  src={getRenderableImageSrc(featured.coverImage, {
                    title: featured.title,
                    label: featured.categoryName,
                    subtitle: featured.excerpt,
                    categorySlug: featured.categorySlug,
                    variant: "hero",
                  })}
                  fallbackSrc={featuredImageFallback}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 700px"
                  className="object-cover opacity-88 transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(2,6,23,0.86)_0%,rgba(2,6,23,0.48)_50%,rgba(2,6,23,0.08)_100%)]" />
                <div className="relative flex min-h-[360px] flex-col justify-end p-5 text-white sm:p-6 lg:min-h-[430px]">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className={`rounded-md px-3 py-1.5 text-xs font-semibold ${style.accent}`}>
                      {pageCopy.featuredLabel}
                    </span>
                    <span className="rounded-md bg-white/12 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm">
                      {formatDate(featured.publishedAt, locale)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                    {featured.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-100/88">
                    {featured.excerpt}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
                    {copy.readMore}
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </article>
          ) : null}
        </div>
      </section>

      {promotedPosts.length > 0 ? (
        <section
          id="promoted"
          className={`border-b py-10 sm:py-12 ${style.border} ${style.section}`}
          {...buildSectionViewAttrs(`category-promoted-${category.slug}`)}
        >
          <div className="mx-auto max-w-7xl px-5">
            <SectionHeader
              icon={ArrowUpRight}
              eyebrow={pageCopy.promotedLabel}
              title={pageCopy.promotedTitle}
              description={pageCopy.promotedDescription}
              tone={{ icon: style.icon, eyebrow: style.eyebrow }}
              action={{
                href: `/${locale}/category/${category.slug}#articles`,
                label: copy.viewAll,
                analytics: {
                  eventName: "section_jump",
                  label: copy.viewAll,
                  href: `/${locale}/category/${category.slug}#articles`,
                  section: `category-promoted-${category.slug}`,
                  categorySlug: category.slug,
                  targetType: "internal",
                },
              }}
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {promotedPosts.map((post) => (
                <ArticleCard
                  key={post.slug}
                  locale={locale}
                  post={post}
                  section="category-promoted"
                  tone={{
                    border: style.border,
                    accent: style.accent,
                    tag: style.tag,
                    hover: style.hover,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section
        id="articles"
        className={`border-b py-10 sm:py-12 lg:py-14 ${style.border} ${style.list}`}
        {...buildSectionViewAttrs(`category-articles-${category.slug}`)}
      >
        <div className="mx-auto max-w-7xl px-5">
          <SectionHeader
            icon={Icon}
            eyebrow={category.slug}
            title={copy.categoryArchiveTitle}
            description={copy.categoryArchiveDescription}
            tone={{ icon: style.icon, eyebrow: style.eyebrow }}
            rightSlot={
              <span className="inline-flex rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600">
                {posts.length} {copy.tagCountLabel}
              </span>
            }
          />

          {posts.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <ArticleCard
                  key={post.slug}
                  locale={locale}
                  post={post}
                  density="regular"
                  showMetaIcons
                  showReadMoreIcon
                  imageSizes="(max-width: 1024px) 50vw, 360px"
                  tone={{
                    card: style.section,
                    border: style.border,
                    accent: style.accent,
                    tag: style.tag,
                    hover: style.hover,
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="mt-8 rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
              {pageCopy.empty}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
