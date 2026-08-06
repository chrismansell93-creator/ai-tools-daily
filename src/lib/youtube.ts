import { youtubeConfig } from "./config";

export type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnail: string;
  viewCount: number;
  likeCount?: number;
  duration?: string;
  tags?: string[];
  discoveredBy?: string;
};

type SearchOptions = {
  maxResults?: number;
  order?: "relevance" | "date" | "viewCount" | "rating" | "title";
  minViewCount?: number;
};

function pickThumbnail(snippet: {
  thumbnails?: Record<string, { url?: string }>;
}): string {
  const t = snippet.thumbnails || {};
  return (
    t.maxres?.url ||
    t.standard?.url ||
    t.high?.url ||
    t.medium?.url ||
    t.default?.url ||
    ""
  );
}

async function ytGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const key = youtubeConfig.apiKey;
  if (!key) throw new Error("YOUTUBE_API_KEY is not set");

  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", key);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  const body = (await res.json()) as T & { error?: { message?: string } };
  if (!res.ok) {
    throw new Error(body.error?.message || `YouTube API ${res.status}`);
  }
  return body;
}

/** Search YouTube and hydrate full video stats. */
export async function searchAndHydrate(
  query: string,
  options: SearchOptions = {},
): Promise<YouTubeVideo[]> {
  const maxResults = Math.min(Math.max(options.maxResults ?? 12, 1), 50);
  const order = options.order ?? "relevance";
  const minViewCount = options.minViewCount ?? 0;

  const search = await ytGet<{
    items?: Array<{ id?: { videoId?: string }; snippet?: { title?: string } }>;
  }>("search", {
    part: "snippet",
    type: "video",
    q: query,
    maxResults: String(maxResults),
    order,
    safeSearch: "moderate",
    relevanceLanguage: "en",
  });

  const ids = (search.items || [])
    .map((i) => i.id?.videoId)
    .filter((id): id is string => Boolean(id));

  if (!ids.length) return [];

  const details = await ytGet<{
    items?: Array<{
      id: string;
      snippet?: {
        title?: string;
        description?: string;
        channelId?: string;
        channelTitle?: string;
        publishedAt?: string;
        tags?: string[];
        thumbnails?: Record<string, { url?: string }>;
      };
      statistics?: { viewCount?: string; likeCount?: string };
      contentDetails?: { duration?: string };
    }>;
  }>("videos", {
    part: "snippet,statistics,contentDetails",
    id: ids.join(","),
  });

  const videos: YouTubeVideo[] = [];
  for (const item of details.items || []) {
    const viewCount = Number(item.statistics?.viewCount || 0);
    if (viewCount < minViewCount) continue;
    const sn = item.snippet || {};
    videos.push({
      id: item.id,
      title: sn.title || "Untitled",
      description: sn.description || "",
      channelId: sn.channelId || "",
      channelTitle: sn.channelTitle || "Unknown",
      publishedAt: sn.publishedAt || new Date().toISOString(),
      thumbnail: pickThumbnail(sn),
      viewCount,
      likeCount: item.statistics?.likeCount
        ? Number(item.statistics.likeCount)
        : undefined,
      duration: item.contentDetails?.duration,
      tags: sn.tags,
      discoveredBy: query,
    });
  }
  return videos;
}

export async function getVideoDetails(id: string): Promise<YouTubeVideo | null> {
  if (!youtubeConfig.isConfigured) return null;
  const details = await ytGet<{
    items?: Array<{
      id: string;
      snippet?: {
        title?: string;
        description?: string;
        channelId?: string;
        channelTitle?: string;
        publishedAt?: string;
        tags?: string[];
        thumbnails?: Record<string, { url?: string }>;
      };
      statistics?: { viewCount?: string; likeCount?: string };
      contentDetails?: { duration?: string };
    }>;
  }>("videos", {
    part: "snippet,statistics,contentDetails",
    id,
  });
  const item = details.items?.[0];
  if (!item) return null;
  const sn = item.snippet || {};
  return {
    id: item.id,
    title: sn.title || "Untitled",
    description: sn.description || "",
    channelId: sn.channelId || "",
    channelTitle: sn.channelTitle || "Unknown",
    publishedAt: sn.publishedAt || new Date().toISOString(),
    thumbnail: pickThumbnail(sn),
    viewCount: Number(item.statistics?.viewCount || 0),
    likeCount: item.statistics?.likeCount
      ? Number(item.statistics.likeCount)
      : undefined,
    duration: item.contentDetails?.duration,
    tags: sn.tags,
  };
}
