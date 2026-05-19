"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { buildAnalyticsAttrs } from "@/lib/analytics";
import { Locale } from "@/lib/i18n";
import { LocaleSwitcher } from "@/components/locale-switcher";

type NavItem = {
  href: string;
  label: string;
};

type MobileSiteNavProps = {
  locale: Locale;
  navItems: NavItem[];
};

export function MobileSiteNav({ locale, navItems }: MobileSiteNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = isOpen ? X : Menu;

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-site-nav"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-teal-900/10 bg-white text-slate-800 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          id="mobile-site-nav"
          className="absolute left-5 right-5 top-full mt-2 rounded-md border border-teal-900/10 bg-white p-2 shadow-xl shadow-slate-950/10"
        >
          <nav className="grid gap-1 text-sm text-slate-700">
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
                onClick={() => setIsOpen(false)}
                className="rounded-md px-3 py-2.5 transition hover:bg-emerald-50 hover:text-emerald-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-2 border-t border-slate-100 pt-2">
            <LocaleSwitcher
              locale={locale}
              className="flex items-center gap-2 text-sm"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
