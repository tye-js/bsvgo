import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  getFeaturedPost,
  getLocalizedPosts,
} from "@/lib/blog";
import { slugifyTag } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { Locale, uiCopy } from "@/lib/i18n";

const highlights = [
  {
    icon: Zap,
    title: "Signal over noise",
    text: "Short, practical posts that help builders decide faster.",
  },
  {
    icon: ShieldCheck,
    title: "Infrastructure aware",
    text: "Servers, IP strategy, and deployment detail stay part of the story.",
  },
  {
    icon: Sparkles,
    title: "English first, Chinese ready",
    text: "Default content is in English with a clean path to Chinese.",
  },
];

const heroArticleCopy = {
  en: {
    kicker: "Latest read",
  },
  zh: {
    kicker: "最新文章",
  },
} satisfies Record<Locale, {
  kicker: string;
}>;

export async function HomePage({ locale }: { locale: Locale }) {
  const copy = uiCopy[locale];
  const [posts, featured] = await Promise.all([
    getLocalizedPosts(locale),
    getFeaturedPost(locale),
  ]);
  const tags = [...new Set(posts.flatMap((post) => post.tags))].slice(0, 10);
  const latestPost = posts[0];
  const heroArticle = latestPost ?? featured;
  const heroArticleLabel = heroArticleCopy[locale];
  const featuredPosts = [
    ...posts.filter((post) => post.featured),
    ...posts.filter((post) => !post.featured),
  ].slice(0, 3);

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-hero-grid text-slate-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-8 md:py-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.72fr)] lg:items-center">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
              {copy.heroKicker}
            </p>
            <h1 className="mt-3 text-4xl font-black leading-[1.02] tracking-tight text-slate-900 md:text-6xl">
              BSVgo
            </h1>
            <p className="mt-3 max-w-2xl text-xl font-semibold leading-tight text-slate-800 md:text-3xl">
              {copy.heroTitle}
            </p>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 md:text-lg md:leading-8">
              {copy.heroDescription}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="inline-flex items-center gap-2 rounded-md border border-teal-900/10 bg-white/75 px-3 py-2 text-sm font-medium text-slate-700 backdrop-blur-sm"
                  >
                    <Icon className="h-5 w-5 text-emerald-600" />
                    <span>{item.title}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/${locale}#latest`}
                className="inline-flex items-center justify-center rounded-md bg-emerald-200 px-5 py-3 font-semibold text-slate-900 transition hover:bg-emerald-100"
              >
                {copy.heroPrimary}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href={`/${locale}/category/infrastructure`}
                className="inline-flex items-center justify-center rounded-md border border-teal-900/15 px-5 py-3 font-semibold text-slate-700 transition hover:bg-white/70"
              >
                {copy.heroSecondary}
              </Link>
            </div>
          </div>
          {heroArticle ? (
            <aside className="overflow-hidden rounded-lg border border-emerald-900/10 bg-white/80 shadow-sm backdrop-blur-md">
              <Link
                href={`/${locale}/posts/${heroArticle.slug}`}
                className="group block"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-emerald-50">
                  <img
                    src={heroArticle.coverImage}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/44 via-slate-950/6 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                    <span className="rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 backdrop-blur-sm">
                      {heroArticleLabel.kicker}
                    </span>
                    <span className="rounded-md bg-emerald-200 px-3 py-1.5 text-xs font-semibold text-slate-950">
                      {heroArticle.categoryName}
                    </span>
                  </div>
                </div>
              </Link>
              <div className="p-5">
                <h2 className="text-2xl font-bold leading-tight text-slate-950">
                  <Link href={`/${locale}/posts/${heroArticle.slug}`}>
                    {heroArticle.title}
                  </Link>
                </h2>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  {heroArticle.excerpt}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(heroArticle.tags ?? []).slice(0, 4).map((tag) => (
                    <Link
                      key={tag}
                      href={`/${locale}/tag/${slugifyTag(tag)}`}
                      className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </section>

      {featuredPosts.length > 0 ? (
        <section className="border-y border-emerald-900/10 bg-white py-16 text-slate-900">
          <div className="mx-auto max-w-7xl px-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  {copy.sectionTitle}
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
                  {copy.sectionDescription}
                </h2>
              </div>
            </div>

            <div className="mt-10 flex gap-5 overflow-x-auto pb-3 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
              {featuredPosts.map((post) => (
                <article
                  key={post.slug}
                  className="min-w-[82vw] overflow-hidden rounded-lg border border-slate-200 bg-[rgb(247,250,249)] transition hover:border-emerald-300 md:min-w-0"
                >
                  <Link
                    href={`/${locale}/posts/${post.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-emerald-50">
                      <img
                        src={post.coverImage}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/36 via-transparent to-transparent" />
                      <span className="absolute bottom-4 left-4 rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold text-emerald-700 backdrop-blur-sm">
                        {post.categoryName}
                      </span>
                    </div>
                  </Link>
                  <div className="p-5">
                    <p className="text-sm text-slate-500">
                      {formatDate(post.publishedAt, locale)}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold leading-tight text-slate-950">
                      <Link href={`/${locale}/posts/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(post.tags ?? []).slice(0, 3).map((tag) => (
                        <Link
                          key={tag}
                          href={`/${locale}/tag/${slugifyTag(tag)}`}
                          className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/${locale}/posts/${post.slug}`}
                      className="mt-5 inline-flex items-center font-semibold text-emerald-700"
                    >
                      {copy.readMore}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="latest" className="border-b border-emerald-900/10 bg-[rgb(240,253,250)] py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
              {copy.latestTitle}
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              {copy.latestDescription}
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-emerald-300"
              >
                <Link
                  href={`/${locale}/posts/${post.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-emerald-50">
                    <img
                      src={post.coverImage}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/34 via-transparent to-transparent" />
                    <span className="absolute bottom-4 left-4 rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold text-emerald-700 backdrop-blur-sm">
                      {post.categoryName}
                    </span>
                  </div>
                </Link>
                <div className="p-5">
                  <h3 className="text-xl font-semibold leading-tight text-slate-950">
                    <Link href={`/${locale}/posts/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(post.tags ?? []).slice(0, 3).map((tag) => (
                      <Link
                        key={tag}
                        href={`/${locale}/tag/${slugifyTag(tag)}`}
                        className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 md:grid-cols-3">
          <div className="rounded-lg border border-teal-900/10 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              BSVgo
            </p>
            <p className="mt-4 text-xl font-semibold text-slate-900">
              Builder notes for blockchain, AI, and infrastructure.
            </p>
          </div>
          <div className="rounded-lg border border-teal-900/10 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Tags
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-emerald-50 px-3 py-1.5 text-emerald-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-teal-900/10 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Updates
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Follow the latest notes from BSVgo as the stack evolves.
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Contact: hello@bsvgo.com
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
