/**
 * Site configuration from environment variables.
 * No defaults that fake revenue or content — missing keys surface as setup state.
 */

export type AffiliateOffer = {
  title: string;
  url: string;
  description?: string;
  cta?: string;
  keywords?: string[];
};

function parseList(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseOffers(raw: string | undefined): AffiliateOffer[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (o): o is AffiliateOffer =>
          typeof o === "object" &&
          o !== null &&
          typeof (o as AffiliateOffer).title === "string" &&
          typeof (o as AffiliateOffer).url === "string",
      )
      .map((o) => ({
        title: o.title,
        url: o.url,
        description: o.description,
        cta: o.cta ?? "Check price",
        keywords: o.keywords ?? [],
      }));
  } catch {
    console.error("[config] AFFILIATE_OFFERS_JSON is not valid JSON");
    return [];
  }
}

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "YouTube Revenue Hub",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "Curated YouTube videos for your niche — real embeds, real monetization.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  ),
  nicheKeywords: parseList(process.env.NICHE_KEYWORDS),
  topics: parseList(process.env.TOPIC_SLUGS),
  minViewCount: Number(process.env.MIN_VIEW_COUNT || "1000") || 1000,
  discoverPerKeyword: Number(process.env.DISCOVER_PER_KEYWORD || "12") || 12,
  maxStoredVideos: Number(process.env.MAX_STORED_VIDEOS || "500") || 500,
};

export const youtubeConfig = {
  apiKey: process.env.YOUTUBE_API_KEY || "",
  isConfigured: Boolean(process.env.YOUTUBE_API_KEY?.trim()),
};

export const adsenseConfig = {
  client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "",
  slotInfeed: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED || "",
  slotSidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR || "",
  slotArticle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE || "",
  isConfigured: Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim()),
};

export const affiliateConfig = {
  amazonTag: process.env.AFFILIATE_AMAZON_TAG || "",
  offers: parseOffers(process.env.AFFILIATE_OFFERS_JSON),
  isConfigured: Boolean(
    process.env.AFFILIATE_AMAZON_TAG?.trim() ||
      process.env.AFFILIATE_OFFERS_JSON?.trim(),
  ),
};

export const cronConfig = {
  secret: process.env.CRON_SECRET || "",
};

export function getSetupStatus() {
  return {
    youtube: youtubeConfig.isConfigured,
    adsense: adsenseConfig.isConfigured,
    affiliates: affiliateConfig.isConfigured,
    niche: siteConfig.nicheKeywords.length > 0,
    siteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()),
  };
}
