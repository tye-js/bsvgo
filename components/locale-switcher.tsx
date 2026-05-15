"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { localeLabels, Locale, locales } from "@/lib/i18n";

type LocaleSwitcherProps = {
  locale: Locale;
  className?: string;
};

function getLocaleHref(pathname: string, targetLocale: Locale, suffix: string) {
  const segments = pathname.split("/");

  if (locales.includes(segments[1] as Locale)) {
    segments[1] = targetLocale;
    return `${segments.join("/") || `/${targetLocale}`}${suffix}`;
  }

  return `/${targetLocale}${pathname === "/" ? "" : pathname}${suffix}`;
}

export function LocaleSwitcher({ locale, className = "" }: LocaleSwitcherProps) {
  const pathname = usePathname() || `/${locale}`;
  const [suffix, setSuffix] = useState("");

  useEffect(() => {
    const syncUrlSuffix = () => {
      setSuffix(`${window.location.search}${window.location.hash}`);
    };

    syncUrlSuffix();
    window.addEventListener("hashchange", syncUrlSuffix);

    return () => window.removeEventListener("hashchange", syncUrlSuffix);
  }, [pathname]);

  return (
    <div className={className}>
      {locales.map((item) => (
        <Link
          key={item}
          href={getLocaleHref(pathname, item, suffix)}
          aria-current={item === locale ? "page" : undefined}
          className={
            item === locale
              ? "rounded-md bg-emerald-100 px-3 py-1.5 font-medium text-slate-900"
              : "rounded-md px-3 py-1.5 text-slate-600 hover:bg-emerald-50 hover:text-slate-900"
          }
        >
          {localeLabels[item]}
        </Link>
      ))}
    </div>
  );
}
