import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales, type Locale } from "@/lib/i18n";

const localeCookieName = "NEXT_LOCALE";

function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

function detectLocale(request: NextRequest): Locale {
  const savedLocale = request.cookies.get(localeCookieName)?.value;

  if (isLocale(savedLocale)) {
    return savedLocale;
  }

  const acceptLanguage = request.headers.get("accept-language") ?? "";

  if (/\bzh\b|zh-|hans|hant|cn|tw|hk/i.test(acceptLanguage)) {
    return "zh";
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${detectLocale(request)}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: "/",
};
