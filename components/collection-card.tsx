import Link from "next/link";
import { ArrowRight, BookOpen, Layers } from "lucide-react";
import { CollectionReadingPath } from "@/components/collection-reading-path";
import { SafeImage } from "@/components/safe-image";
import { buildAnalyticsAttrs } from "@/lib/analytics";
import type { LocalizedCollection, PostCollectionLink } from "@/lib/blog";
import { createCoverArtDataUri, getRenderableImageSrc } from "@/lib/cover-art";
import { imageSizes } from "@/lib/image-sizes";
import type { Locale } from "@/lib/i18n";

const collectionCopy = {
  en: {
    eyebrow: "Collection",
    articles: "articles",
    continue: "Continue reading",
    viewAll: "View collection",
    previous: "Previous part",
    next: "Next part",
    part: "Part",
    of: "of",
  },
  zh: {
    eyebrow: "专题",
    articles: "篇文章",
    continue: "继续阅读",
    viewAll: "查看专题",
    previous: "上一篇",
    next: "下一篇",
    part: "第",
    of: "篇 / 共",
  },
} as const;

export function CollectionCard({
  locale,
  collection,
}: {
  locale: Locale;
  collection: LocalizedCollection;
}) {
  const copy = collectionCopy[locale];
  const href = `/${locale}/collections/${collection.slug}`;
  const fallbackSrc = createCoverArtDataUri({
    title: collection.title,
    label: copy.eyebrow,
    subtitle: collection.description,
    variant: "card",
  });

  return (
    <article className="group overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-sm transition hover:border-emerald-300">
      <Link
        href={href}
        {...buildAnalyticsAttrs({
          eventName: "section_jump",
          label: collection.title,
          href,
          section: "collections",
          targetType: "collection",
        })}
        className="block"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-emerald-50">
          <SafeImage
            src={getRenderableImageSrc(collection.coverImage, {
              title: collection.title,
              label: copy.eyebrow,
              subtitle: collection.description,
              variant: "card",
            })}
            fallbackSrc={fallbackSrc}
            alt={collection.coverImageAlt}
            fill
            sizes={imageSizes.cardGrid}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/62 via-slate-950/10 to-transparent" />
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-white/92 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <Layers className="h-3.5 w-3.5" />
            {collection.postCount} {copy.articles}
          </span>
        </div>
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            {copy.eyebrow}
          </p>
          <h3 className="mt-2 line-clamp-2 text-xl font-semibold tracking-tight text-slate-950">
            {collection.title}
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
            {collection.description}
          </p>
          <span className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-700">
            {copy.viewAll}
            <ArrowRight className="ml-2 h-4 w-4" />
          </span>
        </div>
      </Link>
    </article>
  );
}

export function PostCollectionPanel({
  locale,
  collection,
}: {
  locale: Locale;
  collection: PostCollectionLink;
}) {
  const copy = collectionCopy[locale];
  const href = `/${locale}/collections/${collection.slug}`;
  const nextHref = collection.nextPost
    ? `/${locale}/posts/${collection.nextPost.slug}`
    : href;
  const currentPost = collection.posts[collection.currentIndex];

  return (
    <section className="mt-8 rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            <BookOpen className="h-4 w-4" />
            {copy.eyebrow}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            {collection.title}
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {locale === "zh"
              ? `${copy.part}${collection.currentIndex + 1}${copy.of}${collection.postCount}${copy.articles}`
              : `${copy.part} ${collection.currentIndex + 1} ${copy.of} ${collection.postCount}`}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {collection.description}
          </p>
        </div>
        <Link
          href={href}
          {...buildAnalyticsAttrs({
            eventName: "section_jump",
            label: collection.title,
            href,
            section: "post-collection",
            targetType: "collection",
          })}
          className="inline-flex shrink-0 items-center justify-center rounded-md border border-emerald-900/10 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
        >
          {copy.viewAll}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
      <div
        className={`mt-5 grid gap-3 ${
          collection.previousPost ? "md:grid-cols-2" : "md:grid-cols-1"
        }`}
      >
        {collection.previousPost ? (
          <Link
            href={`/${locale}/posts/${collection.previousPost.slug}`}
            className="rounded-lg border border-slate-200 bg-[rgb(249,251,250)] p-4 transition hover:border-emerald-300"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {copy.previous}
            </p>
            <p className="mt-2 line-clamp-2 font-semibold text-slate-950">
              {collection.previousPost.title}
            </p>
          </Link>
        ) : null}
        <Link
          href={nextHref}
          className="rounded-lg border border-slate-200 bg-[rgb(249,251,250)] p-4 transition hover:border-emerald-300 md:text-right"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {collection.nextPost ? copy.next : copy.viewAll}
          </p>
          <p className="mt-2 line-clamp-2 font-semibold text-slate-950">
            {collection.nextPost?.title ?? collection.title}
          </p>
        </Link>
      </div>
      <CollectionReadingPath
        locale={locale}
        collectionSlug={collection.slug}
        posts={collection.posts}
        currentSlug={currentPost?.slug}
        variant="compact"
      />
    </section>
  );
}
