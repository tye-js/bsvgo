import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/format";
import { Locale, uiCopy } from "@/lib/i18n";

type ArticleCardProps = {
  locale: Locale;
  post: {
    slug: string;
    title: string;
    excerpt: string;
    publishedAt: string;
    readingMinutes: number;
    categoryName: string;
    categorySlug: string;
    tags?: string[];
  };
};

export function ArticleCard({ locale, post }: ArticleCardProps) {
  const copy = uiCopy[locale];

  return (
    <article className="group border-t border-teal-900/10 py-7">
      <div className="grid gap-5 md:grid-cols-[180px_1fr_auto] md:items-start">
        <div className="text-sm text-slate-500">
          <Link
            href={`/${locale}/category/${post.categorySlug}`}
            className="font-semibold text-emerald-700"
          >
            {post.categoryName}
          </Link>
          <p className="mt-2">{formatDate(post.publishedAt, locale)}</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            <Link href={`/${locale}/posts/${post.slug}`}>{post.title}</Link>
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            {post.excerpt}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>
              {post.readingMinutes} {copy.readingTime}
            </span>
            {(post.tags ?? []).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <Link
          href={`/${locale}/posts/${post.slug}`}
          aria-label={`${copy.readMore}: ${post.title}`}
          className="grid h-11 w-11 place-items-center rounded-md border border-teal-900/10 text-slate-700 transition group-hover:border-emerald-400 group-hover:text-emerald-700"
        >
          <ArrowUpRight className="h-5 w-5" />
        </Link>
      </div>
    </article>
  );
}
