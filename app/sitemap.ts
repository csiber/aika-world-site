import type { MetadataRoute } from "next";
import { createSitemapEntries, routeSegments } from "@/lib/seo";

const staticSlugs = [
  { slug: routeSegments.home, priority: 0.9 },
  { slug: routeSegments.systems, priority: 0.75 },
  { slug: routeSegments.devlog, priority: 0.7, changeFrequency: "weekly" as const },
  { slug: routeSegments.about, priority: 0.6 },
  { slug: routeSegments.contact, priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return createSitemapEntries(staticSlugs);
}
