import type { MetadataRoute } from "next";
import {
  getLocalizedCategories,
  getLocalizedPosts,
  getLocalizedTags,
} from "@/lib/blog";
import { locales, siteConfig } from "@/lib/i18n";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const routes: MetadataRoute.Sitemap = [];
  const now = new Date();

  for (const locale of locales) {
    const [categories, posts, tags] = await Promise.all([
      getLocalizedCategories(locale),
      getLocalizedPosts(locale),
      getLocalizedTags(locale),
    ]);

    routes.push({
      url: `${base}/${locale}`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: locale === "en" ? 1 : 0.9,
    });

    routes.push({
      url: `${base}/${locale}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    });

    routes.push({
      url: `${base}/${locale}/archive`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    });

    for (const category of categories) {
      routes.push({
        url: `${base}/${locale}/category/${category.slug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }

    for (const post of posts) {
      routes.push({
        url: `${base}/${locale}/posts/${post.slug}`,
        lastModified: new Date(post.updatedAt || post.publishedAt),
        changeFrequency: "weekly",
        priority: post.featured || post.pinned ? 0.9 : 0.7,
      });
    }

    for (const tag of tags) {
      routes.push({
        url: `${base}/${locale}/tag/${tag.slug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.6,
      });
    }
  }

  return routes;
}
