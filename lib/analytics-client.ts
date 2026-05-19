"use client";

import { defaultLocale, locales, type Locale } from "./i18n";
import { type AnalyticsEventInput } from "./analytics";

const VISITOR_KEY = "bsvgo_visitor_id";
const SESSION_KEY = "bsvgo_session_id";

function createId() {
  const cryptoObject = globalThis.crypto;
  if (cryptoObject?.randomUUID) {
    return cryptoObject.randomUUID().replace(/-/g, "");
  }

  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function readLocalStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocalStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore storage failures
  }
}

function readSessionStorage(key: string) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSessionStorage(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // ignore storage failures
  }
}

export type AnalyticsIds = {
  visitorId: string;
  sessionId: string;
};

export function createAnalyticsIds(): AnalyticsIds {
  const visitorId = readLocalStorage(VISITOR_KEY) ?? createId();
  const sessionId = readSessionStorage(SESSION_KEY) ?? createId();

  writeLocalStorage(VISITOR_KEY, visitorId);
  writeSessionStorage(SESSION_KEY, sessionId);

  return { visitorId, sessionId };
}

export function sendAnalyticsEvent(input: AnalyticsEventInput) {
  const payload = JSON.stringify({
    ...input,
    payload: input.payload ?? {},
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/analytics", blob);
    return;
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload,
    keepalive: true,
  });
}

export function parseLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split("/");
  return locales.includes(segments[1] as Locale) ? (segments[1] as Locale) : defaultLocale;
}

export function getArticleSlugFromPathname(pathname: string) {
  const segments = pathname.split("/");
  return segments[2] === "posts" ? segments[3] ?? null : null;
}
