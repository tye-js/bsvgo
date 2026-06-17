import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowRight,
  Brain,
  Blocks,
  Flame,
  Newspaper,
  ServerCog,
} from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { SectionHeader } from "@/components/section-header";
import { SafeImage } from "@/components/safe-image";
import {
  getFeaturedPost,
  getLocalizedCategories,
  getLocalizedPosts,
  getSponsoredPosts,
} from "@/lib/blog";
import { buildAnalyticsAttrs, buildSectionViewAttrs } from "@/lib/analytics";
import { createCoverArtDataUri, getRenderableImageSrc } from "@/lib/cover-art";
import { isCategorySlug } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { uiCopy } from "@/lib/i18n";

const sectionIcons = {
  blockchain: Blocks,
  ai: Brain,
  infrastructure: ServerCog,
} as const;

const topicStyles = {
  blockchain: {
    section: "bg-white",
    eyebrow: "text-emerald-700",
    icon: "bg-emerald-100 text-emerald-800",
    accent: "bg-emerald-200",
    card: "bg-[rgb(247,250,249)]",
    border: "border-emerald-900/10",
  },
  ai: {
    section: "bg-[rgb(240,249,255)]",
    eyebrow: "text-cyan-700",
    icon: "bg-cyan-100 text-cyan-800",
    accent: "bg-cyan-200",
    card: "bg-white/86",
    border: "border-cyan-900/10",
  },
  infrastructure: {
    section: "bg-[rgb(247,254,231)]",
    eyebrow: "text-lime-800",
    icon: "bg-lime-100 text-lime-800",
    accent: "bg-lime-200",
    card: "bg-white/86",
    border: "border-lime-900/10",
  },
} as const;

const defaultTopicStyle = topicStyles.infrastructure;

