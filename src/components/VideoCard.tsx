import Image from "next/image";
import Link from "next/link";
import type { YouTubeVideo } from "@/lib/youtube";
import { timeAgo, truncate } from "@/lib/format";

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K views`;
  return `${n} views`;
}

export function VideoCard({ video }: { video: YouTubeVideo }) {
  return (
    <Link
      href={`/video/${video.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40 transition hover:border-zinc-600 hover:bg-zinc-900"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-600">No thumbnail</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-white group-hover:text-red-400">
          {video.title}
        </h3>
        <p className="text-xs text-zinc-400">{video.channelTitle}</p>
        <p className="text-xs text-zinc-500">
          {formatViews(video.viewCount)}
          {video.publishedAt ? ` · ${timeAgo(video.publishedAt)}` : ""}
        </p>
        {video.description ? (
          <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{truncate(video.description, 120)}</p>
        ) : null}
      </div>
    </Link>
  );
}
