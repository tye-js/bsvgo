import type { MetadataRoute } from "next";
import {
  getLocalizedCategories,
  getLocalizedPosts,
  getLocalizedTags,
} from "@/lib/blog";
import { locales, siteConfig } from "@/lib/i18n";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const routes: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    const [categories, posts, tags] = await Promise.all([
      getLocalizedCategories(locale),
      getLocalizedPosts(locale),
      getLocalizedTags(locale),
    ]);

    routes.push({
      url: `${base}/${locale}`,
      lastModified: new Date(),
    });

    for (const category of categories) {
      routes.push({
        url: `${base}/${locale}/category/${category.slug}`,
        lastModified: new Date(),
      });
    }

    for (const post of posts) {
      routes.push({
        url: `${base}/${locale}/posts/${post.slug}`,
        lastModified: new Date(post.publishedAt),
      });
    }

    for (const tag of tags) {
      routes.push({
        url: `${base}/${locale}/tag/${tag.slug}`,
        lastModified: new Date(),
      });
    }
  }

  return routes;
}
