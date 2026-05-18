import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Blocks,
  Brain,
  CalendarDays,
  Clock3,
  ServerCog,
} from "lucide-react";
import {
  getLocalizedCategoryBySlug,
  getLocalizedPosts,
  type LocalizedPost,
} from "@/lib/blog";
import { getRenderableImageSrc } from "@/lib/cover-art";
import {
  getCategoryBySlug,
  slugifyTag,
  type CategorySlug,
} from "@/lib/content";
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
    empty: "No articles in this category yet.",
  },
  zh: {
    categoryLabel: "分类",
    latestLabel: "最近更新",
    featuredLabel: "主打文章",
    empty: "这个分类暂时还没有文章。",
  },
} satisfies Record<
  Locale,
  {
    categoryLabel: string;
    latestLabel: string;
    featuredLabel: string;
    empty: string;
  }
>;

type CategoryStyle = (typeof categoryStyles)[CategorySlug];

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

  const categorySlug = category.slug as CategorySlug;
  const copy = uiCopy[locale];
  const pageCopy = categoryPageCopy[locale];
  const allPosts = await getLocalizedPosts(locale);
  const posts = allPosts.filter((post) => post.categorySlug === slug);
  const featured = posts.find((post) => post.featured) ?? posts[0] ?? null;
  const latestDate = posts[0]?.publishedAt;
  const Icon = sectionIcons[categorySlug] ?? ServerCog;
  const style = categoryStyles[categorySlug];

  return (
    <main className={`${style.page} text-slate-900`}>
      <section
        className={`relative isolate overflow-hidden border-b ${style.border} ${style.hero}`}
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
                className="inline-flex items-center justify-center rounded-md bg-emerald-200 px-5 py-3 font-semibold text-slate-900 transition hover:bg-emerald-100"
              >
                {copy.categoryArchiveTitle}
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
            <article className={`group relative min-h-[360px] overflow-hidden rounded-lg border ${style.border} bg-slate-950 shadow-sm lg:min-h-[430px]`}>
              <Link href={`/${locale}/posts/${featured.slug}`} className="block h-full">
                <Image
                  src={getRenderableImageSrc(featured.coverImage, {
                    title: featured.title,
                    label: featured.categoryName,
                    subtitle: featured.excerpt,
                    categorySlug: featured.categorySlug,
                    variant: "hero",
                  })}
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

      <section
        id="articles"
        className={`border-b py-10 sm:py-12 lg:py-14 ${style.border} ${style.list}`}
      >
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid grid-cols-[24px_auto_minmax(0,1fr)] items-center gap-2 overflow-hidden whitespace-nowrap sm:grid-cols-[24px_minmax(92px,auto)_auto_minmax(0,1fr)_auto]">
            <div className={`grid h-6 w-6 place-items-center rounded-md ${style.icon}`}>
              <Icon className="h-3 w-3" />
            </div>
            <p className={`hidden truncate text-[11px] font-semibold uppercase tracking-[0.14em] sm:block ${style.eyebrow}`}>
              {category.slug}
            </p>
            <h2 className="text-sm font-semibold tracking-tight text-slate-950">
              {copy.categoryArchiveTitle}
            </h2>
            <p className="min-w-0 truncate text-xs leading-5 text-slate-500">
              {copy.categoryArchiveDescription}
            </p>
            <span className="hidden rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 sm:inline-flex">
              {posts.length} {copy.tagCountLabel}
            </span>
          </div>

          {posts.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <CategoryArticleCard
                  key={post.slug}
                  locale={locale}
                  post={post}
                  style={style}
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

function CategoryArticleCard({
  locale,
  post,
  style,
}: {
  locale: Locale;
  post: LocalizedPost;
  style: CategoryStyle;
}) {
  const copy = uiCopy[locale];

  return (
    <article
      className={`group overflow-hidden rounded-lg border ${style.border} ${style.section} transition ${style.hover}`}
    >
      <Link href={`/${locale}/posts/${post.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-emerald-50">
          <Image
            src={getRenderableImageSrc(post.coverImage, {
              title: post.title,
              label: post.categoryName,
              subtitle: post.excerpt,
              categorySlug: post.categorySlug,
              variant: "card",
            })}
            alt=""
            fill
            sizes="(max-width: 1024px) 50vw, 360px"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/36 via-transparent to-transparent" />
          <span className={`absolute bottom-3 left-3 rounded-md px-2.5 py-1 text-xs font-semibold ${style.accent}`}>
            {post.categoryName}
          </span>
        </div>
      </Link>

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(post.publishedAt, locale)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" />
            {post.readingMinutes} {copy.readingTime}
          </span>
        </div>

        <h2 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-slate-950">
          <Link href={`/${locale}/posts/${post.slug}`}>
            {post.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
          {post.excerpt}
        </p>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="flex min-w-0 flex-wrap gap-2">
            {(post.tags ?? []).slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/${locale}/tag/${slugifyTag(tag)}`}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${style.tag}`}
              >
                {tag}
              </Link>
            ))}
          </div>
          <Link
            href={`/${locale}/posts/${post.slug}`}
            aria-label={`${copy.readMore}: ${post.title}`}
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border ${style.border} text-slate-700 transition ${style.hover}`}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
