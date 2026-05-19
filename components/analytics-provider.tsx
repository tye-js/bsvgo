"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Locale } from "@/lib/i18n";
import { isAnalyticsEventName } from "@/lib/analytics";
import {
  type AnalyticsIds,
  createAnalyticsIds,
  getArticleSlugFromPathname,
  sendAnalyticsEvent,
} from "@/lib/analytics-client";

const SEEN_SECTIONS_KEY = "bsvgo_seen_sections";
const SEEN_DEPTHS_KEY = "bsvgo_seen_depths";
const ARTICLE_DEPTH_THRESHOLDS = [25, 50, 75, 100] as const;

function getClosestTrackTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest<HTMLElement>("[data-track-event]");
}

function readSeenSections() {
  try {
    const value = window.sessionStorage.getItem(SEEN_SECTIONS_KEY);
    return value ? new Set<string>(JSON.parse(value) as string[]) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

function saveSeenSections(sections: Set<string>) {
  try {
    window.sessionStorage.setItem(SEEN_SECTIONS_KEY, JSON.stringify([...sections]));
  } catch {
    // ignore storage failures
  }
}

function readSeenDepths() {
  try {
    const value = window.sessionStorage.getItem(SEEN_DEPTHS_KEY);
    return value ? new Set<string>(JSON.parse(value) as string[]) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

function saveSeenDepths(depths: Set<string>) {
  try {
    window.sessionStorage.setItem(SEEN_DEPTHS_KEY, JSON.stringify([...depths]));
  } catch {
    // ignore storage failures
  }
}

export function AnalyticsProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [ids, setIds] = useState<AnalyticsIds | null>(null);

  useEffect(() => {
    setIds(createAnalyticsIds());
  }, []);

  useEffect(() => {
    if (!ids) {
      return;
    }

    const trackPageView = () => {
      sendAnalyticsEvent({
        eventName: "page_view",
        locale,
        path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        referrer: document.referrer || null,
        visitorId: ids.visitorId,
        sessionId: ids.sessionId,
        payload: {
          title: document.title,
        },
      });
    };

    trackPageView();
    const articleSlug = getArticleSlugFromPathname(window.location.pathname);

    if (articleSlug) {
      sendAnalyticsEvent({
        eventName: "article_view",
        locale,
        path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        referrer: document.referrer || null,
        visitorId: ids.visitorId,
        sessionId: ids.sessionId,
        articleSlug,
        targetType: "article",
        payload: {
          title: document.title,
        },
      });
    }
  }, [ids, locale, pathname]);

  useEffect(() => {
    if (!ids) {
      return;
    }

    const seenSections = readSeenSections();
    const seenDepths = readSeenDepths();

    const onClick = (event: MouseEvent) => {
      const trackTarget = getClosestTrackTarget(event.target);

      if (!trackTarget) {
        return;
      }

      const eventName = trackTarget.dataset.trackEvent;
      if (!isAnalyticsEventName(eventName)) {
        return;
      }

      sendAnalyticsEvent({
        eventName,
        locale,
        path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        referrer: document.referrer || null,
        visitorId: ids.visitorId,
        sessionId: ids.sessionId,
        href: trackTarget.dataset.trackHref || null,
        label: trackTarget.dataset.trackLabel || trackTarget.textContent?.trim() || null,
        targetType: trackTarget.dataset.trackTargetType || null,
        section: trackTarget.dataset.trackSection || null,
        articleSlug: trackTarget.dataset.trackArticleSlug || null,
        categorySlug: trackTarget.dataset.trackCategorySlug || null,
        tagSlug: trackTarget.dataset.trackTagSlug || null,
      });
    };

    const onScroll = () => {
      const markers = Array.from(
        document.querySelectorAll<HTMLElement>("[data-track-section-view]")
      );

      for (const marker of markers) {
        const section = marker.dataset.trackSectionView;

        if (!section || seenSections.has(section)) {
          continue;
        }

        const rect = marker.getBoundingClientRect();
        const visible =
          rect.top < window.innerHeight * 0.85 && rect.bottom > window.innerHeight * 0.15;

        if (!visible) {
          continue;
        }

        seenSections.add(section);
        saveSeenSections(seenSections);

        sendAnalyticsEvent({
          eventName: "section_view",
          locale,
          path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
          referrer: document.referrer || null,
          visitorId: ids.visitorId,
          sessionId: ids.sessionId,
          section,
          payload: {
            top: rect.top,
            bottom: rect.bottom,
          },
        });
      }

      const articleSlug = getArticleSlugFromPathname(window.location.pathname);

      if (!articleSlug) {
        return;
      }

      const scrollableHeight = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const depth = Math.min(
        100,
        Math.max(0, Math.round((window.scrollY / scrollableHeight) * 100))
      );

      for (const threshold of ARTICLE_DEPTH_THRESHOLDS) {
        const key = `${window.location.pathname}:${threshold}`;

        if (depth < threshold || seenDepths.has(key)) {
          continue;
        }

        seenDepths.add(key);
        saveSeenDepths(seenDepths);

        sendAnalyticsEvent({
          eventName: "article_depth",
          locale,
          path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
          referrer: document.referrer || null,
          visitorId: ids.visitorId,
          sessionId: ids.sessionId,
          articleSlug,
          targetType: "article",
          value: threshold,
          payload: {
            depth,
          },
        });
      }
    };

    window.addEventListener("click", onClick, true);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", onScroll);
    };
  }, [ids, locale]);

  return <div data-analytics-locale={locale}>{children}</div>;
}
