import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { ArticleBody, getArticleToc } from "@/components/article-body";
import { ArticleShareActions } from "@/components/article-share-actions";
import { ArticleTocNav } from "@/components/article-toc-nav";
import { PostCollectionPanel } from "@/components/collection-card";
import { ReadingProgress } from "@/components/reading-progress";
import { SafeImage } from "@/components/safe-image";
import { buildAnalyticsAttrs, buildSectionViewAttrs } from "@/lib/analytics";
import type { LocalizedPostWithNeighbors } from "@/lib/blog";
import { getPostCollections, getPostData, getRelatedPosts } from "@/lib/blog";
import { createCoverArtDataUri, getRenderableImageSrc } from "@/lib/cover-art";
import { formatDate } from "@/lib/format";
import { imageSizes } from "@/lib/image-sizes";
import { Locale, locales, siteConfig, uiCopy } from "@/lib/i18n";
import { promotedArticles } from "@/lib/promotions";

export const revalidate = 300;

const renderableAvatarHosts = new Set(["cms.bsvgo.com", "images.unsplash.com"]);

function absoluteUrl(path: string) {
  return new URL(path, siteConfig.url).toString();
}

function getRenderableAvatarSrc(value: string | undefined) {
  if (!value) {
    return null;
  }

  if (value.startsWith("/")) {
    return value;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" && renderableAvatarHosts.has(url.hostname)
      ? value
      : null;
  } catch {
    return null;
  }
}

function countWords(content: string) {
  const latinWords = content.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g) ?? [];
  const cjkChars = content.match(/[\u4e00-\u9fff]/g) ?? [];

  return latinWords.length + cjkChars.length;
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

  const post = await getPostData(locale, slug);

  if (!post) {
    return {};
  }

  const url = absoluteUrl(`/${locale}/posts/${slug}`);
  const imageSource = post.ogImage || post.coverImage;
  const image = getRenderableImageSrc(imageSource, {
    title: post.title,
    label: post.categoryName,
    subtitle: post.coverImageSeoDescription,
    categorySlug: post.categorySlug,
    variant: "hero",
  });
  const absoluteImage = image.startsWith("http")
    ? image
    : createCoverArtDataUri({
        title: post.title,
        label: post.categoryName,
        subtitle: post.coverImageSeoDescription,
        categorySlug: post.categorySlug,
        variant: "hero",
      });

  return {
    title: post.seoTitle,
    description: post.seoDescription,
    alternates: {
      canonical: url,
      languages: {
        en: absoluteUrl(`/en/posts/${slug}`),
        zh: absoluteUrl(`/zh/posts/${slug}`),
      },
    },
    openGraph: {
      title: post.seoTitle,
      description: post.seoDescription,
      url,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.aiAuthorName?.trim() || siteConfig.name],
      section: post.categoryName,
      tags: post.tags.map((tag) => tag.name),
      images: [
        {
          url: absoluteImage,
          alt: post.coverImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle,
      description: post.seoDescription,
      images: [absoluteImage],
    },
  };
}

