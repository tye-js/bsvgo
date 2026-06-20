import { NextRequest, NextResponse } from "next/server";
import { db, analyticsEvents } from "@/db";
import {
  isAnalyticsEventName,
  type AnalyticsEventName,
} from "@/lib/analytics";

const maxPayloadBytes = 16 * 1024;
const maxPayloadJsonBytes = 4 * 1024;
const rateLimitWindowMs = 60 * 1000;
const rateLimitMaxEvents = 120;
const cleanupIntervalMs = 5 * 60 * 1000;

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const dedupeTtlByEvent: Partial<Record<AnalyticsEventName, number>> = {
  page_view: 30 * 1000,
  article_view: 30 * 1000,
  section_view: 5 * 60 * 1000,
  article_depth: 10 * 60 * 1000,
  article_click: 2 * 1000,
  category_click: 2 * 1000,
  tag_click: 2 * 1000,
  nav_click: 2 * 1000,
  locale_switch: 2 * 1000,
  section_jump: 2 * 1000,
  outbound_click: 2 * 1000,
  "404_view": 30 * 1000,
};

const dedupeCache = new Map<string, number>();
const rateLimitBuckets = new Map<string, RateLimitBucket>();
let lastCleanupAt = 0;

function normalizeString(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function normalizeNumber(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.trunc(value);
}

function normalizePayload(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  try {
    const json = JSON.stringify(value);
    if (json.length <= maxPayloadJsonBytes) {
      return value as Record<string, unknown>;
    }
  } catch {
    return {};
  }

  return { truncated: true };
}

function getClientKey(request: NextRequest, visitorId: string, sessionId: string) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const clientIp = forwardedFor || realIp || "unknown";

  return `${visitorId}:${sessionId}:${clientIp}`;
}

function pruneCaches(now: number) {
  if (now - lastCleanupAt < cleanupIntervalMs) {
    return;
  }

  lastCleanupAt = now;

  for (const [key, expiresAt] of dedupeCache) {
    if (expiresAt <= now) {
      dedupeCache.delete(key);
    }
  }

  for (const [key, bucket] of rateLimitBuckets) {
    if (bucket.resetAt <= now) {
      rateLimitBuckets.delete(key);
    }
  }
}

function isRateLimited(key: string, now: number) {
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + rateLimitWindowMs,
    });
    return false;
  }

  bucket.count += 1;
  return bucket.count > rateLimitMaxEvents;
}

function isDuplicateEvent({
  eventName,
  visitorId,
  sessionId,
  path,
  articleSlug,
  section,
  targetType,
  value,
  now,
}: {
  eventName: AnalyticsEventName;
  visitorId: string;
  sessionId: string;
  path: string;
  articleSlug: string | null;
  section: string | null;
  targetType: string | null;
  value: number | null;
  now: number;
}) {
  const ttl = dedupeTtlByEvent[eventName];

  if (!ttl) {
    return false;
  }

  const key = [
    visitorId,
    sessionId,
    eventName,
    path,
    articleSlug ?? "",
    section ?? "",
    targetType ?? "",
    value ?? "",
  ].join("|");
  const expiresAt = dedupeCache.get(key);

  if (expiresAt && expiresAt > now) {
    return true;
  }

  dedupeCache.set(key, now + ttl);
  return false;
}

export async function POST(request: NextRequest) {
  const contentLength = request.headers.get("content-length");

  if (contentLength && Number(contentLength) > maxPayloadBytes) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const eventName = (body as { eventName?: unknown }).eventName;
  const visitorId = normalizeString((body as { visitorId?: unknown }).visitorId, 64);
  const sessionId = normalizeString((body as { sessionId?: unknown }).sessionId, 64);
  const path = normalizeString((body as { path?: unknown }).path, 2048);

  if (!isAnalyticsEventName(eventName) || !visitorId || !sessionId || !path) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const now = Date.now();
  pruneCaches(now);

  if (isRateLimited(getClientKey(request, visitorId, sessionId), now)) {
    console.warn("[bsvgo] Analytics event rate limited.", {
      eventName,
      visitorId,
      sessionId,
      path,
    });
    return NextResponse.json(
      { ok: true, persisted: false, reason: "rate_limited" },
      { status: 202 }
    );
  }

  const section = normalizeString((body as { section?: unknown }).section, 64);
  const articleSlug = normalizeString((body as { articleSlug?: unknown }).articleSlug, 160);
  const targetType = normalizeString((body as { targetType?: unknown }).targetType, 32);
  const value = normalizeNumber((body as { value?: unknown }).value);

  if (
    isDuplicateEvent({
      eventName,
      visitorId,
      sessionId,
      path,
      articleSlug,
      section,
      targetType,
      value,
      now,
    })
  ) {
    return NextResponse.json(
      { ok: true, persisted: false, reason: "deduped" },
      { status: 202 }
    );
  }

  const safePayload = normalizePayload((body as { payload?: unknown }).payload);

  try {
    await db.insert(analyticsEvents).values({
      eventName,
      visitorId,
      sessionId,
      locale: normalizeString((body as { locale?: unknown }).locale, 8),
      path,
      referrer: normalizeString((body as { referrer?: unknown }).referrer, 2048),
      href: normalizeString((body as { href?: unknown }).href, 2048),
      label: normalizeString((body as { label?: unknown }).label, 256),
      targetType,
      section,
      articleSlug,
      categorySlug: normalizeString((body as { categorySlug?: unknown }).categorySlug, 64),
      tagSlug: normalizeString((body as { tagSlug?: unknown }).tagSlug, 80),
      value,
      payload: safePayload,
    });
  } catch (error) {
    console.error("[bsvgo] Analytics write failed.", error);
    return NextResponse.json({ ok: true, persisted: false }, { status: 202 });
  }

  return NextResponse.json({ ok: true });
}
