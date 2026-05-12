import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ArticleBody } from "@/components/article-body";
import { getPostData } from "@/lib/blog";
import { posts } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { Locale, locales, uiCopy } from "@/lib/i18n";

export function generateStaticParams() {
  return posts.flatMap((post) => [
    { locale: "en", slug: post.slug },
    { locale: "zh", slug: post.slug },
  ]);
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

  return {
    title: post.seoTitle,
    description: post.seoDescription,
    alternates: {
      canonical: `/${locale}/posts/${slug}`,
      languages: {
        en: `/en/posts/${slug}`,
        zh: `/zh/posts/${slug}`,
      },
    },
    openGraph: {
      title: post.seoTitle,
      description: post.seoDescription,
      type: "article",
    },
  };
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
  const copy = uiCopy[locale];

  if (!post) {
    notFound();
  }

  return (
    <main className="bg-[rgb(249,251,250)]">
      <article>
        <header className="bg-[linear-gradient(135deg,rgba(236,253,245,0.98),rgba(239,246,255,0.95))] px-5 py-20 text-slate-900">
          <div className="mx-auto max-w-4xl">
            <Link
              href={`/${locale}/category/${post.categorySlug}`}
              className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700"
            >
              {post.categoryName}
            </Link>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-6xl">
              {post.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              {post.excerpt}
            </p>
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-500">
              <span>
                {copy.publishedOn} {formatDate(post.publishedAt, locale)}
              </span>
              <span>
                {post.readingMinutes} {copy.readingTime}
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {(post.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-white/80 px-2.5 py-1 text-xs font-medium text-emerald-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-5 py-14">
          <ArticleBody content={post.content} />
        </div>
      </article>
      <nav className="mx-auto grid max-w-4xl gap-4 px-5 pb-20 md:grid-cols-2">
        {post.previous ? (
          <Link
            href={`/${locale}/posts/${post.previous.slug}`}
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
    </main>
  );
}
