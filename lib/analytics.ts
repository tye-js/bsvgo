export const analyticsEventNames = [
  "page_view",
  "article_view",
  "article_click",
  "category_click",
  "tag_click",
  "nav_click",
  "locale_switch",
  "section_jump",
  "section_view",
  "outbound_click",
  "article_depth",
  "404_view",
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];

export type AnalyticsEventInput = {
  eventName: AnalyticsEventName;
  visitorId: string;
  sessionId: string;
  locale?: string | null;
  path: string;
  referrer?: string | null;
  href?: string | null;
  label?: string | null;
  targetType?: string | null;
  section?: string | null;
  articleSlug?: string | null;
  categorySlug?: string | null;
  tagSlug?: string | null;
  value?: number | null;
  payload?: Record<string, unknown>;
};

export function isAnalyticsEventName(value: unknown): value is AnalyticsEventName {
  return typeof value === "string" && analyticsEventNames.includes(value as AnalyticsEventName);
}

type AnalyticsAttrInput = {
  eventName: AnalyticsEventName;
  label?: string | null;
  targetType?: string | null;
  section?: string | null;
  articleSlug?: string | null;
  categorySlug?: string | null;
  tagSlug?: string | null;
  href?: string | null;
};

export function buildAnalyticsAttrs(input: AnalyticsAttrInput) {
  const attrs: Record<string, string> = {
    "data-track-event": input.eventName,
  };

  if (input.label) attrs["data-track-label"] = input.label;
  if (input.targetType) attrs["data-track-target-type"] = input.targetType;
  if (input.section) attrs["data-track-section"] = input.section;
  if (input.articleSlug) attrs["data-track-article-slug"] = input.articleSlug;
  if (input.categorySlug) attrs["data-track-category-slug"] = input.categorySlug;
  if (input.tagSlug) attrs["data-track-tag-slug"] = input.tagSlug;
  if (input.href) attrs["data-track-href"] = input.href;

  return attrs;
}

export function buildSectionViewAttrs(section: string) {
  return {
    "data-track-section-view": section,
  };
}