function buildPostJsonLd({
  locale,
  post,
}: {
  locale: Locale;
  post: LocalizedPostWithNeighbors;
}) {
  const postPath = `/${locale}/posts/${post.slug}`;
  const postUrl = absoluteUrl(postPath);
  const categoryUrl = absoluteUrl(`/${locale}/category/${post.categorySlug}`);
  const imageSource = post.ogImage || post.coverImage;
  const image = getRenderableImageSrc(imageSource, {
    title: post.title,
    label: post.categoryName,
    subtitle: post.coverImageSeoDescription,
    categorySlug: post.categorySlug,
    variant: "hero",
  });
  const imageUrl = image.startsWith("http")
    ? image
    : createCoverArtDataUri({
        title: post.title,
        label: post.categoryName,
        subtitle: post.coverImageSeoDescription,
        categorySlug: post.categorySlug,
        variant: "hero",
      });
  const authorName = post.aiAuthorName?.trim() || siteConfig.name;
  const authorRole = post.aiAuthorRole?.trim();
  const authorAvatar = getRenderableAvatarSrc(post.aiAuthorAvatar?.trim());
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${postUrl}#article`,
    url: postUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: [imageUrl],
    thumbnailUrl: imageUrl,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: locale,
    articleSection: post.categoryName,
    keywords: post.tags.map((tag) => tag.name),
    wordCount: countWords(post.content),
    isAccessibleForFree: true,
    about: [
      {
        "@type": "Thing",
        name: post.categoryName,
        url: categoryUrl,
      },
      ...post.tags.map((tag) => ({
        "@type": "Thing",
        name: tag.name,
        url: absoluteUrl(`/${locale}/tag/${tag.slug}`),
      })),
    ],
    author: {
      "@type": "Person",
      name: authorName,
      ...(authorRole ? { jobTitle: authorRole } : {}),
      ...(authorAvatar ? { image: authorAvatar } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "BSVgo",
        item: absoluteUrl(`/${locale}`),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: post.categoryName,
        item: categoryUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: postUrl,
      },
    ],
  };

  return [article, breadcrumb];
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const post = await getPostData(locale, slug);
  const [relatedPosts, postCollections] = post
    ? await Promise.all([
        getRelatedPosts(locale, slug),
        getPostCollections(locale, slug),
      ])
    : [[], []];
  const copy = uiCopy[locale];
  const promotions = promotedArticles[locale];

  if (!post) {
    notFound();
  }

  const authorName = post.aiAuthorName?.trim();
  const authorRole = post.aiAuthorRole?.trim();
  const authorAvatar = getRenderableAvatarSrc(post.aiAuthorAvatar?.trim());
  const heroImageFallback = createCoverArtDataUri({
    title: post.title,
    label: post.categoryName,
    subtitle: post.coverImageSeoDescription,
    categorySlug: post.categorySlug,
    variant: "hero",
  });
  const jsonLd = buildPostJsonLd({ locale, post });
  const toc = getArticleToc(post.content);
  const tocTitle = locale === "zh" ? "目录" : "Contents";
  const postUrl = absoluteUrl(`/${locale}/posts/${post.slug}`);

  return (
    <main className="bg-[rgb(249,251,250)]">
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-[88rem] px-5 py-5 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start xl:grid-cols-[220px_minmax(0,1fr)_300px]">
          <aside className="hidden xl:sticky xl:top-24 xl:block">
            <ArticleTocNav items={toc} title={tocTitle} />
          </aside>

          <article
            className="min-w-0"
            {...buildSectionViewAttrs(`article-${slug}`)}
          >
            <header className="rounded-lg border border-emerald-900/10 bg-white px-5 py-6 shadow-sm sm:px-7 lg:px-9 lg:py-7">
              <div className="max-w-4xl">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <Link
                    href={`/${locale}/category/${post.categorySlug}`}
                    {...buildAnalyticsAttrs({
                      eventName: "category_click",
                      label: post.categoryName,
                      href: `/${locale}/category/${post.categorySlug}`,
                      categorySlug: post.categorySlug,
                      targetType: "category",
                    })}
                    className="rounded-md bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    {post.categoryName}
                  </Link>
                  <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-emerald-700" />
                    {formatDate(post.publishedAt, locale)}
                  </span>
                  <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4 text-emerald-700" />
                    {post.readingMinutes} {copy.readingTime}
                  </span>
                </div>
                <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-[2.35rem] lg:text-[2.7rem]">
                  {post.title}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-4 border-t border-emerald-900/10 pt-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  {authorName || authorAvatar ? (
                    <div className="flex items-center gap-3">
                      <div className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-emerald-900/10 bg-emerald-50 text-xs font-semibold text-emerald-700">
                        {authorAvatar ? (
                          <SafeImage
                            src={authorAvatar}
                            fallbackSrc={createCoverArtDataUri({
                              title: authorName ?? "AI",
                              label: authorRole ?? "AI",
                              variant: "compact",
                            })}
                            alt={authorName ?? ""}
                            fill
                            sizes={imageSizes.avatar}
                            className="object-cover"
                          />
                        ) : (
                          <span>{(authorName ?? "AI").slice(0, 2)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        {authorName ? (
                          <p className="truncate text-sm font-semibold text-slate-950">
                            {authorName}
                          </p>
                        ) : null}
                        {authorRole ? (
                          <p className="truncate text-xs font-medium text-emerald-700">
                            {authorRole}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {(post.tags ?? []).map((tag) => (
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
                        className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <ArticleShareActions
                  locale={locale}
                  title={post.title}
                  description={post.seoDescription || post.excerpt}
                  url={postUrl}
                  articleSlug={post.slug}
                  categorySlug={post.categorySlug}
                />
              </div>
            </header>

            <div
              className="mt-5 rounded-lg border border-emerald-900/10 bg-white px-5 py-8 sm:px-7 lg:px-9"
              data-article-body
              {...buildSectionViewAttrs(`article-body-${slug}`)}
            >
              <ArticleBody
                content={post.content}
                categorySlug={post.categorySlug}
                leadImage={{
                  src: getRenderableImageSrc(post.coverImage, {
                    title: post.title,
                    label: post.categoryName,
                    subtitle: post.coverImageSeoDescription,
                    categorySlug: post.categorySlug,
                    variant: "hero",
                  }),
                  fallbackSrc: heroImageFallback,
                  alt: post.coverImageAlt,
                }}
              />
            </div>

            {postCollections.length > 0 ? (
              <PostCollectionPanel
                locale={locale}
                collection={postCollections[0]}
              />
            ) : null}

            <nav className="mt-8 grid gap-4 md:grid-cols-2">
              {post.previous ? (
                <Link
                  href={`/${locale}/posts/${post.previous.slug}`}
                  {...buildAnalyticsAttrs({
                    eventName: "article_click",
                    label: post.previous.title,
                    href: `/${locale}/posts/${post.previous.slug}`,
                    articleSlug: post.previous.slug,
                    categorySlug: post.previous.categorySlug,
                    targetType: "article",
                  })}
                  className="rounded-lg border border-teal-900/10 bg-white p-5 transition hover:border-emerald-300"
                >
                  <span className="flex items-center text-sm text-slate-500">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {copy.previousPost}
                  </span>
                  <p className="mt-3 font-semibold text-slate-950">
                    {post.previous.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
              {post.next ? (
                <Link
                  href={`/${locale}/posts/${post.next.slug}`}
                  {...buildAnalyticsAttrs({
                    eventName: "article_click",
                    label: post.next.title,
                    href: `/${locale}/posts/${post.next.slug}`,
                    articleSlug: post.next.slug,
                    categorySlug: post.next.categorySlug,
                    targetType: "article",
                  })}
                  className="rounded-lg border border-teal-900/10 bg-white p-5 text-right transition hover:border-emerald-300"
                >
                  <span className="flex items-center justify-end text-sm text-slate-500">
                    {copy.nextPost}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                  <p className="mt-3 font-semibold text-slate-950">
                    {post.next.title}
                  </p>
                </Link>
              ) : null}
            </nav>

            {relatedPosts.length > 0 ? (
              <section className="mt-8 rounded-lg border border-teal-900/10 bg-white px-5 py-8 shadow-sm sm:px-7">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  {copy.relatedTitle}
                </p>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {relatedPosts.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/${locale}/posts/${related.slug}`}
                      {...buildAnalyticsAttrs({
                        eventName: "article_click",
                        label: related.title,
                        href: `/${locale}/posts/${related.slug}`,
                        articleSlug: related.slug,
                        categorySlug: related.categorySlug,
                        targetType: "article",
                      })}
                      className="group overflow-hidden rounded-lg border border-teal-900/10 bg-[rgb(249,251,250)] transition hover:border-emerald-300"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-emerald-50">
                        <SafeImage
                          src={getRenderableImageSrc(related.coverImage, {
                            title: related.title,
                            label: related.categoryName,
                            subtitle: related.excerpt,
                            categorySlug: related.categorySlug,
                            variant: "card",
                          })}
                          fallbackSrc={createCoverArtDataUri({
                            title: related.title,
                            label: related.categoryName,
                            subtitle: related.excerpt,
                            categorySlug: related.categorySlug,
                            variant: "card",
                          })}
                          alt={related.coverImageAlt}
                          fill
                          sizes={imageSizes.relatedCard}
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
                        <span className="absolute bottom-3 left-3 rounded-md bg-emerald-200 px-2.5 py-1 text-xs font-semibold text-slate-900">
                          {related.categoryName}
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                          {formatDate(related.publishedAt, locale)}
                        </p>
                        <p className="mt-2 text-base font-semibold leading-snug text-slate-900">
                          {related.title}
                        </p>
                        <p className="mt-2 line-clamp-3 text-sm leading-7 text-slate-600">
                          {related.excerpt}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </article>

          <aside className="lg:sticky lg:top-24">
            <div className="rounded-lg border border-teal-900/10 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Sponsored
              </p>
              <div className="mt-4 space-y-4">
                {promotions.map((item) => (
                  <article
                    key={item.title}
                    {...buildAnalyticsAttrs({
                      eventName: "article_click",
                      label: item.title,
                      href: item.image,
                      categorySlug: item.category,
                      targetType: "sponsored",
                    })}
                    className="group overflow-hidden rounded-lg border border-slate-200 bg-[rgb(249,251,250)] transition hover:border-emerald-300"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-emerald-50">
                      <SafeImage
                        src={getRenderableImageSrc(item.image, {
                          title: item.title,
                          label: item.category,
                          subtitle: item.description,
                          categorySlug: item.category,
                          variant: "compact",
                        })}
                        fallbackSrc={createCoverArtDataUri({
                          title: item.title,
                          label: item.category,
                          subtitle: item.description,
                          categorySlug: item.category,
                          variant: "compact",
                        })}
                        alt={item.title}
                        fill
                        sizes={imageSizes.sidebarCard}
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {item.sponsor}
                      </p>
                      <h2 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-slate-950">
                        {item.title}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-xs leading-6 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
