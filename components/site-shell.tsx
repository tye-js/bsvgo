import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Layers,
  Mail,
  MessageCircle,
  Rss,
  Send,
} from "lucide-react";
import { getLocalizedCategories, getLocalizedCollections } from "@/lib/blog";
import { buildAnalyticsAttrs } from "@/lib/analytics";
import { Locale, uiCopy } from "@/lib/i18n";
import { BrandLogo } from "@/components/brand-logo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { MobileSiteNav } from "@/components/mobile-site-nav";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";

type SiteShellProps = {
  locale: Locale;
  children: React.ReactNode;
};

const footerCopy = {
  en: {
    tagline:
      "English-first technology blog for blockchain, AI, and infrastructure.",
    content: "Content",
    collections: "Collections",
    categories: "Topics",
    connect: "Connect",
    site: "Site",
    latest: "Latest articles",
    archive: "Full archive",
    about: "About BSVgo",
    allCollections: "All collections",
    noCollections: "Collections are being organized",
    allTopics: "All topic lanes",
    sitemap: "Sitemap",
    robots: "Robots",
    footerNote: "Forward with builders.",
    stack: "Blockchain / AI / Infrastructure",
  },
  zh: {
    tagline: "面向区块链、AI 与基础设施建设者的双语技术博客。",
    content: "内容导航",
    collections: "专题入口",
    categories: "分类入口",
    connect: "外部联系",
    site: "站点链接",
    latest: "最新文章",
    archive: "完整归档",
    about: "关于 BSVgo",
    allCollections: "全部专题",
    noCollections: "专题正在整理中",
    allTopics: "全部分类",
    sitemap: "站点地图",
    robots: "Robots",
    footerNote: "与建设者一起前进。",
    stack: "区块链 / AI / 基础设施",
  },
} as const;

