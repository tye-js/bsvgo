import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { ArticleCard } from "@/components/article-card";
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

export async function HomePage({ locale }: { locale: Locale }) {
  const copy = uiCopy[locale];
  const [posts, featured] = await Promise.all([
    getLocalizedPosts(locale),
    getFeaturedPost(locale),
  ]);
  const tags = [...new Set(posts.flatMap((post) => post.tags))].slice(0, 10);

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-hero-grid text-slate-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
        <div className="relative mx-auto max-w-7xl px-5 py-8 md:py-10">
          <div className="max-w-4xl">
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
        </div>
      </section>

      {featured ? (
        <section className="bg-[linear-gradient(135deg,rgba(236,253,245,0.95),rgba(239,246,255,0.95))] py-20 text-slate-900">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                {copy.sectionTitle}
              </p>
              <h2 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
                {featured.title}
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                {copy.sectionDescription}
              </p>
            </div>
            <div className="rounded-lg border border-teal-900/10 bg-white p-7 transition hover:border-emerald-300">
              <p className="text-sm text-emerald-700">
                {featured.categoryName} / {formatDate(featured.publishedAt, locale)}
              </p>
              <h3 className="mt-5 text-2xl font-semibold leading-tight text-slate-900">
                <Link href={`/${locale}/posts/${featured.slug}`}>
                  {featured.title}
                </Link>
              </h3>
              <p className="mt-5 text-xl leading-8 text-slate-800">
                {featured.excerpt}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {(featured.tags ?? []).map((tag) => (
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
                href={`/${locale}/posts/${featured.slug}`}
                className="mt-8 inline-flex items-center font-semibold text-emerald-700"
              >
                {copy.readMore}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section id="latest" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
              {copy.latestTitle}
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              {copy.latestDescription}
            </p>
          </div>
          <div className="mt-12">
            {posts.map((post) => (
              <ArticleCard key={post.slug} locale={locale} post={post} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[rgb(247,250,249)] py-16">
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