export async function HomePage({ locale }: { locale: Locale }) {
  const copy = uiCopy[locale];
  const [categories, posts, homeFeaturedPost, sponsoredPosts] = await Promise.all([
    getLocalizedCategories(locale),
    getLocalizedPosts(locale),
    getFeaturedPost(locale),
    getSponsoredPosts(locale, 5),
  ]);

  const featured = homeFeaturedPost ?? posts[0] ?? null;
  const latestPosts = posts.slice(0, 5);
  const featuredImageFallback = featured
    ? createCoverArtDataUri({
        title: featured.title,
        label: featured.categoryName,
        subtitle: featured.coverImageSeoDescription,
        categorySlug: featured.categorySlug,
        variant: "hero",
      })
    : "";

  return (
    <main className="bg-[rgb(249,251,250)] text-slate-900">
      <section
        className="relative isolate overflow-hidden border-b border-emerald-900/10 bg-[linear-gradient(135deg,rgba(236,253,245,0.95),rgba(250,252,255,0.96))]"
        {...buildSectionViewAttrs("home-hero")}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.78fr)] lg:items-end lg:py-14">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
              {copy.heroKicker}
            </p>
            <h1 className="mt-4 text-4xl font-black leading-[0.98] tracking-tight text-slate-950 md:text-6xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
              {copy.heroDescription}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/archive`}
                {...buildAnalyticsAttrs({
                  eventName: "nav_click",
                  label: copy.heroPrimary,
                  href: `/${locale}/archive`,
                  targetType: "nav",
                })}
                className="inline-flex items-center justify-center rounded-md bg-emerald-200 px-5 py-3 font-semibold text-slate-900 transition hover:bg-emerald-100"
              >
                {copy.heroPrimary}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href={`/${locale}/category/blockchain`}
                {...buildAnalyticsAttrs({
                  eventName: "category_click",
                  label: copy.heroSecondary,
                  href: `/${locale}/category/blockchain`,
                  categorySlug: "blockchain",
                  targetType: "category",
                })}
                className="inline-flex items-center justify-center rounded-md border border-teal-900/15 bg-white/70 px-5 py-3 font-semibold text-slate-700 transition hover:bg-white"
              >
                {copy.heroSecondary}
              </Link>
            </div>
          </div>

          {featured ? (
            <aside className="overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-sm">
              <Link
                href={`/${locale}/posts/${featured.slug}`}
                {...buildAnalyticsAttrs({
                  eventName: "article_click",
                  label: featured.title,
                  href: `/${locale}/posts/${featured.slug}`,
                  articleSlug: featured.slug,
                  categorySlug: featured.categorySlug,
                  targetType: "article",
                })}
                className="group block"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-emerald-50">
                  <SafeImage
                    src={getRenderableImageSrc(featured.coverImage, {
                      title: featured.title,
                      label: featured.categoryName,
                      subtitle: featured.coverImageSeoDescription,
                      categorySlug: featured.categorySlug,
                      variant: "hero",
                    })}
                    fallbackSrc={featuredImageFallback}
                    alt={featured.coverImageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 700px"
                    priority
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(2,6,23,0.78)_0%,rgba(2,6,23,0.28)_42%,rgba(2,6,23,0.05)_100%)]" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="rounded-lg bg-slate-950/72 px-4 py-4 text-white backdrop-blur-md">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                          {copy.featuredKicker}
                        </span>
                        <span className="rounded-md bg-emerald-200 px-3 py-1.5 text-xs font-semibold text-slate-950">
                          {featured.categoryName}
                        </span>
                      </div>
                      <h2 className="mt-4 text-2xl font-bold leading-tight text-white">
                        {featured.title}
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-7 text-slate-100/90">
                        {featured.excerpt}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </aside>
          ) : null}
        </div>
      </section>

      {sponsoredPosts.length > 0 ? (
        <ArticleSection
          id="popular"
          className="bg-white py-16"
          icon={Flame}
          eyebrow="popular"
          title={copy.popularTitle}
          description={copy.popularDescription}
          actionHref={`/${locale}#popular`}
          actionLabel={copy.viewAll}
          actionAnalytics={{
            eventName: "section_jump",
            label: copy.viewAll,
            href: `/${locale}#popular`,
            section: "popular",
            targetType: "internal",
          }}
        >
          {sponsoredPosts.map((post) => (
            <ArticleCard
              key={post.slug}
              locale={locale}
              post={post}
              section="popular"
              imageSizes="(max-width: 1024px) 50vw, 320px"
            />
          ))}
        </ArticleSection>
      ) : null}

      <ArticleSection
        id="latest"
        className="bg-[rgb(240,253,250)] py-16"
        icon={Newspaper}
        eyebrow="latest"
        title={copy.latestTitle}
        description={copy.latestDescription}
        actionHref={`/${locale}/archive`}
        actionLabel={copy.viewAll}
        actionAnalytics={{
          eventName: "nav_click",
          label: copy.viewAll,
          href: `/${locale}/archive`,
          targetType: "nav",
        }}
      >
        {latestPosts.map((post) => (
          <ArticleCard
            key={post.slug}
            locale={locale}
            post={post}
            section="latest"
            imageSizes="(max-width: 1024px) 50vw, 360px"
          />
        ))}
      </ArticleSection>

      {categories.map((category) => {
        const categoryPosts = posts
          .filter((post) => post.categorySlug === category.slug)
          .slice(0, 5);

        if (categoryPosts.length === 0) {
          return null;
        }

        const knownCategorySlug = isCategorySlug(category.slug)
          ? category.slug
          : null;
        const Icon = knownCategorySlug
          ? sectionIcons[knownCategorySlug]
          : ServerCog;
        const style = knownCategorySlug
          ? topicStyles[knownCategorySlug]
          : defaultTopicStyle;

        return (
          <ArticleSection
            key={category.slug}
            id={`topic-${category.slug}`}
            className={`py-12 ${style.section}`}
            icon={Icon}
            eyebrow={category.slug}
            title={
              <Link
                href={`/${locale}/category/${category.slug}`}
                {...buildAnalyticsAttrs({
                  eventName: "category_click",
                  label: category.name,
                  href: `/${locale}/category/${category.slug}`,
                  categorySlug: category.slug,
                  targetType: "category",
                })}
              >
                {category.name}
              </Link>
            }
            description={category.description}
            tone={{ icon: style.icon, eyebrow: style.eyebrow }}
            actionHref={`/${locale}/category/${category.slug}`}
            actionLabel={copy.viewAll}
            actionAnalytics={{
              eventName: "category_click",
              label: copy.viewAll,
              href: `/${locale}/category/${category.slug}`,
              categorySlug: category.slug,
              targetType: "category",
            }}
          >
            {categoryPosts.map((post) => (
              <ArticleCard
                key={post.slug}
                locale={locale}
                post={post}
                section={`topic-${category.slug}`}
                tone={{
                  card: style.card,
                  border: "border-slate-200",
                  accent: style.accent,
                }}
              />
            ))}
          </ArticleSection>
        );
      })}

      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 md:grid-cols-3">
          <InfoPanel eyebrow="BSVgo">
            Builder notes for blockchain, AI, and infrastructure.
          </InfoPanel>
          <InfoPanel eyebrow="Tags">
            <div className="flex flex-wrap gap-2 text-sm">
              {[
                ...new Map(
                  posts
                    .flatMap((post) => post.tags)
                    .map((tag) => [tag.slug, tag])
                ).values(),
              ]
                .slice(0, 8)
                .map((tag) => (
                  <span
                    key={tag.slug}
                    className="rounded-md bg-emerald-50 px-3 py-1.5 text-emerald-700"
                  >
                    {tag.name}
                  </span>
                ))}
            </div>
          </InfoPanel>
          <InfoPanel eyebrow="Updates">
            <p className="text-sm leading-7 text-slate-600">
              Follow the latest notes from BSVgo as the stack evolves.
            </p>
            <p className="mt-3 text-sm text-slate-500">Contact: hello@bsvgo.com</p>
          </InfoPanel>
        </div>
      </section>
    </main>
  );
}

type ArticleSectionProps = {
  id: string;
  className: string;
  icon: ComponentType<{ className?: string }>;
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  tone?: {
    icon?: string;
    eyebrow?: string;
  };
  actionHref: string;
  actionLabel: string;
  actionAnalytics: Parameters<typeof buildAnalyticsAttrs>[0];
  children: ReactNode;
};

function ArticleSection({
  id,
  className,
  icon,
  eyebrow,
  title,
  description,
  tone,
  actionHref,
  actionLabel,
  actionAnalytics,
  children,
}: ArticleSectionProps) {
  return (
    <section
      id={id}
      className={`border-b border-emerald-900/10 ${className}`}
      {...buildSectionViewAttrs(id)}
    >
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeader
          icon={icon}
          eyebrow={eyebrow}
          title={title}
          description={description}
          tone={tone}
          action={{
            href: actionHref,
            label: actionLabel,
            analytics: actionAnalytics,
          }}
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {children}
        </div>
      </div>
    </section>
  );
}

function InfoPanel({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-teal-900/10 bg-[rgb(249,251,250)] p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
        {eyebrow}
      </p>
      <div className="mt-4 text-lg font-semibold text-slate-900">{children}</div>
    </div>
  );
}
