import { NextRequest, NextResponse } from "next/server";
import { youtubeConfig } from "@/lib/config";
import { searchAndHydrate } from "@/lib/youtube";
import { getVideos, upsertVideos } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  if (!q || q.length < 2) {
    return NextResponse.json({ ok: false, error: "Query `q` required (min 2 chars)" }, { status: 400 });
  }
  const local = await getVideos({ query: q, limit: 24 });
  if (!youtubeConfig.isConfigured) {
    return NextResponse.json({
      ok: true, source: "catalog", videos: local.videos, total: local.total,
      note: "YOUTUBE_API_KEY not set — catalog only",
    });
  }
  try {
    const live = await searchAndHydrate(q, { maxResults: 12, order: "relevance" });
    if (live.length) await upsertVideos(live);
    return NextResponse.json({ ok: true, source: "youtube", videos: live, total: live.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      ok: true, source: "catalog", videos: local.videos, total: local.total, apiError: message,
    });
  }
}
