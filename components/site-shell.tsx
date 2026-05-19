import Link from "next/link";
import { Mail, MessageCircle, Rss, Send } from "lucide-react";
import { getLocalizedCategories } from "@/lib/blog";
import { buildAnalyticsAttrs } from "@/lib/analytics";
import { Locale, uiCopy } from "@/lib/i18n";
import { BrandLogo } from "@/components/brand-logo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { MobileSiteNav } from "@/components/mobile-site-nav";
import { AnalyticsProvider } from "@/components/analytics-provider";

type SiteShellProps = {
  locale: Locale;
  children: React.ReactNode;
};

export async function SiteShell({ locale, children }: SiteShellProps) {
  const copy = uiCopy[locale];
  const categories = await getLocalizedCategories(locale);
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
      href: `/${locale}#latest`,
      label: copy.navLatest,
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
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-4">
            <div>
              <p className="text-lg font-semibold tracking-[0.12em] text-slate-900">
                BSVgo
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                English-first technology blog for blockchain, AI, and infrastructure.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Sections
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
                  >
                    {category.name}
                  </Link>
                ))}
                <Link
                  href={`/${locale}#latest`}
                  {...buildAnalyticsAttrs({
                    eventName: "section_jump",
                    label: copy.navLatest,
                    href: `/${locale}#latest`,
                    section: "latest",
                    targetType: "internal",
                  })}
                >
                  {copy.navLatest}
                </Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Contact
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
                Feeds
              </p>
              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-700">
                <Link
                  href="/sitemap.xml"
                  {...buildAnalyticsAttrs({
                    eventName: "nav_click",
                    label: "Sitemap",
                    href: "/sitemap.xml",
                    targetType: "internal",
                  })}
                  className="inline-flex items-center gap-2"
                >
                  <Rss className="h-4 w-4" />
                  Sitemap
                </Link>
                <Link
                  href="/robots.txt"
                  {...buildAnalyticsAttrs({
                    eventName: "nav_click",
                    label: "Robots",
                    href: "/robots.txt",
                    targetType: "internal",
                  })}
                >
                  Robots
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
              <p>© {new Date().getFullYear()} BSVgo. Forward with builders.</p>
              <p>Blockchain / AI / Infrastructure</p>
            </div>
          </div>
        </footer>
      </AnalyticsProvider>
    </div>
  );
}
