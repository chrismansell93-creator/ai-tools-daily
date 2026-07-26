import { siteConfig, youtubeConfig } from "./config";
import { searchAndHydrate } from "./youtube";
import { getStats, saveStats, upsertVideos } from "./store";

export type DiscoverResult = {
  ok: boolean;
  added: number;
  updated: number;
  keywords: string[];
  errors: string[];
  message: string;
};

export async function runDiscovery(options?: {
  keywords?: string[];
  perKeyword?: number;
}): Promise<DiscoverResult> {
  const stats = await getStats();
  stats.lastRunAt = new Date().toISOString();
  stats.totalRuns += 1;

  if (!youtubeConfig.isConfigured) {
    stats.lastError = "YOUTUBE_API_KEY missing";
    await saveStats(stats);
    return {
      ok: false,
      added: 0,
      updated: 0,
      keywords: [],
      errors: ["YOUTUBE_API_KEY is not set"],
      message: "Configure a real YouTube Data API v3 key before running discovery.",
    };
  }

  const keywords =
    options?.keywords?.length
      ? options.keywords
      : siteConfig.nicheKeywords.length > 0
        ? siteConfig.nicheKeywords
        : [];

  if (keywords.length === 0) {
    stats.lastError = "NICHE_KEYWORDS empty";
    await saveStats(stats);
    return {
      ok: false,
      added: 0,
      updated: 0,
      keywords: [],
      errors: ["NICHE_KEYWORDS is empty"],
      message: "Set NICHE_KEYWORDS in .env.local (comma-separated niche search terms).",
    };
  }

  const perKeyword = options?.perKeyword ?? siteConfig.discoverPerKeyword;
  const errors: string[] = [];
  let added = 0;
  let updated = 0;

  for (const keyword of keywords) {
    try {
      const videos = await searchAndHydrate(keyword, {
        maxResults: perKeyword,
        order: "relevance",
        minViewCount: siteConfig.minViewCount,
      });
      const result = await upsertVideos(videos);
      added += result.added;
      updated += result.updated;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${keyword}: ${msg}`);
      console.error("[discover]", keyword, msg);
    }
  }

  stats.lastAdded = added;
  stats.lastUpdated = updated;
  stats.lastError = errors.length ? errors.join(" | ") : null;
  if (!errors.length || added + updated > 0) {
    stats.lastSuccessAt = new Date().toISOString();
  }
  await saveStats(stats);

  const ok = added + updated > 0 || errors.length === 0;
  return {
    ok,
    added,
    updated,
    keywords,
    errors,
    message: ok
      ? `Discovery complete: +${added} new, ${updated} refreshed across ${keywords.length} keywords.`
      : `Discovery failed: ${errors.join("; ")}`,
  };
}
