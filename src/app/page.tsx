import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig, getSetupStatus, youtubeConfig } from "@/lib/config";
import { getTopics } from "@/lib/topics";
import { getVideos, getStats } from "@/lib/store";
import { VideoGrid } from "@/components/VideoGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default async function HomePage() {
  const { videos } = await getVideos({ limit: 48 });
  const stats = await getStats();
  const setup = getSetupStatus();
  const topics = getTopics();

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {siteConfig.name}
        </h1>
        <p className="max-w-2xl text-zinc-400">{siteConfig.description}</p>
        {topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <Link
                key={t.slug}
                href={`/topic/${t.slug}`}
                className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm text-zinc-300 hover:border-red-500/50 hover:text-white"
              >
                {t.label}
              </Link>
            ))}
          </div>
        )}
      </section>

      {videos.length === 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
          <h2 className="text-xl font-semibold text-white">No videos yet</h2>
          <p className="mt-2 text-zinc-400">
            {youtubeConfig.isConfigured && setup.niche
              ? "Run discovery to pull real YouTube videos for your niche."
              : "Configure YOUTUBE_API_KEY and NICHE_KEYWORDS, then run discovery."}
          </p>
          <pre className="mx-auto mt-4 max-w-xl overflow-x-auto rounded-lg bg-black/50 p-4 text-left text-xs text-zinc-300">
{`curl -X POST "${siteConfig.url}/api/cron/discover" \\
  -H "Authorization: Bearer $CRON_SECRET"`}
          </pre>
          {stats.lastError && (
            <p className="mt-3 text-sm text-red-400">Last error: {stats.lastError}</p>
          )}
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Latest in catalog</h2>
            <p className="text-xs text-zinc-500">
              {videos.length} videos
              {stats.lastSuccessAt ? ` · updated ${new Date(stats.lastSuccessAt).toLocaleString()}` : ""}
            </p>
          </div>
          <VideoGrid videos={videos} />
        </section>
      )}
    </div>
  );
}
