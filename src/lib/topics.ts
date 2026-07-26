import { siteConfig } from "./config";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getTopics(): { slug: string; label: string; query: string }[] {
  if (siteConfig.topics.length > 0) {
    return siteConfig.topics.map((slug) => ({
      slug: slugify(slug),
      label: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      query: slug.replace(/-/g, " "),
    }));
  }
  return siteConfig.nicheKeywords.map((kw) => ({
    slug: slugify(kw),
    label: kw.replace(/\b\w/g, (c) => c.toUpperCase()),
    query: kw,
  }));
}

export function topicFromSlug(slug: string) {
  return getTopics().find((t) => t.slug === slug) ?? null;
}
