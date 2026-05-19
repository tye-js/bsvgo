import { NextRequest, NextResponse } from "next/server";
import { db, analyticsEvents } from "@/db";
import { isAnalyticsEventName } from "@/lib/analytics";

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

export async function POST(request: NextRequest) {
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

  const payload = (body as { payload?: unknown }).payload;
  const safePayload = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};

  await db.insert(analyticsEvents).values({
    eventName,
    visitorId,
    sessionId,
    locale: normalizeString((body as { locale?: unknown }).locale, 8),
    path,
    referrer: normalizeString((body as { referrer?: unknown }).referrer, 2048),
    href: normalizeString((body as { href?: unknown }).href, 2048),
    label: normalizeString((body as { label?: unknown }).label, 256),
    targetType: normalizeString((body as { targetType?: unknown }).targetType, 32),
    section: normalizeString((body as { section?: unknown }).section, 64),
    articleSlug: normalizeString((body as { articleSlug?: unknown }).articleSlug, 160),
    categorySlug: normalizeString((body as { categorySlug?: unknown }).categorySlug, 64),
    tagSlug: normalizeString((body as { tagSlug?: unknown }).tagSlug, 80),
    value: normalizeNumber((body as { value?: unknown }).value),
    payload: safePayload,
  });

  return NextResponse.json({ ok: true });
}