export async function SiteShell({ locale, children }: SiteShellProps) {
  const copy = uiCopy[locale];
  const footer = footerCopy[locale];
  const [categories, collections] = await Promise.all([
    getLocalizedCategories(locale),
    getLocalizedCollections(locale, 4),
  ]);
  const collectionsLabel = locale === "zh" ? "专题" : "Collections";
  const navItems = [
    {
      href: `/${locale}`,
      label: copy.navHome,
    },
    ...categories.map((category) => ({
      href: `/${locale}/category/${category.slug}`,
      label: category.name,
    })),
    {
      href: `/${locale}/archive`,
      label: copy.navArchive,
    },
    {
      href: `/${locale}/collections`,
      label: collectionsLabel,
    },
    {
      href: `/${locale}/about`,
      label: copy.navAbout,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnalyticsProvider locale={locale}>
        <header className="sticky top-0 z-50 border-b border-teal-900/10 bg-[rgba(249,251,250,0.92)] text-slate-800 backdrop-blur-xl">
          <div className="relative mx-auto max-w-7xl px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Link
                  href={`/${locale}`}
                  {...buildAnalyticsAttrs({
                    eventName: "nav_click",
                    label: "BSVgo",
                    href: `/${locale}`,
                    targetType: "nav",
                  })}
                  className="flex items-center gap-3"
                >
                  <BrandLogo />
                  <span className="text-lg font-semibold tracking-[0.12em] text-slate-900">
                    BSVgo
                  </span>
                </Link>
              </div>
              <nav className="hidden gap-2 text-sm text-slate-700 md:flex">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    {...buildAnalyticsAttrs({
                      eventName: "nav_click",
                      label: item.label,
                      href: item.href,
                      targetType: "nav",
                    })}
                    className="rounded-md px-3 py-1.5 transition hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <LocaleSwitcher
                locale={locale}
                className="hidden items-center gap-2 text-sm md:flex"
              />
              <MobileSiteNav locale={locale} navItems={navItems} />
            </div>
          </div>
        </header>
        {children}
        <footer className="border-t border-teal-900/10 bg-[rgb(249,251,250)]">
          <div className="mx-auto max-w-7xl px-5 py-12">
            <div className="grid gap-8 lg:grid-cols-[minmax(220px,1.15fr)_minmax(220px,1fr)_minmax(180px,0.9fr)_minmax(180px,0.78fr)]">
              <div className="rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm">
                <Link
                  href={`/${locale}`}
                  {...buildAnalyticsAttrs({
                    eventName: "nav_click",
                    label: "BSVgo",
                    href: `/${locale}`,
                    targetType: "nav",
                  })}
                  className="inline-flex items-center gap-3"
                >
                  <BrandLogo />
                  <span className="text-lg font-semibold tracking-[0.12em] text-slate-900">
                    BSVgo
                  </span>
                </Link>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {footer.tagline}
                </p>
                <div className="mt-5 grid gap-2 text-sm font-semibold text-slate-800 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <Link
                    href={`/${locale}`}
                    {...buildAnalyticsAttrs({
                      eventName: "nav_click",
                      label: footer.latest,
                      href: `/${locale}`,
                      targetType: "nav",
                    })}
                    className="inline-flex items-center justify-between rounded-md bg-emerald-50 px-3 py-2 transition hover:bg-emerald-100 hover:text-emerald-800"
                  >
                    {footer.latest}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/${locale}/archive`}
                    {...buildAnalyticsAttrs({
                      eventName: "nav_click",
                      label: footer.archive,
                      href: `/${locale}/archive`,
                      targetType: "nav",
                    })}
                    className="inline-flex items-center justify-between rounded-md bg-cyan-50 px-3 py-2 transition hover:bg-cyan-100 hover:text-cyan-800"
                  >
                    {footer.archive}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {footer.collections}
                </p>
                <div className="mt-4 flex flex-col gap-3 text-sm text-slate-700">
                  {collections.length > 0 ? (
                    collections.map((collection) => (
                      <Link
                        key={collection.slug}
                        href={`/${locale}/collections/${collection.slug}`}
                        {...buildAnalyticsAttrs({
                          eventName: "section_jump",
                          label: collection.title,
                          href: `/${locale}/collections/${collection.slug}`,
                          section: "footer-collections",
                          targetType: "collection",
                        })}
                        className="group rounded-lg border border-slate-200 bg-white px-3 py-3 transition hover:border-emerald-300"
                      >
                        <span className="flex items-center gap-2 font-semibold text-slate-900">
                          <BookOpen className="h-4 w-4 text-emerald-700" />
                          <span className="line-clamp-1">{collection.title}</span>
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          {collection.postCount}{" "}
                          {locale === "zh" ? "篇文章" : "articles"}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-500">
                      {footer.noCollections}
                    </p>
                  )}
                  <Link
                    href={`/${locale}/collections`}
                    {...buildAnalyticsAttrs({
                      eventName: "nav_click",
                      label: footer.allCollections,
                      href: `/${locale}/collections`,
                      targetType: "collection",
                    })}
                    className="inline-flex items-center gap-2 font-semibold text-emerald-700 transition hover:text-emerald-800"
                  >
                    <Layers className="h-4 w-4" />
                    {footer.allCollections}
                  </Link>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {footer.categories}
                </p>
                <div className="mt-4 flex flex-col gap-3 text-sm text-slate-700">
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/${locale}/category/${category.slug}`}
                      {...buildAnalyticsAttrs({
                        eventName: "category_click",
                        label: category.name,
                        href: `/${locale}/category/${category.slug}`,
                        categorySlug: category.slug,
                        targetType: "category",
                      })}
                      className="rounded-md px-2 py-1.5 transition hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      {category.name}
                    </Link>
                  ))}
                  <Link
                    href={`/${locale}/archive`}
                    {...buildAnalyticsAttrs({
                      eventName: "nav_click",
                      label: footer.allTopics,
                      href: `/${locale}/archive`,
                      targetType: "nav",
                    })}
                    className="mt-1 inline-flex items-center gap-2 font-semibold text-emerald-700 transition hover:text-emerald-800"
                  >
                    {footer.allTopics}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {footer.content}
                  </p>
                  <div className="mt-4 flex flex-col gap-3 text-sm text-slate-700">
                    <Link
                      href={`/${locale}`}
                      {...buildAnalyticsAttrs({
                        eventName: "nav_click",
                        label: copy.navHome,
                        href: `/${locale}`,
                        targetType: "nav",
                      })}
                    >
                      {copy.navHome}
                    </Link>
                    <Link
                      href={`/${locale}/archive`}
                      {...buildAnalyticsAttrs({
                        eventName: "nav_click",
                        label: copy.navArchive,
                        href: `/${locale}/archive`,
                        targetType: "nav",
                      })}
                    >
                      {copy.navArchive}
                    </Link>
                    <Link
                      href={`/${locale}/about`}
                      {...buildAnalyticsAttrs({
                        eventName: "nav_click",
                        label: footer.about,
                        href: `/${locale}/about`,
                        targetType: "nav",
                      })}
                    >
                      {footer.about}
                    </Link>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {footer.connect}
                  </p>
                  <div className="mt-4 flex flex-col gap-3 text-sm text-slate-700">
                    <a
                      href="mailto:hello@bsvgo.com"
                      {...buildAnalyticsAttrs({
                        eventName: "outbound_click",
                        label: "hello@bsvgo.com",
                        href: "mailto:hello@bsvgo.com",
                        targetType: "email",
                      })}
                      className="inline-flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      hello@bsvgo.com
                    </a>
                    <a
                      href="https://x.com/bsvgo"
                      {...buildAnalyticsAttrs({
                        eventName: "outbound_click",
                        label: "X / Twitter",
                        href: "https://x.com/bsvgo",
                        targetType: "external",
                      })}
                      className="inline-flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      X / Twitter
                    </a>
                    <a
                      href="https://t.me/bsvgo"
                      {...buildAnalyticsAttrs({
                        eventName: "outbound_click",
                        label: "Telegram",
                        href: "https://t.me/bsvgo",
                        targetType: "external",
                      })}
                      className="inline-flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Telegram
                    </a>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {footer.site}
                  </p>
                  <div className="mt-4 flex flex-col gap-3 text-sm text-slate-700">
                    <Link
                      href="/sitemap.xml"
                      {...buildAnalyticsAttrs({
                        eventName: "nav_click",
                        label: footer.sitemap,
                        href: "/sitemap.xml",
                        targetType: "internal",
                      })}
                      className="inline-flex items-center gap-2"
                    >
                      <Rss className="h-4 w-4" />
                      {footer.sitemap}
                    </Link>
                    <Link
                      href="/robots.txt"
                      {...buildAnalyticsAttrs({
                        eventName: "nav_click",
                        label: footer.robots,
                        href: "/robots.txt",
                        targetType: "internal",
                      })}
                    >
                      {footer.robots}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
              <p>
                © {new Date().getFullYear()} BSVgo. {footer.footerNote}
              </p>
              <p>{footer.stack}</p>
            </div>
          </div>
        </footer>
        <ScrollToTopButton />
      </AnalyticsProvider>
    </div>
  );
}
