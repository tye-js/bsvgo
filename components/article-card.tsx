import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock3 } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { buildAnalyticsAttrs } from "@/lib/analytics";
import type { LocalizedPost, LocalizedTagReference } from "@/lib/blog";
import { createCoverArtDataUri, getRenderableImageSrc } from "@/lib/cover-art";
import type { CategorySlug } from "@/lib/content";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { uiCopy } from "@/lib/i18n";

type ArticleCardTone = {
  card?: string;
  border?: string;
  accent?: string;
  tag?: string;
  hover?: string;
};

type ArticleCardPost = Pick<
  LocalizedPost,
  | "slug"
  | "title"
  | "excerpt"
  | "coverImage"
  | "coverImageAlt"
  | "coverImageSeoDescription"
  | "publishedAt"
  | "categorySlug"
  | "categoryName"
  | "readingMinutes"
  | "tags"
>;

type ShowcasePost = {
  title: string;
  excerpt: string;
  coverImage: string;
  coverImageAlt?: string;
  coverImageSeoDescription?: string;
  publishedAt: string;
  categorySlug: string;
  categoryName: string;
  tags: LocalizedTagReference[];
  slug?: string;
};

export type ArticleCardItem = ArticleCardPost | ShowcasePost;

type ArticleCardProps = {
  locale: Locale;
  post: ArticleCardItem;
  section?: string;
  tone?: ArticleCardTone;
  imageSizes?: string;
  density?: "compact" | "regular";
  showMetaIcons?: boolean;
  showReadMoreIcon?: boolean;
};

function getPostHref(locale: Locale, post: ArticleCardItem) {
  return "slug" in post && post.slug ? `/${locale}/posts/${post.slug}` : null;
}

function getArticleSlug(post: ArticleCardItem) {
  return "slug" in post ? post.slug : undefined;
}

function getCategorySlug(post: ArticleCardItem) {
  return post.categorySlug;
}

function getCoverImage(post: ArticleCardItem) {
  return "coverImage" in post ? post.coverImage : "";
}

function getCoverImageAlt(post: ArticleCardItem) {
  return "coverImageAlt" in post && post.coverImageAlt
    ? post.coverImageAlt
    : post.title;
}

export function ArticleCard({
  locale,
  post,
  section,
  tone,
  imageSizes = "(max-width: 1024px) 50vw, 320px",
  density = "compact",
  showMetaIcons = false,
  showReadMoreIcon = false,
}: ArticleCardProps) {
  const copy = uiCopy[locale];
  const href = getPostHref(locale, post);
  const articleSlug = getArticleSlug(post);
  const fallbackSrc = createCoverArtDataUri({
    title: post.title,
    label: post.categoryName,
    subtitle:
      "coverImageSeoDescription" in post && post.coverImageSeoDescription
        ? post.coverImageSeoDescription
        : post.excerpt,
    categorySlug: getCategorySlug(post),
    variant: "card",
  });
  const analytics = href
    ? buildAnalyticsAttrs({
        eventName: "article_click",
        label: post.title,
        href,
        articleSlug,
        categorySlug: getCategorySlug(post),
        section,
        targetType: "article",
      })
    : {};
  const cardClass = [
    "overflow-hidden rounded-lg border transition",
    tone?.border ?? "border-slate-200",
    tone?.card ?? "bg-white",
    tone?.hover ?? "hover:border-emerald-300",
  ].join(" ");

  const image = (
    <div className="relative aspect-[16/10] overflow-hidden bg-emerald-50">
      <SafeImage
        src={getRenderableImageSrc(getCoverImage(post), {
          title: post.title,
          label: post.categoryName,
          subtitle:
            "coverImageSeoDescription" in post && post.coverImageSeoDescription
              ? post.coverImageSeoDescription
              : post.excerpt,
          categorySlug: getCategorySlug(post),
          variant: "card",
        })}
        fallbackSrc={fallbackSrc}
        alt={getCoverImageAlt(post)}
        fill
        sizes={imageSizes}
        className="object-cover transition duration-500 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/34 via-transparent to-transparent" />
      <span
        className={`absolute bottom-3 left-3 rounded-md px-2.5 py-1 text-xs font-semibold text-slate-900 ${
          tone?.accent ?? "bg-emerald-200"
        }`}
      >
        {post.categoryName}
      </span>
    </div>
  );

  return (
    <article className={cardClass}>
      {href ? (
        <Link href={href} {...analytics} className="group block">
          {image}
        </Link>
      ) : (
        image
      )}

      <div className={density === "regular" ? "p-4 sm:p-5" : "p-4"}>
        {showMetaIcons ? (
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(post.publishedAt, locale)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              {"readingMinutes" in post ? post.readingMinutes : 0} {copy.readingTime}
            </span>
          </div>
        ) : (
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            {formatDate(post.publishedAt, locale)}
          </p>
        )}

        <h3
          className={`mt-2 font-semibold leading-snug text-slate-950 ${
            density === "regular" ? "text-lg tracking-tight" : "text-base"
          }`}
        >
          {href ? (
            <Link href={href} {...analytics}>
              {post.title}
            </Link>
          ) : (
            post.title
          )}
        </h3>
        <p
          className={`mt-2 text-sm leading-6 text-slate-600 ${
            density === "regular" ? "line-clamp-3" : "line-clamp-2"
          }`}
        >
          {post.excerpt}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="flex min-w-0 flex-wrap gap-2">
            {(post.tags ?? []).slice(0, 2).map((tag) =>
              href ? (
                <Link
                  key={tag.slug}
                  href={`/${locale}/tag/${tag.slug}`}
                  {...buildAnalyticsAttrs({
                    eventName: "tag_click",
                    label: tag.name,
                    href: `/${locale}/tag/${tag.slug}`,
                    tagSlug: tag.slug,
                    targetType: "tag",
                  })}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    tone?.tag ??
                    "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {tag.name}
                </Link>
              ) : (
                <span
                  key={tag.slug}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                    tone?.tag ?? "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {tag.name}
                </span>
              )
            )}
          </div>
          {showReadMoreIcon && href ? (
            <Link
              href={href}
              {...analytics}
              aria-label={`${copy.readMore}: ${post.title}`}
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border ${
                tone?.border ?? "border-slate-200"
              } text-slate-700 transition ${tone?.hover ?? "hover:border-emerald-300"}`}
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function toShowcaseArticleCardItem({
  article,
  categoryName,
  categorySlug,
}: {
  article: {
    title: string;
    excerpt: string;
    image: string;
    publishedAt: string;
    tags: LocalizedTagReference[];
  };
  categoryName: string;
  categorySlug: CategorySlug;
}): ShowcasePost {
  return {
    title: article.title,
    excerpt: article.excerpt,
    coverImage: article.image,
    coverImageAlt: article.title,
    publishedAt: article.publishedAt,
    categorySlug,
    categoryName,
    tags: article.tags,
  };
}
