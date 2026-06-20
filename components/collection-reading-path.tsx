import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Clock3 } from "lucide-react";
import { buildAnalyticsAttrs } from "@/lib/analytics";
import type { LocalizedPost } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { uiCopy } from "@/lib/i18n";

const pathCopy = {
  en: {
    path: "Reading path",
    progress: "Progress",
    articles: "articles",
    part: "Part",
    current: "Current",
    read: "Read article",
  },
  zh: {
    path: "阅读路径",
    progress: "进度",
    articles: "篇文章",
    part: "第",
    current: "当前",
    read: "阅读文章",
  },
} as const;

export function CollectionReadingPath({
  locale,
  collectionSlug,
  posts,
  currentSlug,
  variant = "page",
}: {
  locale: Locale;
  collectionSlug: string;
  posts: LocalizedPost[];
  currentSlug?: string;
  variant?: "page" | "compact";
}) {
  if (posts.length === 0) {
    return null;
  }

  const copy = pathCopy[locale];
  const articleCopy = uiCopy[locale];
  const compact = variant === "compact";
  const currentIndex = currentSlug
    ? posts.findIndex((post) => post.slug === currentSlug)
    : -1;
  const progressPercent =
    currentIndex >= 0 ? Math.round(((currentIndex + 1) / posts.length) * 100) : 0;

  return (
    <section
      className={
        compact
          ? "mt-5"
          : "rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm sm:p-7"
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          <BookOpen className="h-4 w-4" />
          {copy.path}
        </p>
        <p className="text-sm font-semibold text-slate-500">
          {currentIndex >= 0
            ? `${copy.progress} ${currentIndex + 1}/${posts.length}`
            : `${posts.length} ${copy.articles}`}
        </p>
      </div>

      {currentIndex >= 0 ? (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      ) : null}

      <ol
        className={`mt-6 space-y-4 ${
          compact ? "max-h-[28rem] overflow-y-auto pr-1" : ""
        }`}
      >
        {posts.map((post, index) => {
          const href = `/${locale}/posts/${post.slug}`;
          const isCurrent = post.slug === currentSlug;
          const isBeforeCurrent = currentIndex >= 0 && index < currentIndex;
          const partLabel =
            locale === "zh" ? `${copy.part} ${index + 1} 篇` : `${copy.part} ${index + 1}`;

          return (
            <li
              key={post.slug}
              className={`relative grid gap-3 ${
                compact
                  ? "grid-cols-[2.25rem_minmax(0,1fr)]"
                  : "grid-cols-[3rem_minmax(0,1fr)]"
              }`}
            >
              <div className="relative flex justify-center">
                <span
                  className={`relative z-10 grid shrink-0 place-items-center rounded-full border text-xs font-semibold ${
                    compact ? "h-8 w-8" : "h-10 w-10"
                  } ${
                    isCurrent
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                      : isBeforeCurrent
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                {index < posts.length - 1 ? (
                  <span
                    className={`absolute bottom-[-1rem] w-px bg-slate-200 ${
                      compact ? "top-8" : "top-10"
                    }`}
                  />
                ) : null}
              </div>

              <Link
                href={href}
                aria-current={isCurrent ? "page" : undefined}
                {...buildAnalyticsAttrs({
                  eventName: "article_click",
                  label: post.title,
                  href,
                  articleSlug: post.slug,
                  categorySlug: post.categorySlug,
                  section: `collection-${collectionSlug}`,
                  targetType: "article",
                })}
                className={`group block rounded-lg border p-4 transition ${
                  isCurrent
                    ? "border-emerald-300 bg-emerald-50/75"
                    : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/35"
                } ${compact ? "p-3" : "sm:p-5"}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                        {partLabel}
                      </span>
                      {isCurrent ? (
                        <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          {copy.current}
                        </span>
                      ) : null}
                    </div>
                    <h3
                      className={`mt-2 font-semibold leading-snug text-slate-950 ${
                        compact ? "text-sm" : "text-lg tracking-tight"
                      }`}
                    >
                      {post.title}
                    </h3>
                  </div>
                  <span className="inline-flex shrink-0 items-center text-sm font-semibold text-emerald-700">
                    {copy.read}
                    <ArrowRight className="ml-1.5 h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>

                <p
                  className={`mt-2 text-sm leading-6 text-slate-600 ${
                    compact ? "line-clamp-2" : "line-clamp-3"
                  }`}
                >
                  {post.excerpt}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(post.publishedAt, locale)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" />
                    {post.readingMinutes} {articleCopy.readingTime}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
