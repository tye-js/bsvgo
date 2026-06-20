import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { CollectionReadingPath } from "@/components/collection-reading-path";
import { SafeImage } from "@/components/safe-image";
import { buildAnalyticsAttrs, buildSectionViewAttrs } from "@/lib/analytics";
import {
  getLocalizedCollectionBySlug,
  getLocalizedCollections,
  type LocalizedCollectionWithPosts,
} from "@/lib/blog";
import { createCoverArtDataUri, getRenderableImageSrc } from "@/lib/cover-art";
import { imageSizes } from "@/lib/image-sizes";
import { Locale, locales, siteConfig } from "@/lib/i18n";

export const revalidate = 300;

function absoluteUrl(path: string) {
  return new URL(path, siteConfig.url).toString();
}

function buildCollectionJsonLd({
  locale,
  collection,
}: {
  locale: Locale;
  collection: LocalizedCollectionWithPosts;
}) {
  const collectionUrl = absoluteUrl(`/${locale}/collections/${collection.slug}`);
  const imageUrl = getRenderableImageSrc(collection.coverImage, {
    title: collection.title,
    label: locale === "zh" ? "专题" : "Collection",
    subtitle: collection.description,
    variant: "hero",
  });

  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${collectionUrl}#collection`,
      url: collectionUrl,
      name: collection.title,
      headline: collection.title,
      description: collection.seoDescription || collection.description,
      inLanguage: locale,
      image: imageUrl,
      isPartOf: {
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.url,
      },
      mainEntity: {
        "@id": `${collectionUrl}#item-list`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${collectionUrl}#item-list`,
      name: collection.title,
      numberOfItems: collection.posts.length,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: collection.posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/${locale}/posts/${post.slug}`),
        name: post.title,
      })),
    },
  ];
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

  const collection = await getLocalizedCollectionBySlug(locale, slug);

  if (!collection) {
    return {};
  }

  const url = absoluteUrl(`/${locale}/collections/${collection.slug}`);

  return {
    title: collection.seoTitle,
    description: collection.seoDescription,
    alternates: {
      canonical: url,
      languages: {
        en: absoluteUrl(`/en/collections/${collection.slug}`),
        zh: absoluteUrl(`/zh/collections/${collection.slug}`),
      },
    },
    openGraph: {
      title: collection.seoTitle,
      description: collection.seoDescription,
      url,
      type: "article",
      images: [
        {
          url: getRenderableImageSrc(collection.coverImage, {
            title: collection.title,
            label: "Collection",
            subtitle: collection.description,
            variant: "hero",
          }),
          alt: collection.coverImageAlt,
        },
      ],
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const collection = await getLocalizedCollectionBySlug(locale, slug);

  if (!collection) {
    notFound();
  }

  const fallbackSrc = createCoverArtDataUri({
    title: collection.title,
    label: locale === "zh" ? "专题" : "Collection",
    subtitle: collection.description,
    variant: "hero",
  });
  const jsonLd = buildCollectionJsonLd({ locale, collection });

  return (
    <main className="bg-[rgb(249,251,250)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section
        className="border-b border-emerald-900/10 bg-white"
        {...buildSectionViewAttrs(`collection-${collection.slug}`)}
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-end lg:py-14">
          <div>
            <Link
              href={`/${locale}/collections`}
              {...buildAnalyticsAttrs({
                eventName: "nav_click",
                label: locale === "zh" ? "返回专题" : "Back to collections",
                href: `/${locale}/collections`,
                targetType: "nav",
              })}
              className="inline-flex items-center text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {locale === "zh" ? "返回专题" : "Back to collections"}
            </Link>
            <p className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
              <BookOpen className="h-4 w-4" />
              {locale === "zh" ? "专题" : "Collection"}
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              {collection.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              {collection.description}
            </p>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              {collection.postCount}{" "}
              {locale === "zh" ? "篇文章" : "articles"}
            </p>
          </div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-emerald-900/10 bg-emerald-50 shadow-sm">
            <SafeImage
              src={getRenderableImageSrc(collection.coverImage, {
                title: collection.title,
                label: locale === "zh" ? "专题" : "Collection",
                subtitle: collection.description,
                variant: "hero",
              })}
              fallbackSrc={fallbackSrc}
              alt={collection.coverImageAlt}
              fill
              sizes={imageSizes.collectionHero}
              priority
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-5xl px-5">
          {collection.posts.length > 0 ? (
            <CollectionReadingPath
              locale={locale}
              collectionSlug={collection.slug}
              posts={collection.posts}
            />
          ) : (
            <div className="rounded-lg border border-emerald-900/10 bg-white p-8 text-center shadow-sm">
              <BookOpen className="mx-auto h-10 w-10 text-emerald-600" />
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                {locale === "zh" ? "专题文章待添加" : "No articles in this collection yet"}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                {locale === "zh"
                  ? "这个专题已经发布，但后台还没有为它添加文章。文章加入专题后，这里会自动显示阅读路径。"
                  : "This collection is published, but no articles have been attached yet. Once posts are added in the CMS, the reading path will appear here automatically."}
              </p>
              <Link
                href={`/${locale}/collections`}
                {...buildAnalyticsAttrs({
                  eventName: "nav_click",
                  label: locale === "zh" ? "返回专题" : "Back to collections",
                  href: `/${locale}/collections`,
                  targetType: "nav",
                })}
                className="mt-5 inline-flex items-center justify-center rounded-md bg-emerald-100 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-200"
              >
                {locale === "zh" ? "返回专题" : "Back to collections"}
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export async function generateStaticParams() {
  const params: Array<{ locale: Locale; slug: string }> = [];

  for (const locale of locales) {
    const collections = await getLocalizedCollections(locale);

    for (const collection of collections) {
      params.push({ locale, slug: collection.slug });
    }
  }

  return params;
}
