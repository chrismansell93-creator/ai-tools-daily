import { promises as fs } from "fs";
import path from "path";
import { siteConfig } from "./config";
import type { YouTubeVideo } from "./youtube";

export type Catalog = {
  videos: YouTubeVideo[];
  updatedAt: string | null;
};

export type DiscoveryStats = {
  lastRunAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
  lastAdded: number;
  lastUpdated: number;
  totalRuns: number;
  quotaHint?: string;
};

type MemoryState = {
  catalog: Catalog | null;
  stats: DiscoveryStats | null;
};

const g = globalThis as typeof globalThis & { __aiToolsDailyStore?: MemoryState };
if (!g.__aiToolsDailyStore) {
  g.__aiToolsDailyStore = { catalog: null, stats: null };
}
const mem = g.__aiToolsDailyStore;

const DATA_DIR = path.join(process.cwd(), "data");
const CATALOG_FILE = path.join(DATA_DIR, "catalog.json");
const STATS_FILE = path.join(DATA_DIR, "stats.json");
const TMP_CATALOG = path.join("/tmp", "ai-tools-daily-catalog.json");
const TMP_STATS = path.join("/tmp", "ai-tools-daily-stats.json");

const emptyCatalog = (): Catalog => ({ videos: [], updatedAt: null });

const emptyStats = (): DiscoveryStats => ({
  lastRunAt: null,
  lastSuccessAt: null,
  lastError: null,
  lastAdded: 0,
  lastUpdated: 0,
  totalRuns: 0,
  quotaHint:
    "YouTube free quota is typically 10,000 units/day. search.list ≈ 100, videos.list ≈ 1.",
});

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJsonFile(filePath: string, data: unknown): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

export async function getCatalog(): Promise<Catalog> {
  if (mem.catalog) return mem.catalog;

  const fromTmp = await readJsonFile<Catalog>(TMP_CATALOG);
  if (fromTmp?.videos) {
    mem.catalog = { videos: fromTmp.videos, updatedAt: fromTmp.updatedAt ?? null };
    return mem.catalog;
  }

  const fromData = await readJsonFile<Catalog>(CATALOG_FILE);
  if (fromData?.videos) {
    mem.catalog = { videos: fromData.videos, updatedAt: fromData.updatedAt ?? null };
    return mem.catalog;
  }

  mem.catalog = emptyCatalog();
  return mem.catalog;
}

async function saveCatalog(catalog: Catalog): Promise<void> {
  mem.catalog = catalog;
  // Prefer package data dir (local); fall back to /tmp on Vercel serverless.
  const ok = await writeJsonFile(CATALOG_FILE, catalog);
  if (!ok) await writeJsonFile(TMP_CATALOG, catalog);
}

export async function getStats(): Promise<DiscoveryStats> {
  if (mem.stats) return mem.stats;

  const fromTmp = await readJsonFile<DiscoveryStats>(TMP_STATS);
  if (fromTmp) {
    mem.stats = { ...emptyStats(), ...fromTmp };
    return mem.stats;
  }

  const fromData = await readJsonFile<DiscoveryStats>(STATS_FILE);
  if (fromData) {
    mem.stats = { ...emptyStats(), ...fromData };
    return mem.stats;
  }

  mem.stats = emptyStats();
  return mem.stats;
}

export async function saveStats(stats: DiscoveryStats): Promise<void> {
  mem.stats = stats;
  const ok = await writeJsonFile(STATS_FILE, stats);
  if (!ok) await writeJsonFile(TMP_STATS, stats);
}

export async function upsertVideos(
  videos: YouTubeVideo[],
): Promise<{ added: number; updated: number }> {
  const catalog = await getCatalog();
  const byId = new Map(catalog.videos.map((v) => [v.id, v]));
  let added = 0;
  let updated = 0;

  for (const video of videos) {
    if (byId.has(video.id)) {
      byId.set(video.id, { ...byId.get(video.id)!, ...video });
      updated += 1;
    } else {
      byId.set(video.id, video);
      added += 1;
    }
  }

  let next = Array.from(byId.values()).sort(
    (a, b) => b.viewCount - a.viewCount || b.publishedAt.localeCompare(a.publishedAt),
  );

  const max = siteConfig.maxStoredVideos;
  if (next.length > max) next = next.slice(0, max);

  await saveCatalog({
    videos: next,
    updatedAt: new Date().toISOString(),
  });

  return { added, updated };
}

export async function getVideos(options?: {
  query?: string;
  limit?: number;
  topic?: string;
}): Promise<{ videos: YouTubeVideo[]; total: number }> {
  const catalog = await getCatalog();
  let list = catalog.videos;
  const q = options?.query?.trim().toLowerCase();
  const topic = options?.topic?.trim().toLowerCase();

  if (q) {
    list = list.filter((v) => {
      const hay = `${v.title} ${v.description} ${v.channelTitle} ${(v.tags || []).join(" ")} ${v.discoveredBy || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }

  if (topic) {
    const topicWords = topic.replace(/-/g, " ");
    list = list.filter((v) => {
      const hay = `${v.title} ${v.description} ${v.discoveredBy || ""} ${(v.tags || []).join(" ")}`.toLowerCase();
      return hay.includes(topic) || hay.includes(topicWords);
    });
  }

  const total = list.length;
  const limit = options?.limit ?? list.length;
  return { videos: list.slice(0, limit), total };
}

export async function getVideoById(id: string): Promise<YouTubeVideo | null> {
  const catalog = await getCatalog();
  return catalog.videos.find((v) => v.id === id) ?? null;
}
