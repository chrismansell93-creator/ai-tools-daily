import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVideoById, getVideos, upsertVideos } from "@/lib/store";
import { getVideoDetails } from "@/lib/youtube";
import { youtubeConfig } from "@/lib/config";
import { timeAgo, truncate } from "@/lib/format";
import { matchOffers, amazonSearchUrl } from "@/lib/affiliates";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { VideoGrid } from "@/components/VideoGrid";
import { AdUnit } from "@/components/AdUnit";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const video = await getVideoById(id);
  return {
    title: video?.title || "Video",
    description: video ? truncate(video.description, 160) : undefined,
  };
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let video = await getVideoById(id);

  if (!video && youtubeConfig.isConfigured) {
    try {
      const live = await getVideoDetails(id);
      if (live) {
        await upsertVideos([live]);
        video = live;
      }
    } catch {
      // fall through to 404
    }
  }

  if (!video) notFound();

  const offers = matchOffers(`${video.title} ${video.description}`);
  const amazon = amazonSearchUrl(video.title);
  const related = (await getVideos({ limit: 8 })).videos.filter((v) => v.id !== video!.id).slice(0, 8);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <YouTubeEmbed videoId={video.id} title={video.title} />
        <div>
          <h1 className="text-2xl font-bold text-white">{video.title}</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {video.channelTitle}
            {" · "}
            {video.viewCount.toLocaleString()} views
            {video.publishedAt ? ` · ${timeAgo(video.publishedAt)}` : ""}
          </p>
        </div>
        <AdUnit slot="article" className="min-h-[90px]" />
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
          {truncate(video.description, 1200)}
        </div>
        {related.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">More from the catalog</h2>
            <VideoGrid videos={related} withAds={false} />
          </section>
        )}
      </div>

      <aside className="space-y-4">
        <AdUnit slot="sidebar" className="min-h-[250px]" />
        {(offers.length > 0 || amazon) && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Related products
            </h2>
            <ul className="mt-3 space-y-3">
              {offers.map((o) => (
                <li key={o.url}>
                  <a
                    href={o.url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="block rounded-lg border border-zinc-700 p-3 hover:border-red-500/40"
                  >
                    <p className="font-medium text-white">{o.title}</p>
                    {o.description && (
                      <p className="mt-1 text-xs text-zinc-500">{o.description}</p>
                    )}
                    <p className="mt-2 text-xs font-medium text-red-400">{o.cta || "Check price"}</p>
                  </a>
                </li>
              ))}
              {amazon && (
                <li>
                  <a
                    href={amazon}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="block rounded-lg border border-zinc-700 p-3 text-sm text-zinc-300 hover:border-red-500/40"
                  >
                    Search on Amazon
                  </a>
                </li>
              )}
            </ul>
            <p className="mt-3 text-xs text-zinc-600">
              <Link href="/disclosure" className="underline hover:text-zinc-400">
                Affiliate disclosure
              </Link>
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
