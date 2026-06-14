import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ArticleBody } from "@/components/article-body";
import { SafeImage } from "@/components/safe-image";
import { buildAnalyticsAttrs, buildSectionViewAttrs } from "@/lib/analytics";
import type { LocalizedPostWithNeighbors } from "@/lib/blog";
import { getPostData, getRelatedPosts } from "@/lib/blog";
import { createCoverArtDataUri, getRenderableImageSrc } from "@/lib/cover-art";
import { formatDate } from "@/lib/format";
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
  const image = getRenderableImageSrc(post.coverImage, {
    title: post.title,
    label: post.categoryName,
    subtitle: post.excerpt,
    categorySlug: post.categorySlug,
    variant: "hero",
  });
  const absoluteImage = image.startsWith("http")
    ? image
    : createCoverArtDataUri({
        title: post.title,
        label: post.categoryName,
        subtitle: post.excerpt,
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
          alt: post.title,
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
  const image = getRenderableImageSrc(post.coverImage, {
    title: post.title,
    label: post.categoryName,
    subtitle: post.excerpt,
    categorySlug: post.categorySlug,
    variant: "hero",
  });
  const imageUrl = image.startsWith("http")
    ? image
    : createCoverArtDataUri({
        title: post.title,
        label: post.categoryName,
        subtitle: post.excerpt,
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
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: [imageUrl],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: locale,
    articleSection: post.categoryName,
    keywords: post.tags.map((tag) => tag.name),
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
  const relatedPosts = post ? await getRelatedPosts(locale, slug) : [];
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
    subtitle: post.excerpt,
    categorySlug: post.categorySlug,
    variant: "hero",
  });
  const jsonLd = buildPostJsonLd({ locale, post });

  return (
    <main className="bg-[rgb(249,251,250)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-5 py-6 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <article
            className="min-w-0"
            {...buildSectionViewAttrs(`article-${slug}`)}
          >
            <header className="overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-sm">
              <div className="relative min-h-[420px] overflow-hidden bg-emerald-50 sm:min-h-[470px] lg:min-h-[520px]">
                <SafeImage
                  src={getRenderableImageSrc(post.coverImage, {
                    title: post.title,
                    label: post.categoryName,
                    subtitle: post.excerpt,
                    categorySlug: post.categorySlug,
                    variant: "hero",
                  })}
                  fallbackSrc={heroImageFallback}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 900px"
                  className="object-cover object-center"
                  priority
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(236,253,245,0.12)_0%,rgba(249,251,250,0.05)_38%,rgba(249,251,250,0.26)_64%,rgba(249,251,250,0.96)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-5 sm:px-7 sm:pb-7 lg:px-10 lg:pb-10">
                  <div className="max-w-3xl rounded-lg border border-white/40 bg-white/65 p-5 text-slate-900 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-6 lg:p-7">
                    <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
                      {post.title}
                    </h1>
                    <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                      {post.excerpt}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4 border-t border-emerald-900/10 bg-white px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between lg:px-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                  {authorName || authorAvatar ? (
                    <div className="flex items-center gap-3">
                      <div className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-emerald-900/10 bg-emerald-50 text-sm font-semibold text-emerald-700">
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
                            sizes="44px"
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
                          <p className="truncate text-xs font-medium uppercase tracking-[0.16em] text-emerald-700">
                            {authorRole}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span>
                      {copy.publishedOn} {formatDate(post.publishedAt, locale)}
                    </span>
                    <span>
                      {post.readingMinutes} {copy.readingTime}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
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
            </header>

            <div
              className="mt-8 rounded-lg border border-emerald-900/10 bg-white px-5 py-10 shadow-sm sm:px-7 lg:px-10"
              {...buildSectionViewAttrs(`article-body-${slug}`)}
            >
              <ArticleBody content={post.content} />
            </div>

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
                      <div className="relative aspect-[16/10] overflow-hidden bg-emerald-50">
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
                          alt=""
                          fill
                          sizes="(max-width: 768px) 100vw, 360px"
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
                    className="overflow-hidden rounded-md border border-slate-200 bg-[rgb(249,251,250)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-emerald-50">
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
                        alt=""
                        fill
                        sizes="300px"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {item.sponsor}
                      </p>
                      <h2 className="mt-2 text-sm font-semibold leading-snug text-slate-950">
                        {item.title}
                      </h2>
                      <p className="mt-2 text-xs leading-6 text-slate-600">
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
