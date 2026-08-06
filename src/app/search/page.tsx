import type { Metadata } from "next";
import { youtubeConfig } from "@/lib/config";
import { getVideos, upsertVideos } from "@/lib/store";
import { searchAndHydrate } from "@/lib/youtube";
import { VideoGrid } from "@/components/VideoGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: raw } = await searchParams;
  const q = (raw || "").trim();

  let videos = (await getVideos({ query: q, limit: 48 })).videos;
  let source = "catalog";
  let note: string | null = null;

  if (q.length >= 2 && youtubeConfig.isConfigured) {
    try {
      const live = await searchAndHydrate(q, { maxResults: 16, order: "relevance" });
      if (live.length) {
        await upsertVideos(live);
        videos = live;
        source = "youtube";
      }
    } catch (err) {
      note = err instanceof Error ? err.message : String(err);
    }
  } else if (q.length >= 2 && !youtubeConfig.isConfigured) {
    note = "YOUTUBE_API_KEY not set — showing catalog matches only.";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Search</h1>
        <p className="mt-1 text-zinc-400">
          {q ? (
            <>
              Results for <span className="text-white">“{q}”</span>{" "}
              <span className="text-xs text-zinc-500">({source})</span>
            </>
          ) : (
            "Type a query in the header search box."
          )}
        </p>
        {note && <p className="mt-2 text-sm text-amber-400">{note}</p>}
      </div>
      {q && videos.length === 0 ? (
        <p className="text-zinc-500">No videos found.</p>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  );
}
