import type { ReactNode } from "react";
import type { YouTubeVideo } from "@/lib/youtube";
import { VideoCard } from "./VideoCard";
import { AdUnit } from "./AdUnit";

export function VideoGrid({
  videos,
  withAds = true,
}: {
  videos: YouTubeVideo[];
  withAds?: boolean;
}) {
  if (videos.length === 0) return null;
  const items: ReactNode[] = [];
  videos.forEach((video, i) => {
    items.push(<VideoCard key={video.id} video={video} />);
    if (withAds && (i + 1) % 8 === 0) {
      items.push(
        <div key={`ad-${i}`} className="col-span-full rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-2">
          <AdUnit slot="infeed" className="min-h-[90px]" />
        </div>,
      );
    }
  });
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items}
    </div>
  );
}
