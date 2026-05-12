import type { MetadataRoute } from "next";
import { categorySlugs, getAllTagSlugs, posts } from "@/lib/content";
import { locales, siteConfig } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const routes: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    routes.push({
      url: `${base}/${locale}`,
      lastModified: new Date(),
    });

    for (const slug of categorySlugs) {
      routes.push({
        url: `${base}/${locale}/category/${slug}`,
        lastModified: new Date(),
      });
    }

    for (const post of posts) {
      routes.push({
        url: `${base}/${locale}/posts/${post.slug}`,
        lastModified: new Date(post.publishedAt),
      });
    }

    for (const tag of getAllTagSlugs()) {
      routes.push({
        url: `${base}/${locale}/tag/${tag}`,
        lastModified: new Date(),
      });
    }
  }

  return routes;
}
